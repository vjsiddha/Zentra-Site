from __future__ import annotations
from typing import Dict, List
from datetime import datetime
import pandas as pd
from .schemas import Portfolio, MarkToMarket, MarkToMarketItem, AllocationItem, Txn

def mark_to_market(p: Portfolio, price_map: Dict[str, float]) -> MarkToMarket:
    items: List[MarkToMarketItem] = []
    total_mv = 0.0
    total_unrl = 0.0
    for sym, pos in p.positions.items():
        px = float(price_map.get(sym, 0.0))
        mv = pos.qty * px
        unrl = (px - pos.avg_cost) * pos.qty
        total_mv += mv
        total_unrl += unrl
        items.append(MarkToMarketItem(symbol=sym, qty=pos.qty, price=px, market_value=mv, unrealized_pl=unrl))
    equity = p.cash + total_mv
    return MarkToMarket(items=items, total_value=total_mv, total_unrealized_pl=total_unrl, equity=equity)

def allocation(p: Portfolio, price_map: Dict[str, float]) -> List[AllocationItem]:
    m2m = mark_to_market(p, price_map)
    total_mv = m2m.total_value or 1e-12
    weights: List[AllocationItem] = []
    for it in m2m.items:
        w = it.market_value / total_mv if total_mv > 0 else 0.0
        weights.append(AllocationItem(symbol=it.symbol, weight=w, market_value=it.market_value))
    return weights

def equity_curve(
    history: List[Txn],
    closes: Dict[str, pd.Series],
    avg_costs_map: Dict[str, float] = {},  # live/shocked prices as fallback for recent dates
) -> pd.Series:
    """
    Daily equity from cash + positions valued at daily close.
    - 'history' is chronological or not; we sort by ts.
    - 'closes' maps symbol -> pd.Series(date->close).
    - 'avg_costs_map' provides live prices as fallback when historical closes are unavailable.
    - Returns equity curve from first transaction to TODAY.

    Fallback chain for each symbol on each day:
      1) Historical close from Finnhub (if available and > 0)
      2) Live/shocked price from avg_costs_map (passed in from endpoint)
      3) avg_cost from transaction history (last resort)
    """
    if not history:
        return pd.Series(dtype=float)

    # Build a daily index covering the span from first transaction to TODAY
    ts_sorted = sorted(history, key=lambda x: x.ts)
    start = pd.Timestamp(ts_sorted[0].ts).normalize()
    end   = pd.Timestamp.now().normalize()
    days  = pd.date_range(start, end, freq="D")

    cash = 0.0
    positions: Dict[str, float] = {}
    avg_costs:  Dict[str, float] = {}

    # Group txns by day
    by_day: Dict[pd.Timestamp, List[Txn]] = {}
    for t in ts_sorted:
        d = pd.Timestamp(t.ts).normalize()
        by_day.setdefault(d, []).append(t)

    eq_values = []
    for d in days:
        # Replay all transactions that occurred on this day
        for t in by_day.get(d, []):
            if t.type == "RESET":
                cash = t.cash
                positions.clear()
                avg_costs.clear()
            elif t.type in ("DEPOSIT", "WITHDRAW"):
                cash = t.cash
            elif t.type == "BUY":
                prev_qty  = positions.get(t.ticker, 0.0)
                new_qty   = prev_qty + t.qty
                prev_cost = avg_costs.get(t.ticker, 0.0)
                avg_costs[t.ticker] = (
                    (prev_cost * prev_qty) + (t.price * t.qty)
                ) / max(new_qty, 1e-12)
                positions[t.ticker] = new_qty
                cash = t.cash
            elif t.type == "SELL":
                positions[t.ticker] = positions.get(t.ticker, 0.0) - t.qty
                if positions[t.ticker] <= 1e-9:
                    positions.pop(t.ticker, None)
                    avg_costs.pop(t.ticker, None)
                cash = t.cash

        # Value all open positions at the best available price for this day
        mv = 0.0
        for sym, qty in positions.items():
            px = None

            # 1) Try historical close series from Finnhub
            ser = closes.get(sym)
            if ser is not None and not ser.empty:
                try:
                    candidate = float(ser.asof(d))
                    if not pd.isna(candidate) and candidate > 0:
                        px = candidate
                except Exception:
                    pass

            # 2) Fall back to live/shocked price passed in from the endpoint
            if px is None or px == 0.0:
                live = avg_costs_map.get(sym)
                if live and live > 0:
                    px = live

            # 3) Last resort: use avg_cost tracked from transaction replay
            if px is None or px == 0.0:
                px = avg_costs.get(sym, 0.0)

            mv += qty * px

        eq_values.append(cash + mv)

    return pd.Series(eq_values, index=days)


# Indicators (pure)
def sma(series: pd.Series, window: int) -> pd.Series:
    return series.rolling(window=window, min_periods=1).mean()

def ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False, min_periods=1).mean()


# Risk helpers
def position_size_by_risk(entry: float, stop: float, account_equity: float, risk_pct: float) -> float:
    risk_amt = account_equity * (risk_pct / 100.0)
    per_share_risk = max(entry - stop, 0.0)
    if per_share_risk <= 0:
        return 0.0
    return risk_amt / per_share_risk

def expected_pl(entry: float, target: float, stop: float, shares: float) -> dict:
    gain = (target - entry) * shares
    loss = (entry - stop) * shares
    return {"gain": gain, "loss": loss}