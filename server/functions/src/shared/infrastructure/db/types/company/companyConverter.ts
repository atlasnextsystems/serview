import type { BaseFirestoreResponse, Converter } from "../../contracts/converter";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { type Company, SubscriptionStatus } from "./company";
import { EnumMapper } from "../../contracts/enumMapper";

export const companyConverter: Converter<Company> = {
    toFirestore(data: Company): DocumentData {
        return data;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<Company> {
        const data = snapshot.data();
        const statusMapper = new EnumMapper(SubscriptionStatus);

        return {
            id: snapshot.id,
            name: data.name,
            ownerUid: data.ownerUid,
            email: data.email,
            logoURL: data.logoURL ?? null,
            subscription: {
                plan: data.subscription.plan,
                status: statusMapper.fromString(data.subscription.status),
                priceInCents: data.subscription.priceInCents,
                currentPeriodStart: data.subscription.currentPeriodStart,
                currentPeriodEnd: data.subscription.currentPeriodEnd,
                whiteLabelEnabled: data.subscription.whiteLabelEnabled,
                externalSubscriptionId: data.subscription.externalSubscriptionId ?? null,
            },
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
