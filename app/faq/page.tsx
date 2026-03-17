"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import "../globals.css";

const faqItems = [
  {
    question: "What is Zentra?",
    answer:
      "Zentra is an interactive financial learning platform that helps users build confidence in budgeting, investing, and decision-making through guided modules, simulations, and practice-based learning.",
  },
  {
    question: "How do the lessons work?",
    answer:
      "Each module is usually broken into three lessons: a learn section to explain the idea, an interactive section to practice it, and an applying section to help you make decisions using what you learned.",
  },
  {
    question: "Do I need prior finance knowledge to use Zentra?",
    answer:
      "No. Zentra is designed for beginners and builds concepts step by step using plain language, examples, and interactive activities.",
  },
  {
    question: "What is the simulator for?",
    answer:
      "The simulator gives you a safe space to practice decisions using a virtual portfolio. It helps you understand how financial choices work before applying those ideas in real life.",
  },
  {
    question: "Can I redo modules and lessons?",
    answer:
      "Yes. You can revisit lessons, retry activities, and improve your understanding over time. Zentra is designed to support repeated practice.",
  },
  {
    question: "What do XP and levels mean?",
    answer:
      "XP reflects your learning progress as you complete lessons and activities. Levels help show how far you have progressed through the platform.",
  },
  {
    question: "What is the dictionary feature?",
    answer:
      "The dictionary gives you quick explanations of finance terms you may come across in lessons, simulations, or other parts of the platform.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left px-6 py-5 hover:bg-slate-50 transition-all"
      >
        <span className="text-[18px] font-bold text-slate-900 pr-4">{question}</span>
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
          {isOpen ? "−" : "+"}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          <div className="h-px bg-slate-100 mb-4" />
          <p className="text-[15px] leading-7 text-slate-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageShell>
      <div className="grid grid-cols-[240px_1fr] gap-6">
        <aside className="sticky top-8 h-[calc(100vh-64px)]">
          <SidebarNav />
        </aside>

        <main
          className="
            relative pb-12 min-w-0
            before:absolute before:top-0 before:bottom-0 before:left-[-12px] before:w-px before:bg-[#E9EEF3]
          "
        >
          <div className="pt-5 space-y-8">
            <section className="bg-gradient-to-r from-[#EAF4FB] via-[#F4F8FC] to-[#EAF4FB] border border-[#D9E7F2] rounded-[28px] p-8 shadow-sm">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B5E8E] mb-3">
                  Support Center
                </p>
                <h1 className="text-[42px] leading-[1.1] font-black text-slate-900 mb-4">
                  Frequently Asked Questions
                </h1>
                <p className="text-[18px] leading-8 text-slate-600 max-w-2xl">
                  Quick answers about how Zentra works, how lessons are structured,
                  and how to make the most of the platform.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                    FAQ Library
                  </p>
                  <h2 className="text-[30px] font-black text-slate-900">
                    Browse Common Questions
                  </h2>
                </div>
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EAF4FB] text-2xl">
                  ❓
                </div>
              </div>

              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <FAQItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                  />
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-r from-[#F7FAFD] to-[#EDF5FB] border border-[#DCE8F1] rounded-[28px] p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B5E8E] mb-3">
                    Still not sure?
                  </p>
                  <h3 className="text-[28px] font-black text-slate-900 mb-3">
                    Keep learning by exploring the platform
                  </h3>
                  <p className="text-slate-600 text-[16px] leading-7 max-w-2xl">
                    Many questions become clearer once you move through a lesson, try the
                    simulator, or use the built-in dictionary for unfamiliar terms.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">Best next step</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Return to your lessons and continue learning through practice.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">Helpful tool</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Use the dictionary whenever a finance term feels unfamiliar.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </PageShell>
  );
}