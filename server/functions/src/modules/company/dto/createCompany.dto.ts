import { z } from "zod";
import { Plan } from "../../../shared/infrastructure/db/types/company/company";

// ---------------------------------------------------------------------------
// Input DTO — validated on the Cloud Function before any processing
// ---------------------------------------------------------------------------

export const CreateCompanySchema = z.object({
    /** Company display name */
    name: z.string().min(2).max(100),
    /** Company contact email (may differ from owner's auth email) */
    email: z.string().email(),
    /** Optional public URL for company logo */
    logoURL: z.string().url().nullable().optional(),
    /** Chosen SaaS plan */
    plan: z.nativeEnum(Plan),
    /** CPF (11 digits) or CNPJ (14 digits), digits only */
    taxId: z.string().regex(/^\d{11}$|^\d{14}$/, "Invalid CPF/CNPJ"),
    /** Cardholder full name as printed on the card */
    cardHolderName: z.string().min(3).max(100),
    /**
     * PagSeguro encrypted card token.
     * In mock mode any non-empty string is accepted.
     */
    cardToken: z.string().min(1),
    /**
     * Whether the white-label add-on was purchased.
     * Only meaningful for PRO and ENTERPRISE plans.
     */
    whiteLabelEnabled: z.boolean().default(false),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
