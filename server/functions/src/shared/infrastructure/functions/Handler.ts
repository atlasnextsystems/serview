import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";
import { AppError } from "./AppError";

/**
 * Abstract base for all onCall v2 handlers.
 *
 * Subclasses implement `handle()` with pure business orchestration.
 * Error normalisation (AppError → HttpsError, unknown → internal) is
 * done here so every handler gets it for free.
 *
 * Usage:
 *   class MyHandler extends Handler<MyInput, MyOutput> {
 *     async handle(input, request) { ... }
 *   }
 *   export const myFunction = new MyHandler().toFunction();
 */
export abstract class Handler<TInput = unknown, TOutput = unknown> {
    abstract handle(
        input: TInput,
        request: CallableRequest<TInput>
    ): Promise<TOutput>;

    toFunction() {
        return onCall<TInput, Promise<TOutput>>(
            { region: "southamerica-east1", cors: true },
            async (request) => {
            try {
                return await this.handle(request.data, request);
            } catch (error) {
                if (error instanceof AppError) {
                    logger.warn(`AppError [${error.code}]: ${error.message}`, {
                        details: error.details,
                    });
                    throw error.toHttpsError();
                }

                if (error instanceof HttpsError) {
                    throw error;
                }

                logger.error("Unhandled exception in handler", { error });
                throw new HttpsError("internal", "An unexpected error occurred.");
            }
        });
    }

    /** Asserts the caller is authenticated and returns their UID. */
    protected requireAuth(request: CallableRequest): string {
        if (!request.auth) {
            throw new AppError("unauthenticated", "You must be signed in.");
        }
        return request.auth.uid;
    }

    /** Returns the caller email from the token (empty string if absent). */
    protected getEmail(request: CallableRequest): string {
        return request.auth?.token?.email ?? "";
    }
}
