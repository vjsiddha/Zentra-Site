# services/market-data/market_data_api.py
"""
Market Data Service using Finnhub API
FIXED: /history endpoint now returns proper format for equity curve
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import finnhub
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging
import requests

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Market Data API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Finnhub client
FINNHUB_API_KEY = "d1vsb5pr01qmbi8pt1cgd1vsb5pr01qmbi8pt1d0"
if not FINNHUB_API_KEY:
    logger.warning("FINNHUB_API_KEY not set! Get one at https://finnhub.io")

finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)

# Simple in-memory cache
cache: Dict[str, tuple[Any, datetime]] = {}
CACHE_DURATION = timedelta(minutes=1)


def get_cached_or_fetch(cache_key: str, fetch_func):
    """Helper to cache API responses"""
    if cache_key in cache:
        data, timestamp = cache[cache_key]
        if datetime.now() - timestamp < CACHE_DURATION:
            logger.info(f"Cache hit for {cache_key}")
            return data
    
    logger.info(f"Cache miss for {cache_key}, fetching from API")
    data = fetch_func()
    cache[cache_key] = (data, datetime.now())
    return data


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Market Data API",
        "status": "running",
        "provider": "Finnhub",
        "version": "1.0.0"
    }

@app.get("/quote/{symbol:path}")
async def get_quote(symbol: str):
    try:
        symbol = symbol.upper()
        logger.info(f"Quote requested for symbol: '{symbol}'")

        # ── Crypto check FIRST before anything else ──
        CRYPTO_MAP = {
            "BTC-USD": "bitcoin",
            "ETH-USD": "ethereum",
        }
        if symbol in CRYPTO_MAP:
            coin_id = CRYPTO_MAP[symbol]
            try:
                r = requests.get(
                    "https://api.coingecko.com/api/v3/simple/price",
                    params={"ids": coin_id, "vs_currencies": "usd", "include_24hr_change": "true"},
                    timeout=5
                )
                data = r.json()
                price      = data[coin_id]["usd"]
                change_pct = data[coin_id].get("usd_24h_change", 0)
                return {
                    "ok": True,
                    "data": {
                        "symbol":     symbol,
                        "last":       price,
                        "change":     round(price * change_pct / 100, 2),
                        "change_pct": round(change_pct, 2),
                        "high":       price,
                        "low":        price,
                        "open":       price,
                        "prev_close": price,
                        "timestamp":  datetime.now().isoformat()
                    }
                }
            except Exception as e:
                logger.error(f"CoinGecko error for {symbol}: {e}")
                raise HTTPException(status_code=500, detail="Crypto price unavailable")

        # ── Finnhub for everything else ──
        cache_key = f"quote_{symbol}"
        def fetch():
            return finnhub_client.quote(symbol)
        quote = get_cached_or_fetch(cache_key, fetch)

        if not quote or quote.get('c') == 0:
            raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")

        return {
            "ok": True,
            "data": {
                "symbol":     symbol,
                "last":       quote['c'],
                "change":     quote['d'],
                "change_pct": quote['dp'],
                "high":       quote['h'],
                "low":        quote['l'],
                "open":       quote['o'],
                "prev_close": quote['pc'],
                "timestamp":  datetime.now().isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{symbol}")
async def get_price_history(
    symbol: str,
    period: str = Query(default="1y"),
    interval: str = Query(default="1d")
):
    """
    Get historical price data for equity curve calculations
    
    Args:
        symbol: Stock symbol
        period: Time period - '1d', '5d', '1m', '3m', '6m', '1y', '2y', '5y'
        interval: Data interval (currently only 'D' daily is supported)
    
    Returns:
        Array of {date, open, high, low, close, volume, ts} objects
    """
    try:
        symbol = symbol.upper()
        
        # Map period to days (expanded to support more periods)
        period_days = {
            "1d": 1,
            "5d": 5,
            "7d": 7,
            "1m": 30,
            "1mo": 30,
            "3m": 90,
            "3mo": 90,
            "6m": 180,
            "6mo": 180,
            "1y": 365,
            "2y": 730,
            "5y": 1825
        }
        days = period_days.get(period, 365)
        
        # Get candles data from Finnhub
        to_timestamp = int(datetime.now().timestamp())
        from_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())
        
        cache_key = f"history_{symbol}_{period}"
        
        def fetch():
            return finnhub_client.stock_candles(symbol, 'D', from_timestamp, to_timestamp)
        
        candles = get_cached_or_fetch(cache_key, fetch)
        
        if candles.get('s') != 'ok' or not candles.get('c'):
            logger.warning(f"No candle data returned for {symbol} (period={period})")
            return {
                "ok": True,
                "data": []  # Return empty array instead of error
            }
        
        # Format data for mock investor (needs ts, date, open, high, low, close, volume)
        history_data = []
        timestamps = candles.get('t', [])
        opens = candles.get('o', [])
        highs = candles.get('h', [])
        lows = candles.get('l', [])
        closes = candles.get('c', [])
        volumes = candles.get('v', [])
        
        for i, timestamp in enumerate(timestamps):
            date_obj = datetime.fromtimestamp(timestamp)
            
            history_data.append({
                "ts": date_obj.isoformat(),  # ISO format for backend
                "date": date_obj.isoformat(),  # ISO format
                "open": round(opens[i], 2) if i < len(opens) else closes[i],
                "high": round(highs[i], 2) if i < len(highs) else closes[i],
                "low": round(lows[i], 2) if i < len(lows) else closes[i],
                "close": round(closes[i], 2),
                "volume": int(volumes[i]) if i < len(volumes) else 0
            })
        
        logger.info(f"✅ Returning {len(history_data)} historical bars for {symbol}")
        
        return {
            "ok": True,
            "data": history_data
        }
    except Exception as e:
        logger.error(f"Error fetching price history for {symbol}: {str(e)}")
        return {
            "ok": True,
            "data": []  # Return empty array on error
        }


@app.get("/news/{symbol}")
async def get_company_news(
    symbol: str,
    days: int = Query(default=7, ge=1, le=30, description="Days of news history")
):
    """
    Get recent news articles for a company
    """
    try:
        symbol = symbol.upper()
        to_date = datetime.now().strftime("%Y-%m-%d")
        from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        
        cache_key = f"news_{symbol}_{days}"
        
        def fetch():
            return finnhub_client.company_news(symbol, _from=from_date, to=to_date)
        
        news = get_cached_or_fetch(cache_key, fetch)
        
        # Format news for Asset Dashboard
        formatted_news = []
        for article in (news[:20] if news else []):
            formatted_news.append({
                "title": article.get('headline', 'No title'),
                "description": article.get('summary', 'No description available')[:200],
                "url": article.get('url', ''),
                "source": article.get('source', 'Unknown'),
                "published_at": article.get('datetime', 0),
                "image": article.get('image', ''),
                "sentiment": article.get('sentiment', {})
            })
        
        return {
            "ok": True,
            "data": formatted_news
        }
    except Exception as e:
        logger.error(f"Error fetching news for {symbol}: {str(e)}")
        return {
            "ok": True,
            "data": []  # Return empty array on error instead of failing
        }


@app.get("/company-info/{symbol}")
async def get_company_info(symbol: str):
    """
    Get formatted company information for Asset Dashboard
    """
    try:
        symbol = symbol.upper()
        cache_key = f"company_info_{symbol}"
        
        # Cache for 1 hour
        if cache_key in cache:
            data, timestamp = cache[cache_key]
            if datetime.now() - timestamp < timedelta(hours=1):
                return {"ok": True, "data": data}
        
        # Get company profile
        profile = finnhub_client.company_profile2(symbol=symbol)
        
        if not profile:
            raise HTTPException(status_code=404, detail=f"Company not found: {symbol}")
        
        # Try to get basic financials for P/E ratio
        try:
            metrics = finnhub_client.company_basic_financials(symbol, 'all')
            metric_data = metrics.get('metric', {})
            pe_ratio = metric_data.get('peBasicExclExtraTTM') or metric_data.get('peNormalizedAnnual')
            dividend_yield = metric_data.get('dividendYieldIndicatedAnnual')
        except Exception as e:
            logger.warning(f"Could not fetch financials for {symbol}: {e}")
            pe_ratio = None
            dividend_yield = None
        
        # Format data
        company_info = {
            "name": profile.get('name', symbol),
            "industry": profile.get('finnhubIndustry', 'N/A'),
            "sector": profile.get('finnhubIndustry', 'N/A'),
            "market_cap": profile.get('marketCapitalization', 0) * 1_000_000 if profile.get('marketCapitalization') else 0,
            "pe_ratio": pe_ratio,
            "dividend_yield": dividend_yield
        }
        
        cache[cache_key] = (company_info, datetime.now())
        
        return {
            "ok": True,
            "data": company_info
        }
    except Exception as e:
        logger.error(f"Error fetching company info for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search")
async def search_symbols(
    q: str = Query(..., min_length=1, description="Search query")
):
    """
    Search for stock symbols by company name or ticker
    
    Returns array of matching symbols
    """
    try:
        cache_key = f"search_{q.lower()}"
        
        def fetch():
            result = finnhub_client.symbol_lookup(q)
            return result.get('result', [])
        
        results = get_cached_or_fetch(cache_key, fetch)
        
        # Format for easier frontend consumption
        formatted = [
            {
                "symbol": r.get('displaySymbol', r.get('symbol')),
                "name": r.get('description', ''),
                "type": r.get('type', 'Stock')
            }
            for r in results
        ]
        
        return {
            "ok": True,
            "data": formatted[:20]  # Limit to 20 results
        }
    except Exception as e:
        logger.error(f"Error searching symbols: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Market Data API on port 8001")
    logger.info(f"API Key configured: {bool(FINNHUB_API_KEY)}")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")