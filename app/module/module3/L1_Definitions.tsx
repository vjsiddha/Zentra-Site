"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveToDictionary,
  removeFromDictionary,
  isInDictionary,
} from "@/lib/dictionary";

// Data arrays outside the component
const DEFINITIONS = [
  {
    id: 1,
    term: "Cryptocurrency",
    definition:
      "A type of digital asset that can be sent peer-to-peer without a bank. Ownership is tracked on a blockchain, and transfers are verified using cryptography.",
    analogy:
      "Like digital cash that lives on the internet. No bank needed—the network itself verifies every transaction.",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1200",
  },
  {
    id: 2,
    term: "Blockchain",
    definition:
      "A record (ledger) of transactions that many computers share. Transactions are grouped into blocks, and blocks link together so the history becomes hard to change.",
    analogy:
      "Think of it like a public spreadsheet that thousands of computers keep in sync. Changing the past becomes extremely difficult.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
  },
  {
    id: 3,
    term: "Wallet",
    definition:
      "Software or hardware that lets you manage crypto by controlling your private keys. It doesn't 'store coins' like a physical wallet—it stores access.",
    analogy:
      "Like a keychain that proves you own something. The blockchain holds the treasure, your wallet holds the key.",
    image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1200",
  },
  {
    id: 4,
    term: "Private Key & Seed Phrase",
    definition:
      "A private key is the secret that authorizes transactions. A seed phrase is a human-readable backup that can recreate your wallet keys.",
    analogy:
      "Your seed phrase is like the master password to a vault. Lose it, and you lose access forever. No 'forgot password' button exists.",
    image: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=1200",
  },
  {
    id: 5,
    term: "Stablecoin",
    definition:
      "A token intended to track a stable value (usually USD). Used to move dollars quickly on-chain or to reduce volatility without leaving crypto rails.",
    analogy:
      "Like parking your car in neutral. You're still in the crypto world, but you're not moving with the wild price swings.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200",
  },
  {
    id: 6,
    term: "Market Cap",
    definition:
      "The coin price multiplied by the circulating supply. It helps compare the relative size of crypto assets.",
    analogy:
      "Like measuring the total value of all shares of a company. Bigger market cap usually means more stability (but not always!).",
    image: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=1200",
  },
  {
    id: 7,
    term: "Gas Fees",
    definition:
      "Fees paid to the network to include your transaction. Fees rise when the network is busy (higher demand for block space).",
    analogy:
      "Like surge pricing for Uber. When everyone wants to transact at once, you pay more to get your transaction through.",
    image: "https://images.unsplash.com/photo-1518544887873-3c3db7866f0b?q=80&w=1200",
  },
  {
    id: 8,
    term: "Volatility",
    definition:
      "How much prices move up and down. Crypto can swing dramatically in short periods—even without 'news'.",
    analogy:
      "Like riding a rollercoaster. Exciting if you're strapped in for the long haul, terrifying if you need to get off tomorrow.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "If a coin is listed on a major exchange, does that automatically mean it's safe to invest in?",
    options: [
      { id: "a", text: "Yes, exchanges only list safe coins", correct: false },
      { id: "b", text: "No, listings don't guarantee safety", correct: true },
      { id: "c", text: "Only if it's in the top 10 by market cap", correct: false },
      { id: "d", text: "It depends on the exchange logo", correct: false },
    ],
    explanation: "Exchanges list coins for many reasons (demand, fees). A listing doesn't mean the coin is fundamentally safe—always do your own research!",
  },
  {
    id: 2,
    question:
      "You lose your seed phrase and your phone breaks. What happens to your crypto in a self-custody wallet?",
    options: [
      { id: "a", text: "Contact support to reset it", correct: false },
      { id: "b", text: "The funds are likely unrecoverable", correct: true },
      { id: "c", text: "Use your email to recover it", correct: false },
      { id: "d", text: "The exchange will restore it", correct: false },
    ],
    explanation: "With self-custody, the seed phrase IS the backup. No seed phrase = no recovery. This is why secure backup is critical!",
  },
  {
    id: 3,
    question:
      "Gas fees are $15 and you want to send $20 worth of crypto. What should you do?",
    options: [
      { id: "a", text: "Send anyway—fees don't matter", correct: false },
      { id: "b", text: "Wait for lower fees or use Layer 2", correct: true },
      { id: "c", text: "Use a random bridge link", correct: false },
      { id: "d", text: "Complain on Twitter", correct: false },
    ],
    explanation: "Fees eating 75% of your transfer is a bad deal. Wait for off-peak hours or use a cheaper network like Layer 2 solutions.",
  },
  {
    id: 4,
    question: "Are stablecoins completely risk-free because they're pegged to $1?",
    options: [
      { id: "a", text: "Yes, they never lose value", correct: false },
      { id: "b", text: "No, they have reserve/issuer risks", correct: true },
      { id: "c", text: "Only Bitcoin-backed ones are safe", correct: false },
      { id: "d", text: "They're safer than regular banks", correct: false },
    ],
    explanation: "Stablecoins aim to stay at $1, but they have risks: reserve quality, depegs, regulatory issues. Nothing is completely risk-free!",
  },
  {
    id: 5,
    question:
      "A DM claims your wallet is compromised and asks for your seed phrase to 'secure' it. What do you do?",
    options: [
      { id: "a", text: "Send the seed phrase immediately", correct: false },
      { id: "b", text: "Block and report—it's a scam", correct: true },
      { id: "c", text: "Ask them to verify their identity first", correct: false },
      { id: "d", text: "Screenshot your seed phrase to show them", correct: false },
    ],
    explanation: "NEVER share your seed phrase with anyone. Legitimate support will never ask for it. This is a classic phishing scam!",
  },
  {
    id: 6,
    question: "Is cryptocurrency completely anonymous?",
    options: [
      { id: "a", text: "Yes, no one can trace transactions", correct: false },
      { id: "b", text: "It's pseudonymous—addresses can be tracked", correct: true },
      { id: "c", text: "Only Bitcoin is anonymous", correct: false },
      { id: "d", text: "Anonymity depends on the exchange", correct: false },
    ],
    explanation: "Most crypto is pseudonymous, not anonymous. If your address gets linked to your identity (KYC, leaks), your history can be traced.",
  },
  {
    id: 7,
    question:
      "What does it mean when crypto prices drop 20% in one day?",
    options: [
      { id: "a", text: "Crypto is crashing permanently", correct: false },
      { id: "b", text: "Normal volatility—common in crypto", correct: true },
      { id: "c", text: "Time to panic sell everything", correct: false },
      { id: "d", text: "The blockchain is broken", correct: false },
    ],
    explanation: "20% swings are normal in crypto. Volatility is manageable when your time horizon and position size match your risk tolerance.",
  },
  {
    id: 8,
    question: "Why should you care about market cap when evaluating crypto?",
    options: [
      { id: "a", text: "Higher market cap = guaranteed profits", correct: false },
      { id: "b", text: "It indicates relative size and risk", correct: true },
      { id: "c", text: "Market cap doesn't matter at all", correct: false },
      { id: "d", text: "Only price matters, not market cap", correct: false },
    ],
    explanation: "Market cap shows relative size. Smaller caps move more violently (higher risk/reward), bigger caps tend to be more stable.",
  },
  {
    id: 9,
    question:
      "You receive random tokens in your wallet. What should you do?",
    options: [
      { id: "a", text: "Approve unlimited spending to unlock them", correct: false },
      { id: "b", text: "Ignore or verify from official sources", correct: true },
      { id: "c", text: "Click the link in the transaction", correct: false },
      { id: "d", text: "Immediately sell them for profit", correct: false },
    ],
    explanation: "Random airdrops + unlimited approvals are often scams to drain your wallet. Verify authenticity before interacting!",
  },
  {
    id: 10,
    question: "What's the best strategy for handling crypto volatility?",
    options: [
      { id: "a", text: "Check prices every 5 minutes", correct: false },
      { id: "b", text: "Size positions for your time horizon", correct: true },
      { id: "c", text: "Use rent money to buy dips", correct: false },
      { id: "d", text: "Day trade to beat volatility", correct: false },
    ],
    explanation: "Volatility is manageable when position size + time horizon match reality. Don't invest money you need soon!",
  },
];

export default function L1_Definitions({ onComplete }: { onComplete: (score: number) => void }) {
  const { user } = useAuth();

  const [view, setView] = useState<"intro" | "study" | "quiz" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Dictionary saved state per definition.id
  const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  const currentDef = useMemo(() => DEFINITIONS[currentIndex], [currentIndex]);
  const currentTermId = useMemo(() => String(currentDef.id), [currentDef.id]);
  const isSaved = Boolean(savedMap[currentDef.id]);

  // When we land on a definition, check Firestore if it's already saved
  useEffect(() => {
    let cancelled = false;

    async function checkSaved() {
      if (!user) return;
      try {
        const exists = await isInDictionary(user.uid, currentTermId);
        if (!cancelled) {
          setSavedMap((prev) => ({ ...prev, [currentDef.id]: exists }));
        }
      } catch {
        // keep UI stable even if Firestore fails
      }
    }

    if (view === "study" && user) checkSaved();
    return () => {
      cancelled = true;
    };
  }, [user, view, currentDef.id, currentTermId]);

  const toggleSave = async () => {
    if (!user) return;
    if (saving) return;

    setSaving(true);
    try {
      if (isSaved) {
        await removeFromDictionary(user.uid, currentTermId);
        setSavedMap((prev) => ({ ...prev, [currentDef.id]: false }));
      } else {
        await saveToDictionary(user.uid, {
          id: currentTermId,
          term: currentDef.term,
          definition: currentDef.definition,
          analogy: currentDef.analogy,
          category: "CRYPTOCURRENCY",
          moduleId: "module3",
          lessonId: "L1_Definitions",
          savedAt: Date.now(),
        });
        setSavedMap((prev) => ({ ...prev, [currentDef.id]: true }));
      }
    } finally {
      setSaving(false);
    }
  };

  // Back navigation handler
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
        setCurrentIndex(DEFINITIONS.length - 1);
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

  const handleNextDefinition = () => {
    if (currentIndex < DEFINITIONS.length - 1) setCurrentIndex(currentIndex + 1);
    else setView("quiz");
  };

  const handleNextQuestion = () => {
    const isCorrect = QUIZ_QUESTIONS[quizIdx].options.find((o) => o.id === selectedOption)?.correct;
    const newScore = isCorrect ? score + 10 : score;
    setScore(newScore);

    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(quizIdx + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setView("results");
    }
  };

  const percentage = (score / (QUIZ_QUESTIONS.length * 10)) * 100;

  const getAnimalFeedback = () => {
    if (percentage >= 80)
      return {
        emoji: "🚀",
        title: "Crypto Expert!",
        msg: "You've mastered the fundamentals! You're ready to navigate the crypto world safely.",
        color: "text-green-600",
        img: "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=400",
      };
    if (percentage >= 50)
      return {
        emoji: "🧠",
        title: "Getting There!",
        msg: "Good foundation! Review a few concepts and you'll be crypto-ready in no time.",
        color: "text-sky-600",
        img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=400",
      };
    return {
      emoji: "📚",
      title: "Keep Learning!",
      msg: "Crypto moves fast. Review the definitions and try again—you'll improve quickly!",
      color: "text-amber-600",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400",
    };
  };

  const feedback = getAnimalFeedback();

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

  // VIEW 1: INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full mb-4">
            <span className="text-sm font-bold uppercase tracking-widest">Lesson 1: Definitions</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Crypto Basics (Without the Hype)</h1>
          <p className="text-[#4F7D96] mt-2">
            Learn the essentials → then test yourself on common crypto misconceptions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-start">
            <div className="w-full h-[200px] bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl mb-3 flex items-center justify-center">
              <span className="text-6xl">🔐</span>
            </div>
            <h3 className="text-base font-medium">Learn</h3>
            <p className="text-sm text-[#4F7D96]">Master crypto fundamentals</p>
          </div>

          <div className="flex flex-col items-start">
            <div className="w-full h-[200px] bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl mb-3 flex items-center justify-center">
              <span className="text-6xl">🧠</span>
            </div>
            <h3 className="text-base font-medium">Test</h3>
            <p className="text-sm text-[#4F7D96]">Challenge your knowledge</p>
          </div>

          <div className="flex flex-col items-start">
            <div className="w-full h-[200px] bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl mb-3 flex items-center justify-center">
              <span className="text-6xl">📚</span>
            </div>
            <h3 className="text-base font-medium">Save</h3>
            <p className="text-sm text-[#4F7D96]">Build your crypto dictionary</p>
          </div>
        </div>

        <p className="text-center mb-10 max-w-2xl text-[#0D171C]">
          Understand wallets, keys, stablecoins, fees—the stuff that actually prevents beginner mistakes.
        </p>

        <button onClick={() => setView("study")} className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all">
          Start Learning
        </button>
      </div>
    );
  }

  // VIEW 2: STUDY
  if (view === "study") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-10">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Lesson 1: Crypto Fundamentals</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{currentDef.term}</h2>
            <p className="text-slate-400 text-sm mt-2">
              Definition {currentIndex + 1} of {DEFINITIONS.length}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <Image src={currentDef.image} alt="Definition illustration" fill className="object-cover" />
            </div>

            <div>
              <p className="text-lg text-slate-700 leading-relaxed font-medium">{currentDef.definition}</p>

              <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-xs font-bold text-emerald-600 uppercase block mb-1">Simple Analogy:</span>
                <p className="italic text-slate-600">"{currentDef.analogy}"</p>
              </div>

              {/* Dictionary Save Button */}
              <button
                onClick={toggleSave}
                disabled={!user || saving}
                className={[
                  "mt-5 w-full py-3 rounded-xl font-bold transition-all border-2",
                  isSaved
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-[#0B5E8E] border-[#0B5E8E] text-white hover:bg-[#094a72]",
                  (!user || saving) ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {isSaved ? "✓ Saved to Dictionary (Click to Remove)" : "＋ Add to My Dictionary"}
              </button>

              <button
                onClick={handleNextDefinition}
                className="mt-3 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg"
              >
                {currentIndex === DEFINITIONS.length - 1 ? "Start Knowledge Check" : "Next Definition"}
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
            <h2 className="text-2xl font-bold text-slate-900">Knowledge Check</h2>
            <p className="text-slate-500">
              Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}
            </p>
          </header>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <p className="text-xl font-bold text-slate-800 mb-6">{QUIZ_QUESTIONS[quizIdx].question}</p>

            <div className="space-y-3">
              {QUIZ_QUESTIONS[quizIdx].options.map((opt) => {
                const isCorrect = opt.correct;
                const isSelected = selectedOption === opt.id;

                let btnStyle = "border-slate-100";
                if (isSelected) btnStyle = "border-sky-500 bg-sky-50";
                if (isSubmitted && isCorrect) btnStyle = "border-green-500 bg-green-50 text-green-700";
                if (isSubmitted && isSelected && !isCorrect) btnStyle = "border-red-500 bg-red-50 text-red-700";

                return (
                  <button
                    key={opt.id}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${btnStyle} flex justify-between items-center`}
                  >
                    <span>{opt.text}</span>
                    {isSubmitted && isCorrect && <span className="text-green-600 font-bold">✓</span>}
                    {isSubmitted && isSelected && !isCorrect && <span className="text-red-600 font-bold">✕</span>}
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div
                className={`mt-6 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 border-2 ${
                  QUIZ_QUESTIONS[quizIdx].options.find((o) => o.id === selectedOption)?.correct
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {QUIZ_QUESTIONS[quizIdx].options.find((o) => o.id === selectedOption)?.correct ? "✅" : "❌"}
                  </span>
                  <span
                    className={`font-bold uppercase tracking-wider text-sm ${
                      QUIZ_QUESTIONS[quizIdx].options.find((o) => o.id === selectedOption)?.correct
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {QUIZ_QUESTIONS[quizIdx].options.find((o) => o.id === selectedOption)?.correct
                      ? "Correct!"
                      : "Not quite!"}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">{QUIZ_QUESTIONS[quizIdx].explanation}</p>
              </div>
            )}

            <button
              disabled={!selectedOption}
              onClick={() => (isSubmitted ? handleNextQuestion() : setIsSubmitted(true))}
              className="mt-8 w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
            >
              {isSubmitted ? (quizIdx === QUIZ_QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question") : "Check Answer"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 4: RESULTS
  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-16">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
            <Image src={feedback.img} alt="result" fill className="object-cover" />
          </div>

          <h2 className={`text-4xl font-black mb-2 ${feedback.color}`}>
            {feedback.emoji} {feedback.title}
          </h2>

          <div className="text-6xl font-black text-slate-900 mb-4">{percentage}%</div>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">{feedback.msg}</p>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(score)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Move on to Lesson 2
            </button>

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