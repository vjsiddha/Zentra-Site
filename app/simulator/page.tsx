// app/simulator/page.tsx
// Stock Simulator - Complete with Portfolio Analytics
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import Link from 'next/link';
import AssetDashboard from './components/AssetDashboard';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#0B5E8E',
  primaryLight: '#EAF4FF',
  primaryRing: '#D6E6F7',
  background: '#F7FAFC',
  cardBorder: '#E8EEF6',
  success: '#10b981',
  successLight: '#d1fae5',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
};

const PIE_COLORS = ['#0B5E8E', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ============================================================================
// API CONFIG
// ============================================================================
const MOCK_INVESTOR_API = process.env.NEXT_PUBLIC_MOCK_INVESTOR_API || 'http://localhost:8000';
const MARKET_DATA_API = process.env.NEXT_PUBLIC_MARKET_API || 'http://localhost:8001';

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function mockInvestorCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${MOCK_INVESTOR_API}${endpoint}`;
  console.log(`Mock Investor API Call: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    
    const result = await response.json();
    console.log(`API Response for ${endpoint}:`, result);
    
    if (!result.ok) {
      throw new Error(result.error || 'API Error');
    }
    
    return result.data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

async function marketDataCall<T>(endpoint: string): Promise<T> {
  const url = `${MARKET_DATA_API}${endpoint}`;
  console.log(`Market Data API Call: ${url}`);
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'API Error');
    }
    
    return result.data;
  } catch (error) {
    console.error(`Market Data API Error for ${endpoint}:`, error);
    throw error;
  }
}

// Portfolio functions
async function getPortfolio() {
  return mockInvestorCall<any>('/portfolio');
}

async function resetPortfolio(startingCash = 100000) {
  return mockInvestorCall<any>('/portfolio/reset', {
    method: 'POST',
    body: JSON.stringify({ starting_cash: startingCash }),
  });
}

// Trading functions
async function buyStock(symbol: string, qty: number, price: number) {
  return mockInvestorCall<any>('/orders/buy', {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, price }),
  });
}

async function sellStock(symbol: string, qty: number, price: number) {
  return mockInvestorCall<any>('/orders/sell', {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, price }),
  });
}

// Market Data functions
async function getQuote(symbol: string) {
  return marketDataCall<any>(`/quote/${symbol}`);
}

async function searchSymbols(query: string) {
  return marketDataCall<any[]>(`/search?q=${encodeURIComponent(query)}`);
}

// Portfolio Analytics functions
async function getEquityCurve(period: string = "1y", interval: string = "1d") {
  return mockInvestorCall<any[]>(`/metrics/equity-curve?period=${period}&interval=${interval}`);
}

async function getMarkToMarket() {
  return mockInvestorCall<any>('/metrics/mark-to-market');
}

// ============================================================================
// SECTOR DATA
// ============================================================================
const SECTORS: Record<string, { symbols: string[]; icon: string; description: string; color: string }> = {
  Tech: {
    symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA"],
    icon: "🧠",
    description: "Fast-growing tech companies.",
    color: '#0B5E8E'
  },
  ETFs: {
    symbols: ["SPY", "QQQ", "VTI", "VOO"],
    icon: "💼",
    description: "Diversified funds — safer for beginners.",
    color: '#10b981'
  },
  Banking: {
    symbols: ["JPM", "BAC", "WFC", "GS"],
    icon: "🏦",
    description: "Major banks with stable dividends.",
    color: '#f59e0b'
  },
  "Green Energy": {
    symbols: ["ENPH", "NEE"],
    icon: "🌱",
    description: "Clean energy companies.",
    color: '#ef4444'
  },
  Crypto: {
    symbols: ["BTC-USD", "ETH-USD"],
    icon: "💎",
    description: "Digital currencies (high risk).",
    color: '#8b5cf6'
  },
};

const TIPS = [
  "💡 Diversify across sectors to reduce risk.",
  "📉 Don't panic when markets drop — stay the course!",
  "🏆 Long-term investing beats short-term trading.",
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSectorForSymbol(symbol: string): string {
  for (const [sectorName, sectorData] of Object.entries(SECTORS)) {
    if (sectorData.symbols.includes(symbol)) {
      return sectorName;
    }
  }
  return "Other";
}

function calculatePortfolioHealth(positionsCount: number): { score: string; message: string; color: string } {
  if (positionsCount === 0) {
    return { 
      score: "Poor", 
      message: "You haven't diversified yet. Try investing in multiple assets.",
      color: COLORS.danger
    };
  } else if (positionsCount === 1) {
    return { 
      score: "Average", 
      message: "Try diversifying across industries or sectors.",
      color: COLORS.warning
    };
  } else if (positionsCount === 2) {
    return { 
      score: "Good", 
      message: "Nice start! Add a few more asset types to reduce risk.",
      color: COLORS.success
    };
  } else {
    return { 
      score: "Great", 
      message: "Well-diversified portfolio. Keep reviewing your positions!",
      color: COLORS.success
    };
  }
}

function calculateRiskLevel(positions: any, totalValue: number): { level: string; message: string; color: string } {
  if (totalValue === 0) {
    return { level: "N/A", message: "No positions", color: COLORS.cardBorder };
  }

  // Calculate risky asset weight (Crypto)
  const riskySymbols = SECTORS.Crypto.symbols;
  let riskyValue = 0;

  Object.keys(positions).forEach(symbol => {
    if (riskySymbols.includes(symbol)) {
      const pos = positions[symbol];
      riskyValue += pos.qty * pos.avg_cost;
    }
  });

  const riskyRatio = riskyValue / totalValue;

  if (riskyRatio > 0.5) {
    return { 
      level: "High Risk", 
      message: "Too much in volatile assets",
      color: COLORS.danger
    };
  } else if (riskyRatio > 0.25) {
    return { 
      level: "Medium Risk", 
      message: "Balanced risk profile",
      color: COLORS.warning
    };
  } else {
    return { 
      level: "Low Risk", 
      message: "Conservative allocation",
      color: COLORS.success
    };
  }
}

// ============================================================================
// PORTFOLIO VALUE CHART (FIXED)
// ============================================================================
function PortfolioValueChart({ portfolio }: { portfolio: any }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"ALL" | "1y" | "3m" | "1m">("ALL");

  useEffect(() => {
    const fetchEquityCurve = async () => {
      setLoading(true);
      try {
        // Determine the period to fetch
        // For "ALL", fetch the maximum history (1 year should cover everything)
        const fetchPeriod = period === "ALL" ? "1y" : period;
        
        // Fetch equity curve from backend
        const data = await getEquityCurve(fetchPeriod, "1d");
        
        if (!data || data.length === 0) {
          // No transaction history yet - show flat line at starting cash
          const startingCash = portfolio?.cash || 100000;
          setChartData([{
            time: new Date().toLocaleDateString(),
            value: startingCash,
            date: new Date().toISOString()
          }]);
        } else {
          // Filter data based on selected period
          let filteredData = data;
          
          if (period !== "ALL") {
            const now = new Date();
            const cutoffDate = new Date();
            
            switch (period) {
              case "1m":
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
              case "3m":
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
              case "1y":
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            }
            
            filteredData = data.filter((point: any) => 
              new Date(point.ts) >= cutoffDate
            );
          }
          
          // Format data for chart
          const formatted = filteredData.map((point: any) => ({
            time: new Date(point.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: point.equity,
            date: point.ts
          }));
          
          setChartData(formatted);
        }
      } catch (err) {
        console.error('Error fetching equity curve:', err);
        // Fallback to current portfolio value
        const currentValue = portfolio?.cash || 100000;
        setChartData([{
          time: new Date().toLocaleDateString(),
          value: currentValue,
          date: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchEquityCurve();
  }, [period, portfolio]);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-2" 
               style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
          <p className="text-slate-600">Loading portfolio history...</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
        <div className="text-center">
          <p className="text-4xl mb-3"></p>
          <p className="font-semibold text-slate-700">No data yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Buy some stocks and watch your portfolio grow!
          </p>
        </div>
      </div>
    );
  }

  // Calculate gain/loss
  const startValue = chartData[0]?.value || 100000;
  const currentValue = chartData[chartData.length - 1]?.value || 100000;
  const gain = currentValue - startValue;
  const gainPercent = ((gain / startValue) * 100).toFixed(2);
  const isPositive = gain >= 0;

  return (
    <div className="space-y-4">
      {/* Time Period Selector */}
      <div className="flex gap-2">
        {[
          { id: 'ALL', label: 'All Time' },
          { id: '1y', label: '1 Year' },
          { id: '3m', label: '3 Months' },
          { id: '1m', label: '1 Month' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p.id
                ? 'text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={period === p.id ? { backgroundColor: COLORS.primary } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">Starting Value</p>
          <p className="text-lg font-bold text-slate-900">
            ${startValue.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">Current Value</p>
          <p className="text-lg font-bold text-slate-900">
            ${currentValue.toLocaleString()}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className="text-xs text-slate-500 mb-1">Total Gain</p>
          <p className={`text-lg font-bold ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
            {isPositive ? '+' : ''}${gain.toLocaleString()} ({isPositive ? '+' : ''}{gainPercent}%)
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B5E8E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0B5E8E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{fontSize: 10}} 
              tickLine={false} 
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              tick={{fontSize: 10}}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(val: number) => [`$${val.toLocaleString()}`, 'Portfolio Value']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#0B5E8E" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              strokeWidth={3}
              name="Portfolio Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-xs text-slate-400">
          📊 Portfolio value from your first trade to today • {chartData.length} data points
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// FUTURE PROJECTIONS CHART
// ============================================================================
function FutureProjectionsChart({ currentValue }: { currentValue: number }) {
  const [timeHorizon, setTimeHorizon] = useState<1 | 5 | 10 | 20>(10);
  
  // Calculate projections for different growth rates
  const calculateFutureValue = (rate: number, years: number) => {
    return currentValue * Math.pow(1 + rate, years);
  };
  
  // Generate data points for the chart
  const generateChartData = () => {
    const data = [];
    const years = timeHorizon;
    const pointsCount = Math.min(years, 20); // Max 20 points for smooth curve
    
    for (let i = 0; i <= pointsCount; i++) {
      const year = (years / pointsCount) * i;
      data.push({
        year: year === 0 ? 'Now' : `${Math.round(year)}y`,
        conservative: calculateFutureValue(0.05, year), // 5% annual
        moderate: calculateFutureValue(0.08, year),     // 8% annual
        aggressive: calculateFutureValue(0.10, year),   // 10% annual
      });
    }
    
    return data;
  };
  
  const chartData = generateChartData();
  
  // Calculate final values
  const conservativeValue = calculateFutureValue(0.05, timeHorizon);
  const moderateValue = calculateFutureValue(0.08, timeHorizon);
  const aggressiveValue = calculateFutureValue(0.10, timeHorizon);
  
  return (
    <div className="space-y-4">
      {/* Time Horizon Selector */}
      <div className="flex gap-2">
        {[
          { years: 1, label: '1 Year' },
          { years: 5, label: '5 Years' },
          { years: 10, label: '10 Years' },
          { years: 20, label: '20 Years' },
        ].map((option) => (
          <button
            key={option.years}
            onClick={() => setTimeHorizon(option.years as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeHorizon === option.years
                ? 'text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={timeHorizon === option.years ? { backgroundColor: COLORS.primary } : {}}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Projection Scenarios */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-blue-50">
          <p className="text-xs text-slate-600 mb-1">Conservative (5%/year)</p>
          <p className="text-xl font-bold text-blue-700">
            ${conservativeValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            +${(conservativeValue - currentValue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-emerald-50">
          <p className="text-xs text-slate-600 mb-1">Moderate (8%/year)</p>
          <p className="text-xl font-bold text-emerald-700">
            ${moderateValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            +${(moderateValue - currentValue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-purple-50">
          <p className="text-xs text-slate-600 mb-1">Aggressive (10%/year)</p>
          <p className="text-xl font-bold text-purple-700">
            ${aggressiveValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            +${(aggressiveValue - currentValue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAggressive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              tick={{fontSize: 11}} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              tick={{fontSize: 11}}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(val: number) => [`$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, '']}
              labelFormatter={(label) => `Time: ${label}`}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="line"
              formatter={(value) => {
                if (value === 'conservative') return 'Conservative (5%)';
                if (value === 'moderate') return 'Moderate (8%)';
                if (value === 'aggressive') return 'Aggressive (10%)';
                return value;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="conservative" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorConservative)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="moderate" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorModerate)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="aggressive" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorAggressive)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Educational Note */}
      <div className="text-center">
        <p className="text-xs text-slate-400">
          📚 Based on historical S&P 500 average returns • Assumes dividends reinvested
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// PORTFOLIO ALLOCATION PIE CHART
// ============================================================================
function PortfolioAllocationChart({ positions }: { positions: any }) {
  const positionSymbols = Object.keys(positions);
  
  if (positionSymbols.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
        <div className="text-center">
          <p className="text-4xl mb-3"></p>
          <p className="font-semibold text-slate-700">No positions yet</p>
          <p className="text-sm text-slate-500 mt-1">Start investing to see allocation</p>
        </div>
      </div>
    );
  }

  // Calculate sector breakdown
  const sectorBreakdown: Record<string, number> = {};
  
  positionSymbols.forEach(symbol => {
    const sector = getSectorForSymbol(symbol);
    const pos = positions[symbol];
    const value = pos.qty * pos.avg_cost;
    sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + value;
  });

  // Prepare data for pie chart
  const chartData = Object.entries(sectorBreakdown).map(([sector, value]) => ({
    name: sector,
    value: value,
    color: SECTORS[sector]?.color || '#94a3b8'
  }));

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sector breakdown list */}
      <div className="space-y-2">
        {chartData.map((sector) => (
          <div key={sector.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: sector.color }}
              />
              <span className="font-medium text-slate-700">{sector.name}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">${sector.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500">
                {((sector.value / totalValue) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SimulatorPage() {
  // Portfolio state
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Market value state
  const [currentMarketValue, setCurrentMarketValue] = useState<number>(0);
  const [marketValueLoading, setMarketValueLoading] = useState(false);
  const [monthlyDividends, setMonthlyDividends] = useState<number>(0);

  // UI State
  const [activeTab, setActiveTab] = useState("trade");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // Trading form state
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [buyQty, setBuyQty] = useState<number>(0);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState<number | null>(null);
  const [sellQty, setSellQty] = useState<number>(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Trade state
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // FETCH CURRENT MARKET VALUE
  // -------------------------------------------------------------------------
  const fetchMarketValue = useCallback(async () => {
    if (!portfolio || Object.keys(portfolio.positions || {}).length === 0) {
      setCurrentMarketValue(0);
      setMonthlyDividends(0);
      return;
    }

    try {
      setMarketValueLoading(true);
      const mtm = await getMarkToMarket();
      setCurrentMarketValue(mtm.market_value || 0);
      
      // Calculate monthly dividends
      let totalAnnualDividends = 0;
      const positions = portfolio.positions || {};
      
      for (const symbol of Object.keys(positions)) {
        try {
          // Get company info for dividend yield
          const response = await fetch(`${MARKET_DATA_API}/company-info/${symbol}`);
          const data = await response.json();
          
          if (data.ok && data.data.dividend_yield) {
            const pos = positions[symbol];
            const currentPrice = mtm.prices?.[symbol] || pos.avg_cost;
            const positionValue = pos.qty * currentPrice;
            
            // dividend_yield is annual percentage (e.g., 0.38 for 0.38%)
            // Convert to decimal and calculate annual dividends
            const annualDividend = positionValue * (data.data.dividend_yield / 100);
            totalAnnualDividends += annualDividend;
          }
        } catch (err) {
          console.log(`No dividend data for ${symbol}`);
        }
      }
      
      // Convert annual to monthly
      setMonthlyDividends(totalAnnualDividends / 12);
      
    } catch (err) {
      console.error('Error fetching market value:', err);
      // Fallback to cost basis if API fails
      const positions = portfolio.positions || {};
      const fallbackValue = Object.keys(positions).reduce((sum, sym) => {
        const pos = positions[sym];
        return sum + (pos.qty * pos.avg_cost);
      }, 0);
      setCurrentMarketValue(fallbackValue);
      setMonthlyDividends(0);
    } finally {
      setMarketValueLoading(false);
    }
  }, [portfolio]);

  // Fetch market value when portfolio changes
  useEffect(() => {
    fetchMarketValue();
    
    // Refresh market value every 30 seconds
    const interval = setInterval(() => {
      fetchMarketValue();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMarketValue]);

  // -------------------------------------------------------------------------
  // LOAD PORTFOLIO
  // -------------------------------------------------------------------------
  const loadPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      
      const portfolioData = await getPortfolio();
      
      setPortfolio(portfolioData);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // -------------------------------------------------------------------------
  // SEARCH SYMBOLS
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchSymbols(searchQuery);
        setSearchResults(results);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // -------------------------------------------------------------------------
  // FETCH PRICE WHEN SYMBOL SELECTED
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedSymbol) {
      setCurrentPrice(null);
      return;
    }

    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        const quote = await getQuote(selectedSymbol);
        setCurrentPrice(quote.last);
      } catch (err) {
        setCurrentPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Fetch sell price
  useEffect(() => {
    if (!sellSymbol) {
      setSellPrice(null);
      return;
    }

    const fetchPrice = async () => {
      try {
        const quote = await getQuote(sellSymbol);
        setSellPrice(quote.last);
      } catch {
        setSellPrice(null);
      }
    };

    fetchPrice();
  }, [sellSymbol]);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------

  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchQuery("");
    setSearchResults([]);
    setActiveTab("trade");
  };

  const handleBuy = async () => {
    if (!selectedSymbol || buyQty <= 0 || !currentPrice) {
      setTradeError("Please select a stock and enter quantity");
      return;
    }

    setTradeLoading(true);
    setTradeError(null);
    setTradeSuccess(null);

    try {
      const result = await buyStock(selectedSymbol, buyQty, currentPrice);
      
      const purchasedSymbol = selectedSymbol;
      setTradeSuccess(`Bought ${buyQty} shares of ${purchasedSymbol} at $${currentPrice.toFixed(2)}`);
      setBuyQty(0);
      await loadPortfolioData();
      
      // Refresh market value to show updated equity
      setTimeout(() => {
        fetchMarketValue();
      }, 500);
      
      // Automatically open Asset Dashboard for the purchased stock
      setTimeout(() => {
        setSelectedAsset(purchasedSymbol);
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Trade failed';
      setTradeError(msg);
    } finally {
      setTradeLoading(false);
    }
  };

  const handleSell = async () => {
    if (!sellSymbol || sellQty <= 0 || !sellPrice) {
      setTradeError("Please select a position and enter quantity");
      return;
    }

    setTradeLoading(true);
    setTradeError(null);
    setTradeSuccess(null);

    try {
      const result = await sellStock(sellSymbol, sellQty, sellPrice);
      
      setTradeSuccess(`Sold ${sellQty} shares of ${sellSymbol} at $${sellPrice.toFixed(2)}`);
      setSellQty(0);
      setSellSymbol("");
      await loadPortfolioData();
      
      // Refresh market value to show updated equity
      setTimeout(() => {
        fetchMarketValue();
      }, 500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Trade failed';
      setTradeError(msg);
    } finally {
      setTradeLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset portfolio to $100,000? All positions will be closed.')) return;
    
    try {
      await resetPortfolio(100000);
      await loadPortfolioData();
      setTradeSuccess('Portfolio reset to $100,000');
      
      // Reset market value
      setCurrentMarketValue(0);
    } catch (err) {
      setTradeError('Failed to reset portfolio');
    }
  };

  // -------------------------------------------------------------------------
  // COMPUTED VALUES
  // -------------------------------------------------------------------------

  const cashBalance = portfolio?.cash ?? 100000;
  const positions = portfolio?.positions ?? {};
  const positionSymbols = Object.keys(positions);
  
  // Calculate total equity using CURRENT market value, not cost basis
  const totalEquity = cashBalance + currentMarketValue;
  
  // Calculate gain from initial $100,000
  const totalGain = totalEquity - 100000;
  const percentageGain = (totalGain / 100000) * 100;
  const isPositive = percentageGain >= 0;

  const buyTotal = buyQty * (currentPrice || 0);
  const canBuy = selectedSymbol && buyQty > 0 && currentPrice && buyTotal <= cashBalance;

  const maxSellQty = sellSymbol ? (positions[sellSymbol]?.qty || 0) : 0;
  const canSell = sellSymbol && sellQty > 0 && sellQty <= maxSellQty && sellPrice;

  const currentTip = TIPS[Math.floor(Date.now() / 60000) % TIPS.length];

  // Portfolio analytics
  const portfolioHealth = calculatePortfolioHealth(positionSymbols.length);
  const riskLevel = calculateRiskLevel(positions, currentMarketValue);

  // -------------------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
          <p className="text-slate-600">Loading simulator...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center max-w-md p-6">
          <p className="text-4xl mb-4"></p>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500 mb-4">
            Make sure both services are running:<br />
            <code className="bg-slate-100 px-2 py-1 rounded text-xs block mt-2">
              Terminal 1: cd services/mock-investor && uvicorn mock_investor.api:app --reload --port 8000
            </code>
            <code className="bg-slate-100 px-2 py-1 rounded text-xs block mt-2">
              Terminal 2: cd services/market-data && python market_data_api.py
            </code>
          </p>
          <button onClick={loadPortfolioData} className="px-6 py-2 rounded-full text-white font-semibold" style={{ backgroundColor: COLORS.primary }}>
            Retry
          </button>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="flex">
        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r`} style={{ borderColor: COLORS.cardBorder }}>
          <div className="h-screen overflow-y-auto p-5">
            <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
              ← Back to Home
            </Link>

            {/* Search */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">🔍 Search Stocks</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by symbol or name..."
                className="w-full px-4 py-2.5 rounded-xl ring-1 text-sm"
                style={{ borderColor: COLORS.cardBorder }}
              />
              {searchLoading && <p className="text-xs text-slate-500 mt-2">Searching...</p>}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl ring-1" style={{ borderColor: COLORS.cardBorder }}>
                  {searchResults.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() => handleSelectStock(s.symbol)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b last:border-b-0 text-sm"
                      style={{ borderColor: COLORS.cardBorder }}
                    >
                      <span className="font-semibold" style={{ color: COLORS.primary }}>{s.symbol}</span>
                      <span className="text-slate-500 ml-2">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Divider />

            {/* Your Holdings - Quick Access */}
            {positionSymbols.length > 0 && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-3"> Your Holdings</h2>
                  <div className="space-y-2">
                    {positionSymbols.slice(0, 5).map(sym => {
                      const pos = positions[sym];
                      const value = pos.qty * pos.avg_cost;
                      return (
                        <button
                          key={sym}
                          onClick={() => setSelectedAsset(sym)}
                          className="w-full flex items-center justify-between p-3 rounded-xl ring-1 hover:bg-slate-50 transition-colors"
                          style={{ borderColor: COLORS.cardBorder }}
                        >
                          <div className="text-left">
                            <p className="font-semibold" style={{ color: COLORS.primary }}>{sym}</p>
                            <p className="text-xs text-slate-500">{pos.qty} shares</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">${value.toFixed(2)}</p>
                            <p className="text-xs text-slate-400">View →</p>
                          </div>
                        </button>
                      );
                    })}
                    {positionSymbols.length > 5 && (
                      <p className="text-xs text-slate-400 text-center mt-2">
                        +{positionSymbols.length - 5} more positions
                      </p>
                    )}
                  </div>
                </div>
                <Divider />
              </>
            )}

            {/* Sectors */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3"> Browse Sectors</h2>
              {Object.entries(SECTORS).map(([name, sector]) => (
                <div key={name} className="mb-2">
                  <button
                    onClick={() => setExpandedSector(expandedSector === name ? null : name)}
                    className="w-full flex items-center justify-between p-3 rounded-xl ring-1 hover:bg-slate-50"
                    style={{ borderColor: COLORS.cardBorder }}
                  >
                    <span className="font-medium text-slate-800">{sector.icon} {name}</span>
                    <span className="text-slate-400">{expandedSector === name ? '−' : '+'}</span>
                  </button>
                  
                  {expandedSector === name && (
                    <div className="mt-2 p-3 rounded-xl text-sm" style={{ backgroundColor: COLORS.primaryLight }}>
                      <p className="text-slate-600 mb-2">{sector.description}</p>
                      <div className="space-y-1">
                        {sector.symbols.map(sym => (
                          <button
                            key={sym}
                            onClick={() => handleSelectStock(sym)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-white hover:ring-1"
                          >
                            <span className="font-semibold" style={{ color: COLORS.primary }}>{sym}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4" style={{ borderColor: COLORS.cardBorder }}>
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Stock Simulator</h1>
                  <p className="text-slate-500 text-sm">Practice with $100,000 • Track Your Performance </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Cash</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.primary }}>
                    ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Equity</p>
                  <p className="text-xl font-bold text-slate-900">
                    {marketValueLoading ? (
                      <span className="text-slate-400">Loading...</span>
                    ) : (
                      `$${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    )}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {isPositive ? '+' : ''}{percentageGain.toFixed(2)}%
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Gain</p>
                  <p className={`text-sm font-bold ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isPositive ? '+' : ''}${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <nav className="bg-white border-b px-6" style={{ borderColor: COLORS.cardBorder }}>
            <div className="max-w-6xl mx-auto flex gap-1">
              {[
                { id: 'trade', label: 'Trade', icon: '' },
                { id: 'portfolio', label: 'Portfolio', icon: '' },
                { id: 'history', label: 'History', icon: '' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 font-medium relative ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}
                >
                  {tab.icon} {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLORS.primary }} />}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-6xl mx-auto">

              {/* Alerts */}
              {tradeError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 ring-1 ring-red-200 flex justify-between">
                  <span> {tradeError}</span>
                  <button onClick={() => setTradeError(null)}>✕</button>
                </div>
              )}
              {tradeSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex justify-between">
                  <span> {tradeSuccess}</span>
                  <button onClick={() => setTradeSuccess(null)}>✕</button>
                </div>
              )}

              {/* TRADE TAB */}
              {activeTab === 'trade' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Buy Card */}
                  <Card title="Buy Stocks" icon="" iconBg={COLORS.successLight} iconColor={COLORS.success}>
                    {!selectedSymbol ? (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-3"></p>
                        <p className="font-semibold text-slate-700">No stock selected</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Search for a stock or browse sectors in the sidebar
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-slate-600">Selected Stock</p>
                              <p className="text-xl font-bold" style={{ color: COLORS.primary }}>{selectedSymbol}</p>
                            </div>
                            <button 
                              onClick={() => setSelectedSymbol("")}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.successLight }}>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Current Price</span>
                            {priceLoading ? (
                              <span className="text-slate-400">Loading...</span>
                            ) : currentPrice ? (
                              <span className="text-2xl font-bold" style={{ color: COLORS.success }}>
                                ${currentPrice.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-red-500">Failed to load</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                          <input
                            type="number"
                            value={buyQty || ''}
                            onChange={(e) => setBuyQty(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="1"
                            placeholder="Enter number of shares"
                            className="w-full px-4 py-3 rounded-xl ring-1"
                            style={{ borderColor: COLORS.cardBorder }}
                          />
                          {currentPrice && buyQty > 0 && (
                            <p className="text-sm text-slate-500 mt-2">
                              Total: <span className="font-semibold text-slate-900">${buyTotal.toFixed(2)}</span>
                              {buyTotal > cashBalance && <span className="text-red-500 ml-2">(Insufficient funds)</span>}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={handleBuy}
                          disabled={tradeLoading || !canBuy}
                          className="w-full py-3 rounded-full text-white font-semibold disabled:opacity-50"
                          style={{ backgroundColor: COLORS.success }}
                        >
                          {tradeLoading ? 'Processing...' : `Buy ${selectedSymbol}`}
                        </button>
                      </div>
                    )}
                  </Card>

                  {/* Sell Card */}
                  <Card title="Sell Stocks" icon="📉" iconBg={COLORS.dangerLight} iconColor={COLORS.danger}>
                    {positionSymbols.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-3"></p>
                        <p className="font-semibold text-slate-700">No positions</p>
                        <p className="text-sm text-slate-500 mt-1">Buy some stocks first!</p>
                      </div>
                    ) : !sellSymbol ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <p className="text-sm text-slate-600 mb-3">Select Position</p>
                          <select
                            value={sellSymbol}
                            onChange={(e) => { setSellSymbol(e.target.value); setSellQty(0); }}
                            className="w-full px-4 py-2.5 rounded-lg bg-white ring-1 font-medium text-slate-900 cursor-pointer"
                            style={{ borderColor: COLORS.cardBorder, color: COLORS.primary }}
                          >
                            <option value="">Select a position...</option>
                            {positionSymbols.map(sym => (
                              <option key={sym} value={sym}>
                                {sym} — {positions[sym].qty} shares @ ${positions[sym].avg_cost.toFixed(2)} avg
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-slate-50 border border-dashed" style={{ borderColor: COLORS.cardBorder }}>
                          <p className="text-center text-slate-500 text-sm">
                            Choose a position above to start selling
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selected Position Box */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-slate-600">Selected Position</p>
                              <p className="text-xl font-bold" style={{ color: COLORS.primary }}>{sellSymbol}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                You own {maxSellQty} shares @ ${positions[sellSymbol].avg_cost.toFixed(2)} avg
                              </p>
                            </div>
                            <button 
                              onClick={() => { setSellSymbol(""); setSellQty(0); }}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Current Price Box */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.dangerLight }}>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Current Price</span>
                            <span className="text-2xl font-bold" style={{ color: COLORS.danger }}>
                              {sellPrice ? `$${sellPrice.toFixed(2)}` : 'Loading...'}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Input */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Quantity to Sell</label>
                          <input
                            type="number"
                            value={sellQty || ''}
                            onChange={(e) => setSellQty(parseFloat(e.target.value) || 0)}
                            min="0"
                            max={maxSellQty}
                            step="1"
                            placeholder="Enter number of shares"
                            className="w-full px-4 py-3 rounded-xl ring-1"
                            style={{ borderColor: COLORS.cardBorder }}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <button 
                              onClick={() => setSellQty(maxSellQty)}
                              className="text-xs font-medium hover:underline"
                              style={{ color: COLORS.primary }}
                            >
                              Sell all ({maxSellQty})
                            </button>
                            {sellPrice && sellQty > 0 && (
                              <p className="text-sm text-slate-500">
                                Total: <span className="font-semibold text-slate-900">${(sellQty * sellPrice).toFixed(2)}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Sell Button */}
                        <button
                          onClick={handleSell}
                          disabled={tradeLoading || !canSell}
                          className="w-full py-3 rounded-full text-white font-semibold disabled:opacity-50"
                          style={{ backgroundColor: COLORS.danger }}
                        >
                          {tradeLoading ? 'Processing...' : `Sell ${sellSymbol}`}
                        </button>
                      </div>
                    )}
                  </Card>

                  {/* Cash Bar */}
                  <div className="lg:col-span-2">
                    <Card>
                      <div className="flex justify-between mb-3">
                        <span className="font-semibold text-slate-900">💵 Available Cash</span>
                        <span className="font-bold" style={{ color: COLORS.primary }}>
                          ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((cashBalance / 100000) * 100, 100)}%`, backgroundColor: COLORS.primary }} />
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-slate-500">{((cashBalance / 100000) * 100).toFixed(1)}% remaining</p>
                        <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-500">
                          Reset Portfolio
                        </button>
                      </div>
                    </Card>
                  </div>

                  {/* Tip */}
                  <div className="lg:col-span-2 p-4 rounded-2xl" style={{ backgroundColor: COLORS.warningLight }}>
                    <p className="text-slate-700">{currentTip}</p>
                  </div>
                </div>
              )}

              {/* PORTFOLIO TAB */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  {/* Portfolio Growth Chart */}
                  <Card title="Portfolio Value Over Time" icon="">
                    <PortfolioValueChart portfolio={portfolio} />
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Portfolio Allocation */}
                    <Card title="Portfolio Allocation" icon="">
                      <PortfolioAllocationChart positions={positions} />
                    </Card>

                    {/* Analytics & Feedback */}
                    <div className="space-y-6">
                      {/* Your Positions */}
                      <Card title="Your Positions" icon="">
                        {positionSymbols.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-4xl mb-3"></p>
                            <p className="font-semibold text-slate-700">No positions yet</p>
                            <p className="text-sm text-slate-500 mt-1">Start trading!</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {positionSymbols.map(sym => {
                              const pos = positions[sym];
                              const value = pos.qty * pos.avg_cost;
                              return (
                                <div key={sym} className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                                  <div>
                                    <button 
                                      onClick={() => setSelectedAsset(sym)}
                                      className="font-semibold hover:underline cursor-pointer"
                                      style={{ color: COLORS.primary }}
                                    >
                                      {sym}
                                    </button>
                                    <p className="text-xs text-slate-500">{pos.qty} shares @ ${pos.avg_cost.toFixed(2)}</p>
                                  </div>
                                  <p className="font-bold text-slate-900">${value.toFixed(2)}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Card>

                      {/* Portfolio Health Score */}
                      <Card title="Portfolio Health Score" icon="">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${portfolioHealth.color}20` }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Score</span>
                            <span className="text-lg font-bold" style={{ color: portfolioHealth.color }}>
                              {portfolioHealth.score}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{portfolioHealth.message}</p>
                        </div>
                      </Card>

                      {/* Risk Level */}
                      <Card title="Risk Level" icon="">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${riskLevel.color}20` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: riskLevel.color }} />
                            <span className="text-lg font-bold" style={{ color: riskLevel.color }}>
                              {riskLevel.level}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{riskLevel.message}</p>
                        </div>
                      </Card>

                      {/* Estimated Monthly Dividends */}
                      <Card title="Estimated Monthly Dividends" icon="">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <p className="text-sm text-slate-600 mb-1">Estimated Monthly Dividends</p>
                          <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                            ${monthlyDividends.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {monthlyDividends > 0 
                              ? `${(monthlyDividends * 12).toFixed(2)} annually from dividend-paying stocks`
                              : 'None of your holdings pay dividends'}
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* HISTORY TAB */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Future Projections Chart */}
                  <Card title="Future Portfolio Projections" icon="">
                    {/* Warning Banner */}
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl"></span>
                        <div>
                          <p className="font-semibold text-amber-900 mb-1">Educational Projections Only</p>
                          <p className="text-sm text-amber-800">
                            These projections are based on historical market averages (5-10% annual returns). 
                            <strong> Past performance does not guarantee future results.</strong> Actual returns may be higher or lower. 
                            This is for educational purposes to understand compound growth.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FutureProjectionsChart currentValue={totalEquity} />
                  </Card>

                  {/* Transaction History */}
                  <Card title="Transaction History" icon="">
                  {!portfolio?.history || portfolio.history.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-5xl mb-4"></p>
                      <p className="font-semibold text-slate-700">No transactions yet</p>
                      <p className="text-sm text-slate-500 mt-1">Start trading to see your history!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b" style={{ borderColor: COLORS.cardBorder }}>
                            <th className="pb-4">Date</th>
                            <th className="pb-4">Side</th>
                            <th className="pb-4">Symbol</th>
                            <th className="pb-4 text-center">Qty</th>
                            <th className="pb-4 text-right">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {[...portfolio.history].reverse().map((txn: any, idx: number) => {
                            const side = txn.type || txn.side; 
                            const isBuy = side === 'BUY';
                            const totalAmount = txn.qty * txn.price;

                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 text-xs text-slate-500 font-medium">
                                  {new Date(txn.ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </td>
                                <td className="py-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${
                                    isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                  }`}>
                                    {side}
                                  </span>
                                </td>
                                <td className="py-4">
                                  <button
                                    onClick={() => setSelectedAsset(txn.ticker)}
                                    className="font-black text-slate-900 hover:underline cursor-pointer"
                                    style={{ color: COLORS.primary }}
                                  >
                                    {txn.ticker || 'CASH'}
                                  </button>
                                </td>
                                <td className={`py-4 text-center font-bold ${isBuy ? 'text-slate-700' : 'text-rose-600'}`}>
                                  {isBuy ? `+${txn.qty}` : `-${txn.qty}`}
                                </td>
                                <td className="py-4 text-right font-black text-slate-900">
                                  ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Asset Dashboard Modal */}
      {selectedAsset && (
        <AssetDashboard
          symbol={selectedAsset}
          portfolio={portfolio}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </main>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function Card({ title, icon, iconBg = COLORS.primaryLight, iconColor = COLORS.primary, children }: { 
  title?: string; icon?: string; iconBg?: string; iconColor?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 ring-1" style={{ borderColor: COLORS.cardBorder }}>
      {title && (
        <div className="flex items-center gap-3 mb-5">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm" style={{ backgroundColor: iconBg, color: iconColor }}>
              {icon}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full my-6" style={{ backgroundColor: COLORS.cardBorder }} />;
}