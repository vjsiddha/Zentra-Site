import pytest
from mock_investor.market import get_quote, get_history
from mock_investor.errors import MarketDataError

def test_quote_error(monkeypatch):
    import mock_investor.market as m
    class BadTicker:
        @property
        def fast_info(self):
            raise RuntimeError("boom")
    monkeypatch.setattr(m.yf, "Ticker", lambda s: BadTicker())
    with pytest.raises(MarketDataError):
        get_quote("FAKE")

def test_history_error(monkeypatch):
    import mock_investor.market as m
    monkeypatch.setattr(m.yf, "download", lambda *a, **k: None)
    with pytest.raises(MarketDataError):
        get_history("FAKE", "1y", "1d")
