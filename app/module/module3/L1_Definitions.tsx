"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveToDictionary,
  removeFromDictionary,
  isInDictionary,
} from "@/lib/dictionary";
import { awardXP, XP_REWARDS } from "@/lib/progress";

// Concept Data
const CONCEPTS = [
  {
    id: 1,
    term: "Blockchain",
    definition:
      "A blockchain is a shared digital record of transactions stored across many computers. Transactions are grouped into blocks, and each block connects to the one before it, which makes the record difficult to change.",
    analogy: "A public digital ledger that's nearly impossible to fake or erase.",
    example:
      "When someone sends Bitcoin, that transaction is added to the blockchain. Thousands of computers verify it. If one computer tries to alter the record, the rest reject it.",
    funFact:
      "Bitcoin's blockchain stores years of transaction history and keeps growing every day.",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=500&fit=crop",
  },
  {
    id: 2,
    term: "Wallet",
    definition:
      "A crypto wallet is a tool that stores the keys you need to access and manage your cryptocurrency. Your coins are not inside the wallet itself. They remain on the blockchain while the wallet proves they belong to you.",
    analogy: "It holds your crypto access keys, not the coins themselves.",
    example:
      "A wallet is more like a keychain than a piggy bank. If you lose the keys, you can lose access to your crypto.",
    funFact:
      "Some wallets are apps, while others are physical devices called hardware wallets.",
    image:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=500&fit=crop",
  },
  {
    id: 3,
    term: "Private Key",
    definition:
      "A private key is a secret code that gives full control over a crypto wallet. It proves ownership of your funds. Anyone with your private key can move your crypto.",
    analogy: "Your private key is the secret code you must never share.",
    example:
      "If someone gets your private key, they can transfer your crypto away in seconds. Unlike a bank password, there is usually no support team that can reverse it.",
    funFact:
      "Private keys are extremely difficult to guess because the number of possible combinations is enormous.",
    image:
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=500&fit=crop",
  },
  {
    id: 4,
    term: "Gas Fees",
    definition:
      "Gas fees are the transaction costs paid to a blockchain network for processing actions. Fees usually rise when the network is busy and fall when it is less crowded.",
    analogy: "You pay a network fee to move or use crypto.",
    example:
      "Sending crypto during a busy time can cost much more than sending it later when fewer people are using the network.",
    funFact:
      "On some blockchains, fees can change a lot within the same day.",
    image:
      "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&h=500&fit=crop",
  },
  {
    id: 5,
    term: "Volatility",
    definition:
      "Volatility means prices move up and down quickly and by large amounts. Crypto is known for high volatility, which means prices can rise fast but also fall fast.",
    analogy: "Crypto prices can swing wildly in a short time.",
    example:
      "You could go to sleep with your portfolio up and wake up to find it down sharply. That is why crypto can feel exciting and stressful at the same time.",
    funFact:
      "Crypto often moves much more dramatically than most traditional stocks.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
  },
  {
    id: 6,
    term: "FOMO",
    definition:
      "FOMO means Fear Of Missing Out. In crypto, it happens when people rush into buying because they see others making money and do not want to feel left behind.",
    analogy: "FOMO is emotional buying because everyone else seems to be winning.",
    example:
      "A coin starts trending online and people post huge gains. You feel pressure to buy quickly, even if you do not understand the project. That is FOMO.",
    funFact:
      "FOMO often pushes people to buy late, right before prices drop.",
    image:
      "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&h=500&fit=crop",
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "Your friend asks for your private key to help set up your wallet. What should you do?",
    options: [
      {
        id: "a",
        text: "Share it because they are trying to help",
        correct: false,
      },
      {
        id: "b",
        text: "Refuse because private keys should never be shared",
        correct: true,
      },
      {
        id: "c",
        text: "Share it, but ask them to keep it safe",
        correct: false,
      },
    ],
    explanation:
      "Never share your private key. Anyone with it can control your crypto.",
  },
  {
    id: 2,
    question:
      "A coin just pumped 300% in one week and people online say buy now. What is the smartest move?",
    options: [
      {
        id: "a",
        text: "Buy immediately before it is too late",
        correct: false,
      },
      {
        id: "b",
        text: "Research the project before making any decision",
        correct: true,
      },
      {
        id: "c",
        text: "Assume every crypto project is fake",
        correct: false,
      },
    ],
    explanation:
      "Good investors slow down, research, and avoid emotional decisions.",
  },
  {
    id: 3,
    question:
      "Gas fees are highest during network congestion. When is a better time to make a transaction?",
    options: [
      {
        id: "a",
        text: "Any time because fees do not matter",
        correct: false,
      },
      {
        id: "b",
        text: "During lower-traffic periods",
        correct: true,
      },
      {
        id: "c",
        text: "Never make transactions because it is too confusing",
        correct: false,
      },
    ],
    explanation:
      "Timing your transaction can help reduce fees significantly.",
  },
  {
    id: 4,
    question:
      "Someone messages you saying, send 1 ETH and get 10 ETH back. What is this most likely to be?",
    options: [
      {
        id: "a",
        text: "A great opportunity",
        correct: false,
      },
      {
        id: "b",
        text: "A scam that should be ignored and reported",
        correct: true,
      },
      {
        id: "c",
        text: "Something worth testing with a small amount",
        correct: false,
      },
    ],
    explanation:
      "If it sounds too good to be true, it usually is a scam.",
  },
  {
    id: 5,
    question:
      "Your portfolio drops 40% in one day and you start to panic. What should you do first?",
    options: [
      {
        id: "a",
        text: "Sell everything immediately",
        correct: false,
      },
      {
        id: "b",
        text: "Pause, review your plan, and avoid emotional decisions",
        correct: true,
      },
      {
        id: "c",
        text: "Buy much more right away without thinking",
        correct: false,
      },
    ],
    explanation:
      "Volatility is normal in crypto. Your response should be thoughtful, not impulsive.",
  },
  {
    id: 6,
    question:
      "You want to store a large amount of crypto long-term. Which option is usually the most secure?",
    options: [
      {
        id: "a",
        text: "Keeping it on an exchange",
        correct: false,
      },
      {
        id: "b",
        text: "A hardware wallet",
        correct: true,
      },
      {
        id: "c",
        text: "A phone wallet for maximum convenience",
        correct: false,
      },
    ],
    explanation:
      "Hardware wallets keep your keys offline, which improves security.",
  },
  {
    id: 7,
    question:
      "What happens to your crypto if you lose your seed phrase and have no backup?",
    options: [
      {
        id: "a",
        text: "You can contact support to recover it",
        correct: false,
      },
      {
        id: "b",
        text: "Your crypto is likely lost forever",
        correct: true,
      },
      {
        id: "c",
        text: "The blockchain automatically creates a new one",
        correct: false,
      },
    ],
    explanation:
      "Without your seed phrase, there's usually no way to recover access to your wallet. That's why backup is critical.",
  },
  {
    id: 8,
    question:
      "Why do crypto prices often change more dramatically than traditional stocks?",
    options: [
      {
        id: "a",
        text: "Because crypto markets are newer and less regulated",
        correct: true,
      },
      {
        id: "b",
        text: "Because crypto is always a scam",
        correct: false,
      },
      {
        id: "c",
        text: "Because people trade crypto more often",
        correct: false,
      },
    ],
    explanation:
      "Crypto markets are newer, less regulated, and have higher volatility compared to traditional stock markets.",
  },
  {
    id: 9,
    question:
      "What is the main advantage of blockchain technology?",
    options: [
      {
        id: "a",
        text: "It makes you rich quickly",
        correct: false,
      },
      {
        id: "b",
        text: "It creates a transparent, tamper-resistant record",
        correct: true,
      },
      {
        id: "c",
        text: "It eliminates all transaction fees",
        correct: false,
      },
    ],
    explanation:
      "Blockchain's main advantage is creating a transparent, decentralized record that's very difficult to alter or fake.",
  },
  {
    id: 10,
    question:
      "If a cryptocurrency exchange gets hacked and you kept all your crypto there, what might happen?",
    options: [
      {
        id: "a",
        text: "Nothing, because your crypto is insured",
        correct: false,
      },
      {
        id: "b",
        text: "You could lose access to your funds",
        correct: true,
      },
      {
        id: "c",
        text: "The government will refund you",
        correct: false,
      },
    ],
    explanation:
      "Exchange hacks can result in lost funds. That's why many people use self-custody for long-term holdings.",
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

  const [view, setView] = useState<"intro" | "study" | "quiz" | "results">(
    "intro"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Dictionary saved state per concept.id
  const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  const currentConcept = useMemo(
    () => CONCEPTS[currentIndex],
    [currentIndex]
  );
  const currentTermId = useMemo(
    () => String(currentConcept.id),
    [currentConcept.id]
  );
  const isSaved = Boolean(savedMap[currentConcept.id]);

  // Check if term is saved in dictionary
  useEffect(() => {
    let cancelled = false;

    async function checkSaved() {
      if (!user) return;
      try {
        const exists = await isInDictionary(user.uid, currentTermId);
        if (!cancelled) {
          setSavedMap((prev) => ({ ...prev, [currentConcept.id]: exists }));
        }
      } catch {
        // keep UI stable even if Firestore fails
      }
    }

    if (view === "study" && user) checkSaved();
    return () => {
      cancelled = true;
    };
  }, [user, view, currentConcept.id, currentTermId]);

  const toggleSave = async () => {
    if (!user) return;
    if (saving) return;

    setSaving(true);
    try {
      if (isSaved) {
        await removeFromDictionary(user.uid, currentTermId);
        setSavedMap((prev) => ({ ...prev, [currentConcept.id]: false }));
      } else {
        await saveToDictionary(user.uid, {
          id: currentTermId,
          term: currentConcept.term,
          definition: currentConcept.definition,
          analogy: currentConcept.analogy,
          category: "CRYPTOCURRENCY",
          moduleId: "module3",
          lessonId: "L1_Definitions",
          savedAt: Date.now(),
        });
        setSavedMap((prev) => ({ ...prev, [currentConcept.id]: true }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (view === "study") {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
      else setView("intro");
    } else if (view === "quiz") {
      if (quizIdx > 0 && !isSubmitted) {
        setQuizIdx(quizIdx - 1);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else if (quizIdx === 0 && !isSubmitted) {
        setView("study");
        setCurrentIndex(CONCEPTS.length - 1);
      }
    }
  };

  const handleRedoLesson = () => {
    setView("intro");
    setCurrentIndex(0);
    setQuizIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
  };

  const showBackButton = view === "study" || (view === "quiz" && !isSubmitted);

  const handleNextConcept = async () => {
    await awardXP(20);
    if (currentIndex < CONCEPTS.length - 1) setCurrentIndex(currentIndex + 1);
    else setView("quiz");
  };

  const handleNextQuestion = async () => {
    const isCorrect = QUIZ_QUESTIONS[quizIdx].options.find(
      (o) => o.id === selectedOption
    )?.correct;
    const newScore = isCorrect ? score + 10 : score;
    setScore(newScore);

    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(quizIdx + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      await awardXP(XP_REWARDS.COMPLETE_STEP + XP_REWARDS.COMPLETE_MODULE);
      setView("results");
    }
  };

  const percentage = (score / (QUIZ_QUESTIONS.length * 10)) * 100;
  const passedLesson = percentage >= 50;

  const getResultFeedback = () => {
    if (percentage >= 80)
      return {
        emoji: "🦁",
        title: "Crypto Expert!",
        msg: "You've mastered the cryptocurrency fundamentals!",
        color: "text-green-600",
        img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=400",
      };
    if (percentage >= 50)
      return {
  emoji: "🦊",
  title: "Getting There!",
  msg: "Good progress! Review a few concepts and you'll nail it.",
  color: "text-sky-600",
  img: "https://images.unsplash.com/photo-1543832923-44667a44c804?q=80&w=400",
};
    return {
      emoji: "🐻",
      title: "Keep Learning!",
      msg: "Crypto takes time to understand. Review the concepts and try again.",
      color: "text-red-600",
      img: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=400",
    };
  };

  const feedback = getResultFeedback();

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

  // VIEW 1: INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[1000px] mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-10">
          <div className="inline-flex items-center px-5 py-2.5 bg-sky-100 text-sky-700 rounded-full mb-6">
            <span className="text-sm font-bold uppercase tracking-widest">
              Lesson 1: The Foundation
            </span>
          </div>
          <h1 className="text-[36px] font-bold text-[#0D171C] leading-tight mb-4">
            Cryptocurrency Fundamentals
          </h1>
          <p className="mt-4 text-[#4F7D96] text-lg max-w-2xl mx-auto leading-relaxed">
            Learn the building blocks of cryptocurrency in a simple, interactive
            way. You'll explore how blockchain works, what wallets and private
            keys do, and how to avoid beginner mistakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
          <div className="flex flex-col items-start bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Learn</h3>
            <p className="text-sm text-[#4F7D96] leading-relaxed">
              {CONCEPTS.length} core cryptocurrency concepts with examples and
              visuals
            </p>
          </div>

          <div className="flex flex-col items-start bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-3xl">💾</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Save</h3>
            <p className="text-sm text-[#4F7D96] leading-relaxed">
              Build your personal crypto dictionary as you learn
            </p>
          </div>

          <div className="flex flex-col items-start bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Quiz</h3>
            <p className="text-sm text-[#4F7D96] leading-relaxed">
              Test your knowledge with {QUIZ_QUESTIONS.length} real-world
              scenarios
            </p>
          </div>
        </div>

        <button
          onClick={() => setView("study")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#094a72] transition-all"
        >
          Start Learning
        </button>
      </div>
    );
  }

  // VIEW 2: STUDY
  if (view === "study") {
    return (
      <div className="relative max-w-6xl mx-auto px-6 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-10">
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-2">
              Lesson 1: The Foundation
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {currentConcept.term}
            </h2>
            <p className="text-slate-400 text-sm">
              Concept {currentIndex + 1} of {CONCEPTS.length}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-10 items-start bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            {/* Left Column: Image and Fun Fact */}
            <div className="space-y-6">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={currentConcept.image}
                  alt={currentConcept.term}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Fun Fact below image */}
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>💡</span> Fun Fact
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {currentConcept.funFact}
                </p>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Definition
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {currentConcept.definition}
                </p>
              </div>

              <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100">
                <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">
                  Simple Analogy
                </h3>
                <p className="italic text-slate-700 leading-relaxed">
                  "{currentConcept.analogy}"
                </p>
              </div>

              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                  Real Example
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {currentConcept.example}
                </p>
              </div>

              <button
                onClick={toggleSave}
                disabled={!user || saving}
                className={[
                  "w-full py-3 rounded-xl font-bold transition-all border-2",
                  isSaved
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-[#0B5E8E] border-[#0B5E8E] text-white hover:bg-[#094a72]",
                  !user || saving ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {isSaved
                  ? "✓ Saved to Dictionary (Click to Remove)"
                  : "+ Add to My Dictionary"}
              </button>

              <button
                onClick={handleNextConcept}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all"
              >
                {currentIndex === CONCEPTS.length - 1
                  ? "Start Knowledge Check"
                  : "Next Concept"}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 3: QUIZ
  if (view === "quiz") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        <section className="animate-in zoom-in duration-300 max-w-2xl mx-auto pt-16">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Knowledge Check
            </h2>
            <p className="text-slate-500">
              Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}
            </p>
          </header>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <p className="text-xl font-bold text-slate-800 mb-6">
              {QUIZ_QUESTIONS[quizIdx].question}
            </p>

            <div className="space-y-3">
              {QUIZ_QUESTIONS[quizIdx].options.map((opt) => {
                const isCorrect = opt.correct;
                const isSelected = selectedOption === opt.id;

                let btnStyle = "border-slate-100";
                if (isSelected) btnStyle = "border-sky-500 bg-sky-50";
                if (isSubmitted && isCorrect)
                  btnStyle = "border-green-500 bg-green-50 text-green-700";
                if (isSubmitted && isSelected && !isCorrect)
                  btnStyle = "border-red-500 bg-red-50 text-red-700";

                return (
                  <button
                    key={opt.id}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${btnStyle} flex justify-between items-center`}
                  >
                    <span>{opt.text}</span>
                    {isSubmitted && isCorrect && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <span className="text-red-600 font-bold">✕</span>
                    )}
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div
                className={`mt-6 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 border-2 ${
                  QUIZ_QUESTIONS[quizIdx].options.find(
                    (o) => o.id === selectedOption
                  )?.correct
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {QUIZ_QUESTIONS[quizIdx].options.find(
                      (o) => o.id === selectedOption
                    )?.correct
                      ? "✅"
                      : "❌"}
                  </span>
                  <span
                    className={`font-bold uppercase tracking-wider text-sm ${
                      QUIZ_QUESTIONS[quizIdx].options.find(
                        (o) => o.id === selectedOption
                      )?.correct
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {QUIZ_QUESTIONS[quizIdx].options.find(
                      (o) => o.id === selectedOption
                    )?.correct
                      ? "Correct!"
                      : "Not quite!"}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  {QUIZ_QUESTIONS[quizIdx].explanation}
                </p>
              </div>
            )}

            <button
              disabled={!selectedOption}
              onClick={() =>
                isSubmitted ? handleNextQuestion() : setIsSubmitted(true)
              }
              className="mt-8 w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              {isSubmitted
                ? quizIdx === QUIZ_QUESTIONS.length - 1
                  ? "Finish Quiz"
                  : "Next Question"
                : "Check Answer"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 4: RESULTS
  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-10">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
            <Image
              src={feedback.img}
              alt="result"
              fill
              className="object-cover"
            />
          </div>

          <h2 className={`text-4xl font-black mb-2 ${feedback.color}`}>
            {feedback.emoji} {feedback.title}
          </h2>

          <div className="text-6xl font-black text-slate-900 mb-4">
            {percentage}%
          </div>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">
            {feedback.msg}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (passedLesson) onComplete(score);
              }}
              disabled={!passedLesson}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                passedLesson
                  ? "bg-sky-700 text-white hover:bg-sky-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              {passedLesson ? "Move on to Lesson 2" : "Score 50% to Unlock Lesson 2"}
            </button>

            {!passedLesson && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                <p className="text-sm text-amber-800">
                  <strong>Keep going:</strong> You need at least <strong>50%</strong> on the Lesson 1 quiz before moving to Lesson 2.
                </p>
              </div>
            )}

            <button
              onClick={handleRedoLesson}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Redo Lesson 1
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}