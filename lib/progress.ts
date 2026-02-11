// lib/progress.ts
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth } from "@/lib/auth";
import type { User } from "firebase/auth";

export type LessonProgress = {
  lessonId: string;
  currentStep: number;
  totalSteps?: number;
  progressPercent?: number; // 0..100 for your progress bar
  lastPath?: string;        // where to resume
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function saveLessonProgress(
  lessonId: string,
  currentStep: number,
  opts?: {
    totalSteps?: number; // e.g. 4
    lastPath?: string;   // e.g. "/module/module1?step=2&page=3"
    isComplete?: boolean;
  }
) {
  const user = await getAuthedUser();
  if (!user) return;

  const totalSteps = opts?.totalSteps ?? 4;

  // CurrentStep assumed 1..totalSteps
  const stepClamped = clamp(currentStep, 1, totalSteps);
  const progressPercent =
    totalSteps <= 0 ? 0 : Math.round((stepClamped / totalSteps) * 100);

  const ref = doc(db, "users", user.uid, "lessonProgress", lessonId);

  await setDoc(
    ref,
    {
      lessonId,
      currentStep: stepClamped,
      totalSteps,
      progressPercent,
      lastPath: opts?.lastPath ?? null,
      lastVisitedAt: serverTimestamp(),
      isComplete: opts?.isComplete ?? stepClamped >= totalSteps,
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

// ✅ load everything for rendering module page progress bars
export async function loadAllLessonProgress(): Promise<Record<string, LessonProgress>> {
  const user = await getAuthedUser();
  if (!user) return {};

  const colRef = collection(db, "users", user.uid, "lessonProgress");
  const snap = await getDocs(colRef);

  const map: Record<string, LessonProgress> = {};
  snap.forEach((d) => {
    map[d.id] = d.data() as LessonProgress;
  });

  return map;
}
