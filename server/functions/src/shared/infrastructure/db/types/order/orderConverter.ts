import { BaseFirestoreResponse, Converter } from "../../contracts/converter";
import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Order } from "./order";

export const orderConverter: Converter<Order> = {
    toFirestore(data: Order): DocumentData {
        return data;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<Order> {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            table: data.table,
            items: data.items,
            status: data.status,
            createdAt: data.createdAt
        };
    }
}