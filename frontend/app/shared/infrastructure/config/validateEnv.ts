export enum EnvironmentMode {
    DEV = "DEV",
    PROD = "PROD",
}

export function validateEnvVariables(
    required: readonly string[],
    mode: EnvironmentMode
): void {
    if (typeof window === "undefined" && mode === EnvironmentMode.DEV) {
        // Server-side: skip — Next.js will surface missing env vars
        return;
    }

    const missing = required.filter((key) => {
        const value = process.env[`NEXT_PUBLIC_${key}`];
        return value == null || value.trim() === "";
    });

    if (missing.length === 0) return;

    const message = `Missing environment variables: ${missing.join(", ")}`;
    console.error(message);
    // In dev, warn but don't throw (allows partial local setup)
    if (mode === EnvironmentMode.PROD) {
        throw new Error(message);
    }
}