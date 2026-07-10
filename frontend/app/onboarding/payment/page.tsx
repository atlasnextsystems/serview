"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { callable } from "../../shared/infrastructure/config/functions";
import { useAuthContext } from "../../shared/context/AuthContext";
import { firebaseAuth, syncSession } from "../../shared/infrastructure/config/auth";

// ── Types ────────────────────────────────────────────────────────────────────

type PlanId = "ESSENTIAL" | "PRO" | "ENTERPRISE";

interface CompanyData {
    name: string;
    email: string;
    logoURL: string | null;
}

interface CreateCompanyInput {
    name: string;
    email: string;
    logoURL?: string | null;
    plan: PlanId;
    taxId: string;
    cardHolderName: string;
    cardToken: string;
    whiteLabelEnabled: boolean;
}

interface CreateCompanyResult {
    companyId: string;
    subscriptionId: string;
    plan: string;
    status: string;
    nextBillingDate: string;
}

const createCompany = callable<CreateCompanyInput, CreateCompanyResult>("createCompany");

// ── Icons ────────────────────────────────────────────────────────────────────

function LogoIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-400)" }}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px", display: "inline-block", verticalAlign: "-2px" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<PlanId, number> = {
    ESSENTIAL: 4990,
    PRO: 9990,
    ENTERPRISE: 19990,
};
const WHITE_LABEL_PRICE = 4990;

function formatCents(cents: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(cents / 100);
}

function maskCard(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();
}

function maskExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
}

function maskCpfCnpj(val: string) {
    return val.replace(/\D/g, "").slice(0, 14);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PaymentPage() {
    const router = useRouter();
    const { user } = useAuthContext();

    const [plan, setPlan] = useState<PlanId>("ESSENTIAL");
    const [company, setCompany] = useState<CompanyData>({ name: "", email: "", logoURL: null });

    const [cardHolder, setCardHolder] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [taxId, setTaxId] = useState("");
    const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false);

    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const p = sessionStorage.getItem("onboarding_plan") as PlanId | null;
        const c = sessionStorage.getItem("onboarding_company");
        if (p) setPlan(p);
        if (c) {
            try { setCompany(JSON.parse(c)); } catch { /* ignore */ }
        }
        if (user?.displayName) setCardHolder(user.displayName);
    }, [user]);

    const planName = { ESSENTIAL: "Essential", PRO: "Pro", ENTERPRISE: "Enterprise" }[plan];
    const showWhiteLabel = plan === "PRO" || plan === "ENTERPRISE";
    const basePrice = PLAN_PRICES[plan];
    const totalPrice = basePrice + (whiteLabelEnabled && showWhiteLabel ? WHITE_LABEL_PRICE : 0);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        const rawTaxId = taxId.replace(/\D/g, "");
        if (rawTaxId.length !== 11 && rawTaxId.length !== 14) {
            setError("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
            return;
        }

        setLoading(true);
        try {
            // ── SIMULAÇÃO DE PAGAMENTO INTERATIVA ────────────────────────────────────
            setPaymentStatus("Criptografando dados do cartão...");
            await new Promise((r) => setTimeout(r, 1000));

            setPaymentStatus("Enviando dados para o PagSeguro...");
            await new Promise((r) => setTimeout(r, 1000));

            setPaymentStatus("Autorizando pagamento com sua operadora...");
            await new Promise((r) => setTimeout(r, 1000));

            setPaymentStatus("Finalizando sua assinatura...");

            const cardToken = `MOCK-${cardNumber.replace(/\s/g, "").slice(-4)}`;

            await createCompany({
                name: company.name,
                email: company.email,
                logoURL: company.logoURL,
                plan,
                taxId: rawTaxId,
                cardHolderName: cardHolder,
                cardToken,
                whiteLabelEnabled: showWhiteLabel && whiteLabelEnabled,
            });

            // Force token refresh to pick up the new companyId claim
            await firebaseAuth.currentUser?.getIdToken(true);
            await syncSession(true);

            // Clean up onboarding session data
            sessionStorage.removeItem("onboarding_plan");
            sessionStorage.removeItem("onboarding_company");

            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2500);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Erro ao processar pagamento.";
            setError(msg);
        } finally {
            setLoading(false);
            setPaymentStatus("");
        }
    }

    if (success) {
        return (
            <div className="onb-page flex-center" style={{ flexDirection: "column", gap: "1.5rem" }}>
                <div className="hero-bg" />
                <div className="success-icon animate-fade-in">
                    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="26" cy="26" r="25" stroke="#22c55e" strokeWidth="2" />
                        <path
                            d="M14 26L22 34L38 18"
                            stroke="#22c55e"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="100"
                            strokeDashoffset="0"
                            style={{ animation: "drawCheck 0.5s 0.2s ease both" }}
                        />
                    </svg>
                </div>
                <div style={{ textAlign: "center" }} className="animate-fade-in-delay">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Assinatura confirmada!
                    </h2>
                    <p style={{ color: "var(--text-secondary)" }}>
                        Bem-vindo ao serview {planName}. Redirecionando…
                    </p>
                </div>
                <style>{styles}</style>
            </div>
        );
    }

    return (
        <div className="onb-page">
            <div className="hero-bg" />

            {/* Simulação de pagamento interativa - overlay */}
            {loading && (
                <div className="payment-overlay">
                    <div className="payment-loading-card card animate-fade-in">
                        <div className="spinner" style={{ width: 40, height: 40, borderTopColor: "var(--brand-500)", marginBottom: "1.5rem" }} />
                        <h3 style={{ marginBottom: "0.5rem" }}>Processando Pagamento</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>{paymentStatus}</p>
                    </div>
                </div>
            )}

            <header className="onb-header animate-fade-in">
                <div className="auth-logo">
                    <LogoIcon />
                    <span className="auth-logo-text">serview</span>
                </div>
                <StepIndicator current={3} />
            </header>

            <main className="onb-main" style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                {/* Left — Form */}
                <div style={{ flex: 1 }}>
                    <div className="onb-title-block animate-fade-in" style={{ textAlign: "left" }}>
                        <h1>Dados de pagamento</h1>
                        <p>Seus dados são criptografados e protegidos</p>
                    </div>

                    <form onSubmit={handleSubmit} className="payment-form animate-fade-in-delay">
                        {/* Card preview */}
                        <div className="card-visual">
                            <div className="card-visual-brand">
                                <span className="auth-logo-text" style={{ fontSize: "1rem" }}>serview</span>
                                <CreditCardIcon />
                            </div>
                            <div className="card-visual-number">
                                {cardNumber || "•••• •••• •••• ••••"}
                            </div>
                            <div className="card-visual-bottom">
                                <div>
                                    <div className="card-visual-meta-label">Titular</div>
                                    <div className="card-visual-meta-value">
                                        {cardHolder || "SEU NOME"}
                                    </div>
                                </div>
                                <div>
                                    <div className="card-visual-meta-label">Validade</div>
                                    <div className="card-visual-meta-value">{expiry || "MM/AA"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Card fields */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="card-number">Número do cartão</label>
                            <input
                                id="card-number"
                                type="text"
                                inputMode="numeric"
                                className="form-input"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setCardNumber(maskCard(e.target.value))
                                }
                                required
                                autoComplete="cc-number"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="card-holder">Nome no cartão</label>
                            <input
                                id="card-holder"
                                type="text"
                                className="form-input"
                                placeholder="NOME SOBRENOME"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                required
                                autoComplete="cc-name"
                            />
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label" htmlFor="expiry">Validade</label>
                                <input
                                    id="expiry"
                                    type="text"
                                    inputMode="numeric"
                                    className="form-input"
                                    placeholder="MM/AA"
                                    value={expiry}
                                    onChange={(e) => setExpiry(maskExpiry(e.target.value))}
                                    required
                                    autoComplete="cc-exp"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="cvv">CVV</label>
                                <input
                                    id="cvv"
                                    type="text"
                                    inputMode="numeric"
                                    className="form-input"
                                    placeholder="•••"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                    required
                                    autoComplete="cc-csc"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="tax-id">CPF / CNPJ do titular</label>
                            <input
                                id="tax-id"
                                type="text"
                                inputMode="numeric"
                                className="form-input"
                                placeholder="Somente números"
                                value={taxId}
                                onChange={(e) => setTaxId(maskCpfCnpj(e.target.value))}
                                required
                            />
                        </div>

                        {/* White-label add-on */}
                        {showWhiteLabel && (
                            <div className="whitelabel-addon animate-fade-in">
                                <label className="checkbox-custom" htmlFor="whitelabel-toggle">
                                    <input
                                        id="whitelabel-toggle"
                                        type="checkbox"
                                        checked={whiteLabelEnabled}
                                        onChange={(e) => setWhiteLabelEnabled(e.target.checked)}
                                    />
                                    <div>
                                        <div className="whitelabel-title">
                                            White-label
                                            <span className="badge badge-brand" style={{ marginLeft: "0.5rem" }}>
                                                + {formatCents(WHITE_LABEL_PRICE)}/mês
                                            </span>
                                        </div>
                                        <div className="whitelabel-desc">
                                            Remove a marca serview e permite personalizar com a sua identidade visual.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                        {error && <p className="form-error">{error}</p>}

                        <div className="payment-actions">
                            <button
                                type="button"
                                id="btn-back-company"
                                className="btn btn-ghost"
                                onClick={() => router.push("/onboarding/company")}
                            >
                                ← Voltar
                            </button>
                            <button
                                type="submit"
                                id="btn-subscribe"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                `Assinar ${formatCents(totalPrice)}/mês`
                            </button>
                        </div>

                        <p className="payment-safe">
                            <LockIcon /> Pagamento processado com segurança via PagSeguro
                        </p>
                    </form>
                </div>

                {/* Right — Order summary */}
                <div className="order-summary animate-fade-in-delay">
                    <h3>Resumo do pedido</h3>

                    <div className="summary-company">
                        {company.logoURL && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={company.logoURL} alt={company.name} className="summary-logo" />
                        )}
                        <div>
                            <div className="summary-company-name">{company.name || "Sua empresa"}</div>
                            <div className="summary-company-email">{company.email}</div>
                        </div>
                    </div>

                    <div className="summary-lines">
                        <div className="summary-line">
                            <span>Plano {planName}</span>
                            <span>{formatCents(basePrice)}</span>
                        </div>
                        {whiteLabelEnabled && showWhiteLabel && (
                            <div className="summary-line animate-fade-in">
                                <span>White-label</span>
                                <span>{formatCents(WHITE_LABEL_PRICE)}</span>
                            </div>
                        )}
                    </div>

                    <div className="summary-total">
                        <span>Total / mês</span>
                        <span>{formatCents(totalPrice)}</span>
                    </div>

                    <p className="summary-note">
                        Cobrado mensalmente. Cancele a qualquer momento sem multa.
                    </p>
                </div>
            </main>

            <style>{styles}</style>
        </div>
    );
}

function CreditCardIcon() {
    return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
            <rect width="28" height="20" rx="3" fill="rgba(255,255,255,0.15)" />
            <rect y="4" width="28" height="4" fill="rgba(255,255,255,0.4)" />
            <rect x="2" y="13" width="8" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
            <rect x="20" y="12" width="6" height="4" rx="1" fill="rgba(255,200,100,0.8)" />
        </svg>
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

.payment-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

/* Card visual */
.card-visual {
    background: linear-gradient(135deg, #4334d8 0%, #a560ff 100%);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(98,87,255,0.4);
}

.card-visual::before {
    content: "";
    position: absolute;
    top: -40px;
    right: -40px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
}

.card-visual-brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.card-visual-number {
    font-size: 1.25rem;
    letter-spacing: 0.15em;
    font-weight: 600;
    font-family: "Courier New", monospace;
    margin-bottom: 1.25rem;
}

.card-visual-bottom {
    display: flex;
    gap: 2rem;
}

.card-visual-meta-label {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.6;
    margin-bottom: 0.25rem;
}

.card-visual-meta-value {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
}

/* White-label addon */
.whitelabel-addon {
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    transition: border-color var(--transition-fast);
}

.whitelabel-addon:has(input:checked) {
    border-color: var(--brand-500);
    background: rgba(98,87,255,0.05);
}

.whitelabel-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
}

.whitelabel-desc {
    font-size: 0.8125rem;
    color: var(--text-muted);
    line-height: 1.5;
}

.payment-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.payment-safe {
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-top: -0.25rem;
}

/* Order summary */
.order-summary {
    width: 300px;
    flex-shrink: 0;
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 1.75rem;
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 2rem;
}

.order-summary h3 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    color: var(--text-primary);
}

.summary-company {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--border-default);
}

.summary-logo {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    object-fit: contain;
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
}

.summary-company-name {
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--text-primary);
}

.summary-company-email {
    font-size: 0.8125rem;
    color: var(--text-muted);
}

.summary-lines {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.9375rem;
    color: var(--text-secondary);
}

.summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    border-top: 1px solid var(--border-default);
    padding-top: 1rem;
    margin-bottom: 1rem;
}

.summary-note {
    font-size: 0.8125rem;
    color: var(--text-muted);
    line-height: 1.5;
}

/* Success */
.success-icon {
    width: 80px;
    height: 80px;
}

.success-icon svg { width: 100%; height: 100%; }

@media (max-width: 860px) {
    .onb-main { flex-direction: column !important; }
    .order-summary { width: 100%; position: static; }
}

.auth-logo { display: flex; align-items: center; gap: 0.625rem; }
.auth-logo-text {
    font-size: 1.375rem;
    font-weight: 800;
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.03em;
}

/* Payment overlay */
.payment-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 18, 0.85);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}
.payment-loading-card {
    max-width: 380px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2.5rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-strong);
    background: var(--surface-card);
}
`;
