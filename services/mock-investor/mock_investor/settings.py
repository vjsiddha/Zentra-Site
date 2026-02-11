import os

DATA_DIR = os.environ.get("MIS_DATA_DIR", "./data")
PORTFOLIO_PATH = os.path.join(DATA_DIR, "saved_portfolio.json")

SYMBOL_FILES = [
    os.path.join(DATA_DIR, "nasdaq-listed-symbols.csv"),
    os.path.join(DATA_DIR, "extended_nasdaq_symbols.csv"),
]

# Cache TTLs (seconds)
TTL_QUOTES = int(os.environ.get("MIS_TTL_QUOTES", "45"))
TTL_HISTORY = int(os.environ.get("MIS_TTL_HISTORY", "1200"))   # 20m
TTL_NEWS = int(os.environ.get("MIS_TTL_NEWS", "1200"))         # 20m

FINNHUB_API_KEY = os.environ.get("FINNHUB_API_KEY", "")