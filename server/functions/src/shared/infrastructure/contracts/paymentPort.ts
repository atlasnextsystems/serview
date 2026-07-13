import { Plan } from "../db/types/company/company";

export interface CreateSubscriptionParams {
  /** Cardholder name */
  cardHolderName: string;
  /** PagSeguro encrypted card token (from PagSeguro JS SDK) */
  cardToken: string;
  /** Customer CPF (11 digits) or CNPJ (14 digits), digits only */
  taxId: string;
  /** Customer email */
  email: string;
  /** Chosen plan */
  plan: Plan;
  /** White-label add-on purchased */
  whiteLabelEnabled: boolean;
}

export interface PaymentResult {
  /** Provider-assigned subscription ID */
  subscriptionId: string;
  /** Resulting status */
  status: "ACTIVE" | "PENDING" | "FAILED";
  /** Date of next billing cycle */
  nextBillingDate: Date;
  /** Total amount charged in BRL cents */
  amountInCents: number;
}

export const PLAN_PRICES_CENTS: Record<Plan, number> = {
  [Plan.ESSENTIAL]: 4990,
  [Plan.PRO]: 9990,
  [Plan.ENTERPRISE]: 19990,
};

export interface PaymentPort {
  createSubscription(params: CreateSubscriptionParams): Promise<PaymentResult>;
}
