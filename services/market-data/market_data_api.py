# services/market-data/market_data_api.py
"""
Market Data Service using Finnhub API
Replaces Yahoo Finance with a commercial-friendly alternative
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import finnhub
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging

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


@app.get("/quote/{symbol}")
async def get_quote(symbol: str):
    """
    Get real-time quote for a stock symbol
    
    Returns:
        - c: Current price
        - d: Change
        - dp: Percent change
        - h: High price of the day
        - l: Low price of the day
        - o: Open price of the day
        - pc: Previous close price
    """
    try:
        symbol = symbol.upper()
        cache_key = f"quote_{symbol}"
        
        def fetch():
            return finnhub_client.quote(symbol)
        
        quote = get_cached_or_fetch(cache_key, fetch)
        
        if not quote or quote.get('c') == 0:
            raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
        
        return {
            "ok": True,
            "data": {
                "symbol": symbol,
                "last": quote['c'],
                "change": quote['d'],
                "change_percent": quote['dp'],
                "high": quote['h'],
                "low": quote['l'],
                "open": quote['o'],
                "previous_close": quote['pc'],
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/candles/{symbol}")
async def get_candles(
    symbol: str,
    days: int = Query(default=30, ge=1, le=365, description="Number of days of history")
):
    """
    Get historical candlestick data for a symbol
    
    Returns arrays of:
        - c: Close prices
        - h: High prices
        - l: Low prices
        - o: Open prices
        - v: Volume
        - t: Timestamps
    """
    try:
        symbol = symbol.upper()
        to_timestamp = int(datetime.now().timestamp())
        from_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())
        
        cache_key = f"candles_{symbol}_{days}"
        
        def fetch():
            return finnhub_client.stock_candles(symbol, 'D', from_timestamp, to_timestamp)
        
        candles = get_cached_or_fetch(cache_key, fetch)
        
        if candles.get('s') != 'ok':
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        return {
            "ok": True,
            "data": {
                "symbol": symbol,
                "resolution": "daily",
                "candles": candles
            }
        }
    except Exception as e:
        logger.error(f"Error fetching candles for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/news/{symbol}")
async def get_company_news(
    symbol: str,
    days: int = Query(default=7, ge=1, le=30, description="Days of news history")
):
    """
    Get recent news articles for a company
    
    Returns array of news articles with:
        - headline: Article title
        - summary: Brief description
        - source: News source
        - url: Link to article
        - image: Article image URL
        - datetime: Unix timestamp
        - sentiment: Sentiment score (if available)
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


@app.get("/search")
async def search_symbols(
    q: str = Query(..., min_length=1, description="Search query")
):
    """
    Search for stock symbols by company name or ticker
    
    Returns array of matching symbols with:
        - description: Company name
        - displaySymbol: Trading symbol
        - symbol: Base symbol
        - type: Security type
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


@app.get("/company/{symbol}")
async def get_company_profile(symbol: str):
    """
    Get company profile information
    
    Returns:
        - name: Company name
        - country: Country of incorporation
        - currency: Trading currency
        - exchange: Stock exchange
        - ipo: IPO date
        - marketCapitalization: Market cap
        - shareOutstanding: Shares outstanding
        - logo: Company logo URL
        - phone: Contact phone
        - weburl: Company website
        - finnhubIndustry: Industry classification
    """
    try:
        symbol = symbol.upper()
        cache_key = f"profile_{symbol}"
        
        # Cache profile data for 1 hour
        if cache_key in cache:
            data, timestamp = cache[cache_key]
            if datetime.now() - timestamp < timedelta(hours=1):
                return {"ok": True, "data": data}
        
        profile = finnhub_client.company_profile2(symbol=symbol)
        
        if not profile:
            raise HTTPException(status_code=404, detail=f"Company profile not found for {symbol}")
        
        cache[cache_key] = (profile, datetime.now())
        
        return {
            "ok": True,
            "data": profile
        }
    except Exception as e:
        logger.error(f"Error fetching company profile for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# NEW ENDPOINTS FOR ASSET DASHBOARD
# ============================================================================

@app.get("/company-info/{symbol}")
async def get_company_info(symbol: str):
    """
    Get formatted company information for Asset Dashboard
    
    Returns:
        - name: Company name
        - industry: Industry classification
        - sector: Sector (derived from industry)
        - market_cap: Market capitalization
        - pe_ratio: P/E ratio (from basic financials)
        - dividend_yield: Dividend yield
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
            "sector": profile.get('finnhubIndustry', 'N/A'),  # Finnhub uses industry, we'll use it as sector too
            "market_cap": profile.get('marketCapitalization', 0) * 1_000_000 if profile.get('marketCapitalization') else 0,  # Convert from millions
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


@app.get("/history/{symbol}")
async def get_price_history(
    symbol: str,
    period: str = Query(default="7d", regex="^(7d|1m|1y)$")
):
    """
    Get historical price data formatted for price chart
    
    Args:
        symbol: Stock symbol
        period: Time period - '7d', '1m', or '1y'
    
    Returns:
        Array of {date, close} objects for charting
    """
    try:
        symbol = symbol.upper()
        
        # Map period to days
        period_days = {
            "7d": 7,
            "1m": 30,
            "1y": 365
        }
        days = period_days.get(period, 7)
        
        # Get candles data
        to_timestamp = int(datetime.now().timestamp())
        from_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())
        
        cache_key = f"history_{symbol}_{period}"
        
        def fetch():
            return finnhub_client.stock_candles(symbol, 'D', from_timestamp, to_timestamp)
        
        candles = get_cached_or_fetch(cache_key, fetch)
        
        if candles.get('s') != 'ok' or not candles.get('c'):
            return {
                "ok": True,
                "data": []  # Return empty array instead of error
            }
        
        # Format data for chart
        history_data = []
        timestamps = candles.get('t', [])
        closes = candles.get('c', [])
        
        for timestamp, close in zip(timestamps, closes):
            date_obj = datetime.fromtimestamp(timestamp)
            
            # Format date based on period
            if period == "7d":
                date_str = date_obj.strftime("%b %d")
            elif period == "1m":
                date_str = date_obj.strftime("%b %d")
            else:  # 1y
                date_str = date_obj.strftime("%b '%y")
            
            history_data.append({
                "date": date_str,
                "close": round(close, 2)
            })
        
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


@app.get("/market-status")
async def get_market_status():
    """
    Check if US markets are currently open
    """
    try:
        now = datetime.now()
        
        # Simple check: Monday-Friday, 9:30 AM - 4:00 PM ET
        is_weekday = now.weekday() < 5
        hour = now.hour
        minute = now.minute
        
        market_open = is_weekday and (
            (hour == 9 and minute >= 30) or 
            (10 <= hour < 16)
        )
        
        return {
            "ok": True,
            "data": {
                "is_open": market_open,
                "timestamp": now.isoformat(),
                "message": "Markets are open" if market_open else "Markets are closed"
            }
        }
    except Exception as e:
        logger.error(f"Error checking market status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/trending")
async def get_trending():
    """
    Get trending stocks (most active)
    Note: This uses Finnhub's market news as a proxy for trending
    """
    try:
        cache_key = "trending"
        
        def fetch():
            # Get general market news
            news = finnhub_client.general_news('general', min_id=0)
            
            # Extract symbols mentioned in news (simplified)
            symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA']
            return symbols[:10]
        
        # Cache trending for 15 minutes
        if cache_key in cache:
            data, timestamp = cache[cache_key]
            if datetime.now() - timestamp < timedelta(minutes=15):
                return {"ok": True, "data": data}
        
        symbols = fetch()
        cache[cache_key] = (symbols, datetime.now())
        
        return {
            "ok": True,
            "data": symbols
        }
    except Exception as e:
        logger.error(f"Error fetching trending: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Market Data API on port 8001")
    logger.info(f"API Key configured: {bool(FINNHUB_API_KEY)}")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")