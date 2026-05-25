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

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Meshopt quantization"
pnpm dlx @gltf-transform/cli@^4 optimize "$SRC" "$TMP/meshopt.glb" \
  --compress meshopt --simplify false

echo "→ Draco compression"
pnpm dlx @gltf-transform/cli@^4 draco "$TMP/meshopt.glb" "$TMP/draco.glb" \
  --quantize-position 14 --quantize-normal 10

echo "→ WebP textures"
pnpm dlx @gltf-transform/cli@^4 webp "$TMP/draco.glb" "$OUT" \
  --quality 85

ORIG_KB=$(du -k "$SRC" | cut -f1)
OUT_KB=$(du -k "$OUT" | cut -f1)
echo "✓ $SRC ($ORIG_KB KB) → $OUT ($OUT_KB KB)"
