"""Vercel entrypoint; frontend assets are served by the platform CDN."""

from backend.app.main import app

__all__ = ["app"]
