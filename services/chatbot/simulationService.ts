// services/chatbot/simulationService.ts

export interface SimulationResult {
  data: { month: number; value: number }[];
  summary: {
    totalInvested: number;
    finalValue: number;
    totalGain: number;
    gainPercent: number;
  };
}

export function simulateInvestmentGrowth(
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

export function simulateMarketCrash(
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

export function extractSimulationParams(input: string): { 
  amount?: number; 
  years?: number; 
  hasCrash: boolean;
} {
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

export function calculateSimulation(
  amount: number,
  years: number,
  hasCrash: boolean
): SimulationResult {
  const growthData = hasCrash 
    ? simulateMarketCrash(amount, years)
    : simulateInvestmentGrowth(amount, years);
  
  const chartData = growthData.map((value, index) => ({
    month: index + 1,
    value: value
  }));
  
  const totalInvested = amount * years * 12;
  const finalValue = growthData[growthData.length - 1];
  const totalGain = finalValue - totalInvested;
  const gainPercent = (totalGain / totalInvested) * 100;
  
  return {
    data: chartData,
    summary: {
      totalInvested,
      finalValue,
      totalGain,
      gainPercent
    }
  };
}

export default {
  simulateInvestmentGrowth,
  simulateMarketCrash,
  extractSimulationParams,
  calculateSimulation
};