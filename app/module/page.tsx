import Link from "next/link";
import PageShell from "@/components/PageShell";
import SidebarNav from "@/components/SidebarNav";
import RightRail from "@/components/RightRail";
import "../globals.css";

interface LessonCardProps {
  title: string;
  category: string;
  imageUrl: string;
  progress: number;
  /** If provided, the card will navigate to this route. Otherwise it's inert. */
  href?: string;
}

function LessonCard({ title, category, imageUrl, progress, href }: LessonCardProps) {
  const clickable = Boolean(href);

  const card = (
    <div
      className={[
        "bg-white rounded-2xl shadow-sm overflow-hidden transition-all relative",
        clickable ? "cursor-pointer hover:shadow-md" : "cursor-default",
      ].join(" ")}
      tabIndex={clickable ? 0 : -1}
      aria-disabled={!clickable}
      role={clickable ? "link" : "group"}
    >
      {/* Image */}
      <div className="relative h-28 bg-gray-100">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-t-xl" />
        {/* Heart */}
        <button
          type="button"
          aria-label="Save lesson"
          className="absolute top-3 right-3 w-5 h-5 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.2065 6.93678C4.09317 6.97678 3.9065 6.97678 3.79317 6.93678C2.8265 6.60678 0.666504 5.23011 0.666504 2.89678C0.666504 1.86678 1.4965 1.03345 2.51984 1.03345C3.1265 1.03345 3.66317 1.32678 3.99984 1.78011C4.3365 1.32678 4.8765 1.03345 5.47984 1.03345C6.50317 1.03345 7.33317 1.86678 7.33317 2.89678C7.33317 5.23011 5.17317 6.60678 4.2065 6.93678Z"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="inline-flex items-center px-3 py-1 bg-[#04456d]/10 rounded-lg mb-2">
          <span className="text-[#04456d] text-xs font-normal uppercase tracking-wider">{category}</span>
        </div>

        <h3 className="font-medium text-sm text-gray-900 leading-relaxed mb-2">{title}</h3>

        <div className="h-1.5 bg-gray-200 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-full bg-[#04456d] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Only wrap with <Link> when we have a real route
  return clickable ? (
    <Link href={href!} className="block focus:outline-none focus:ring-2 focus:ring-[#04456d] rounded-2xl" aria-label={`Open ${title}`}>
      {card}
    </Link>
  ) : (
    card
  );
}

interface ModuleSectionProps {
  moduleNumber: number;
  lessons: LessonCardProps[];
}

function ModuleSection({ moduleNumber, lessons }: ModuleSectionProps) {
  return (
    <section>
      {/* Module header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900 capitalize">Module {moduleNumber}</h2>
        <div className="flex gap-3">
          <button aria-label="Previous" className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-50 transition">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.49992 9.96004L4.23992 6.70004C3.85492 6.31504 3.85492 5.68504 4.23992 5.30004L7.49992 2.04004" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button aria-label="Next" className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-50 transition">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.45508 9.96004L7.71508 6.70004C8.10008 6.31504 8.10008 5.68504 7.71508 5.30004L4.45508 2.04004" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Lessons grid */}
      <div className="grid grid-cols-3 gap-4">
        {lessons.map((lesson, i) => (
          <LessonCard key={`${moduleNumber}-${i}`} {...lesson} />
        ))}
      </div>
    </section>
  );
}

export default function LessonPage() {
  // Add href ONLY for lessons that actually exist
  const moduleData: { moduleNumber: number; lessons: LessonCardProps[] }[] = [
    {
      moduleNumber: 1,
      lessons: [
        {
          title: "First Job & Budgeting Basics",
          category: "Definitions",
          imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/67df7c049ade69e93fe184c707eab2c9f6a57c06?width=515",
          progress: 0, // This will update as they play
          href: "/module/module1?step=1", // The step is the lesson with one added
        },
        {
          title: "First Job & Budgeting Basics",
          category: "Interactive Games",
          imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/a9a319c689d9bc36c927dee75e4a11cef97354cd?width=515",
          progress: 0,
          href: "/module/module1?step=2",
        },
        {
          title: "First Job & Budgeting Basics",
          category: "Applying Your Knowledge",
          imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/e052602941af3dd71bfb78096b7e228d2f43b0f5?width=515",
          progress: 0,
          href: "/module/module1?step=3", // This points to your new "Brain" page

        },
      ],
    },
    {
  moduleNumber: 2,
  lessons: [
    {
      title: "Introduction to Investing",
      category: "Definitions",
      imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/04f7202d1648aac249b244dd86339d324960dfb6?width=515",
      progress: 0,
      href: "/module/module2?step=1",
    },
    {
      title: "Introduction to Investing",
      category: "Interactive Games",
      imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/ec1139cf90eee717dc9fae0659202477cddf756f?width=515",
      progress: 0,
      href: "/module/module2?step=2",
    },
    {
      title: "Introduction to Investing",
      category: "Applying Your Knowledge",
      imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/fe32e0c322652dccbf43ae1ef3c3c026daa5f169?width=515",
      progress: 0,
      href: "/module/module2?step=3",
    },
  ],
},

    {
      moduleNumber: 3,
      lessons: [
        { title: "Lesson 1", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/db1160cd2854f4926a6f8d6262e2929b3868ce57?width=515", progress: 51 },
        { title: "Lesson 2", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/9782ac4062b1a3ab643fb90c891cfb4af595da22?width=515", progress: 51 },
        { title: "Lesson 3", category: "Stocks",  imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/bf1f3af404aceee542ac36f303d0520a3847ec29?width=515", progress: 51 },
      ],
    },
    {
      moduleNumber: 4,
      lessons: [
        { title: "Lesson 1", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/682e7ba457ab32f55fd136dd9bea4b2bfc9dfef8?width=515", progress: 51 },
        { title: "Lesson 2", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/c9a519d462ae7109500af09e881bd5217c4fd2d4?width=515", progress: 51 },
        { title: "Lesson 3", category: "Stocks",  imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/9009d02bbca809a3239a04be5fe4bba849f160fc?width=515", progress: 51 },
      ],
    },
    {
      moduleNumber: 5,
      lessons: [
        { title: "Lesson 1", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/f221e6d99cd3158d8054c9605d8f732f07fe4c26?width=515", progress: 51 },
        { title: "Lesson 2", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/414987ec755eaaa272fc75ca4e23a57b4a83f610?width=515", progress: 51 },
        { title: "Lesson 3", category: "Stocks",  imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/c51f22ead4ee69af5fd0b30b6e204a61a3fffc00?width=515", progress: 51 },
      ],
    },
    {
      moduleNumber: 6,
      lessons: [
        { title: "Lesson 1", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/d12d578fb90d73965d8b5333badb254499486b3d?width=515", progress: 51 },
        { title: "Lesson 2", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/d1ad6dec60e5a03521df295a24faee116424d681?width=515", progress: 51 },
        { title: "Lesson 3", category: "Stocks",  imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/1bdb87f4905f1bf978f5faa9e9654d1892bfc7fa?width=515", progress: 51 },
      ],
    },
    {
      moduleNumber: 7,
      lessons: [
        { title: "Lesson 1", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/7ecf44d31a9e2f936f3b957ce4b7f93dd95d7fa2?width=515", progress: 51 },
        { title: "Lesson 2", category: "Savings", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/acb725f3f86f965dd026a61661145caf37d68231?width=515", progress: 51 },
        { title: "Lesson 3", category: "Stocks",  imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/2746cae0ae4cb0d6fda16603ef4887ac5ad6d641?width=515", progress: 51 },
      ],
    },
    {
      moduleNumber: 8,
      lessons: [
        { title: "Passive vs Active Investing", category: "Definitions", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/3f0ff33d7122ae2536ca66f24a4feff12f41703d?width=515", progress: 51, href:"/module/module8?step=1"  },
        { title: "Passive vs Active Investing", category: "Interactive Games", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/2bffdbaaa7066d288d28dec2d792c1460c7ac58e?width=515", progress: 51, href:"/module/module8?step=2"  },
        { title: "Passive vs Active Investing", category: "Applying Your Knowledge", imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/fd9756af4aeed573522c2e899816ec55c77b1d62?width=515", progress: 51, href:"/module/module8?step=3" },
      ],
    },
  ];

  return (
    <PageShell>
      {/* 3-column layout */}
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        {/* Left: sidebar */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-[calc(100vh-64px)]">
          <SidebarNav />
        </aside>

        {/* Center */}
        <main
          className="
            relative w-full min-w-0
            before:absolute before:top-0 before:bottom-0 before:left-[-12px] before:w-px before:bg-[#E9EEF3]
            after:absolute  after:top-0  after:bottom-0  after:right-[-12px]  after:w-px  after:bg-[#E9EEF3]
          "
        >
          <div className="flex flex-col gap-6 pt-5">
            {moduleData.map((m, i) => (
              <div key={m.moduleNumber}>
                <ModuleSection moduleNumber={m.moduleNumber} lessons={m.lessons} />
                {i < moduleData.length - 1 && <div className="h-px bg-[#E9EEF3] my-6" />}
              </div>
            ))}
          </div>
        </main>

        {/* Right rail */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-fit">
          <RightRail />
        </aside>
      </div>
    </PageShell>
  );
}