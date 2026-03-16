// lib/zenbot-context.ts

export interface ModuleMeta {
  id: string;
  title: string;
  keyConcepts: string[];
  lessonSummaries: {
    L1: string;
    L2: string;
    L3: string;
  };
}

export const MODULE_CONTENT: ModuleMeta[] = [
  {
    id: "module1",
    title: "Introduction to Personal Finance",
    keyConcepts: ["budgeting", "income vs expenses", "needs vs wants", "financial goals", "net worth"],
    lessonSummaries: {
      L1: "Defined core terms: income, expenses, budget, net worth, assets, liabilities, needs vs wants.",
      L2: "Interactive budget builder — categorizing spending and identifying areas to cut.",
      L3: "Applied budgeting to a real-life scenario: building a monthly budget for a fictional character.",
    },
  },
  {
    id: "module2",
    title: "Saving & Emergency Funds",
    keyConcepts: ["emergency fund", "savings rate", "pay yourself first", "HYSA", "3-6 month rule"],
    lessonSummaries: {
      L1: "Defined emergency fund, savings rate, HYSA (high-yield savings account), liquidity.",
      L2: "Interactive savings calculator — how long to build a 3-month emergency fund at different savings rates.",
      L3: "Applied savings strategy to a scenario: prioritizing emergency fund vs other goals.",
    },
  },
  {
    id: "module3",
    title: "Understanding Debt",
    keyConcepts: ["good debt vs bad debt", "interest rate", "APR", "minimum payment trap", "debt avalanche", "debt snowball"],
    lessonSummaries: {
      L1: "Defined APR, interest, principal, minimum payments, good debt vs bad debt.",
      L2: "Interactive debt comparison — avalanche vs snowball repayment strategies.",
      L3: "Applied debt payoff strategy to a scenario with multiple debts.",
    },
  },
  {
    id: "module4",
    title: "Credit Scores & Reports",
    keyConcepts: ["credit score", "FICO score", "credit utilization", "payment history", "hard inquiry", "credit report"],
    lessonSummaries: {
      L1: "Defined credit score, FICO, credit utilization ratio, hard vs soft inquiry, credit report.",
      L2: "Interactive credit score simulator — how different actions affect your score.",
      L3: "Applied credit knowledge to a scenario: improving a low credit score over time.",
    },
  },
  {
    id: "module5",
    title: "Introduction to Investing",
    keyConcepts: ["stocks", "bonds", "mutual funds", "ETFs", "risk vs return", "diversification", "portfolio"],
    lessonSummaries: {
      L1: "Defined stocks, bonds, ETFs, mutual funds, diversification, risk tolerance, portfolio.",
      L2: "Interactive asset allocation tool — building a portfolio based on risk tolerance.",
      L3: "Applied investing basics to a scenario: choosing investments for a long-term goal.",
    },
  },
  {
    id: "module6",
    title: "Compound Interest & Time Value of Money",
    keyConcepts: ["compound interest", "simple interest", "time value of money", "rule of 72", "future value", "present value"],
    lessonSummaries: {
      L1: "Defined compound interest, simple interest, time value of money, rule of 72, future value.",
      L2: "Interactive compound growth visualizer — effect of time and rate on investment growth.",
      L3: "Applied compound interest to a scenario: starting early vs starting late.",
    },
  },
  {
    id: "module7",
    title: "Retirement Planning",
    keyConcepts: ["401k", "IRA", "Roth IRA", "employer match", "tax-advantaged accounts", "contribution limits", "retirement age"],
    lessonSummaries: {
      L1: "Defined 401k, IRA, Roth IRA, traditional IRA, employer match, tax-deferred growth.",
      L2: "Interactive retirement calculator — projecting savings at retirement age.",
      L3: "Applied retirement planning to a scenario: maximizing employer match and Roth contributions.",
    },
  },
  {
    id: "module8",
    title: "Taxes & Tax Planning",
    keyConcepts: ["income tax", "tax brackets", "marginal vs effective rate", "deductions", "tax credits", "W-2", "capital gains tax"],
    lessonSummaries: {
      L1: "Defined tax brackets, marginal rate, effective rate, deductions, credits, W-2, 1099.",
      L2: "Interactive tax bracket visualizer — how marginal rates apply to income.",
      L3: "Applied tax knowledge to a scenario: reducing tax liability through deductions and credits.",
    },
  },
  {
    id: "module9",
    title: "Insurance & Risk Management",
    keyConcepts: ["insurance", "premium", "deductible", "coverage", "health insurance", "life insurance", "liability"],
    lessonSummaries: {
      L1: "Defined insurance types, premium, deductible, copay, coverage limits, beneficiary.",
      L2: "Interactive insurance decision tool — choosing coverage levels based on life situation.",
      L3: "Applied insurance knowledge to a scenario: selecting appropriate coverage on a budget.",
    },
  },
  {
    id: "module10",
    title: "Financial Goals & Long-Term Planning",
    keyConcepts: ["SMART goals", "short vs long term goals", "financial milestones", "net worth growth", "financial independence"],
    lessonSummaries: {
      L1: "Defined SMART financial goals, short/medium/long-term planning, financial independence, milestones.",
      L2: "Interactive goal planner — mapping out a 10-year financial roadmap.",
      L3: "Applied long-term planning to a scenario: building a complete financial plan.",
    },
  },
];

// Maps Firestore lessonProgress keys to human-readable lesson names
export const LESSON_LABEL: Record<string, string> = {
  L1_Definitions: "Definitions",
  L2_Interactive: "Interactive Exercise",
  L3_Applying: "Applying Knowledge",
};

/**
 * Given the user's Firestore lessonProgress map, builds a structured
 * context string for ZenBot's system prompt.
 *
 * lessonProgress shape: { module1: { L1_Definitions: true, L2_Interactive: false, ... }, ... }
 */
export function buildUserProgressContext(
  lessonProgress: Record<string, Record<string, boolean>>
): string {
  const lines: string[] = [];

  for (const mod of MODULE_CONTENT) {
    const progress = lessonProgress?.[mod.id] ?? {};
    const completedLessons = Object.entries(progress)
      .filter(([, done]) => done)
      .map(([key]) => LESSON_LABEL[key] ?? key);

    const moduleComplete =
      completedLessons.length >= 3 ? " (MODULE COMPLETE)" : "";

    if (completedLessons.length === 0) {
      lines.push(`- ${mod.title}: Not started`);
    } else {
      lines.push(
        `- ${mod.title}${moduleComplete}: Completed — ${completedLessons.join(", ")}`
      );
      lines.push(
        `  Key concepts covered: ${mod.keyConcepts.slice(0, 4).join(", ")}`
      );
    }
  }

  return lines.join("\n");
}

/**
 * Builds a compact summary of ALL module content so ZenBot knows
 * what's in the curriculum regardless of user progress.
 */
export function buildCurriculumSummary(): string {
  return MODULE_CONTENT.map(
    (mod) =>
      `${mod.title}: covers ${mod.keyConcepts.join(", ")}.`
  ).join("\n");
}