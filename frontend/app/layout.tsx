import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./shared/context/AuthContext";

export const metadata: Metadata = {
    title: "Serview — Gestão para Restaurantes",
    description:
        "Plataforma SaaS completa para gerenciar pedidos, garçons e cozinha em tempo real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className="h-full">
            <body className="h-full">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
