import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../../shared/infrastructure/functions/AppError";
import { userRef } from "../../../shared/infrastructure/db/types/user/user";

export interface InitUserDocumentInput {
    displayName: string;
    photoURL?: string | null;
}

/**
 * Creates the /users/{uid} document after first sign-in.
 * Idempotent: a second call for the same uid is a no-op.
 */
export class InitUserDocumentService {

    async execute(
        uid: string,
        email: string,
        input: InitUserDocumentInput,
        isGoogleSignedIn: boolean
    ): Promise<void> {
        if (!uid || !email) {
            throw new AppError("invalid-argument", "uid and email are required.");
        }

        const snapshot = await userRef(uid).get();

        if (snapshot.exists) {
            logger.info("User document already exists, skipping.", { uid });
            return;
        }

        await userRef(uid).set({
            displayName: input.displayName ?? "",
            email,
            createdAt: Timestamp.now(),
            isGoogleSignedIn,
        });

        logger.info("User document created.", { uid });
    }
}
