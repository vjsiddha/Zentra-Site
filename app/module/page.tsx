"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import RightRail from "@/components/RightRail";
import LessonCard from "@/components/LessonCard";
import "../globals.css";

import { useAuth } from "@/components/providers/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";

import { loadAllLessonProgress } from "@/lib/progress";
import type { LessonProgress } from "@/lib/progress";

// ─── Lesson Index (keyword search) ───────────────────────────────────────────

type LessonIndexEntry = {
  lessonId: string;
  moduleNumber: number;
  step: number;
  title: string;
  category: string;
  href: string;
  keywords: string[];
};

const LESSON_INDEX: LessonIndexEntry[] = [
  // MODULE 1
  {
    lessonId: "module1_step1", moduleNumber: 1, step: 1,
    title: "First Job & Budgeting Basics", category: "Definitions",
    href: "/module/module1?step=1",
    keywords: [
      "net pay", "take-home pay", "paycheck", "salary", "taxes",
      "fixed expenses", "rent", "variable expenses", "groceries",
      "savings", "investing", "emergency fund", "cash flow",
      "budget stability", "50/30/20 rule", "needs", "wants",
      "gross income", "net worth", "liquidity", "inflation",
      "certificate of deposit", "CD", "credit card", "debt",
      "assets", "liabilities", "spending", "income", "budgeting",
    ],
  },
  {
    lessonId: "module1_step2", moduleNumber: 1, step: 2,
    title: "First Job & Budgeting Basics", category: "Interactive Games",
    href: "/module/module1?step=2",
    keywords: [
      "budgeting", "spending", "income", "net pay", "fixed expenses",
      "variable expenses", "savings", "50/30/20 rule", "cash flow",
    ],
  },
  {
    lessonId: "module1_step3", moduleNumber: 1, step: 3,
    title: "First Job & Budgeting Basics", category: "Applying Your Knowledge",
    href: "/module/module1?step=3",
    keywords: [
      "budgeting", "50/30/20 rule", "net pay", "savings", "expenses",
      "cash flow", "emergency fund", "budget stability",
    ],
  },

  // MODULE 2
  {
    lessonId: "module2_step1", moduleNumber: 2, step: 1,
    title: "Introduction to Investing", category: "Definitions",
    href: "/module/module2?step=1",
    keywords: [
      "portfolio", "stocks", "ETF", "mutual fund", "risk", "return",
      "time horizon", "diversification", "fees", "MER", "fee drag",
      "concentration risk", "index fund", "active management",
      "passive investing", "volatility", "assets", "weights",
      "correlation", "broad market", "sector ETF", "compound interest",
      "outperformance", "benchmark", "short term", "long term",
      "expense ratio", "rebalancing", "investing",
    ],
  },
  {
    lessonId: "module2_step2", moduleNumber: 2, step: 2,
    title: "Introduction to Investing", category: "Interactive Games",
    href: "/module/module2?step=2",
    keywords: ["investing", "portfolio", "stocks", "ETF", "risk", "return", "fees", "diversification", "time horizon"],
  },
  {
    lessonId: "module2_step3", moduleNumber: 2, step: 3,
    title: "Introduction to Investing", category: "Applying Your Knowledge",
    href: "/module/module2?step=3",
    keywords: ["investing", "portfolio", "diversification", "risk", "fees", "ETF", "mutual fund", "time horizon"],
  },

  // MODULE 3
  {
    lessonId: "module3_step1", moduleNumber: 3, step: 1,
    title: "Crypto Foundations: Wallets, Keys & Blockchains", category: "Definitions",
    href: "/module/module3?step=1",
    keywords: [
      "blockchain", "crypto", "cryptocurrency", "bitcoin", "ethereum",
      "wallet", "private key", "public key", "hardware wallet", "cold storage",
      "gas fees", "transaction fees", "volatility", "FOMO", "fear of missing out",
      "scam", "security", "decentralized", "exchange", "hype", "panic selling",
    ],
  },
  {
    lessonId: "module3_step2", moduleNumber: 3, step: 2,
    title: "Crypto In Action: Fees, Swaps & Risk Decisions", category: "Interactive Games",
    href: "/module/module3?step=2",
    keywords: ["crypto", "gas fees", "swap", "exchange", "transaction", "risk", "volatility", "FOMO", "wallet"],
  },
  {
    lessonId: "module3_step3", moduleNumber: 3, step: 3,
    title: "Build Your First Crypto Allocation (Safely)", category: "Applying Your Knowledge",
    href: "/module/module3?step=3",
    keywords: ["crypto", "allocation", "portfolio", "risk management", "diversification", "volatility", "wallet"],
  },

  // MODULE 4
  {
    lessonId: "module4_step1", moduleNumber: 4, step: 1,
    title: "Survive a Bear Market", category: "Definitions",
    href: "/module/module4?step=1",
    keywords: [
      "bear market", "bull market", "market cycles", "accumulation", "markup",
      "distribution", "markdown", "dollar-cost averaging", "DCA",
      "emotional investing", "fear", "greed", "FOMO", "panic selling",
      "volatility", "portfolio rebalancing", "time in the market",
      "timing the market", "recovery", "correction", "S&P 500",
      "20% drop", "market crash", "recession", "downturn",
    ],
  },
  {
    lessonId: "module4_step2", moduleNumber: 4, step: 2,
    title: "Survive a Bear Market", category: "Interactive Games",
    href: "/module/module4?step=2",
    keywords: ["bear market", "recession", "strategy", "holding", "panic selling", "DCA", "rebalancing"],
  },
  {
    lessonId: "module4_step3", moduleNumber: 4, step: 3,
    title: "Survive a Bear Market", category: "Applying Your Knowledge",
    href: "/module/module4?step=3",
    keywords: ["bear market", "recession", "rebalancing", "long term investing", "DCA", "emotional investing"],
  },

  // MODULE 5
  {
    lessonId: "module5_step1", moduleNumber: 5, step: 1,
    title: "Passive vs Active Investing", category: "Definitions",
    href: "/module/module5?step=1",
    keywords: [
      "passive investing", "active investing", "index fund", "mutual fund",
      "MER", "management expense ratio", "fees", "fee drag", "compound fees",
      "beating the market", "benchmark", "S&P 500", "SPIVA", "92%",
      "outperformance", "buy and hold", "stock picking", "diversification",
    ],
  },
  {
    lessonId: "module5_step2", moduleNumber: 5, step: 2,
    title: "Passive vs Active Investing", category: "Interactive Games",
    href: "/module/module5?step=2",
    keywords: ["passive investing", "active investing", "index fund", "MER", "fees", "returns"],
  },
  {
    lessonId: "module5_step3", moduleNumber: 5, step: 3,
    title: "Passive vs Active Investing", category: "Applying Your Knowledge",
    href: "/module/module5?step=3",
    keywords: ["passive investing", "active investing", "strategy", "long term", "fees", "index fund"],
  },

  // MODULE 6
  {
    lessonId: "module6_step1", moduleNumber: 6, step: 1,
    title: "Sector Investing & Trends", category: "Definitions",
    href: "/module/module6?step=1",
    keywords: [
      "sector ETF", "thematic investing", "cyclical sectors", "defensive sectors",
      "sector rotation", "consumer discretionary", "consumer staples",
      "utilities", "healthcare", "technology", "industrials", "energy",
      "concentration risk", "hype", "priced in", "economic cycle",
      "recession", "diversification", "trends", "AI", "clean energy", "robotics",
    ],
  },
  {
    lessonId: "module6_step2", moduleNumber: 6, step: 2,
    title: "Sector Investing & Trends", category: "Interactive Games",
    href: "/module/module6?step=2",
    keywords: ["sector", "trends", "rotation", "market cycle", "cyclical", "defensive"],
  },
  {
    lessonId: "module6_step3", moduleNumber: 6, step: 3,
    title: "Sector Investing & Trends", category: "Applying Your Knowledge",
    href: "/module/module6?step=3",
    keywords: ["sector", "trends", "portfolio", "diversification", "allocation", "cyclical", "defensive"],
  },

  // MODULE 7
  {
    lessonId: "module7_step1", moduleNumber: 7, step: 1,
    title: "Timing the Market vs Time in the Market", category: "Definitions",
    href: "/module/module7?step=1",
    keywords: [
      "best days gap", "time in the market", "timing the market",
      "two-decision requirement", "volatility", "permanent loss",
      "cost of hesitation", "compounding", "market cycle neutrality",
      "buy and hold", "dollar-cost averaging", "DCA", "recovery pattern",
      "panic selling", "bear market", "bull market", "long term investing",
      "missing best days", "50% lower", "patience", "early investing",
    ],
  },
  {
    lessonId: "module7_step2", moduleNumber: 7, step: 2,
    title: "Timing the Market vs Time in the Market", category: "Interactive Games",
    href: "/module/module7?step=2",
    keywords: ["market timing", "DCA", "strategy", "consistency", "buy and hold", "volatility"],
  },
  {
    lessonId: "module7_step3", moduleNumber: 7, step: 3,
    title: "Timing the Market vs Time in the Market", category: "Applying Your Knowledge",
    href: "/module/module7?step=3",
    keywords: ["market timing", "DCA", "long term investing", "patience", "buy and hold", "compounding"],
  },

  // MODULE 8
  {
    lessonId: "module8_step1", moduleNumber: 8, step: 1,
    title: "Passive vs Active Investing (Deep Dive)", category: "Definitions",
    href: "/module/module8?step=1",
    keywords: [
      "passive investing", "active investing", "index fund", "mutual fund",
      "MER", "management expense ratio", "fee drag", "compound fees",
      "beating the market", "diversification", "S&P 500", "SPIVA",
      "92%", "outperformance", "buy and hold", "stock picking",
    ],
  },
  {
    lessonId: "module8_step2", moduleNumber: 8, step: 2,
    title: "Passive vs Active Investing (Deep Dive)", category: "Interactive Games",
    href: "/module/module8?step=2",
    keywords: ["passive investing", "active investing", "MER", "index fund", "fees", "returns"],
  },
  {
    lessonId: "module8_step3", moduleNumber: 8, step: 3,
    title: "Passive vs Active Investing (Deep Dive)", category: "Applying Your Knowledge",
    href: "/module/module8?step=3",
    keywords: ["passive investing", "active investing", "MER", "fees", "index fund", "long term"],
  },

  // MODULE 9
  {
    lessonId: "module9_step1", moduleNumber: 9, step: 1,
    title: "Economic Indicators & Market Signals", category: "Definitions",
    href: "/module/module9?step=1",
    keywords: [
      "inflation", "interest rates", "GDP", "gross domestic product",
      "unemployment", "economic indicators", "market signals",
      "central bank", "purchasing power", "borrowing costs",
      "consumer spending", "economic growth", "rate hike", "rate cut",
      "expectations", "market reaction", "labor market", "employment report",
    ],
  },
  {
    lessonId: "module9_step2", moduleNumber: 9, step: 2,
    title: "Economic Indicators & Market Signals", category: "Interactive Games",
    href: "/module/module9?step=2",
    keywords: ["inflation", "interest rates", "GDP", "unemployment", "economic indicators", "market reaction"],
  },
  {
    lessonId: "module9_step3", moduleNumber: 9, step: 3,
    title: "Economic Indicators & Market Signals", category: "Applying Your Knowledge",
    href: "/module/module9?step=3",
    keywords: ["inflation", "GDP", "interest rates", "unemployment", "economic indicators"],
  },

  // MODULE 10
  {
    lessonId: "module10_step1", moduleNumber: 10, step: 1,
    title: "Behavioral Biases in Investing", category: "Definitions",
    href: "/module/module10?step=1",
    keywords: [
      "behavioral bias", "loss aversion", "overconfidence", "herd mentality",
      "long-term mindset", "panic selling", "fear", "greed", "FOMO",
      "emotional investing", "irrational decisions", "crowd behavior",
      "discipline", "patience", "process", "psychology", "investor behavior",
      "selling at a loss", "buying high", "selling low", "market hype",
      "rational thinking", "cognitive bias", "emotional control",
    ],
  },
  {
    lessonId: "module10_step2", moduleNumber: 10, step: 2,
    title: "Behavioral Biases in Investing", category: "Interactive Games",
    href: "/module/module10?step=2",
    keywords: ["behavioral bias", "loss aversion", "overconfidence", "herd mentality", "emotional investing"],
  },
  {
    lessonId: "module10_step3", moduleNumber: 10, step: 3,
    title: "Behavioral Biases in Investing", category: "Applying Your Knowledge",
    href: "/module/module10?step=3",
    keywords: ["behavioral bias", "loss aversion", "overconfidence", "herd mentality", "long-term mindset"],
  },
];

function searchLessons(query: string): LessonIndexEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return LESSON_INDEX.filter(
    (entry) =>
      entry.title.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q) ||
      entry.keywords.some((k) => k.toLowerCase().includes(q)) ||
      `module ${entry.moduleNumber}`.includes(q)
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleData = {
  moduleNumber: number;
  lessons: LessonCardProps[];
};

interface LessonCardProps {
  lessonId: string;
  title: string;
  category: string;
  imageUrl: string;
  progress: number;
  href?: string;
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
  uid?: string | null;
  favoriteIds: string[];
}

function ModuleSection({ moduleNumber, lessons, uid, favoriteIds }: ModuleSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">Module {moduleNumber}</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.lessonId}
            lessonId={lesson.lessonId}
            uid={uid}
            isFavorited={favoriteIds.includes(lesson.lessonId)}
            title={lesson.title}
            category={lesson.category}
            imageUrl={lesson.imageUrl}
            progress={lesson.progress}
            href={lesson.href}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LessonPage() {
  const { user } = useAuth();
  const { favoriteIds } = useFavorites(user?.uid);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [searchQuery, setSearchQuery] = useState("");

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
        { lessonId: "module1_step1", title: "First Job & Budgeting Basics", category: "Definitions", imageUrl: "/M1L1.png",  progress: 0, href: "/module/module1?step=1" },
        { lessonId: "module1_step2", title: "First Job & Budgeting Basics", category: "Interactive Games", imageUrl: "/M1L2.png", progress: 0, href: "/module/module1?step=2" },
        { lessonId: "module1_step3", title: "First Job & Budgeting Basics", category: "Applying Your Knowledge", imageUrl: "/M1L3.png", progress: 0, href: "/module/module1?step=3" },
      ],
    },
    {
      moduleNumber: 2,
      lessons: [
        { lessonId: "module2_step1", title: "Introduction to Investing", category: "Definitions", imageUrl: "/M2L1.png", progress: 0, href: "/module/module2?step=1" },
        { lessonId: "module2_step2", title: "Introduction to Investing", category: "Interactive Games", imageUrl: "/M2L2.png", progress: 0, href: "/module/module2?step=2" },
        { lessonId: "module2_step3", title: "Introduction to Investing", category: "Applying Your Knowledge", imageUrl: "/M2L3.png", progress: 0, href: "/module/module2?step=3" },
      ],
    },
    {
      moduleNumber: 3,
      lessons: [
        { lessonId: "module3_step1", title: "Crypto Foundations: Wallets, Keys & Blockchains", category: "Definitions", imageUrl: "/M3L1.png", progress: 0, href: "/module/module3?step=1" },
        { lessonId: "module3_step2", title: "Crypto In Action: Fees, Swaps & Risk Decisions", category: "Interactive Games", imageUrl: "/M3L2.png", progress: 0, href: "/module/module3?step=2" },
        { lessonId: "module3_step3", title: "Build Your First Crypto Allocation (Safely)", category: "Applying Your Knowledge", imageUrl: "/M3L2.png", progress: 0, href: "/module/module3?step=3" },
      ],
    },
    {
      moduleNumber: 4,
      lessons: [
        { lessonId: "module4_step1", title: "Survive a Bear Market", category: "Definitions", imageUrl: "/M4L1.png", progress: 0, href: "/module/module4?step=1" },
        { lessonId: "module4_step2", title: "Survive a Bear Market", category: "Interactive Games", imageUrl: "/M4L2.png", progress: 0, href: "/module/module4?step=2" },
        { lessonId: "module4_step3", title: "Survive a Bear Market", category: "Applying Your Knowledge", imageUrl: "/M4L3.png", progress: 0, href: "/module/module4?step=3" },
      ],
    },
    {
      moduleNumber: 5,
      lessons: [
        { lessonId: "module5_step1", title: "Passive vs Active Investing", category: "Definitions", imageUrl: "/M5L1.png", progress: 0, href: "/module/module5?step=1" },
        { lessonId: "module5_step2", title: "Passive vs Active Investing", category: "Interactive Games", imageUrl: "/M5L2.png", progress: 0, href: "/module/module5?step=2" },
        { lessonId: "module5_step3", title: "Passive vs Active Investing", category: "Applying Your Knowledge", imageUrl: "/M5L3.png", progress: 0, href: "/module/module5?step=3" },
      ],
    },
    {
      moduleNumber: 6,
      lessons: [
        { lessonId: "module6_step1", title: "Sector Investing & Trends", category: "Definitions", imageUrl: "/M6L1.png", progress: 0, href: "/module/module6?step=1" },
        { lessonId: "module6_step2", title: "Sector Investing & Trends", category: "Interactive Games", imageUrl: "/M6L2.png", progress: 0, href: "/module/module6?step=2" },
        { lessonId: "module6_step3", title: "Sector Investing & Trends", category: "Applying Your Knowledge", imageUrl: "/M6L3.png", progress: 0, href: "/module/module6?step=3" },
      ],
    },
    {
      moduleNumber: 7,
      lessons: [
        { lessonId: "module7_step1", title: "Timing the Market vs Time in the Market", category: "Definitions", imageUrl: "/M7L1.png", progress: 0, href: "/module/module7?step=1" },
        { lessonId: "module7_step2", title: "Timing the Market vs Time in the Market", category: "Interactive Games", imageUrl: "/M7L2.png", progress: 0, href: "/module/module7?step=2" },
        { lessonId: "module7_step3", title: "Timing the Market vs Time in the Market", category: "Applying Your Knowledge", imageUrl: "/M7L3.png", progress: 0, href: "/module/module7?step=3" },
      ],
    },
    {
      moduleNumber: 8,
      lessons: [
        { lessonId: "module8_step1", title: "Passive vs Active Investing (Deep Dive)", category: "Definitions", imageUrl: "/M8L1.png", progress: 0, href: "/module/module8?step=1" },
        { lessonId: "module8_step2", title: "Passive vs Active Investing (Deep Dive)", category: "Interactive Games", imageUrl: "/M8L2.png", progress: 0, href: "/module/module8?step=2" },
        { lessonId: "module8_step3", title: "Passive vs Active Investing (Deep Dive)", category: "Applying Your Knowledge", imageUrl: "/M8L3.png", progress: 0, href: "/module/module8?step=3" },
      ],
    },
    {
      moduleNumber: 9,
      lessons: [
        { lessonId: "module9_step1", title: "Economic Indicators & Market Signals", category: "Definitions", imageUrl: "/M9L1.png", progress: 0, href: "/module/module9?step=1" },
        { lessonId: "module9_step2", title: "Economic Indicators & Market Signals", category: "Interactive Games", imageUrl: "/M9L2.png", progress: 0, href: "/module/module9?step=2" },
        { lessonId: "module9_step3", title: "Economic Indicators & Market Signals", category: "Applying Your Knowledge", imageUrl: "/M9L3.png", progress: 0, href: "/module/module9?step=3" },
      ],
    },
    {
      moduleNumber: 10,
      lessons: [
        { lessonId: "module10_step1", title: "Behavioral Biases in Investing", category: "Definitions", imageUrl: "/M10L1.png", progress: 0, href: "/module/module10?step=1" },
        { lessonId: "module10_step2", title: "Behavioral Biases in Investing", category: "Interactive Games", imageUrl: "/M10L2.png", progress: 0, href: "/module/module10?step=2" },
        { lessonId: "module10_step3", title: "Behavioral Biases in Investing", category: "Applying Your Knowledge", imageUrl: "/M10L3.png", progress: 0, href: "/module/module10?step=3" },
      ],
    },
  ];

  const mergedModuleData = useMemo(() => {
    return moduleData.map((m) => ({
      ...m,
      lessons: m.lessons.map((lesson) => {
        const lessonId = lesson.lessonId || makeLessonId(m.moduleNumber, lesson.href);
        const saved = progressMap[lessonId];
        return {
          ...lesson,
          lessonId,
          progress: saved?.progressPercent ?? lesson.progress ?? 0,
          href: saved?.lastPath ?? lesson.href,
        };
      }),
    }));
  }, [progressMap]);

  const searchResults = useMemo(() => searchLessons(searchQuery), [searchQuery]);
  const isSearching = searchQuery.trim().length > 0;

  return (
    <PageShell>
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        <aside className="sticky top-8">
          <SidebarNav />
        </aside>

        <main>
          <div className="flex flex-col gap-6 pt-5">

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons, topics, or keywords like 'inflation', 'interest', 'sector'..."
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results */}
            {isSearching ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
                </p>

                {searchResults.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <p className="text-sm font-medium">No lessons found for "{searchQuery}"</p>
                    <p className="text-xs mt-1">Try searching "inflation", "DCA", "ETF", or "bear market"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {searchResults.map((result) => {
                      const merged = mergedModuleData
                        .find((m) => m.moduleNumber === result.moduleNumber)
                        ?.lessons.find((l) => l.lessonId === result.lessonId);
                      return (
                        <div key={result.lessonId}>
                          <p className="text-xs font-medium text-gray-400 mb-1">Module {result.moduleNumber}</p>
                          <LessonCard
                            lessonId={result.lessonId}
                            uid={user?.uid}
                            isFavorited={favoriteIds.includes(result.lessonId)}
                            title={result.title}
                            category={result.category}
                            imageUrl={merged?.imageUrl ?? ""}
                            progress={merged?.progress ?? 0}
                            href={merged?.href ?? result.href}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Normal module view
              mergedModuleData.map((m, i) => (
                <div key={m.moduleNumber}>
                  <ModuleSection
                    moduleNumber={m.moduleNumber}
                    lessons={m.lessons}
                    uid={user?.uid}
                    favoriteIds={favoriteIds}
                  />
                  {i < mergedModuleData.length - 1 && (
                    <div className="h-px bg-[#E9EEF3] my-6" />
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        <aside className="sticky top-8">
          <RightRail />
        </aside>
      </div>
    </PageShell>
  );
}