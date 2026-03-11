"use client";

import { useMemo, useState } from "react";

type DashboardScenario = {
  id: number;
  title: string;
  subtitle: string;
  inflation: string;
  gdp: string;
  unemployment: string;
  rates: string;
  summary: string;
  correctEnvironment: "overheating" | "soft_landing" | "slowdown" | "recession_risk";
  environmentExplanation: string;
  likelyWinner: "growth" | "defensive" | "bonds" | "commodities";
  winnerExplanation: string;
  bestAction: "reduce_risk" | "stay_balanced" | "lean_growth" | "add_bonds";
  actionExplanation: string;
};

const SCENARIOS: DashboardScenario[] = [
  {
    id: 1,
    title: "Dashboard A",
    subtitle: "Inflation re-accelerates while growth stays firm",
    inflation: "3.9% YoY, above expectations",
    gdp: "2.8% annualized growth",
    unemployment: "3.7%, still low",
    rates: "Central bank signals patience before cuts",
    summary:
      "Prices are still running hot, growth remains healthy, and the labor market is tight.",
    correctEnvironment: "overheating",
    environmentExplanation:
      "This looks like overheating because inflation is too hot while growth and employment remain strong. The economy is not weak — the bigger concern is persistent price pressure.",
    likelyWinner: "commodities",
    winnerExplanation:
      "Commodities often benefit more in hot-inflation environments because they can act as an inflation-sensitive exposure while rate-sensitive assets may struggle.",
    bestAction: "reduce_risk",
    actionExplanation:
      "Reducing risk makes sense because hot inflation can keep rates elevated and pressure both bonds and long-duration growth assets.",
  },
  {
    id: 2,
    title: "Dashboard B",
    subtitle: "Inflation cools without a major growth collapse",
    inflation: "2.4% YoY, easing steadily",
    gdp: "1.9% annualized growth",
    unemployment: "4.1%, slightly higher but stable",
    rates: "Markets expect gradual cuts later this year",
    summary:
      "Inflation is moving closer to target, growth is positive, and the labor market is softening but not breaking.",
    correctEnvironment: "soft_landing",
    environmentExplanation:
      "This is the classic soft-landing setup: inflation is cooling, growth is still positive, and unemployment is not deteriorating sharply.",
    likelyWinner: "growth",
    winnerExplanation:
      "Growth assets often do better when inflation cools and rates are expected to ease, especially if the economy avoids recession.",
    bestAction: "lean_growth",
    actionExplanation:
      "A modest lean toward growth makes sense because easing inflation and a stable economy improve the backdrop for risk assets.",
  },
  {
    id: 3,
    title: "Dashboard C",
    subtitle: "Growth is losing momentum, but recession is not confirmed",
    inflation: "2.7% YoY, roughly stable",
    gdp: "0.5% annualized growth",
    unemployment: "4.5%, rising gradually",
    rates: "Central bank shifts to a more cautious tone",
    summary:
      "The economy is slowing, hiring is weakening, and growth has become fragile.",
    correctEnvironment: "slowdown",
    environmentExplanation:
      "This looks like a slowdown rather than full recession risk because growth is weak and labor is softening, but the economy has not yet clearly rolled over.",
    likelyWinner: "bonds",
    winnerExplanation:
      "Bonds often benefit when growth slows and markets begin expecting lower rates or easier policy ahead.",
    bestAction: "stay_balanced",
    actionExplanation:
      "Staying balanced is sensible here because the environment is weaker, but not weak enough to justify an aggressive all-defensive stance.",
  },
  {
    id: 4,
    title: "Dashboard D",
    subtitle: "Labor weakness and shrinking activity raise concern",
    inflation: "2.1% YoY, cooling quickly",
    gdp: "-0.8% annualized growth",
    unemployment: "5.4%, rising faster than expected",
    rates: "Markets now price multiple cuts",
    summary:
      "Growth has turned negative, labor conditions are worsening, and investors are turning toward recession protection.",
    correctEnvironment: "recession_risk",
    environmentExplanation:
      "This is recession risk: GDP is negative, unemployment is rising materially, and markets are shifting toward defensive positioning.",
    likelyWinner: "defensive",
    winnerExplanation:
      "Defensive assets often hold up better when recession fears rise because their demand is steadier and investors prioritize resilience.",
    bestAction: "add_bonds",
    actionExplanation:
      "Adding bonds makes sense because recession risk and falling-rate expectations often create a stronger backdrop for fixed income.",
  },
];

const ENVIRONMENT_OPTIONS = [
  {
    key: "overheating",
    label: "Overheating",
    desc: "Growth is strong, labor is tight, and inflation is too hot.",
  },
  {
    key: "soft_landing",
    label: "Soft Landing",
    desc: "Inflation cools while growth remains stable enough to avoid recession.",
  },
  {
    key: "slowdown",
    label: "Slowdown",
    desc: "Growth weakens and labor softens, but the economy is not fully breaking.",
  },
  {
    key: "recession_risk",
    label: "Recession Risk",
    desc: "Growth is contracting and labor conditions are worsening materially.",
  },
] as const;

const WINNER_OPTIONS = [
  {
    key: "growth",
    label: "Growth Stocks",
    desc: "Best when rates ease and the economy avoids recession.",
  },
  {
    key: "defensive",
    label: "Defensive Stocks",
    desc: "Usually steadier when uncertainty or recession risk rises.",
  },
  {
    key: "bonds",
    label: "Bonds",
    desc: "Often benefit when growth slows and rate expectations fall.",
  },
  {
    key: "commodities",
    label: "Commodities",
    desc: "Can benefit in hotter inflation environments.",
  },
] as const;

const ACTION_OPTIONS = [
  {
    key: "reduce_risk",
    label: "Reduce risk",
    desc: "Pull back from aggressive positioning and focus on stability.",
  },
  {
    key: "stay_balanced",
    label: "Stay balanced",
    desc: "Avoid extreme moves and keep a diversified stance.",
  },
  {
    key: "lean_growth",
    label: "Lean into growth",
    desc: "Take more upside exposure where the macro backdrop supports it.",
  },
  {
    key: "add_bonds",
    label: "Add bonds",
    desc: "Increase fixed-income exposure as growth weakens and cuts become more likely.",
  },
] as const;

type AnswerState = {
  environment?: "overheating" | "soft_landing" | "slowdown" | "recession_risk";
  winner?: "growth" | "defensive" | "bonds" | "commodities";
  action?: "reduce_risk" | "stay_balanced" | "lean_growth" | "add_bonds";
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function L3_Applying({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "challenge" | "complete">("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const currentScenario = SCENARIOS[scenarioIndex];
  const currentAnswers = answers[currentScenario.id] || {};

  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "challenge") {
      if (showFeedback) {
        setShowFeedback(false);
      } else if (scenarioIndex === 0) {
        setView("intro");
      } else {
        setScenarioIndex((prev) => prev - 1);
        setShowFeedback(false);
      }
    } else if (view === "complete") {
      setView("challenge");
      setScenarioIndex(SCENARIOS.length - 1);
      setShowFeedback(true);
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

  const updateAnswer = (field: keyof AnswerState, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentScenario.id]: {
        ...prev[currentScenario.id],
        [field]: value,
      },
    }));
  };

  const canSubmitCurrent =
    !!currentAnswers.environment && !!currentAnswers.winner && !!currentAnswers.action;

  const currentScore = useMemo(() => {
    let pts = 0;
    if (currentAnswers.environment === currentScenario.correctEnvironment) pts += 34;
    if (currentAnswers.winner === currentScenario.likelyWinner) pts += 33;
    if (currentAnswers.action === currentScenario.bestAction) pts += 33;
    return pts;
  }, [currentAnswers, currentScenario]);

  const scenarioResults = useMemo(() => {
    return SCENARIOS.map((scenario) => {
      const a = answers[scenario.id] || {};
      const envCorrect = a.environment === scenario.correctEnvironment;
      const winnerCorrect = a.winner === scenario.likelyWinner;
      const actionCorrect = a.action === scenario.bestAction;
      const score = (envCorrect ? 34 : 0) + (winnerCorrect ? 33 : 0) + (actionCorrect ? 33 : 0);

      return {
        id: scenario.id,
        title: scenario.title,
        score,
        envCorrect,
        winnerCorrect,
        actionCorrect,
      };
    });
  }, [answers]);

  const finalLessonScore = useMemo(() => {
    const total = scenarioResults.reduce((sum, s) => sum + s.score, 0);
    return Math.round(total / SCENARIOS.length);
  }, [scenarioResults]);

  const answeredCount = useMemo(() => {
    return SCENARIOS.filter((s) => {
      const a = answers[s.id];
      return a?.environment && a?.winner && a?.action;
    }).length;
  }, [answers]);

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 3: Apply</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Macro Dashboard Challenge</h1>
          <p className="text-[#4F7D96] mt-2">Read the data, diagnose the economy, and make the market call</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Read the Dashboard</h3>
            <p className="text-sm text-[#4F7D96]">
              Use inflation, GDP, unemployment, and rates to figure out what macro environment you’re in.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Make the Market Call</h3>
            <p className="text-sm text-[#4F7D96]">
              Decide what kind of assets are most likely to benefit from that macro setup.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📘</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Choose the Response</h3>
            <p className="text-sm text-[#4F7D96]">
              Pick the best portfolio action based on what the dashboard is telling you.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-sky-50 p-6 rounded-2xl border border-violet-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 Your challenge:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Diagnose each macro environment correctly</li>
            <li>• Connect data to likely market winners</li>
            <li>• Turn your interpretation into a practical investment response</li>
          </ul>
        </div>

        <button
          onClick={() => setView("challenge")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Lesson 3
        </button>
      </div>
    );
  }

  if (view === "challenge") {
    const progressPct = ((scenarioIndex + (showFeedback ? 1 : 0)) / SCENARIOS.length) * 100;

    return (
      <div className="relative max-w-6xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs">Macro Dashboard Challenge</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Scenario {scenarioIndex + 1} of {SCENARIOS.length}
            </h2>
            <p className="text-slate-500 mt-1">
              Read the dashboard, classify the environment, and make the market decision
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-violet-600 mb-2">
                      {currentScenario.title}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900">{currentScenario.subtitle}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{currentScenario.summary}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">
                    📉
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Inflation</p>
                    <p className="text-lg font-black text-slate-900 mt-2">{currentScenario.inflation}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">GDP</p>
                    <p className="text-lg font-black text-slate-900 mt-2">{currentScenario.gdp}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Unemployment</p>
                    <p className="text-lg font-black text-slate-900 mt-2">{currentScenario.unemployment}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Rates / Policy</p>
                    <p className="text-lg font-black text-slate-900 mt-2">{currentScenario.rates}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-8">
                <div>
                  <p className="font-black text-slate-900 mb-3 text-lg">
                    1) What macro environment does this dashboard suggest?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ENVIRONMENT_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => updateAnswer("environment", option.key)}
                        disabled={showFeedback}
                        className={[
                          "text-left p-5 rounded-2xl border transition-all min-h-[120px]",
                          currentAnswers.environment === option.key
                            ? "border-[#0B5E8E] bg-sky-50 shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                          showFeedback && option.key === currentScenario.correctEnvironment
                            ? "border-emerald-400 bg-emerald-50"
                            : "",
                        ].join(" ")}
                      >
                        <p className="font-bold text-slate-900 text-[18px]">{option.label}</p>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-black text-slate-900 mb-3 text-lg">
                    2) Which asset bucket is most likely to benefit?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {WINNER_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => updateAnswer("winner", option.key)}
                        disabled={showFeedback}
                        className={[
                          "text-left p-5 rounded-2xl border transition-all min-h-[120px]",
                          currentAnswers.winner === option.key
                            ? "border-[#0B5E8E] bg-sky-50 shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                          showFeedback && option.key === currentScenario.likelyWinner
                            ? "border-emerald-400 bg-emerald-50"
                            : "",
                        ].join(" ")}
                      >
                        <p className="font-bold text-slate-900 text-[18px]">{option.label}</p>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-black text-slate-900 mb-3 text-lg">
                    3) What is the best portfolio response?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ACTION_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => updateAnswer("action", option.key)}
                        disabled={showFeedback}
                        className={[
                          "text-left p-5 rounded-2xl border transition-all min-h-[120px]",
                          currentAnswers.action === option.key
                            ? "border-[#0B5E8E] bg-sky-50 shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                          showFeedback && option.key === currentScenario.bestAction
                            ? "border-emerald-400 bg-emerald-50"
                            : "",
                        ].join(" ")}
                      >
                        <p className="font-bold text-slate-900 text-[18px]">{option.label}</p>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {!showFeedback ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    disabled={!canSubmitCurrent}
                    className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                  >
                    Grade This Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (scenarioIndex < SCENARIOS.length - 1) {
                        setScenarioIndex((prev) => prev + 1);
                        setShowFeedback(false);
                      } else {
                        setView("complete");
                      }
                    }}
                    className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
                  >
                    {scenarioIndex < SCENARIOS.length - 1 ? "Next Dashboard" : "See Final Results"}
                  </button>
                )}

                {showFeedback && (
                  <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-2xl p-6 border border-violet-200 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h4 className="font-black text-slate-900 text-lg">Dashboard Review</h4>
                      <div className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-black text-slate-900">
                        Score: {currentScore}/100
                      </div>
                    </div>

                    <div className="space-y-4 text-sm text-slate-700">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <p className="font-black text-slate-900 mb-1">Environment diagnosis</p>
                        <p>{currentScenario.environmentExplanation}</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <p className="font-black text-slate-900 mb-1">Likely market winner</p>
                        <p>{currentScenario.winnerExplanation}</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <p className="font-black text-slate-900 mb-1">Best portfolio response</p>
                        <p>{currentScenario.actionExplanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Challenge HUD</h3>
              <p className="text-sm text-slate-500 mt-1">Track your macro reading progress</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
                  <p className="text-xs font-black uppercase text-sky-700">Answered</p>
                  <p className="text-xl font-black text-sky-900">{answeredCount}/{SCENARIOS.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-black uppercase text-emerald-700">Average</p>
                  <p className="text-xl font-black text-emerald-900">
                    {Math.round(
                      scenarioResults
                        .filter((r) => answers[r.id]?.environment && answers[r.id]?.winner && answers[r.id]?.action)
                        .reduce((sum, r) => sum + r.score, 0) / Math.max(answeredCount, 1)
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Scoring breakdown</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Environment</span>
                    <span className="font-black">34 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market winner</span>
                    <span className="font-black">33 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portfolio action</span>
                    <span className="font-black">33 pts</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Dashboard log</p>
                <div className="space-y-2">
                  {scenarioResults.map((result) => {
                    const completed =
                      answers[result.id]?.environment &&
                      answers[result.id]?.winner &&
                      answers[result.id]?.action;

                    return (
                      <div
                        key={result.id}
                        className={`p-3 rounded-xl border ${
                          completed ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-700">{result.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {completed ? "Completed" : "Not completed"}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {completed ? `${result.score}/100` : "—"}
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

  const badge = finalLessonScore >= 80 ? "🏆" : finalLessonScore >= 60 ? "👍" : "📚";
  const headline =
    finalLessonScore >= 80
      ? "Macro Dashboard Master!"
      : finalLessonScore >= 60
      ? "Strong Market Reader"
      : "Keep Practicing";

  const summary =
    finalLessonScore >= 80
      ? "You did a strong job connecting economic data to macro conditions, likely market winners, and portfolio actions."
      : finalLessonScore >= 60
      ? "You understand the structure well — your next step is becoming faster and more precise with macro interpretation."
      : "Keep practicing how inflation, growth, labor, and rates work together to shape market expectations.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Module 9 • Lesson 3 Complete</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Dashboards</p>
              <p className="text-xl font-black text-sky-900">{answeredCount}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Final score</p>
              <p className="text-xl font-black text-emerald-900">{finalLessonScore}</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="text-xs font-black uppercase text-violet-700">Rating</p>
              <p className="text-xl font-black text-violet-900">{badge}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-2">What you proved</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• You can diagnose different macro environments from the data</li>
              <li>• You can connect dashboards to likely market winners</li>
              <li>• You can turn economic signals into investment actions</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Coach summary:</strong> {summary}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(finalLessonScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue
            </button>
            <button
              onClick={() => {
                setView("intro");
                setScenarioIndex(0);
                setAnswers({});
                setShowFeedback(false);
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