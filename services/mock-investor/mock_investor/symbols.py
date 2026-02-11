from __future__ import annotations
import csv, os
from typing import List
from .schemas import SymbolItem
from .settings import SYMBOL_FILES

_symbols: List[SymbolItem] | None = None

def _load_symbols() -> List[SymbolItem]:
    items: List[SymbolItem] = []
    for path in SYMBOL_FILES:
        if not os.path.exists(path):
            continue
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            # Heuristics for common column names
            for row in reader:
                sym = row.get("Symbol") or row.get("symbol") or row.get("SYMBOL")
                name = row.get("Security Name") or row.get("name") or row.get("Company Name") or ""
                if sym:
                    items.append(SymbolItem(symbol=sym.strip().upper(), name=(name or "").strip()))
    # de-dup by symbol (first wins)
    seen = set()
    uniq: List[SymbolItem] = []
    for it in items:
        if it.symbol in seen: 
            continue
        seen.add(it.symbol)
        uniq.append(it)
    return uniq

def search_symbols(query: str, limit: int = 10) -> List[SymbolItem]:
    global _symbols
    if _symbols is None:
        _symbols = _load_symbols()
    q = (query or "").strip().lower()
    if not q:
        return _symbols[:limit]
    out = []
    for it in _symbols:
        if it.symbol.lower().startswith(q) or it.name.lower().startswith(q):
            out.append(it)
            if len(out) >= limit:
                break
    return out