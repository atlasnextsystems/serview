import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../../shared/infrastructure/functions/AppError";
import { db } from "../../../shared/infrastructure/db/db";
import { userConverter } from "../../../shared/infrastructure/db/types/user/userConverter";
import { Role } from "../../../shared/infrastructure/db/types/user/user";

export interface InitUserDocumentInput {
    displayName: string;
    photoURL?: string | null;
}

/**
 * Creates the /users/{uid} document after first sign-in.
 * Idempotent: a second call for the same uid is a no-op.
 */
export class InitUserDocumentService {

    private userRef = (uid: string) => db.collection("users").doc(uid).withConverter(userConverter);
    async execute(
        uid: string,
        email: string,
        input: InitUserDocumentInput
    ): Promise<void> {
        if (!uid || !email) {
            throw new AppError("invalid-argument", "uid and email are required.");
        }

        const snapshot = await this.userRef(uid).get();

        if (snapshot.exists) {
            logger.info("User document already exists, skipping.", { uid });
            return;
        }

        await this.userRef(uid).set({
            displayName: input.displayName ?? "",
            email,
            photoURL: input.photoURL ?? "",
            role: Role.ADMIN,
            createdAt: Timestamp.now(),
        });

        logger.info("User document created.", { uid });
    }
}
