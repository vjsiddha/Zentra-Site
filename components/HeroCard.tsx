"use client";

import { useEffect, useState, useMemo } from "react";
import { doc, onSnapshot, collection, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";
import { AVATARS } from "lib/upsertUser";

type UserDoc = {
  displayName?: string;
};

type LessonProgressDoc = {
  lessonId: string;
  currentStep?: number;
  isComplete?: boolean;
};

export default function HeroCard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDoc[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setUserData(snap.data() as UserDoc);
    });

    const progressRef = collection(db, "users", user.uid, "lessonProgress");
    const unsubProgress = onSnapshot(query(progressRef), (snap) => {
      setLessonProgress(snap.docs.map((d) => d.data() as LessonProgressDoc));
      setProgressLoaded(true);
    });

    return () => {
      unsubUser();
      unsubProgress();
    };
  }, [user]);

  const displayName = userData?.displayName || user?.displayName || "Student";
  const firstName = displayName.split(" ")[0];

  const modulesCompleted = useMemo(() => {
    return lessonProgress.filter((m) => m.isComplete === true).length;
  }, [lessonProgress]);

  const currentAvatar = useMemo(() => {
    return [...AVATARS].reverse().find((a) => modulesCompleted >= a.modulesRequired) ?? AVATARS[0];
  }, [modulesCompleted]);

  const nextAvatar = useMemo(() => {
    return AVATARS.find((a) => a.modulesRequired > modulesCompleted) ?? null;
  }, [modulesCompleted]);

  if (!progressLoaded) {
    return (
      <div className="w-full rounded-3xl p-10 bg-gradient-to-r from-[#0E5B87] to-[#0F6CAB] flex items-center justify-between text-white">
        <div className="flex flex-col gap-5 flex-1">
          <div>
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">
              Welcome back
            </p>
            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
              Hi {firstName}, keep it up!
              <br />
              You're doing great!
            </h1>
          </div>
        </div>
        <div className="min-w-[140px] h-[160px]" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl p-10 bg-gradient-to-r from-[#0E5B87] to-[#0F6CAB] flex items-center justify-between text-white">
      <div className="flex flex-col gap-5 flex-1">
        <div>
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">
            Welcome back
          </p>
          <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
            Hi {firstName}, keep it up!
            <br />
            You're doing great!
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 min-w-[140px]">
        <div className="relative">
          <div className="w-[120px] h-[120px] bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white/30">
              <img
                src={`/${currentAvatar.file}`}
                alt={currentAvatar.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="absolute -bottom-1 -right-1 bg-white text-[#0E5B87] text-xs font-black rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
            {modulesCompleted}
          </div>
        </div>

        <div className="text-center mt-2">
          <div className="font-bold text-lg">{currentAvatar.name}</div>
          {nextAvatar ? (
            <div className="text-xs text-white/80 max-w-[140px] leading-relaxed">
              Unlock <span className="font-semibold">{nextAvatar.name}</span> at module {nextAvatar.modulesRequired}
            </div>
          ) : (
            <div className="text-xs text-white/80">All avatars unlocked! 🎉</div>
          )}
        </div>
      </div>
    </div>
  );
}