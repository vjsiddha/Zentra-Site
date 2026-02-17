import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export const AVATARS = [
  { name: "Spark",  color: "bg-orange-400", xpRequired: 0 },
  { name: "Wave",   color: "bg-blue-400",   xpRequired: 1000 },
  { name: "Bloom",  color: "bg-purple-400", xpRequired: 3000 },
  { name: "Mint",   color: "bg-green-400",  xpRequired: 6000 },
  { name: "Nova",   color: "bg-pink-400",   xpRequired: 10000 },
  { name: "Flux",   color: "bg-yellow-400", xpRequired: 15000 },
  { name: "Crest",  color: "bg-red-400",    xpRequired: 25000 },
  { name: "Apex",   color: "bg-indigo-400", xpRequired: 40000 },
];

export const LEVEL_THRESHOLDS = [3000, 5000, 8000, 12000, 18000, 25000, 35000, 50000];

export function getXpToNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
}

export function computeLevel(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  for (const threshold of LEVEL_THRESHOLDS) {
    accumulated += threshold;
    if (totalXp >= accumulated) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

export function computeAvatars(totalXp: number) {
  return AVATARS.map((a) => ({
    name: a.name,
    color: a.color,
    unlocked: totalXp >= a.xpRequired,
  }));
}

export async function upsertUser(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const base = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    providerIds: user.providerData.map((p) => p.providerId),
    lastLoginAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    // New user — initialise XP/level/avatar fields
    const initialAvatars = computeAvatars(0);
    await setDoc(ref, {
      ...base,
      createdAt: serverTimestamp(),
      xp: 0,
      totalXp: 0,
      level: 1,
      xpToNextLevel: getXpToNextLevel(1),
      streak: 0,
      termsLearned: 0,
      recentTerms: [],
      unlockedAvatars: initialAvatars,
    });
  } else {
    await updateDoc(ref, base);
  }
}