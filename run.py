"""LunaSafe AI - Single Entrypoint to Launch the Analysis Server.

Usage:
    python run.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.main import run_standalone_server

if __name__ == "__main__":
    print("=" * 70)
    print("  LUNASAFE AI: Lunar Lava Tube Subsurface Habitat & Stability Mapper")
    print("  Peer-Reviewed Planetary AI Pipeline (Attention U-Net + Stacking + SHAP)")
    print("=" * 70)
    run_standalone_server("127.0.0.1", 8000)
