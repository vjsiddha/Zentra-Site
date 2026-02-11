"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import RightRail from "@/components/RightRail";
import "../globals.css";

import { loadAllLessonProgress } from "@/lib/progress";
import type { LessonProgress } from "@/lib/progress";

type ModuleData = { moduleNumber: number; lessons: LessonCardProps[] };

interface LessonCardProps {
  title: string;
  category: string;
  imageUrl: string;
  progress: number;
  href?: string;
  lessonId?: string;
}

function LessonCard({ title, category, imageUrl, progress, href }: LessonCardProps) {
  const clickable = Boolean(href);

  const card = (
    <div
      className={[
        "bg-white rounded-2xl shadow-sm overflow-hidden transition-all relative",
        clickable ? "cursor-pointer hover:shadow-md" : "cursor-default",
      ].join(" ")}
    >
      <div className="relative h-28 bg-gray-100">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-t-xl" />
      </div>

      <div className="p-3">
        <div className="inline-flex items-center px-3 py-1 bg-[#04456d]/10 rounded-lg mb-2">
          <span className="text-[#04456d] text-xs uppercase tracking-wider">{category}</span>
        </div>

        <h3 className="font-medium text-sm text-gray-900 mb-2">{title}</h3>

        <div className="h-1.5 bg-gray-200 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-full bg-[#04456d] rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );

  return clickable ? (
    <Link href={href!} className="block rounded-2xl">
      {card}
    </Link>
  ) : (
    card
  );
}

function extractStepFromHref(href?: string) {
  if (!href) return 1;
  try {
    const url = new URL(href, "http://dummy");
    return Number(url.searchParams.get("step") ?? 1);
  } catch {
    return 1;
  }
}

function makeLessonId(moduleNumber: number, href?: string) {
  const step = extractStepFromHref(href);
  return `module${moduleNumber}_step${step}`;
}
interface ModuleSectionProps {
  moduleNumber: number;
  lessons: LessonCardProps[];
}

function ModuleSection({ moduleNumber, lessons }: ModuleSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">
          Module {moduleNumber}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {lessons.map((lesson, i) => (
          <LessonCard key={`${moduleNumber}-${i}`} {...lesson} />
        ))}
      </div>
    </section>
  );
}
export default function LessonPage() {
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});

  useEffect(() => {
    (async () => {
      const map = await loadAllLessonProgress();
      setProgressMap(map);
    })();
  }, []);

  const moduleData: ModuleData[] = [
    {
      moduleNumber: 1,
      lessons: [
        { title: "First Job & Budgeting Basics", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/67df7c049ade69e93fe184c707eab2c9f6a57c06?width=515", progress: 0, href: "/module/module1?step=1" },
        { title: "First Job & Budgeting Basics", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/a9a319c689d9bc36c927dee75e4a11cef97354cd?width=515", progress: 0, href: "/module/module1?step=2" },
        { title: "First Job & Budgeting Basics", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/e052602941af3dd71bfb78096b7e228d2f43b0f5?width=515", progress: 0, href: "/module/module1?step=3" },
      ],
    },
    {
      moduleNumber: 2,
      lessons: [
        { title: "Introduction to Investing", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/04f7202d1648aac249b244dd86339d324960dfb6?width=515", progress: 0, href: "/module/module2?step=1" },
        { title: "Introduction to Investing", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/ec1139cf90eee717dc9fae0659202477cddf756f?width=515", progress: 0, href: "/module/module2?step=2" },
        { title: "Introduction to Investing", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/fe32e0c322652dccbf43ae1ef3c3c026daa5f169?width=515", progress: 0, href: "/module/module2?step=3" },
      ],
    },
    {
      moduleNumber: 3,
      lessons: [
        { title: "Crypto Foundations: Wallets, Keys & Blockchains", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/db1160cd2854f4926a6f8d6262e2929b3868ce57?width=515", progress: 0, href: "/module/module3?step=1" },
        { title: "Crypto In Action: Fees, Swaps & Risk Decisions", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/9782ac4062b1a3ab643fb90c891cfb4af595da22?width=515", progress: 0, href: "/module/module3?step=2" },
        { title: "Build Your First Crypto Allocation (Safely)", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/bf1f3af404aceee542ac36f303d0520a3847ec29?width=515", progress: 0, href: "/module/module3?step=3" },
      ],
    },
    {
      moduleNumber: 4,
      lessons: [
        { title: "Survive a Bear Market", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/682e7ba457ab32f55fd136dd9bea4b2bfc9dfef8?width=515", progress: 51, href: "/module/module4?step=1" },
        { title: "Survive a Bear Market", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/c9a519d462ae7109500af09e881bd5217c4fd2d4?width=515", progress: 51, href: "/module/module4?step=2" },
        { title: "Survive a Bear Market", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/9009d02bbca809a3239a04be5fe4bba849f160fc?width=515", progress: 51, href: "/module/module4?step=3" },
      ],
    },
    {
      moduleNumber: 5,
      lessons: [
        { title: "Passive vs Active Investing", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/3f0ff33d7122ae2536ca66f24a4feff12f41703d?width=515", progress: 51, href: "/module/module5?step=1" },
        { title: "Passive vs Active Investing", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/2bffdbaaa7066d288d28dec2d792c1460c7ac58e?width=515", progress: 51, href: "/module/module5?step=2" },
        { title: "Passive vs Active Investing", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/fd9756af4aeed573522c2e899816ec55c77b1d62?width=515", progress: 51, href: "/module/module5?step=3" },
      ],
    },
    {
      moduleNumber: 6,
      lessons: [
        { title: "Sector Investing & Trends", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/d12d578fb90d73965d8b5333badb254499486b3d?width=515", progress: 0, href: "/module/module6?step=1" },
        { title: "Sector Investing & Trends", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/d1ad6dec60e5a03521df295a24faee116424d681?width=515", progress: 0, href: "/module/module6?step=2" },
        { title: "Sector Investing & Trends", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/1bdb87f4905f1bf978f5faa9e9654d1892bfc7fa?width=515", progress: 0, href: "/module/module6?step=3" },
      ],
    },
    {
      moduleNumber: 7,
      lessons: [
        { title: "Timing the Market vs Time in the Market", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/7ecf44d31a9e2f936f3b957ce4b7f93dd95d7fa2?width=515", progress: 51, href: "/module/module7?step=1" },
        { title: "Timing the Market vs Time in the Market", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/acb725f3f86f965dd026a61661145caf37d68231?width=515", progress: 5, href: "/module/module7?step=2" },
        { title: "Timing the Market vs Time in the Market", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/2746cae0ae4cb0d6fda16603ef4887ac5ad6d641?width=515", progress: 51, href: "/module/module7?step=3" },
      ],
    },
  ];

  const mergedModuleData = useMemo(() => {
    return moduleData.map((m) => ({
      ...m,
      lessons: m.lessons.map((lesson) => {
        const lessonId = makeLessonId(m.moduleNumber, lesson.href);
        const saved = progressMap[lessonId];
        return {
          ...lesson,
          lessonId,
          progress: saved?.progressPercent ?? lesson.progress ?? 0,
          href: saved?.lastPath ?? lesson.href,
        };
      }),
    }));
  }, [moduleData, progressMap]);

  return (
    <PageShell>
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        <aside className="sticky top-8">
          <SidebarNav />
        </aside>

        <main>
          <div className="flex flex-col gap-6 pt-5">
            {mergedModuleData.map((m, i) => (
              <div key={m.moduleNumber}>
                <ModuleSection moduleNumber={m.moduleNumber} lessons={m.lessons} />
                {i < mergedModuleData.length - 1 && <div className="h-px bg-[#E9EEF3] my-6" />}
              </div>
            ))}
          </div>
        </main>

        <aside className="sticky top-8">
          <RightRail />
        </aside>
      </div>
    </PageShell>
  );
}
