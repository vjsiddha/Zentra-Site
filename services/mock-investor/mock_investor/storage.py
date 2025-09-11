from __future__ import annotations
import json, os, tempfile, time
from datetime import datetime
from .schemas import Portfolio, Txn
from .errors import PersistenceError
from .settings import PORTFOLIO_PATH, DATA_DIR

def _ensure_dirs() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)

def _default_portfolio() -> Portfolio:
    return Portfolio(cash=0.0, positions={}, history=[])

def load_portfolio() -> Portfolio:
    _ensure_dirs()
    if not os.path.exists(PORTFOLIO_PATH):
        p = _default_portfolio()
        save_portfolio(p)
        return p
    try:
        with open(PORTFOLIO_PATH, "r", encoding="utf-8") as f:
            obj = json.load(f)
        return Portfolio.model_validate(obj)
    except Exception as e:
        raise PersistenceError(f"Failed to load portfolio: {e}") from e

def save_portfolio(p: Portfolio) -> None:
    _ensure_dirs()
    tmp_fd, tmp_path = tempfile.mkstemp(prefix="portfolio_", suffix=".json", dir=DATA_DIR)
    try:
        json_str = p.model_dump_json()  # ensures datetimes -> ISO8601 strings
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
            f.write(json_str)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, PORTFOLIO_PATH)
    except Exception as e:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        finally:
            raise PersistenceError(f"Failed to save portfolio: {e}") from e

def reset_portfolio(starting_cash: float) -> Portfolio:
    p = Portfolio(cash=float(starting_cash), positions={}, history=[])
    p.history.append(Txn(
        ts=datetime.utcnow(), type="RESET", ticker="", qty=0.0, price=0.0, cash=p.cash
    ))
    save_portfolio(p)
    return p

# Optional helpers
def deposit(amount: float) -> Portfolio:
    p = load_portfolio()
    p.cash += float(amount)
    p.history.append(Txn(
        ts=datetime.utcnow(), type="DEPOSIT", ticker="", qty=0.0, price=0.0, cash=p.cash
    ))
    save_portfolio(p)
    return p

def withdraw(amount: float) -> Portfolio:
    p = load_portfolio()
    p.cash -= float(amount)
    p.history.append(Txn(
        ts=datetime.utcnow(), type="WITHDRAW", ticker="", qty=0.0, price=0.0, cash=p.cash
    ))
    save_portfolio(p)
    return p
