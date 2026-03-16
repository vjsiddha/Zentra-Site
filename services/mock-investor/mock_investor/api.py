from __future__ import annotations
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import requests as req_lib
import os
import sqlite3
from datetime import datetime

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

import logging
logger = logging.getLogger(__name__)

# Initialise SQLite tables at startup
init_db()

DEFAULT_USERNAME = "demo"
MARKET_DATA_API  = os.environ.get("MARKET_DATA_API", "http://localhost:8001")
DB_PATH          = os.environ.get("DB_PATH", "data/users.db")

# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------

def ok(data):
    return JSONResponse({"ok": True, "data": jsonable_encoder(data), "error": None})

def fail(msg: str, status: int = 400):
    return JSONResponse({"ok": False, "data": None, "error": msg}, status_code=status)

def _resolve_user(username: Optional[str]) -> dict:
    name = (username or DEFAULT_USERNAME).strip()
    return get_or_create_user(name)

# ---------------------------------------------------------------------------
# Simulation start helpers
# Tracks when each user placed their 5th trade — this is the reference
# point for all market event timings.
# ---------------------------------------------------------------------------

def _init_simulation_table() -> None:
    """Create simulation_starts table if it doesn't exist."""
    try:
        con = sqlite3.connect(DB_PATH)
        cur = con.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS simulation_starts (
                user_id    INTEGER PRIMARY KEY,
                started_at TEXT NOT NULL
            )
        """)
        con.commit()
        con.close()
    except Exception as e:
        logger.warning(f"Could not init simulation table: {e}")

def _set_simulation_start(user_id: int) -> None:
    """
    Record the simulation start time for a user.
    Called exactly once — when they place their 5th trade.
    Uses INSERT OR IGNORE so it only records the first time.
    """
    try:
        _init_simulation_table()
        con = sqlite3.connect(DB_PATH)
        cur = con.cursor()
        cur.execute(
            "INSERT OR IGNORE INTO simulation_starts (user_id, started_at) VALUES (?, ?)",
            (user_id, datetime.utcnow().isoformat()),
        )
        con.commit()
        con.close()
        logger.info(f"Simulation clock started for user {user_id}")
    except Exception as e:
        logger.warning(f"Could not set simulation start for user {user_id}: {e}")

def _get_simulation_start(user_id: int) -> Optional[str]:
    """
    Returns the simulation start ISO timestamp for a user, or None
    if they haven't placed 5 trades yet.
    """
    try:
        _init_simulation_table()
        con = sqlite3.connect(DB_PATH)
        cur = con.cursor()
        cur.execute(
            "SELECT started_at FROM simulation_starts WHERE user_id = ?",
            (user_id,),
        )
        row = con.fetchone() if False else cur.fetchone()
        con.close()
        if row:
            return row[0]
    except Exception as e:
        logger.warning(f"Could not get simulation start for user {user_id}: {e}")
    return None

# ---------------------------------------------------------------------------
# Market shock helpers
# ---------------------------------------------------------------------------

def get_shocked_price(symbol: str, fallback: float, sim_start: Optional[str] = None) -> float:
    """
    Fetch the current price from market_data_api.
    Passes sim_start so market_data_api can apply any active shock multipliers.
    Falls back to the provided fallback price if the service is unavailable.
    """
    try:
        params = {}
        if sim_start:
            params["sim_start"] = sim_start
        res  = req_lib.get(
            f"{MARKET_DATA_API}/quote/{symbol}",
            params=params,
            timeout=3,
        )
        data = res.json()
        if data.get("ok"):
            return float(data["data"]["last"])
    except Exception:
        pass
    return fallback

def is_market_simulated(sim_start: Optional[str]) -> bool:
    """Returns True if a market crash/recovery event is currently active."""
    if not sim_start:
        return False
    try:
        res  = req_lib.get(
            f"{MARKET_DATA_API}/market/status",
            params={"sim_start": sim_start},
            timeout=2,
        )
        data = res.json()
        return data.get("data", {}).get("active", False)
    except Exception:
        return False

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
    return ok(list_users())

@app.get("/metrics/quote/{symbol:path}")
def get_shocked_quote(symbol: str, user: Optional[str] = Query(None)):
    """
    Returns the current price for a symbol with shock applied if active.
    Routes through market_data_api with sim_start so prices reflect
    any active market crash/recovery event.
    """
    try:
        u         = _resolve_user(user)
        sim_start = _get_simulation_start(u["id"])
        price     = get_shocked_price(symbol, fallback=0.0, sim_start=sim_start)
        return ok({"symbol": symbol.upper(), "last": price, "simulated": is_market_simulated(sim_start)})
    except Exception as e:
        return fail(str(e))

@app.get("/users/{username}")
def get_user(username: str):
    user  = get_or_create_user(username)
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
# Portfolio
# ---------------------------------------------------------------------------

@app.get("/portfolio")
def get_portfolio(user: Optional[str] = Query(None)):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    p = load_user_portfolio(u["id"])
    return ok(p.model_dump())

@app.post("/portfolio/reset")
def post_reset(body: ResetBody, user: Optional[str] = Query(None)):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    p = reset_user_portfolio(u["id"], body.starting_cash)
    return ok(p.model_dump())

# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

@app.post("/orders/buy")
def post_buy(body: OrderBody, user: Optional[str] = Query(None)):
    try:
        u   = _resolve_user(user)
        p   = load_user_portfolio(u["id"])
        res = do_buy(p, body.symbol, body.qty, body.price)
        save_user_portfolio(u["id"], p)

        # ── Start simulation clock on 5th trade ──
        total_trades = len(p.history)
        if total_trades == 5:
            _set_simulation_start(u["id"])
            logger.info(f"User {u['id']} placed 5th trade — simulation clock started")

        sim_start = _get_simulation_start(u["id"])
        _auto_snapshot(u["id"], p, sim_start)
        return ok(res.model_dump())
    except DomainError as e:
        return fail(str(e))
    except ValueError as e:
        return fail(str(e))

@app.post("/orders/sell")
def post_sell(body: OrderBody, user: Optional[str] = Query(None)):
    try:
        u   = _resolve_user(user)
        p   = load_user_portfolio(u["id"])
        res = do_sell(p, body.symbol, body.qty, body.price)
        save_user_portfolio(u["id"], p)

        # Also check sell trades toward 5-trade count
        total_trades = len(p.history)
        if total_trades == 5:
            _set_simulation_start(u["id"])

        sim_start = _get_simulation_start(u["id"])
        _auto_snapshot(u["id"], p, sim_start)
        return ok(res.model_dump())
    except DomainError as e:
        return fail(str(e))
    except ValueError as e:
        return fail(str(e))

# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

@app.get("/metrics/mark-to-market")
def get_mtm(user: Optional[str] = Query(None)):
    """
    Returns current market value of all positions.
    Uses shocked prices from market_data_api during active events.
    """
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))

    p         = load_user_portfolio(u["id"])
    sim_start = _get_simulation_start(u["id"])

    total_market_value = 0.0
    price_map          = {}

    for sym, pos in p.positions.items():
        price              = get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)
        price_map[sym]     = price
        total_market_value += pos.qty * price

    simulated = is_market_simulated(sim_start)

    # How many trades until simulation starts (for UI feedback)
    total_trades         = len(p.history)
    trades_until_sim     = max(0, 5 - total_trades) if sim_start is None else 0

    return ok({
        "total_equity":      p.cash + total_market_value,
        "cash":              p.cash,
        "market_value":      total_market_value,
        "prices":            price_map,
        "simulated":         simulated,
        "sim_start":         sim_start,
        "trades_until_sim":  trades_until_sim,
    })


@app.get("/metrics/allocation")
def get_alloc(user: Optional[str] = Query(None)):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))

    p         = load_user_portfolio(u["id"])
    sim_start = _get_simulation_start(u["id"])
    price_map = {}

    for sym, pos in p.positions.items():
        price_map[sym] = get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)

    a = allocation(p, price_map)
    return ok([it.model_dump() for it in a])


@app.get("/metrics/equity-curve")
def get_equity_curve(
    user:     Optional[str] = Query(None),
    period:   str = "1y",
    interval: str = "1d",
):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))

    p    = load_user_portfolio(u["id"])
    syms = sorted(set(t.ticker for t in p.history if t.ticker))

    if not syms:
        from datetime import datetime
        return ok([{"ts": datetime.now().isoformat(), "equity": p.cash}])

    closes = {}
    for sym in syms:
        try:
            bars = get_history(sym, period=period, interval=interval)
            if bars:
                closes[sym] = pd.Series(
                    [b.close for b in bars],
                    index=[pd.Timestamp(b.ts) for b in bars],
                )
        except DomainError:
            continue

    series = equity_curve(p.history, closes)
    return ok([{"ts": ts.isoformat(), "equity": float(val)} for ts, val in series.items()])


# ---------------------------------------------------------------------------
# Market status proxy
# Passes the user's simulation start time to market_data_api so it can
# compute the correct event phase for this specific user.
# ---------------------------------------------------------------------------

@app.get("/market/status")
def proxy_market_status(user: Optional[str] = Query(None)):
    """
    Returns the active market event status for this user.
    If they haven't placed 5 trades yet, returns inactive with trades_remaining count.
    After 72h from sim start, returns inactive (simulation complete).
    """
    try:
        u         = _resolve_user(user)
        sim_start = _get_simulation_start(u["id"])
        p         = load_user_portfolio(u["id"])
        total_trades = len(p.history)

        if sim_start is None:
            # Not started yet — tell the frontend how many trades remain
            return ok({
                "active":            False,
                "event":             None,
                "simulation_active": False,
                "trades_until_sim":  max(0, 5 - total_trades),
            })

        # Pass sim_start to market_data_api
        res  = req_lib.get(
            f"{MARKET_DATA_API}/market/status",
            params={"sim_start": sim_start},
            timeout=3,
        )
        data = res.json()

        # Inject extra context for the frontend
        if data.get("ok") and data.get("data"):
            data["data"]["simulation_active"] = True
            data["data"]["trades_until_sim"]  = 0
            data["data"]["sim_start"]         = sim_start

        return JSONResponse(data)

    except Exception as e:
        logger.error(f"Market status error: {e}")
        return ok({"active": False, "event": None, "simulation_active": False})


# ---------------------------------------------------------------------------
# User stats
# ---------------------------------------------------------------------------

@app.get("/user/stats")
def user_stats(user: Optional[str] = Query(None)):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))

    stats     = get_user_stats(u["id"])
    p         = load_user_portfolio(u["id"])
    sim_start = _get_simulation_start(u["id"])
    total_mv  = 0.0

    for sym, pos in p.positions.items():
        total_mv += pos.qty * get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)

    return ok({
        **stats,
        "cash":           p.cash,
        "equity":         p.cash + total_mv,
        "open_positions": len(p.positions),
    })

# ---------------------------------------------------------------------------
# Watchlist
# ---------------------------------------------------------------------------

@app.get("/watchlist")
def get_user_watchlist(user: Optional[str] = Query(None)):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    return ok(get_watchlist(u["id"]))

class WatchlistBody(BaseModel):
    symbol: str

@app.post("/watchlist")
def add_watchlist(body: WatchlistBody, user: Optional[str] = Query(None)):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    add_to_watchlist(u["id"], body.symbol)
    return ok(get_watchlist(u["id"]))

@app.delete("/watchlist/{symbol}")
def remove_watchlist(symbol: str, user: Optional[str] = Query(None)):
    try:
        u = _resolve_user(user)
    except ValueError as e:
        return fail(str(e))
    remove_from_watchlist(u["id"], symbol)
    return ok(get_watchlist(u["id"]))

# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------

@app.get("/leaderboard")
def leaderboard(limit: int = 20):
    return ok(get_leaderboard(limit))

# ---------------------------------------------------------------------------
# Risk calculators
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

def _auto_snapshot(user_id: int, p: Portfolio, sim_start: Optional[str] = None) -> None:
    """Record a performance snapshot after every trade (best-effort)."""
    try:
        sells    = [t for t in p.history if t.type == "SELL"]
        total_mv = 0.0
        for sym, pos in p.positions.items():
            total_mv += pos.qty * get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)
        record_snapshot(
            user_id=user_id,
            equity=p.cash + total_mv,
            cash=p.cash,
            realized_pl=0.0,
            trade_count=len(sells),
        )
    except Exception:
        pass