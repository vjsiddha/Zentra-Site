// lib/auth.ts
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { app } from "./firebase";

let auth: any = null;
let provider: GoogleAuthProvider | null = null;

// Only initialize auth if Firebase app is available
if (app) {
  try {
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("Firebase Auth initialization failed:", error);
    auth = null;
    provider = null;
  }
}

export const signInWithGoogle = () => {
  if (!auth || !provider) {
    console.warn("Firebase Auth not configured");
    return Promise.reject(new Error("Auth not configured"));
  }
  return signInWithPopup(auth, provider);
};

export const signOutUser = () => {
  if (!auth) {
    console.warn("Firebase Auth not configured");
    return Promise.reject(new Error("Auth not configured"));
  }
  return signOut(auth);
};

export const subscribeToAuth = (cb: (u: User | null) => void) => {
  if (!auth) {
    console.warn("Firebase Auth not configured, returning mock user");
    cb(null);
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, cb);
};
