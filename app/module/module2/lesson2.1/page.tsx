// app/lesson/lesson2/lesson2.1/page.tsx
import ButtonGroup from "@/components/ButtonGroup";

export default function Lesson2_1Page() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
      <div className="relative w-full max-w-[1280px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 md:px-16">
          {/* Header */}
          <div className="w-full text-center mb-6">
            <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px] font-manrope">
              What You'll Be Doing
            </h1>
          </div>

          {/* Three Cards */}
          <div className="w-full mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Learn */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=602&h=400&fit=crop"
                    alt="Money management illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-manrope mb-1">Learn</h3>
                  <p className="text-sm text-[#4F7D96] font-manrope leading-[21px]">
                    Advanced savings strategies
                  </p>
                </div>
              </div>

              {/* Practice */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=602&h=400&fit=crop"
                    alt="Financial planning tools"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-manrope mb-1">Practice</h3>
                  <p className="text-sm text-[#4F7D96] font-manrope leading-[21px]">
                    Make real savings decisions
                  </p>
                </div>
              </div>

              {/* Master */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=602&h=400&fit=crop"
                    alt="Financial success chart"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-manrope mb-1">Master</h3>
                  <p className="text-sm text-[#4F7D96] font-manrope leading-[21px]">
                    Build your financial confidence
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="w-full text-center mb-8">
            <p className="text-base text-[#0D171C] font-manrope leading-6 max-w-4xl mx-auto">
              In Module 2, you'll tackle more complex savings scenarios. Learn how to balance 
              multiple financial goals, understand emergency funds, and make smart choices about 
              where to keep your money. Each decision builds on what you learned in Module 1.
            </p>
          </div>

          {/* Reusable buttons */}
          <ButtonGroup
            primaryHref="/lesson/lesson2/lesson2.2"
            primaryLabel="Start First Scenario"
            secondaryHref="/lesson"
            secondaryLabel="Back to Modules"
          />
        </div>
      </div>
    </div>
  );
}