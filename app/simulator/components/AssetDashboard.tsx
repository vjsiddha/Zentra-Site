// app/simulator/components/AssetDashboard.tsx
"use client";

import { mockInvestorApi } from '@/lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid
} from 'recharts';

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

// ============================================================================
// API CONFIG
// ============================================================================
const MARKET_DATA_API = (process.env.NEXT_PUBLIC_MARKET_API || 'http://localhost:8001').replace(/\/+$/, '');
const MOCK_INVESTOR_API = (process.env.NEXT_PUBLIC_MOCK_INVESTOR_API || 'http://localhost:8000').replace(/\/+$/, '');

interface AssetDashboardProps {
  symbol: string;
  onClose: () => void;
  portfolio: any;
}

interface CompanyInfo {
  name: string;
  industry: string;
  sector: string;
  marketCap: number;
  peRatio: number | null;
  dividendYield: number | null;
}

interface PriceHistory {
  date: string;
  close: number;
}

export default function AssetDashboard({ symbol, onClose, portfolio}: AssetDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '1m' | '1y'>('7d');
  const [news, setNews] = useState<any[]>([]);

  // Get user's transactions for this asset
  const assetTransactions = portfolio?.history?.filter((txn: any) => 
    txn.ticker === symbol
  ) || [];

  // Calculate unrealized return using live price
  const position = portfolio?.positions?.[symbol];
  const calculateUnrealizedReturn = () => {
    if (!position || !currentPrice) return { amount: 0, percentage: 0 };
    const currentValue = position.qty * currentPrice;
    const costBasis = position.qty * position.avg_cost;
    const unrealizedGain = currentValue - costBasis;
    const unrealizedPercent = (unrealizedGain / costBasis) * 100;
    return { amount: unrealizedGain, percentage: unrealizedPercent };
  };

  const unrealizedReturn = calculateUnrealizedReturn();

  // ── Fetch price through mock-investor so shock multipliers apply ──
  const fetchLivePrice = async () => {
    try {
      const data = await mockInvestorApi.getShockedQuote(symbol);
      setCurrentPrice(data.last);
    } catch {}
  };

  // Fetch company info, price history, news
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Price via mock-investor (applies shocks)
        await fetchLivePrice();

        // Company info
        const infoResponse = await fetch(`${MARKET_DATA_API}/company-info/${symbol}`);
        const infoData = await infoResponse.json();
        if (infoData.ok) {
          setCompanyInfo({
            name: infoData.data.name,
            industry: infoData.data.industry || 'N/A',
            sector: infoData.data.sector || 'N/A',
            marketCap: infoData.data.market_cap || 0,
            peRatio: infoData.data.pe_ratio || null,
            dividendYield: infoData.data.dividend_yield || null,
          });
        }

        // Price history
        const historyResponse = await fetch(`${MARKET_DATA_API}/history/${symbol}?period=${timeframe}`);
        const historyData = await historyResponse.json();
        if (historyData.ok && Array.isArray(historyData.data) && historyData.data.length > 0) {
          setPriceHistory(historyData.data);
        } else {
          setPriceHistory(generateMockData(timeframe));
        }

        // News
        const newsResponse = await fetch(`${MARKET_DATA_API}/news/${symbol}`);
        const newsData = await newsResponse.json();
        if (newsData.ok) setNews(newsData.data);

      } catch (error) {
        console.error('Error fetching asset data:', error);
        setPriceHistory(generateMockData(timeframe));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe]);

  // ── Poll live price every 30s via mock-investor ──
  useEffect(() => {
    const t = setInterval(fetchLivePrice, 30000);
    return () => clearInterval(t);
  }, [symbol]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-4" 
                 style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
            <p className="text-slate-600">Loading asset details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" 
             style={{ borderColor: COLORS.cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">📊</div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{symbol} – Asset Dashboard</h2>
              <p className="text-sm text-slate-500">{companyInfo?.name || 'Loading...'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="🏢 Company Info">
              <div className="space-y-3">
                <InfoRow label="Name" value={companyInfo?.name || 'N/A'} />
                <InfoRow label="Industry" value={companyInfo?.industry || 'N/A'} />
                <InfoRow label="Sector" value={companyInfo?.sector || 'N/A'} />
              </div>
            </Card>

            <Card title="💰 Live Price">
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 mb-2">{symbol} Price</p>
                <p className="text-4xl font-bold" style={{ color: COLORS.primary }}>
                  ${currentPrice?.toFixed(2) || '—'}
                </p>
                <p className="text-xs text-slate-400 mt-2">Updates every 30s</p>
              </div>
            </Card>

            <Card title="📊 Key Financials">
              <div className="space-y-3">
                <InfoRow 
                  label="Market Cap" 
                  value={companyInfo?.marketCap ? formatMarketCap(companyInfo.marketCap) : 'N/A'} 
                  tooltip="Market Capitalization is the total value of all a company's shares. It's calculated by multiplying the share price by the total number of shares."
                />
                <InfoRow 
                  label="P/E Ratio" 
                  value={companyInfo?.peRatio?.toFixed(2) || 'N/A'} 
                  tooltip="Price-to-Earnings Ratio compares the stock price to the company's earnings per share. A higher P/E might mean investors expect future growth."
                />
                <InfoRow 
                  label="Dividend Yield" 
                  value={companyInfo?.dividendYield ? `${companyInfo.dividendYield.toFixed(2)}%` : 'N/A'} 
                  tooltip="Dividend Yield shows how much a company pays in dividends each year relative to its stock price."
                />
              </div>
            </Card>
          </div>

          {/* Price Trend */}
          <Card title="📈 Price Trend">
            <div className="mb-4 flex gap-2">
              {[{ id: '7d', label: '7 Days' }, { id: '1m', label: '1 Month' }, { id: '1y', label: '1 Year' }].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeframe === tf.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={timeframe === tf.id ? { backgroundColor: COLORS.primary } : {}}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <div className="h-[300px] w-full">
              {priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toFixed(2)}`} />
                    <Tooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Close']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="close" stroke={COLORS.primary} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin w-6 h-6 border-4 border-t-transparent rounded-full mx-auto mb-2" style={{ borderColor: COLORS.primary }} />
                    <p className="text-slate-500">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Transactions */}
          <Card title="📋 Your Transactions for This Asset">
            {position && (
              <div className="mb-4 p-4 rounded-xl" 
                   style={{ backgroundColor: unrealizedReturn.amount >= 0 ? COLORS.successLight : COLORS.dangerLight }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">📈 Unrealized Return</span>
                  <InfoTooltip text="Unrealized Return shows how much profit or loss you'd have if you sold right now, based on live price." />
                </div>
                <p className={`text-2xl font-bold mt-1 ${unrealizedReturn.amount >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {unrealizedReturn.amount >= 0 ? '+' : ''}{unrealizedReturn.percentage.toFixed(2)}%
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {unrealizedReturn.amount >= 0 ? '+' : ''}${unrealizedReturn.amount.toFixed(2)}
                </p>
              </div>
            )}

            {assetTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b" style={{ borderColor: COLORS.cardBorder }}>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Action</th>
                      <th className="pb-3 font-medium">Asset</th>
                      <th className="pb-3 font-medium text-right">Shares</th>
                      <th className="pb-3 font-medium text-right">Price</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetTransactions.map((txn: any, idx: number) => {
                      const isBuy = txn.type === 'BUY' || txn.side === 'BUY';
                      return (
                        <tr key={idx} className="border-b" style={{ borderColor: COLORS.cardBorder }}>
                          <td className="py-3 text-sm text-slate-600">{new Date(txn.ts).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {txn.type || txn.side}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-900">{txn.ticker}</td>
                          <td className="py-3 text-right font-medium">{txn.qty}</td>
                          <td className="py-3 text-right">${txn.price.toFixed(2)}</td>
                          <td className="py-3 text-right font-semibold">${(txn.qty * txn.price).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No transactions for this asset yet</p>
              </div>
            )}
          </Card>

          {/* News */}
          <Card title={`📰 Latest News on ${symbol}`}>
            {news.length > 0 ? (
              <div className="space-y-4">
                {news.slice(0, 5).map((article, idx) => (
                  <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer"
                    className="block p-4 rounded-xl hover:bg-slate-50 transition-colors border"
                    style={{ borderColor: COLORS.cardBorder }}>
                    <h4 className="font-semibold text-slate-900 mb-1">{article.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{article.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{article.source}</span>
                      {article.published_at && <><span>•</span><span>{article.published_at}</span></>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-blue-50 rounded-xl">
                <p className="text-blue-700">No news articles found.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9)  return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6)  return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toFixed(2)}`;
}

function generateMockData(timeframe: '7d' | '1m' | '1y'): PriceHistory[] {
  const days = timeframe === '7d' ? 7 : timeframe === '1m' ? 30 : 365;
  const mockData: PriceHistory[] = [];
  const basePrice = 250;
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = timeframe === '1y'
      ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    mockData.push({ date: dateStr, close: Math.round((basePrice + i * 2 + Math.random() * 5 - 2.5) * 100) / 100 });
  }
  return mockData;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
function InfoTooltip({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative inline-block">
      <button onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg -top-2 left-6 pointer-events-none">
          <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45 -left-1 top-3"></div>
          {text}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 ring-1" style={{ borderColor: COLORS.cardBorder }}>
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1">
        <span className="text-sm text-slate-600">{label}</span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}