import {
  CreateSubscriptionParams,
  PaymentResult,
  PaymentPort,
  PLAN_PRICES_CENTS,
} from "../../infrastructure/contracts/paymentPort";
import { Plan } from "../../infrastructure/db/types/company/company";
import { WHITE_LABEL_ADDON_CENTS } from "../paymentService";

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
export class PagSeguroPaymentService implements PaymentPort {
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

  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<PaymentResult> {
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

    const data = (await response.json()) as {
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
