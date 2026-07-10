import { Handler } from "../../../shared/infrastructure/functions/Handler";
import { AppError } from "../../../shared/infrastructure/functions/AppError";
import { CreateCompanyService } from "../application/CreateCompanyService";
import { CreateCompanySchema } from "../dto/createCompany.dto";
import type { CallableRequest } from "firebase-functions/https";
import type { CreateCompanyResult } from "../application/CreateCompanyService";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const service = new CreateCompanyService();

class CreateCompanyHandler extends Handler<unknown, CreateCompanyResult> {
    async handle(
        input: unknown,
        request: CallableRequest<unknown>
    ): Promise<CreateCompanyResult> {
        const uid = this.requireAuth(request);

        const parsed = CreateCompanySchema.safeParse(input);
        if (!parsed.success) {
            throw new AppError(
                "invalid-argument",
                "Invalid input.",
                parsed.error.flatten()
            );
        }

        return service.execute(uid, parsed.data);
    }
}

export const createCompany = new CreateCompanyHandler().toFunction();
