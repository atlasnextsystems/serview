"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/shared/context/AuthContext";

function LogoIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-400)" }}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

function PackageIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-300)" }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    );
}

export default function CompanyPage() {
    const router = useRouter();
    const { user } = useAuthContext();

    const [name, setName] = useState("");
    const [email, setEmail] = useState(user?.email ?? "");
    const [logoURL, setLogoURL] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("O nome da empresa é obrigatório.");
            return;
        }

        sessionStorage.setItem(
            "onboarding_company",
            JSON.stringify({ name: name.trim(), email, logoURL: logoURL.trim() || null })
        );
        router.push("/onboarding/payment");
    }

    const plan = typeof window !== "undefined"
        ? sessionStorage.getItem("onboarding_plan") ?? "ESSENTIAL"
        : "ESSENTIAL";

    const planLabels: Record<string, string> = {
        ESSENTIAL: "Essential — R$ 49,90/mês",
        PRO: "Pro — R$ 99,90/mês",
        ENTERPRISE: "Enterprise — R$ 199,90/mês",
    };

    return (
        <div className="onb-page">
            <div className="hero-bg" />

            <header className="onb-header animate-fade-in">
                <div className="auth-logo">
                    <LogoIcon />
                    <span className="auth-logo-text">serview</span>
                </div>
                <StepIndicator current={2} />
            </header>

            <main className="onb-main onb-centered">
                <div className="onb-title-block animate-fade-in">
                    <h1>Dados da empresa</h1>
                    <p>Personalize sua conta no serview</p>
                </div>

                <div className="company-card animate-fade-in-delay">
                    {/* Plan badge */}
                    <div className="company-plan-badge">
                        <PackageIcon />
                        <span>{planLabels[plan]}</span>
                        <button
                            type="button"
                            id="btn-change-plan"
                            className="btn-link"
                            onClick={() => router.push("/onboarding/plan")}
                        >
                            Alterar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="company-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="company-name">
                                Nome do estabelecimento <span style={{ color: "var(--error)" }}>*</span>
                            </label>
                            <input
                                id="company-name"
                                type="text"
                                className="form-input"
                                placeholder="Ex: Restaurante do João"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="company-email">
                                E-mail de contato
                            </label>
                            <input
                                id="company-email"
                                type="email"
                                className="form-input"
                                placeholder="contato@restaurante.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="company-logo">
                                URL do logotipo <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
                            </label>
                            <input
                                id="company-logo"
                                type="url"
                                className="form-input"
                                placeholder="https://meurestaurante.com/logo.png"
                                value={logoURL}
                                onChange={(e) => setLogoURL(e.target.value)}
                            />
                            {logoURL && (
                                <div className="logo-preview">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={logoURL}
                                        alt="Preview do logo"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                </div>
                            )}
                        </div>

                        {error && <p className="form-error">{error}</p>}

                        <div className="company-actions">
                            <button
                                type="button"
                                id="btn-back-plan"
                                className="btn btn-ghost"
                                onClick={() => router.push("/onboarding/plan")}
                            >
                                ← Voltar
                            </button>
                            <button
                                type="submit"
                                id="btn-continue-company"
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1 }}
                            >
                                Continuar →
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <style>{styles}</style>
        </div>
    );
}

function StepIndicator({ current }: { current: number }) {
    const steps = ["Plano", "Empresa", "Pagamento"];
    return (
        <div className="steps">
            {steps.map((label, i) => {
                const num = i + 1;
                const isDone = num < current;
                const isActive = num === current;
                return (
                    <div key={label} className="step-item">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                            <div className={`step-dot ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                                {isDone ? "✓" : num}
                            </div>
                            <span className="step-label">{label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`step-line ${isDone ? "done" : ""}`} style={{ marginBottom: "1rem" }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

const styles = `
.onb-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0 1.5rem;
    position: relative;
}

.onb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 0;
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
}

.onb-main {
    flex: 1;
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
    padding: 2rem 0 4rem;
}

.onb-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.onb-title-block {
    text-align: center;
    margin-bottom: 2rem;
}

.onb-title-block h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 800;
    margin-bottom: 0.5rem;
    letter-spacing: -0.03em;
}

.onb-title-block p { color: var(--text-secondary); font-size: 1.0625rem; }

.company-card {
    width: 100%;
    max-width: 520px;
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 2rem;
    box-shadow: var(--shadow-md);
}

.company-plan-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(98,87,255,0.08);
    border: 1px solid rgba(98,87,255,0.2);
    border-radius: var(--radius-md);
    padding: 0.625rem 1rem;
    margin-bottom: 1.75rem;
    font-size: 0.875rem;
    color: var(--brand-300);
}

.btn-link {
    background: none;
    border: none;
    padding: 0;
    color: var(--brand-400);
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    margin-left: auto;
    text-decoration: underline;
    text-underline-offset: 2px;
}

.btn-link:hover { color: var(--brand-300); }

.company-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.logo-preview {
    margin-top: 0.5rem;
    width: 72px;
    height: 72px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border-default);
    background: var(--surface-raised);
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.company-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.auth-logo { display: flex; align-items: center; gap: 0.625rem; }
.auth-logo-icon { font-size: 1.5rem; }
.auth-logo-text {
    font-size: 1.375rem;
    font-weight: 800;
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.03em;
}
`;
