from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import yfinance as yf

try:
    import finnhub
except Exception:
    finnhub = None  # optional

from cachetools import TTLCache
from .schemas import Quote, Bar, NewsItem
from .errors import MarketDataError
from .settings import TTL_QUOTES, TTL_HISTORY, TTL_NEWS, FINNHUB_API_KEY

_quotes_cache: TTLCache = TTLCache(maxsize=2048, ttl=TTL_QUOTES)
_hist_cache: TTLCache = TTLCache(maxsize=512, ttl=TTL_HISTORY)
_news_cache: TTLCache = TTLCache(maxsize=512, ttl=TTL_NEWS)

def _now() -> datetime:
    return datetime.utcnow()

def get_quote(symbol: str) -> Quote:
    sym = symbol.upper().strip()
    if sym in _quotes_cache:
        return _quotes_cache[sym]
    try:
        t = yf.Ticker(sym)
        info = t.fast_info  # fast path; falls back to regular if needed
        last = float(info.get("last_price") or info.get("last_price", 0.0))
        prev = float(info.get("previous_close") or 0.0)
        high_52 = float(info.get("year_high") or 0.0)
        low_52 = float(info.get("year_low") or 0.0)
        change_pct = ((last - prev) / prev * 100.0) if prev else None
        q = Quote(symbol=sym, last=last, prev_close=prev, change_pct=change_pct, high_52w=high_52, low_52w=low_52)
        _quotes_cache[sym] = q
        return q
    except Exception as e:
        raise MarketDataError(f"Quote fetch failed for {sym}: {e}") from e

def get_history(symbol: str, period: str = "1y", interval: str = "1d") -> List[Bar]:
    key = (symbol.upper().strip(), period, interval)
    if key in _hist_cache:
        return _hist_cache[key]
    try:
        df = yf.download(symbol, period=period, interval=interval, progress=False, auto_adjust=False, threads=False)
        if df is None or df.empty:
            raise ValueError("empty history")
        df = df.rename(columns={c: c.lower() for c in df.columns})
        out = [
            Bar(ts=pd.Timestamp(idx).to_pydatetime(), open=float(r["open"]), high=float(r["high"]),
                low=float(r["low"]), close=float(r["close"]), volume=float(r.get("volume") or 0.0))
            for idx, r in df.iterrows()
        ]
        _hist_cache[key] = out
        return out
    except Exception as e:
        raise MarketDataError(f"History fetch failed for {symbol} ({period},{interval}): {e}") from e

def get_company_news(symbol: str, lookback_days: int = 7) -> List[NewsItem]:
    sym = symbol.upper().strip()
    key = (sym, lookback_days)
    if key in _news_cache:
        return _news_cache[key]
    if not FINNHUB_API_KEY or finnhub is None:
        _news_cache[key] = []
        return []
    try:
        client = finnhub.Client(api_key=FINNHUB_API_KEY)
        end = datetime.utcnow().date()
        start = end - timedelta(days=int(lookback_days))
        res = client.company_news(sym, _from=start.isoformat(), to=end.isoformat()) or []
        out: List[NewsItem] = []
        for it in res:
            dt = datetime.utcfromtimestamp(it.get("datetime")) if isinstance(it.get("datetime"), (int, float)) else _now()
            out.append(NewsItem(
                id=str(it.get("id") or ""),
                datetime=dt,
                headline=it.get("headline") or "",
                source=it.get("source") or "",
                url=it.get("url") or "",
                summary=it.get("summary") or "",
            ))
        _news_cache[key] = out
        return out
    except Exception as e:
        raise MarketDataError(f"News fetch failed for {sym}: {e}") from e
