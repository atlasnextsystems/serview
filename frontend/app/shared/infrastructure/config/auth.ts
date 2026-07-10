import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as _signOut,
} from "firebase/auth";
import { app } from "./firebase";

export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function signInWithGoogle() {
    return signInWithPopup(firebaseAuth, googleProvider);
}

export async function signInWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

/** Signs out of Firebase and clears the server-side session cookie. */
export async function signOut() {
    await _signOut(firebaseAuth);
    await fetch("/api/auth/session", { method: "DELETE" });
}

/**
 * Syncs the current user's ID token with the server session cookie.
 * Call this after login/register and whenever the token refreshes.
 */
export async function syncSession(forceRefresh = false) {
    const user = firebaseAuth.currentUser;
    if (!user) return;

    const idToken = await user.getIdToken(forceRefresh);
    await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
    });
}
