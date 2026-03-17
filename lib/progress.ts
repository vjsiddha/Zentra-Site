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
import { auth } from "@/lib/firebase"; 
import type { User } from "firebase/auth";
import { updateDoc, increment } from "firebase/firestore";
import { computeLevel, computeAvatars, getXpToNextLevel } from "@/lib/upsertUser";

export type LessonProgress = {
  lessonId: string;
  currentStep: number;
  totalSteps?: number;
  progressPercent?: number;
  lastPath?: string;
  lastVisitedAt?: any;
  isComplete?: boolean;
  scores?: {
    lesson1?: number;
    lesson2?: number;
    lesson3?: number;
  };
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

    scores?: {
      lesson1?: number;
      lesson2?: number;
      lesson3?: number;
    };
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
      isComplete: opts?.isComplete ?? false,
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

// load everything for rendering module page progress bars
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

export const XP_REWARDS = {
  COMPLETE_STEP: 100,
  COMPLETE_MODULE: 500,
};

export async function awardXP(amount: number): Promise<void> {
  const user = await getAuthedUser();
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const data = snap.data() ?? {};

  const currentTotalXp: number = data.totalXp ?? data.xp ?? 0;
  const newTotalXp = currentTotalXp + amount;

  const newLevel = computeLevel(newTotalXp);
  const xpToNextLevel = getXpToNextLevel(newLevel);
  const newAvatars = computeAvatars(newTotalXp);

  // xp = progress within current level (display value)
  let xpIntoCurrentLevel = newTotalXp;
  const { LEVEL_THRESHOLDS } = await import("@/lib/upsertUser");
  for (let i = 0; i < newLevel - 1; i++) {
    xpIntoCurrentLevel -= LEVEL_THRESHOLDS[i];
  }

  await updateDoc(ref, {
    xp: Math.max(0, xpIntoCurrentLevel),
    totalXp: newTotalXp,
    level: newLevel,
    xpToNextLevel,
    unlockedAvatars: newAvatars,
  });
}
