export default function SimulatorCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="w-full h-10 rounded-full bg-[#0E5B87]/20 flex items-center justify-center text-[#0E5B87] font-bold text-sm mb-6">
        Try the Simulator
      </div>
      
      {/* Portfolio Card */}
      <div className="bg-[#D9EDFF] rounded-2xl p-8 mb-6 relative">
        <div className="text-center">
          <div className="font-semibold text-base text-gray-900 mb-2">
            Portfolio Value
          </div>
          <div className="font-medium text-3xl text-[#0E5B87] mb-2">
            $ 11,353.31
          </div>
          
          {/* Percentage Badge */}
          <div className="absolute top-6 right-8 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            + 6.33%
          </div>
          
          {/* Withdraw Button */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              Withdraw
            </button>
          </div>
        </div>
      </div>
      
      {/* Join Now Button */}
      <button className="w-full px-5 py-3 bg-[#0E5B87] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
        <span>Join Now</span>
        <i className="ti ti-arrow-right"></i>
      </button>
    </div>
  )
}
