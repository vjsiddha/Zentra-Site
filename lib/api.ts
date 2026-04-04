import { getAuthToken } from "./auth";

const MOCK_API = (process.env.NEXT_PUBLIC_MOCK_INVESTOR_API || "").replace(/\/+$/, "");

async function authedFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const res = await fetch(`${MOCK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data.data as T;
}

export const mockInvestorApi = {
  getPortfolio: () => authedFetch<any>("/portfolio"),

  resetPortfolio: (starting_cash: number) =>
    authedFetch<any>("/portfolio/reset", {
      method: "POST",
      body: JSON.stringify({ starting_cash }),
    }),

  buy: (symbol: string, qty: number, price?: number) =>
    authedFetch<any>("/orders/buy", {
      method: "POST",
      body: JSON.stringify({ symbol, qty, price }),
    }),

  sell: (symbol: string, qty: number, price?: number) =>
    authedFetch<any>("/orders/sell", {
      method: "POST",
      body: JSON.stringify({ symbol, qty, price }),
    }),

  getMarkToMarket: () => authedFetch<any>("/metrics/mark-to-market"),

  getAllocation: () => authedFetch<any>("/metrics/allocation"),

  getEquityCurve: (period: string = "1y", interval: string = "1d") =>
    authedFetch<any[]>(
      `/metrics/equity-curve?period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`
    ),

  getShockedQuote: (symbol: string) =>
    authedFetch<any>(`/metrics/quote/${encodeURIComponent(symbol)}`),

  getMarketStatus: () => authedFetch<any>("/market/status"),
};