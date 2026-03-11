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

  const lessonId = "module3"; // Firestore doc id

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
        // keep URL in sync
        router.replace(`/module/module3?step=${saved.currentStep}`, { scroll: false });
      } else {
        router.replace(`/module/module3?step=1`, { scroll: false });
      }

      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save progress whenever activeStep changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;

    const lastPath = `/module/module3?step=${activeStep}`;

    saveLessonProgress(
  "module3",
  activeStep,
  { 
      totalSteps: 4,
      lastPath,
      isComplete: activeStep === 4,
    }
  );
  }, [activeStep, hydrated]);

  // Update URL when step changes
  const goToStep = (step: number) => {
    setActiveStep(step);
    router.push(`/module/module3?step=${step}`, { scroll: false });
  };

  // Handler to go back to all modules
  const goToAllModules = () => {
    router.push("/module");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-manrope text-[#0D171C]">
      {/* Fixed Top Navigation - Only show during lessons, not on completion */}
      {activeStep !== 4 && (
        <div className="fixed top-0 right-0 z-50 p-6">
          <button
            onClick={goToAllModules}
            className="px-6 py-3 bg-white text-[#0B5E8E] rounded-full font-bold text-sm hover:bg-slate-50 transition-all shadow-lg border border-slate-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Modules
          </button>
        </div>
      )}

      {/* LESSON 1: Definitions & Quiz */}
      {activeStep === 1 && (
        <L1_Definitions
          onComplete={(score) => {
            setLesson1Score(score);
            goToStep(2);
          }}
        />
      )}

      {/* LESSON 2: Interactive Scenarios */}
      {activeStep === 2 && (
        <L2_Interactive
          onComplete={(score) => {
            setLesson2Score(score);
            goToStep(3);
          }}
          onBack={() => goToStep(1)}
        />
      )}

      {/* LESSON 3: Apply Knowledge */}
      {activeStep === 3 && (
        <L3_Applying
          onComplete={(score) => {
            setLesson3Score(score);
            goToStep(4);
          }}
          onBack={() => goToStep(2)}
        />
      )}

      {/* MODULE COMPLETE */}
      {activeStep === 4 && (
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-xl w-full bg-white p-12 rounded-[40px] shadow-xl border border-slate-100 text-center animate-in zoom-in duration-500">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-4xl font-black mb-4 text-slate-900">Module 3 Complete!</h2>
            <p className="text-lg text-[#4F7D96] mb-8 leading-relaxed">
              Congratulations! You've mastered cryptocurrency fundamentals, security practices,
              and real-world decision-making strategies.
            </p>

            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 uppercase font-bold">Lesson 1</p>
                <p className="text-2xl font-black text-emerald-700">{lesson1Score}%</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-4">
                <p className="text-xs text-sky-600 uppercase font-bold">Lesson 2</p>
                <p className="text-2xl font-black text-sky-700">{lesson2Score}%</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-xs text-violet-600 uppercase font-bold">Lesson 3</p>
                <p className="text-2xl font-black text-violet-700">{lesson3Score}%</p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-slate-700">Module 3 Progress</span>
                <span className="text-slate-500">100%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 w-full" />
              </div>
            </div>

            {/* What You Learned */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-bold text-slate-900 mb-3">🎯 What You Mastered:</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>✓ Cryptocurrency fundamentals and blockchain technology</li>
                <li>✓ Wallet security and seed phrase protection</li>
                <li>✓ Trading decisions and risk management</li>
                <li>✓ Gas fees, volatility, and market dynamics</li>
                <li>✓ Building a sustainable crypto strategy</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={goToAllModules}
                className="w-full py-5 bg-[#0D171C] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
              >
                Back to All Modules
              </button>
              <button
                onClick={() => goToStep(1)}
                className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
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
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading cryptocurrency module...</p>
          </div>
        </div>
      }
    >
      <ModuleThreeContent />
    </Suspense>
  );
}