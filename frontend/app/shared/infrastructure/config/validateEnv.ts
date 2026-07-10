import { logger } from "firebase-functions/logger";
import { StringParam } from "firebase-functions/params";

export enum EnvironmentMode {
    DEV = "DEV",
    PROD = "PROD",
}

type ParamsMap = Record<string, StringParam>;

export function validateEnvVariables(
    required: readonly string[],
    mode: EnvironmentMode,
    params?: ParamsMap
): void {
    const missing = required.filter((key) => {
        const value =
            mode === EnvironmentMode.DEV
                ? process.env[key] // .env
                : params?.[key]?.value(); // params

        return value == null || value.trim() === "";
    });

    if (missing.length === 0) {
        return;
    }

    const message = `The following environment variables are missing: ${missing.join(", ")}`;

    logger.error(message);
    throw new Error(message);
}