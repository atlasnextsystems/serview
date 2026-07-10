"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../shared/context/AuthContext";
import { signOut } from "../shared/infrastructure/config/auth";
import { callable } from "../shared/infrastructure/config/functions";

const getUserCompanies = callable<void, any[]>("getUserCompanies");

// ── Icons ───────────────────────────────────────────────────────────────────

function LogoIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

function BarChartIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

function ReceiptIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
            <path d="M16 8H8M16 12H8M13 16H8" />
        </svg>
    );
}

function ChefHatIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18V6a4 4 0 0 1 8 0v12M18 18V9a4 4 0 0 0-8 0v9" />
            <line x1="3" y1="18" x2="21" y2="18" />
            <line x1="3" y1="22" x2="21" y2="22" />
        </svg>
    );
}

function UsersIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function TrendingUpIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

function UserPlusIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
    );
}

function ClipboardIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    );
}

function SmartphoneIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18.01" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function DollarIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

// ── Constants ───────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
    ESSENTIAL: "Essential",
    PRO: "Pro",
    ENTERPRISE: "Enterprise",
};

const PLAN_COLORS: Record<string, string> = {
    ESSENTIAL: "var(--gray-400)",
    PRO: "var(--brand-400)",
    ENTERPRISE: "#a560ff",
};

// ── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthContext();

    const [companies, setCompanies] = useState<any[]>([]);
    const [activeCompany, setActiveCompany] = useState<any>(null);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    useEffect(() => {
        if (!user) return;
        const uid = user.uid;

        async function fetchCompanies() {
            try {
                const list = await getUserCompanies();
                setCompanies(list);

                const savedId = localStorage.getItem("serview_active_company_id");
                let active = list.find((c) => c.id === savedId);
                if (!active && list.length > 0) {
                    active = list[0];
                }
                if (active) {
                    setActiveCompany(active);
                    localStorage.setItem("serview_active_company_id", active.id);
                    document.cookie = `__claims=${JSON.stringify({ companyId: active.id })}; path=/; max-age=604800; SameSite=Lax`;
                }
            } catch (err) {
                console.error("Erro ao buscar empresas:", err);
            } finally {
                setLoadingCompanies(false);
            }
        }

        fetchCompanies();
    }, [user]);

    function handleSelectCompany(companyId: string) {
        const selected = companies.find((c) => c.id === companyId);
        if (selected) {
            setActiveCompany(selected);
            localStorage.setItem("serview_active_company_id", selected.id);
            document.cookie = `__claims=${JSON.stringify({ companyId: selected.id })}; path=/; max-age=604800; SameSite=Lax`;
            window.location.reload();
        }
    }

    function handleCreateNewCompany() {
        sessionStorage.removeItem("onboarding_plan");
        sessionStorage.removeItem("onboarding_company");
        router.push("/onboarding/plan");
    }

    async function handleSignOut() {
        await signOut();
        router.push("/login");
    }

    const displayName = user?.displayName ?? user?.email ?? "Usuário";
    const firstName = displayName.split(" ")[0];

    return (
        <div className="dash-layout">
            <div className="hero-bg" />

            {/* Sidebar */}
            <aside className="dash-sidebar">
                <div className="auth-logo" style={{ marginBottom: "1.5rem" }}>
                    <LogoIcon />
                    <span className="auth-logo-text">serview</span>
                </div>

                {/* Seletor de empresas (múltiplas empresas) */}
                <div className="company-select-container">
                    <label className="form-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Estabelecimento
                    </label>
                    {loadingCompanies ? (
                        <div className="spinner" style={{ width: 16, height: 16 }} />
                    ) : (
                        <>
                            <select
                                className="company-select"
                                value={activeCompany?.id ?? ""}
                                onChange={(e) => handleSelectCompany(e.target.value)}
                            >
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="btn-new-company"
                                onClick={handleCreateNewCompany}
                            >
                                <PlusIcon /> Nova Empresa
                            </button>
                        </>
                    )}
                </div>

                <nav className="dash-nav">
                    <a href="#" className="dash-nav-item active" id="nav-dashboard">
                        <BarChartIcon /> Dashboard
                    </a>
                    <a href="#" className="dash-nav-item" id="nav-orders">
                        <ReceiptIcon /> Pedidos
                    </a>
                    <a href="#" className="dash-nav-item" id="nav-kitchen">
                        <ChefHatIcon /> Cozinha
                    </a>
                    <a href="#" className="dash-nav-item" id="nav-waiters">
                        <UsersIcon /> Equipe
                    </a>
                    <a href="#" className="dash-nav-item" id="nav-reports">
                        <TrendingUpIcon /> Relatórios
                    </a>
                    <a href="#" className="dash-nav-item" id="nav-settings">
                        <SettingsIcon /> Configurações
                    </a>
                </nav>

                <div className="dash-sidebar-footer">
                    <div className="dash-user">
                        {user?.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.photoURL} alt={displayName} className="dash-avatar" />
                        ) : (
                            <div className="dash-avatar-placeholder">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="dash-user-info">
                            <span className="dash-user-name">{displayName}</span>
                            <span className="dash-user-email">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        id="btn-signout"
                        className="btn btn-ghost btn-sm"
                        style={{ width: "100%", marginTop: "0.75rem" }}
                        onClick={handleSignOut}
                    >
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="dash-main">
                {/* Top bar */}
                <header className="dash-topbar">
                    <div>
                        <h1 style={{ fontSize: "1.375rem", fontWeight: 700 }}>
                            Olá, {firstName}
                        </h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                            Painel de controle de {activeCompany?.name ?? "seu estabelecimento"}
                        </p>
                    </div>
                    {activeCompany?.subscription?.plan && (
                        <PlanBadge plan={activeCompany.subscription.plan} />
                    )}
                </header>

                {/* Welcome banner */}
                <div className="dash-welcome-banner animate-fade-in">
                    <div className="dash-banner-content">
                        <h2>Tudo pronto para começar</h2>
                        <p>
                            Seu estabelecimento {activeCompany?.name} está configurado. Comece adicionando
                            garçons e criando o cardápio.
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
                            <button className="btn btn-primary" id="btn-add-waiter">
                                Adicionar garçom
                            </button>
                            <button className="btn btn-secondary" id="btn-view-menu">
                                Criar cardápio
                            </button>
                        </div>
                    </div>
                    <div className="dash-banner-art" aria-hidden>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                    </div>
                </div>

                {/* Stats */}
                <div className="dash-stats animate-fade-in-delay">
                    {[
                        { label: "Pedidos hoje", value: "0", icon: <ReceiptIcon size={24} />, color: "var(--brand-400)" },
                        { label: "Garçons ativos", value: "0", icon: <UsersIcon size={24} />, color: "#22c55e" },
                        { label: "Tempo médio", value: "—", icon: <ClockIcon />, color: "#f59e0b" },
                        { label: "Receita hoje", value: "R$ 0,00", icon: <DollarIcon />, color: "#a560ff" },
                    ].map((stat, idx) => (
                        <div key={idx} className="stat-card">
                            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick start */}
                <div className="dash-section animate-fade-in-delay-2">
                    <h3 className="dash-section-title">Próximos passos</h3>
                    <div className="quickstart-grid">
                        {[
                            { icon: <UsersIcon size={20} />, title: "Adicionar garçons", desc: "Convide sua equipe de salão", done: false, id: "qs-waiters" },
                            { icon: <ChefHatIcon size={20} />, title: "Configurar cozinha", desc: "Ative o painel da cozinha", done: false, id: "qs-kitchen" },
                            { icon: <ClipboardIcon />, title: "Criar cardápio", desc: "Cadastre pratos e bebidas", done: false, id: "qs-menu" },
                            { icon: <SmartphoneIcon />, title: "App dos garçons", desc: "Baixe o app para a equipe", done: false, id: "qs-app" },
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                id={item.id}
                                className="quickstart-item"
                                type="button"
                            >
                                <div className="quickstart-icon">{item.icon}</div>
                                <div className="quickstart-info">
                                    <span className="quickstart-title">{item.title}</span>
                                    <span className="quickstart-desc">{item.desc}</span>
                                </div>
                                <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>→</span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            <style>{styles}</style>
        </div>
    );
}

function PlanBadge({ plan }: { plan: string }) {
    return (
        <span
            className="badge"
            style={{
                background: `${PLAN_COLORS[plan] || "var(--gray-400)"}22`,
                color: PLAN_COLORS[plan] || "var(--gray-400)",
                border: `1px solid ${PLAN_COLORS[plan] || "var(--gray-400)"}44`,
                fontSize: "0.8125rem",
            }}
        >
            ✦ {PLAN_LABELS[plan] ?? plan}
        </span>
    );
}

const styles = `
.dash-layout {
    display: flex;
    min-height: 100vh;
    position: relative;
}

.dash-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--surface-card);
    border-right: 1px solid var(--border-default);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
}

.dash-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
}

.dash-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 0.9375rem;
    font-weight: 500;
    text-decoration: none;
    transition: all var(--transition-fast);
}

.dash-nav-item:hover {
    background: var(--surface-raised);
    color: var(--text-primary);
}

.dash-nav-item.active {
    background: rgba(98,87,255,0.12);
    color: var(--brand-400);
}

.dash-sidebar-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-default); }

.dash-user { display: flex; align-items: center; gap: 0.75rem; }

.dash-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
}

.dash-avatar-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gradient-brand);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    color: white;
    flex-shrink: 0;
}

.dash-user-info { display: flex; flex-direction: column; min-width: 0; }

.dash-user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dash-user-email {
    font-size: 0.75rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dash-main {
    flex: 1;
    padding: 2rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
}

.dash-topbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

/* Welcome banner */
.dash-welcome-banner {
    background: linear-gradient(135deg, rgba(98,87,255,0.15) 0%, rgba(165,96,255,0.08) 100%);
    border: 1px solid rgba(98,87,255,0.25);
    border-radius: var(--radius-xl);
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    position: relative;
}

.dash-banner-content h2 {
    font-size: 1.375rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.dash-banner-content p {
    color: var(--text-secondary);
    font-size: 0.9375rem;
    max-width: 420px;
}

.dash-banner-art {
    opacity: 0.15;
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
}

/* Stats */
.dash-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

@media (max-width: 900px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
}

.stat-icon { font-size: 1.5rem; margin-bottom: 0.75rem; }
.stat-value { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
.stat-label { font-size: 0.8125rem; color: var(--text-muted); }

/* Quick start */
.dash-section-title {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.75rem;
}

.quickstart-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.quickstart-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-family: inherit;
    color: var(--text-primary);
    text-align: left;
    width: 100%;
}

.quickstart-item:hover {
    background: var(--surface-raised);
    border-color: var(--border-strong);
    transform: translateX(4px);
}

.quickstart-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-raised);
    border-radius: var(--radius-md);
    flex-shrink: 0;
}

.quickstart-info { display: flex; flex-direction: column; flex: 1; }
.quickstart-title { font-weight: 600; font-size: 0.9375rem; }
.quickstart-desc { font-size: 0.8125rem; color: var(--text-muted); }

.auth-logo {
    display: flex;
    align-items: center;
    gap: 0.625rem;
}

.auth-logo-text {
    font-size: 1.375rem;
    font-weight: 800;
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.03em;
}

.company-select-container {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.company-select {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 0.875rem;
    font-family: inherit;
    outline: none;
    cursor: pointer;
    transition: all var(--transition-fast);
}
.company-select:focus {
    border-color: var(--brand-500);
}
.btn-new-company {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem;
    background: transparent;
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-md);
    color: var(--brand-300);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
}
.btn-new-company:hover {
    background: rgba(98,87,255,0.05);
    border-color: var(--brand-400);
    color: var(--brand-400);
}
`;
