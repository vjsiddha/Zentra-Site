import pytest
from mock_investor.schemas import Portfolio
from mock_investor.trading import buy, sell
from mock_investor.errors import InsufficientCash, InsufficientQuantity

def test_weighted_avg_cost_with_manual_prices(monkeypatch):
    p = Portfolio(cash=10000.0, positions={}, history=[])

    # stub quote to avoid network
    from mock_investor import market
    monkeypatch.setattr(market, "get_quote", lambda s: type("Q", (), {"last": 100.0})())

    r1 = buy(p, "AAPL", 10, price=100.0)
    assert p.positions["AAPL"].qty == 10
    assert p.positions["AAPL"].avg_cost == 100.0
    assert round(p.cash, 2) == 0 + 10000 - 1000

    r2 = buy(p, "AAPL", 10, price=120.0)
    assert p.positions["AAPL"].qty == 20
    assert round(p.positions["AAPL"].avg_cost, 2) == 110.00  # WAC

    r3 = sell(p, "AAPL", 5, price=115.0)
    assert round(r3.realized_pl, 2) == round((115 - 110) * 5, 2)
    assert p.positions["AAPL"].qty == 15

def test_insufficient_cash():
    p = Portfolio(cash=100.0, positions={}, history=[])
    with pytest.raises(InsufficientCash):
        buy(p, "MSFT", 2, price=60.0)

def test_insufficient_qty(monkeypatch):
    p = Portfolio(cash=10000.0, positions={}, history=[])
    buy(p, "TSLA", 1, price=100.0)
    with pytest.raises(InsufficientQuantity):
        sell(p, "TSLA", 2, price=100.0)
