"""Vercel entrypoint for the API and the compiled React frontend."""

from pathlib import Path

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.main import app

PUBLIC = Path(__file__).resolve().parent / "public"


@app.get("/", include_in_schema=False)
async def frontend():
    return FileResponse(PUBLIC / "index.html")


# check_dir=False lets Vercel inspect the entrypoint before the frontend build.
# Explicit serving also works when CDN auto-discovery misses generated files.
app.mount("/assets", StaticFiles(directory=PUBLIC / "assets", check_dir=False), name="assets")

__all__ = ["app"]
