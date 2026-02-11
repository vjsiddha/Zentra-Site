"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import L1_Definitions from "./L1_Definitions";
import L2_Simulation from "./L2_Simulation";
import L3_Archetypes from "./L3_Archetypes";
import { loadLessonProgress, saveLessonProgress } from "@/lib/progress";

function ModuleFourContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonId = "module4";

  // Steps: 1 = Lesson 1, 2 = Lesson 2, 3 = Lesson 3, 4 = Module Complete
  const [activeStep, setActiveStep] = useState(1);
  const [lesson1Score, setLesson1Score] = useState(0);
  const [lesson2Score, setLesson2Score] = useState(0);
  const [lesson3Score, setLesson3Score] = useState(0);

  const [hydrated, setHydrated] = useState(false);

  // Hydrate step from (1) URL, else (2) Firestore, else default 1
  useEffect(() => {
    (async () => {
      // 1) URL wins if present
      const urlStep = searchParams.get("step");
      if (urlStep) {
        const stepNum = parseInt(urlStep, 10);
        if (stepNum >= 1 && stepNum <= 4) {
          setActiveStep(stepNum);
          setHydrated(true);
          return;
        }
      }

      // 2) Otherwise use Firestore saved progress
      const saved = await loadLessonProgress(lessonId);
      if (saved?.currentStep && saved.currentStep >= 1 && saved.currentStep <= 4) {
        setActiveStep(saved.currentStep);
        router.replace(`/module/module4?step=${saved.currentStep}`, { scroll: false });
      } else {
        router.replace(`/module/module4?step=1`, { scroll: false });
      }

      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save progress whenever activeStep changes (after hydration)
    useEffect(() => {
  // We save progress per lesson card (step 1–3)
  const stepForCard = Math.min(activeStep, 3); // keeps it within 1–3
  const lessonId = `module4_step${stepForCard}`;
  const lastPath = `/module/module4?step=${activeStep}`;
  const totalSteps = 4;

  saveLessonProgress(lessonId, activeStep, {
    totalSteps,
    lastPath,
    isComplete: activeStep >= 4,
  });
}, [activeStep]);

  // Update URL when step changes
  const goToStep = (step: number) => {
    setActiveStep(step);
    router.push(`/module/module4?step=${step}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 font-manrope text-[#0D171C]">
      {/* Fixed Top Navigation - Only show during lessons, not on completion */}
      {activeStep !== 4 && (
        <div className="fixed top-0 right-0 z-50 p-6">
          <button
            onClick={() => router.push("/module")}
            className="px-6 py-3 bg-white text-[#0B5E8E] rounded-full font-bold text-sm hover:bg-slate-50 transition-all shadow-lg border border-slate-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Modules
          </button>
        </div>
      )}

      {/* LESSON 1: Market Fundamentals */}
      {activeStep === 1 && (
        <L1_Definitions
          onComplete={(score) => {
            setLesson1Score(score);
            goToStep(2);
          }}
        />
      )}

      {/* LESSON 2: Market Crash Simulation */}
      {activeStep === 2 && (
        <L2_Simulation
          onComplete={(score) => {
            setLesson2Score(score);
            goToStep(3);
          }}
          onBack={() => goToStep(1)}
        />
      )}

      {/* LESSON 3: Investor Archetypes */}
      {activeStep === 3 && (
        <L3_Archetypes
          onComplete={(score) => {
            setLesson3Score(score);
            goToStep(4);
          }}
        />
      )}

      {/* MODULE COMPLETE */}
      {activeStep === 4 && (
        <section className="min-h-screen flex items-center justify-center px-6 py-16">
          <div className="max-w-2xl w-full bg-white p-12 rounded-[40px] shadow-2xl border border-slate-200 text-center animate-in zoom-in duration-500">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-4xl font-black mb-4 text-slate-900">Module 4 Complete!</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Congratulations! You now understand market cycles, how to survive volatility, 
              and what type of investor you are. You're ready for the real world!
            </p>

            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                <p className="text-xs text-rose-600 uppercase font-bold">Lesson 1</p>
                <p className="text-3xl font-black text-rose-700">{lesson1Score}%</p>
                <p className="text-xs text-slate-600 mt-1">Fundamentals</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <p className="text-xs text-orange-600 uppercase font-bold">Lesson 2</p>
                <p className="text-3xl font-black text-orange-700">{lesson2Score}%</p>
                <p className="text-xs text-slate-600 mt-1">Simulation</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                <p className="text-xs text-violet-600 uppercase font-bold">Lesson 3</p>
                <p className="text-3xl font-black text-violet-700">{lesson3Score}%</p>
                <p className="text-xs text-slate-600 mt-1">Archetypes</p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-slate-700">Module 4 Progress</span>
                <span className="text-slate-500">100%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-violet-500 w-full transition-all duration-1000" />
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gradient-to-br from-rose-50 to-violet-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-bold text-slate-900 mb-4 text-center">🎯 Key Takeaways</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>✓ Bear markets average 10 months; bull markets last 5.8 years</li>
                <li>✓ Dollar-cost averaging beats trying to time the market</li>
                <li>✓ Emotional investors underperform by 3-5% annually</li>
                <li>✓ Rebalancing forces you to buy low and sell high</li>
                <li>✓ Missing the 10 best days cuts returns by over 50%</li>
                <li>✓ The best investors stick to their plan no matter what</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/module")}
                className="w-full py-5 bg-gradient-to-r from-rose-600 to-violet-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
              >
                Back to All Modules
              </button>
              <button
                onClick={() => goToStep(1)}
                className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Review Module 4
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ModuleFourPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Module 4...</p>
          </div>
        </div>
      }
    >
      <ModuleFourContent />
    </Suspense>
  );
}