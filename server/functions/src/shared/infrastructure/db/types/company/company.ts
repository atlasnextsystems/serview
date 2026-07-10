import type { Timestamp } from "firebase-admin/firestore";
import { companyConverter } from "./companyConverter";
import { db } from "../../db";
// ---------------------------------------------------------------------------
// Plan tiers
// ---------------------------------------------------------------------------

export enum Plan {
    ESSENTIAL = "ESSENTIAL",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE",
}

// ---------------------------------------------------------------------------
// Plan limits — null means "unlimited"
// ---------------------------------------------------------------------------

export interface PlanLimits {
    /** Maximum number of establishments. null = unlimited. */
    maxEstablishments: number | null;
    /** Maximum number of waiters. null = unlimited. */
    maxWaiters: number | null;
    /** Maximum number of cooks. null = unlimited. */
    maxCooks: number | null;
    /** How many days of order history are retained. null = unlimited. */
    orderHistoryDays: number | null;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
    [Plan.ESSENTIAL]: {
        maxEstablishments: 1,
        maxWaiters: 3,
        maxCooks: 2,
        orderHistoryDays: 30,
    },
    [Plan.PRO]: {
        maxEstablishments: 1,
        maxWaiters: 10,
        maxCooks: 5,
        orderHistoryDays: 365,
    },
    [Plan.ENTERPRISE]: {
        maxEstablishments: null,
        maxWaiters: null,
        maxCooks: null,
        orderHistoryDays: null,
    },
};

// ---------------------------------------------------------------------------
// Plan features — boolean / enum-based capabilities
// ---------------------------------------------------------------------------

export enum ReportLevel {
    BASIC = "BASIC",
    COMPLETE = "COMPLETE",
    ADVANCED = "ADVANCED",
}

export enum SupportLevel {
    EMAIL = "EMAIL",
    PRIORITY = "PRIORITY",
    PRIORITY_WHATSAPP = "PRIORITY_WHATSAPP",
}

export enum WhiteLabelStatus {
    ENABLED = "ENABLED",
    DISABLED = "DISABLED",
    NOT_AVAILABLE = "NOT_AVAILABLE",
}

export interface PlanFeatures {
    realtimeOrders: boolean;
    kitchenPanel: boolean;
    soundNotifications: boolean;
    productivityDashboard: boolean;
    reportLevel: ReportLevel;
    roleBasedAccess: boolean;
    supportLevel: SupportLevel;
    apiAccess: boolean;
    whiteLabel: WhiteLabelStatus;
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
    [Plan.ESSENTIAL]: {
        realtimeOrders: true,
        kitchenPanel: true,
        soundNotifications: true,
        productivityDashboard: false,
        reportLevel: ReportLevel.BASIC,
        roleBasedAccess: false,
        supportLevel: SupportLevel.EMAIL,
        apiAccess: false,
        whiteLabel: WhiteLabelStatus.NOT_AVAILABLE,
    },
    [Plan.PRO]: {
        realtimeOrders: true,
        kitchenPanel: true,
        soundNotifications: true,
        productivityDashboard: true,
        reportLevel: ReportLevel.COMPLETE,
        roleBasedAccess: true,
        supportLevel: SupportLevel.PRIORITY,
        apiAccess: false,
        whiteLabel: WhiteLabelStatus.DISABLED,
    },
    [Plan.ENTERPRISE]: {
        realtimeOrders: true,
        kitchenPanel: true,
        soundNotifications: true,
        productivityDashboard: true,
        reportLevel: ReportLevel.ADVANCED,
        roleBasedAccess: true,
        supportLevel: SupportLevel.PRIORITY_WHATSAPP,
        apiAccess: true,
        whiteLabel: WhiteLabelStatus.DISABLED,
    },
};

// ---------------------------------------------------------------------------
// Subscription — ties a Company to its active plan
// ---------------------------------------------------------------------------

export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    CANCELED = "CANCELED",
    TRIALING = "TRIALING",
}

export interface Subscription {
    plan: Plan;
    status: SubscriptionStatus;
    /** Monthly price in BRL cents (e.g. 4990 = R$ 49,90). */
    priceInCents: number;
    currentPeriodStart: Timestamp;
    currentPeriodEnd: Timestamp;
    /** True when white-label add-on has been purchased (PRO / ENTERPRISE only). */
    whiteLabelEnabled: boolean;
    /** External payment provider subscription ID (e.g. Stripe / Iugu). */
    externalSubscriptionId: string | null;
}

// ---------------------------------------------------------------------------
// Company — root document stored at /companies/{companyId}
// ---------------------------------------------------------------------------
export enum Role {
    ADMIN = 'ADMIN',
    COOK = 'COOK',
    WAITER = 'WAITER',
}

export interface Company {
    name: string;
    ownerUid: string;           // references /users/{uid}
    email: string;
    logoURL: string | null;
    subscription: Subscription;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const companiesRef = db.collection('companies').withConverter(companyConverter);
export const companyRef = (companyId: string) => db.collection('companies').doc(companyId).withConverter(companyConverter);
