from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Optional
from mangum import Mangum
import pandas as pd
import requests as req_lib
from fastapi import FastAPI, Header, Query
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from firebase_admin import auth

from .analytics import allocation, equity_curve, expected_pl, position_size_by_risk
from .errors import DomainError
from .market import get_company_news, get_history, get_quote
from .schemas import (
    ExpectedPLBody,
    OrderBody,
    Portfolio,
    PositionSizeBody,
    ResetBody,
)
from .storage import (
    get_simulation_start,
    load_user_portfolio,
    reset_user_portfolio,
    save_user_portfolio,
)
from .symbols import search_symbols
from .trading import buy as do_buy, sell as do_sell

logger = logging.getLogger(__name__)

app = FastAPI(title="Mock Investment Simulator API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MARKET_DATA_API = os.environ.get("MARKET_DATA_API", "http://localhost:8001")


# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------

def ok(data):
    return JSONResponse({"ok": True, "data": jsonable_encoder(data), "error": None})


def fail(msg: str, status: int = 400):
    return JSONResponse({"ok": False, "data": None, "error": msg}, status_code=status)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def get_uid_from_auth_header(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise ValueError("Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise ValueError("Missing Firebase ID token")

    try:
        decoded = auth.verify_id_token(token)
    except Exception as e:
        raise ValueError(f"Invalid Firebase ID token: {e}") from e

    uid = decoded.get("uid")
    if not uid:
        raise ValueError("Firebase token did not contain a uid")

    return uid


def require_uid(authorization: Optional[str]) -> str:
    return get_uid_from_auth_header(authorization)


# ---------------------------------------------------------------------------
# Market shock helpers
# ---------------------------------------------------------------------------

def get_shocked_price(symbol: str, fallback: float, sim_start: Optional[str] = None) -> float:
    try:
        params = {}
        if sim_start:
            params["sim_start"] = sim_start

        res = req_lib.get(
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
    if not sim_start:
        return False
    try:
        res = req_lib.get(
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
# Market data (no auth needed)
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
def get_portfolio(authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        p = load_user_portfolio(uid)
        return ok(p.model_dump())
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        return fail(str(e), 500)


@app.post("/portfolio/reset")
def post_reset(body: ResetBody, authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        p = reset_user_portfolio(uid, body.starting_cash)
        return ok(p.model_dump())
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        return fail(str(e), 500)


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

@app.post("/orders/buy")
def post_buy(body: OrderBody, authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        p = load_user_portfolio(uid)
        res = do_buy(p, body.symbol, body.qty, body.price)
        save_user_portfolio(uid, p)

        sim_start = get_simulation_start(uid)
        return ok({
            **res.model_dump(),
            "sim_start": sim_start,
        })
    except ValueError as e:
        return fail(str(e), 401)
    except DomainError as e:
        return fail(str(e))
    except Exception as e:
        return fail(str(e), 500)


@app.post("/orders/sell")
def post_sell(body: OrderBody, authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        p = load_user_portfolio(uid)
        res = do_sell(p, body.symbol, body.qty, body.price)
        save_user_portfolio(uid, p)

        sim_start = get_simulation_start(uid)
        return ok({
            **res.model_dump(),
            "sim_start": sim_start,
        })
    except ValueError as e:
        return fail(str(e), 401)
    except DomainError as e:
        return fail(str(e))
    except Exception as e:
        return fail(str(e), 500)


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

@app.get("/metrics/quote/{symbol:path}")
def get_shocked_quote(symbol: str, authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        sim_start = get_simulation_start(uid)
        price = get_shocked_price(symbol, fallback=0.0, sim_start=sim_start)
        return ok({
            "symbol": symbol.upper(),
            "last": price,
            "simulated": is_market_simulated(sim_start),
        })
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        return fail(str(e), 500)


@app.get("/metrics/mark-to-market")
def get_mtm(authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        p = load_user_portfolio(uid)
        sim_start = get_simulation_start(uid)

        total_market_value = 0.0
        price_map = {}

        for sym, pos in p.positions.items():
            price = get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)
            price_map[sym] = price
            total_market_value += pos.qty * price

        simulated = is_market_simulated(sim_start)
        total_trades = len([t for t in p.history if t.type in {"BUY", "SELL"}])
        trades_until_sim = max(0, 5 - total_trades) if sim_start is None else 0

        return ok({
            "total_equity": p.cash + total_market_value,
            "cash": p.cash,
            "market_value": total_market_value,
            "prices": price_map,
            "simulated": simulated,
            "sim_start": sim_start,
            "trades_until_sim": trades_until_sim,
        })
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        return fail(str(e), 500)


@app.get("/metrics/allocation")
def get_alloc(authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        p = load_user_portfolio(uid)
        sim_start = get_simulation_start(uid)

        price_map = {}
        for sym, pos in p.positions.items():
            price_map[sym] = get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)

        a = allocation(p, price_map)
        return ok([it.model_dump() for it in a])
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        return fail(str(e), 500)


@app.get("/metrics/equity-curve")
def get_equity_curve(
    authorization: Optional[str] = Header(None),
    period: str = "1y",
    interval: str = "1d",
):
    try:
        uid = require_uid(authorization)
        p = load_user_portfolio(uid)
        syms = sorted(set(t.ticker for t in p.history if t.ticker))

        if not syms:
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
points = [{"ts": ts.isoformat(), "equity": float(val)} for ts, val in series.items()]

# Force latest point to match live mark-to-market equity
sim_start = get_simulation_start(uid)
live_market_value = 0.0
for sym, pos in p.positions.items():
    live_price = get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)
    live_market_value += pos.qty * live_price

live_total_equity = p.cash + live_market_value

if points:
    points[-1]["ts"] = datetime.now().isoformat()
    points[-1]["equity"] = float(live_total_equity)
else:
    points = [{"ts": datetime.now().isoformat(), "equity": float(live_total_equity)}]

return ok(points)
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        return fail(str(e), 500)


@app.get("/market/status")
def proxy_market_status(authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        sim_start = get_simulation_start(uid)
        p = load_user_portfolio(uid)
        total_trades = len([t for t in p.history if t.type in {"BUY", "SELL"}])

        if sim_start is None:
            return ok({
                "active": False,
                "event": None,
                "simulation_active": False,
                "trades_until_sim": max(0, 5 - total_trades),
            })

        res = req_lib.get(
            f"{MARKET_DATA_API}/market/status",
            params={"sim_start": sim_start},
            timeout=3,
        )
        data = res.json()

        if data.get("ok") and data.get("data"):
            data["data"]["simulation_active"] = True
            data["data"]["trades_until_sim"] = 0
            data["data"]["sim_start"] = sim_start

        return JSONResponse(data)
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        logger.error(f"Market status error: {e}")
        return ok({"active": False, "event": None, "simulation_active": False})


@app.get("/user/stats")
def user_stats(authorization: Optional[str] = Header(None)):
    try:
        uid = require_uid(authorization)
        p = load_user_portfolio(uid)
        sim_start = get_simulation_start(uid)

        total_mv = 0.0
        for sym, pos in p.positions.items():
            total_mv += pos.qty * get_shocked_price(sym, fallback=pos.avg_cost, sim_start=sim_start)

        sells = [t for t in p.history if t.type == "SELL"]
        buy_sell = [t for t in p.history if t.type in {"BUY", "SELL"}]

        return ok({
            "cash": p.cash,
            "equity": p.cash + total_mv,
            "open_positions": len(p.positions),
            "trade_count": len(buy_sell),
            "sell_count": len(sells),
            "sim_start": sim_start,
        })
    except ValueError as e:
        return fail(str(e), 401)
    except Exception as e:
        return fail(str(e), 500)


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

    from mangum import Mangum
handler = Mangum(app)   