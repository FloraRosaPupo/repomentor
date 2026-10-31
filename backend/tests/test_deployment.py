"""Regression tests for the deployed entrypoint, independent of Node builds."""

import importlib.util
import sys
from pathlib import Path

from fastapi.testclient import TestClient


def test_deployment_serves_frontend_without_shadowing_api(tmp_path, monkeypatch):
    root = Path(__file__).resolve().parents[2]
    monkeypatch.syspath_prepend(str(root))
    spec = importlib.util.spec_from_file_location("deployment_entry", root / "index.py")
    entry = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, "deployment_entry", entry)
    spec.loader.exec_module(entry)

    (tmp_path / "index.html").write_text('<html><div id="root"></div></html>')
    assets = tmp_path / "assets"
    assets.mkdir()
    (assets / "app.js").write_text("export const ready = true;")
    monkeypatch.setattr(entry, "PUBLIC", tmp_path)
    mount = next(route for route in entry.app.routes if route.path == "/assets")
    monkeypatch.setattr(mount.app, "directory", str(assets))
    monkeypatch.setattr(mount.app, "all_directories", [str(assets)])

    with TestClient(entry.app) as client:
        page = client.get("/")
        assert page.status_code == 200
        assert "text/html" in page.headers["content-type"]
        assert 'id="root"' in page.text
        assert client.get("/assets/app.js").status_code == 200
        assert client.get("/api/health").json()["status"] == "ok"
        assert client.get("/api/nonexistent").status_code == 404
