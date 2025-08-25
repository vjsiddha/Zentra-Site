"use client";

import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import HeroCard from "@/components/HeroCard";
import LessonCard from "@/components/LessonCard";
import AskBennyCard from "@/components/AskBennyCard";
import SimulatorCard from "@/components/SimulatorCard";
import RightRail from "@/components/RightRail";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOutUser } from "@/lib/auth";

export default function Dashboard() {
  // ---- Auth guard ----
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  // Optionally show nothing while deciding
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
      {/* Desktop-only 3-column grid */}
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT: Sidebar (fixed 240px) */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-[calc(100vh-64px)]">
          <SidebarNav />
        </aside>

        {/* CENTER: Main (flexible) with subtle hairline separators */}
        <main
          className="
            relative w-full min-w-0
            before:absolute before:top-0 before:bottom-0 before:left-[-12px] before:w-px before:bg-[#E9EEF3]
            after:absolute  after:top-0  after:bottom-0  after:right-[-12px]  after:w-px  after:bg-[#E9EEF3]
          "
        >
          {/* Top actions row (Sign out, user email) */}
          <div className="mb-2 flex items-center justify-end gap-3 text-sm text-gray-600">
            <span className="hidden md:block truncate max-w-[240px]">
              {user?.email}
            </span>
            <button
              onClick={signOutUser}
              className="rounded-full bg-gray-100 px-4 py-2 font-medium hover:bg-gray-200 transition"
            >
              Sign out
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {/* Hero */}
            <section className="pt-0">
              <HeroCard />
            </section>

            {/* soft section divider */}
            <div className="h-px bg-[#E9EEF3]" />

            {/* Favourites */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-900">
                  Go Back To Your Favourites
                </h2>
                <div className="flex gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200">
                    <i className="ti ti-chevron-left text-sm text-gray-600" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200">
                    <i className="ti ti-chevron-right text-sm text-gray-600" />
                  </button>
                </div>
              </div>

              {/* 3 equal cards */}
              <div className="grid grid-cols-3 gap-6">
                <LessonCard
                  title="Lesson 1: Your Savings Matter"
                  category="SAVINGS"
                  imageUrl="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=280&h=160&fit=crop"
                  progress={75}
                />
                <LessonCard
                  title="Lesson 7: Count Your Pennies"
                  category="SAVINGS"
                  imageUrl="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=280&h=160&fit=crop"
                  progress={50}
                />
                <LessonCard
                  title="Lesson 4: Meme Or Money-Maker?"
                  category="STOCKS"
                  imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop"
                  progress={65}
                />
              </div>
            </section>

            {/* soft section divider */}
            <div className="h-px bg-[#E9EEF3]" />

            {/* Bottom row: Ask Benny + Simulator */}
            <section>
              <div className="grid grid-cols-2 gap-6">
                <AskBennyCard />
                <SimulatorCard />
              </div>
            </section>
          </div>
        </main>

        {/* RIGHT: Rail (fixed 300px) */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-fit">
          <RightRail />
        </aside>
      </div>
    </PageShell>
  );
}
