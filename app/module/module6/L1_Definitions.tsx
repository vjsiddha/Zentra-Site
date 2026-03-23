"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveToDictionary,
  removeFromDictionary,
  isInDictionary,
} from "@/lib/dictionary";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Definition = {
  title: string;
  icon: string;
  subtitle: string;
  text: string;
  deeper: string;
  example: string;
  why: string;
  image: string;
};

const DEFINITIONS: Definition[] = [
  {
    title: "Sector ETF",
    icon: "🧩",
    subtitle: "A fund focused on one slice of the economy",
    text:
      "A sector ETF holds many companies from ONE part of the economy (like Technology, Healthcare, or Energy). " +
      "It diversifies within that sector — but your performance still depends heavily on that sector's success.",
    deeper:
      "If a whole sector gets hit (regulation, recession, rate changes), most holdings can drop together. The ETF label does not protect you from sector-wide shocks.",
    example:
      "Real example: XLK (Technology Select Sector SPDR ETF) holds Apple, Microsoft, Nvidia, and dozens of other tech companies. If tech stocks broadly fall — say, due to rising interest rates — XLK drops even though it holds many companies.",
    why:
      "If a whole sector gets hit (regulation, recession, rate changes), most holdings can drop together.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200",
  },
  {
    title: "Thematic Investing",
    icon: "🚀",
    subtitle: "Investing in a trend or idea, not just a sector",
    text:
      'Investing based on a "theme" or trend (AI, clean energy, robotics). Themes can span multiple sectors, ' +
      "and can move fast because expectations change quickly.",
    deeper:
      "A theme can be real AND still be a bad investment if the hype is already priced in. The question is not 'is this trend real?' — it is 'is the price already reflecting all that optimism?'",
    example:
      "Real example: ARKK (ARK Innovation ETF) surged ~150% in 2020 as investors bet on disruption (EVs, genomics, fintech). By 2022 it had fallen ~75% — the companies were real, but expectations were priced too high. The theme was correct; the entry price was not.",
    why:
      "A theme can be real AND still be a bad investment if the hype is already priced in.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
  },
  {
    title: "Cyclical Sectors",
    icon: "🌦️",
    subtitle: "Do well when the economy expands, struggle when it contracts",
    text:
      "Cyclicals usually do better when the economy is strong and consumers/businesses spend more. " +
      "Examples: Consumer Discretionary, Industrials, parts of Technology.",
    deeper:
      "Cyclicals often fall harder during slowdowns because spending gets cut first. When budgets tighten, people delay buying cars, renovating homes, or booking vacations.",
    example:
      "Real example: During the 2020 COVID crash, airlines, hotels, and auto companies (all cyclicals) fell 40–70% in weeks. When the economy reopened in 2021, those same sectors bounced strongly. Their fortunes move with the economic tide.",
    why:
      "Cyclicals often fall harder during slowdowns because spending gets cut first.",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200",
  },
  {
    title: "Defensive Sectors",
    icon: "🛡️",
    subtitle: "Steadier demand even when the economy weakens",
    text:
      "Defensives tend to have steadier demand even in weak economies. " +
      "Examples: Consumer Staples, Utilities, Healthcare.",
    deeper:
      "They often fall less in downturns — but they can still fall. 'Defensive' means resilient, not invincible. People still buy groceries and pay electricity bills in a recession.",
    example:
      "Real example: During the 2008 financial crisis, the S&P 500 fell ~38%. Consumer Staples (XLP) fell only ~15%. People kept buying Tide detergent, Colgate toothpaste, and Campbell's soup — even when cutting back on everything else.",
    why:
      "They often fall less in downturns — but they can still fall.",
    image:
      "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=1200",
  },
  {
    title: "Sector Rotation",
    icon: "🔄",
    subtitle: "Shifting between sectors as economic conditions change",
    text:
      "Shifting investments across sectors based on where you think the economy is headed " +
      "(e.g., rotating toward defensives when recession risk rises).",
    deeper:
      "Rotation is hard to time — the lesson is to understand exposures, not to 'predict perfectly.' Even professional fund managers struggle to time rotations correctly.",
    example:
      "Real example: In early 2022, as the Fed began raising rates, many investors rotated out of tech (rate-sensitive) and into energy and financials (which can benefit from higher rates). Energy (XLE) was up ~60% that year while tech (XLK) fell ~28%.",
    why:
      "Rotation is hard to time — the lesson is to understand exposures, not to 'predict perfectly.'",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200",
  },
];

type QA = {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const MYTHS = [
  {
    myth: '"Sector ETFs are diversified, so they are low-risk."',
    fact:
      "They are diversified inside one sector, but still concentrated. A sector shock can hit most holdings at once.",
    takeaway: "Diversified does not equal diversified across the whole economy.",
    icon: "⚠️",
  },
  {
    myth: '"If a theme is popular, it is automatically a good investment."',
    fact:
      "Popularity often means expectations are already priced in. If reality disappoints, returns can drop fast.",
    takeaway: "Great story does not equal great entry price.",
    icon: "🔥",
  },
  {
    myth: '"Defensive sectors always go up during recessions."',
    fact:
      "They can fall too — they just tend to fall less on average because demand is steadier.",
    takeaway: "Defensive means more resilient, not invincible.",
    icon: "🧯",
  },
];

const QUIZ: QA[] = [
  {
    id: 1,
    prompt: "A sector ETF is best described as:",
    options: [
      "A fund that holds every sector equally",
      "A fund that holds many companies in one sector",
      "A fund that only holds government bonds",
      "A fund that guarantees fixed returns",
    ],
    correctIndex: 1,
    explanation:
      "Sector ETFs diversify across many companies, but within a single sector — so you still have concentration risk.",
  },
  {
    id: 2,
    prompt: "Which option is generally considered a cyclical sector?",
    options: [
      "Utilities",
      "Consumer Staples",
      "Consumer Discretionary",
      "Healthcare",
    ],
    correctIndex: 2,
    explanation:
      "Consumer Discretionary tends to rise/fall with the economy because it is based on non-essential spending.",
  },
  {
    id: 3,
    prompt: "The biggest risk with thematic investing is usually:",
    options: [
      "Themes cannot be real",
      "Themes are always scams",
      "You may overpay because hype gets priced in",
      "Themes can only be bought by professionals",
    ],
    correctIndex: 2,
    explanation:
      "A theme can be real, but returns depend on expectations vs reality. If expectations are too high, the price can drop even when the theme is true.",
  },
  {
    id: 4,
    prompt: "Defensive sectors are called defensive because:",
    options: [
      "They always rise when markets fall",
      "Their products/services are needed even in bad times",
      "They avoid all risk by holding cash",
      "They guarantee profits every year",
    ],
    correctIndex: 1,
    explanation:
      "Demand is steadier for essentials like staples, basic utilities, and many healthcare services, so these sectors often swing less.",
  },
];

export default function L1_Definitions({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const { user } = useAuth();

  const [view, setView] = useState<
    "intro" | "study" | "myths" | "quiz" | "results"
  >("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  const currentDef = useMemo(() => DEFINITIONS[currentIndex], [currentIndex]);
  const currentTermId = useMemo(() => currentDef.title, [currentDef.title]);
  const isSaved = Boolean(savedMap[currentDef.title]);

  useEffect(() => {
    let cancelled = false;

    async function checkSaved() {
      if (!user) return;
      try {
        const exists = await isInDictionary(user.uid, currentTermId);
        if (!cancelled) {
          setSavedMap((prev) => ({ ...prev, [currentDef.title]: exists }));
        }
      } catch {}
    }

    if (view === "study" && user) checkSaved();

    return () => {
      cancelled = true;
    };
  }, [user, view, currentDef.title, currentTermId]);

  const toggleSave = async (def: Definition) => {
    const key = def.title;
    if (!user || savingMap[key]) return;

    setSavingMap((prev) => ({ ...prev, [key]: true }));
    try {
      if (savedMap[key]) {
        await removeFromDictionary(user.uid, key);
        setSavedMap((prev) => ({ ...prev, [key]: false }));
      } else {
        await saveToDictionary(user.uid, {
          id: key,
          term: def.title,
          definition: def.text,
          analogy: def.why,
          category: "SECTORS",
          moduleId: "module6",
          lessonId: "L1_Definitions",
          savedAt: Date.now(),
        });
        setSavedMap((prev) => ({ ...prev, [key]: true }));
      }
    } finally {
      setSavingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const score = useMemo(() => {
    let correct = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return Math.round((correct / QUIZ.length) * 100);
  }, [answers]);

  const passedLesson = score >= 50;
  const showBackButton = view !== "results";

  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "study") {
      if (currentIndex > 0) setCurrentIndex((v) => v - 1);
      else setView("intro");
    } else if (view === "myths") setView("study");
    else if (view === "quiz") setView("myths");
    else if (view === "results") setView("quiz");
  };

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          d="M19 12H5M12 19l-7-7 7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  );

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-6">
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-2">
            Module 6 • Lesson 1
          </p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">
            Sector Investing & Trends
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Sector ETFs, thematic investing, and cyclicals vs defensives
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-start">
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600"
              className="w-full h-[250px] object-cover rounded-xl mb-3"
              alt="Learn"
            />
            <h3 className="text-base font-medium">Learn</h3>
            <p className="text-sm text-[#4F7D96]">
              Sector ETFs, themes, cyclicals, defensives, rotation
            </p>
          </div>

          <div className="flex flex-col items-start">
            <img
              src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600"
              className="w-full h-[250px] object-cover rounded-xl mb-3"
              alt="Think"
            />
            <h3 className="text-base font-medium">Think</h3>
            <p className="text-sm text-[#4F7D96]">
              Why "popular" does not mean "profitable"
            </p>
          </div>

          <div className="flex flex-col items-start">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600"
              className="w-full h-[250px] object-cover rounded-xl mb-3"
              alt="Challenge"
            />
            <h3 className="text-base font-medium">Challenge</h3>
            <p className="text-sm text-[#4F7D96]">
              Myth vs Fact + quiz to unlock Lesson 2
            </p>
          </div>
        </div>

        <p className="text-center mb-10 max-w-2xl text-[#0D171C]">
          This lesson gives you the vocabulary{" "}
          <span className="font-semibold">and</span> the mental models:
          sector concentration, theme risk, and why different parts of the market
          behave differently.
        </p>

        <button
          onClick={() => setView("study")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Learning
        </button>
      </div>
    );
  }

  if (view === "study") {
    const d = DEFINITIONS[currentIndex];

    const handleNext = () => {
      if (currentIndex < DEFINITIONS.length - 1) setCurrentIndex((v) => v + 1);
      else setView("myths");
    };

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-10">
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">
              Learn: Key Concepts
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              {d.icon} {d.title}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Concept {currentIndex + 1} of {DEFINITIONS.length} •{" "}
              <span className="text-slate-500">{d.subtitle}</span>
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={d.image}
                alt={`${d.title} illustration`}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <p className="text-lg text-slate-800 leading-relaxed font-semibold mb-3">
                {d.text}
              </p>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deeper insight
                </p>
                <p className="text-slate-700 leading-relaxed">{d.deeper}</p>
              </div>

              <div className="mt-4 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
                  Real-world example
                </p>
                <p className="text-slate-700 leading-relaxed">{d.example}</p>
              </div>

              <div className="mt-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  Key takeaway
                </p>
                <p className="text-slate-800 font-medium">{d.why}</p>
              </div>

              <button
                onClick={() => toggleSave(d)}
                disabled={!user || savingMap[d.title]}
                className={[
                  "mt-6 w-full py-3 rounded-xl font-bold transition-all border-2",
                  isSaved
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-[#0B5E8E] border-[#0B5E8E] text-white hover:bg-[#094a72]",
                  !user || savingMap[d.title]
                    ? "opacity-60 cursor-not-allowed"
                    : "",
                ].join(" ")}
              >
                {isSaved
                  ? "✓ Saved to Dictionary (Click to Remove)"
                  : "＋ Add to My Dictionary"}
              </button>

              <button
                onClick={handleNext}
                className="mt-3 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg"
              >
                {currentIndex === DEFINITIONS.length - 1
                  ? "Continue: Myth vs Fact"
                  : "Next Concept"}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (view === "myths") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">
              Misconception Check
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Myth vs Fact
            </h2>
            <p className="text-slate-500 mt-1">
              Fix the most common "sector & trends" mistakes.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {MYTHS.map((m, idx) => (
              <div
                key={idx}
                className="rounded-3xl overflow-hidden border border-slate-100 shadow-md bg-white"
              >
                <div className="p-6 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-700 mb-2 flex items-center gap-2">
                    <span>{m.icon}</span> Myth
                  </p>
                  <p className="font-bold text-slate-900 leading-relaxed">
                    {m.myth}
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">
                    Fact
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {m.fact}
                  </p>

                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Takeaway
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {m.takeaway}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("quiz")}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
            >
              Take the Quiz
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (view === "quiz") {
    const totalAnswered = Object.keys(answers).length;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">
              Knowledge Check
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Quick Quiz
            </h2>
            <p className="text-slate-500 mt-1">
              Answer all {QUIZ.length} to continue.
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(totalAnswered / QUIZ.length) * 100}%` }}
            />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
            <div className="space-y-7">
              {QUIZ.map((q) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="border-b border-slate-100 pb-7 last:border-b-0 last:pb-0"
                  >
                    <p className="font-black text-slate-900 mb-4">
                      {q.id}. {q.prompt}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, idx) => {
                        const picked = selected === idx;
                        const showRight = submitted && idx === q.correctIndex;
                        const showWrong = submitted && picked && !isCorrect;

                        return (
                          <button
                            key={idx}
                            disabled={submitted}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: idx }))
                            }
                            className={[
                              "text-left p-4 rounded-2xl border transition-all",
                              picked
                                ? "border-[#0B5E8E] bg-sky-50"
                                : "border-slate-200 bg-white hover:bg-slate-50",
                              submitted ? "cursor-default" : "cursor-pointer",
                              showRight ? "border-emerald-400 bg-emerald-50" : "",
                              showWrong ? "border-rose-400 bg-rose-50" : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={[
                                  "w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0",
                                  picked
                                    ? "bg-[#0B5E8E] text-white"
                                    : "bg-slate-100 text-slate-700",
                                  showRight ? "bg-emerald-500 text-white" : "",
                                  showWrong ? "bg-rose-500 text-white" : "",
                                ].join(" ")}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <p className="text-sm text-slate-800 leading-relaxed">
                                {opt}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div
                        className={[
                          "mt-4 p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300",
                          isCorrect
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-amber-50 border-amber-200",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {isCorrect ? "✅" : "💡"}
                          </span>
                          <span
                            className={`font-bold uppercase tracking-wider text-sm ${
                              isCorrect ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Review"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-3">
              {!submitted ? (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length < QUIZ.length}
                  className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setView("results")}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all"
                >
                  See Results
                </button>
              )}

              {submitted && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                  }}
                  className="w-full py-3 bg-transparent border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Reset Quiz
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto px-4 pb-12">
      <BackButton />

      <section className="animate-in zoom-in duration-500 pt-16">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">
              {score >= 75 ? "🏆" : score >= 50 ? "👍" : "📚"}
            </span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Lesson 1 Complete
          </h2>
          <p className="text-slate-500 mb-6">
            Your score: <span className="font-black">{score}%</span>
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">You're ready to:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Pick sectors based on exposure, not just vibes</li>
              <li>• Explain how the cycle changes sector winners</li>
              <li>• Spot when a theme might already be priced in</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (passedLesson) onComplete(score);
              }}
              disabled={!passedLesson}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                passedLesson
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              {passedLesson
                ? "Continue to Lesson 2"
                : "Score 50% to Unlock Lesson 2"}
            </button>

            {!passedLesson && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                <p className="text-sm text-amber-800">
                  <strong>Keep going:</strong> You need at least{" "}
                  <strong>50%</strong> on the Lesson 1 quiz before moving to Lesson 2.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setView("intro");
                setCurrentIndex(0);
                setAnswers({});
                setSubmitted(false);
              }}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Redo Lesson
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}