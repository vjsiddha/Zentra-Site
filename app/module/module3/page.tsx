"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import L1_Definitions from "./L1_Definitions";
import L2_Interactive from "./L2_Interactive";
import L3_Applying from "./L3_Applying";
import { loadLessonProgress, saveLessonProgress } from "@/lib/progress";

function ModuleThreeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonId = "module3";

  const [activeStep, setActiveStep] = useState(1);
  const [lesson1Score, setLesson1Score] = useState(0);
  const [lesson2Score, setLesson2Score] = useState(0);
  const [lesson3Score, setLesson3Score] = useState(0);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const urlStep = searchParams.get("step");
      if (urlStep) {
        const stepNum = parseInt(urlStep, 10);
        if (stepNum >= 1 && stepNum <= 4) {
          setActiveStep(stepNum);
          setHydrated(true);
          return;
        }
      }

      const saved = await loadLessonProgress(lessonId);
      if (saved?.currentStep && saved.currentStep >= 1 && saved.currentStep <= 4) {
        setActiveStep(saved.currentStep);
        router.replace(`/module/module3?step=${saved.currentStep}`, { scroll: false });
      } else {
        router.replace(`/module/module3?step=1`, { scroll: false });
      }

      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const lastPath = `/module/module3?step=${activeStep}`;

    saveLessonProgress("module3", activeStep, {
      totalSteps: 4,
      lastPath,
      isComplete: activeStep === 4,
    });
  }, [activeStep, hydrated]);

  const goToStep = (step: number) => {
    setActiveStep(step);
    router.push(`/module/module3?step=${step}`, { scroll: false });
  };

  const goToAllModules = () => {
    router.push("/module");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-manrope text-[#0D171C] [@media(max-height:850px)]:scale-[0.95] [@media(max-height:850px)]:origin-top">
      {activeStep !== 4 && (
        <div className="fixed top-0 right-0 z-50 p-3 md:p-4">
          <button
            onClick={goToAllModules}
            className="px-4 py-2.5 bg-white text-[#0B5E8E] rounded-full font-bold text-xs md:text-sm hover:bg-slate-50 transition-all shadow-lg border border-slate-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Modules
          </button>
        </div>
      )}

      {activeStep === 1 && (
        <L1_Definitions
          onComplete={(score) => {
            setLesson1Score(score);
            goToStep(2);
          }}
        />
      )}

      {activeStep === 2 && (
        <L2_Interactive
          onComplete={(score) => {
            setLesson2Score(score);
            goToStep(3);
          }}
          onBack={() => goToStep(1)}
        />
      )}

      {activeStep === 3 && (
        <L3_Applying
          onComplete={(score) => {
            setLesson3Score(score);
            goToStep(4);
          }}
          onBack={() => goToStep(2)}
        />
      )}

      {activeStep === 4 && (
        <section className="min-h-screen flex items-center justify-center px-4 py-4">
          <div className="max-w-xl w-full bg-white p-6 md:p-7 rounded-[32px] shadow-xl border border-slate-100 text-center animate-in zoom-in duration-500">
            <div className="text-5xl md:text-6xl mb-3">🏆</div>

            <h2 className="text-2xl md:text-3xl font-black mb-2 text-slate-900">
              Module 3 Complete!
            </h2>

            <p className="text-sm md:text-base text-[#4F7D96] mb-5 leading-relaxed">
              Congratulations! You've mastered cryptocurrency fundamentals, security practices,
              and real-world decision-making strategies.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-[10px] md:text-xs text-emerald-600 uppercase font-bold">
                  Lesson 1
                </p>
                <p className="text-xl md:text-2xl font-black text-emerald-700">
                  {lesson1Score}%
                </p>
              </div>
              <div className="bg-sky-50 rounded-xl p-3">
                <p className="text-[10px] md:text-xs text-sky-600 uppercase font-bold">
                  Lesson 2
                </p>
                <p className="text-xl md:text-2xl font-black text-sky-700">
                  {lesson2Score}%
                </p>
              </div>
              <div className="bg-violet-50 rounded-xl p-3">
                <p className="text-[10px] md:text-xs text-violet-600 uppercase font-bold">
                  Lesson 3
                </p>
                <p className="text-xl md:text-2xl font-black text-violet-700">
                  {lesson3Score}%
                </p>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex justify-between text-xs md:text-sm mb-1.5">
                <span className="font-bold text-slate-700">Module 3 Progress</span>
                <span className="text-slate-500">100%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 w-full" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-5 text-left">
              <h3 className="font-bold text-slate-900 mb-2 text-sm md:text-base">
                🎯 What You Mastered:
              </h3>
              <ul className="text-xs md:text-sm text-slate-700 space-y-1.5">
                <li>✓ Cryptocurrency fundamentals and blockchain technology</li>
                <li>✓ Wallet security and seed phrase protection</li>
                <li>✓ Trading decisions and risk management</li>
                <li>✓ Gas fees, volatility, and market dynamics</li>
                <li>✓ Building a sustainable crypto strategy</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={goToAllModules}
                className="w-full py-4 bg-[#0D171C] text-white rounded-2xl font-bold text-base md:text-lg hover:opacity-90 transition-all shadow-lg"
              >
                Back to All Modules
              </button>
              <button
                onClick={() => goToStep(1)}
                className="w-full py-3.5 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Redo Module 3
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ModuleThreePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-600">Loading cryptocurrency module...</p>
          </div>
        </div>
      }
    >
      <ModuleThreeContent />
    </Suspense>
  );
}