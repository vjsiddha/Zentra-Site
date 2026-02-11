from __future__ import annotations
from datetime import datetime
from typing import Optional
from .schemas import Portfolio, TradeResult, Position, Txn
from .errors import InsufficientCash, InsufficientQuantity, MarketDataError
from .market import get_quote

def _ensure_position(p: Portfolio, symbol: str) -> Position:
    if symbol not in p.positions:
        p.positions[symbol] = Position(qty=0.0, avg_cost=0.0)
    return p.positions[symbol]

def buy(p: Portfolio, symbol: str, qty: float, price: Optional[float] = None) -> TradeResult:
    sym = symbol.upper().strip()
    if price is None:
        q = get_quote(sym)
        price = q.last
        if price is None or price <= 0:
            raise MarketDataError(f"No tradable price for {sym}")
    cost = float(qty) * float(price)
    if p.cash < cost - 1e-9:
        raise InsufficientCash(f"Insufficient cash: need {cost:.2f}, have {p.cash:.2f}")
    pos = _ensure_position(p, sym)
    new_qty = pos.qty + qty
    new_avg = ((pos.avg_cost * pos.qty) + cost) / new_qty if new_qty > 0 else 0.0
    pos.qty = new_qty
    pos.avg_cost = new_avg
    p.cash -= cost
    ts = datetime.utcnow()
    p.history.append(Txn(ts=ts, type="BUY", ticker=sym, qty=qty, price=price, cash=p.cash))
    return TradeResult(ts=ts, symbol=sym, qty=qty, price=price, cash_after=p.cash, realized_pl=0.0, position=pos)

def sell(p: Portfolio, symbol: str, qty: float, price: Optional[float] = None) -> TradeResult:
    sym = symbol.upper().strip()
    if price is None:
        q = get_quote(sym)
        price = q.last
        if price is None or price <= 0:
            raise MarketDataError(f"No tradable price for {sym}")
    pos = _ensure_position(p, sym)
    if pos.qty + 1e-9 < qty:
        raise InsufficientQuantity(f"Insufficient qty: want {qty:.4f}, have {pos.qty:.4f}")
    realized = (float(price) - pos.avg_cost) * float(qty)
    pos.qty -= qty
    p.cash += float(qty) * float(price)
    if pos.qty == 0:
        # reset avg cost when flat
        pos.avg_cost = 0.0
        # optional: clean up zero positions
        del p.positions[sym]
    ts = datetime.utcnow()
    p.history.append(Txn(ts=ts, type="SELL", ticker=sym, qty=qty, price=price, cash=p.cash))
    return TradeResult(ts=ts, symbol=sym, qty=qty, price=price, cash_after=p.cash, realized_pl=realized,
                       position=p.positions.get(sym))