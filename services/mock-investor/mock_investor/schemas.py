from __future__ import annotations
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

TxnType = Literal["BUY", "SELL", "RESET", "DEPOSIT", "WITHDRAW"]

class Position(BaseModel):
    qty: float = 0.0
    avg_cost: float = 0.0

class Txn(BaseModel):
    ts: datetime
    type: TxnType
    ticker: Optional[str] = ""
    qty: float = 0.0
    price: float = 0.0
    cash: float = 0.0

class Portfolio(BaseModel):
    cash: float = 0.0
    positions: Dict[str, Position] = Field(default_factory=dict)
    history: List[Txn] = Field(default_factory=list)

class SymbolItem(BaseModel):
    symbol: str
    name: str

class Quote(BaseModel):
    symbol: str
    last: float
    prev_close: Optional[float] = None
    change_pct: Optional[float] = None
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None

class Bar(BaseModel):
    ts: datetime
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None

class NewsItem(BaseModel):
    id: Optional[str] = None
    datetime: datetime
    headline: str
    source: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None

class TradeResult(BaseModel):
    ts: datetime
    symbol: str
    qty: float
    price: float
    cash_after: float
    realized_pl: float = 0.0
    position: Optional[Position] = None

class PLError(BaseModel):
    ok: bool = False
    error: str

class MarkToMarketItem(BaseModel):
    symbol: str
    qty: float
    price: float
    market_value: float
    unrealized_pl: float

class MarkToMarket(BaseModel):
    items: List[MarkToMarketItem]
    total_value: float
    total_unrealized_pl: float
    equity: float

class AllocationItem(BaseModel):
    symbol: str
    weight: float
    market_value: float

# Request bodies
class ResetBody(BaseModel):
    starting_cash: float

class OrderBody(BaseModel):
    symbol: str
    qty: float
    price: Optional[float] = None

class PositionSizeBody(BaseModel):
    entry: float
    stop: float
    account_equity: float
    risk_pct: float

class ExpectedPLBody(BaseModel):
    entry: float
    target: float
    stop: float
    shares: float
