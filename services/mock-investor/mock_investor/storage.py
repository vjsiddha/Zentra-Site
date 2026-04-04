from __future__ import annotations
from datetime import datetime, timezone
from .schemas import Portfolio, Txn
from .errors import PersistenceError
from .firebase_client import get_db

COLLECTION = "mockInvestorUsers"

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _default_portfolio(starting_cash: float = 100000.0) -> Portfolio:
    return Portfolio(cash=float(starting_cash), positions={}, history=[])

def _doc_to_portfolio(data: dict | None) -> Portfolio:
    data = data or {}
    try:
        return Portfolio.model_validate({
            "cash": data.get("cash", 100000.0),
            "positions": data.get("positions", {}),
            "history": data.get("history", []),
        })
    except Exception as e:
        raise PersistenceError(f"Failed to parse portfolio from Firestore: {e}") from e

def load_user_portfolio(uid: str) -> Portfolio:
    try:
        db = get_db()
        ref = db.collection(COLLECTION).document(uid)
        snap = ref.get()

        if not snap.exists:
            p = _default_portfolio()
            ref.set({
                "cash": p.cash,
                "positions": {},
                "history": [],
                "tradeCount": 0,
                "simulationStartedAt": None,
                "updatedAt": _now_iso(),
            })
            return p

        return _doc_to_portfolio(snap.to_dict())
    except Exception as e:
        raise PersistenceError(f"Failed to load portfolio for {uid}: {e}") from e

def save_user_portfolio(uid: str, p: Portfolio) -> None:
    try:
        db = get_db()
        ref = db.collection(COLLECTION).document(uid)

        trade_count = len([t for t in p.history if t.type in {"BUY", "SELL"}])

        current = ref.get()
        current_data = current.to_dict() if current.exists else {}
        sim_started = current_data.get("simulationStartedAt")

        if trade_count >= 5 and not sim_started:
            sim_started = _now_iso()

        ref.set({
            "cash": p.cash,
            "positions": {
                sym: pos.model_dump()
                for sym, pos in p.positions.items()
            },
            "history": [txn.model_dump(mode="json") for txn in p.history],
            "tradeCount": trade_count,
            "simulationStartedAt": sim_started,
            "updatedAt": _now_iso(),
        }, merge=True)
    except Exception as e:
        raise PersistenceError(f"Failed to save portfolio for {uid}: {e}") from e

def reset_user_portfolio(uid: str, starting_cash: float) -> Portfolio:
    p = Portfolio(cash=float(starting_cash), positions={}, history=[])
    p.history.append(Txn(
        ts=datetime.now(timezone.utc),
        type="RESET",
        ticker="",
        qty=0.0,
        price=0.0,
        cash=p.cash,
    ))
    save_user_portfolio(uid, p)
    return p

def get_simulation_start(uid: str) -> str | None:
    try:
        db = get_db()
        snap = db.collection(COLLECTION).document(uid).get()
        if not snap.exists:
            return None
        return (snap.to_dict() or {}).get("simulationStartedAt")
    except Exception as e:
        raise PersistenceError(f"Failed to get simulation start for {uid}: {e}") from e