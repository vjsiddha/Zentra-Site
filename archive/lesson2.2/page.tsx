import ButtonGroup from "@/components/ButtonGroup";

const STAGES = [
  { label: "Starting Your Career", href: "/lesson/lesson1/lesson1.6" },
  { label: "Buying Your First Home",  href: "/lesson/scenarios/first-home" },
  { label: "Planning for Retirement", href: "/lesson/scenarios/retirement-planning" },
  { label: "Managing Debt",           href: "/lesson/scenarios/managing-debt" },
  { label: "Saving for Education",    href: "/lesson/scenarios/saving-for-education" },
];

export default function Lesson1_5_Page() {
  return (
    <main className="min-h-screen bg-[#F7FAFC] grid place-items-center">
       <section className="w-full mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <header className="mb-10 text-center"> 
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Welcome to Your Financial Journey
          </h2>
          <p className="mt-3 mx-auto max-w-3xl text-slate-600">
            Explore interactive scenarios to learn about budgeting and RRSP planning.
            Choose a life stage that resonates with you and discover how financial
            decisions impact your future.
          </p>
        </header>

        <div className="mx-auto max-w-4xl">
          <h3 className="mb-3 text-center text-lg font-semibold text-slate-800">
            Select Your Life Stage
          </h3>

          <ButtonGroup
            // fallback label/href (used if stages not provided)
            primaryLabel="Start your Career"
          primaryHref="/lesson/lesson1/lesson2.3"
          // Stage chips (drives the primary CTA)
          stages={STAGES}
          showArrow
          className="mt-2"
          align="center"
          />
        </div>
      </section>
    </main>
  );
}
