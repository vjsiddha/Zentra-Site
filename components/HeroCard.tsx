"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";

type UserDoc = {
  displayName?: string;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
};

type LessonProgressDoc = {
  lessonId: string;
  currentStep?: number;
  isComplete?: boolean;
};

const AVATARS = [
  { name: "Benny",   file: "benny_avatar.png",  unlocksAt: 0 },
  { name: "Fox",     file: "fox_avatar.svg",     unlocksAt: 1 },
  { name: "Bear",    file: "bear_avatar.svg",    unlocksAt: 2 },
  { name: "Owl",     file: "owl_avatar.svg",     unlocksAt: 3 },
  { name: "Cat",     file: "cat_avatar.svg",     unlocksAt: 4 },
  { name: "Panda",   file: "panda_avatar.svg",   unlocksAt: 4 },
  { name: "Lion",    file: "lion_avatar.svg",    unlocksAt: 5 },
  { name: "Rabbit",  file: "rabbit_avatar.svg",  unlocksAt: 6 },
  { name: "Penguin", file: "penguin_avatar.svg", unlocksAt: 7 },
  { name: "Koala",   file: "koala_avatar.svg",   unlocksAt: 7 },
  { name: "Tiger",   file: "tiger_avatar.svg",   unlocksAt: 8 },
];

export default function HeroCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDoc[]>([]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setUserData(snap.data() as UserDoc);
    });

    const progressRef = collection(db, "users", user.uid, "lessonProgress");
    const unsubProgress = onSnapshot(query(progressRef), (snap) => {
      setLessonProgress(snap.docs.map((d) => d.data() as LessonProgressDoc));
    });

    return () => {
      unsubUser();
      unsubProgress();
    };
  }, [user]);

  const displayName = userData?.displayName || user?.displayName || "Student";
  const firstName = displayName.split(" ")[0];
  const level = userData?.level ?? 1;
  const xp = userData?.xp ?? 0;
  const xpToNext = userData?.xpToNextLevel ?? 3000;
  const xpPct = Math.min(100, Math.round((xp / xpToNext) * 100));

  // How many modules completed
  const modulesCompleted = useMemo(() => {
    return lessonProgress.filter(
      (m) => m.isComplete === true || (m.currentStep ?? 1) >= 4
    ).length;
  }, [lessonProgress]);

  // Current avatar = highest one unlocked
  const currentAvatar = useMemo(() => {
    return [...AVATARS].reverse().find((a) => modulesCompleted >= a.unlocksAt) ?? AVATARS[0];
  }, [modulesCompleted]);

  // Next avatar to unlock
  const nextAvatar = useMemo(() => {
    return AVATARS.find((a) => a.unlocksAt > modulesCompleted) ?? null;
  }, [modulesCompleted]);

  return (
    <div className="w-full rounded-3xl p-10 bg-gradient-to-r from-[#0E5B87] to-[#0F6CAB] flex items-center justify-between text-white">
      {/* Left */}
      <div className="flex flex-col gap-5 flex-1">
        <div>
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">
            Welcome back
          </p>
          <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
            Hi {firstName}, keep it up!<br />You're doing great!
          </h1>
        </div>

        {/* XP Bar */}
        <div className="max-w-xs">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>{xp.toLocaleString()} XP</span>
            <span>{xpToNext.toLocaleString()} XP to next level</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => router.push("/lesson")}
          className="flex items-center gap-3 px-5 py-3 bg-white/20 border border-white/30 rounded-full text-white font-medium text-sm hover:bg-white/30 transition-all backdrop-blur-sm w-fit"
        >
          <span>Continue your lesson</span>
          <i className="ti ti-arrow-right" />
        </button>
      </div>

      {/* Right — current avatar */}
      <div className="flex flex-col items-center gap-2 min-w-[140px]">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="w-[120px] h-[120px] bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white/30">
              <img
                src={`/${currentAvatar.file}`}
                alt={currentAvatar.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 bg-white text-[#0E5B87] text-xs font-black rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
            {level}
          </div>
        </div>

        <div className="text-center mt-2">
          <div className="font-bold text-lg">{currentAvatar.name}</div>
          {nextAvatar ? (
            <div className="text-xs text-white/80 max-w-[140px] leading-relaxed">
              Unlock <span className="font-semibold">{nextAvatar.name}</span> at module {nextAvatar.unlocksAt}
            </div>
          ) : (
            <div className="text-xs text-white/80">All avatars unlocked! 🎉</div>
          )}
        </div>
      </div>
    </div>
  );
}