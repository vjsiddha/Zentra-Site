// components/SimulatorCard.tsx

import Link from "next/link";

const PRIMARY = "#0B5E8E";
const BLUE_TINT = "#EAF4FF";
const BLUE_RING = "#D6E6F7";

interface SimulatorCardProps {
  portfolioValue?: number;
  percentageGain?: number;
  isLoggedIn?: boolean;
}

export default function SimulatorCard({ 
  portfolioValue = 100000, 
  percentageGain = 0,
  isLoggedIn = false 
}: SimulatorCardProps) {
  const isPositive = percentageGain >= 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1" style={{ borderColor: BLUE_RING }}>
      {/* Header Badge */}
      <div 
        className="w-full h-10 rounded-full flex items-center justify-center font-bold text-sm mb-6"
        style={{ backgroundColor: BLUE_TINT, color: PRIMARY }}
      >
        {isLoggedIn ? 'Your Portfolio' : 'Try the Simulator'}
      </div>
      
      {/* Portfolio Value Card */}
      <div className="rounded-2xl p-8 mb-6 relative" style={{ backgroundColor: BLUE_TINT }}>
        <div className="text-center">
          <div className="font-semibold text-base text-slate-700 mb-2">
            {isLoggedIn ? 'Portfolio Value' : 'Start with'}
          </div>
          <div className="font-bold text-3xl mb-2" style={{ color: PRIMARY }}>
            ${portfolioValue.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          
          {(isLoggedIn || percentageGain !== 0) && (
            <div 
              className={`absolute top-6 right-6 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isPositive 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isPositive ? '+' : ''}{percentageGain.toFixed(2)}%
            </div>
          )}

          {!isLoggedIn && (
            <p className="text-sm text-slate-500 mt-2">in virtual money</p>
          )}
        </div>
      </div>
      
      {/* CTA Button */}
      <Link
        href="/simulator"
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          backgroundColor: PRIMARY, 
          boxShadow: '0 6px 16px rgba(11, 94, 142, 0.25)'
        }}
      >
        <span>{isLoggedIn ? 'Open Simulator' : 'Start Trading'}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12h14M13 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {!isLoggedIn && (
        <div className="mt-5 pt-5 border-t space-y-2.5" style={{ borderColor: BLUE_RING }}>
          <FeatureItem icon="💰" text="$100,000 virtual money" />
          <FeatureItem icon="📊" text="Real market data" />
          <FeatureItem icon="🎓" text="Learn as you trade" />
        </div>
      )}
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-600">
      <span 
        className="flex h-7 w-7 items-center justify-center rounded-lg text-xs"
        style={{ backgroundColor: "#EAF4FF" }}
      >
        {icon}
      </span>
      {text}
    </div>
  );
}
