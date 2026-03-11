"use client";

import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import RightRail from "@/components/RightRail";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOutUser } from "@/lib/auth";
import { updateProfile } from "firebase/auth";
import { setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import AccountDeletionModal from "@/components/AccountDeletionModal";

import {
  doc,
  collection,
  onSnapshot,
  query,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type LessonProgressDoc = {
  lessonId: string;
  currentStep?: number;
  isComplete?: boolean;
  lastVisitedAt?: Timestamp | any;
};

type UserDoc = {
  createdAt?: Timestamp | any;
  displayName?: string;
  email?: string;
  photoURL?: string;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
  streak?: number;
  termsLearned?: number;
  recentTerms?: string[];
  unlockedAvatars?: { name: string; color: string; unlocked: boolean }[];
};

// Avatar unlock schedule — unlocksAt = number of modules completed needed
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

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [dictionaryTerms, setDictionaryTerms] = useState<{id: string; term: string; mastered?: boolean}[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.displayName) setEditName(user.displayName);
  }, [user]);

  // Optimized data loading with timeout
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLessonProgress([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setLoadError(null);

    // Set a timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      if (dataLoading) {
        setLoadError("Taking longer than expected. Please refresh the page.");
        setDataLoading(false);
      }
    }, 10000); // 10 second timeout

    let unsubscribers: (() => void)[] = [];

    const setupListeners = async () => {
      try {
        // First, try to get user data directly (faster than real-time listener)
        const userRef = doc(db, "users", user.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data() as UserDoc);
          } else {
            // Create initial user document if it doesn't exist
            const initialData: UserDoc = {
              displayName: user.displayName || "",
              email: user.email || "",
              photoURL: user.photoURL || "",
              level: 1,
              xp: 0,
              xpToNextLevel: 3000,
              streak: 0,
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, initialData, { merge: true });
            setUserData(initialData);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }

        // Set up real-time listener for user data (updates only)
        const unsubUser = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              setUserData(snap.data() as UserDoc);
            }
          },
          (err) => {
            console.error("User doc listener error:", err);
            setLoadError("Failed to load profile data");
          }
        );
        unsubscribers.push(unsubUser);

        // Lesson progress listener
        const progressRef = collection(db, "users", user.uid, "lessonProgress");
        const progressQ = query(progressRef);

        const unsubProgress = onSnapshot(
          progressQ,
          (snap) => {
            const arr = snap.docs.map((d) => d.data() as LessonProgressDoc);
            setLessonProgress(arr);
            setDataLoading(false);
            clearTimeout(loadTimeout);
          },
          (err) => {
            console.error("Progress listener error:", err);
            setLessonProgress([]);
            setDataLoading(false);
            clearTimeout(loadTimeout);
          }
        );
        unsubscribers.push(unsubProgress);

        // Dictionary listener with limit (for performance)
        const dictRef = collection(db, "users", user.uid, "dictionary");
        const dictQ = query(dictRef, orderBy("savedAt", "desc"), limit(50));
        
        const unsubDict = onSnapshot(
          dictQ,
          (snap) => {
            const terms = snap.docs.map((d) => ({
              id: d.id,
              term: (d.data() as any).term ?? d.id,
              mastered: (d.data() as any).mastered ?? false,
            }));
            setDictionaryTerms(terms);
          },
          (err) => {
            console.error("Dictionary listener error:", err);
            // Don't fail the whole page if dictionary fails
          }
        );
        unsubscribers.push(unsubDict);

      } catch (error) {
        console.error("Error setting up listeners:", error);
        setLoadError("Failed to load profile. Please try refreshing.");
        setDataLoading(false);
        clearTimeout(loadTimeout);
      }
    };

    setupListeners();

    return () => {
      clearTimeout(loadTimeout);
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      alert("Display name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      // 1) Update Firebase Auth profile
      await updateProfile(user, { displayName: trimmedName });

      // 2) Update Firestore user profile doc
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          displayName: trimmedName,
          email: user.email ?? "",
          photoURL: user.photoURL ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      alert("Profile updated successfully!");
      setShowEditProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const totalModules = 8;

  const modulesCompleted = useMemo(() => {
    return lessonProgress.filter(
      (m) => m.isComplete === true
    ).length;
  }, [lessonProgress]);

  const module1Step = useMemo(() => {
    const m1 = lessonProgress.find((p) => p.lessonId === "module1");
    return m1?.currentStep ?? 1;
  }, [lessonProgress]);

  const joinDate = useMemo(() => {
    const ts = userData?.createdAt;
    if (ts?.toDate) {
      return ts.toDate().toLocaleString(undefined, { month: "long", year: "numeric" });
    }
    return "—";
  }, [userData]);

  const moduleProgressList = useMemo(() => {
    const ids = Array.from({ length: totalModules }, (_, i) => `module${i + 1}`);
    return ids.map((id) => {
      const doc = lessonProgress.find((p) => p.lessonId === id);
      const step = doc?.currentStep ?? 1;
      const completed = doc?.isComplete === true;
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

  // Avatar unlock logic — based on modules completed
  const avatarsWithStatus = AVATARS.map((a) => ({
    ...a,
    unlocked: modulesCompleted >= a.unlocksAt,
  }));

  const userLevel = userData?.level ?? 1;
  const userXP = userData?.xp ?? 0;
  const xpToNextLevel = userData?.xpToNextLevel ?? 3000;
  const streak = userData?.streak ?? 0;

  const unlockedAvatars =
    userData?.unlockedAvatars ??
    [
      { name: "Spark", color: "bg-orange-400", unlocked: true },
      { name: "Wave", color: "bg-blue-400", unlocked: true },
      { name: "Bloom", color: "bg-purple-400", unlocked: true },
      { name: "Mint", color: "bg-green-400", unlocked: true },
    ];

  // Loading state
  if (loading || !user) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Error state
  if (loadError) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <>
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
                      <span>{(userData?.displayName || user.displayName || user.email || "U")[0].toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">
                      {userData?.displayName || user.displayName || "Student"}
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
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
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

                      <div className="space-y-4">
                        {moduleProgressList.map((m) => (
                          <div key={m.id}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {m.title}
                              </span>
                              <span className="text-sm text-gray-500">
                                {m.completed ? "Complete!" : `Step ${m.currentStep}/3`}
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

              {/* Unlocked Avatars */}
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

              {/* Vocab & Knowledge */}
              <section>
                <h3 className="text-lg font-semibold uppercase tracking-wider text-gray-900 mb-6">
                  Vocabulary & Knowledge
                </h3>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-8">
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Terms Saved</div>
                        <div className="text-4xl font-bold text-blue-600">{dictionaryTerms.length}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Mastered</div>
                        <div className="text-4xl font-bold text-emerald-600">
                          {dictionaryTerms.filter((t) => t.mastered).length}
                        </div>
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

                  {dictionaryTerms.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Save terms from lessons to build your dictionary.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dictionaryTerms.slice(0, 20).map((term) => (
                        <span
                          key={term.id}
                          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${
                            term.mastered
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {term.mastered && <span>✓</span>}
                          {term.term}
                        </span>
                      ))}
                      {dictionaryTerms.length > 20 && (
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                          +{dictionaryTerms.length - 20} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Account Settings */}
              <section>
                <h3 className="text-lg font-semibold uppercase tracking-wider text-gray-900 mb-6">
                  Account Settings
                </h3>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="space-y-3">
                    {/* Personal Information */}
                    <button
                      onClick={() => setShowEditProfile(!showEditProfile)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <i className="ti ti-user-edit text-gray-600 text-xl" />
                        <span className="font-medium text-gray-700">Personal Information</span>
                      </div>
                      <i className={`ti ti-chevron-${showEditProfile ? 'down' : 'right'} text-gray-400`} />
                    </button>

                    {/* Expandable Edit Form */}
                    {showEditProfile && (
                      <div className="px-4 py-4 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Enter your name"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={saving}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowEditProfile(false);
                                setEditName(user?.displayName || '');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Sign Out */}
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

                    {/* Delete Account */}
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-red-50 transition text-left"
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

      {/* Account Deletion Modal - OUTSIDE PageShell */}
      <AccountDeletionModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
      />
    </>
  );
}