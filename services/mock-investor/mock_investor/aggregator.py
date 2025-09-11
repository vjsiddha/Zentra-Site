from __future__ import annotations
from typing import Dict
import pandas as pd
from .market import get_quote, get_history, get_company_news
from .schemas import Quote
from .analytics import sma, ema

def asset_overview(symbol: str) -> dict:
    quote = get_quote(symbol)
    bars = get_history(symbol, period="1y", interval="1d")
    closes = pd.Series([b.close for b in bars])
    # Simple stats
    stats = {
        "high_52w": quote.high_52w,
        "low_52w": quote.low_52w,
        "sma_20": float(sma(closes, 20).iloc[-1]) if not closes.empty else None,
        "ema_20": float(ema(closes, 20).iloc[-1]) if not closes.empty else None,
    }
    news = get_company_news(symbol, lookback_days=7)
    return {
        "quote": quote.model_dump(),
        "key_stats": stats,
        "history": [b.model_dump() for b in bars],
        "news": [n.model_dump() for n in news],
    }
