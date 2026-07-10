"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { firebaseAuth, syncSession } from "../infrastructure/config/auth";

export interface AuthState {
    user: User | null;
    loading: boolean;
    /** companyId custom claim — null means onboarding not completed */
    companyId: string | null;
}

export function useAuth(): AuthState {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        companyId: null,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (!user) {
                setState({ user: null, loading: false, companyId: null });
                return;
            }

            // Force refresh to pick up any new custom claims (e.g. companyId)
            const tokenResult = await user.getIdTokenResult(true);
            const companyId = (tokenResult.claims.companyId as string | undefined) ?? null;

            // Sync server-side session cookie
            await syncSession(false);

            setState({ user, loading: false, companyId });
        });

        return unsubscribe;
    }, []);

    return state;
}
