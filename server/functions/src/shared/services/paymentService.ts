import { PaymentPort } from "../infrastructure/contracts/paymentPort";
import { MockPaymentService } from "./impl/mockPaymentService";
import { PagSeguroPaymentService } from "./impl/pagSeguroService";

/** White-label add-on price (PRO / ENTERPRISE only) */
export const WHITE_LABEL_ADDON_CENTS = 4990;

export function createPaymentService(): PaymentPort {
  const token = process.env.PAGSEGURO_TOKEN;

  if (token) {
    return new PagSeguroPaymentService(token);
  }

  return new MockPaymentService();
}
