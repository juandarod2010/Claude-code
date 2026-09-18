#!/usr/bin/env bash
# Build the two ZIPs that get uploaded to the store.
#   dist/spriteforge-<version>.zip       paid edition, no limits
#   dist/spriteforge-free-<version>.zip  free edition, capped sprite count
set -euo pipefail

FREE_LIMIT=12
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
version="$(node -p "require('./package.json').version")"

rm -rf dist build
mkdir -p dist

stage() {
  local dir="build/$1"
  mkdir -p "$dir"
  cp -r src test scripts README.md LICENSE.txt package.json "$dir/"
  # Vendor the single runtime dependency so the tool runs with no npm install.
  mkdir -p "$dir/node_modules"
  cp -r node_modules/pngjs "$dir/node_modules/"
  mkdir -p "$dir/examples"
  cp -r examples/. "$dir/examples/" 2>/dev/null || true
}

stage full
(cd build/full && zip -qr "$root/dist/spriteforge-$version.zip" .)

stage free
# The free edition is the same code with the ceiling switched on.
python3 - "$FREE_LIMIT" <<'PY'
import sys
limit = sys.argv[1]
path = 'build/free/src/edition.js'
s = open(path).read()
s = s.replace('export const MAX_SPRITES = Infinity;', f'export const MAX_SPRITES = {limit};')
s = s.replace("export const EDITION = 'full';", "export const EDITION = 'free';")
open(path, 'w').write(s)
PY
cat >> build/free/README.md <<'MD'

---

## This is the free edition

It packs up to 12 sprites per atlas. Everything else — the trim margins, the
Godot resource, the deterministic packing — is identical to the full edition,
which removes the limit.
MD
(cd build/free && zip -qr "$root/dist/spriteforge-free-$version.zip" .)

rm -rf build
ls -lh dist
