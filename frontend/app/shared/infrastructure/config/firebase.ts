import { initializeApp, getApps } from "firebase/app";
// import { EnvironmentMode, validateEnvVariables } from "./validateEnv";

// validateEnvVariables(
//     [
//         "FIREBASE_API_KEY",
//         "FIREBASE_AUTH_DOMAIN",
//         "FIREBASE_PROJECT_ID",
//         "FIREBASE_STORAGE_BUCKET",
//         "FIREBASE_MESSAGING_SENDER_ID",
//         "FIREBASE_APP_ID",
//     ],
//     EnvironmentMode.DEV
// );

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Guard against re-initialization on Next.js hot reload
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];