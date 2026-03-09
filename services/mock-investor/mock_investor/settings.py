from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("MIS_DATA_DIR", str(BASE_DIR / "data")))
PORTFOLIO_PATH = DATA_DIR / "saved_portfolio.json"

SYMBOL_FILES = [
    DATA_DIR / "nasdaq-listed-symbols.csv",
    DATA_DIR / "extended_nasdaq_symbols.csv",
]

# Cache TTLs (seconds)
TTL_QUOTES = int(os.environ.get("MIS_TTL_QUOTES", "45"))
TTL_HISTORY = int(os.environ.get("MIS_TTL_HISTORY", "1200"))   # 20m
TTL_NEWS = int(os.environ.get("MIS_TTL_NEWS", "1200"))         # 20m

FINNHUB_API_KEY = os.environ.get("FINNHUB_API_KEY", "")