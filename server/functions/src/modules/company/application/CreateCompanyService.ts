import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { auth } from "../../../shared/infrastructure/config/firebase";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { createPaymentService } from "../../../shared/services/paymentService";
import type { CreateCompanyDto } from "../presentation/dto/createCompany.dto";
import {
  PLAN_FEATURES,
  Role,
  SubscriptionStatus,
  WhiteLabelStatus,
} from "../../../shared/infrastructure/db/types/company/company";
import { db } from "../../../shared/infrastructure/db/db";
import { companyConverter } from "../../../shared/infrastructure/db/types/company/companyConverter";
import { PaymentPort } from "../../../shared/infrastructure/contracts/paymentPort";

export interface CreateCompanyResult {
  companyId: string;
  subscriptionId: string;
  plan: string;
  status: string;
  nextBillingDate: string;
  whiteLabelStatus: WhiteLabelStatus;
}

/**
 * Orchestrates the full company creation flow:
 *  1. Guards against duplicate company
 *  2. Processes payment (mock or PagSeguro)
 *  3. Persists company document
 *  4. Sets `companyId` custom claim on the user token
 */
export class CreateCompanyService {
  async execute(
    uid: string,
    dto: CreateCompanyDto,
  ): Promise<CreateCompanyResult> {
    // 2. Process payment
    const paymentService: PaymentPort = createPaymentService();
    let paymentResult: Awaited<
      ReturnType<typeof paymentService.createSubscription>
    >;

    try {
      paymentResult = await paymentService.createSubscription({
        cardHolderName: dto.cardHolderName,
        cardToken: dto.cardToken,
        taxId: dto.taxId,
        email: dto.email,
        plan: dto.plan,
        whiteLabelEnabled: dto.whiteLabelEnabled,
      });
    } catch (error) {
      logger.error("Payment provider error", { uid, error });
      throw new AppError(
        "aborted",
        "Payment processing failed. Please try again.",
      );
    }

    if (paymentResult.status === "FAILED") {
      throw new AppError(
        "aborted",
        "Payment was declined. Please check your card details.",
      );
    }

    // 3. Resolve white-label status
    const planFeatures = PLAN_FEATURES[dto.plan];
    const whiteLabelStatus = (() => {
      if (planFeatures.whiteLabel === WhiteLabelStatus.NOT_AVAILABLE) {
        return WhiteLabelStatus.NOT_AVAILABLE;
      }
      return dto.whiteLabelEnabled
        ? WhiteLabelStatus.ENABLED
        : WhiteLabelStatus.DISABLED;
    })();

    // 4. Persist company document
    const now = Timestamp.now();
    const periodEnd = Timestamp.fromDate(paymentResult.nextBillingDate);
    const companyRef = db
      .collection("companies")
      .doc()
      .withConverter(companyConverter);
    const companyId = companyRef.id;

    await companyRef.set({
      name: dto.name,
      ownerUid: uid,
      email: dto.email,
      logoURL: dto.logoURL ?? null,
      subscription: {
        plan: dto.plan,
        status:
          paymentResult.status === "ACTIVE"
            ? SubscriptionStatus.ACTIVE
            : SubscriptionStatus.TRIALING,
        priceInCents: paymentResult.amountInCents,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        whiteLabelEnabled: dto.whiteLabelEnabled,
        externalSubscriptionId: paymentResult.subscriptionId,
      },
      createdAt: now,
      updatedAt: now,
    });

    // 5. Add creator as ADMIN of the company
    await companyRef.collection("users").doc(uid).set({
      role: Role.ADMIN,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Stamp custom claim so middleware can detect the company
    await auth.setCustomUserClaims(uid, { companyId });

    logger.info("Company created successfully.", {
      companyId,
      uid,
      plan: dto.plan,
    });

    return {
      companyId,
      subscriptionId: paymentResult.subscriptionId,
      plan: dto.plan,
      status: paymentResult.status,
      nextBillingDate: paymentResult.nextBillingDate.toISOString(),
      whiteLabelStatus,
    };
  }
}
