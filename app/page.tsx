import PageShell from '@/components/PageShell'
import SidebarNav from '@/components/SidebarNav'
import HeroCard from '@/components/HeroCard'
import LessonCard from '@/components/LessonCard'
import AskBennyCard from '@/components/AskBennyCard'
import SimulatorCard from '@/components/SimulatorCard'
import RightRail from '@/components/RightRail'

export default function Dashboard() {
  return (
    <PageShell>
      {/* Desktop-only 3-column grid */}
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT: Sidebar (fixed 240px) */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-[calc(100vh-64px)]">
          <SidebarNav />
        </aside>

        {/* CENTER: Main (flexible) with subtle hairline separators */}
        <main
          className="
            relative w-full min-w-0
            before:absolute before:top-0 before:bottom-0 before:left-[-12px] before:w-px before:bg-[#E9EEF3]
            after:absolute  after:top-0  after:bottom-0  after:right-[-12px]  after:w-px  after:bg-[#E9EEF3]
          "
        >
          <div className="flex flex-col gap-8">
            {/* Hero */}
            <section className="pt-0">
              <HeroCard />
            </section>

            {/* soft section divider */}
            <div className="h-px bg-[#E9EEF3]" />

            {/* Favourites */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wider">
                  Go Back To Your Favourites
                </h2>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                    <i className="ti ti-chevron-left text-gray-600 text-sm" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                    <i className="ti ti-chevron-right text-gray-600 text-sm" />
                  </button>
                </div>
              </div>

              {/* 3 equal cards */}
              <div className="grid grid-cols-3 gap-6">
                <LessonCard
                  title="Lesson 1: Your Savings Matter"
                  category="SAVINGS"
                  imageUrl="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=280&h=160&fit=crop"
                  progress={75}
                />
                <LessonCard
                  title="Lesson 7: Count Your Pennies"
                  category="SAVINGS"
                  imageUrl="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=280&h=160&fit=crop"
                  progress={50}
                />
                <LessonCard
                  title="Lesson 4: Meme Or Money-Maker?"
                  category="STOCKS"
                  imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop"
                  progress={65}
                />
              </div>
            </section>

            {/* soft section divider */}
            <div className="h-px bg-[#E9EEF3]" />

            {/* Bottom row: Ask Benny + Simulator */}
            <section>
              <div className="grid grid-cols-2 gap-6">
                <AskBennyCard />
                <SimulatorCard />
              </div>
            </section>
          </div>
        </main>

        {/* RIGHT: Rail (fixed 300px) */}
        <aside className="w-full flex-shrink-0 sticky top-8 h-fit">
          <RightRail />
        </aside>
      </div>
    </PageShell>
  )
}
