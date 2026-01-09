// app/simulator/page.tsx
// Stock Simulator - Fixed version with better error handling
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import Link from 'next/link';


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
const API_BASE = process.env.NEXT_PUBLIC_MOCK_INVESTOR_API || 'http://localhost:8000';

// ============================================================================
// API FUNCTIONS (inline for easier debugging)
// ============================================================================

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  console.log(`API Call: ${url}`);
  
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

// Portfolio
async function getPortfolio() {
  return apiCall<any>('/portfolio');
}

async function resetPortfolio(startingCash = 100000) {
  return apiCall<any>('/portfolio/reset', {
    method: 'POST',
    body: JSON.stringify({ starting_cash: startingCash }),
  });
}

// Trading
async function buyStock(symbol: string, qty: number, price: number) {
  return apiCall<any>('/orders/buy', {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, price }),
  });
}

async function sellStock(symbol: string, qty: number, price: number) {
  return apiCall<any>('/orders/sell', {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, price }),
  });
}

// Market Data
async function getQuote(symbol: string) {
  return apiCall<any>(`/quote/${symbol}`);
}

async function searchSymbols(query: string, limit = 20) {
  return apiCall<any[]>(`/symbols?q=${encodeURIComponent(query)}&limit=${limit}`);
}

async function getMarkToMarket() {
  return apiCall<any>('/metrics/mark-to-market');
}

// ============================================================================
// SECTOR DATA
// ============================================================================
const SECTORS: Record<string, { symbols: string[]; icon: string; description: string }> = {
  Tech: {
    symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"],
    icon: "🧠",
    description: "Fast-growing tech companies."
  },
  ETFs: {
    symbols: ["SPY", "QQQ", "VTI", "VOO"],
    icon: "💼",
    description: "Diversified funds — safer for beginners."
  },
  Banking: {
    symbols: ["JPM", "BAC", "WFC", "GS"],
    icon: "🏦",
    description: "Major banks with stable dividends."
  },
  "Green Energy": {
    symbols: ["TSLA", "ENPH", "NEE"],
    icon: "🌱",
    description: "Clean energy companies."
  },
};

const TIPS = [
  "💡 Diversify across sectors to reduce risk.",
  "📉 Don't panic when markets drop — stay the course!",
  "🏆 Long-term investing beats short-term trading.",
];

function PortfolioChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
        No history data available yet. Make more trades to see your progress!
      </div>
    );
  }

  const chartData = data.map(item => ({
    time: new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    equity: item.equity
  }));

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B5E8E" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0B5E8E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            formatter={(val: number) => [`$${val.toLocaleString()}`, 'Total Equity']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="equity" 
            stroke="#0B5E8E" 
            fillOpacity={1} 
            fill="url(#colorEquity)" 
            strokeWidth={3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SimulatorPage() {
  // Portfolio state
  const [portfolio, setPortfolio] = useState<any>(null);
  const [mtm, setMtm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  
  const [activeTab, setActiveTab] = useState("trade");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  // Trading form state - NO DEFAULT STOCK
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

  // Debug state
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  // Graph
  // 1. Add this state
const [equityHistory, setEquityHistory] = useState<any[]>([]);

// 2. Update your loadData function
const loadData = useCallback(async () => {
  try {
    // Fetch portfolio, mark-to-market, and the equity curve data
    const [p, m, h] = await Promise.all([
      apiCall<any>('/portfolio'),
      apiCall<any>('/metrics/mark-to-market').catch(() => null),
      apiCall<any[]>('/metrics/equity-curve').catch(() => [])
    ]);

    setPortfolio(p);
    setMtm(m);
    setEquityHistory(h); // Save the history data for the chart
  } catch (err) {
    console.error("Failed to load chart data:", err);
  }
}, []);


  // -------------------------------------------------------------------------
  // LOAD PORTFOLIO
  // -------------------------------------------------------------------------
  const loadPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      addDebug('Loading portfolio...');
      
      const [portfolioData, mtmData] = await Promise.all([
        getPortfolio(),
        getMarkToMarket().catch(() => null),
      ]);
      
      addDebug(`Portfolio loaded: cash=${portfolioData.cash}, positions=${Object.keys(portfolioData.positions || {}).length}`);
      
      setPortfolio(portfolioData);
      setMtm(mtmData);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load';
      addDebug(`Error loading portfolio: ${msg}`);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

// add porfolio charts



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
        addDebug(`Searching for: ${searchQuery}`);
        const results = await searchSymbols(searchQuery, 20);
        addDebug(`Found ${results.length} results`);
        setSearchResults(results);
      } catch (err) {
        addDebug(`Search error: ${err}`);
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
        addDebug(`Fetching price for ${selectedSymbol}...`);
        const quote = await getQuote(selectedSymbol);
        addDebug(`Price for ${selectedSymbol}: $${quote.last}`);
        setCurrentPrice(quote.last);
      } catch (err) {
        addDebug(`Price error for ${selectedSymbol}: ${err}`);
        setCurrentPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Fetch sell price when sell symbol selected
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
      addDebug(`Buying ${buyQty} shares of ${selectedSymbol} at $${currentPrice}`);
      const result = await buyStock(selectedSymbol, buyQty, currentPrice);
      addDebug(`Buy successful: ${JSON.stringify(result)}`);
      
      setTradeSuccess(`Bought ${buyQty} shares of ${selectedSymbol} at $${currentPrice.toFixed(2)}`);
      setBuyQty(0);
      loadPortfolioData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Trade failed';
      addDebug(`Buy error: ${msg}`);
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
      addDebug(`Selling ${sellQty} shares of ${sellSymbol} at $${sellPrice}`);
      const result = await sellStock(sellSymbol, sellQty, sellPrice);
      addDebug(`Sell successful: ${JSON.stringify(result)}`);
      
      setTradeSuccess(`Sold ${sellQty} shares of ${sellSymbol} at $${sellPrice.toFixed(2)}`);
      setSellQty(0);
      setSellSymbol("");
      loadPortfolioData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Trade failed';
      addDebug(`Sell error: ${msg}`);
      setTradeError(msg);
    } finally {
      setTradeLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset portfolio to $100,000? All positions will be closed.')) return;
    
    try {
      await resetPortfolio(100000);
      loadPortfolioData();
      setTradeSuccess('Portfolio reset to $100,000');
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
  const history = portfolio?.history ?? [];
  const totalEquity = mtm?.total_equity ?? cashBalance;
  const percentageGain = ((totalEquity - 100000) / 100000) * 100;
  const isPositive = percentageGain >= 0;

  const buyTotal = buyQty * (currentPrice || 0);
  const canBuy = selectedSymbol && buyQty > 0 && currentPrice && buyTotal <= cashBalance;

  const maxSellQty = sellSymbol ? (positions[sellSymbol]?.qty || 0) : 0;
  const canSell = sellSymbol && sellQty > 0 && sellQty <= maxSellQty && sellPrice;

  const currentTip = TIPS[Math.floor(Date.now() / 60000) % TIPS.length];

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
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500 mb-4">
            Make sure the Python API is running:<br />
            <code className="bg-slate-100 px-2 py-1 rounded text-xs">
              cd services/mock-investor && uvicorn mock_investor.api:app --reload --port 8000
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

            {/* Sectors */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">📘 Browse Sectors</h2>
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

            {/* Debug Info */}
            {debugInfo.length > 0 && (
              <>
                <Divider />
                <div>
                  <h2 className="text-sm font-bold text-slate-500 mb-2">🐛 Debug Log</h2>
                  <div className="text-xs text-slate-400 space-y-1 max-h-32 overflow-y-auto">
                    {debugInfo.map((msg, i) => (
                      <p key={i}>{msg}</p>
                    ))}
                  </div>
                </div>
              </>
            )}
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
                  <p className="text-slate-500 text-sm">Practice with $100,000</p>
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
                    ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {isPositive ? '+' : ''}{percentageGain.toFixed(2)}%
                </div>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <nav className="bg-white border-b px-6" style={{ borderColor: COLORS.cardBorder }}>
            <div className="max-w-6xl mx-auto flex gap-1">
              {[
                { id: 'trade', label: 'Trade', icon: '💹' },
                { id: 'portfolio', label: 'Portfolio', icon: '📊' },
                { id: 'history', label: 'History', icon: '📋' }
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
                  <span>❌ {tradeError}</span>
                  <button onClick={() => setTradeError(null)}>✕</button>
                </div>
              )}
              {tradeSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex justify-between">
                  <span>✅ {tradeSuccess}</span>
                  <button onClick={() => setTradeSuccess(null)}>✕</button>
                </div>
              )}

              {/* TRADE TAB */}
              {activeTab === 'trade' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Buy Card */}
                  <Card title="Buy Stocks" icon="📈" iconBg={COLORS.successLight} iconColor={COLORS.success}>
                    {!selectedSymbol ? (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-3">🔍</p>
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
                        <p className="text-4xl mb-3">📭</p>
                        <p className="font-semibold text-slate-700">No positions</p>
                        <p className="text-sm text-slate-500 mt-1">Buy some stocks first!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Select Position</label>
                          <select
                            value={sellSymbol}
                            onChange={(e) => { setSellSymbol(e.target.value); setSellQty(0); }}
                            className="w-full px-4 py-3 rounded-xl ring-1 bg-white"
                            style={{ borderColor: COLORS.cardBorder }}
                          >
                            <option value="">Select a position...</option>
                            {positionSymbols.map(sym => (
                              <option key={sym} value={sym}>
                                {sym} — {positions[sym].qty} shares @ ${positions[sym].avg_cost.toFixed(2)} avg
                              </option>
                            ))}
                          </select>
                        </div>

                        {sellSymbol && (
                          <>
                            <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.dangerLight }}>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Current Price</span>
                                <span className="text-2xl font-bold" style={{ color: COLORS.danger }}>
                                  {sellPrice ? `$${sellPrice.toFixed(2)}` : 'Loading...'}
                                </span>
                              </div>
                              <div className="flex justify-between mt-2 text-sm">
                                <span className="text-slate-500">You own</span>
                                <span className="font-medium">{maxSellQty} shares</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Quantity to Sell</label>
                              <input
                                type="number"
                                value={sellQty || ''}
                                onChange={(e) => setSellQty(parseFloat(e.target.value) || 0)}
                                min="0"
                                max={maxSellQty}
                                step="1"
                                className="w-full px-4 py-3 rounded-xl ring-1"
                                style={{ borderColor: COLORS.cardBorder }}
                              />
                              <button 
                                onClick={() => setSellQty(maxSellQty)}
                                className="text-xs text-slate-500 hover:text-slate-700 mt-1"
                              >
                                Sell all ({maxSellQty})
                              </button>
                            </div>

                            <button
                              onClick={handleSell}
                              disabled={tradeLoading || !canSell}
                              className="w-full py-3 rounded-full text-white font-semibold disabled:opacity-50"
                              style={{ backgroundColor: COLORS.danger }}
                            >
                              {tradeLoading ? 'Processing...' : `Sell ${sellSymbol}`}
                            </button>
                          </>
                        )}
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
                
                <Card title="Your Positions" icon="📊">
                  {positionSymbols.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-5xl mb-4">📭</p>
                      <p className="font-semibold text-slate-700">No positions yet</p>
                      <p className="text-sm text-slate-500 mt-1">Start trading to build your portfolio!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-slate-500 border-b" style={{ borderColor: COLORS.cardBorder }}>
                            <th className="pb-3">Symbol</th>
                            <th className="pb-3">Qty</th>
                            <th className="pb-3">Avg Cost</th>
                            <th className="pb-3">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positionSymbols.map(sym => {
                            const pos = positions[sym];
                            const value = pos.qty * pos.avg_cost;
                            return (
                              <tr key={sym} className="border-b" style={{ borderColor: COLORS.cardBorder }}>
                                <td className="py-4 font-semibold" style={{ color: COLORS.primary }}>{sym}</td>
                                <td className="py-4">{pos.qty}</td>
                                <td className="py-4">${pos.avg_cost.toFixed(2)}</td>
                                <td className="py-4 font-semibold">${value.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}

              {/* HISTORY TAB */}
{activeTab === 'history' && (
  <Card title="Transaction History" icon="📜">
    {!portfolio?.history || portfolio.history.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-5xl mb-4">📝</p>
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
              // Standardizing 'type' vs 'side' from your API
              const side = txn.type || txn.side; 
              const isBuy = side === 'BUY';
              // Calculating Total: Quantity * Price
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
                  <td className="py-4 font-black text-slate-900">{txn.ticker || 'CASH'}</td>
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
)}

            </div>
          </div>
        </div>
      </div>
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