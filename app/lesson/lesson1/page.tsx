// app/lesson/lesson1/page.tsx
import Image from "next/image";
import ButtonGroup from "@/components/ButtonGroup";

export default function LessonIntro() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        {/* Hero image */}
        <div className="relative aspect-[16/9] w-full mt-4 overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop"
            alt="Start your money journey"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>

        {/* Centered text */}
        <div className="mt-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Start Your Money Journey
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-lg text-slate-600">
            You’re about to learn how to manage your money through real‑life challenges. Each
            scenario is simple, fun, and interactive. No stress—just smart decisions.
          </p>

          {/* Reusable buttons */}
          <ButtonGroup
            primaryHref="/lesson/lesson1/lesson1.1"
            primaryLabel="Let’s Get Started"
            secondaryHref="/lesson"
            secondaryLabel="Back to Modules"
            className="mt-8"
            align="center"
          />
        </div>
      </section>
    </main>
  );
}
