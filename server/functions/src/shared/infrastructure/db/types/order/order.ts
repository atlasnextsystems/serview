import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../db";
import { orderConverter } from "./orderConverter";

export type OrderStatus = 'preparando' | 'pronto' | 'entregue' | 'cancelado';

export interface Order {
    table: number;
    items: string[];
    status: OrderStatus;
    createdAt: Timestamp;
}

export const ordersRef = db
    .collection('orders')
    .withConverter(orderConverter);