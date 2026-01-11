// app/lesson/lesson2/lesson2.2/page.tsx
"use client";

import React, { useState } from 'react';
import ButtonGroup from "@/components/ButtonGroup";

type AnswerType = 'emergency' | 'investment' | 'both' | null;

export default function Lesson2_2Page() {
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerType>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const correctAnswer: AnswerType = 'emergency';

  const handleAnswer = (answer: 'emergency' | 'investment' | 'both'): void => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const isCorrect: boolean = selectedAnswer === correctAnswer;

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[960px] mx-auto">
        {/* Module Badge */}
        <div className="mb-6">
          <span className="text-sm font-semibold text-[#4F7D96] font-manrope uppercase tracking-wider">
            Module 2 - Lesson 2
          </span>
        </div>
        
        {/* Title */}
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0D171C] font-manrope leading-tight mb-4">
          Emergency Fund or Investment?
        </h1>
        
        {/* Subtitle */}
        <p className="text-base text-[#4F7D96] font-manrope leading-6 mb-8">
          Read the scenario and decide what Sarah should prioritize first.
        </p>

        {/* Scenario Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D4E1E8] p-6 md:p-8 mb-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces" 
              alt="Sarah"
              className="w-20 h-20 rounded-full object-cover border-4 border-[#E8F0F5]"
            />
            <h2 className="text-xl md:text-2xl font-bold text-[#0D171C] font-manrope">
              Sarah - 22 Years old
            </h2>
          </div>

          {/* Scenario Description */}
          <div className="mb-6">
            <p className="text-base text-[#0D171C] font-manrope leading-6">
              Sarah just started her first full-time job and is earning $3,500 per month after taxes. 
              She has $2,000 saved up and is excited to start building her financial future. She's 
              heard about investing in the stock market and wants to start growing her money, but she 
              also knows that unexpected expenses can happen.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <div className="text-sm font-semibold text-[#4F7D96] font-manrope uppercase tracking-wide mb-1">
                Current Situation:
              </div>
              <p className="text-base text-[#0D171C] font-manrope leading-6">
                No emergency fund, lives paycheck to paycheck, has basic health insurance through work.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-[#4F7D96] font-manrope uppercase tracking-wide mb-1">
                Monthly Expenses:
              </div>
              <p className="text-base text-[#0D171C] font-manrope leading-6">
                $2,800 (rent, food, utilities, transportation, phone)
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-[#4F7D96] font-manrope uppercase tracking-wide mb-1">
                Question:
              </div>
              <p className="text-base text-[#0D171C] font-manrope leading-6">
                What should Sarah do with her $2,000 and the $700 she can save each month?
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className={`
                px-6 py-4 rounded-xl font-manrope font-semibold text-base
                transition-all duration-300 border-2
                ${selectedAnswer === 'emergency' 
                  ? 'bg-[#1B6BA6] text-white border-[#1B6BA6] shadow-lg' 
                  : 'bg-[#E8F0F5] text-[#0D171C] border-[#D4E1E8] hover:border-[#1B6BA6] hover:bg-[#E3F2FF]'
                }
                ${showFeedback ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-md'}
              `}
              onClick={() => !showFeedback && handleAnswer('emergency')}
              disabled={showFeedback}
            >
              Build Emergency Fund
            </button>
            <button
              className={`
                px-6 py-4 rounded-xl font-manrope font-semibold text-base
                transition-all duration-300 border-2
                ${selectedAnswer === 'investment' 
                  ? 'bg-[#1B6BA6] text-white border-[#1B6BA6] shadow-lg' 
                  : 'bg-[#E8F0F5] text-[#0D171C] border-[#D4E1E8] hover:border-[#1B6BA6] hover:bg-[#E3F2FF]'
                }
                ${showFeedback ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-md'}
              `}
              onClick={() => !showFeedback && handleAnswer('investment')}
              disabled={showFeedback}
            >
              Start Investing
            </button>
            <button
              className={`
                px-6 py-4 rounded-xl font-manrope font-semibold text-base
                transition-all duration-300 border-2
                ${selectedAnswer === 'both' 
                  ? 'bg-[#1B6BA6] text-white border-[#1B6BA6] shadow-lg' 
                  : 'bg-[#E8F0F5] text-[#0D171C] border-[#D4E1E8] hover:border-[#1B6BA6] hover:bg-[#E3F2FF]'
                }
                ${showFeedback ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-md'}
              `}
              onClick={() => !showFeedback && handleAnswer('both')}
              disabled={showFeedback}
            >
              Split 50/50
            </button>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`
              mt-6 p-6 rounded-xl border-l-4
              ${isCorrect 
                ? 'bg-[#E8F5E9] border-[#4CAF50]' 
                : 'bg-[#FFEBEE] border-[#F44336]'
              }
            `}>
              <div className={`
                text-xl font-bold font-manrope mb-3
                ${isCorrect ? 'text-[#2E7D32]' : 'text-[#C62828]'}
              `}>
                {isCorrect ? '✓ Correct!' : '✗ Not Quite'}
              </div>
              <div className="text-base text-[#0D171C] font-manrope leading-6 mb-4">
                {isCorrect ? (
                  <>
                    <strong>Building an emergency fund first</strong> is the right choice for Sarah. 
                    Financial experts recommend having 3-6 months of expenses saved before investing. 
                    With $2,800 in monthly expenses, Sarah needs about $8,400-$16,800 in emergency 
                    savings. Without this safety net, an unexpected car repair or medical bill could 
                    force her to go into debt or sell investments at a loss. She should focus on 
                    building her emergency fund first, then start investing once she has that 
                    financial cushion.
                  </>
                ) : (
                  <>
                    While {selectedAnswer === 'investment' ? 'investing' : 'splitting funds'} seems 
                    appealing, <strong>building an emergency fund should come first</strong>. Sarah 
                    has no safety net, and unexpected expenses happen to everyone. Financial experts 
                    recommend having 3-6 months of expenses saved (about $8,400-$16,800 for Sarah) 
                    before investing. Without emergency savings, she might have to sell investments 
                    at a loss or go into debt during an emergency. Once she has her emergency fund, 
                    she can confidently start investing.
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {showFeedback && (
          <ButtonGroup
            primaryHref="/lesson/lesson2/lesson2.3"
            primaryLabel="Next Scenario"
            secondaryHref="/lesson/lesson2"
            secondaryLabel="Back to Module 2"
          />
        )}
      </div>
    </div>
  );
}