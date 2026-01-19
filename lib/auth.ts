// lib/auth.ts
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { app } from "./firebase";
import { upsertUser } from "./upsertUser"; // ✅ add this

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ change this to async so we can upsert
export const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, provider);
  await upsertUser(res.user); // ✅ creates/updates Firestore user doc
  return res;
};

export const signOutUser = () => signOut(auth);

export const subscribeToAuth = (cb: (u: User | null) => void) => {
  return onAuthStateChanged(auth, cb);
};
