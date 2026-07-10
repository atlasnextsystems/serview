import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { app } from "./firebase";

export const functions = getFunctions(app, "southamerica-east1");

// Connect to the local emulator in development
if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_EMULATOR === "true"
) {
    connectFunctionsEmulator(functions, "localhost", 5001);
}

/**
 * Typed wrapper around httpsCallable.
 *
 * Usage:
 *   const createCompany = callable<CreateCompanyInput, CreateCompanyResult>("createCompany");
 *   const result = await createCompany(input);
 */
export function callable<TInput = unknown, TOutput = unknown>(name: string) {
    return (input: TInput) =>
        httpsCallable<TInput, TOutput>(functions, name)(input).then((r) => r.data);
}
