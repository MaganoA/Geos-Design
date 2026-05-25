#!/usr/bin/env bash
set -euo pipefail

SRC="${1:-public/models/machine.original.glb}"
OUT="${2:-public/models/machine.glb}"

if [ ! -f "$SRC" ]; then
  echo "Source GLB not found at $SRC"
  echo "Place the raw model there, then rerun:"
  echo "  pnpm build:model"
  exit 1
fi

echo "→ Optimize: Draco + WebP textures (single pass)"
pnpm dlx @gltf-transform/cli@^4 optimize "$SRC" "$OUT" \
  --compress draco \
  --texture-compress webp \
  --simplify false

ORIG_KB=$(du -k "$SRC" | cut -f1)
OUT_KB=$(du -k "$OUT" | cut -f1)
echo "✓ $SRC ($ORIG_KB KB) → $OUT ($OUT_KB KB)"
