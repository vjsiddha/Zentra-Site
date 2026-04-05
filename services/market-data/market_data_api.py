# services/market-data/market_data_api.py
"""
Market Data Service using Finnhub API
Includes simulated market crash/recovery system for educational purposes.
Events are triggered relative to each user's simulation start time (their 5th trade).
Full cycle completes in ~3 days.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import finnhub
import requests as req
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Market Data API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FINNHUB_API_KEY = os.environ.get("FINNHUB_API_KEY", "d1vsb5pr01qmbi8pt1cgd1vsb5pr01qmbi8pt1d0")
finnhub_client  = finnhub.Client(api_key=FINNHUB_API_KEY)

# ============================================================================
# SIMPLE IN-MEMORY CACHE
# ============================================================================
cache: Dict[str, tuple] = {}
CACHE_DURATION = timedelta(minutes=1)

def get_cached_or_fetch(cache_key: str, fetch_func):
    if cache_key in cache:
        data, timestamp = cache[cache_key]
        if datetime.now() - timestamp < CACHE_DURATION:
            return data
    data = fetch_func()
    cache[cache_key] = (data, datetime.now())
    return data

# ============================================================================
# SECTOR MAP — matches DSSEngine.ts
# ============================================================================
SECTOR_MAP: Dict[str, List[str]] = {
    "Tech":         ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA"],
    "ETFs":         ["SPY", "QQQ", "VTI", "VOO"],
    "Banking":      ["JPM", "BAC", "WFC", "GS"],
    "Green Energy": ["ENPH", "NEE"],
    "Crypto":       ["BTC-USD", "ETH-USD"],
}

def get_sector(symbol: str) -> str:
    for sector, symbols in SECTOR_MAP.items():
        if symbol in symbols:
            return sector
    return "Other"

# ============================================================================
# MARKET EVENTS — 3-day compressed schedule
#
# All timings are relative to the user's simulation start time
# (recorded when they place their 5th trade).
#
# Total timeline:
#   Hour  0  → simulation starts (5th trade placed)
#   Hour  6  → Tech Selloff begins       (lasts 12h, recovers 6h → done at hour 24)
#   Hour 30  → Banking Crisis begins     (lasts 10h, recovers 8h → done at hour 48)
#   Hour 54  → Bull Rally begins         (lasts  8h, recovers 4h → done at hour 66)
#   Hour 48  → Green Energy Downturn     (lasts 12h, recovers 6h → done at hour 72)
#
# Everything resolved by hour 72 = exactly 3 days after trade 5.
# ============================================================================

MARKET_EVENTS = [
    {
        "id":             "tech_crash_1",
        "name":           "Tech Sector Selloff",
        "description":    "Concerns over AI valuations trigger a sharp selloff in technology stocks.",
        "trigger_hour":   6,         # 6h after simulation start
        "duration_hours": 12,        # crash lasts 12 hours
        "recovery_hours": 6,         # gradual recovery over 6 hours → done at hour 24
        "shocks": {
            "Tech":         0.68,    # Tech drops ~32%
            "Crypto":       0.60,    # Crypto drops ~40%
            "ETFs":         0.88,    # ETFs drop ~12%
            "Banking":      0.94,    # Banking drops ~6%
            "Green Energy": 0.91,    # Green Energy drops ~9%
            "Other":        0.93,
        },
    },
    {
        "id":             "banking_crisis_1",
        "name":           "Banking Sector Crisis",
        "description":    "Several regional banks report liquidity issues, rattling financial markets.",
        "trigger_hour":   30,        # 30h after simulation start
        "duration_hours": 10,        # crash lasts 10 hours
        "recovery_hours": 8,         # gradual recovery over 8 hours → done at hour 48
        "shocks": {
            "Tech":         0.93,
            "Crypto":       0.65,
            "ETFs":         0.89,
            "Banking":      0.52,    # Banking gets hit hardest
            "Green Energy": 0.96,
            "Other":        0.91,
        },
    },
    {
        "id":             "bull_rally_1",
        "name":           "Market Rally",
        "description":    "Strong jobs data and a Fed rate cut spark a broad market rally.",
        "trigger_hour":   54,        # 54h after simulation start
        "duration_hours": 8,         # rally lasts 8 hours
        "recovery_hours": 4,         # settles back over 4 hours → done at hour 66
        "shocks": {
            "Tech":         1.18,    # Tech surges ~18%
            "Crypto":       1.28,    # Crypto surges ~28%
            "ETFs":         1.10,
            "Banking":      1.13,
            "Green Energy": 1.14,
            "Other":        1.08,
        },
    },
    {
        "id":             "energy_crash_1",
        "name":           "Green Energy Downturn",
        "description":    "Policy uncertainty causes investors to flee clean energy stocks.",
        "trigger_hour":   48,        # 48h after simulation start (overlaps with banking recovery)
        "duration_hours": 12,        # crash lasts 12 hours
        "recovery_hours": 6,         # gradual recovery over 6 hours → done at hour 66
        "shocks": {
            "Tech":         0.97,
            "Crypto":       0.88,
            "ETFs":         0.94,
            "Banking":      0.97,
            "Green Energy": 0.50,    # Green Energy drops ~50%
            "Other":        0.96,
        },
    },
]

# ============================================================================
# MARKET EVENT ENGINE
# ============================================================================

def get_active_event(reference_time: datetime) -> Optional[Dict]:
    """
    Returns the currently active market event (if any), including
    the computed multiplier accounting for recovery progress.
    reference_time: the user's simulation start (their 5th trade timestamp).
    Returns None if no event is active.
    """
    now           = datetime.now()
    hours_elapsed = (now - reference_time).total_seconds() / 3600

    for event in MARKET_EVENTS:
        trigger  = event["trigger_hour"]
        duration = event["duration_hours"]
        recovery = event["recovery_hours"]
        end      = trigger + duration + recovery

        if hours_elapsed < trigger or hours_elapsed > end:
            continue  # event not yet started or already finished

        if hours_elapsed <= trigger + duration:
            # ── Full crash/rally phase ──
            return {
                "id":          event["id"],
                "name":        event["name"],
                "description": event["description"],
                "phase":       "crash",
                "progress":    (hours_elapsed - trigger) / duration,
                "shocks":      event["shocks"],
                "multipliers": event["shocks"],
            }
        else:
            # ── Recovery phase — linearly interpolate back to 1.0 ──
            recovery_elapsed  = hours_elapsed - (trigger + duration)
            recovery_progress = min(recovery_elapsed / recovery, 1.0)

            multipliers = {
                sector: shock + (1.0 - shock) * recovery_progress
                for sector, shock in event["shocks"].items()
            }

            return {
                "id":          event["id"],
                "name":        event["name"],
                "description": event["description"],
                "phase":       "recovery",
                "progress":    recovery_progress,
                "shocks":      event["shocks"],
                "multipliers": multipliers,
            }

    return None  # no active event — real prices


def apply_shock(price: float, symbol: str, active_event: Optional[Dict]) -> float:
    """Apply sector shock multiplier to a real price. Returns original if no event."""
    if active_event is None:
        return price
    sector     = get_sector(symbol)
    multiplier = active_event["multipliers"].get(sector, active_event["multipliers"].get("Other", 1.0))
    return round(price * multiplier, 2)


# ============================================================================
# CRYPTO — CoinGecko fallback (Finnhub free tier doesn't support crypto)
# ============================================================================
CRYPTO_MAP = {
    "BTC-USD": "bitcoin",
    "ETH-USD": "ethereum",
}

def fetch_crypto_price(symbol: str):
    coin_id  = CRYPTO_MAP[symbol]
    response = req.get(
        "https://api.coingecko.com/api/v3/simple/price",
        params={"ids": coin_id, "vs_currencies": "usd", "include_24hr_change": "true"},
        timeout=5,
    )
    data = response.json()
    return data[coin_id]["usd"], data[coin_id].get("usd_24h_change", 0)


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {"service": "Market Data API", "status": "running", "version": "2.0.0"}


@app.get("/market/status")
async def market_status(sim_start: Optional[str] = Query(None)):
    """
    Returns the current market event status for a user.
    sim_start: ISO timestamp of when the user's simulation clock started (5th trade).
    If sim_start is None, returns no active event (user hasn't hit 5 trades yet).
    After all events resolve (~72h / 3 days), also returns no active event.
    """
    if sim_start is None:
        return {"ok": True, "data": {"active": False, "event": None}}

    try:
        reference_time = datetime.fromisoformat(sim_start)
    except Exception:
        return {"ok": True, "data": {"active": False, "event": None}}

    # Check how far into the simulation we are
    hours_elapsed = (datetime.now() - reference_time).total_seconds() / 3600

    # After 72 hours (3 days), all events are done — return to real prices
    if hours_elapsed >= 72:
        return {
            "ok":   True,
            "data": {
                "active":          False,
                "event":           None,
                "simulation_done": True,
                "hours_elapsed":   round(hours_elapsed, 1),
            },
        }

    event = get_active_event(reference_time)

    if event is None:
        return {
            "ok":   True,
            "data": {
                "active":        False,
                "event":         None,
                "hours_elapsed": round(hours_elapsed, 1),
            },
        }

    return {
        "ok": True,
        "data": {
            "active": True,
            "event": {
                "id":          event["id"],
                "name":        event["name"],
                "description": event["description"],
                "phase":       event["phase"],
                "progress":    round(event["progress"], 3),
                "sector_impacts": {
                    sector: {
                        "multiplier": round(mult, 3),
                        "pct_change": round((mult - 1.0) * 100, 1),
                        "direction":  "up" if mult >= 1.0 else "down",
                    }
                    for sector, mult in event["multipliers"].items()
                },
            },
        },
    }


@app.get("/quote/{symbol:path}")
async def get_quote(symbol: str, sim_start: Optional[str] = Query(None)):
    """
    Get real-time quote for a stock symbol.
    If sim_start is provided and an event is active, applies the sector shock multiplier.
    """
    try:
        symbol = symbol.upper()

        # Determine active event if sim_start provided
        active_event = None
        if sim_start:
            try:
                ref = datetime.fromisoformat(sim_start)
                hours_elapsed = (datetime.now() - ref).total_seconds() / 3600
                if hours_elapsed < 72:  # only apply shocks within 3-day window
                    active_event = get_active_event(ref)
            except Exception:
                pass

        # ── Crypto via CoinGecko ──
        if symbol in CRYPTO_MAP:
            try:
                price, change_pct = fetch_crypto_price(symbol)
                shocked_price     = apply_shock(price, symbol, active_event)
                return {
                    "ok": True,
                    "data": {
                        "symbol":     symbol,
                        "last":       shocked_price,
                        "real_last":  price,
                        "change":     round(shocked_price * change_pct / 100, 2),
                        "change_pct": round(change_pct, 2),
                        "high":       shocked_price,
                        "low":        shocked_price,
                        "open":       shocked_price,
                        "prev_close": shocked_price,
                        "simulated":  active_event is not None,
                        "timestamp":  datetime.now().isoformat(),
                    },
                }
            except Exception as e:
                logger.error(f"CoinGecko error for {symbol}: {e}")
                raise HTTPException(status_code=500, detail="Crypto price unavailable")

        # ── Stocks via Finnhub ──
        cache_key = f"quote_{symbol}"

        def fetch():
            return finnhub_client.quote(symbol)

        quote = get_cached_or_fetch(cache_key, fetch)

        if not quote or quote.get("c") == 0:
            raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")

        real_price    = quote["c"]
        shocked_price = apply_shock(real_price, symbol, active_event)

        return {
            "ok": True,
            "data": {
                "symbol":     symbol,
                "last":       shocked_price,
                "real_last":  real_price,
                "change":     quote["d"],
                "change_pct": quote["dp"],
                "high":       quote["h"],
                "low":        quote["l"],
                "open":       quote["o"],
                "prev_close": quote["pc"],
                "simulated":  active_event is not None,
                "timestamp":  datetime.now().isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history/{symbol:path}")
async def get_price_history(
    symbol:   str,
    period:   str = Query(default="1y"),
    interval: str = Query(default="1d"),
):
    try:
        symbol = symbol.upper()
        period_days = {
            "1d": 1, "5d": 5, "7d": 7,
            "1m": 30, "1mo": 30,
            "3m": 90, "3mo": 90,
            "6m": 180, "6mo": 180,
            "1y": 365, "2y": 730, "5y": 1825,
        }
        days           = period_days.get(period, 365)
        to_timestamp   = int(datetime.now().timestamp())
        from_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())
        cache_key      = f"history_{symbol}_{period}"

        def fetch():
            return finnhub_client.stock_candles(symbol, "D", from_timestamp, to_timestamp)

        candles = get_cached_or_fetch(cache_key, fetch)

        if candles.get("s") != "ok" or not candles.get("c"):
            return {"ok": True, "data": []}

        history_data = []
        for i, ts in enumerate(candles.get("t", [])):
            date_obj = datetime.fromtimestamp(ts)
            history_data.append({
                "ts":     date_obj.isoformat(),
                "date":   date_obj.isoformat(),
                "open":   round(candles["o"][i], 2),
                "high":   round(candles["h"][i], 2),
                "low":    round(candles["l"][i], 2),
                "close":  round(candles["c"][i], 2),
                "volume": int(candles["v"][i]),
            })

        return {"ok": True, "data": history_data}

    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {e}")
        return {"ok": True, "data": []}


@app.get("/news/{symbol:path}")
async def get_company_news(
    symbol: str,
    days:   int = Query(default=7, ge=1, le=30),
):
    try:
        symbol    = symbol.upper()
        to_date   = datetime.now().strftime("%Y-%m-%d")
        from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        cache_key = f"news_{symbol}_{days}"

        def fetch():
            return finnhub_client.company_news(symbol, _from=from_date, to=to_date)

        news      = get_cached_or_fetch(cache_key, fetch)
        formatted = [
            {
                "title":        a.get("headline", "No title"),
                "description":  a.get("summary", "")[:200],
                "url":          a.get("url", ""),
                "source":       a.get("source", "Unknown"),
                "published_at": a.get("datetime", 0),
                "image":        a.get("image", ""),
            }
            for a in (news[:20] if news else [])
        ]
        return {"ok": True, "data": formatted}

    except Exception as e:
        logger.error(f"Error fetching news for {symbol}: {e}")
        return {"ok": True, "data": []}


@app.get("/company-info/{symbol:path}")
async def get_company_info(symbol: str):
    try:
        symbol    = symbol.upper()
        cache_key = f"company_info_{symbol}"

        if cache_key in cache:
            data, timestamp = cache[cache_key]
            if datetime.now() - timestamp < timedelta(hours=1):
                return {"ok": True, "data": data}

        profile = finnhub_client.company_profile2(symbol=symbol)

        if not profile:
            return {
                "ok": True,
                "data": {
                    "name": symbol, "industry": "N/A", "sector": "N/A",
                    "market_cap": 0, "pe_ratio": None, "dividend_yield": None,
                },
            }

        try:
            metrics        = finnhub_client.company_basic_financials(symbol, "all")
            metric_data    = metrics.get("metric", {})
            pe_ratio       = metric_data.get("peBasicExclExtraTTM") or metric_data.get("peNormalizedAnnual")
            dividend_yield = metric_data.get("dividendYieldIndicatedAnnual")
        except Exception:
            pe_ratio       = None
            dividend_yield = None

        company_info = {
            "name":           profile.get("name", symbol),
            "industry":       profile.get("finnhubIndustry", "N/A"),
            "sector":         profile.get("finnhubIndustry", "N/A"),
            "market_cap":     profile.get("marketCapitalization", 0) * 1_000_000,
            "pe_ratio":       pe_ratio,
            "dividend_yield": dividend_yield,
        }
        cache[cache_key] = (company_info, datetime.now())
        return {"ok": True, "data": company_info}

    except Exception as e:
        logger.error(f"Error fetching company info for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search")
async def search_symbols(q: str = Query(..., min_length=1)):
    try:
        cache_key = f"search_{q.lower()}"

        def fetch():
            return finnhub_client.symbol_lookup(q).get("result", [])

        results   = get_cached_or_fetch(cache_key, fetch)
        formatted = [
            {
                "symbol": r.get("displaySymbol", r.get("symbol")),
                "name":   r.get("description", ""),
                "type":   r.get("type", "Stock"),
            }
            for r in results
        ]
        return {"ok": True, "data": formatted[:20]}

    except Exception as e:
        logger.error(f"Error searching symbols: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    logger.info(f"Starting Market Data API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

    from mangum import Mangum
handler = Mangum(app)