import type { Timestamp } from "firebase-admin/firestore";
import { db } from "../../db";
import { userConverter } from "./userConverter";

export enum Role {
    ADMIN = 'ADMIN',
    COOK = 'COOK',
    WAITER = 'WAITER',
}

export interface User {
    displayName: string;
    email: string;
    createdAt: Timestamp;
    isGoogleSignedIn: boolean;
}

export const usersRef = db.collection('users').withConverter(userConverter);
export const userRef = (uid: string) => db.collection('users').doc(uid).withConverter(userConverter);
