"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    signUpWithEmail,
    signInWithGoogle,
} from "../shared/infrastructure/config/auth";
import { callable } from "../shared/infrastructure/config/functions";
import { FirebaseError } from "firebase/app";
import { firebaseAuth } from "../shared/infrastructure/config/auth";

const FIREBASE_ERRORS: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
};

const initUserDocument = callable<{ displayName: string; photoURL?: string }, void>(
    "initUserDocument"
);

function LogoIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-400)" }}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

export default function RegisterPage() {
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    function handleFirebaseError(err: unknown) {
        if (err instanceof FirebaseError) {
            setError(FIREBASE_ERRORS[err.code] ?? "Ocorreu um erro. Tente novamente.");
        } else {
            setError("Ocorreu um erro inesperado.");
        }
    }

    async function postRegister() {
        const user = firebaseAuth.currentUser;
        if (!user) return;
        await initUserDocument({
            displayName: user.displayName ?? displayName,
            photoURL: user.photoURL ?? undefined,
        });
        router.push("/onboarding/plan");
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não conferem.");
            return;
        }

        setLoading(true);
        try {
            await signUpWithEmail(email, password);
            // Update display name if Firebase doesn't do it automatically
            await postRegister();
        } catch (err) {
            handleFirebaseError(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        setError(null);
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            await postRegister();
        } catch (err) {
            handleFirebaseError(err);
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="hero-bg" />
            <div className="auth-glow" />

            <div className="auth-card animate-fade-in">
                <div className="auth-logo">
                    <LogoIcon />
                    <span className="auth-logo-text">serview</span>
                </div>

                <div className="auth-header">
                    <h1>Criar conta</h1>
                    <p>Comece seu período gratuito de 14 dias</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="displayName">Seu nome</label>
                        <input
                            id="displayName"
                            type="text"
                            className="form-input"
                            placeholder="João Silva"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Senha</label>
                            <input
                                id="password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">Confirmar</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button
                        id="btn-register"
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : "Criar conta"}
                    </button>
                </form>

                <div className="divider">ou</div>

                <button
                    id="btn-google-register"
                    type="button"
                    className="btn btn-google"
                    onClick={handleGoogle}
                    disabled={googleLoading}
                >
                    {googleLoading ? (
                        <span className="spinner" style={{ borderTopColor: "#6257ff" }} />
                    ) : (
                        <>
                            <GoogleIcon />
                            Continuar com Google
                        </>
                    )}
                </button>

                <p className="auth-footer">
                    Já tem uma conta?{" "}
                    <Link href="/login" id="link-login">Entrar</Link>
                </p>
            </div>

            <style>{authStyles}</style>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.943 17.64 9.2z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
    );
}

const authStyles = `
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
}

.auth-glow {
    position: fixed;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(98,87,255,0.2) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

.auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 2.5rem;
    box-shadow: var(--shadow-lg);
}

.auth-logo {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 2rem;
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

.auth-header { margin-bottom: 1.75rem; }
.auth-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}
.auth-header p { color: var(--text-muted); font-size: 0.9375rem; }

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.auth-footer {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-top: 1.25rem;
}
`;
