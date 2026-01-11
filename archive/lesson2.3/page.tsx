// app/lesson/lesson1/lesson1.6/page.tsx
import Image from "next/image";
import Link from "next/link";

const PRIMARY = "#0B5E8E";        // CTA / accents
const BLUE_TINT = "#EAF4FF";      // light blue backgrounds
const BLUE_RING = "#D6E6F7";      // borders/rings
const TEXT_HEADING = "text-slate-900";
const TEXT_BODY = "text-slate-700";

export default function Lesson1_6_Page() {
  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20">
        {/* Header */}
        <header className="mb-8">
          <h2 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${TEXT_HEADING}`}>
            Scenario Overview
          </h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Explore the financial challenges and decisions you’ll face in this life stage scenario.
          </p>
        </header>

        {/* Two column: Illustration + Persona */}
        <div className="grid gap-10 md:grid-cols-2 items-start">
          {/* Illustration card with subtle blue tint */}
          <div
            className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1"
            style={{ backgroundColor: BLUE_TINT, borderColor: BLUE_RING }}
          >
            <Image
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
              alt="Starting out illustration"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 560px, 100vw"
              priority
            />
          </div>

          {/* Persona / copy */}
          <article className="max-w-[620px]">
            <h3 className={`text-xl font-semibold ${TEXT_HEADING}`}>Starting Out</h3>
            <ul className={`mt-3 space-y-1 ${TEXT_BODY}`}>
              <li><span className="font-medium">Meet Jack!</span></li>
              <li>Age: 25</li>
              <li>Occupation: Software Engineer</li>
              <li>Salary: $75K/year + $5K side hustle</li>
            </ul>
            <p className={`mt-4 leading-7 ${TEXT_BODY}`}>
              He’s saving for a condo, paying off a car loan, and still wants to enjoy weekend trips—
              can you help him budget smartly while still having fun? This scenario simulates the
              financial decisions and challenges faced by a young professional starting their career,
              managing student loans, and planning for future investments.
            </p>
          </article>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full" style={{ backgroundColor: BLUE_RING }} />

        {/* Key Aspects */}
        <div>
          <h4 className={`text-2xl font-bold ${TEXT_HEADING}`}>Key Aspects</h4>

          <div className="mt-6 space-y-4">
            <Aspect
              title="Student Loan Management"
              desc="Minimize interest costs and keep cash flow healthy for other financial goals."
            />
            <Aspect
              title="Budgeting and Savings"
              desc="Cover essentials, save for short-term goals, and start investing for the future."
            />
            <Aspect
              title="Investment Planning"
              desc="Explore options suitable for your age and risk tolerance, focusing on long-term growth."
            />
          </div>
        </div>

        {/* CTA bottom-right */}
        <div className="mt-10 flex justify-end">
          <Link
            href="/lesson/lesson1/lesson1.7"
            aria-label="Start Starting Out scenario"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: PRIMARY, boxShadow: "0 6px 16px rgba(11,94,142,0.25)" }}
          >
            Start Scenario
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Aspect({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-4 ring-1"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E8EEF6" }}
    >
      {/* Icon chip with blue tint */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#EAF4FF", color: "#0B5E8E", boxShadow: "inset 0 0 0 1px #D6E6F7" }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l9 4-9 4-9-4 9-4Zm0 8l9 4-9 4-9-4 9-4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <div className={`font-semibold ${TEXT_HEADING}`}>{title}</div>
        <p className={`mt-0.5 ${TEXT_BODY}`}>{desc}</p>
      </div>
    </div>
  );
}
