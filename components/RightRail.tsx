"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, limit, orderBy, query, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";

type DictTerm = { id: string; term?: string };
type Avatar = { name: string; color: string; unlocked: boolean };

export default function RightRail() {
  const router = useRouter();
  const { user } = useAuth();

  const [terms, setTerms] = useState<DictTerm[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);

  // Live avatar listener from user doc
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAvatars(data.unlockedAvatars ?? []);
      }
    });
    return () => unsub();
  }, [user]);

  // Load recent vocab terms
  useEffect(() => {
    let cancelled = false;
    async function loadDictionary() {
      if (!user) return;
      setLoadingTerms(true);
      try {
        const q = query(
          collection(db, "users", user.uid, "dictionary"),
          orderBy("savedAt", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        setTerms(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch {
        if (!cancelled) setTerms([]);
      } finally {
        if (!cancelled) setLoadingTerms(false);
      }
    }
    loadDictionary();
    return () => { cancelled = true; };
  }, [user]);

  // Only show unlocked avatars in the rail (max 4)
  const unlockedAvatars = avatars.filter((a) => a.unlocked).slice(0, 4);

  const avatarDotColors: Record<string, string> = {
    "bg-orange-400": "text-orange-500",
    "bg-blue-400": "text-blue-500",
    "bg-purple-400": "text-purple-500",
    "bg-green-400": "text-green-500",
    "bg-pink-400": "text-pink-500",
    "bg-yellow-400": "text-yellow-500",
    "bg-red-400": "text-red-500",
    "bg-indigo-400": "text-indigo-500",
  };

  const avatarBgColors: Record<string, string> = {
    "bg-orange-400": "bg-orange-100",
    "bg-blue-400": "bg-blue-100",
    "bg-purple-400": "bg-purple-100",
    "bg-green-400": "bg-green-100",
    "bg-pink-400": "bg-pink-100",
    "bg-yellow-400": "bg-yellow-100",
    "bg-red-400": "bg-red-100",
    "bg-indigo-400": "bg-indigo-100",
  };

  return (
    <div className="w-full bg-[#E8F3FA] rounded-2xl p-6 space-y-4">
      {/* Live Unlocked Avatars */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Unlocked Avatars</h2>
        <div className="flex gap-3 items-center flex-wrap">
          {unlockedAvatars.length === 0 ? (
            <p className="text-sm text-gray-500">Complete lessons to unlock avatars!</p>
          ) : (
            unlockedAvatars.map((avatar) => (
              <div
                key={avatar.name}
                title={avatar.name}
                className={`w-14 h-14 rounded-full ${avatarBgColors[avatar.color] ?? "bg-gray-100"} flex items-center justify-center`}
              >
                <span className={`text-2xl font-bold ${avatarDotColors[avatar.color] ?? "text-gray-500"}`}>✦</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Your Vocab */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 text-center">Your Vocab</h2>
        <div className="space-y-3">
          {loadingTerms ? (
            <div className="text-sm text-gray-500 text-center py-6">Loading...</div>
          ) : terms.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">
              Save definitions to build your dictionary.
            </div>
          ) : (
            terms.map((t) => (
              <button
                key={t.id}
                onClick={() => router.push("/dictionary")}
                className="w-full h-11 bg-white rounded-full flex items-center justify-center font-semibold text-sm text-gray-900 shadow-sm hover:opacity-90 transition-all"
              >
                {t.term ?? t.id}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Open Dictionary */}
      <div className="pt-4">
        <button
          onClick={() => router.push("/dictionary")}
          className="w-full px-5 py-3 bg-[#0E5B87] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <span>Open Dictionary</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.5 3.5C6.5 3.22386 6.72386 3 7 3H13C13.2761 3 13.5 3.22386 13.5 3.5V9C13.5 9.27614 13.2761 9.5 13 9.5C12.7239 9.5 12.5 9.27614 12.5 9V4.70711L3.85355 13.3536C3.65829 13.5488 3.34171 13.5488 3.14645 13.3536C2.95118 13.1583 2.95118 12.8417 3.14645 12.6464L11.7929 4H7C6.72386 4 6.5 3.77614 6.5 3.5Z" fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  );
}