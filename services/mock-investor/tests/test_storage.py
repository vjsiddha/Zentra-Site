import os, json, tempfile, shutil
from mock_investor.storage import load_portfolio, save_portfolio, reset_portfolio
from mock_investor.schemas import Portfolio
from mock_investor import settings

def test_atomic_persistence(tmp_path, monkeypatch):
    d = tmp_path / "data"
    d.mkdir()
    monkeypatch.setenv("MIS_DATA_DIR", str(d))
    # re-import settings and storage paths
    from importlib import reload
    reload(settings)
    from mock_investor import storage
    reload(storage)

    p = storage.load_portfolio()
    assert isinstance(p, Portfolio)
    p.cash = 123.45
    storage.save_portfolio(p)

    with open(settings.PORTFOLIO_PATH, "r") as f:
        obj = json.load(f)
    assert obj["cash"] == 123.45

    p2 = storage.reset_portfolio(1000.0)
    assert p2.cash == 1000.0
    assert p2.history and p2.history[-1].type == "RESET"
