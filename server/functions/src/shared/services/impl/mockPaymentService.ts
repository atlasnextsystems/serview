import {
  CreateSubscriptionParams,
  PaymentResult,
  PaymentPort,
  PLAN_PRICES_CENTS,
} from "../../infrastructure/contracts/paymentPort";
import { WHITE_LABEL_ADDON_CENTS } from "../paymentService";

export class MockPaymentService implements PaymentPort {
  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<PaymentResult> {
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
