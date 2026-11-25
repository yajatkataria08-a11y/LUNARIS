"""Push all pending changes to GitHub via Dulwich."""
import os
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)

PAT = os.environ.get("GITHUB_PAT", "")
if not PAT:
    print("ERROR: GITHUB_PAT not set"); sys.exit(1)

REMOTE_URL = f"https://yajatkataria08-a11y:{PAT}@github.com/yajatkataria08-a11y/LUNARIS.git"

from dulwich.repo import Repo
from dulwich import porcelain
from dulwich.index import commit_tree
from dulwich.objects import Blob, Tree, Commit, Tag
import time

r = Repo(str(ROOT))

# Stage unstaged tracked files
status = porcelain.status(r)
unstaged = status.unstaged
untracked = status.untracked

files_to_add = []

# Add unstaged tracked files
for f in unstaged:
    p = ROOT / f.decode()
    if p.exists():
        files_to_add.append(f)
        print(f"[stage modified] {f.decode()}")

# Add untracked files (exclude graphify AST cache, PDFs, moon jpegs inside textures, No name.pdf)
SKIP_PREFIXES = [
    b"graphify-out/cache/ast/",
    b"graphify-out\\cache\\ast\\",
    b"No name.pdf",
]
for f in untracked:
    skip = any(f.startswith(prefix) for prefix in SKIP_PREFIXES)
    if skip:
        continue
    p = ROOT / f.decode()
    if p.exists() and not p.is_dir():
        files_to_add.append(f)
        print(f"[stage new]      {f.decode()}")

if not files_to_add:
    print("Nothing to stage — already up to date.")
    sys.exit(0)

# Stage
porcelain.add(r, [str(ROOT / f.decode()) for f in files_to_add])
print(f"\nStaged {len(files_to_add)} files.")

# Commit
msg = b"feat(readme): embed photorealistic NASA Moon texture and add animated SVG header, pipeline, subsurface cutaway, and footer; fix scipy/cv2 guards on Render"
commit_sha = porcelain.commit(
    r,
    message=msg,
    author=b"yajatkataria08-a11y <yajatkataria@users.noreply.github.com>",
    committer=b"yajatkataria08-a11y <yajatkataria@users.noreply.github.com>",
)
print(f"\nCommit: {commit_sha.decode()}")

# Push
print("\nPushing to GitHub...")
porcelain.push(r, REMOTE_URL, b"refs/heads/main:refs/heads/main")
print("Push complete!")
