// app/components/AskBennyCard.tsx
"use client";
import Link from 'next/link';

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
          <div className="bg-gray-100 rounded-l-2xl rounded-tr-2xl px-4 py-3 max-w-[280px]">
            <p className="text-sm text-gray-900 font-medium">
              Hey! What does the term equity mean?
            </p>
          </div>
        </div>

        {/* Bot Message */}
        <div className="flex gap-3 items-end">
          <div className="w-10 h-10 rounded-full bg-[#0E5B87]/10 flex-shrink-0 overflow-hidden">
            <img src="/benny_avatar.png" alt="Benny" className="w-full h-full object-cover" />
          </div>
          <div className="bg-blue-50 rounded-r-2xl rounded-tl-2xl px-4 py-3 max-w-[280px]">
            <p className="text-sm text-gray-900 font-medium">
              Hey! Great question! Equity means....
            </p>
          </div>
        </div>
      </div>

      {/* Ask Button */}
      <Link href="/chatbot">
        <button className="w-full px-6 py-3 bg-[#0E5B87] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all">
          Ask Benny
        </button>
      </Link>
    </div>
  );
}