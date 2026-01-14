// app/chatbot/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Scatter
} from 'recharts';

// ============================================================================
// DESIGN TOKENS (Match your app's exact colors)
// ============================================================================
const COLORS = {
  primary: '#0E5B87',      // Your exact blue
  primaryLight: '#0E5B87',
  primaryBg: 'rgba(14, 91, 135, 0.2)', // 20% opacity for banner
  avatarBg: '#DBEAFE',     // Light blue for avatar
  background: '#F7FAFC',
  cardBorder: '#E8EEF6',
  success: '#10b981',
  warning: '#f59e0b',
};

// ============================================================================
// TYPES
// ============================================================================
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SimulationResult {
  data: { month: number; value: number }[];
  summary: {
    totalInvested: number;
    finalValue: number;
    totalGain: number;
    gainPercent: number;
  };
}

// ============================================================================
// UTILITY FUNCTIONS (From your Streamlit code)
// ============================================================================

function cleanUserInput(text: string): string {
  text = text.replace(/(\d),\s*(\d)/g, '$1$2'); // Fix comma spacing: 1, 000 -> 1000
  text = text.replace(/nowversus/g, 'now versus ');
  text = text.replace(/(\d)([a-zA-Z])/g, '$1 $2'); // 100now -> 100 now
  text = text.replace(/([a-zA-Z])(\d)/g, '$1 $2'); // versus100 -> versus 100
  return text;
}

function sanitizeResponse(text: string): string {
  text = text.replace(/`+/g, '');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
  text = text.replace(/\*([^*]+)\*/g, '$1'); // Remove italics
  text = text.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  text = text.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  text = text.replace(/\s*,\s*/g, ', ');
  return text;
}

function simulateInvestmentGrowth(
  monthlyInvestment: number,
  years: number,
  annualReturn: number = 0.07
): number[] {
  const months = years * 12;
  let total = 0;
  const balance: number[] = [];
  
  for (let i = 0; i < months; i++) {
    total += monthlyInvestment;
    total *= (1 + annualReturn / 12);
    balance.push(total);
  }
  
  return balance;
}

function simulateMarketCrash(
  monthlyInvestment: number,
  years: number,
  annualReturn: number = 0.07,
  crashYear: number = 2,
  crashPercent: number = 0.3
): number[] {
  const months = years * 12;
  const crashMonth = crashYear * 12;
  let total = 0;
  const balance: number[] = [];
  
  for (let i = 1; i <= months; i++) {
    total += monthlyInvestment;
    total *= (1 + annualReturn / 12);
    if (i === crashMonth) {
      total *= (1 - crashPercent);
    }
    balance.push(total);
  }
  
  return balance;
}

function extractSimulationParams(input: string): { amount?: number; years?: number; hasCrash: boolean } {
  const amountMatch = input.match(/\$?(\d{2,5})/);
  const timeMatch = input.match(/(\d{1,2})\s*(year|month)/);
  const hasCrash = input.toLowerCase().includes('crash');
  
  let amount: number | undefined;
  let years: number | undefined;
  
  if (amountMatch) {
    amount = parseInt(amountMatch[1]);
  }
  
  if (timeMatch) {
    const timeValue = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    years = unit === 'month' ? Math.round(timeValue / 12 * 100) / 100 : timeValue;
  }
  
  return { amount, years, hasCrash };
}

function generateFollowUpQuestions(userInput: string): string[] {
  const lowered = userInput.toLowerCase();
  
  if (lowered.includes('versus')) {
    return [
      "What if I split my investment 50/50 between lump sum and monthly?",
      "What if I delay my lump sum investment by 6 months?",
      "What if markets crash right after my lump sum investment?"
    ];
  } else if (lowered.includes('stop investing')) {
    return [
      "What if I resume investing after 5 years?",
      "What happens if I withdraw everything at retirement?",
      "What if I switch to safer assets after stopping?"
    ];
  } else {
    return [
      "What if I increase my monthly contributions?",
      "What if returns average only 3 percent instead of 7 percent?",
      "What if inflation outpaces my investment returns?"
    ];
  }
}

// ============================================================================
// CHART COMPONENT
// ============================================================================

function InvestmentChart({ 
  data, 
  title 
}: { 
  data: { month: number; value: number }[]; 
  title: string;
}) {
  const milestones = data.filter((_, idx) => (idx + 1) % 12 === 0);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              label={{ value: 'Portfolio Value ($)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#4F8EF7"
              strokeWidth={3}
              dot={false}
            />
            <Scatter 
              data={milestones}
              dataKey="value"
              fill={COLORS.warning}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const cleanedInput = cleanUserInput(textToSend);
    
    const newMessages = [...messages, { role: 'user' as const, content: cleanedInput }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage = sanitizeResponse(data.message);
      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      setFollowUpQuestions(generateFollowUpQuestions(cleanedInput));
      
      // Check if should show simulation
      const params = extractSimulationParams(cleanedInput);
      if (params.amount && params.years) {
        const growthData = params.hasCrash 
          ? simulateMarketCrash(params.amount, params.years)
          : simulateInvestmentGrowth(params.amount, params.years);
        
        const chartData = growthData.map((value, index) => ({
          month: index + 1,
          value: value
        }));
        
        const totalInvested = params.amount * params.years * 12;
        const finalValue = growthData[growthData.length - 1];
        const totalGain = finalValue - totalInvested;
        const gainPercent = (totalGain / totalInvested) * 100;
        
        setSimulation({
          data: chartData,
          summary: { totalInvested, finalValue, totalGain, gainPercent }
        });
      } else {
        setSimulation(null);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages, 
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpClick = (question: string) => {
    setFollowUpQuestions([]);
    handleSendMessage(question);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4" style={{ borderColor: COLORS.cardBorder }}>
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">💬 What-If Investment Simulator</h1>
          <p className="text-slate-500 text-sm mt-1">Ask Benny about investment scenarios</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Chat Container */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Chat Header Banner - Matches your AskBennyCard */}
          <div className="px-8 py-4 flex items-center justify-center" style={{ backgroundColor: COLORS.primaryBg }}>
            <h2 className="text-lg font-bold" style={{ color: COLORS.primary }}>
              Have a question? Ask Benny!
            </h2>
          </div>

          {/* Messages Area */}
          <div className="px-8 py-8 space-y-6 min-h-[500px] max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-7xl mb-4">🤖</div>
                <p className="text-slate-600 font-medium mb-2 text-lg">Hi! I'm Benny</p>
                <p className="text-sm text-slate-500 mb-8">
                  Ask me investment "what if" questions!
                </p>
                <div className="text-left max-w-md mx-auto space-y-3 bg-slate-50 p-6 rounded-2xl">
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Try asking:</p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• "What if I invest $200/month for 10 years?"</p>
                    <p>• "What if markets crash in year 2?"</p>
                    <p>• "What if I stop investing after 5 years?"</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: COLORS.avatarBg }}>
                        {/* Robot icon from your AskBennyCard */}
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue-600">
                          <path d="M10 2C8.9 2 8 2.9 8 4V6C8 7.1 8.9 8 10 8S12 7.1 12 6V4C12 2.9 11.1 2 10 2ZM16 8C17.1 8 18 8.9 18 10S17.1 12 16 12H14C12.9 12 12 11.1 12 10S12.9 8 14 8H16ZM6 10C6 8.9 5.1 8 4 8H2C0.9 8 0 8.9 0 10S0.9 12 2 12H4C5.1 12 6 11.1 6 10ZM10 14C11.1 14 12 14.9 12 16V18C12 19.1 11.1 20 10 20S8 19.1 8 18V16C8 14.9 8.9 14 10 14Z" fill="currentColor"/>
                        </svg>
                      </div>
                    )}
                    <div 
                      className={`max-w-[75%] px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-gray-100 text-gray-900 rounded-l-2xl rounded-tr-2xl' 
                          : 'bg-blue-50 text-gray-900 rounded-r-2xl rounded-tl-2xl'
                      }`}
                    >
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: COLORS.avatarBg }}>
                      <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: COLORS.primary }} />
                    </div>
                    <div className="bg-blue-50 px-4 py-3 rounded-r-2xl rounded-tl-2xl">
                      <p className="text-sm font-medium text-slate-500">Thinking...</p>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-8 pb-8">
            <div className="flex gap-4 items-end">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="What if I..."
                className="flex-1 px-5 py-3.5 rounded-full ring-1 focus:ring-2 outline-none text-base"
                style={{ borderColor: COLORS.cardBorder }}
                disabled={loading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                className="px-8 py-3.5 rounded-full text-white font-semibold disabled:opacity-50 transition-all hover:shadow-lg"
                style={{ backgroundColor: COLORS.primary }}
              >
                Ask Benny
              </button>
            </div>
          </div>
        </div>

        {/* Follow-up Questions */}
        {followUpQuestions.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">🤔 Suggested follow-up questions:</h3>
            <div className="space-y-3">
              {followUpQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFollowUpClick(question)}
                  className="w-full text-left px-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm border"
                  style={{ borderColor: COLORS.cardBorder }}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Simulation Chart */}
        {simulation && (
          <div className="mt-6 bg-white rounded-2xl p-8 shadow-sm space-y-6">
            <InvestmentChart 
              data={simulation.data}
              title="📊 Projection Chart"
            />
            
            {/* Summary Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">💡 Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">Total Invested</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${simulation.summary.totalInvested.toLocaleString()}
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">Final Portfolio Value</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${Math.round(simulation.summary.finalValue).toLocaleString()}
                  </p>
                </div>
                <div className={`p-5 rounded-xl ${simulation.summary.totalGain >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <p className="text-xs text-slate-500 mb-2">Total Gain</p>
                  <p className={`text-2xl font-bold ${simulation.summary.totalGain >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    ${Math.round(simulation.summary.totalGain).toLocaleString()} ({simulation.summary.gainPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> This is a simplified simulation using 7% annual returns. 
                Real investment returns vary and are not guaranteed. For educational purposes only.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}