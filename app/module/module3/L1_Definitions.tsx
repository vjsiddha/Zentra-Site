"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { saveToDictionary, removeFromDictionary } from "@/lib/dictionary";
import {
  ChevronLeft,
  BookmarkPlus,
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";

interface Props {
  onComplete: (score: number) => void;
  onBack?: () => void;
}

type View = "intro" | "learn" | "quiz" | "complete";

const CONCEPTS = [
  {
    id: 1,
    term: "Blockchain",
    definition:
      "A blockchain is a shared digital record of transactions stored across many computers. Transactions are grouped into blocks, and each block connects to the one before it, which makes the record difficult to change.",
    simple: "A public digital record that is hard to fake or erase.",
    example:
      "When someone sends Bitcoin, that transaction is added to the blockchain. Thousands of computers verify it. If one computer tries to alter the record, the rest reject it.",
    funFact:
      "Bitcoin’s blockchain stores years of transaction history and keeps growing every day.",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=500&fit=crop",
    imageCredit: "Photo by regularguy.eth on Unsplash",
    videoUrl: "https://www.youtube.com/watch?v=SSo_EIwHSd4",
    videoCredit: "3Blue1Brown - YouTube",
  },
  {
    id: 2,
    term: "Wallet",
    definition:
      "A crypto wallet is a tool that stores the keys you need to access and manage your cryptocurrency. Your coins are not inside the wallet itself. They remain on the blockchain while the wallet proves they belong to you.",
    simple: "It holds your crypto access keys, not the coins themselves.",
    example:
      "A wallet is more like a keychain than a piggy bank. If you lose the keys, you can lose access to your crypto.",
    funFact:
      "Some wallets are apps, while others are physical devices called hardware wallets.",
    imageUrl:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=500&fit=crop",
    imageCredit: "Photo by Pierre Borthiry on Unsplash",
    videoUrl: "https://www.youtube.com/watch?v=d8IBpfs9bf4",
    videoCredit: "Whiteboard Crypto - YouTube",
  },
  {
    id: 3,
    term: "Private Key",
    definition:
      "A private key is a secret code that gives full control over a crypto wallet. It proves ownership of your funds. Anyone with your private key can move your crypto.",
    simple: "Your private key is the secret code you must never share.",
    example:
      "If someone gets your private key, they can transfer your crypto away in seconds. Unlike a bank password, there is usually no support team that can reverse it.",
    funFact:
      "Private keys are extremely difficult to guess because the number of possible combinations is enormous.",
    imageUrl:
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=500&fit=crop",
    imageCredit: "Photo by FLY:D on Unsplash",
    videoUrl: "https://www.youtube.com/watch?v=GSTiKjnBaes",
    videoCredit: "99Bitcoins - YouTube",
  },
  {
    id: 4,
    term: "Gas Fees",
    definition:
      "Gas fees are the transaction costs paid to a blockchain network for processing actions. Fees usually rise when the network is busy and fall when it is less crowded.",
    simple: "You pay a network fee to move or use crypto.",
    example:
      "Sending crypto during a busy time can cost much more than sending it later when fewer people are using the network.",
    funFact:
      "On some blockchains, fees can change a lot within the same day.",
    imageUrl:
      "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&h=500&fit=crop",
    imageCredit: "Photo by Kanchanara on Unsplash",
    videoUrl: "https://www.youtube.com/watch?v=Yh8cHUB-KoU",
    videoCredit: "Finematics - YouTube",
  },
  {
    id: 5,
    term: "Volatility",
    definition:
      "Volatility means prices move up and down quickly and by large amounts. Crypto is known for high volatility, which means prices can rise fast but also fall fast.",
    simple: "Crypto prices can swing wildly in a short time.",
    example:
      "You could go to sleep with your portfolio up and wake up to find it down sharply. That is why crypto can feel exciting and stressful at the same time.",
    funFact:
      "Crypto often moves much more dramatically than most traditional stocks.",
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
    imageCredit: "Photo by Chris Liverani on Unsplash",
    videoUrl: "https://www.youtube.com/watch?v=sMWWXn7BdQM",
    videoCredit: "Coin Bureau - YouTube",
  },
  {
    id: 6,
    term: "FOMO",
    definition:
      "FOMO means Fear Of Missing Out. In crypto, it happens when people rush into buying because they see others making money and do not want to feel left behind.",
    simple: "FOMO is emotional buying because everyone else seems to be winning.",
    example:
      "A coin starts trending online and people post huge gains. You feel pressure to buy quickly, even if you do not understand the project. That is FOMO.",
    funFact:
      "FOMO often pushes people to buy late, right before prices drop.",
    imageUrl:
      "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&h=500&fit=crop",
    imageCredit: "Photo by Executium on Unsplash",
    videoUrl: "https://www.youtube.com/watch?v=TlMgirJRwOE",
    videoCredit: "Andrei Jikh - YouTube",
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "Your friend asks for your private key to help set up your wallet. What should you do?",
    options: [
      {
        id: "A",
        text: "Share it because they are trying to help",
        correct: false,
        feedback:
          "Never share your private key. Anyone with it can control your crypto.",
      },
      {
        id: "B",
        text: "Refuse because private keys should never be shared",
        correct: true,
        feedback:
          "Correct. Your private key gives full control over your crypto.",
      },
      {
        id: "C",
        text: "Share it, but ask them to keep it safe",
        correct: false,
        feedback:
          "Still unsafe. Even trusted people or devices can be compromised.",
      },
    ],
  },
  {
    id: 2,
    question:
      "A coin just pumped 300% in one week and people online say buy now. What is the smartest move?",
    options: [
      {
        id: "A",
        text: "Buy immediately before it is too late",
        correct: false,
        feedback:
          "That is usually FOMO. Chasing hype without research is risky.",
      },
      {
        id: "B",
        text: "Research the project before making any decision",
        correct: true,
        feedback:
          "Exactly. Good investors slow down, research, and avoid emotional decisions.",
      },
      {
        id: "C",
        text: "Assume every crypto project is fake",
        correct: false,
        feedback:
          "Not all crypto projects are scams, but you should always be careful.",
      },
    ],
  },
  {
    id: 3,
    question:
      "Gas fees are highest during network congestion. When is a better time to make a transaction?",
    options: [
      {
        id: "A",
        text: "Any time because fees do not matter",
        correct: false,
        feedback:
          "Fees can matter a lot, especially for small transactions.",
      },
      {
        id: "B",
        text: "During lower-traffic periods",
        correct: true,
        feedback:
          "Correct. Timing your transaction can help reduce fees.",
      },
      {
        id: "C",
        text: "Never make transactions because it is too confusing",
        correct: false,
        feedback:
          "You do not need to avoid crypto entirely. You just need to learn how fees work.",
      },
    ],
  },
  {
    id: 4,
    question:
      "Someone messages you saying, send 1 ETH and get 10 ETH back. What is this most likely to be?",
    options: [
      {
        id: "A",
        text: "A great opportunity",
        correct: false,
        feedback:
          "This is a classic scam. If it sounds too good to be true, it usually is.",
      },
      {
        id: "B",
        text: "A scam that should be ignored and reported",
        correct: true,
        feedback:
          "Correct. Real investing does not work like free money giveaways.",
      },
      {
        id: "C",
        text: "Something worth testing with a small amount",
        correct: false,
        feedback: "Even a small test still loses money if it is a scam.",
      },
    ],
  },
  {
    id: 5,
    question:
      "Your portfolio drops 40% in one day and you start to panic. What should you do first?",
    options: [
      {
        id: "A",
        text: "Sell everything immediately",
        correct: false,
        feedback:
          "Panic decisions often lock in losses at the worst moment.",
      },
      {
        id: "B",
        text: "Pause, review your plan, and avoid emotional decisions",
        correct: true,
        feedback:
          "Exactly. Volatility is normal in crypto, so your response should be thoughtful, not impulsive.",
      },
      {
        id: "C",
        text: "Buy much more right away without thinking",
        correct: false,
        feedback:
          "You should understand why the price fell before making another move.",
      },
    ],
  },
  {
    id: 6,
    question:
      "You want to store a large amount of crypto long-term. Which option is usually the most secure?",
    options: [
      {
        id: "A",
        text: "Keeping it on an exchange",
        correct: false,
        feedback:
          "Exchanges can be hacked, and you do not fully control the keys.",
      },
      {
        id: "B",
        text: "A hardware wallet",
        correct: true,
        feedback:
          "Correct. Hardware wallets keep your keys offline, which improves security.",
      },
      {
        id: "C",
        text: "A phone wallet for maximum convenience",
        correct: false,
        feedback:
          "Phone wallets are useful, but large long-term holdings are usually safer in cold storage.",
      },
    ],
  },
];

export default function L1_InteractiveLearn({ onComplete, onBack }: Props) {
  const { user } = useAuth();
  const [view, setView] = useState<View>("intro");
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [savedTerms, setSavedTerms] = useState<Set<number>>(new Set());

  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentConcept = CONCEPTS[currentCard];
  const currentQuiz = QUIZ_QUESTIONS[quizIndex];

  const toggleSave = async (conceptId: number, term: string, definition: string) => {
    if (!user) return;

    const alreadySaved = savedTerms.has(conceptId);

    if (alreadySaved) {
      await removeFromDictionary(user.uid, term);
      setSavedTerms((prev) => {
        const newSet = new Set(prev);
        newSet.delete(conceptId);
        return newSet;
      });
    } else {
      await saveToDictionary(user.uid, {
        term,
        definition,
        category: "CRYPTOCURRENCY",
        moduleId: "module3",
        lessonId: "L1_Learn",
      });
      setSavedTerms((prev) => new Set(prev).add(conceptId));
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    if (showFeedback) return;

    setSelectedAnswer(optionId);
    setShowFeedback(true);

    const option = currentQuiz.options.find((o) => o.id === optionId);
    if (option?.correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setView("complete");
    }
  };

  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Modules
          </button>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-5xl font-black text-gray-900 mb-4">
              Welcome to Crypto School
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Learn the building blocks of cryptocurrency in a simple, interactive
              way. You’ll explore how blockchain works, what wallets and private
              keys do, and how to avoid beginner mistakes.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-purple-50 rounded-2xl p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-600 rounded-xl flex items-center justify-center">
                  <BookmarkPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Learn</h3>
                <p className="text-sm text-gray-600">
                  {CONCEPTS.length} core ideas with examples, visuals, and videos.
                </p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Interact</h3>
                <p className="text-sm text-gray-600">
                  Flip cards, save terms, and build your crypto vocabulary.
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-600 rounded-xl flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Quiz</h3>
                <p className="text-sm text-gray-600">
                  Practice with {QUIZ_QUESTIONS.length} real-world crypto scenarios.
                </p>
              </div>
            </div>

            <button
              onClick={() => setView("learn")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-xl"
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "learn") {
    const progress = ((currentCard + 1) / CONCEPTS.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 sm:p-8">
        <style jsx>{`
          .flip-card {
            perspective: 1000px;
          }

          .flip-card-inner {
            position: relative;
            width: 100%;
            min-height: 680px;
            text-align: center;
            transition: transform 0.8s;
            transform-style: preserve-3d;
          }

          .flip-card-inner.flipped {
            transform: rotateY(180deg);
          }

          .flip-card-front,
          .flip-card-back {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 24px;
          }

          .flip-card-back {
            transform: rotateY(180deg);
          }

          @media (max-width: 640px) {
            .flip-card-inner {
              min-height: 820px;
            }
          }
        `}</style>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (currentCard === 0) {
                  setView("intro");
                } else {
                  setCurrentCard((prev) => prev - 1);
                  setFlipped(false);
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {currentCard === 0 ? "Back" : "Previous"}
            </button>

            <div className="text-sm font-bold text-gray-600">
              {currentCard + 1} / {CONCEPTS.length}
            </div>
          </div>

          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flip-card">
            <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
              <div className="flip-card-front">
                <div
                  className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 h-full flex flex-col cursor-pointer hover:shadow-3xl transition-shadow"
                  onClick={() => setFlipped(true)}
                >
                  <div className="relative w-full h-56 sm:h-64 mb-6 rounded-2xl overflow-hidden">
                    <img
                      src={currentConcept.imageUrl}
                      alt={currentConcept.term}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] sm:text-xs px-2 py-1 rounded">
                      {currentConcept.imageCredit}
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                    {currentConcept.term}
                  </h2>

                  <p className="text-lg sm:text-xl text-gray-600 mb-6 flex-1 leading-relaxed">
                    {currentConcept.simple}
                  </p>

                  <div className="flex items-center justify-center gap-2 text-purple-600 animate-pulse">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Click to flip and learn more</span>
                  </div>
                </div>
              </div>

              <div className="flip-card-back">
                <div
                  className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-6 sm:p-8 h-full cursor-pointer text-white overflow-y-auto flex items-center justify-center"
                  onClick={() => setFlipped(false)}
                >
                  <div className="w-full max-w-2xl flex flex-col justify-center text-center my-auto">
                    <h3 className="text-2xl font-black mb-4">Definition</h3>
                    <p className="text-sm sm:text-base mb-6 leading-relaxed opacity-95">
                      {currentConcept.definition}
                    </p>

                    <h3 className="text-xl font-black mb-3">Example</h3>
                    <p className="text-sm sm:text-base mb-6 leading-relaxed opacity-95">
                      {currentConcept.example}
                    </p>

                    <div className="bg-white/20 rounded-2xl p-4 mb-6 text-center">
                      <h4 className="font-bold mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Quick Fact
                      </h4>
                      <p className="text-sm opacity-95">{currentConcept.funFact}</p>
                    </div>

                    <a
                      href={currentConcept.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 rounded-xl p-4 flex items-center gap-3 transition-colors text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="w-6 h-6 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold">Watch a short explanation</div>
                        <div className="text-xs opacity-75">
                          {currentConcept.videoCredit}
                        </div>
                      </div>
                    </a>

                    <div className="text-center mt-6 text-sm opacity-75">
                      Click anywhere to flip back
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <button
              onClick={() =>
                toggleSave(currentConcept.id, currentConcept.term, currentConcept.definition)
              }
              disabled={!user}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                savedTerms.has(currentConcept.id)
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${!user ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {savedTerms.has(currentConcept.id) ? (
                <>
                  <BookmarkCheck className="w-5 h-5" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-5 h-5" />
                  Save to Dictionary
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (currentCard < CONCEPTS.length - 1) {
                  setCurrentCard((prev) => prev + 1);
                  setFlipped(false);
                } else {
                  setView("quiz");
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
            >
              {currentCard < CONCEPTS.length - 1 ? "Next Concept" : "Take the Quiz"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Tap each card to flip it, learn the concept, and watch a short video for a deeper explanation.
          </p>
        </div>
      </div>
    );
  }

  if (view === "quiz") {
    const quizProgress = ((quizIndex + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900">Quiz Time</h2>
              <div className="text-sm font-bold text-gray-600">
                Question {quizIndex + 1} / {QUIZ_QUESTIONS.length}
              </div>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-600 transition-all duration-500"
                style={{ width: `${quizProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-500 mb-2">Scenario question</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {currentQuiz.question}
              </h3>
            </div>

            <div className="space-y-4">
              {currentQuiz.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = option.correct;

                let buttonClass =
                  "w-full text-left p-5 sm:p-6 rounded-2xl border-2 transition-all font-semibold";

                if (!showFeedback) {
                  buttonClass += isSelected
                    ? " border-blue-600 bg-blue-50"
                    : " border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                } else if (isSelected) {
                  buttonClass += isCorrect
                    ? " border-green-600 bg-green-50"
                    : " border-red-600 bg-red-50";
                } else if (isCorrect) {
                  buttonClass += " border-green-600 bg-green-50";
                } else {
                  buttonClass += " border-gray-200 opacity-50";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={showFeedback}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {option.id}
                      </div>
                      <div className="flex-1 text-sm sm:text-base">{option.text}</div>
                      {showFeedback && isSelected && (
                        <div className="text-2xl">{isCorrect ? "✓" : "✗"}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showFeedback && selectedAnswer && (
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-blue-50 border-2 border-blue-200">
                <p className="text-base sm:text-lg leading-relaxed">
                  {currentQuiz.options.find((o) => o.id === selectedAnswer)?.feedback}
                </p>
              </div>
            )}

            {showFeedback && (
              <div className="mt-8">
                <button
                  onClick={nextQuizQuestion}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                >
                  {quizIndex < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "See My Results"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-gray-600">
            Current Score: {quizScore} / {quizIndex + (showFeedback ? 1 : 0)}
          </div>
        </div>
      </div>
    );
  }

  if (view === "complete") {
    const finalScore = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-4 sm:p-8 flex items-center justify-center">
        <style jsx>{`
          @keyframes trophyBounce {
            0%,
            100% {
              transform: translateY(0) rotate(0deg);
            }
            25% {
              transform: translateY(-14px) rotate(-6deg);
            }
            50% {
              transform: translateY(-24px) rotate(6deg);
            }
            75% {
              transform: translateY(-14px) rotate(-3deg);
            }
          }

          @keyframes confettiFall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(420px) rotate(360deg);
              opacity: 0;
            }
          }

          .trophy-animate {
            animation: trophyBounce 2s ease-in-out infinite;
          }

          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            animation: confettiFall 3s linear infinite;
          }
        `}</style>

        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden isolate">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#FFD700", "#FF8A8A", "#7DD3FC", "#A78BFA", "#FDE68A"][i % 5],
                  animationDelay: `${Math.random() * 2.5}s`,
                  top: -10,
                }}
              />
            ))}

            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 trophy-animate">
              <svg
                className="w-full h-full"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" className="text-yellow-500" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" className="text-yellow-500" />
                <path d="M4 22h16" className="text-yellow-600" />
                <path
                  d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
                  className="text-yellow-600"
                />
                <path
                  d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
                  className="text-yellow-600"
                />
                <path
                  d="M18 2H6v7a6 6 0 0 0 12 0V2Z"
                  className="text-yellow-500"
                  fill="#FFD700"
                />
              </svg>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Lesson Complete
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-3">
              You scored{" "}
              <span className="font-black text-green-600 text-3xl">{finalScore}%</span> on the quiz.
            </p>

            <p className="text-sm text-gray-500 mb-8">
              Nice work. You’ve finished the lesson and built a strong beginner foundation in crypto.
            </p>

            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-6 sm:p-8 mb-8 mx-auto max-w-2xl border border-blue-100 shadow-inner">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-blue-100 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  You now understand the basics
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Your crypto foundation is getting stronger.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CONCEPTS.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl bg-white px-4 py-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm sm:text-base font-bold text-gray-800">
                      {c.term}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => onComplete(finalScore)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-5 rounded-full font-bold hover:scale-105 transition-transform shadow-lg text-lg"
              >
                Continue to Practice Games
              </button>

              <button
                onClick={() => {
                  setView("learn");
                  setCurrentCard(0);
                  setFlipped(false);
                  setQuizIndex(0);
                  setQuizScore(0);
                  setSelectedAnswer(null);
                  setShowFeedback(false);
                }}
                className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                Review Concepts Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}