"use client";

import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import HeroCard from "@/components/HeroCard";
import LessonCard from "@/components/LessonCard";
import AskBennyCard from "@/components/AskBennyCard";
import SimulatorCard from "@/components/SimulatorCard";
import RightRail from "@/components/RightRail";

import { useAuth } from "@/components/providers/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOutUser } from "@/lib/auth";

import { loadAllLessonProgress } from "@/lib/progress";
import type { LessonProgress } from "@/lib/progress";

type FlatLesson = {
  lessonId: string;
  title: string;
  category: string;
  imageUrl: string;
  href: string;
};

export default function Dashboard() {
  // ---- Auth guard ----
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  const { favoriteIds } = useFavorites(user?.uid);

  // Load progress so favorite cards show real progress (optional but nice)
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  useEffect(() => {
    (async () => {
      const map = await loadAllLessonProgress();
      setProgressMap(map);
    })();
  }, []);

  // Source of truth for lesson metadata (match module/page.tsx lessonIds)
  const ALL_LESSONS: FlatLesson[] = useMemo(
    () => [
      // Module 1
      { lessonId: "module1_step1", title: "First Job & Budgeting Basics", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/67df7c049ade69e93fe184c707eab2c9f6a57c06?width=515", href: "/module/module1?step=1" },
      { lessonId: "module1_step2", title: "First Job & Budgeting Basics", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/a9a319c689d9bc36c927dee75e4a11cef97354cd?width=515", href: "/module/module1?step=2" },
      { lessonId: "module1_step3", title: "First Job & Budgeting Basics", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/e052602941af3dd71bfb78096b7e228d2f43b0f5?width=515", href: "/module/module1?step=3" },

      // Module 2
      { lessonId: "module2_step1", title: "Introduction to Investing", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/04f7202d1648aac249b244dd86339d324960dfb6?width=515", href: "/module/module2?step=1" },
      { lessonId: "module2_step2", title: "Introduction to Investing", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/ec1139cf90eee717dc9fae0659202477cddf756f?width=515", href: "/module/module2?step=2" },
      { lessonId: "module2_step3", title: "Introduction to Investing", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/fe32e0c322652dccbf43ae1ef3c3c026daa5f169?width=515", href: "/module/module2?step=3" },

      // Module 3
      { lessonId: "module3_step1", title: "Crypto Foundations: Wallets, Keys & Blockchains", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/db1160cd2854f4926a6f8d6262e2929b3868ce57?width=515", href: "/module/module3?step=1" },
      { lessonId: "module3_step2", title: "Crypto In Action: Fees, Swaps & Risk Decisions", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/9782ac4062b1a3ab643fb90c891cfb4af595da22?width=515", href: "/module/module3?step=2" },
      { lessonId: "module3_step3", title: "Build Your First Crypto Allocation (Safely)", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/bf1f3af404aceee542ac36f303d0520a3847ec29?width=515", href: "/module/module3?step=3" },

      // Module 4
      { lessonId: "module4_step1", title: "Survive a Bear Market", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/682e7ba457ab32f55fd136dd9bea4b2bfc9dfef8?width=515", href: "/module/module4?step=1" },
      { lessonId: "module4_step2", title: "Survive a Bear Market", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/c9a519d462ae7109500af09e881bd5217c4fd2d4?width=515", href: "/module/module4?step=2" },
      { lessonId: "module4_step3", title: "Survive a Bear Market", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/9009d02bbca809a3239a04be5fe4bba849f160fc?width=515", href: "/module/module4?step=3" },

      // Module 5
      { lessonId: "module5_step1", title: "Passive vs Active Investing", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/3f0ff33d7122ae2536ca66f24a4feff12f41703d?width=515", href: "/module/module5?step=1" },
      { lessonId: "module5_step2", title: "Passive vs Active Investing", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/2bffdbaaa7066d288d28dec2d792c1460c7ac58e?width=515", href: "/module/module5?step=2" },
      { lessonId: "module5_step3", title: "Passive vs Active Investing", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/fd9756af4aeed573522c2e899816ec55c77b1d62?width=515", href: "/module/module5?step=3" },

      // Module 6
      { lessonId: "module6_step1", title: "Sector Investing & Trends", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/d12d578fb90d73965d8b5333badb254499486b3d?width=515", href: "/module/module6?step=1" },
      { lessonId: "module6_step2", title: "Sector Investing & Trends", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/d1ad6dec60e5a03521df295a24faee116424d681?width=515", href: "/module/module6?step=2" },
      { lessonId: "module6_step3", title: "Sector Investing & Trends", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/1bdb87f4905f1bf978f5faa9e9654d1892bfc7fa?width=515", href: "/module/module6?step=3" },

      // Module 7
      { lessonId: "module7_step1", title: "Timing the Market vs Time in the Market", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/7ecf44d31a9e2f936f3b957ce4b7f93dd95d7fa2?width=515", href: "/module/module7?step=1" },
      { lessonId: "module7_step2", title: "Timing the Market vs Time in the Market", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/acb725f3f86f965dd026a61661145caf37d68231?width=515", href: "/module/module7?step=2" },
      { lessonId: "module7_step3", title: "Timing the Market vs Time in the Market", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/2746cae0ae4cb0d6fda16603ef4887ac5ad6d641?width=515", href: "/module/module7?step=3" },
    ],
    []
  );

  const favoriteLessons = useMemo(() => {
    // keep order in sync with "addedAt desc" from Firestore listener
    const byId = new Map(ALL_LESSONS.map((l) => [l.lessonId, l]));
    return favoriteIds.map((id) => byId.get(id)).filter(Boolean) as FlatLesson[];
  }, [ALL_LESSONS, favoriteIds]);

  // --- Carousel logic: 3 visible, scroll by 1 card per click ---
  const railRef = useRef<HTMLDivElement | null>(null);

  function scrollByOneCard(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>("[data-fav-card='true']");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;

    // Tailwind gap-6 => 24px, but read it from computed style to be safe
    const styles = window.getComputedStyle(rail);
    const gap = parseFloat(styles.columnGap || styles.gap || "24") || 24;

    rail.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  }

  if (loading || !user) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-24 text-gray-500">Loading…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        <aside className="w-full flex-shrink-0 sticky top-8 h-[calc(100vh-64px)]">
          <SidebarNav onProfileClick={() => router.push("/profile")} />
        </aside>

        <main
          className="
            relative w-full min-w-0
            before:absolute before:top-0 before:bottom-0 before:left-[-12px] before:w-px before:bg-[#E9EEF3]
            after:absolute  after:top-0  after:bottom-0  after:right-[-12px]  after:w-px  after:bg-[#E9EEF3]
          "
        >
          <div className="mb-2 flex items-center justify-end gap-3 text-sm text-gray-600">
            <span className="hidden md:block truncate max-w-[240px]">{user?.email}</span>

            <button
              onClick={() => router.push("/?preview=true")}
              className="rounded-full bg-[#0B5E8E] px-4 py-2 font-medium text-white hover:bg-[#094a6d] transition"
            >
              View Landing
            </button>

            <button
              onClick={signOutUser}
              className="rounded-full bg-gray-100 px-4 py-2 font-medium hover:bg-gray-200 transition"
            >
              Sign out
            </button>
          </div>

          <div className="flex flex-col gap-8">
            <section className="pt-0">
              <HeroCard />
            </section>

            <div className="h-px bg-[#E9EEF3]" />

            {/* Favourites */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-900">
                  Go Back To Your Favourites
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => scrollByOneCard(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
                    aria-label="Scroll favourites left"
                  >
                    <i className="ti ti-chevron-left text-sm text-gray-600" />
                  </button>

                  <button
                    onClick={() => scrollByOneCard(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
                    aria-label="Scroll favourites right"
                  >
                    <i className="ti ti-chevron-right text-sm text-gray-600" />
                  </button>
                </div>
              </div>

              {favoriteLessons.length === 0 ? (
                <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
                  Star lessons to see them here.
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div
                    ref={railRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
                  >
                    {favoriteLessons.map((l) => {
                      const saved = progressMap[l.lessonId];
                      const progress = saved?.progressPercent ?? 0;
                      const href = saved?.lastPath ?? l.href;

                      return (
                        <div
                          key={l.lessonId}
                          data-fav-card="true"
                          className="shrink-0 basis-[calc((100%-48px)/3)]"
                        >
                          <LessonCard
                            lessonId={l.lessonId}
                            uid={user?.uid}
                            isFavorited={favoriteIds.includes(l.lessonId)}
                            title={l.title}
                            category={l.category}
                            imageUrl={l.imageUrl}
                            progress={progress}
                            href={href}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <div className="h-px bg-[#E9EEF3]" />

            <section>
              <div className="grid grid-cols-2 gap-6">
                <AskBennyCard />
                <SimulatorCard />
              </div>
            </section>
          </div>
        </main>

        <aside className="w-full flex-shrink-0 sticky top-8 h-fit">
          <RightRail />
        </aside>
      </div>
    </PageShell>
  );
}