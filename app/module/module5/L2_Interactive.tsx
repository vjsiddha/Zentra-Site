"use client";

import { useMemo, useState } from "react";

type StrategyType = "Passive-first" | "Active" | "Blend both";

type Scenario = {
  id: number;
  title: string;
  tag: "Beginner" | "Fees" | "Conviction" | "Portfolio Design" | "Lifestyle";
  situation: string;
  hint: string;
  options: {
    label: StrategyType;
    isCorrect: boolean;
    feedback: string;
  }[];
  lesson: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "The Beginner Long-Term Investor",
    tag: "Beginner",
    situation:
      "Priya is just starting to invest. She wants broad diversification, low fees, and a strategy she can stick with for many years without constant monitoring.",
    hint: "Simplicity and cost matter most here.",
    options: [
      {
        label: "Passive-first",
        isCorrect: true,
        feedback:
          "Correct — for a beginner focused on long-term consistency, passive investing is often the strongest fit because it is simple, diversified, and low-cost.",
      },
      {
        label: "Active",
        isCorrect: false,
        feedback:
          "Active can work in some cases, but it usually adds more complexity and higher fees than this investor needs.",
      },
      {
        label: "Blend both",
        isCorrect: false,
        feedback:
          "A blended approach can work later, but the clearest best fit for this situation is passive-first simplicity.",
      },
    ],
    lesson:
      "When someone wants low maintenance, low cost, and broad diversification, passive-first is often the cleanest fit.",
  },
  {
    id: 2,
    title: "The Expensive Fund Pitch",
    tag: "Fees",
    situation:
      "Jordan is comparing a low-cost index ETF to a high-fee actively managed mutual fund. The active fund had one excellent recent year, and the advisor says the higher fee is worth it.",
    hint: "One strong year is not the same as long-term evidence.",
    options: [
      {
        label: "Passive-first",
        isCorrect: true,
        feedback:
          "Correct — one recent strong year is usually not enough to justify permanently higher fees, especially when long-term consistency matters.",
      },
      {
        label: "Active",
        isCorrect: false,
        feedback:
          "Choosing active based mainly on one recent year is weak reasoning, especially when fees are much higher.",
      },
      {
        label: "Blend both",
        isCorrect: false,
        feedback:
          "A blend could be reasonable in some situations, but the strongest answer here is still caution around paying much more for limited evidence.",
      },
    ],
    lesson:
      "Fees are certain. Outperformance is not. Investors should be careful about paying more for a story instead of evidence.",
  },
  {
    id: 3,
    title: "The Research-Heavy Investor",
    tag: "Conviction",
    situation:
      "Avery enjoys reading financial statements, follows specific sectors closely, and has strong conviction that some areas of the market are mispriced. Avery is comfortable spending time researching investments.",
    hint: "This investor is willing to do more work and has a more active mindset.",
    options: [
      {
        label: "Passive-first",
        isCorrect: false,
        feedback:
          "Passive is still reasonable, but this scenario specifically describes someone who may intentionally want a more active role.",
      },
      {
        label: "Active",
        isCorrect: true,
        feedback:
          "Correct — if someone has strong conviction, enjoys research, and understands the risks, active investing can make sense.",
      },
      {
        label: "Blend both",
        isCorrect: false,
        feedback:
          "A blend can also be sensible in real life, but this scenario most strongly points toward an investor deliberately choosing active involvement.",
      },
    ],
    lesson:
      "Active investing can make sense when the investor has real conviction, strong research habits, and understands the tradeoffs.",
  },
  {
    id: 4,
    title: "The Core-and-Explore Portfolio",
    tag: "Portfolio Design",
    situation:
      "Sam wants most of the portfolio to be low-cost and diversified, but also wants a smaller portion available for specific ideas or manager selection.",
    hint: "This is not an all-or-nothing investor.",
    options: [
      {
        label: "Passive-first",
        isCorrect: false,
        feedback:
          "Passive covers the core part well, but this investor also wants some room for targeted ideas.",
      },
      {
        label: "Active",
        isCorrect: false,
        feedback:
          "Going fully active would not match the desire for a low-cost diversified core.",
      },
      {
        label: "Blend both",
        isCorrect: true,
        feedback:
          "Correct — this is the classic case for a blended or core-satellite approach: passive for most, active for a smaller slice.",
      },
    ],
    lesson:
      "A blended strategy can work well when the investor wants low-cost core exposure plus limited room for conviction-based choices.",
  },
  {
    id: 5,
    title: "The Busy Investor",
    tag: "Lifestyle",
    situation:
      "Taylor has a demanding schedule and does not want to spend time evaluating managers, researching funds every year, or second-guessing performance.",
    hint: "Time and mental energy are real constraints.",
    options: [
      {
        label: "Passive-first",
        isCorrect: true,
        feedback:
          "Correct — passive investing is often strongest for investors who want a reliable, lower-maintenance strategy.",
      },
      {
        label: "Active",
        isCorrect: false,
        feedback:
          "Active usually requires more monitoring, more evaluation, and more tolerance for manager uncertainty.",
      },
      {
        label: "Blend both",
        isCorrect: false,
        feedback:
          "A blend could work, but the clearest best fit for this investor is passive-first simplicity.",
      },
    ],
    lesson:
      "The best strategy is not just about theory — it also has to fit the investor’s time, habits, and ability to stay consistent.",
  },
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function L2_Interactive({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "lab" | "results">("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [history, setHistory] = useState<
    { scenarioId: number; title: string; correct: boolean }[]
  >([]);

  const currentScenario = SCENARIOS[scenarioIndex];

  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "lab") {
      if (!showFeedback) {
        if (scenarioIndex === 0) setView("intro");
        else {
          setScenarioIndex((prev) => prev - 1);
          setSelectedIdx(null);
          setShowFeedback(false);
        }
      }
    } else if (view === "results") {
      setView("lab");
      setScenarioIndex(SCENARIOS.length - 1);
    }
  };

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  const strategyScore = useMemo(() => {
    if (history.length === 0) return 0;
    const correct = history.filter((item) => item.correct).length;
    return Math.round((correct / SCENARIOS.length) * 100);
  }, [history]);

  const progressPct =
    ((scenarioIndex + (showFeedback ? 1 : 0)) / SCENARIOS.length) * 100;

  const submitScenario = () => {
    if (selectedIdx == null) return;
    setShowFeedback(true);

    const isCorrect = currentScenario.options[selectedIdx].isCorrect;

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.scenarioId !== currentScenario.id);
      return [
        ...filtered,
        {
          scenarioId: currentScenario.id,
          title: currentScenario.title,
          correct: isCorrect,
        },
      ];
    });
  };

  const nextScenario = () => {
    if (scenarioIndex < SCENARIOS.length - 1) {
      setScenarioIndex((prev) => prev + 1);
      setSelectedIdx(null);
      setShowFeedback(false);
    } else {
      setView("results");
    }
  };

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[980px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
            Lesson 2: Practice
          </p>
          <h1 className="text-[30px] font-bold text-[#0D171C] leading-[38px]">
            Compare Strategies
          </h1>
          <p className="text-[#4F7D96] mt-2">
            Match different investor situations to the strategy that fits best
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Read the Situation</h3>
            <p className="text-sm text-[#4F7D96]">
              Each investor has different needs, habits, and tradeoffs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Choose the Best Fit</h3>
            <p className="text-sm text-[#4F7D96]">
              Decide whether passive, active, or a blended approach makes the most sense.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Learn the Tradeoffs</h3>
            <p className="text-sm text-[#4F7D96]">
              See why cost, complexity, evidence, and consistency all matter.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-6 rounded-2xl border border-emerald-100 mb-8 w-full max-w-3xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 In this lab, you’ll practice:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Matching strategy to investor goals and lifestyle</li>
            <li>• Knowing when low fees matter most</li>
            <li>• Recognizing when active investing may or may not be justified</li>
          </ul>
        </div>

        <button
          onClick={() => setView("lab")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Strategy Match Lab
        </button>
      </div>
    );
  }

  if (view === "lab") {
    const selectedOption = selectedIdx !== null ? currentScenario.options[selectedIdx] : null;

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">
              Strategy Match Lab
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Scenario {scenarioIndex + 1} of {SCENARIOS.length}
            </h2>
            <p className="text-slate-500 mt-1">
              Choose the approach that fits this investor best
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                    {currentScenario.tag}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-3">
                    {currentScenario.title}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                  📌
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {currentScenario.situation}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Decision hint:</strong> {currentScenario.hint}
                </p>
              </div>

              <p className="font-black text-slate-900 mb-4 text-lg">
                Which approach fits best?
              </p>

              <div className="space-y-3">
                {currentScenario.options.map((option, idx) => {
                  const selected = selectedIdx === idx;
                  const showCorrect = showFeedback && option.isCorrect;
                  const showWrong = showFeedback && selected && !option.isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      disabled={showFeedback}
                      className={[
                        "w-full text-left p-5 rounded-2xl border transition-all",
                        selected
                          ? "border-[#0B5E8E] bg-sky-50"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                        showCorrect ? "border-emerald-400 bg-emerald-50" : "",
                        showWrong ? "border-rose-400 bg-rose-50" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5",
                            selected ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-600",
                            showCorrect ? "bg-emerald-500 text-white" : "",
                            showWrong ? "bg-rose-500 text-white" : "",
                          ].join(" ")}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <p className="font-medium text-slate-800 leading-relaxed">{option.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!showFeedback ? (
                <button
                  onClick={submitScenario}
                  disabled={selectedIdx == null}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Check My Choice
                </button>
              ) : (
                <button
                  onClick={nextScenario}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
                >
                  {scenarioIndex < SCENARIOS.length - 1 ? "Next Scenario" : "See Final Results"}
                </button>
              )}

              {showFeedback && selectedOption && (
  <div
    className={`mt-6 p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
      selectedOption.isCorrect
        ? "bg-emerald-50 border-emerald-200"
        : "bg-amber-50 border-amber-200"
    }`}
  >
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{selectedOption.isCorrect ? "✅" : "💡"}</span>
      <span
        className={`font-black uppercase tracking-wider text-sm ${
          selectedOption.isCorrect ? "text-emerald-700" : "text-amber-800"
        }`}
      >
        {selectedOption.isCorrect ? "Strong fit" : "Best fit"}
      </span>
    </div>

    <p className="text-sm text-slate-700 leading-relaxed mb-3">
      {selectedOption.feedback}
    </p>

    {!selectedOption.isCorrect && (
      <div className="mb-3 bg-white rounded-xl p-4 border border-emerald-200">
        <p className="text-xs font-black uppercase tracking-wider text-emerald-600 mb-1">
          Best answer
        </p>
        <p className="text-sm font-bold text-slate-900">
          {
            currentScenario.options.find((option) => option.isCorrect)?.label
          }
        </p>
        <p className="text-sm text-slate-700 mt-2">
          {
            currentScenario.options.find((option) => option.isCorrect)?.feedback
          }
        </p>
      </div>
    )}

    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
        Core lesson
      </p>
      <p className="text-sm text-slate-700">{currentScenario.lesson}</p>
    </div>
  </div>
)}
            </div>

            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Lab Tracker</h3>
              <p className="text-sm text-slate-500 mt-1">
                See how well you’re matching strategies to investor needs
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
                  <p className="text-xs font-black uppercase text-sky-700">Completed</p>
                  <p className="text-xl font-black text-sky-900">{history.length}/{SCENARIOS.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-black uppercase text-emerald-700">Correct</p>
                  <p className="text-xl font-black text-emerald-900">
                    {history.filter((item) => item.correct).length}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Best reminder
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  The “best” strategy is not universal — it depends on goals, fees, time, conviction, and consistency.
                </p>
              </div>

              <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Scenario log
                </p>
                <div className="space-y-2">
                  {SCENARIOS.map((scenario) => {
                    const found = history.find((item) => item.scenarioId === scenario.id);
                    return (
                      <div
                        key={scenario.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <p className="text-xs font-bold text-slate-700">{scenario.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {found ? "Completed" : "Not completed"}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {found ? (found.correct ? "✓" : "—") : "•"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  const badge =
    strategyScore >= 80 ? "🏆" : strategyScore >= 60 ? "👍" : "🧭";

  const headline =
    strategyScore >= 80
      ? "Strong Strategy Matcher!"
      : strategyScore >= 60
      ? "Good Judgment — Keep Refining"
      : "You’re Building the Skill";

  const summary =
    strategyScore >= 80
      ? "You did a strong job matching passive, active, and blended approaches to the situations where they fit best."
      : strategyScore >= 60
      ? "You’re understanding the tradeoffs well. The next step is becoming even more precise about where fees and complexity matter most."
      : "This skill gets better with practice. Good investing often starts with choosing an approach that fits the person, not just the product.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Module 5 • Lesson 2 Complete</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Scenarios</p>
              <p className="text-xl font-black text-sky-900">{history.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Score</p>
              <p className="text-xl font-black text-emerald-900">{strategyScore}%</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="text-xs font-black uppercase text-violet-700">Badge</p>
              <p className="text-xl font-black text-violet-900">{badge}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-2">What you practiced</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Matching strategies to investor goals and constraints</li>
              <li>• Understanding when passive simplicity is strongest</li>
              <li>• Seeing when active or blended approaches may make more sense</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Coach summary:</strong> {summary}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(strategyScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue to Lesson 3
            </button>
            <button
              onClick={() => {
                setView("intro");
                setScenarioIndex(0);
                setSelectedIdx(null);
                setShowFeedback(false);
                setHistory([]);
              }}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}