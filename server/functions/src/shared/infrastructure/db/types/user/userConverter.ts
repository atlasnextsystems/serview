import type { BaseFirestoreResponse, Converter } from "../../contracts/converter";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Role, type User } from "./user";
import { EnumMapper } from "../../contracts/enumMapper";

export const userConverter: Converter<User> = {
    toFirestore(data: User): DocumentData {
        return data;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<User> {
        const data = snapshot.data();
        const mapper = new EnumMapper(Role);

        return {
            id: snapshot.id,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
            createdAt: data.createdAt,
            role: mapper.fromString(data.role)
        };
    }
}