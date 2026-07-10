import { HttpsError } from "firebase-functions/https";
import type { FunctionsErrorCode } from "firebase-functions/https";

/**
 * Domain-level error that maps cleanly to Firebase HttpsError codes.
 *
 * Usage:
 *   throw new AppError("unauthenticated", "You must be signed in.");
 *   throw new AppError("invalid-argument", "Invalid plan.", { field: "plan" });
 */
export class AppError extends Error {
    constructor(
        public readonly code: FunctionsErrorCode,
        message: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "AppError";
        // Restore prototype chain (needed when targeting ES5)
        Object.setPrototypeOf(this, AppError.prototype);
    }

    toHttpsError(): HttpsError {
        return new HttpsError(this.code, this.message, this.details);
    }
}
