// lib/progress.ts
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth } from "@/lib/auth";
import type { User } from "firebase/auth";

export type LessonProgress = {
  lessonId: string;
  currentStep: number;
  lastVisitedAt?: any;
  isComplete?: boolean;
};

// ✅ wait for auth to be ready (prevents "currentUser is null" on refresh)
async function getAuthedUser(): Promise<User | null> {
  const existing = auth.currentUser;
  if (existing) return existing;

  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((u) => {
      unsub();
      resolve(u);
    });
  });
}

export async function saveLessonProgress(lessonId: string, currentStep: number) {
  const user = await getAuthedUser();
  if (!user) return;

  const ref = doc(db, "users", user.uid, "lessonProgress", lessonId);

  await setDoc(
    ref,
    {
      lessonId,
      currentStep,
      lastVisitedAt: serverTimestamp(),
      isComplete: currentStep >= 4, // optional: mark complete on step 4
    },
    { merge: true }
  );
}

export async function loadLessonProgress(
  lessonId: string
): Promise<LessonProgress | null> {
  const user = await getAuthedUser();
  if (!user) return null;

  const ref = doc(db, "users", user.uid, "lessonProgress", lessonId);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() as LessonProgress) : null;
}
