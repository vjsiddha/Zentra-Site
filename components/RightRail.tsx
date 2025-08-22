export default function RightRail() {
  return (
    <div className="w-full bg-[#E8F3FA] rounded-2xl p-6 space-y-4">
      {/* Unlocked Avatars Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Unlocked Avatars</h2>
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-orange-500">
              <path d="M16 4C17.1 4 18 4.9 18 6V8C18 9.1 17.1 10 16 10S14 9.1 14 8V6C14 4.9 14.9 4 16 4ZM26 14C27.1 14 28 14.9 28 16S27.1 18 26 18H24C22.9 18 22 17.1 22 16S22.9 14 24 14H26ZM10 16C10 14.9 9.1 14 8 14H6C4.9 14 4 14.9 4 16S4.9 18 6 18H8C9.1 18 10 17.1 10 16ZM16 22C17.1 22 18 22.9 18 24V26C18 27.1 17.1 28 16 28S14 27.1 14 26V24C14 22.9 14.9 22 16 22Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-blue-500">
              <path d="M16 2C14.9 2 14 2.9 14 4V6C14 7.1 14.9 8 16 8S18 7.1 18 6V4C18 2.9 17.1 2 16 2ZM24 14C25.1 14 26 14.9 26 16S25.1 18 24 18H22C20.9 18 20 17.1 20 16S20.9 14 22 14H24ZM8 16C8 14.9 7.1 14 6 14H4C2.9 14 2 14.9 2 16S2.9 18 4 18H6C7.1 18 8 17.1 8 16ZM16 20C17.1 20 18 20.9 18 22V24C18 25.1 17.1 26 16 26S14 25.1 14 24V22C14 20.9 14.9 20 16 20Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-purple-500">
              <path d="M16 3C15.4 3 15 3.4 15 4V6C15 6.6 15.4 7 16 7S17 6.6 17 6V4C17 3.4 16.6 3 16 3ZM23 15C23.6 15 24 15.4 24 16S23.6 17 23 17H21C20.4 17 20 16.6 20 16S20.4 15 21 15H23ZM9 16C9 15.4 8.6 15 8 15H6C5.4 15 5 15.4 5 16S5.4 17 6 17H8C8.6 17 9 16.6 9 16ZM16 21C16.6 21 17 21.4 17 22V24C17 24.6 16.6 25 16 25S15 24.6 15 24V22C15 21.4 15.4 21 16 21Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-green-500">
              <path d="M16 5C15.4 5 15 5.4 15 6V8C15 8.6 15.4 9 16 9S17 8.6 17 8V6C17 5.4 16.6 5 16 5ZM21 15C21.6 15 22 15.4 22 16S21.6 17 21 17H19C18.4 17 18 16.6 18 16S18.4 15 19 15H21ZM11 16C11 15.4 10.6 15 10 15H8C7.4 15 7 15.4 7 16S7.4 17 8 17H10C10.6 17 11 16.6 11 16ZM16 19C16.6 19 17 19.4 17 20V22C17 22.6 16.6 23 16 23S15 22.6 15 22V20C15 19.4 15.4 19 16 19Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Your Vocab Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 text-center">Your Vocab</h2>
        <div className="space-y-3">
          <div className="w-full h-11 bg-white rounded-full flex items-center justify-center font-semibold text-sm text-gray-900 shadow-sm">
            Equity
          </div>
          <div className="w-full h-11 bg-white rounded-full flex items-center justify-center font-semibold text-sm text-gray-900 shadow-sm">
            Stocks
          </div>
          <div className="w-full h-11 bg-white rounded-full flex items-center justify-center font-semibold text-sm text-gray-900 shadow-sm">
            Wealth
          </div>
          <div className="w-full h-11 bg-white rounded-full flex items-center justify-center font-semibold text-sm text-gray-900 shadow-sm">
            Wealth
          </div>
          <div className="w-full h-11 bg-white rounded-full flex items-center justify-center font-semibold text-sm text-gray-900 shadow-sm">
            Wealth
          </div>
        </div>
      </div>

      {/* Open Dictionary Button */}
      <div className="pt-4">
        <button className="w-full px-5 py-3 bg-[#0E5B87] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
          <span>Open Dictionary</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.5 3.5C6.5 3.22386 6.72386 3 7 3H13C13.2761 3 13.5 3.22386 13.5 3.5V9C13.5 9.27614 13.2761 9.5 13 9.5C12.7239 9.5 12.5 9.27614 12.5 9V4.70711L3.85355 13.3536C3.65829 13.5488 3.34171 13.5488 3.14645 13.3536C2.95118 13.1583 2.95118 12.8417 3.14645 12.6464L11.7929 4H7C6.72386 4 6.5 3.77614 6.5 3.5Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
