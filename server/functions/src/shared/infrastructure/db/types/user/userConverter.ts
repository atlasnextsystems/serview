import type {
  BaseFirestoreResponse,
  Converter,
} from "../../../contracts/converter";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { type User } from "./user";

export const userConverter: Converter<User> = {
  toFirestore(data: User): DocumentData {
    return data;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<User> {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      displayName: data.displayName,
      email: data.email,
      createdAt: data.createdAt,
      isGoogleSignedIn: data.isGoogleSignedIn,
    };
  },
};
