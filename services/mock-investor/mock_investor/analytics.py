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

def equity_curve(history: List[Txn], closes: Dict[str, pd.Series]) -> pd.Series:
    """
    Daily equity from cash + positions valued at daily close.
    - 'history' is chronological or not; we sort by ts.
    - 'closes' maps symbol -> pd.Series(date->close).
    - FIXED: Returns equity curve from first transaction to TODAY (not last transaction).
    """
    if not history:
        return pd.Series(dtype=float)

    # Build a daily index covering the span from first transaction to TODAY
    ts_sorted = sorted(history, key=lambda x: x.ts)
    start = pd.Timestamp(ts_sorted[0].ts).normalize()
    end = pd.Timestamp.now().normalize()  # ← FIXED: Go to today, not last transaction
    days = pd.date_range(start, end, freq="D")

    # Replay ledger day by day
    cash = 0.0
    positions: Dict[str, float] = {}
    avg_costs: Dict[str, float] = {}  # for completeness; not strictly required

    # Group txns by day
    by_day: Dict[pd.Timestamp, List[Txn]] = {}
    for t in ts_sorted:
        d = pd.Timestamp(t.ts).normalize()
        by_day.setdefault(d, []).append(t)

    eq_values = []
    for d in days:
        for t in by_day.get(d, []):
            if t.type == "RESET":
                cash = t.cash
                positions.clear()
                avg_costs.clear()
            elif t.type == "DEPOSIT":
                cash = t.cash
            elif t.type == "WITHDRAW":
                cash = t.cash
            elif t.type == "BUY":
                positions[t.ticker] = positions.get(t.ticker, 0.0) + t.qty
                avg_costs[t.ticker] = ((avg_costs.get(t.ticker, 0.0) * (positions[t.ticker]-t.qty)) + t.qty*t.price) / max(positions[t.ticker], 1e-12)
                cash = t.cash
            elif t.type == "SELL":
                positions[t.ticker] = positions.get(t.ticker, 0.0) - t.qty
                if positions[t.ticker] <= 0:
                    positions.pop(t.ticker, None)
                    avg_costs.pop(t.ticker, None)
                cash = t.cash

        # value positions at day close if available
        mv = 0.0
        for sym, q in positions.items():
            ser = closes.get(sym)
            if ser is not None and not ser.empty:
                # get last available close up to day d
                try:
                    px = float(ser.asof(d))  # forward-fill behavior on index <= d
                except Exception:
                    # fallback: exact match or 0
                    px = float(ser.get(d, 0.0))
            else:
                px = 0.0
            mv += q * px
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