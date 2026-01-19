"use client";

import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import RightRail from "@/components/RightRail";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOutUser } from "@/lib/auth";

import {
  doc,
  collection,
  onSnapshot,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type LessonProgressDoc = {
  lessonId: string; // e.g. "module1"
  currentStep?: number; // 1-4
  isComplete?: boolean;
  lastVisitedAt?: Timestamp | any;
};

type UserDoc = {
  createdAt?: Timestamp | any;
  displayName?: string;
  email?: string;
  photoURL?: string;

  // optional “gamification” fields (if you store them later)
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
  streak?: number;

  // vocab/avatars (if you store them later)
  termsLearned?: number;
  recentTerms?: string[];
  unlockedAvatars?: { name: string; color: string; unlocked: boolean }[];
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Auth guard (safe)
  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  // ✅ REALTIME listeners so Profile updates when progress changes
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLessonProgress([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const userRef = doc(db, "users", user.uid);
    const progressRef = collection(db, "users", user.uid, "lessonProgress");
    const progressQ = query(progressRef);

    const unsubUser = onSnapshot(
      userRef,
      (snap) => {
        setUserData(snap.exists() ? (snap.data() as UserDoc) : null);
      },
      (err) => console.error("User doc listener error:", err)
    );

    const unsubProgress = onSnapshot(
      progressQ,
      (snap) => {
        const arr = snap.docs.map((d) => d.data() as LessonProgressDoc);
        setLessonProgress(arr);
        setDataLoading(false);
      },
      (err) => {
        console.error("Progress listener error:", err);
        setLessonProgress([]);
        setDataLoading(false);
      }
    );

    return () => {
      unsubUser();
      unsubProgress();
    };
  }, [user]);

  // ---------- Derived values ----------
  const totalModules = 8;

  const modulesCompleted = useMemo(() => {
    return lessonProgress.filter(
      (m) => m.isComplete === true || (m.currentStep ?? 1) >= 4
    ).length;
  }, [lessonProgress]);

  const module1Step = useMemo(() => {
    const m1 = lessonProgress.find((p) => p.lessonId === "module1");
    return m1?.currentStep ?? 1;
  }, [lessonProgress]);

  const joinDate = useMemo(() => {
    const ts = userData?.createdAt;
    if (ts?.toDate) {
      return ts
        .toDate()
        .toLocaleString(undefined, { month: "long", year: "numeric" });
    }
    return "—";
  }, [userData]);

  // Build a simple “module progress list” from docs you already store
  const moduleProgressList = useMemo(() => {
    const ids = Array.from({ length: totalModules }, (_, i) => `module${i + 1}`);

    return ids.map((id) => {
      const doc = lessonProgress.find((p) => p.lessonId === id);
      const step = doc?.currentStep ?? 1;
      const completed = doc?.isComplete === true || step >= 4;
      const pct = completed ? 100 : Math.max(0, Math.min(100, ((step - 1) / 3) * 100));

      return {
        id,
        title: `Module ${id.replace("module", "")}`,
        currentStep: step,
        completed,
        progressPct: pct,
      };
    });
  }, [lessonProgress]);

  // Gamification defaults (until you start storing them)
  const userLevel = userData?.level ?? 1;
  const userXP = userData?.xp ?? 0;
  const xpToNextLevel = userData?.xpToNextLevel ?? 3000;
  const streak = userData?.streak ?? 0;

  // Avatars + vocab defaults (until stored)
  const unlockedAvatars =
    userData?.unlockedAvatars ??
    [
      { name: "Spark", color: "bg-orange-400", unlocked: true },
      { name: "Wave", color: "bg-blue-400", unlocked: true },
      { name: "Bloom", color: "bg-purple-400", unlocked: true },
      { name: "Mint", color: "bg-green-400", unlocked: true },
    ];

  const termsLearned = userData?.termsLearned ?? 0;
  const recentTerms = userData?.recentTerms ?? ["—", "—", "—", "—"];

  // ✅ IMPORTANT: hooks are done; now conditional UI return is safe
  if (loading || !user) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-24 text-gray-500">
          Loading…
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-[calc(100vh-64px)]">
          <SidebarNav onProfileClick={() => router.push("/profile")} />
        </aside>

        {/* CENTER */}
        <main className="relative w-full min-w-0 before:absolute before:top-0 before:bottom-0 before:left-[-12px] before:w-px before:bg-[#E9EEF3] after:absolute after:top-0 after:bottom-0 after:right-[-12px] after:w-px after:bg-[#E9EEF3]">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
              <button
                onClick={signOutUser}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 transition"
              >
                Sign out
              </button>
            </div>

            {/* Identity */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold border-4 border-white/30 overflow-hidden">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{(user.displayName || user.email || "U")[0].toUpperCase()}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">
                    {user.displayName || "Student"}
                  </h2>
                  <p className="text-blue-100 mb-1">{user.email}</p>
                  <p className="text-sm text-blue-200">Member since {joinDate}</p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border-2 border-white/30">
                  <div className="text-sm font-medium text-blue-100 mb-1">LEVEL</div>
                  <div className="text-4xl font-bold">{userLevel}</div>
                </div>
              </div>
            </section>

            {/* Progress */}
            <section>
              <h3 className="text-lg font-semibold uppercase tracking-wider text-gray-900 mb-6">
                Learning Progress
              </h3>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {dataLoading ? (
                  <div className="text-gray-600">Loading your progress…</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm text-gray-600">Modules Completed</div>
                        <div className="text-4xl font-bold text-blue-600">
                          {modulesCompleted}/{totalModules}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Streak</div>
                        <div className="text-2xl font-bold text-orange-500">
                          🔥 {streak}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-8">
                      <button
                        onClick={() => router.push(`/module/module1?step=${module1Step}`)}
                        className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
                      >
                        Resume Module 1 (Step {module1Step})
                      </button>

                      <button
                        onClick={() => router.push("/module")}
                        className="rounded-full bg-gray-100 px-6 py-3 font-medium text-gray-800 hover:bg-gray-200 transition"
                      >
                        All Modules
                      </button>
                    </div>

                    {/* Module progress bars (driven by Firestore) */}
                    <div className="space-y-4">
                      {moduleProgressList.map((m) => (
                        <div key={m.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {m.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              Step {m.currentStep}/4
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${m.progressPct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* XP */}
            <section>
              <h3 className="text-lg font-semibold uppercase tracking-wider text-gray-900 mb-6">
                Experience Points
              </h3>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Current XP
                    </div>
                    <div className="text-3xl font-bold text-purple-700">
                      {Number(userXP).toLocaleString()} XP
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Next Level
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {Math.max(0, xpToNextLevel - userXP)} XP to go
                    </div>
                  </div>
                </div>

                <div className="h-4 bg-white rounded-full overflow-hidden border border-purple-200">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (userXP / xpToNextLevel) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* ✅ Unlocked Avatars (BACK) */}
            <section>
              <h3 className="text-lg font-semibold uppercase tracking-wider text-gray-900 mb-6">
                Unlocked Avatars
              </h3>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-8 gap-4">
                  {unlockedAvatars.map((avatar, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        className={`h-16 w-16 rounded-full ${avatar.color} flex items-center justify-center mb-2 ${
                          avatar.unlocked ? "" : "opacity-30 grayscale"
                        }`}
                      >
                        <span className="text-2xl">✦</span>
                      </div>
                      <div className="text-xs text-gray-600">{avatar.name}</div>
                    </div>
                  ))}
                  {[...Array(4)].map((_, idx) => (
                    <div key={`locked-${idx}`} className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                        <i className="ti ti-lock text-gray-400 text-xl" />
                      </div>
                      <div className="text-xs text-gray-400">Locked</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Unlock more avatars by completing lessons and reaching higher levels!
                </p>
              </div>
            </section>

            {/* ✅ Vocab & Knowledge (BACK) */}
            <section>
              <h3 className="text-lg font-semibold uppercase tracking-wider text-gray-900 mb-6">
                Vocabulary & Knowledge
              </h3>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Terms Learned
                    </div>
                    <div className="text-4xl font-bold text-blue-600">
                      {termsLearned}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/dictionary")}
                    className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
                  >
                    Open Personal Dictionary
                    <i className="ti ti-arrow-right" />
                  </button>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Recently Learned:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentTerms.map((term, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ✅ Account Settings (BACK) */}
            <section>
              <h3 className="text-lg font-semibold uppercase tracking-wider text-gray-900 mb-6">
                Account Settings
              </h3>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-3">
                  <button
                    onClick={signOutUser}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <i className="ti ti-logout text-gray-600 text-xl" />
                      <span className="font-medium text-gray-700">Sign Out</span>
                    </div>
                    <i className="ti ti-chevron-right text-gray-400" />
                  </button>

                  <button
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-red-50 transition text-left"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete your account? This action cannot be undone."
                        )
                      ) {
                        alert("Account deletion coming soon");
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <i className="ti ti-trash text-red-600 text-xl" />
                      <span className="font-medium text-red-600">
                        Delete Account
                      </span>
                    </div>
                    <i className="ti ti-chevron-right text-red-400" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>   

        {/* RIGHT */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-fit">
          <RightRail />
        </aside>
      </div>
    </PageShell>
  );
}
