// lib/auth.ts
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);

export const subscribeToAuth = (cb: (u: User | null) => void) => {
  return onAuthStateChanged(auth, cb);
};
