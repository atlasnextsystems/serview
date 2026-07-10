"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function LogoIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-400)" }}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

// ── Plan data ────────────────────────────────────────────────────────────────

type PlanId = "ESSENTIAL" | "PRO" | "ENTERPRISE";

interface Plan {
    id: PlanId;
    name: string;
    price: string;
    description: string;
    featured?: boolean;
    limits: string[];
    features: Array<{ label: string; value: string | boolean }>;
}

const PLANS: Plan[] = [
    {
        id: "ESSENTIAL",
        name: "Essential",
        price: "R$ 49,90",
        description: "Perfeito para começar",
        limits: ["1 estabelecimento", "Até 3 garçons", "Até 2 cozinheiros", "Histórico 30 dias"],
        features: [
            { label: "Pedidos em tempo real", value: true },
            { label: "Painel da cozinha", value: true },
            { label: "Notificações sonoras", value: true },
            { label: "Dashboard produtividade", value: false },
            { label: "Relatórios", value: "Básicos" },
            { label: "Controle por cargos", value: false },
            { label: "Suporte", value: "E-mail" },
            { label: "API", value: false },
            { label: "White-label", value: false },
        ],
    },
    {
        id: "PRO",
        name: "Pro",
        price: "R$ 99,90",
        description: "Para equipes em crescimento",
        featured: true,
        limits: ["1 estabelecimento", "Até 10 garçons", "Até 5 cozinheiros", "Histórico 1 ano"],
        features: [
            { label: "Pedidos em tempo real", value: true },
            { label: "Painel da cozinha", value: true },
            { label: "Notificações sonoras", value: true },
            { label: "Dashboard produtividade", value: true },
            { label: "Relatórios", value: "Completos" },
            { label: "Controle por cargos", value: true },
            { label: "Suporte", value: "Prioritário" },
            { label: "API", value: false },
            { label: "White-label", value: "Opcional" },
        ],
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: "R$ 199,90",
        description: "Escala sem limites",
        limits: ["Ilimitados estabelec.", "Garçons ilimitados", "Cozinheiros ilimitados", "Histórico ilimitado"],
        features: [
            { label: "Pedidos em tempo real", value: true },
            { label: "Painel da cozinha", value: true },
            { label: "Notificações sonoras", value: true },
            { label: "Dashboard produtividade", value: true },
            { label: "Relatórios", value: "Avançados" },
            { label: "Controle por cargos", value: true },
            { label: "Suporte", value: "Prioritário + WhatsApp" },
            { label: "API", value: true },
            { label: "White-label", value: "Opcional" },
        ],
    },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function PlanPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<PlanId | null>(null);

    function handleContinue() {
        if (!selected) return;
        sessionStorage.setItem("onboarding_plan", selected);
        router.push("/onboarding/company");
    }

    return (
        <div className="onb-page">
            <div className="hero-bg" />

            <header className="onb-header animate-fade-in">
                <div className="auth-logo">
                    <LogoIcon />
                    <span className="auth-logo-text">serview</span>
                </div>
                <StepIndicator current={1} />
            </header>

            <main className="onb-main">
                <div className="onb-title-block animate-fade-in">
                    <h1>Escolha seu plano</h1>
                    <p>Comece com 14 dias grátis. Cancele quando quiser.</p>
                </div>

                <div className="plans-grid animate-fade-in-delay">
                    {PLANS.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            selected={selected === plan.id}
                            onSelect={() => setSelected(plan.id)}
                        />
                    ))}
                </div>

                <div className="onb-actions animate-fade-in-delay-2">
                    <button
                        id="btn-continue-plan"
                        className="btn btn-primary btn-lg"
                        disabled={!selected}
                        onClick={handleContinue}
                        style={{ minWidth: 200 }}
                    >
                        Continuar →
                    </button>
                </div>
            </main>

            <style>{styles}</style>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PlanCard({ plan, selected, onSelect }: {
    plan: Plan;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            id={`plan-${plan.id.toLowerCase()}`}
            className={`plan-card ${selected ? "selected" : ""} ${plan.featured ? "featured" : ""}`}
            onClick={onSelect}
        >
            {plan.featured && (
                <div className="plan-card-badge">
                    <span className="badge badge-brand">Mais popular</span>
                </div>
            )}

            {selected && (
                <div className="plan-selected-dot" aria-hidden>
                    <CheckIcon />
                </div>
            )}

            <div className="plan-name-row">
                <span className="plan-name">{plan.name}</span>
            </div>

            <div className="plan-price">
                <span className="plan-price-value">{plan.price}</span>
                <span className="plan-price-period">/mês</span>
            </div>

            <p className="plan-desc">{plan.description}</p>

            <ul className="plan-limits">
                {plan.limits.map((l) => (
                    <li key={l}>
                        <span className="feat-check">✓</span> {l}
                    </li>
                ))}
            </ul>

            <div className="plan-divider" />

            <ul className="plan-features">
                {plan.features.map((f) => (
                    <li key={f.label} className="plan-feature-row">
                        <span className="plan-feature-label">{f.label}</span>
                        <FeatureValue value={f.value} />
                    </li>
                ))}
            </ul>
        </button>
    );
}

function FeatureValue({ value }: { value: string | boolean }) {
    if (value === true) return <span className="feat-check">✓</span>;
    if (value === false) return <span className="feat-cross">✕</span>;
    return <span className="plan-feature-text">{value}</span>;
}

function CheckIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                                {isDone ? <CheckIcon /> : num}
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

// ── Styles ────────────────────────────────────────────────────────────────────

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
    margin-bottom: 2.5rem;
}

.onb-title-block h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 800;
    margin-bottom: 0.5rem;
    letter-spacing: -0.03em;
}

.onb-title-block p {
    color: var(--text-secondary);
    font-size: 1.0625rem;
}

.plans-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 2.5rem;
}

@media (max-width: 860px) {
    .plans-grid { grid-template-columns: 1fr; max-width: 420px; margin-left: auto; margin-right: auto; }
}

.plan-card {
    text-align: left;
    background: var(--surface-card);
    border: 2px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 1.75rem;
    cursor: pointer;
    transition: all var(--transition-base);
    position: relative;
    overflow: hidden;
    font-family: inherit;
    color: var(--text-primary);
}

.plan-card:hover {
    border-color: var(--brand-500);
    transform: translateY(-4px);
    box-shadow: var(--shadow-brand);
}

.plan-card.selected {
    border-color: var(--brand-500);
    box-shadow: 0 0 0 1px var(--brand-500), var(--shadow-brand);
    background: linear-gradient(135deg, rgba(98,87,255,0.07) 0%, var(--surface-card) 60%);
}

.plan-card.featured {
    border-color: rgba(98,87,255,0.5);
}

.plan-selected-dot {
    position: absolute;
    top: 1rem;
    left: 1rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--brand-500);
    display: flex;
    align-items: center;
    justify-content: center;
}

.plan-name-row { margin-bottom: 0.75rem; margin-top: 0.5rem; }
.plan-name { font-size: 1.0625rem; font-weight: 700; color: var(--text-primary); }

.plan-price {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    margin-bottom: 0.375rem;
}

.plan-price-value {
    font-size: 2rem;
    font-weight: 800;
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.03em;
}

.plan-price-period { font-size: 0.875rem; color: var(--text-muted); }

.plan-desc {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 1.25rem;
}

.plan-limits {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.plan-limits li {
    font-size: 0.875rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.plan-divider {
    height: 1px;
    background: var(--border-default);
    margin: 1rem 0;
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.plan-feature-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8125rem;
}

.plan-feature-label { color: var(--text-muted); }
.plan-feature-text { color: var(--text-secondary); font-size: 0.8125rem; }

.onb-actions {
    display: flex;
    justify-content: center;
}

.auth-logo {
    display: flex;
    align-items: center;
    gap: 0.625rem;
}

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
