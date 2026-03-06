from __future__ import annotations
import sqlite3, os, json
from datetime import datetime
from typing import Optional
from .settings import DATA_DIR

DB_PATH = os.path.join(DATA_DIR, "users.db")

# ---------------------------------------------------------------------------
# DB bootstrap
# ---------------------------------------------------------------------------

def _conn() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    con = sqlite3.connect(DB_PATH, check_same_thread=False)
    con.row_factory = sqlite3.Row
    return con

def init_db() -> None:
    """Create tables if they don't exist. Called once at startup."""
    with _conn() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL DEFAULT '',
            created_at  TEXT NOT NULL,
            last_seen   TEXT
        );

        CREATE TABLE IF NOT EXISTS portfolios (
            user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            data        TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS watchlists (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            symbol      TEXT NOT NULL,
            added_at    TEXT NOT NULL,
            UNIQUE(user_id, symbol)
        );

        CREATE TABLE IF NOT EXISTS performance_snapshots (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            snapped_at  TEXT NOT NULL,
            equity      REAL NOT NULL,
            cash        REAL NOT NULL,
            realized_pl REAL NOT NULL DEFAULT 0,
            trade_count INTEGER NOT NULL DEFAULT 0
        );
        """)

# ---------------------------------------------------------------------------
# User - auto-created on first use, no passwords needed
# ---------------------------------------------------------------------------

def get_or_create_user(username: str) -> dict:
    """
    Look up a user by username. If they don't exist yet, create them automatically.
    This is the only entry point needed - no registration/login flow.
    """
    username = username.lower().strip()
    now = datetime.utcnow().isoformat()
    with _conn() as con:
        row = con.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if row:
            con.execute("UPDATE users SET last_seen = ? WHERE id = ?", (now, row["id"]))
            return dict(row)
        cur = con.execute(
            "INSERT INTO users (username, display_name, created_at, last_seen) VALUES (?,?,?,?)",
            (username, username, now, now)
        )
        return {"id": cur.lastrowid, "username": username, "display_name": username,
                "created_at": now, "last_seen": now}

def get_user_by_id(user_id: int) -> Optional[dict]:
    with _conn() as con:
        row = con.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None

def list_users() -> list[dict]:
    with _conn() as con:
        rows = con.execute(
            "SELECT id, username, display_name, created_at, last_seen FROM users ORDER BY username"
        ).fetchall()
    return [dict(r) for r in rows]

# ---------------------------------------------------------------------------
# Per-user portfolio persistence
# ---------------------------------------------------------------------------

def load_user_portfolio_raw(user_id: int) -> Optional[str]:
    with _conn() as con:
        row = con.execute("SELECT data FROM portfolios WHERE user_id = ?", (user_id,)).fetchone()
    return row["data"] if row else None

def save_user_portfolio_raw(user_id: int, json_str: str) -> None:
    now = datetime.utcnow().isoformat()
    with _conn() as con:
        con.execute("""
            INSERT INTO portfolios (user_id, data, updated_at) VALUES (?,?,?)
            ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at
        """, (user_id, json_str, now))

# ---------------------------------------------------------------------------
# Watchlist
# ---------------------------------------------------------------------------

def get_watchlist(user_id: int) -> list[str]:
    with _conn() as con:
        rows = con.execute(
            "SELECT symbol FROM watchlists WHERE user_id = ? ORDER BY added_at", (user_id,)
        ).fetchall()
    return [r["symbol"] for r in rows]

def add_to_watchlist(user_id: int, symbol: str) -> None:
    with _conn() as con:
        con.execute(
            "INSERT OR IGNORE INTO watchlists (user_id, symbol, added_at) VALUES (?,?,?)",
            (user_id, symbol.upper().strip(), datetime.utcnow().isoformat())
        )

def remove_from_watchlist(user_id: int, symbol: str) -> None:
    with _conn() as con:
        con.execute(
            "DELETE FROM watchlists WHERE user_id = ? AND symbol = ?",
            (user_id, symbol.upper().strip())
        )

# ---------------------------------------------------------------------------
# Performance snapshots & leaderboard
# ---------------------------------------------------------------------------

def record_snapshot(user_id: int, equity: float, cash: float,
                    realized_pl: float, trade_count: int) -> None:
    with _conn() as con:
        con.execute("""
            INSERT INTO performance_snapshots
                (user_id, snapped_at, equity, cash, realized_pl, trade_count)
            VALUES (?,?,?,?,?,?)
        """, (user_id, datetime.utcnow().isoformat(), equity, cash, realized_pl, trade_count))

def get_leaderboard(limit: int = 20) -> list[dict]:
    """Top users ranked by their most recent equity snapshot."""
    with _conn() as con:
        rows = con.execute("""
            SELECT u.username, u.display_name,
                   ps.equity, ps.realized_pl, ps.trade_count, ps.snapped_at
            FROM performance_snapshots ps
            JOIN users u ON u.id = ps.user_id
            WHERE ps.id IN (
                SELECT MAX(id) FROM performance_snapshots GROUP BY user_id
            )
            ORDER BY ps.equity DESC
            LIMIT ?
        """, (limit,)).fetchall()
    return [dict(r) for r in rows]

def get_user_stats(user_id: int) -> dict:
    """Aggregate stats derived from the user's portfolio transaction history."""
    raw = load_user_portfolio_raw(user_id)
    if not raw:
        return {"trade_count": 0, "buy_count": 0, "sell_count": 0}
    history = json.loads(raw).get("history", [])
    return {
        "trade_count": len([t for t in history if t.get("type") in ("BUY", "SELL")]),
        "buy_count":   len([t for t in history if t.get("type") == "BUY"]),
        "sell_count":  len([t for t in history if t.get("type") == "SELL"]),
    }