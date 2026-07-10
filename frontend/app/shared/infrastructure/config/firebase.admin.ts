import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-only Firebase Admin SDK initialisation.
 * Import this ONLY from API routes and Server Components.
 *
 * Credentials resolution order:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string) — for Vercel / any host
 * 2. Application Default Credentials — for GCP, Cloud Run, and Firebase emulator
 */
function initAdmin() {
    if (getApps().length > 0) return getApps()[0];

    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (key) {
        return initializeApp({ credential: cert(JSON.parse(key)) });
    }

    return initializeApp();
}

export const adminAuth = getAuth(initAdmin());
