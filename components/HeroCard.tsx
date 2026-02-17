"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";

type UserDoc = {
  displayName?: string;
  level?: number;
  xp?: number;
  totalXp?: number;
  xpToNextLevel?: number;
  unlockedAvatars?: { name: string; color: string; unlocked: boolean }[];
};

const AVATAR_NEXT_UNLOCK: Record<string, string> = {
  Spark: "Wave",
  Wave: "Bloom",
  Bloom: "Mint",
  Mint: "Nova",
  Nova: "Flux",
  Flux: "Crest",
  Crest: "Apex",
  Apex: "Max level!",
};

const AVATAR_SVG_COLORS: Record<string, string> = {
  "bg-orange-400": "from-orange-300 to-orange-500",
  "bg-blue-400":   "from-blue-300 to-blue-500",
  "bg-purple-400": "from-purple-300 to-purple-500",
  "bg-green-400":  "from-green-300 to-green-500",
  "bg-pink-400":   "from-pink-300 to-pink-500",
  "bg-yellow-400": "from-yellow-300 to-yellow-500",
  "bg-red-400":    "from-red-300 to-red-500",
  "bg-indigo-400": "from-indigo-300 to-indigo-500",
};

export default function HeroCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserDoc | null>(null);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setUserData(snap.data() as UserDoc);
    });
    return () => unsub();
  }, [user]);

  const displayName = userData?.displayName || user?.displayName || "Student";
  const firstName = displayName.split(" ")[0];
  const level = userData?.level ?? 1;
  const xp = userData?.xp ?? 0;
  const xpToNext = userData?.xpToNextLevel ?? 3000;
  const xpPct = Math.min(100, Math.round((xp / xpToNext) * 100));

  const avatars = userData?.unlockedAvatars ?? [];
  const currentAvatar = [...avatars].reverse().find((a) => a.unlocked);
  const nextLockedAvatar = currentAvatar
    ? AVATAR_NEXT_UNLOCK[currentAvatar.name] ?? "Max level!"
    : "Spark";

  const avatarGradient = currentAvatar
    ? AVATAR_SVG_COLORS[currentAvatar.color] ?? "from-orange-300 to-orange-500"
    : "from-orange-300 to-orange-500";

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

      {/* Right — current avatar + level */}
      <div className="flex flex-col items-center gap-2 min-w-[140px]">
        <div className="relative">
          <div className="w-[120px] h-[120px] bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <div className={`w-16 h-16 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center`}>
                <span className="text-white text-3xl font-bold">✦</span>
              </div>
            </div>
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 bg-white text-[#0E5B87] text-xs font-black rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
            {level}
          </div>
        </div>

        <div className="text-center mt-2">
          <div className="font-bold text-lg">Level {level}</div>
          {nextLockedAvatar !== "Max level!" ? (
            <div className="text-xs text-white/80 max-w-[140px] leading-relaxed">
              Unlock <span className="font-semibold">{nextLockedAvatar}</span> at next milestone
            </div>
          ) : (
            <div className="text-xs text-white/80">All avatars unlocked! 🎉</div>
          )}
        </div>
      </div>
    </div>
  );
}