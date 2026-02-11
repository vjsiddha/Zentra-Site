from __future__ import annotations
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Mock Investment Simulator API", version="1.0.0")

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
from .storage import load_portfolio, save_portfolio, reset_portfolio
from .symbols import search_symbols
from .market import get_quote, get_history, get_company_news
from .trading import buy as do_buy, sell as do_sell
from .analytics import mark_to_market, allocation, equity_curve, position_size_by_risk, expected_pl
from .errors import DomainError


def ok(data):
    # Convert Pydantic models and datetimes to JSON-safe types
    return JSONResponse({"ok": True, "data": jsonable_encoder(data), "error": None})

def fail(msg: str, status: int = 400):
    return JSONResponse({"ok": False, "data": None, "error": msg}, status_code=status)

@app.get("/health")
def health():
    return {"status": "ok"}

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

@app.get("/portfolio")
def get_portfolio():
    p = load_portfolio()
    return ok(p.model_dump())

@app.post("/portfolio/reset")
def post_reset(body: ResetBody):
    p = reset_portfolio(body.starting_cash)
    return ok(p.model_dump())

@app.post("/orders/buy")
def post_buy(body: OrderBody):
    try:
        p = load_portfolio()
        res = do_buy(p, body.symbol, body.qty, body.price)
        save_portfolio(p)
        return ok(res.model_dump())
    except DomainError as e:
        return fail(str(e))

@app.post("/orders/sell")
def post_sell(body: OrderBody):
    try:
        p = load_portfolio()
        res = do_sell(p, body.symbol, body.qty, body.price)
        save_portfolio(p)
        return ok(res.model_dump())
    except DomainError as e:
        return fail(str(e))

@app.get("/metrics/mark-to-market")
def get_mtm():
    p = load_portfolio()
    # 1. Start with your liquid cash
    total_market_value = 0.0
    price_map = {}
    
    # 2. Calculate the value of every stock you own
    for sym, pos in p.positions.items():
        try:
            # Get the live price from your market module
            current_price = float(get_quote(sym).last or 0.0)
            price_map[sym] = current_price
            # Market Value = Quantity * Current Price
            total_market_value += (pos.qty * current_price)
        except DomainError:
            price_map[sym] = pos.avg_cost
            total_market_value += (pos.qty * pos.avg_cost)

    # 3. Equity = Cash + Market Value of Stocks
    total_equity = p.cash + total_market_value
    
    # 4. Return the full breakdown
    return ok({
        "total_equity": total_equity,
        "cash": p.cash,
        "market_value": total_market_value,
        "prices": price_map
    })

@app.get("/metrics/allocation")
def get_alloc():
    p = load_portfolio()
    price_map = {}
    for sym in p.positions.keys():
        try:
            price_map[sym] = float(get_quote(sym).last or 0.0)
        except DomainError:
            price_map[sym] = 0.0
    a = allocation(p, price_map)
    return ok([it.model_dump() for it in a])

@app.get("/metrics/equity-curve")
def get_equity_curve(period: str = "1y", interval: str = "1d"):
    """
    Get portfolio equity curve over time.
    FIXED: Now properly fetches historical prices and calculates daily equity.
    """
    p = load_portfolio()
    
    # Get all symbols from transaction history
    symbols = sorted(set([t.ticker for t in p.history if t.ticker]))
    
    if not symbols:
        # No transactions yet, return starting cash
        from datetime import datetime
        return ok([{"ts": datetime.now().isoformat(), "equity": p.cash}])
    
    # Fetch historical prices for each symbol
    closes = {}
    for sym in symbols:
        try:
            print(f"📊 Fetching history for {sym}...")
            bars = get_history(sym, period=period, interval=interval)
            
            if bars and len(bars) > 0:
                # Convert to pandas Series with date index
                dates = [pd.Timestamp(b.ts) for b in bars]
                prices = [b.close for b in bars]
                ser = pd.Series(prices, index=dates)
                closes[sym] = ser
                print(f"✅ Got {len(bars)} price points for {sym}")
            else:
                print(f"⚠️ No price data for {sym}")
        except DomainError as e:
            print(f"❌ Error fetching {sym}: {e}")
            continue
    
    # Calculate equity curve
    print(f"📈 Calculating equity curve with {len(closes)} symbols...")
    series = equity_curve(p.history, closes)
    
    # Convert to JSON format
    data = [{"ts": ts.isoformat(), "equity": float(val)} for ts, val in series.items()]
    
    print(f"✅ Returning {len(data)} equity data points")
    if len(data) > 0:
        print(f"   First point: {data[0]}")
        print(f"   Last point: {data[-1]}")
    
    return ok(data)

@app.post("/risk/position-size")
def post_position_size(body: PositionSizeBody):
    size = position_size_by_risk(body.entry, body.stop, body.account_equity, body.risk_pct)
    return ok({"shares": size})

@app.post("/risk/expected-pl")
def post_expected_pl(body: ExpectedPLBody):
    res = expected_pl(body.entry, body.target, body.stop, body.shares)
    return ok(res)