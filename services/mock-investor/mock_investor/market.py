from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
from cachetools import TTLCache
from .schemas import Quote, Bar, NewsItem
from .errors import MarketDataError
from .settings import TTL_QUOTES, TTL_HISTORY, TTL_NEWS

# URL for your Finnhub market data API
MARKET_DATA_API = "http://localhost:8001"

_quotes_cache: TTLCache = TTLCache(maxsize=2048, ttl=TTL_QUOTES)
_hist_cache: TTLCache = TTLCache(maxsize=512, ttl=TTL_HISTORY)
_news_cache: TTLCache = TTLCache(maxsize=512, ttl=TTL_NEWS)

def _now() -> datetime:
    return datetime.utcnow()

def get_quote(symbol: str) -> Quote:
    """
    Get current quote from Finnhub market data API
    """
    sym = symbol.upper().strip()
    if sym in _quotes_cache:
        return _quotes_cache[sym]
    
    try:
        # Call your Finnhub market data API
        response = requests.get(f"{MARKET_DATA_API}/quote/{sym}", timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("ok"):
            raise MarketDataError(f"API error: {data.get('error')}")
        
        quote_data = data["data"]
        q = Quote(
            symbol=sym,
            last=float(quote_data.get("last", 0)),
            prev_close=float(quote_data.get("prev_close", 0)),
            change_pct=float(quote_data.get("change_pct", 0)),
            high_52w=float(quote_data.get("high_52w", 0)),
            low_52w=float(quote_data.get("low_52w", 0))
        )
        _quotes_cache[sym] = q
        return q
    except Exception as e:
        raise MarketDataError(f"Quote fetch failed for {symbol}: {e}") from e

def get_history(symbol: str, period: str = "1y", interval: str = "1d") -> List[Bar]:
    """
    Get historical data from Finnhub market data API
    """
    key = (symbol.upper().strip(), period, interval)
    if key in _hist_cache:
        return _hist_cache[key]
    
    try:
        # Call your Finnhub market data API
        sym = symbol.upper().strip()
        response = requests.get(
            f"{MARKET_DATA_API}/history/{sym}",
            params={"period": period, "interval": interval},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        if not data.get("ok"):
            raise MarketDataError(f"API error: {data.get('error')}")
        
        bars_data = data["data"]
        
        if not bars_data or len(bars_data) == 0:
            raise MarketDataError(f"No historical data returned for {symbol}")
        
        # Convert API response to Bar objects
        out = []
        for bar_dict in bars_data:
            bar = Bar(
                ts=datetime.fromisoformat(bar_dict["date"].replace("Z", "+00:00")) if "date" in bar_dict else datetime.fromisoformat(bar_dict["ts"]),
                open=float(bar_dict.get("open", bar_dict.get("close", 0))),
                high=float(bar_dict.get("high", bar_dict.get("close", 0))),
                low=float(bar_dict.get("low", bar_dict.get("close", 0))),
                close=float(bar_dict["close"]),
                volume=float(bar_dict.get("volume", 0))
            )
            out.append(bar)
        
        print(f"✅ Fetched {len(out)} historical bars for {symbol}")
        _hist_cache[key] = out
        return out
    except Exception as e:
        print(f"❌ History fetch failed for {symbol}: {e}")
        raise MarketDataError(f"History fetch failed for {symbol} ({period},{interval}): {e}") from e

def get_company_news(symbol: str, lookback_days: int = 7) -> List[NewsItem]:
    """
    Get company news from Finnhub market data API
    """
    sym = symbol.upper().strip()
    key = (sym, lookback_days)
    if key in _news_cache:
        return _news_cache[key]
    
    try:
        # Call your Finnhub market data API
        response = requests.get(
            f"{MARKET_DATA_API}/news/{sym}",
            params={"days": lookback_days},
            timeout=5
        )
        response.raise_for_status()
        data = response.json()
        
        if not data.get("ok"):
            # Return empty list if no news
            _news_cache[key] = []
            return []
        
        news_data = data["data"]
        out: List[NewsItem] = []
        
        for item in news_data:
            # Parse the date
            if isinstance(item.get("published_at"), str):
                # If it's already formatted
                dt = datetime.fromisoformat(item["published_at"].replace("Z", "+00:00"))
            else:
                dt = _now()
            
            out.append(NewsItem(
                id=str(item.get("id", "")),
                datetime=dt,
                headline=item.get("title", item.get("headline", "")),
                source=item.get("source", ""),
                url=item.get("url", ""),
                summary=item.get("description", item.get("summary", ""))
            ))
        
        _news_cache[key] = out
        return out
    except Exception as e:
        # Return empty list on error (news is optional)
        print(f"⚠️ News fetch failed for {sym}: {e}")
        _news_cache[key] = []
        return []