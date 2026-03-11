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
  { name: "Benny",   file: "benny_avatar.png",  modulesRequired: 0 },
  { name: "Fox",     file: "fox_avatar.svg",     modulesRequired: 1 },
  { name: "Bear",    file: "bear_avatar.svg",    modulesRequired: 2 },
  { name: "Owl",     file: "owl_avatar.svg",     modulesRequired: 3 },
  { name: "Cat",     file: "cat_avatar.svg",     modulesRequired: 4 },
  { name: "Panda",   file: "panda_avatar.svg",   modulesRequired: 4 },
  { name: "Lion",    file: "lion_avatar.svg",    modulesRequired: 5 },
  { name: "Rabbit",  file: "rabbit_avatar.svg",  modulesRequired: 6 },
  { name: "Penguin", file: "penguin_avatar.svg", modulesRequired: 7 },
  { name: "Koala",   file: "koala_avatar.svg",   modulesRequired: 7 },
  { name: "Tiger",   file: "tiger_avatar.svg",   modulesRequired: 8 },
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

export function computeAvatars(modulesCompleted: number) {
  return AVATARS.map((a) => ({
    name: a.name,
    file: a.file,
    unlocked: modulesCompleted >= a.modulesRequired,
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