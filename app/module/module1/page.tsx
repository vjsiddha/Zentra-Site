"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import L1_Definitions from "./L1_Definitions";
import L2_Interactive from "./L2_Interactive";
import L3_Applying from "./L3_Applying";
import { loadLessonProgress, saveLessonProgress } from "@/lib/progress";

function ModuleOneContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonId = "module1"; // ✅ one stable doc id

  const [activeStep, setActiveStep] = useState(1);
  const [lesson1Score, setLesson1Score] = useState(0);
  const [lesson2Score, setLesson2Score] = useState(0);
  const [lesson3Score, setLesson3Score] = useState(0);

  const [hydrated, setHydrated] = useState(false);

  // ✅ Hydrate from URL or Firestore (INCLUDING SCORES)
  useEffect(() => {
    (async () => {
      const urlStep = searchParams.get("step");
      if (urlStep) {
        const stepNum = parseInt(urlStep, 10);
        if (stepNum >= 1 && stepNum <= 4) {
          setActiveStep(stepNum);
        }
      }

      const saved = await loadLessonProgress(lessonId);

      if (saved?.currentStep && saved.currentStep >= 1 && saved.currentStep <= 4) {
        setActiveStep(saved.currentStep);
        router.replace(`/module/module1?step=${saved.currentStep}`, { scroll: false });
      } else {
        router.replace(`/module/module1?step=1`, { scroll: false });
      }

      // ✅ hydrate scores if available
      const s = saved?.scores;
      if (s) {
        if (typeof s.lesson1 === "number") setLesson1Score(s.lesson1);
        if (typeof s.lesson2 === "number") setLesson2Score(s.lesson2);
        if (typeof s.lesson3 === "number") setLesson3Score(s.lesson3);
      }

      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Save progress whenever step OR scores change (after hydration)
  useEffect(() => {
    if (!hydrated) return;

    const lastPath = `/module/module1?step=${activeStep}`;
    const isComplete = activeStep === 4;

    saveLessonProgress(lessonId, activeStep, {
      totalSteps: 4,
      lastPath,
      isComplete,
      scores: {
        lesson1: lesson1Score,
        lesson2: lesson2Score,
        lesson3: lesson3Score,
      },
    });
  }, [activeStep, hydrated, lesson1Score, lesson2Score, lesson3Score]);

  const goToStep = (step: number) => {
    setActiveStep(step);
    router.push(`/module/module1?step=${step}`, { scroll: false });
  };

  const redoModule = async () => {
    await saveLessonProgress(lessonId, 1, {
      totalSteps: 4,
      lastPath: `/module/module1?step=1`,
      isComplete: false,
      scores: { lesson1: 0, lesson2: 0, lesson3: 0 },
    });

    setLesson1Score(0);
    setLesson2Score(0);
    setLesson3Score(0);
    goToStep(1);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-manrope text-[#0D171C]">
      {activeStep !== 4 && (
        <div className="fixed top-0 right-0 z-50 p-6">
          <button
            onClick={() => router.push("/module")}
            className="px-6 py-3 bg-white text-[#0B5E8E] rounded-full font-bold text-sm hover:bg-slate-50 transition-all shadow-lg border border-slate-200 flex items-center gap-2"
          >
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
        />
      )}

      {activeStep === 4 && (
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-xl w-full bg-white p-12 rounded-[40px] shadow-xl border border-slate-100 text-center">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-4xl font-black mb-4 text-slate-900">Module 1 Complete!</h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-sky-50 rounded-xl p-4">
                <p className="text-xs text-sky-600 uppercase font-bold">Lesson 1</p>
                <p className="text-2xl font-black text-sky-700">{lesson1Score}%</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 uppercase font-bold">Lesson 2</p>
                <p className="text-2xl font-black text-emerald-700">{lesson2Score}%</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-xs text-violet-600 uppercase font-bold">Lesson 3</p>
                <p className="text-2xl font-black text-violet-700">{lesson3Score}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/module")}
                className="w-full py-5 bg-[#0D171C] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
              >
                Back to All Modules
              </button>

              <button
                onClick={redoModule}
                className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Redo Module 1
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ModuleOnePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ModuleOneContent />
    </Suspense>
  );
}
