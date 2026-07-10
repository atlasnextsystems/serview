"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./shared/context/AuthContext";

export default function RootPage() {
    const { user, loading, companyId } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace("/login");
        } else if (companyId) {
            router.replace("/dashboard");
        } else {
            router.replace("/onboarding/plan");
        }
    }, [user, loading, companyId, router]);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "var(--surface-bg)",
            }}
        >
            <div className="spinner" />
        </div>
    );
}
