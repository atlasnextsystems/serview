import { Handler } from "../../../shared/infrastructure/functions/Handler";
import { GetUserCompaniesService } from "../application/GetUserCompaniesService";
import type { CompanySummaryResult } from "../application/GetUserCompaniesService";
import type { CallableRequest } from "firebase-functions/v2/https";

const service = new GetUserCompaniesService();

class GetUserCompaniesHandler extends Handler<void, CompanySummaryResult[]> {
    async handle(
        _input: void,
        request: CallableRequest<void>
    ): Promise<CompanySummaryResult[]> {
        const uid = this.requireAuth(request);
        return service.execute(uid);
    }
}

export const getUserCompanies = new GetUserCompaniesHandler().toFunction();
