'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LandingPageContent() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const totalSlides = 3;

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  const handleGetStarted = () => {
    router.push('/signin');
  };

  const handleLogin = () => {
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B5E8E] rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-[#0B5E8E]">ZENTRA</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogin}
              className="px-5 py-2 text-[#4F7D96] font-semibold hover:text-[#0B5E8E] transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-[#0B5E8E] text-white font-semibold rounded-lg hover:bg-[#094a6d] transition-colors"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Finance Through Practice,<br/>
            <span className="text-[#0B5E8E]">Not Just Theory</span>
          </h1>
          <p className="text-xl text-[#4F7D96] max-w-3xl mx-auto mb-10">
            Master investing, budgeting, and financial strategy through interactive lessons, real market simulations, and AI-powered guidance. Start building wealth with confidence.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-[#0B5E8E] text-white font-bold rounded-lg hover:bg-[#094a6d] transition-colors text-lg"
            >
              Start Learning Free
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl font-bold text-[#0B5E8E] mb-1">10+</div>
            <div className="text-sm text-[#4F7D96] font-medium">Interactive Modules</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl font-bold text-[#0B5E8E] mb-1">$100K</div>
            <div className="text-sm text-[#4F7D96] font-medium">Practice Portfolio</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl font-bold text-[#0B5E8E] mb-1">24/7</div>
            <div className="text-sm text-[#4F7D96] font-medium">AI Tutor Available</div>
          </div>
        </div>
      </section>

      {/* Main Features Carousel */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Master Finance</h2>
          <p className="text-lg text-[#4F7D96]">Three powerful tools working together for your success</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg">
            <div className="relative min-h-[550px]">
              {/* Slide 1: Interactive Modules */}
              <div className={`absolute inset-0 p-12 transition-all duration-500 ${
                currentSlide === 0 ? 'opacity-100 translate-x-0' : currentSlide < 0 ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
              }`}>
                <div className="grid md:grid-cols-2 gap-12 h-full items-center">
                  <div>
                    <div className="inline-block px-4 py-1.5 bg-blue-50 text-[#0B5E8E] text-sm font-bold rounded-full mb-4">
                      📚 FEATURE 1
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      Structured Learning Modules
                    </h3>
                    <p className="text-lg text-[#4F7D96] mb-6 leading-relaxed">
                      Progress through 10+ carefully designed modules covering everything from budgeting basics to advanced investing strategies. Each module follows a proven 3-step learning path.
                    </p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📖</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Definitions & Concepts</div>
                          <div className="text-sm text-[#4F7D96]">Learn key financial terms through interactive study cards and quizzes</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🎮</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Interactive Simulations</div>
                          <div className="text-sm text-[#4F7D96]">Practice with real-world scenarios and decision-making games</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">✅</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Apply Your Knowledge</div>
                          <div className="text-sm text-[#4F7D96]">Use calculators and tools to make informed financial decisions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-full flex items-center justify-center">
                    <div className="w-full bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                      <div className="space-y-4">
                        {/* Module Card Example */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">📊</span>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-blue-600 mb-1">MODULE 1</div>
                              <div className="font-bold text-gray-900">Budgeting Basics</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                              <div className="text-xs font-semibold text-blue-700 mb-1">DEFINITIONS</div>
                              <div className="text-xs text-[#4F7D96]">Learn</div>
                            </div>
                            <div className="flex-1 bg-orange-50 rounded-lg p-3 text-center">
                              <div className="text-xs font-semibold text-orange-700 mb-1">INTERACTIVE</div>
                              <div className="text-xs text-[#4F7D96]">Practice</div>
                            </div>
                            <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                              <div className="text-xs font-semibold text-green-700 mb-1">APPLYING</div>
                              <div className="text-xs text-[#4F7D96]">Master</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Indicator */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-gray-900">Your Progress</div>
                            <div className="text-sm text-[#4F7D96]">6 of 12 Complete</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-[#0B5E8E] to-blue-500 h-2 rounded-full" style={{width: '50%'}}></div>
                          </div>
                        </div>

                        {/* Topics Preview */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="text-sm font-semibold text-gray-900 mb-3">What You&apos;ll Learn</div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-[#4F7D96]">
                              <div className="w-1.5 h-1.5 bg-[#0B5E8E] rounded-full"></div>
                              Compound Interest & Time Value
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#4F7D96]">
                              <div className="w-1.5 h-1.5 bg-[#0B5E8E] rounded-full"></div>
                              Market Timing Psychology
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#4F7D96]">
                              <div className="w-1.5 h-1.5 bg-[#0B5E8E] rounded-full"></div>
                              Passive vs Active Investing
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Stock Simulator */}
              <div className={`absolute inset-0 p-12 transition-all duration-500 ${
                currentSlide === 1 ? 'opacity-100 translate-x-0' : currentSlide < 1 ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
              }`}>
                <div className="grid md:grid-cols-2 gap-12 h-full items-center">
                  <div>
                    <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full mb-4">
                      📈 FEATURE 2
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      Real Market Stock Simulator
                    </h3>
                    <p className="text-lg text-[#4F7D96] mb-6 leading-relaxed">
                      Practice stock trading with $100,000 in virtual cash using real market data. Build your portfolio, track performance, and learn investing strategies without any financial risk.
                    </p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📊</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Real-Time Market Data</div>
                          <div className="text-sm text-[#4F7D96]">Trade with live prices updating every 2 minutes</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">💼</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Portfolio Tracking</div>
                          <div className="text-sm text-[#4F7D96]">Monitor your holdings, performance, and transaction history</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🎯</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Sector Diversification</div>
                          <div className="text-sm text-[#4F7D96]">Browse stocks by Tech, Banking, Energy, and more</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-full flex items-center justify-center">
                    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                      {/* Simulator Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-gray-900">Stock Simulator</div>
                          <div className="text-xs text-[#4F7D96]">Live Tracking Every 2 Min 📊</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-[#4F7D96] mb-1">Cash</div>
                            <div className="text-xl font-bold text-gray-900">$94,146.15</div>
                          </div>
                          <div>
                            <div className="text-xs text-[#4F7D96] mb-1">Total Equity</div>
                            <div className="text-xl font-bold text-gray-900">$99,893.95</div>
                          </div>
                          <div className="text-red-600 font-semibold">-0.11%</div>
                        </div>
                      </div>

                      {/* Holdings */}
                      <div className="p-6">
                        <div className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span>💼</span>
                          Your Holdings
                        </div>
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-900">AAPL</div>
                                <div className="text-xs text-[#4F7D96]">5 shares</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">$1,301.25</div>
                                <div className="text-xs text-emerald-600">+2.3%</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-900">NVDA</div>
                                <div className="text-xs text-[#4F7D96]">20 shares</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">$3,716.20</div>
                                <div className="text-xs text-emerald-600">+5.1%</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-900">BTC</div>
                                <div className="text-xs text-[#4F7D96]">20 shares</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">$836.40</div>
                                <div className="text-xs text-red-600">-1.2%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Educational Tip */}
                      <div className="bg-amber-50 px-6 py-3 border-t border-amber-100">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🏆</span>
                          <div className="text-xs text-amber-800 leading-relaxed">
                            Long-term investing beats short-term trading.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3: AI Chat Assistant */}
              <div className={`absolute inset-0 p-12 transition-all duration-500 ${
                currentSlide === 2 ? 'opacity-100 translate-x-0' : currentSlide < 2 ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
              }`}>
                <div className="grid md:grid-cols-2 gap-12 h-full items-center">
                  <div>
                    <div className="inline-block px-4 py-1.5 bg-purple-50 text-purple-700 text-sm font-bold rounded-full mb-4">
                      🤖 FEATURE 3
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      AI Financial Tutor
                    </h3>
                    <p className="text-lg text-[#4F7D96] mb-6 leading-relaxed">
                      Get instant answers to your financial questions 24/7. Our AI tutor explains complex concepts in simple terms, helps with calculations, and guides you through your learning journey.
                    </p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">💬</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Instant Answers</div>
                          <div className="text-sm text-[#4F7D96]">Ask anything about investing, budgeting, or personal finance</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🧮</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Financial Calculations</div>
                          <div className="text-sm text-[#4F7D96]">Get help with compound interest, retirement planning, and more</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🎓</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Personalized Guidance</div>
                          <div className="text-sm text-[#4F7D96]">Get explanations tailored to your learning level</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-full flex items-center justify-center">
                    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                      {/* Chat Header */}
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            AI
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">Financial Tutor</div>
                            <div className="text-xs text-purple-700">Always here to help</div>
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="p-6 space-y-4 bg-gray-50 h-80 overflow-y-auto">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-[#0B5E8E] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                            <div className="text-sm">What&apos;s the difference between passive and active investing?</div>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                            <div className="text-sm text-gray-900 leading-relaxed mb-2">
                              Great question! Here&apos;s the key difference:
                            </div>
                            <div className="text-sm text-gray-700 space-y-2">
                              <div className="bg-blue-50 rounded-lg p-3">
                                <div className="font-semibold text-[#0B5E8E] mb-1">Passive Investing</div>
                                <div className="text-xs text-[#4F7D96]">Buy and hold index funds that track the market. Lower fees, less time needed.</div>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-3">
                                <div className="font-semibold text-orange-700 mb-1">Active Investing</div>
                                <div className="text-xs text-[#4F7D96]">Pick individual stocks to beat the market. Higher fees, requires research.</div>
                              </div>
                            </div>
                            <div className="text-xs text-[#4F7D96] mt-2">
                              Want to learn more? Check out Module 8! 📚
                            </div>
                          </div>
                        </div>

                        {/* User Follow-up */}
                        <div className="flex justify-end">
                          <div className="bg-[#0B5E8E] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                            <div className="text-sm">Which is better for beginners?</div>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                            <div className="text-sm text-gray-900 leading-relaxed">
                              For beginners, passive investing is usually better because it&apos;s simpler, has lower fees, and historically performs well. Start with index funds! 🎯
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chat Input */}
                      <div className="bg-white px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            placeholder="Ask me anything about finance..." 
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled
                          />
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4">
              <button 
                onClick={prevSlide}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4">
              <button 
                onClick={nextSlide}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 h-2 bg-[#0B5E8E]'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It All Works Together */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-gradient-to-br from-[#0B5E8E] to-[#4F7D96] rounded-2xl p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Complete Learning Journey</h2>
            <p className="text-lg text-white/90">Three powerful features working together</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <div className="font-bold text-lg mb-2">Learn the Concepts</div>
              <div className="text-sm text-white/80">Start with interactive modules covering budgeting, investing, and wealth building</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <div className="font-bold text-lg mb-2">Practice in the Simulator</div>
              <div className="text-sm text-white/80">Apply your knowledge by trading stocks with real market data and zero risk</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <div className="font-bold text-lg mb-2">Get AI Guidance</div>
              <div className="text-sm text-white/80">Ask questions anytime to deepen your understanding and stay on track</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Level Up as You Learn
            </h2>
            <p className="text-lg text-[#4F7D96] mb-6">
              Track your progress, unlock achievements, and collect avatars as you complete modules. Your financial education becomes an engaging journey, not a chore.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div className="font-semibold text-gray-900">Unlock achievements and collect avatars</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div className="font-semibold text-gray-900">Track progress across all modules</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="font-semibold text-gray-900">Set goals and build vocabulary</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#0B5E8E] to-blue-600 rounded-2xl p-10 text-white">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4 backdrop-blur">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🟠</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">Level 9</div>
              <div className="text-white/90">Complete Two More Modules</div>
              <div className="text-sm text-white/80 mt-1">And Unlock Equity Elephant</div>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full"></div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full"></div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"></div>
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <span>Modules Completed</span>
                <span className="font-bold">6 / 12</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div className="bg-white h-2 rounded-full" style={{width: '50%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Financial Journey Today
          </h2>
          <p className="text-lg text-[#4F7D96] mb-8 max-w-2xl mx-auto">
            Join thousands of learners building wealth through interactive education. No credit card required.
          </p>
          <button 
            onClick={handleGetStarted}
            className="px-12 py-5 bg-[#0B5E8E] text-white font-bold rounded-lg hover:bg-[#094a6d] transition-colors text-lg shadow-lg hover:shadow-xl"
          >
            Create Your Free Account
          </button>
          <div className="text-sm text-[#4F7D96] mt-4">
            Get instant access to all modules, simulator, and AI tutor
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0B5E8E] rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="2" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-gray-900">ZENTRA</span>
            </div>
            <div className="text-sm text-[#4F7D96]">
              © 2026 Zentra. Making financial education accessible.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}