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
      {/* 3-Column Grid */}
      <div className="grid grid-cols-[240px_1fr_300px] gap-6">
        
        {/* Column 1: Sidebar (240px) */}
        <div className="sticky top-8 h-fit flex-shrink-0">
          <SidebarNav />
        </div>

        {/* Column 2: Main Content (1fr) */}
        <div className="flex flex-col gap-8 min-w-0">
          
          {/* Hero Section */}
          <HeroCard />
          
          {/* Lessons Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wider">
                Go Back To Your Favourites
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                  <i className="ti ti-chevron-left text-gray-500 text-sm"></i>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                  <i className="ti ti-chevron-right text-gray-500 text-sm"></i>
                </button>
              </div>
            </div>
            
            {/* LessonsGrid: 3 cards in a row */}
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
          </div>
          
          {/* BottomRow: Chat and Simulator */}
          <div className="grid grid-cols-2 gap-6">
            <AskBennyCard />
            <SimulatorCard />
          </div>
          
        </div>
        
        {/* Column 3: Right Rail (300px) */}
        <div className="sticky top-8 h-fit flex-shrink-0">
          <RightRail />
        </div>
        
      </div>
    </PageShell>
  )
}
