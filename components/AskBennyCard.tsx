export default function AskBennyCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="w-full h-10 rounded-full bg-[#0E5B87]/20 flex items-center justify-center text-[#0E5B87] font-bold text-sm mb-6">
        Have a question? Ask Benny!
      </div>
      
      {/* Chat Messages */}
      <div className="space-y-4 mb-6">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-gray-100 rounded-l-2xl rounded-tr-2xl rounded-br-2xl px-4 py-3 max-w-[280px]">
            <p className="text-sm text-gray-900 font-medium">
              Hey! What does the term equity mean?
            </p>
          </div>
        </div>
        
        {/* Bot Message */}
        <div className="flex gap-3 items-end">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue-600">
              <path d="M10 2C8.9 2 8 2.9 8 4V6C8 7.1 8.9 8 10 8S12 7.1 12 6V4C12 2.9 11.1 2 10 2ZM16 8C17.1 8 18 8.9 18 10S17.1 12 16 12H14C12.9 12 12 11.1 12 10S12.9 8 14 8H16ZM6 10C6 8.9 5.1 8 4 8H2C0.9 8 0 8.9 0 10S0.9 12 2 12H4C5.1 12 6 11.1 6 10ZM10 14C11.1 14 12 14.9 12 16V18C12 19.1 11.1 20 10 20S8 19.1 8 18V16C8 14.9 8.9 14 10 14Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="bg-blue-50 rounded-r-2xl rounded-tl-2xl rounded-bl-2xl px-4 py-3 max-w-[280px]">
            <p className="text-sm text-gray-900 font-medium">
              Hey Ibnat! Great question! Equity means....
            </p>
          </div>
        </div>
      </div>
      
      {/* Ask Button */}
      <button className="px-6 py-3 bg-[#0E5B87] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all">
        Ask Benny
      </button>
    </div>
  )
}
