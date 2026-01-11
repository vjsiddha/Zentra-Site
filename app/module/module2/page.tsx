// app/lesson/lesson2/page.tsx
import Image from "next/image";
import ButtonGroup from "@/components/ButtonGroup";

export default function Lesson2Intro() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        {/* Hero image */}
        <div className="relative aspect-[16/9] w-full mt-4 overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1600&auto=format&fit=crop"
            alt="Master Your Savings"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>

        {/* Centered text */}
        <div className="mt-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Master Your Savings
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-lg text-slate-600">
            Now that you've learned the basics, it's time to dive deeper into saving strategies. 
            You'll explore different savings scenarios and learn how to make your money work for you.
          </p>

          {/* Reusable buttons */}
          <ButtonGroup
            primaryHref="/lesson/lesson2/lesson2.1"
            primaryLabel="Start Module 2"
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