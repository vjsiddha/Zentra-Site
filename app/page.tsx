import SidebarNav from '@/components/SidebarNav'
import HeroCard from '@/components/HeroCard'
import LessonCard from '@/components/LessonCard'
import AskBennyCard from '@/components/AskBennyCard'
import SimulatorCard from '@/components/SimulatorCard'
import RightRail from '@/components/RightRail'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container with 12-column grid */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - 2 columns */}
          <div className="col-span-2">
            <SidebarNav />
          </div>
          
          {/* Main Content - 7 columns */}
          <div className="col-span-7 space-y-10">
            {/* Hero Section */}
            <HeroCard />
            
            {/* Go Back To Your Favourites */}
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
              
              {/* Lesson Cards Grid */}
              <div className="grid grid-cols-3 gap-6">
                <LessonCard
                  title="Lesson 1: Your Savings Matter"
                  category="SAVINGS"
                  imageUrl="/api/placeholder/280/160"
                  progress={75}
                />
                <LessonCard
                  title="Lesson 7: Count Your Pennies"
                  category="SAVINGS"
                  imageUrl="/api/placeholder/280/160"
                  progress={50}
                />
                <LessonCard
                  title="Lesson 4: Meme Or Money-Maker?"
                  category="STOCKS"
                  imageUrl="/api/placeholder/280/160"
                  progress={65}
                />
              </div>
            </div>
            
            {/* Middle Row - Chat and Simulator */}
            <div className="grid grid-cols-2 gap-6">
              <AskBennyCard />
              <SimulatorCard />
            </div>
          </div>
          
          {/* Right Rail - 3 columns */}
          <div className="col-span-3">
            <RightRail />
          </div>
        </div>
      </div>
    </div>
  )
}
