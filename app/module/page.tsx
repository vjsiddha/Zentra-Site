"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import RightRail from "@/components/RightRail";
import "../globals.css";

import {
  Calculator, Sliders, Briefcase, BookOpen, TrendingUp, Target,
  Lock, Gamepad2, Rocket, TrendingDown, Activity, Building2,
  BarChart3, PieChart, Clock, Sparkles, Zap, Trophy, Wallet,
  LineChart, Shield, Timer, Layers, Gem, Unlock, Flame, Brain,
  Star, Bolt
} from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { addFavorite, removeFavorite } from "@/lib/favorites";

import { loadAllLessonProgress } from "@/lib/progress";
import type { LessonProgress } from "@/lib/progress";

type ModuleData = {
  moduleNumber: number;
  lessons: LessonCardProps[];
  gradient: string;
  textColor: string;
  moduleIcon: any;
  moduleTitle: string;
  inProgressMessage: string;
  progressIcon: any;
};

interface LessonCardProps {
  lessonId: string;
  title: string;
  category: string;
  icon: any;
  progress: number;
  href?: string;
  xp?: number;
}

function LessonCard({
  lessonId,
  title,
  category,
  icon: Icon,
  progress,
  href,
  gradient,
  textColor,
  xp = 100,
  inProgressMessage,
  progressIcon: ProgressIcon,
  uid,
  isFavorited,
}: LessonCardProps & {
  gradient: string;
  textColor: string;
  inProgressMessage: string;
  progressIcon: any;
  uid?: string | null;
  isFavorited: boolean;
}) {
  const clickable = Boolean(href);
  const isCompleted = progress >= 100;
  const isStarted = progress > 0 && progress < 100;
  const [saving, setSaving] = useState(false);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!uid || saving) return;

    setSaving(true);
    try {
      if (isFavorited) {
        await removeFavorite(uid, lessonId);
      } else {
        await addFavorite(uid, lessonId);
      }
    } finally {
      setSaving(false);
    }
  }

  const card = (
    <div
      className={[
        "relative bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 group border-2",
        clickable ? "cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-opacity-100" : "cursor-default",
        isCompleted ? "border-yellow-400" : "border-transparent",
      ].join(" ")}
    >
      {isCompleted && (
        <div className="absolute top-3 left-3 z-20 bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce">
          <Trophy className="w-5 h-5 text-yellow-900" />
        </div>
      )}

      <button
        type="button"
        onClick={toggleFavorite}
        disabled={!uid || saving}
        aria-label={isFavorited ? "Remove from favourites" : "Add to favourites"}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition disabled:opacity-60"
      >
        <Star
          className={`w-5 h-5 ${isFavorited ? "fill-yellow-400 text-yellow-500" : "text-gray-600"}`}
          strokeWidth={2}
        />
      </button>

      <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative z-10 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon className="w-24 h-24 text-white drop-shadow-2xl" strokeWidth={1.5} />
        </div>

        <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-bold">{xp} XP</span>
        </div>
      </div>

      <div className="p-5">
        <div className={`inline-flex items-center gap-1 px-3 py-1.5 ${textColor.replace("text-", "bg-")}/15 rounded-full mb-3`}>
          {isStarted && <Zap className={`w-3 h-3 ${textColor}`} />}
          <span className={`${textColor} text-xs uppercase tracking-wider font-bold`}>
            {category}
          </span>
        </div>

        <h3 className="font-bold text-base text-gray-900 mb-3 leading-snug min-h-[44px]">
          {title}
        </h3>

        <div className="space-y-2">
          <div className="h-2.5 bg-gray-100 rounded-full relative overflow-hidden shadow-inner">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 shadow-sm`}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              {isCompleted ? (
                <span className="text-green-600 flex items-center gap-1 font-bold">
                  <Trophy className="w-3 h-3" /> Unlocked!
                </span>
              ) : isStarted ? (
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  <ProgressIcon className="w-3.5 h-3.5" />
                  {inProgressMessage}
                </span>
              ) : (
                <span className="text-gray-400">Ready to start</span>
              )}
            </span>
            <span className={`font-bold ${isCompleted ? "text-green-600" : textColor}`}>
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );

  return clickable ? (
    <Link href={href!} className="block">
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
  moduleTitle: string;
  moduleIcon: any;
  lessons: LessonCardProps[];
  gradient: string;
  textColor: string;
  inProgressMessage: string;
  progressIcon: any;
  uid?: string | null;
  favoriteIds: string[];
}

function ModuleSection({
  moduleNumber,
  moduleTitle,
  moduleIcon: ModuleIcon,
  lessons,
  gradient,
  textColor,
  inProgressMessage,
  progressIcon,
  uid,
  favoriteIds,
}: ModuleSectionProps) {
  const avgProgress = lessons.reduce((sum, l) => sum + l.progress, 0) / lessons.length;
  const isModuleComplete = avgProgress >= 100;

  return (
    <section className="group">
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100 group-hover:border-gray-200 transition-all">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-105`}>
            <ModuleIcon className="w-8 h-8 text-white" strokeWidth={2} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900">Module {moduleNumber}</h2>
              {isModuleComplete && (
                <div className="bg-yellow-400 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-900" />
                  <span className="text-yellow-900 text-xs font-bold">Complete</span>
                </div>
              )}
            </div>
            <p className={`text-sm font-semibold ${textColor} mt-0.5`}>{moduleTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500 font-medium">Module Progress</div>
            <div className="text-lg font-black text-gray-900">{Math.round(avgProgress)}%</div>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="transform -rotate-90 w-16 h-16">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - avgProgress / 100)}`}
                className={textColor}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {lessons.map((lesson, i) => (
          <LessonCard
            key={`${moduleNumber}-${i}`}
            {...lesson}
            gradient={gradient}
            textColor={textColor}
            inProgressMessage={inProgressMessage}
            progressIcon={progressIcon}
            uid={uid}
            isFavorited={favoriteIds.includes(lesson.lessonId)}
          />
        ))}
      </div>
    </section>
  );
}

export default function LessonPage() {
  const { user } = useAuth();
  const { favoriteIds } = useFavorites(user?.uid);

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
      moduleTitle: "Master Your First Paycheck",
      moduleIcon: Wallet,
      progressIcon: Gem,
      gradient: "from-blue-400 via-blue-500 to-blue-600",
      textColor: "text-blue-600",
      inProgressMessage: "Unlock financial control",
      lessons: [
        { lessonId: "module1_step1", title: "First Job & Budgeting Basics", category: "Learn", icon: Calculator, progress: 0, href: "/module/module1?step=1", xp: 100 },
        { lessonId: "module1_step2", title: "Build Your Budget", category: "Practice", icon: Sliders, progress: 0, href: "/module/module1?step=2", xp: 150 },
        { lessonId: "module1_step3", title: "Real Life Scenarios", category: "Master", icon: Briefcase, progress: 0, href: "/module/module1?step=3", xp: 200 },
      ],
    },
    {
      moduleNumber: 2,
      moduleTitle: "Start Your Investment Journey",
      moduleIcon: LineChart,
      progressIcon: Rocket,
      gradient: "from-orange-400 via-orange-500 to-orange-600",
      textColor: "text-orange-600",
      inProgressMessage: "Unlock wealth building",
      lessons: [
        { lessonId: "module2_step1", title: "Stocks, ETFs & More", category: "Learn", icon: BookOpen, progress: 0, href: "/module/module2?step=1", xp: 100 },
        { lessonId: "module2_step2", title: "Simulate Investing", category: "Practice", icon: TrendingUp, progress: 0, href: "/module/module2?step=2", xp: 150 },
        { lessonId: "module2_step3", title: "Pick Your Strategy", category: "Master", icon: Target, progress: 0, href: "/module/module2?step=3", xp: 200 },
      ],
    },
    {
      moduleNumber: 3,
      moduleTitle: "Navigate Crypto Safely",
      moduleIcon: Shield,
      progressIcon: Unlock,
      gradient: "from-purple-400 via-purple-500 to-purple-600",
      textColor: "text-purple-600",
      inProgressMessage: "Unlock crypto mastery",
      lessons: [
        { lessonId: "module3_step1", title: "Crypto Fundamentals", category: "Learn", icon: Lock, progress: 0, href: "/module/module3?step=1", xp: 100 },
        { lessonId: "module3_step2", title: "Make Smart Decisions", category: "Practice", icon: Gamepad2, progress: 0, href: "/module/module3?step=2", xp: 150 },
        { lessonId: "module3_step3", title: "Build Your Plan", category: "Master", icon: Rocket, progress: 0, href: "/module/module3?step=3", xp: 200 },
      ],
    },
    {
      moduleNumber: 4,
      moduleTitle: "Survive Market Crashes",
      moduleIcon: TrendingDown,
      progressIcon: Flame,
      gradient: "from-red-400 via-red-500 to-red-600",
      textColor: "text-red-600",
      inProgressMessage: "Unlock resilience",
      lessons: [
        { lessonId: "module4_step1", title: "Understanding Bear Markets", category: "Learn", icon: TrendingDown, progress: 51, href: "/module/module4?step=1", xp: 100 },
        { lessonId: "module4_step2", title: "Handle the Drop", category: "Practice", icon: Activity, progress: 51, href: "/module/module4?step=2", xp: 150 },
        { lessonId: "module4_step3", title: "Stay Calm & Win", category: "Master", icon: Target, progress: 51, href: "/module/module4?step=3", xp: 200 },
      ],
    },
    {
      moduleNumber: 5,
      moduleTitle: "Index Funds vs Active Funds",
      moduleIcon: Layers,
      progressIcon: Brain,
      gradient: "from-emerald-400 via-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      inProgressMessage: "Unlock smart investing",
      lessons: [
        { lessonId: "module5_step1", title: "Passive vs Active", category: "Learn", icon: BookOpen, progress: 51, href: "/module/module5?step=1", xp: 100 },
        { lessonId: "module5_step2", title: "Compare Strategies", category: "Practice", icon: BarChart3, progress: 51, href: "/module/module5?step=2", xp: 150 },
        { lessonId: "module5_step3", title: "Choose Your Path", category: "Master", icon: PieChart, progress: 51, href: "/module/module5?step=3", xp: 200 },
      ],
    },
    {
      moduleNumber: 6,
      moduleTitle: "Diversify Like a Pro",
      moduleIcon: Building2,
      progressIcon: Star,
      gradient: "from-cyan-400 via-cyan-500 to-cyan-600",
      textColor: "text-cyan-600",
      inProgressMessage: "Unlock portfolio power",
      lessons: [
        { lessonId: "module6_step1", title: "Sectors & Themes", category: "Learn", icon: Building2, progress: 0, href: "/module/module6?step=1", xp: 100 },
        { lessonId: "module6_step2", title: "Build Your Mix", category: "Practice", icon: TrendingUp, progress: 0, href: "/module/module6?step=2", xp: 150 },
        { lessonId: "module6_step3", title: "Balance Risk", category: "Master", icon: Target, progress: 0, href: "/module/module6?step=3", xp: 200 },
      ],
    },
    {
      moduleNumber: 7,
      moduleTitle: "The Power of Time",
      moduleIcon: Timer,
      progressIcon: Bolt,
      gradient: "from-amber-400 via-amber-500 to-amber-600",
      textColor: "text-amber-600",
      inProgressMessage: "Unlock millionaire mindset",
      lessons: [
        { lessonId: "module7_step1", title: "Time Beats Timing", category: "Learn", icon: Clock, progress: 51, href: "/module/module7?step=1", xp: 100 },
        { lessonId: "module7_step2", title: "See Compound Growth", category: "Practice", icon: BarChart3, progress: 5, href: "/module/module7?step=2", xp: 150 },
        { lessonId: "module7_step3", title: "Start Now", category: "Master", icon: Target, progress: 51, href: "/module/module7?step=3", xp: 200 },
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

  const totalProgress = Math.round(
    mergedModuleData.reduce(
      (sum, m) => sum + m.lessons.reduce((s, l) => s + l.progress, 0) / m.lessons.length,
      0
    ) / mergedModuleData.length
  );

  return (
    <PageShell>
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        <aside className="sticky top-8">
          <SidebarNav />
        </aside>

        <main className="pb-12">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-10 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black mb-2">Your Learning Journey</h1>
                <p className="text-white/90 text-lg">Level up your financial skills, one module at a time</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-sm font-medium text-white/80">Total Progress</div>
                <div className="text-4xl font-black mt-1">{totalProgress}%</div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {mergedModuleData.map((m) => (
              <ModuleSection
                key={m.moduleNumber}
                moduleNumber={m.moduleNumber}
                moduleTitle={m.moduleTitle}
                moduleIcon={m.moduleIcon}
                lessons={m.lessons}
                gradient={m.gradient}
                textColor={m.textColor}
                inProgressMessage={m.inProgressMessage}
                progressIcon={m.progressIcon}
                uid={user?.uid}
                favoriteIds={favoriteIds}
              />
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