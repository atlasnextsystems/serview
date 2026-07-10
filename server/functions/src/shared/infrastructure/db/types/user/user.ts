import type { Timestamp } from "firebase-admin/firestore";

export enum Role {
    ADMIN = 'ADMIN',
    COOK = 'COOK',
    WAITER = 'WAITER',
}

export interface User {
    displayName: string;
    email: string;
    photoURL: string;
    createdAt: Timestamp;
    role: Role;
}