"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { listDictionary, DictionaryTerm } from "@/lib/dictionary";
import Link from "next/link";

const CATEGORIES = ["ALL", "INCOME", "BUDGETING", "SAVINGS", "INVESTING", "WEALTH"];

// Extended type with required id
type DictionaryTermWithId = DictionaryTerm & { id: string };

export default function DictionaryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<"view" | "learn">("view");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [allTerms, setAllTerms] = useState<DictionaryTermWithId[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<DictionaryTermWithId[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Learn Mode State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredTerms, setMasteredTerms] = useState<Set<string>>(new Set());
  const [needsPractice, setNeedsPractice] = useState<Set<string>>(new Set());

  // Fetch dictionary terms from Firestore
  useEffect(() => {
    if (!user) {
      if (!authLoading) {
        router.push("/signin");
      }
      return;
    }

    async function fetchTerms() {
      if (!user) return; // Type guard for async function
      
      try {
        setLoading(true);
        const terms = await listDictionary(user.uid);
        // Filter out any terms without an id (shouldn't happen, but be safe)
        const termsWithId = terms.filter((t): t is DictionaryTermWithId => !!t.id);
        setAllTerms(termsWithId);
        setFilteredTerms(termsWithId);
      } catch (error) {
        console.error("Error fetching dictionary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTerms();
  }, [user, authLoading, router]);

  // Filter terms based on category and search
  useEffect(() => {
    let filtered = allTerms;
    
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(term => term.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(term => 
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.analogy?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTerms(filtered);
  }, [selectedCategory, searchQuery, allTerms]);

const getCategoryColor = (category?: string) => {
  const colors: Record<string, string> = {
    INCOME: "bg-emerald-100 text-emerald-700",
    BUDGETING: "bg-blue-100 text-blue-700",
    SAVINGS: "bg-purple-100 text-purple-700",
    INVESTING: "bg-rose-100 text-rose-700",
    WEALTH: "bg-amber-100 text-amber-700",
    GENERAL: "bg-slate-100 text-slate-600",
  };
  return colors[category ?? ""] || colors["GENERAL"];
};

const getCategoryLabel = (category?: string) => {
  return category && category.trim() ? category : "GENERAL";
};

  const handleMastered = async () => {
    const currentTerm = filteredTerms[currentCardIndex];
    if (!currentTerm || !user) return;

    // ✅ Write mastered status to Firestore so profile reflects it
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      await updateDoc(doc(db, "users", user.uid, "dictionary", currentTerm.id), {
        mastered: true,
      });
    } catch (e) {
      console.error("Failed to save mastered status", e);
    }

    setMasteredTerms((prev) => {
      const next = new Set(prev);
      next.add(currentTerm.id);
      return next;
    });

    setNeedsPractice((prev) => {
      const next = new Set(prev);
      next.delete(currentTerm.id);
      return next;
    });

    nextCard();
  };

  const handleNeedsPractice = () => {
    const currentTerm = filteredTerms[currentCardIndex];
    if (!currentTerm) return;

    setNeedsPractice((prev) => {
      const next = new Set(prev);
      next.add(currentTerm.id);
      return next;
    });

    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < filteredTerms.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const previousCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const resetProgress = () => {
    setMasteredTerms(new Set());
    setNeedsPractice(new Set());
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const currentCard = filteredTerms[currentCardIndex];
  const progress = filteredTerms.length > 0 ? ((currentCardIndex + 1) / filteredTerms.length) * 100 : 0;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dictionary...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && allTerms.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <button
  type="button"
  onClick={() => router.push("/")}
  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2 transition-colors"
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  Back to Dashboard
</button>
            <h1 className="text-3xl font-bold text-slate-900">Your Personal Dictionary</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="text-7xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Your Dictionary is Empty</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Start learning lessons and save terms to your personal dictionary! 
            Click the "+ Add to My Dictionary" button when you see a term you want to remember.
          </p>
          <button
            onClick={() => router.push("/lesson")}
            className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Start Learning →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
  type="button"
  onClick={() => router.push("/")}
  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2 transition-colors"
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  Back to Dashboard
</button>
              <h1 className="text-3xl font-bold text-slate-900">Your Personal Dictionary</h1>
              <p className="text-slate-600 mt-1">
                {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'} 
                {selectedCategory !== "ALL" || searchQuery ? ' found' : ' saved'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setMode("view")}
                className={`px-6 py-2.5 rounded-md font-semibold transition-all ${
                  mode === "view" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📚 View Mode
              </button>
              <button
                onClick={() => {
                  setMode("learn");
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                disabled={filteredTerms.length === 0}
                className={`px-6 py-2.5 rounded-md font-semibold transition-all ${
                  mode === "learn" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                } ${filteredTerms.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                🎯 Learn Mode
              </button>
            </div>
          </div>

          {/* Filters - Only show in View Mode */}
          {mode === "view" && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search terms or definitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg 
                    className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {mode === "view" ? (
          // VIEW MODE - Grid of Cards
          <div>
            {filteredTerms.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No terms found</h3>
                <p className="text-slate-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTerms.map(term => (
                  <div 
                    key={term.id} 
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all hover:border-blue-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {term.term}
                      </h3>
                      {term.category && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(term.category)}`}>
                          {getCategoryLabel(term.category)}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      {term.definition}
                    </p>
                    {term.analogy && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Analogy:</p>
                        <p className="text-sm text-slate-600 italic">"{term.analogy}"</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{term.moduleId || 'Saved term'}</span>
                      {masteredTerms.has(term.id) && (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Mastered
                        </span>
                      )}
                      {needsPractice.has(term.id) && !masteredTerms.has(term.id) && (
                        <span className="text-amber-600 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Practice
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // LEARN MODE - Flashcards
          <div className="max-w-3xl mx-auto">
            {filteredTerms.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No terms to practice</h3>
                <p className="text-slate-500">Add some terms to your dictionary first!</p>
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">
                      Card {currentCardIndex + 1} of {filteredTerms.length}
                    </span>
                    <span className="text-slate-500">
                      {masteredTerms.size} mastered • {needsPractice.size} need practice
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Flashcard */}
                {currentCard && (
                  <div 
                    className="relative h-[400px] cursor-pointer mb-6 perspective-1000"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div 
                      className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front of Card */}
                      <div className="absolute w-full h-full backface-hidden">
                        <div className="h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center text-white">
                          {currentCard.category && (
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold mb-6 ${getCategoryColor(currentCard.category)} bg-white`}>
                              {currentCard.category}
                            </div>
                          )}
                          <h2 className="text-4xl font-black text-center mb-6">
                            {currentCard.term}
                          </h2>
                          <p className="text-blue-100 text-center text-lg">
                            Click to reveal definition
                          </p>
                          {currentCard.moduleId && (
                            <div className="absolute bottom-8 text-blue-200 text-sm">
                              {currentCard.moduleId}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="absolute w-full h-full backface-hidden rotate-y-180">
                        <div className="h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center text-white">
                          <h3 className="text-2xl font-bold text-center mb-4">
                            {currentCard.term}
                          </h3>
                          <p className="text-xl text-center leading-relaxed text-emerald-50 mb-4">
                            {currentCard.definition}
                          </p>
                          {currentCard.analogy && (
                            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                              <p className="text-sm text-emerald-100 italic">
                                💡 {currentCard.analogy}
                              </p>
                            </div>
                          )}
                          <div className="absolute bottom-8 text-emerald-200 text-sm">
                            Click to flip back
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-col gap-4">
                  {/* Navigation */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previousCard();
                      }}
                      disabled={currentCardIndex === 0}
                      className="p-3 rounded-full bg-white border-2 border-slate-200 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <span className="text-slate-600 font-medium min-w-[100px] text-center">
                      {currentCardIndex + 1} / {filteredTerms.length}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextCard();
                      }}
                      disabled={currentCardIndex === filteredTerms.length - 1}
                      className="p-3 rounded-full bg-white border-2 border-slate-200 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Mastery Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleNeedsPractice}
                      className="py-4 px-6 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200 transition-all border-2 border-amber-200 hover:border-amber-300"
                    >
                      📝 Need More Practice
                    </button>
                    <button
                      onClick={handleMastered}
                      className="py-4 px-6 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-all border-2 border-emerald-200 hover:border-emerald-300"
                    >
                      ✓ I Know This!
                    </button>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetProgress}
                    className="py-3 px-6 bg-white text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all border border-slate-200"
                  >
                    🔄 Reset Progress
                  </button>
                </div>

                {/* Progress Summary */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
                    <div className="text-2xl font-black text-blue-600">{filteredTerms.length}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Terms</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                    <div className="text-2xl font-black text-emerald-600">{masteredTerms.size}</div>
                    <div className="text-sm text-emerald-700 mt-1">Mastered</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                    <div className="text-2xl font-black text-amber-600">{needsPractice.size}</div>
                    <div className="text-sm text-amber-700 mt-1">Practice</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}