from __future__ import annotations
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI(title="Mock Investment Simulator API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .schemas import (
    Portfolio, Quote, Bar, NewsItem, TradeResult, AllocationItem, MarkToMarket,
    ResetBody, OrderBody, PositionSizeBody, ExpectedPLBody
)
from .storage import (
    load_user_portfolio, save_user_portfolio, reset_user_portfolio
)
from .symbols import search_symbols
from .market import get_quote, get_history, get_company_news
from .trading import buy as do_buy, sell as do_sell
from .analytics import mark_to_market, allocation, equity_curve, position_size_by_risk, expected_pl
from .errors import DomainError
from .users import (
    init_db, get_or_create_user, list_users,
    get_watchlist, add_to_watchlist, remove_from_watchlist,
    get_leaderboard, get_user_stats, record_snapshot
)

# Initialise SQLite tables at startup
init_db()

DEFAULT_USERNAME = "demo"

# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------

def ok(data):
    return JSONResponse({"ok": True, "data": jsonable_encoder(data), "error": None})

def fail(msg: str, status: int = 400):
    return JSONResponse({"ok": False, "data": None, "error": msg}, status_code=status)

def _resolve_user(username: Optional[str]) -> dict:
    """Get or create a user profile by username. Falls back to DEFAULT_USERNAME."""
    name = (username or DEFAULT_USERNAME).strip()
    return get_or_create_user(name)

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@app.get("/users")
def get_users():
    """List all user profiles."""
    return ok(list_users())

@app.get("/users/{username}")
def get_user(username: str):
    """Get a user's profile (auto-creates on first access)."""
    user = get_or_create_user(username)
    stats = get_user_stats(user["id"])
    return ok({**user, **stats})

# ---------------------------------------------------------------------------
# Market data (no user context needed)
# ---------------------------------------------------------------------------

@app.get("/symbols")
def symbols(q: str = Query("", alias="q"), limit: int = 10):
    items = search_symbols(q, limit)
    return ok([it.model_dump() for it in items])

@app.get("/quote/{symbol}")
def quote(symbol: str):
    try:
        q = get_quote(symbol)
        return ok(q.model_dump())
    except DomainError as e:
        return fail(str(e), 502)

@app.get("/history/{symbol}")
def history(symbol: str, period: str = "1y", interval: str = "1d"):
    try:
        bars = get_history(symbol, period=period, interval=interval)
        return ok([b.model_dump() for b in bars])
    except DomainError as e:
        return fail(str(e), 502)

@app.get("/news/{symbol}")
def news(symbol: str, days: int = 7):
    try:
        items = get_company_news(symbol, lookback_days=days)
        return ok([n.model_dump() for n in items])
    except DomainError as e:
        return fail(str(e), 502)

# ---------------------------------------------------------------------------
# Portfolio  (?user=alice)
# ---------------------------------------------------------------------------

@app.get("/portfolio")
def get_portfolio(user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    p = load_user_portfolio(u["id"])
    return ok(p.model_dump())

@app.post("/portfolio/reset")
def post_reset(body: ResetBody, user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    p = reset_user_portfolio(u["id"], body.starting_cash)
    return ok(p.model_dump())

# ---------------------------------------------------------------------------
# Orders  (?user=alice)
# ---------------------------------------------------------------------------

@app.post("/orders/buy")
def post_buy(body: OrderBody, user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
        p = load_user_portfolio(u["id"])
        res = do_buy(p, body.symbol, body.qty, body.price)
        save_user_portfolio(u["id"], p)
        _auto_snapshot(u["id"], p)
        return ok(res.model_dump())
    except DomainError as e:
        return fail(str(e))
    except ValueError as e:
        return fail(str(e))

@app.post("/orders/sell")
def post_sell(body: OrderBody, user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
        p = load_user_portfolio(u["id"])
        res = do_sell(p, body.symbol, body.qty, body.price)
        save_user_portfolio(u["id"], p)
        _auto_snapshot(u["id"], p)
        return ok(res.model_dump())
    except DomainError as e:
        return fail(str(e))
    except ValueError as e:
        return fail(str(e))

# ---------------------------------------------------------------------------
# Metrics  (?user=alice)
# ---------------------------------------------------------------------------

@app.get("/metrics/mark-to-market")
def get_mtm(user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    p = load_user_portfolio(u["id"])
    total_market_value = 0.0
    price_map = {}
    for sym, pos in p.positions.items():
        try:
            current_price = float(get_quote(sym).last or 0.0)
            price_map[sym] = current_price
            total_market_value += pos.qty * current_price
        except DomainError:
            price_map[sym] = pos.avg_cost
            total_market_value += pos.qty * pos.avg_cost
    return ok({
        "total_equity": p.cash + total_market_value,
        "cash": p.cash,
        "market_value": total_market_value,
        "prices": price_map,
    })

@app.get("/metrics/allocation")
def get_alloc(user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    p = load_user_portfolio(u["id"])
    price_map = {}
    for sym in p.positions.keys():
        try:
            price_map[sym] = float(get_quote(sym).last or 0.0)
        except DomainError:
            price_map[sym] = 0.0
    a = allocation(p, price_map)
    return ok([it.model_dump() for it in a])

@app.get("/metrics/equity-curve")
def get_equity_curve(user: Optional[str] = Query(None, description="Username"), period: str = "1y", interval: str = "1d"):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    p = load_user_portfolio(u["id"])
    syms = sorted(set(t.ticker for t in p.history if t.ticker))
    if not syms:
        from datetime import datetime
        return ok([{"ts": datetime.now().isoformat(), "equity": p.cash}])
    closes = {}
    for sym in syms:
        try:
            bars = get_history(sym, period=period, interval=interval)
            if bars:
                closes[sym] = pd.Series([b.close for b in bars],
                                         index=[pd.Timestamp(b.ts) for b in bars])
        except DomainError:
            continue
    series = equity_curve(p.history, closes)
    return ok([{"ts": ts.isoformat(), "equity": float(val)} for ts, val in series.items()])

# ---------------------------------------------------------------------------
# User stats  (?user=alice)
# ---------------------------------------------------------------------------

@app.get("/user/stats")
def user_stats(user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    stats = get_user_stats(u["id"])
    p = load_user_portfolio(u["id"])
    total_mv = 0.0
    for sym, pos in p.positions.items():
        try:
            total_mv += pos.qty * float(get_quote(sym).last or 0.0)
        except DomainError:
            total_mv += pos.qty * pos.avg_cost
    return ok({
        **stats,
        "cash": p.cash,
        "equity": p.cash + total_mv,
        "open_positions": len(p.positions),
    })

# ---------------------------------------------------------------------------
# Watchlist  (?user=alice)
# ---------------------------------------------------------------------------

@app.get("/watchlist")
def get_user_watchlist(user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    return ok(get_watchlist(u["id"]))

class WatchlistBody(BaseModel):
    symbol: str

@app.post("/watchlist")
def add_watchlist(body: WatchlistBody, user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    add_to_watchlist(u["id"], body.symbol)
    return ok(get_watchlist(u["id"]))

@app.delete("/watchlist/{symbol}")
def remove_watchlist(symbol: str, user: Optional[str] = Query(None, description="Username")):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    remove_from_watchlist(u["id"], symbol)
    return ok(get_watchlist(u["id"]))

# ---------------------------------------------------------------------------
# Leaderboard (no user context needed)
# ---------------------------------------------------------------------------

@app.get("/leaderboard")
def leaderboard(limit: int = 20):
    """Top users ranked by most recent equity snapshot."""
    return ok(get_leaderboard(limit))

# ---------------------------------------------------------------------------
# Risk calculators (no user context needed)
# ---------------------------------------------------------------------------

@app.post("/risk/position-size")
def post_position_size(body: PositionSizeBody):
    size = position_size_by_risk(body.entry, body.stop, body.account_equity, body.risk_pct)
    return ok({"shares": size})

@app.post("/risk/expected-pl")
def post_expected_pl(body: ExpectedPLBody):
    res = expected_pl(body.entry, body.target, body.stop, body.shares)
    return ok(res)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _auto_snapshot(user_id: int, p: Portfolio) -> None:
    """Record a performance snapshot after every trade (best-effort, non-critical)."""
    try:
        sells = [t for t in p.history if t.type == "SELL"]
        total_mv = 0.0
        for sym, pos in p.positions.items():
            try:
                total_mv += pos.qty * float(get_quote(sym).last or 0.0)
            except DomainError:
                total_mv += pos.qty * pos.avg_cost
        record_snapshot(
            user_id=user_id,
            equity=p.cash + total_mv,
            cash=p.cash,
            realized_pl=0.0,
            trade_count=len(sells),
        )
    except Exception:
        pass