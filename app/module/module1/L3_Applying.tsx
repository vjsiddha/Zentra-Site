"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface L3Props {
  onComplete: (score: number) => void;
}

// Constants
const PRIMARY = "#0B5E8E";
const BLUE_TINT = "#EAF4FF";
const BLUE_RING = "#D6E6F7";

// ============== SCENARIO DATA ==============

interface Scenario {
  id: string;
  label: string;
  persona: {
    name: string;
    age: number;
    occupation: string;
    income: string;
    additionalIncome?: string;
    image: string;
    description: string;
  };
  keyAspects: { title: string; desc: string }[];
  decisions: {
    housing: { optionA: DecisionOption; optionB: DecisionOption };
    transport: { optionA: DecisionOption; optionB: DecisionOption };
    thirdChoice: { 
      title: string;
      optionA: DecisionOption; 
      optionB: DecisionOption;
    };
  };
  baseLiving: number;
  monthlyIncome: number;
  investmentFocus: string;
  goals: string[];
}

interface DecisionOption {
  title: string;
  subtitle: string;
  cost: number;
}

const SCENARIOS: Record<string, Scenario> = {
  career: {
    id: "career",
    label: "Starting Your Career",
    persona: {
      name: "Jack",
      age: 25,
      occupation: "Software Engineer",
      income: "$75K/year",
      additionalIncome: "$5K side hustle",
      image: "https://static.vecteezy.com/system/resources/previews/047/643/782/non_2x/cheerful-guy-cartoon-character-smiling-icon-isolated-vector.jpg",
      description: "He's saving for a condo, paying off student loans, and still wants to enjoy weekend trips—can you help him budget smartly while still having fun?",
    },
    keyAspects: [
      { title: "Student Loan Management", desc: "Minimize interest costs while building savings for future goals." },
      { title: "Emergency Fund", desc: "Build a 3-6 month safety net before aggressive investing." },
      { title: "Career Growth", desc: "Consider investing in skills that increase earning potential." },
    ],
    decisions: {
      housing: {
        optionA: { title: "Rent an Apartment", subtitle: "Lower costs, more flexibility", cost: 1500 },
        optionB: { title: "Rent with Roommates", subtitle: "Save more, less privacy", cost: 900 },
      },
      transport: {
        optionA: { title: "Public Transit", subtitle: "Cost-effective, eco-friendly", cost: 100 },
        optionB: { title: "Own a Car", subtitle: "Convenient but expensive", cost: 500 },
      },
      thirdChoice: {
        title: "Education Investment",
        optionA: { title: "No Further Education", subtitle: "Focus on current role", cost: 0 },
        optionB: { title: "Online Certifications", subtitle: "Boost career prospects", cost: 200 },
      },
    },
    baseLiving: 1500,
    monthlyIncome: 6667,
    investmentFocus: "Growth stocks and index funds for long-term wealth building",
    goals: ["Emergency Fund", "Student Loan Payoff", "Down Payment", "Retirement", "Travel"],
  },
  home: {
    id: "home",
    label: "Buying Your First Home",
    persona: {
      name: "Maria",
      age: 32,
      occupation: "Marketing Manager",
      income: "$95K/year",
      additionalIncome: "$8K annual bonus",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3jhKXEmq2zlyu0XdUXCYd1idr9EiASXjlQw&s",
      description: "She's been renting for years and finally ready to buy. With $40K saved, she needs to decide between a starter home or waiting for her dream place.",
    },
    keyAspects: [
      { title: "Down Payment Strategy", desc: "Balance between larger down payment and keeping emergency reserves." },
      { title: "Hidden Costs", desc: "Property taxes, insurance, maintenance add 20-30% to mortgage payment." },
      { title: "Location vs. Size", desc: "Commute costs vs. square footage trade-offs." },
    ],
    decisions: {
      housing: {
        optionA: { title: "Starter Condo ($300K)", subtitle: "20% down, lower payments", cost: 1800 },
        optionB: { title: "Single Family Home ($450K)", subtitle: "5% down, higher payments", cost: 2800 },
      },
      transport: {
        optionA: { title: "Keep Current Car", subtitle: "Paid off, reliable", cost: 200 },
        optionB: { title: "New Fuel-Efficient Car", subtitle: "Lower gas, car payment", cost: 550 },
      },
      thirdChoice: {
        title: "Home Improvements",
        optionA: { title: "DIY Gradually", subtitle: "Save money, takes time", cost: 100 },
        optionB: { title: "Renovate Immediately", subtitle: "Instant upgrades, costly", cost: 500 },
      },
    },
    baseLiving: 1800,
    monthlyIncome: 8583,
    investmentFocus: "Home equity building and diversified investments",
    goals: ["Down Payment", "Emergency Fund", "Home Repairs", "Retirement", "Vacation"],
  },
  retirement: {
    id: "retirement",
    label: "Planning for Retirement",
    persona: {
      name: "Robert",
      age: 52,
      occupation: "Senior Accountant",
      income: "$120K/year",
      additionalIncome: "Rental income $800/month",
      image: "https://img.freepik.com/premium-vector/cute-smiling-adult-man-with-beard-mustache-flat-style-vector-illustration_710508-2331.jpg",
      description: "With 13 years until retirement, he needs to maximize savings while supporting his daughter's college education and caring for aging parents.",
    },
    keyAspects: [
      { title: "Catch-Up Contributions", desc: "Maximize 401(k) and IRA contributions with catch-up provisions." },
      { title: "Healthcare Planning", desc: "Bridge the gap between retirement and Medicare eligibility." },
      { title: "Social Security Timing", desc: "Delaying benefits increases monthly payments significantly." },
    ],
    decisions: {
      housing: {
        optionA: { title: "Stay in Current Home", subtitle: "Familiar, higher maintenance", cost: 2200 },
        optionB: { title: "Downsize Now", subtitle: "Lower costs, free up equity", cost: 1500 },
      },
      transport: {
        optionA: { title: "Keep Two Cars", subtitle: "Flexibility for both spouses", cost: 600 },
        optionB: { title: "Go to One Car", subtitle: "Significant savings", cost: 300 },
      },
      thirdChoice: {
        title: "Parent Care",
        optionA: { title: "In-Home Care Support", subtitle: "Help parents stay home", cost: 400 },
        optionB: { title: "Assisted Living Contribution", subtitle: "Professional care", cost: 800 },
      },
    },
    baseLiving: 2500,
    monthlyIncome: 10800,
    investmentFocus: "Shift toward bonds and dividend stocks for stability",
    goals: ["Retirement Fund", "College Fund", "Healthcare Reserve", "Parent Care", "Travel"],
  },
  debt: {
    id: "debt",
    label: "Managing Debt",
    persona: {
      name: "Ashley",
      age: 29,
      occupation: "Registered Nurse",
      income: "$68K/year",
      additionalIncome: "Overtime available",
      image: "https://img.icons8.com/bubbles/1200/brown-curly-hair-lady-with-earrings.jpg",
      description: "With $45K in student loans and $12K in credit card debt, she's determined to become debt-free. She needs a strategy that's aggressive but sustainable.",
    },
    keyAspects: [
      { title: "Debt Avalanche vs. Snowball", desc: "Pay highest interest first or smallest balance for motivation?" },
      { title: "Balance Transfer Options", desc: "0% APR cards can save thousands in interest." },
      { title: "Income Boosting", desc: "Overtime and side gigs accelerate debt payoff." },
    ],
    decisions: {
      housing: {
        optionA: { title: "Keep Current Apartment", subtitle: "Comfortable but pricey", cost: 1400 },
        optionB: { title: "Move to Cheaper Area", subtitle: "30 min longer commute", cost: 950 },
      },
      transport: {
        optionA: { title: "Keep Car (with payment)", subtitle: "Reliable, $350/month left", cost: 500 },
        optionB: { title: "Sell Car, Use Transit", subtitle: "Eliminate car payment", cost: 150 },
      },
      thirdChoice: {
        title: "Debt Strategy",
        optionA: { title: "Minimum Payments + Save", subtitle: "Build emergency fund first", cost: 800 },
        optionB: { title: "Aggressive Debt Payoff", subtitle: "All extra to debt", cost: 1200 },
      },
    },
    baseLiving: 1200,
    monthlyIncome: 5667,
    investmentFocus: "Minimal investing until high-interest debt is cleared",
    goals: ["Credit Card Payoff", "Student Loan Payoff", "Emergency Fund", "Retirement Start", "Vacation Fund"],
  },
  education: {
    id: "education",
    label: "Saving for Education",
    persona: {
      name: "David & Lisa",
      age: 38,
      occupation: "Teacher & IT Specialist",
      income: "$130K combined",
      additionalIncome: "Summer tutoring $3K",
      image: "https://thumbs.dreamstime.com/b/happy-couple-smiling-cartoon-vector-illustration-avatar-icons-400085032.jpg",
      description: "With twins starting high school, they have 4 years to save for college. They want to fund education without sacrificing their own retirement.",
    },
    keyAspects: [
      { title: "529 Plan Benefits", desc: "Tax-advantaged growth and withdrawals for education." },
      { title: "Financial Aid Impact", desc: "How savings affect potential scholarships and aid." },
      { title: "Student Contribution", desc: "Part-time work and loans as part of the plan." },
    ],
    decisions: {
      housing: {
        optionA: { title: "Stay in Family Home", subtitle: "Good school district", cost: 2400 },
        optionB: { title: "Refinance Mortgage", subtitle: "Lower rate, extend term", cost: 2000 },
      },
      transport: {
        optionA: { title: "Two Reliable Cars", subtitle: "Current setup works", cost: 700 },
        optionB: { title: "One New, One Used", subtitle: "Replace aging vehicle", cost: 900 },
      },
      thirdChoice: {
        title: "Education Savings",
        optionA: { title: "Max 529 Contributions", subtitle: "$500/month per child", cost: 1000 },
        optionB: { title: "Moderate 529 + Taxable", subtitle: "More flexibility", cost: 700 },
      },
    },
    baseLiving: 2800,
    monthlyIncome: 11083,
    investmentFocus: "Age-based 529 portfolios shifting conservative as college nears",
    goals: ["College Fund", "Retirement", "Emergency Fund", "Home Maintenance", "Family Vacation"],
  },
};

const STAGES = Object.values(SCENARIOS).map(s => ({ label: s.label, id: s.id }));

type Goal = string;

type QuizAnswer = "GICs" | "Savings Accounts";

export default function L3_Applying({ onComplete }: L3Props) {
  const [view, setView] = useState<"select" | "persona" | "decisions" | "invest" | "prioritize" | "results">("select");
  
  // Selected scenario
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const scenario = selectedStageId ? SCENARIOS[selectedStageId] : null;

  // Decision states
  const [housingChoice, setHousingChoice] = useState<"A" | "B">("A");
  const [transportChoice, setTransportChoice] = useState<"A" | "B">("A");
  const [thirdChoice, setThirdChoice] = useState<"A" | "B">("A");

  // Investment states
  const [q1, setQ1] = useState<QuizAnswer | null>(null);
  const [q2, setQ2] = useState<QuizAnswer | null>(null);
  const [q3, setQ3] = useState<QuizAnswer | null>(null);
  const [savingsAllocation, setSavingsAllocation] = useState(50);

  // Prioritize states
  const [available, setAvailable] = useState<Goal[]>([]);
  const [ranked, setRanked] = useState<Goal[]>([]);
  const [dragged, setDragged] = useState<Goal | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [priorityResult, setPriorityResult] = useState<"ideal" | "good" | "adjust" | null>(null);
  const timerRef = useRef<number | null>(null);

  // Scores
  const [decisionScore, setDecisionScore] = useState(0);
  const [investScore, setInvestScore] = useState(0);
  const [priorityScore, setPriorityScore] = useState(0);

  // Initialize goals when scenario changes
  useEffect(() => {
    if (scenario) {
      setAvailable([...scenario.goals]);
      setRanked([]);
    }
  }, [scenario]);

  // Timer for prioritize game
  useEffect(() => {
    if (view === "prioritize" && secondsLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    }
  }, [view, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  // Calculated costs
  const getHousingCost = () => scenario ? (housingChoice === "A" ? scenario.decisions.housing.optionA.cost : scenario.decisions.housing.optionB.cost) : 0;
  const getTransportCost = () => scenario ? (transportChoice === "A" ? scenario.decisions.transport.optionA.cost : scenario.decisions.transport.optionB.cost) : 0;
  const getThirdCost = () => scenario ? (thirdChoice === "A" ? scenario.decisions.thirdChoice.optionA.cost : scenario.decisions.thirdChoice.optionB.cost) : 0;
  
  const totalMonthlySpending = scenario ? scenario.baseLiving + getHousingCost() + getTransportCost() + getThirdCost() : 0;
  const monthlySurplus = scenario ? scenario.monthlyIncome - totalMonthlySpending : 0;

  // Calculate decision score based on scenario
  const calculateDecisionScore = () => {
    if (!scenario) return 0;
    let score = 50; // Base score
    
    // Reward positive cash flow
    if (monthlySurplus > scenario.monthlyIncome * 0.2) score += 30;
    else if (monthlySurplus > scenario.monthlyIncome * 0.1) score += 20;
    else if (monthlySurplus > 0) score += 10;
    else score -= 20;

    // Scenario-specific scoring
    if (scenario.id === "debt" && thirdChoice === "B") score += 10; // Aggressive payoff
    if (scenario.id === "career" && housingChoice === "B") score += 10; // Roommates save money
    if (scenario.id === "retirement" && housingChoice === "B") score += 10; // Downsizing is smart
    if (scenario.id === "education" && thirdChoice === "A") score += 10; // Max 529
    
    return Math.max(0, Math.min(100, score));
  };

  const calculateInvestScore = () => {
    let score = 25; // Base for completing
    if (q1 === "Savings Accounts") score += 25;
    if (q2 === "GICs") score += 25;
    if (q3 === "GICs") score += 25;
    return score;
  };

  const calculatePriorityScore = () => {
    if (!scenario || ranked.length < 5) return 0;
    let score = 0;
    // First priority should match scenario needs
    const idealFirst = scenario.goals[0];
    if (ranked[0] === idealFirst) score += 40;
    else if (ranked[1] === idealFirst) score += 20;
    
    // General good ordering
    ranked.forEach((goal, idx) => {
      if (scenario.goals.indexOf(goal) <= idx + 1) score += 12;
    });
    
    return Math.min(100, score);
  };

  // Handlers
  const handleBack = () => {
    if (view === "persona") setView("select");
    else if (view === "decisions") setView("persona");
    else if (view === "invest") setView("decisions");
    else if (view === "prioritize") setView("invest");
  };

  const handleRedo = () => {
    setView("select");
    setSelectedStageId(null);
    setHousingChoice("A");
    setTransportChoice("A");
    setThirdChoice("A");
    setQ1(null);
    setQ2(null);
    setQ3(null);
    setAvailable([]);
    setRanked([]);
    setSecondsLeft(90);
    setPriorityResult(null);
    setDecisionScore(0);
    setInvestScore(0);
    setPriorityScore(0);
  };

  const handleDecisionsComplete = () => {
    setDecisionScore(calculateDecisionScore());
    setView("invest");
  };

  const handleInvestComplete = () => {
    setInvestScore(calculateInvestScore());
    setView("prioritize");
  };

  const handlePriorityCheck = () => {
    if (ranked.length < 5) {
      setPriorityResult("adjust");
      return;
    }
    const score = calculatePriorityScore();
    setPriorityScore(score);
    if (score >= 80) setPriorityResult("ideal");
    else if (score >= 50) setPriorityResult("good");
    else setPriorityResult("adjust");
  };

  // Drag handlers
  const onDragStart = (g: Goal) => setDragged(g);
  const onDragEnd = () => setDragged(null);
  
  const onDropToRanked = () => {
    if (!dragged) return;
    if (available.includes(dragged) && !ranked.includes(dragged)) {
      setAvailable((arr) => arr.filter((x) => x !== dragged));
      setRanked((arr) => [...arr, dragged]);
    }
    setDragged(null);
  };
  
  const onDropToAvailable = () => {
    if (!dragged || !scenario) return;
    if (ranked.includes(dragged)) {
      setRanked((arr) => arr.filter((x) => x !== dragged));
      setAvailable((arr) => {
        const next = [...arr, dragged];
        return scenario.goals.filter((g) => next.includes(g));
      });
    }
    setDragged(null);
  };

  const removeFromRanked = (g: Goal) => {
    if (!scenario) return;
    setRanked((arr) => arr.filter((x) => x !== g));
    setAvailable((arr) => {
      const next = [...arr, g];
      return scenario.goals.filter((x) => next.includes(x));
    });
  };

  // Final score
  const totalScore = Math.round((decisionScore + investScore + priorityScore) / 3);
  const passed = totalScore >= 60;

  // Back Button Component
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

  // VIEW 1: SELECT LIFE STAGE
  if (view === "select") {
    return (
      <main className="min-h-screen bg-[#F7FAFC] grid place-items-center py-10">
        <section className="w-full mx-auto max-w-4xl px-4 sm:px-6">
          <header className="mb-10 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-full mb-4">
            <span className="text-sm font-bold uppercase tracking-widest">Lesson 3</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Apply Your Knowledge
            </h2>
            <p className="mt-3 mx-auto max-w-3xl text-slate-600">
              Choose a real-life scenario and help someone make smart financial decisions.
              Each scenario has unique challenges and goals!
            </p>
          </header>

          <div className="mx-auto max-w-2xl">
            <h3 className="mb-4 text-center text-lg font-semibold text-slate-800">
              Select a Life Stage
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`px-5 py-3 rounded-full font-semibold transition-all ${
                    selectedStageId === stage.id
                      ? "bg-[#0B5E8E] text-white shadow-lg scale-105"
                      : "bg-white text-slate-700 border border-slate-300 hover:border-[#0B5E8E] hover:text-[#0B5E8E]"
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>

            {/* Preview of selected scenario */}
            {scenario && (
              <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={scenario.persona.image} alt={scenario.persona.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Meet {scenario.persona.name}!</h4>
                    <p className="text-sm text-slate-600">{scenario.persona.age} • {scenario.persona.occupation}</p>
                    <p className="text-sm text-emerald-600 font-medium">{scenario.persona.income}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                disabled={!selectedStageId}
                onClick={() => setView("persona")}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-white font-bold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: PRIMARY }}
              >
                Start This Scenario
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!scenario) return null;

  // VIEW 2: PERSONA OVERVIEW
  if (view === "persona") {
    return (
      <main className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20">
          <header className="mb-8">
            <div className="inline-flex items-center px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-3">
              {scenario.label}
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Scenario Overview
            </h2>
          </header>

          <div className="grid gap-10 md:grid-cols-2 items-start">
            {/* Illustration */}
            <div
              className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1"
              style={{ backgroundColor: BLUE_TINT, borderColor: BLUE_RING }}
            >
              <Image
                src={scenario.persona.image}
                alt={scenario.persona.name}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 560px, 100vw"
              />
            </div>

            {/* Persona */}
            <article className="max-w-[620px]">
              <h3 className="text-2xl font-bold text-slate-900">Meet {scenario.persona.name}!</h3>
              <ul className="mt-3 space-y-1 text-slate-700">
                <li><span className="font-medium">Age:</span> {scenario.persona.age}</li>
                <li><span className="font-medium">Occupation:</span> {scenario.persona.occupation}</li>
                <li><span className="font-medium">Income:</span> {scenario.persona.income}</li>
                {scenario.persona.additionalIncome && (
                  <li><span className="font-medium">Additional:</span> {scenario.persona.additionalIncome}</li>
                )}
              </ul>
              <p className="mt-4 leading-7 text-slate-700">
                {scenario.persona.description}
              </p>

              {/* Monthly Income Highlight */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-700">
                  <span className="font-bold">Monthly Income:</span> ${scenario.monthlyIncome.toLocaleString()}
                </p>
              </div>
            </article>
          </div>

          {/* Divider */}
          <div className="my-10 h-px w-full" style={{ backgroundColor: BLUE_RING }} />

          {/* Key Aspects */}
          <div>
            <h4 className="text-2xl font-bold text-slate-900">Key Financial Challenges</h4>
            <div className="mt-6 space-y-4">
              {scenario.keyAspects.map((aspect, i) => (
                <AspectCard key={i} title={aspect.title} desc={aspect.desc} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={() => setView("decisions")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-semibold shadow"
              style={{ backgroundColor: PRIMARY }}
            >
              Help {scenario.persona.name} Make Decisions
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // VIEW 3: BUDGET DECISIONS
  if (view === "decisions") {
    return (
      <main className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-24">
          <header>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Help {scenario.persona.name} Budget!
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Make smart financial choices for {scenario.persona.name}'s situation.
            </p>
          </header>

          {/* Decisions */}
          <section className="mt-10 space-y-8">
            {/* Housing */}
            <DecisionGroup title="Housing">
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  title={scenario.decisions.housing.optionA.title}
                  subtitle={scenario.decisions.housing.optionA.subtitle}
                  detail={`Monthly cost: $${scenario.decisions.housing.optionA.cost.toLocaleString()}`}
                  active={housingChoice === "A"}
                  onClick={() => setHousingChoice("A")}
                />
                <OptionCard
                  title={scenario.decisions.housing.optionB.title}
                  subtitle={scenario.decisions.housing.optionB.subtitle}
                  detail={`Monthly cost: $${scenario.decisions.housing.optionB.cost.toLocaleString()}`}
                  active={housingChoice === "B"}
                  onClick={() => setHousingChoice("B")}
                />
              </div>
            </DecisionGroup>

            {/* Transportation */}
            <DecisionGroup title="Transportation">
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  title={scenario.decisions.transport.optionA.title}
                  subtitle={scenario.decisions.transport.optionA.subtitle}
                  detail={`Monthly cost: $${scenario.decisions.transport.optionA.cost.toLocaleString()}`}
                  active={transportChoice === "A"}
                  onClick={() => setTransportChoice("A")}
                />
                <OptionCard
                  title={scenario.decisions.transport.optionB.title}
                  subtitle={scenario.decisions.transport.optionB.subtitle}
                  detail={`Monthly cost: $${scenario.decisions.transport.optionB.cost.toLocaleString()}`}
                  active={transportChoice === "B"}
                  onClick={() => setTransportChoice("B")}
                />
              </div>
            </DecisionGroup>

            {/* Third Choice (Scenario-specific) */}
            <DecisionGroup title={scenario.decisions.thirdChoice.title}>
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  title={scenario.decisions.thirdChoice.optionA.title}
                  subtitle={scenario.decisions.thirdChoice.optionA.subtitle}
                  detail={`Monthly cost: $${scenario.decisions.thirdChoice.optionA.cost.toLocaleString()}`}
                  active={thirdChoice === "A"}
                  onClick={() => setThirdChoice("A")}
                />
                <OptionCard
                  title={scenario.decisions.thirdChoice.optionB.title}
                  subtitle={scenario.decisions.thirdChoice.optionB.subtitle}
                  detail={`Monthly cost: $${scenario.decisions.thirdChoice.optionB.cost.toLocaleString()}`}
                  active={thirdChoice === "B"}
                  onClick={() => setThirdChoice("B")}
                />
              </div>
            </DecisionGroup>
          </section>

          {/* Spending Overview */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Spending Overview</h2>

            <div className="grid gap-4 lg:grid-cols-3 mb-6">
              <SummaryCard label="Monthly Income" value={`$${scenario.monthlyIncome.toLocaleString()}`} tone="positive" />
              <SummaryCard label="Total Spending" value={`$${totalMonthlySpending.toLocaleString()}`} />
              <SummaryCard 
                label="Monthly Surplus" 
                value={`$${monthlySurplus.toLocaleString()}`} 
                tone={monthlySurplus >= 0 ? "positive" : "negative"} 
              />
            </div>

            {/* Cash Flow Status */}
            <div className={`p-4 rounded-2xl ${monthlySurplus >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold ${monthlySurplus >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {monthlySurplus >= 0 
                  ? `✓ Great! ${scenario.persona.name} has $${monthlySurplus.toLocaleString()} left for savings and goals.`
                  : `⚠️ Warning: ${scenario.persona.name} is spending $${Math.abs(monthlySurplus).toLocaleString()} more than they earn!`
                }
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleDecisionsComplete}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-semibold shadow"
              style={{ backgroundColor: PRIMARY }}
            >
              Continue to Investments
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // VIEW 4: INVESTMENT STRATEGY
  if (view === "invest") {
    return (
      <main className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-24">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {scenario.persona.name}'s Investment Strategy
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              <strong>Focus:</strong> {scenario.investmentFocus}
            </p>
          </header>

          {/* Investment Quiz */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Investment Knowledge Check</h2>

            <QuizQuestion
              n={1}
              question={`If ${scenario.persona.name} needs access to funds within a year, which option is best?`}
              options={["GICs", "Savings Accounts"]}
              value={q1}
              onChange={(v) => setQ1(v as QuizAnswer)}
              explanation={q1 === "Savings Accounts" 
                ? "✓ Correct! Savings accounts offer flexible access." 
                : q1 ? "✗ GICs lock funds for a fixed term." : null}
            />

            <QuizQuestion
              n={2}
              question="Which investment offers more security for someone risk-averse?"
              options={["GICs", "Savings Accounts"]}
              value={q2}
              onChange={(v) => setQ2(v as QuizAnswer)}
              explanation={q2 === "GICs" 
                ? "✓ Correct! GICs guarantee a fixed rate." 
                : q2 ? "✗ Savings rates can vary." : null}
            />

            <QuizQuestion
              n={3}
              question="Which investment type typically offers higher returns?"
              options={["GICs", "Savings Accounts"]}
              value={q3}
              onChange={(v) => setQ3(v as QuizAnswer)}
              explanation={q3 === "GICs" 
                ? "✓ Correct! GICs offer higher returns for locking in funds." 
                : q3 ? "✗ Savings accounts typically have lower returns." : null}
            />
          </section>

          {/* Savings Allocation */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              How should {scenario.persona.name} split their ${monthlySurplus > 0 ? monthlySurplus.toLocaleString() : 0} monthly surplus?
            </h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-2">
                <span className="text-emerald-600 font-medium">Savings: {savingsAllocation}%</span>
                <span className="text-violet-600 font-medium">Investing: {100 - savingsAllocation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={savingsAllocation}
                onChange={(e) => setSavingsAllocation(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between mt-4 text-sm">
                <div className="text-center">
                  <p className="text-slate-500">To Savings</p>
                  <p className="font-bold text-emerald-600">${Math.round((monthlySurplus > 0 ? monthlySurplus : 0) * savingsAllocation / 100).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">To Investments</p>
                  <p className="font-bold text-violet-600">${Math.round((monthlySurplus > 0 ? monthlySurplus : 0) * (100 - savingsAllocation) / 100).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              onClick={handleInvestComplete}
              disabled={!q1 || !q2 || !q3}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-semibold shadow disabled:opacity-40"
              style={{ backgroundColor: PRIMARY }}
            >
              Continue to Goal Prioritization
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // VIEW 5: PRIORITIZE GOALS
  if (view === "prioritize") {
    return (
      <main className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-14 pb-24">
          <header className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Prioritize {scenario.persona.name}'s Goals
            </h1>
            <p className="mt-2 text-slate-600">
              Drag and drop to rank financial objectives from most to least important for {scenario.persona.name}'s situation.
            </p>
          </header>

          {/* Available chips */}
          <div
            className="mb-4 flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-100 rounded-xl"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropToAvailable}
          >
            <p className="text-sm text-slate-500 w-full mb-2">Available goals:</p>
            {available.map((g) => (
              <div
                key={g}
                draggable
                onDragStart={() => onDragStart(g)}
                onDragEnd={onDragEnd}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-sky-400"
              >
                {g}
              </div>
            ))}
            {available.length === 0 && <p className="text-slate-400 italic">All goals ranked!</p>}
          </div>

          {/* Drop zone */}
          <div
            className="rounded-xl border-2 border-dashed border-slate-300 bg-white/70 p-4 min-h-[120px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropToRanked}
          >
            <p className="text-sm text-slate-500 mb-3">Drop goals here in priority order (1 = highest):</p>
            {ranked.length === 0 ? (
              <span className="text-slate-400 italic">Drag goals here...</span>
            ) : (
              <ol className="flex flex-wrap gap-2">
                {ranked.map((g, i) => (
                  <div
                    key={g}
                    draggable
                    onDragStart={() => onDragStart(g)}
                    onDragEnd={onDragEnd}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-sky-400 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 shadow-sm cursor-grab"
                  >
                    <span className="font-bold">{i + 1}.</span> {g}
                    <button
                      onClick={() => removeFromRanked(g)}
                      className="ml-1 w-5 h-5 rounded-full bg-sky-200 text-sky-700 hover:bg-sky-300 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </ol>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <LegendItem tone="ideal" active={priorityResult === "ideal"}>Ideal</LegendItem>
            <LegendItem tone="good" active={priorityResult === "good"}>Good</LegendItem>
            <LegendItem tone="adjust" active={priorityResult === "adjust"}>Needs Adjustment</LegendItem>
          </div>

          {/* Timer */}
          <div className="mt-8 grid grid-cols-2 gap-6 max-w-xs">
            <TimeBox label="Minutes" value={minutes} />
            <TimeBox label="Seconds" value={seconds} />
          </div>

          {/* Result feedback */}
          {priorityResult && (
            <div className={`mt-6 p-4 rounded-2xl ${
              priorityResult === "ideal" ? "bg-emerald-50 border border-emerald-200" :
              priorityResult === "good" ? "bg-sky-50 border border-sky-200" :
              "bg-amber-50 border border-amber-200"
            }`}>
              <p className={`font-semibold ${
                priorityResult === "ideal" ? "text-emerald-700" :
                priorityResult === "good" ? "text-sky-700" :
                "text-amber-700"
              }`}>
                {priorityResult === "ideal" && `🎉 Perfect! You've nailed ${scenario.persona.name}'s priorities!`}
                {priorityResult === "good" && `👍 Good job! Your priorities make sense for ${scenario.persona.name}.`}
                {priorityResult === "adjust" && `💡 Hint: For ${scenario.persona.name}, "${scenario.goals[0]}" should be a top priority.`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                if (scenario) {
                  setAvailable([...scenario.goals]);
                  setRanked([]);
                  setPriorityResult(null);
                }
              }}
              className="px-5 py-2.5 rounded-full font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-white"
            >
              Reset
            </button>
            <button
              onClick={handlePriorityCheck}
              className="px-6 py-3 rounded-full font-semibold text-white shadow"
              style={{ backgroundColor: PRIMARY }}
            >
              Check Priority
            </button>
          </div>

          {priorityResult && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setView("results")}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-semibold shadow"
                style={{ backgroundColor: "#059669" }}
              >
                See Final Results
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  // VIEW 6: RESULTS
  return (
    <main className="min-h-screen bg-[#F7FAFC] py-10">
      <section className="mx-auto max-w-2xl px-4">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
          <div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {passed ? "Lesson 3 Complete!" : "Keep Practicing!"}
          </h2>
          <p className="text-slate-600 mb-2">
            You helped <strong>{scenario.persona.name}</strong> with their "{scenario.label}" journey!
          </p>
          <p className="text-slate-500 mb-8 text-sm">
            {passed 
              ? "Great work applying your financial knowledge to a real-world scenario." 
              : "You need 60% to complete this lesson. Try different choices!"}
          </p>

          {/* Overall Score */}
          <div className={`w-36 h-36 mx-auto rounded-full flex items-center justify-center mb-8 ${
            passed ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            <div className="text-center">
              <p className={`text-5xl font-black ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {totalScore}%
              </p>
              <p className="text-xs text-slate-500">Overall</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Decisions</p>
              <p className="text-2xl font-black text-slate-800">{decisionScore}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Investment</p>
              <p className="text-2xl font-black text-slate-800">{investScore}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Priorities</p>
              <p className="text-2xl font-black text-slate-800">{priorityScore}%</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {passed ? (
              <button
                onClick={() => onComplete(totalScore)}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
              >
                Complete Module 1 →
              </button>
            ) : (
              <button
                onClick={handleRedo}
                className="w-full py-5 text-white rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: PRIMARY }}
              >
                Try Again →
              </button>
            )}
            <button
              onClick={handleRedo}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Try Different Scenario
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------------- Helper Components ---------------------- */

function AspectCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl p-4 ring-1 bg-white" style={{ borderColor: "#E8EEF6" }}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: BLUE_TINT, color: PRIMARY }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l9 4-9 4-9-4 9-4Zm0 8l9 4-9 4-9-4 9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <p className="mt-0.5 text-slate-700">{desc}</p>
      </div>
    </div>
  );
}

function DecisionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function OptionCard({ title, subtitle, detail, active, onClick }: {
  title: string;
  subtitle: string;
  detail: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition ${
        active ? "border-sky-400 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600">{subtitle}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{detail}</div>
    </button>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  const ring = tone === "positive" ? "ring-emerald-200" : tone === "negative" ? "ring-rose-200" : "ring-slate-200";
  const bg = tone === "positive" ? "bg-emerald-50" : tone === "negative" ? "bg-rose-50" : "bg-white";
  return (
    <div className={`rounded-2xl p-4 ring-1 ${bg} ${ring}`}>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function QuizQuestion({ n, question, options, value, onChange, explanation }: {
  n: number;
  question: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  explanation: string | null;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-700">Question {n}</div>
      <p className="mt-1 text-slate-800">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              value === opt
                ? "bg-sky-100 text-sky-800 border-2 border-sky-400"
                : "bg-white text-slate-700 border border-slate-300 hover:border-sky-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {explanation && (
        <p className={`mt-3 text-sm ${explanation.startsWith("✓") ? "text-emerald-700" : "text-amber-700"}`}>
          {explanation}
        </p>
      )}
    </div>
  );
}

function LegendItem({ tone, active, children }: { tone: "ideal" | "good" | "adjust"; active?: boolean; children: React.ReactNode }) {
  const map = {
    ideal: { icon: "😊", color: active ? "text-emerald-700 font-bold" : "text-emerald-600" },
    good: { icon: "🙂", color: active ? "text-sky-700 font-bold" : "text-sky-600" },
    adjust: { icon: "😐", color: active ? "text-amber-700 font-bold" : "text-amber-600" },
  }[tone];
  return (
    <div className={`inline-flex items-center gap-2 ${map.color}`}>
      <span>{map.icon}</span>
      <span className="text-slate-700">{children}</span>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="rounded-2xl bg-slate-200 py-6 text-2xl font-extrabold text-slate-900 tracking-widest">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-600">{label}</div>
    </div>
  );
}