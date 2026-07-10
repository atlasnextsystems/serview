import * as logger from "firebase-functions/logger";
import { companiesRef } from "../../../shared/infrastructure/db/types/company/company";

export interface CompanySummaryResult {
    id: string;
    name: string;
    email: string;
    logoURL: string | null;
    subscription: {
        plan: string;
        status: string;
        priceInCents: number;
    } | null;
}

export class GetUserCompaniesService {
    async execute(uid: string): Promise<CompanySummaryResult[]> {
        logger.info("Fetching companies for user", { uid });

        const snapshot = await companiesRef
            .where("ownerUid", "==", uid)
            .orderBy("createdAt", "desc")
            .get();

        const list: CompanySummaryResult[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
                id: doc.id,
                name: data.name,
                email: data.email,
                logoURL: data.logoURL ?? null,
                subscription: data.subscription
                    ? {
                        plan: data.subscription.plan,
                        status: data.subscription.status,
                        priceInCents: data.subscription.priceInCents,
                    }
                    : null,
            });
        });

        logger.info(`Found ${list.length} companies for user`, { uid });
        return list;
    }
}
