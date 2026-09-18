#!/usr/bin/env bash
# Integration check: build an atlas, then load it in a real Godot 4 engine and
# confirm every frame reports its original size and is pixel-identical to its
# source PNG. Unit tests prove the arithmetic; this proves the engine agrees.
#
# Usage: scripts/verify-godot.sh [path-to-godot-binary]
# Falls back to `godot` on PATH.
set -euo pipefail

godot="${1:-godot}"
if ! command -v "$godot" >/dev/null 2>&1 && [ ! -x "$godot" ]; then
  echo "Godot 4 binary not found. Pass its path: scripts/verify-godot.sh /path/to/godot" >&2
  exit 2
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

cp "$root/test/godot/project.godot" "$root/test/godot/verify.gd" "$root/test/godot/pixels.gd" "$work/"
mkdir -p "$work/originals"
cp "$root"/examples/*.png "$work/originals/"

node "$root/src/cli.js" "$root/examples" -o "$work" -n hero

# Godot cannot load a PNG until it has been imported.
"$godot" --headless --path "$work" --import >/dev/null 2>&1 || true

echo "--- resource structure ---"
"$godot" --headless --path "$work" --script verify.gd 2>&1 | grep -vE "^\s*$"
echo "--- pixel comparison ---"
"$godot" --headless --path "$work" --script pixels.gd 2>&1 | grep -vE "^\s*$"
