import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

/** Sign in with Google popup */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/** Sign in with email + password */
export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Create a new account with email + password, then set display name */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
}

/** Send a password reset email */
export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/** Sign out — exported as both signOut and signOutUser to match all imports */
export async function signOut() {
  return firebaseSignOut(auth);
}

// Alias used by dashboard/page.tsx and profile/page.tsx
export const signOutUser = signOut;

/** Subscribe to auth state changes — used by AuthProvider */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}