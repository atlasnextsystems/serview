import { Plan } from "../../../shared/infrastructure/db/types/company/company";

// ---------------------------------------------------------------------------
// Shared types — mirror PagSeguro Subscriptions API shape
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

export interface PaymentService {
    createSubscription(params: CreateSubscriptionParams): Promise<PaymentResult>;
}

// ---------------------------------------------------------------------------
// Pricing constants (cents)
// ---------------------------------------------------------------------------

export const PLAN_PRICES_CENTS: Record<Plan, number> = {
    [Plan.ESSENTIAL]: 4990,
    [Plan.PRO]: 9990,
    [Plan.ENTERPRISE]: 19990,
};

/** White-label add-on price (PRO / ENTERPRISE only) */
export const WHITE_LABEL_ADDON_CENTS = 4990;

// ---------------------------------------------------------------------------
// Mock implementation — always approves; ready to swap for PagSeguro
// ---------------------------------------------------------------------------

export class MockPaymentService implements PaymentService {
    async createSubscription(params: CreateSubscriptionParams): Promise<PaymentResult> {
        const baseCents = PLAN_PRICES_CENTS[params.plan];
        const addonCents = params.whiteLabelEnabled ? WHITE_LABEL_ADDON_CENTS : 0;
        const total = baseCents + addonCents;

        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 400));

        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        return {
            subscriptionId: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            status: "ACTIVE",
            nextBillingDate,
            amountInCents: total,
        };
    }
}

// ---------------------------------------------------------------------------
// PagSeguro implementation stub — integrate by filling in the API calls
// ---------------------------------------------------------------------------

/**
 * PagSeguro Subscriptions API reference:
 * https://dev.pagseguro.uol.com.br/reference/subscriptions
 *
 * Steps to integrate:
 * 1. Set PAGSEGURO_TOKEN env var (firebase functions:config:set pagseguro.token=...)
 * 2. Create a Plan in PagSeguro dashboard and store the plan_id per Plan tier
 * 3. Call POST /subscriptions with the card token from PagSeguro.js SDK
 * 4. Map the response status to PaymentResult.status
 */
export class PagSeguroPaymentService implements PaymentService {
    private readonly baseUrl = "https://api.pagseguro.com";
    private readonly token: string;

    /** PagSeguro plan IDs — set after creating plans in the dashboard */
    private readonly planIds: Record<Plan, string> = {
        [Plan.ESSENTIAL]: process.env.PAGSEGURO_PLAN_ESSENTIAL ?? "",
        [Plan.PRO]: process.env.PAGSEGURO_PLAN_PRO ?? "",
        [Plan.ENTERPRISE]: process.env.PAGSEGURO_PLAN_ENTERPRISE ?? "",
    };

    constructor(token: string) {
        this.token = token;
    }

    async createSubscription(params: CreateSubscriptionParams): Promise<PaymentResult> {
        const baseCents = PLAN_PRICES_CENTS[params.plan];
        const addonCents = params.whiteLabelEnabled ? WHITE_LABEL_ADDON_CENTS : 0;
        const total = baseCents + addonCents;

        const body = {
            plan: this.planIds[params.plan],
            customer: {
                name: params.cardHolderName,
                email: params.email,
                tax_id: params.taxId,
            },
            payment_method: {
                type: "CREDIT_CARD",
                credit_card: {
                    encrypted: params.cardToken,
                    holder: { name: params.cardHolderName },
                },
            },
            // If white-label is purchased, add a one-off charge or second plan
            // TODO: model white-label as a PagSeguro add-on or secondary subscription
        };

        const response = await fetch(`${this.baseUrl}/subscriptions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`PagSeguro error: ${JSON.stringify(error)}`);
        }

        const data = await response.json() as {
            id: string;
            status: string;
            next_invoice_at: string;
        };

        const statusMap: Record<string, PaymentResult["status"]> = {
            ACTIVE: "ACTIVE",
            PENDING: "PENDING",
            CANCELED: "FAILED",
            SUSPENDED: "FAILED",
        };

        return {
            subscriptionId: data.id,
            status: statusMap[data.status] ?? "PENDING",
            nextBillingDate: new Date(data.next_invoice_at),
            amountInCents: total,
        };
    }
}

// ---------------------------------------------------------------------------
// Factory — swap MockPaymentService for PagSeguroPaymentService when ready
// ---------------------------------------------------------------------------

export function createPaymentService(): PaymentService {
    const token = process.env.PAGSEGURO_TOKEN;

    if (token) {
        return new PagSeguroPaymentService(token);
    }

    return new MockPaymentService();
}
