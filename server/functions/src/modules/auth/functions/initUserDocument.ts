import { z } from "zod";
import { Handler } from "../../../shared/infrastructure/functions/Handler";
import { AppError } from "../../../shared/infrastructure/functions/AppError";
import { InitUserDocumentService } from "../application/InitUserDocumentService";
import type { CallableRequest } from "firebase-functions/https";

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const InputSchema = z.object({
    displayName: z.string().min(1).max(100),
    photoURL: z.string().url().nullable().optional(),
});

type Input = z.infer<typeof InputSchema>;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const service = new InitUserDocumentService();

class InitUserDocumentHandler extends Handler<Input, void> {
    async handle(input: Input, request: CallableRequest<Input>): Promise<void> {
        const uid = this.requireAuth(request);
        const email = this.getEmail(request);

        const parsed = InputSchema.safeParse(input);
        if (!parsed.success) {
            throw new AppError(
                "invalid-argument",
                "Invalid input.",
                parsed.error.flatten()
            );
        }

        await service.execute(uid, email, parsed.data);
    }
}

export const initUserDocument = new InitUserDocumentHandler().toFunction();
