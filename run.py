"""LunaSafe AI - Single Entrypoint to Launch the Analysis Server.

Usage:
    python run.py
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.main import run_standalone_server, HAS_FASTAPI

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print("=" * 70)
    print("  LUNASAFE AI: Lunar Lava Tube Subsurface Habitat & Stability Mapper")
    print("  Peer-Reviewed Planetary AI Pipeline (Attention U-Net + Stacking + SHAP)")
    print(f"  Listening on http://{host}:{port}")
    print("=" * 70)
    if HAS_FASTAPI:
        try:
            import uvicorn
            uvicorn.run("backend.main:app", host=host, port=port, reload=False)
        except Exception as e:
            print(f"Uvicorn fallback to standalone: {e}")
            run_standalone_server(host, port)
    else:
        run_standalone_server(host, port)
