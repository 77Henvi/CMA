"""Tiny .env loader shared by the CLI, the web server and the integrations.

Loads <project>/.env once. Real environment variables always win over the file.
"""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_loaded = False


def load_env() -> None:
    global _loaded
    if _loaded:
        return
    _loaded = True
    path = os.path.join(BASE_DIR, ".env")
    if not os.path.exists(path):
        return
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key, value = key.strip(), value.strip().strip('"').strip("'")
                if key and not os.environ.get(key):
                    os.environ[key] = value
    except OSError:
        pass
