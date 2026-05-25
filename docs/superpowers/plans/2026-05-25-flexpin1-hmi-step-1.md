# Flexpin1 HMI — Step 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the app shell, 3D viewport, and a fully working Portale Testa 1 device (right panel + bottom toolbar + camera animation) for the Flexpin1 HMI. Every other device appears in the tree but renders a stub panel, proving the per-folder registry seam.

**Architecture:** Vite + React + TypeScript SPA. URL search param drives selection across tree, 3D, panel, and toolbar. One folder per device under `src/devices/<id>/` with an explicit registry. Zustand stores hold machine state (with a 100ms tick loop), selection, mode, role. R3F + drei renders a compressed GLB and animates the camera to fit the selected part's bounding box.

**Tech Stack:** Vite, React 19, TypeScript (strict), Tailwind CSS v4, Shadcn UI, @react-three/fiber + drei + postprocessing, three-stdlib, camera-controls, Zustand, react-router-dom v7, Zod, Vitest, Playwright, lucide-react.

**Spec:** `docs/superpowers/specs/2026-05-25-flexpin1-hmi-design.md` (committed bfd41b5)

---

## File Structure

Files this plan creates or modifies:

```
package.json, tsconfig.json, tsconfig.node.json, vite.config.ts, index.html,
components.json, playwright.config.ts, vitest.config.ts,
.eslintrc.cjs, .prettierrc, .gitignore, README.md

scripts/compress-model.sh                          # GLB compression
public/models/machine.glb                          # committed, compressed

src/main.tsx                                       # React entrypoint
src/app.tsx                                        # Root layout + router
src/router.tsx                                     # Route config

src/styles/tokens.css                              # @theme primitives
src/styles/shadcn-bridge.css                       # shadcn vars → ours
src/styles/globals.css                             # body, font-face

src/types/device.ts                                # DeviceBase, DeviceStatus
src/types/command.ts                               # Command, Role, CommandCtx
src/types/index.ts                                 # barrel

src/lib/cn.ts                                      # tailwind-merge + clsx
src/lib/role-gate.ts                               # canRunCommand
src/lib/animate-value.ts                           # smoothly drive a value
src/lib/format.ts                                  # formatMm, formatTime

src/store/machine-store.ts                         # devices + tick + dispatch
src/store/selection-store.ts                       # URL-derived + hoveredId
src/store/mode-store.ts                            # auto | manuale + persist
src/store/role-store.ts                            # role + persist

src/hooks/use-selected-device.ts
src/hooks/use-device-state.ts
src/hooks/use-command-dispatch.ts
src/hooks/use-tick.ts
src/hooks/use-keyboard.ts

src/components/ui/                                 # shadcn copies
src/components/primitives/text.tsx
src/components/primitives/status-badge.tsx
src/components/primitives/icon.tsx
src/components/patterns/data-row.tsx
src/components/patterns/data-section.tsx
src/components/patterns/command-button.tsx

src/shell/top-bar.tsx
src/shell/left-rail.tsx
src/shell/left-panel.tsx
src/shell/right-panel.tsx
src/shell/bottom-toolbar.tsx
src/shell/tree/device-tree.tsx
src/shell/tree/tree-item.tsx

src/viewport/canvas.tsx
src/viewport/machine-model.tsx
src/viewport/camera.tsx
src/viewport/device-meshes.ts
src/viewport/outline.tsx
src/viewport/postprocessing/monochrome.tsx
src/viewport/helpers/capture-view.ts
src/viewport/helpers/perf-hud.tsx
src/viewport/assets/index.ts

src/devices/index.ts                               # registry
src/devices/_stub/{meta,panel,toolbar}.tsx
src/devices/portale/meta.ts
src/devices/portale-testa-1/{meta,state,commands,panel,toolbar}.tsx
src/devices/portale-testa-1/panel.test.tsx
src/devices/portale-testa-2/meta.ts
src/devices/dispenser-distanziali/meta.ts
src/devices/robot/meta.ts
src/devices/baia-grezzi/meta.ts
src/devices/baia-lavorati/meta.ts
src/devices/piano-aspirato-1/meta.ts
src/devices/piano-aspirato-2/meta.ts
src/devices/speed/meta.ts
src/devices/impianto-vuoto/meta.ts
src/devices/impianto-acqua/meta.ts
src/devices/impianto-aria/meta.ts
src/devices/erogazione-resina/meta.ts
src/devices/sicurezza/meta.ts

tests/e2e/shell.spec.ts
tests/e2e/portale-testa-1.spec.ts
tests/visual/shell.snap.spec.ts
```

---

## Conventions

- **Always run from repo root** (`/Users/andreamangano/code/Geos-Design`)
- **Package manager:** `pnpm` (smaller installs, monorepo-friendly). If you don't have pnpm: `npm i -g pnpm@9`
- **TDD where logic is pure** (role-gate, animate-value, device-meshes, store mutations). For UI components, write the component, verify in browser, then add Playwright e2e/visual coverage in Task 41–45.
- **Commit after every task.** Use `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer.
- **One-shot git author override** because no global config is set:
  ```bash
  GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
  GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
  git commit -m "..."
  ```
  All commit commands below use this prefix.

---

## Milestone G.1 — Scaffold + design tokens

### Task 1: Initialise Vite + React + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/app.tsx`

- [ ] **Step 1: Scaffold Vite project into the empty repo**

```bash
cd /Users/andreamangano/code/Geos-Design
pnpm create vite@latest . --template react-ts
# Answer 'y' if prompted about non-empty directory (only .git and docs/ exist)
pnpm install
```

- [ ] **Step 2: Strip the starter content**

Replace `src/App.tsx` with a placeholder root:

```tsx
// src/app.tsx  (rename App.tsx → app.tsx to match convention)
export default function App() {
  return <main className="grid h-dvh place-items-center">Flexpin1 HMI</main>
}
```

```bash
git mv src/App.tsx src/app.tsx 2>/dev/null || mv src/App.tsx src/app.tsx
rm -f src/App.css src/assets/react.svg public/vite.svg
```

Update `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Make tsconfig strict and add path alias**

Edit `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Edit `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 5173 },
})
```

- [ ] **Step 4: Run dev server, verify boot**

```bash
pnpm dev
```

Open http://localhost:5173. Expected: page shows "Flexpin1 HMI" centered. Stop dev server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat: scaffold Vite + React + TS project

Strict tsconfig, @/* path alias, blank app shell.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Install and configure Tailwind v4

**Files:**
- Create: `src/styles/globals.css`
- Modify: `vite.config.ts`

- [ ] **Step 1: Install Tailwind v4**

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/vite@^4
```

- [ ] **Step 2: Register Tailwind Vite plugin**

Update `vite.config.ts` to include the plugin:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 5173 },
})
```

- [ ] **Step 3: Create globals.css**

```css
/* src/styles/globals.css */
@import "tailwindcss";

@import "./tokens.css";
@import "./shadcn-bridge.css";

html, body, #root {
  height: 100%;
}

body {
  font-family: var(--font-body);
  color: var(--text-default);
  background: var(--bg-default);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Verify Tailwind class is processed**

Open `src/app.tsx`, confirm the existing `className="grid h-dvh place-items-center"` already uses Tailwind. Run:

```bash
pnpm dev
```

Open http://localhost:5173. Expected: still centered (Tailwind classes apply). Stop dev.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat: install Tailwind v4

Adds @tailwindcss/vite plugin and globals.css entrypoint.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Add design tokens

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Write the full tokens file**

```css
/* src/styles/tokens.css */
@theme {
  --font-body: "Suisse Int'l", ui-sans-serif, system-ui, sans-serif;
  --font-headline: "Suisse Int'l", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Suisse Int'l Mono", ui-monospace, monospace;

  --text-xs:  12px;  --leading-xs:  16px;
  --text-sm:  14px;  --leading-sm:  20px;
  --text-lg:  18px;  --leading-lg:  28px;
  --text-xl:  20px;  --leading-xl:  28px;
  --text-3xl: 30px;  --leading-3xl: 36px;
  --tracking-wide: 0.143em;
  --tracking-tight-3xl: -0.033em;

  --space-2: 2px;  --space-4: 4px;   --space-6: 6px;
  --space-8: 8px;  --space-10: 10px; --space-12: 12px;
  --space-14: 14px; --space-20: 20px; --space-24: 24px;

  --radius-none: 0;  --radius-xs: 1px;
  --radius-md: 8px;  --radius-xl: 16px;
  --radius-full: 9999px;

  --stone-25:  #ffffff;  --stone-50:  #f5f5f4;  --stone-100: #e7e5e4;
  --stone-300: #a6a09b;  --stone-500: #79716b;  --stone-600: #57534d;
  --stone-800: #24211e;  --stone-900: #14110f;  --stone-950: #141413;

  --green-300: #4fc660;  --green-500: #33803f;  --green-bg:  #66dc7e1a;
  --red-500:   #e2433b;  --red-bg:    #e2433b1a;
  --amber-500: #d97706;
}

:root {
  --bg-default:         var(--stone-25);
  --bg-muted:           var(--stone-50);
  --bg-input-soft:      var(--stone-50);
  --bg-state-primary:   var(--stone-800);
  --bg-state-secondary: var(--stone-25);
  --bg-state-danger:    var(--red-500);
  --bg-badge-green:     var(--green-bg);
  --bg-badge-red:       var(--red-bg);

  --text-default:  var(--stone-900);
  --text-subtle:   var(--stone-600);
  --text-muted:    var(--stone-500);
  --text-inverted: var(--stone-25);
  --text-success:  var(--green-500);

  --border-mute:    rgb(39 39 42 / 0.06);
  --border-default: rgb(39 39 42 / 0.10);
  --border-darker:  rgb(39 39 42 / 0.15);

  --icon-default:        var(--stone-800);
  --icon-default-muted:  var(--stone-300);
  --icon-default-subtle: var(--stone-600);

  --status-active:  var(--green-300);
  --status-idle:    var(--stone-300);
  --status-warning: var(--amber-500);
  --status-error:   var(--red-500);
  --status-offline: var(--stone-500);

  --shadow-button:
    0 1px 2px 0 rgb(0 0 0 / 0.05),
    inset 0 -1px 0 0 rgb(0 0 0 / 0.08),
    inset 0 0 0 1px var(--border-darker);
  --shadow-base:
    0 1px 2px -1px rgb(0 0 0 / 0.10),
    0 1px 3px 0   rgb(0 0 0 / 0.10);
  --shadow-demo:
    0 1px 4px 0 rgb(20 20 20 / 0.15),
    0 0   0 1px #E9EAE6;
  --shadow-modal:
    0 0  0 1px var(--border-default),
    0 12px 12px 0 rgb(0 0 0 / 0.04),
    0 6px  6px  0 rgb(0 0 0 / 0.04),
    0 3px  3px  0 rgb(0 0 0 / 0.04),
    0 1px  1px -0.5px rgb(0 0 0 / 0.04);

  --duration-fast:   120ms;
  --duration-base:   200ms;
  --duration-slow:   400ms;
  --duration-camera: 800ms;
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-camera: cubic-bezier(0.32, 0.72, 0, 1);
}
```

- [ ] **Step 2: Verify tokens resolve**

```bash
pnpm dev
```

Open browser DevTools → Elements → `<html>` → Computed → search for `--bg-default`. Expected: `#ffffff`. Search `--text-default`. Expected: `#14110f`. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat: add design tokens (primitives + semantics + elevation + motion)

Extracted from Figma node 1398:12509. Three-layer system.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Initialise Shadcn UI and write the bridge

**Files:**
- Create: `components.json`, `src/styles/shadcn-bridge.css`, `src/lib/cn.ts`
- Modify: `package.json` (adds deps via shadcn init)

- [ ] **Step 1: Run shadcn init**

```bash
pnpm dlx shadcn@latest init
```

When prompted, answer:
- Which style would you like? → `New York`
- Base color? → `Stone`
- CSS variables for colors? → `Yes`
- Path alias for components? → `@/components`
- Path alias for utils? → `@/lib/utils`
- Are you using React Server Components? → `No`

Shadcn writes `components.json`, installs `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, and creates `src/lib/utils.ts`.

- [ ] **Step 2: Rename `utils.ts` → `cn.ts` to match our convention**

```bash
git mv src/lib/utils.ts src/lib/cn.ts 2>/dev/null || mv src/lib/utils.ts src/lib/cn.ts
```

Edit `components.json` to point at the renamed file:

```jsonc
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 3: Write the bridge file**

Shadcn init wrote some color variables into `globals.css`. Move them into `shadcn-bridge.css` and map to OUR tokens:

```css
/* src/styles/shadcn-bridge.css */
:root {
  --background:         var(--bg-default);
  --foreground:         var(--text-default);
  --card:               var(--bg-default);
  --card-foreground:    var(--text-default);
  --popover:            var(--bg-default);
  --popover-foreground: var(--text-default);
  --primary:            var(--bg-state-primary);
  --primary-foreground: var(--text-inverted);
  --secondary:          var(--bg-muted);
  --secondary-foreground: var(--text-default);
  --muted:              var(--bg-muted);
  --muted-foreground:   var(--text-muted);
  --accent:             var(--bg-muted);
  --accent-foreground:  var(--text-default);
  --destructive:        var(--bg-state-danger);
  --destructive-foreground: var(--text-inverted);
  --border:             var(--border-default);
  --input:              var(--border-default);
  --ring:               var(--stone-800);
  --radius: 0.5rem;
}
```

Then edit `src/styles/globals.css` to remove any duplicate `:root { ... --background... }` blocks that shadcn init injected (keep only the `@import` lines and the html/body block from Task 2).

- [ ] **Step 4: Add a Button to prove shadcn works**

```bash
pnpm dlx shadcn@latest add button
```

This creates `src/components/ui/button.tsx`. Edit `src/app.tsx`:

```tsx
import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <main className="grid h-dvh place-items-center">
      <Button>Flexpin1 HMI</Button>
    </main>
  )
}
```

Run `pnpm dev`. Expected: dark "Flexpin1 HMI" button on white background. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat: init shadcn UI with token bridge

Maps shadcn's expected CSS variables to our semantic tokens.
Renames lib/utils.ts → lib/cn.ts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Self-host Suisse Int'l font (or fallback)

**Files:**
- Create: `public/fonts/README.md`
- Modify: `src/styles/globals.css`

Suisse Int'l is a commercial font. If you have a license, drop `.woff2` files in `public/fonts/`. Otherwise this task wires up a fallback that uses the system font stack defined in `--font-body`.

- [ ] **Step 1: Create a placeholder for the fonts directory**

```bash
mkdir -p public/fonts
cat > public/fonts/README.md <<'EOF'
# Fonts

Place self-hosted Suisse Int'l woff2 files here, named:

- suisse-intl-regular.woff2
- suisse-intl-medium.woff2

If absent, the body falls back to ui-sans-serif/system-ui (see tokens.css).
EOF
```

- [ ] **Step 2: Wire `@font-face` declarations behind file existence**

Append to `src/styles/globals.css`:

```css
@font-face {
  font-family: "Suisse Int'l";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local("Suisse Int'l"),
       url("/fonts/suisse-intl-regular.woff2") format("woff2");
}

@font-face {
  font-family: "Suisse Int'l";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local("Suisse Int'l Medium"), local("Suisse Int'l"),
       url("/fonts/suisse-intl-medium.woff2") format("woff2");
}
```

`font-display: swap` means missing files don't block render; the browser uses the fallback.

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat: wire Suisse Int'l self-hosting + fallback

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.2 — GLB compression pipeline

### Task 6: Write the compression script

**Files:**
- Create: `scripts/compress-model.sh`
- Modify: `.gitignore`, `package.json` (script)

- [ ] **Step 1: Write the script**

```bash
mkdir -p scripts
cat > scripts/compress-model.sh <<'EOF'
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
EOF
chmod +x scripts/compress-model.sh
```

- [ ] **Step 2: Update `.gitignore`**

Append:

```bash
cat >> .gitignore <<'EOF'

# Local-only original 3D source (compressed output ships)
public/models/machine.original.glb

# Vite/Playwright artefacts
.vite/
.playwright/
test-results/
*.tsbuildinfo
EOF
```

- [ ] **Step 3: Add npm script**

Edit `package.json` `"scripts"`:

```jsonc
"build:model": "bash scripts/compress-model.sh"
```

- [ ] **Step 4: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
build: add GLB compression pipeline

Meshopt + Draco + WebP via @gltf-transform/cli. Source GLB gitignored;
compressed output ships in public/models/machine.glb.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Run compression and commit the model

**Files:**
- Create: `public/models/machine.glb` (binary, ≤5 MB target)

- [ ] **Step 1: Copy the source GLB into place**

```bash
mkdir -p public/models
cp "/Users/andreamangano/Downloads/machine (4).glb" public/models/machine.original.glb
ls -lh public/models/
```

Expected: `machine.original.glb` ~33 MB.

- [ ] **Step 2: Run compression**

```bash
pnpm build:model
```

Expected output ends with `✓ ... (33000 KB) → ... (≤5000 KB)`. If gltf-transform isn't installed yet, pnpm dlx fetches it.

- [ ] **Step 3: Verify the file loads**

```bash
ls -lh public/models/machine.glb
file public/models/machine.glb
```

Expected: size ≤ 5 MB; `file` reports `glTF binary model, version 2`.

- [ ] **Step 4: Commit the compressed model**

```bash
git add public/models/machine.glb && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
build: add compressed machine GLB

Output of scripts/compress-model.sh. Source is gitignored.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.3 — Empty shell layout

### Task 8: Define types and the shell grid skeleton

**Files:**
- Create: `src/types/device.ts`, `src/types/command.ts`, `src/types/index.ts`
- Modify: `src/app.tsx`

- [ ] **Step 1: Write `src/types/device.ts`**

```ts
// src/types/device.ts
export type DeviceStatus = 'active' | 'idle' | 'warning' | 'error' | 'offline'

export interface DeviceBase {
  id: string
  label: string
  parentId: string | null
  status: DeviceStatus
  codiceStato?: string
  codiceErrori?: string[]
}

export interface DeviceMeta {
  id: string
  label: string
  parentId: string | null
  icon?: React.ComponentType<{ className?: string }>
  meshNames?: string[]
  status?: DeviceStatus
}
```

- [ ] **Step 2: Write `src/types/command.ts`**

```ts
// src/types/command.ts
export type Role = 'operatore' | 'admin' | 'superadmin'

export interface CommandCtx {
  deviceId: string
  role: Role
  mode: 'auto' | 'manuale'
}

export interface Command {
  id: string
  label: string
  description?: string
  requiredRole: Role
  requiresConfirm?: boolean
  destructive?: boolean
  guidedProcedure?: boolean
  hotkey?: string
  manualOnly?: boolean
  handler: (ctx: CommandCtx) => Promise<void> | void
}
```

- [ ] **Step 3: Write barrel**

```ts
// src/types/index.ts
export * from './device'
export * from './command'
```

- [ ] **Step 4: Build the shell grid in `app.tsx`**

```tsx
// src/app.tsx
export default function App() {
  return (
    <div
      className="grid h-dvh w-dvw bg-[var(--bg-muted)]"
      style={{
        gridTemplateColumns: '52px 1fr 348px',
        gridTemplateRows: '148px 1fr 92px',
        gridTemplateAreas: `
          "rail top    top"
          "rail left   right"
          "rail bottom bottom"
        `,
      }}
    >
      <aside style={{ gridArea: 'rail' }} className="bg-[var(--bg-default)] border-r border-[var(--border-mute)]">
        {/* LeftRail */}
      </aside>
      <header style={{ gridArea: 'top' }} className="bg-[var(--bg-default)] border-b border-[var(--border-mute)]">
        {/* TopBar */}
      </header>
      <aside
        style={{ gridArea: 'left' }}
        className="pointer-events-auto absolute z-10 m-5"
      >
        {/* LeftPanel will float over viewport */}
      </aside>
      <section style={{ gridArea: 'left / left / bottom / right' }} className="relative">
        {/* Viewport fills the center area */}
        <div className="absolute inset-0 grid place-items-center text-[var(--text-muted)]">
          Viewport
        </div>
      </section>
      <aside style={{ gridArea: 'right' }} className="bg-[var(--bg-default)] border-l border-[var(--border-mute)]">
        {/* RightPanel */}
      </aside>
      <footer style={{ gridArea: 'bottom' }} className="bg-[var(--bg-default)] border-t border-[var(--border-mute)]">
        {/* BottomToolbar */}
      </footer>
    </div>
  )
}
```

- [ ] **Step 5: Verify layout in browser**

```bash
pnpm dev
```

Open http://localhost:5173. Expected: 1920×1080 layout with the regions outlined. Resize browser — grid stays. Stop dev.

- [ ] **Step 6: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat: shell grid skeleton + device/command types

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: TopBar component (static)

**Files:**
- Create: `src/shell/top-bar.tsx`
- Modify: `src/app.tsx`

- [ ] **Step 1: Add a Badge shadcn component**

```bash
pnpm dlx shadcn@latest add badge separator
```

- [ ] **Step 2: Write `top-bar.tsx`**

```tsx
// src/shell/top-bar.tsx
import { Badge } from '@/components/ui/badge'

interface ChipProps {
  label: string
  primary: string
  secondaryItems?: string[]
}

function Chip({ label, primary, secondaryItems = [] }: ChipProps) {
  return (
    <div className="flex flex-col gap-2 px-6 py-4 border-r border-[var(--border-mute)] min-w-[200px]">
      <span className="text-[12px] font-medium tracking-[0.143em] uppercase text-[var(--text-muted)]">
        {label}
      </span>
      <span className="text-[14px] font-medium text-[var(--text-default)] truncate">
        {primary}
      </span>
      {secondaryItems.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {secondaryItems.map((s) => (
            <Badge key={s} variant="secondary" className="font-normal">
              {s}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  return (
    <div className="flex items-stretch h-full">
      <Chip
        label="Ricetta"
        primary="Lastra 1500x450x6 Gress Rosso"
        secondaryItems={['F3Y1080.1', 'Flex 3', 'Visualizza Ordini']}
      />
      <Chip label="Robot" primary="L12 - Insertatura" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip label="Portale - Testa 1" primary="L12 - Insertatura" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip label="Portale - Testa 2" primary="L12 - Insertatura" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip label="Speed" primary="L1 - Foratura" secondaryItems={['Lastra 1', 'Foro 2']} />
    </div>
  )
}
```

- [ ] **Step 3: Mount it**

In `src/app.tsx`, replace the `<header>...</header>` content with `<TopBar />`:

```tsx
import { TopBar } from './shell/top-bar'
// ...
<header style={{ gridArea: 'top' }} className="bg-[var(--bg-default)] border-b border-[var(--border-mute)]">
  <TopBar />
</header>
```

- [ ] **Step 4: Visual check**

```bash
pnpm dev
```

Open http://localhost:5173. Expected: five vertical chips across the top, dividers between them, label/value/badges visible. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): static TopBar with five subsystem chips

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: LeftRail component (static)

**Files:**
- Create: `src/shell/left-rail.tsx`
- Modify: `src/app.tsx`

- [ ] **Step 1: Write `left-rail.tsx`**

```tsx
// src/shell/left-rail.tsx
import { LayoutDashboard, User } from 'lucide-react'

export function LeftRail() {
  return (
    <div className="flex h-full flex-col items-center justify-between py-3">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-md text-[var(--icon-default)] hover:bg-[var(--bg-muted)]"
        aria-label="Dashboard"
      >
        <LayoutDashboard size={20} />
      </button>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-[var(--icon-default-muted)] hover:bg-[var(--bg-muted)]"
        aria-label="Account"
      >
        <User size={20} />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Mount in `app.tsx`**

```tsx
import { LeftRail } from './shell/left-rail'
// ...
<aside style={{ gridArea: 'rail' }} className="bg-[var(--bg-default)] border-r border-[var(--border-mute)]">
  <LeftRail />
</aside>
```

- [ ] **Step 3: Visual check**

`pnpm dev` → expect: top-left dashboard icon, bottom-left account icon. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): static LeftRail with dashboard + account buttons

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: LeftPanel container (empty tree placeholder)

**Files:**
- Create: `src/shell/left-panel.tsx`
- Modify: `src/app.tsx`

- [ ] **Step 1: Add ScrollArea shadcn**

```bash
pnpm dlx shadcn@latest add scroll-area
```

- [ ] **Step 2: Write `left-panel.tsx`**

```tsx
// src/shell/left-panel.tsx
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'

export function LeftPanel() {
  return (
    <div
      className="w-[348px] bg-[var(--bg-default)] rounded-[var(--radius-md)]"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <header className="px-5 pt-6 pb-3">
        <button type="button" className="flex items-center gap-2 text-left">
          <span className="text-[30px] font-medium leading-9 tracking-[-0.033em]">FlexPin</span>
          <ChevronDown size={20} className="text-[var(--icon-default)]" />
        </button>
        <Badge className="mt-2 bg-[var(--bg-badge-green)] text-[var(--text-success)] hover:bg-[var(--bg-badge-green)]">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[var(--status-active)]" />
          Attivo
        </Badge>
      </header>
      <ScrollArea className="h-[440px] px-5 pb-5">
        <div className="text-[var(--text-muted)] text-sm">Tree will render here</div>
      </ScrollArea>
    </div>
  )
}
```

- [ ] **Step 3: Mount in `app.tsx`**

```tsx
import { LeftPanel } from './shell/left-panel'
// ...
<aside style={{ gridArea: 'left' }} className="pointer-events-auto absolute z-10 m-5">
  <LeftPanel />
</aside>
```

- [ ] **Step 4: Visual check**

`pnpm dev` → expect: floating white card top-left of viewport with "FlexPin" headline + "Attivo" green badge. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): LeftPanel container with FlexPin headline + active badge

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: RightPanel container (closed by default)

**Files:**
- Create: `src/shell/right-panel.tsx`
- Modify: `src/app.tsx`

- [ ] **Step 1: Write `right-panel.tsx`**

```tsx
// src/shell/right-panel.tsx
export function RightPanel() {
  return (
    <div
      className="h-full w-[348px] m-5 ml-0 bg-[var(--bg-default)] rounded-[var(--radius-md)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <div className="grid h-full place-items-center text-[var(--text-muted)] text-sm">
        Select a device
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount in `app.tsx`**

Update the right grid area:

```tsx
import { RightPanel } from './shell/right-panel'
// ...
<aside style={{ gridArea: 'right' }} className="bg-transparent">
  <RightPanel />
</aside>
```

- [ ] **Step 3: Visual check**

`pnpm dev` → expect: floating right-side card showing "Select a device". Stop dev.

- [ ] **Step 4: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): empty RightPanel container

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: BottomToolbar container (closed by default)

**Files:**
- Create: `src/shell/bottom-toolbar.tsx`
- Modify: `src/app.tsx`

- [ ] **Step 1: Write `bottom-toolbar.tsx`**

```tsx
// src/shell/bottom-toolbar.tsx
export function BottomToolbar() {
  return (
    <div className="grid h-full place-items-center">
      <div
        className="w-[348px] h-[76px] bg-[var(--bg-default)] rounded-[var(--radius-md)] grid place-items-center text-[var(--text-muted)] text-sm"
        style={{ boxShadow: 'var(--shadow-demo)' }}
      >
        Select a device
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount in `app.tsx`**

```tsx
import { BottomToolbar } from './shell/bottom-toolbar'
// ...
<footer style={{ gridArea: 'bottom' }} className="bg-transparent border-none">
  <BottomToolbar />
</footer>
```

Drop the `border-t` class on the footer; the toolbar pill is the visible element.

- [ ] **Step 3: Side-by-side check vs Figma**

`pnpm dev`. Open Figma node `1398:12509` next to the browser at 1920×1080. Layout should match: top chips, side rail, floating left panel, center area, right panel, bottom pill. Stop dev.

- [ ] **Step 4: Invoke impeccable for first design review**

Run the `impeccable` skill against the current shell. Capture and apply any actionable critique to typography, spacing, alignment, elevation. Apply changes inline; do not over-engineer.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): empty BottomToolbar; impeccable pass on shell

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.4 — Device registry + tree

### Task 14: Stub device + all meta-only stubs

**Files:**
- Create:
  - `src/devices/_stub/meta.ts`, `panel.tsx`, `toolbar.tsx`
  - `src/devices/portale/meta.ts`
  - `src/devices/portale-testa-1/meta.ts`
  - `src/devices/portale-testa-2/meta.ts`
  - `src/devices/dispenser-distanziali/meta.ts`
  - `src/devices/robot/meta.ts`
  - `src/devices/baia-grezzi/meta.ts`
  - `src/devices/baia-lavorati/meta.ts`
  - `src/devices/piano-aspirato-1/meta.ts`
  - `src/devices/piano-aspirato-2/meta.ts`
  - `src/devices/speed/meta.ts`
  - `src/devices/impianto-vuoto/meta.ts`
  - `src/devices/impianto-acqua/meta.ts`
  - `src/devices/impianto-aria/meta.ts`
  - `src/devices/erogazione-resina/meta.ts`
  - `src/devices/sicurezza/meta.ts`

- [ ] **Step 1: Write the stub device**

```ts
// src/devices/_stub/meta.ts
import type { DeviceMeta } from '@/types'
export const meta: DeviceMeta = {
  id: '_stub',
  label: 'Coming soon',
  parentId: null,
}
```

```tsx
// src/devices/_stub/panel.tsx
export function Panel({ label }: { label: string }) {
  return (
    <div className="p-6 text-sm text-[var(--text-muted)]">
      <p className="mb-2 font-medium text-[var(--text-default)]">{label}</p>
      Not implemented yet.
    </div>
  )
}
```

```tsx
// src/devices/_stub/toolbar.tsx
export function Toolbar() {
  return <div className="grid h-full place-items-center text-sm text-[var(--text-muted)]">No commands yet</div>
}
```

- [ ] **Step 2: Write all meta-only devices**

Write each file using this template. Substitute `id`, `label`, `parentId`:

```ts
// src/devices/<id>/meta.ts
import type { DeviceMeta } from '@/types'
export const meta: DeviceMeta = {
  id: '<id>',
  label: '<label>',
  parentId: '<parentId or null>',
}
```

Concrete contents:

```ts
// portale/meta.ts
{ id: 'portale', label: 'Portale', parentId: null }
// portale-testa-1/meta.ts
{ id: 'portale-testa-1', label: 'Testa 1', parentId: 'portale', meshNames: ['Portale_Testa_1', 'Portale_Testa_1_*'] }
// portale-testa-2/meta.ts
{ id: 'portale-testa-2', label: 'Testa 2', parentId: 'portale' }
// dispenser-distanziali/meta.ts
{ id: 'dispenser-distanziali', label: 'Dispenser', parentId: null }
// robot/meta.ts
{ id: 'robot', label: 'Robot', parentId: null }
// baia-grezzi/meta.ts
{ id: 'baia-grezzi', label: 'Baia dei grezzi', parentId: null }
// baia-lavorati/meta.ts
{ id: 'baia-lavorati', label: 'Baia dei lavorati', parentId: null }
// piano-aspirato-1/meta.ts
{ id: 'piano-aspirato-1', label: 'Piano 1', parentId: null }
// piano-aspirato-2/meta.ts
{ id: 'piano-aspirato-2', label: 'Piano 2', parentId: null }
// speed/meta.ts
{ id: 'speed', label: 'Speed', parentId: null }
// impianto-vuoto/meta.ts
{ id: 'impianto-vuoto', label: 'Impianto del vuoto', parentId: null }
// impianto-acqua/meta.ts
{ id: 'impianto-acqua', label: 'Impianto acqua', parentId: null }
// impianto-aria/meta.ts
{ id: 'impianto-aria', label: 'Impianto aria', parentId: null }
// erogazione-resina/meta.ts
{ id: 'erogazione-resina', label: 'Sistema di erogazione resina', parentId: null }
// sicurezza/meta.ts
{ id: 'sicurezza', label: 'Sicurezza', parentId: null }
```

Each file is the meta template above with the values substituted.

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(devices): _stub + 15 meta-only device folders

Each folder declares id, label, parentId so the tree can render
the full hierarchy. Panels and toolbars fall back to _stub.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Device registry

**Files:**
- Create: `src/devices/index.ts`

- [ ] **Step 1: TDD — write the registry test first**

```ts
// src/devices/index.test.ts
import { describe, it, expect } from 'vitest'
import { getDevice, allDevices } from './index'

describe('device registry', () => {
  it('returns the requested device meta', () => {
    expect(getDevice('portale-testa-1').meta.label).toBe('Testa 1')
  })

  it('falls back to _stub for unknown ids', () => {
    expect(getDevice('does-not-exist').meta.id).toBe('_stub')
  })

  it('enumerates all registered devices', () => {
    expect(allDevices().length).toBeGreaterThanOrEqual(15)
  })
})
```

Install vitest first:

```bash
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
```

Write `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Add to `package.json` scripts:

```jsonc
"test": "vitest"
```

- [ ] **Step 2: Run the test, expect failure**

```bash
pnpm test --run src/devices/index.test.ts
```

Expected: FAIL — `getDevice` / `allDevices` not defined.

- [ ] **Step 3: Implement the registry**

```ts
// src/devices/index.ts
import * as _stub from './_stub/meta'
import * as portale from './portale/meta'
import * as portaleTesta1 from './portale-testa-1/meta'
import * as portaleTesta2 from './portale-testa-2/meta'
import * as dispenser from './dispenser-distanziali/meta'
import * as robot from './robot/meta'
import * as baiaGrezzi from './baia-grezzi/meta'
import * as baiaLavorati from './baia-lavorati/meta'
import * as piano1 from './piano-aspirato-1/meta'
import * as piano2 from './piano-aspirato-2/meta'
import * as speed from './speed/meta'
import * as vuoto from './impianto-vuoto/meta'
import * as acqua from './impianto-acqua/meta'
import * as aria from './impianto-aria/meta'
import * as resina from './erogazione-resina/meta'
import * as sicurezza from './sicurezza/meta'
import { Panel as StubPanel } from './_stub/panel'
import { Toolbar as StubToolbar } from './_stub/toolbar'
import type { DeviceMeta } from '@/types'

interface RegisteredDevice {
  meta: DeviceMeta
  Panel: React.ComponentType<{ label: string }>
  Toolbar: React.ComponentType
}

const stubDevice: RegisteredDevice = {
  meta: _stub.meta,
  Panel: StubPanel,
  Toolbar: StubToolbar,
}

const registry: Record<string, RegisteredDevice> = {
  portale:               { meta: portale.meta,        Panel: StubPanel, Toolbar: StubToolbar },
  'portale-testa-1':     { meta: portaleTesta1.meta,  Panel: StubPanel, Toolbar: StubToolbar },
  'portale-testa-2':     { meta: portaleTesta2.meta,  Panel: StubPanel, Toolbar: StubToolbar },
  'dispenser-distanziali': { meta: dispenser.meta,    Panel: StubPanel, Toolbar: StubToolbar },
  robot:                 { meta: robot.meta,          Panel: StubPanel, Toolbar: StubToolbar },
  'baia-grezzi':         { meta: baiaGrezzi.meta,     Panel: StubPanel, Toolbar: StubToolbar },
  'baia-lavorati':       { meta: baiaLavorati.meta,   Panel: StubPanel, Toolbar: StubToolbar },
  'piano-aspirato-1':    { meta: piano1.meta,         Panel: StubPanel, Toolbar: StubToolbar },
  'piano-aspirato-2':    { meta: piano2.meta,         Panel: StubPanel, Toolbar: StubToolbar },
  speed:                 { meta: speed.meta,          Panel: StubPanel, Toolbar: StubToolbar },
  'impianto-vuoto':      { meta: vuoto.meta,          Panel: StubPanel, Toolbar: StubToolbar },
  'impianto-acqua':      { meta: acqua.meta,          Panel: StubPanel, Toolbar: StubToolbar },
  'impianto-aria':       { meta: aria.meta,           Panel: StubPanel, Toolbar: StubToolbar },
  'erogazione-resina':   { meta: resina.meta,         Panel: StubPanel, Toolbar: StubToolbar },
  sicurezza:             { meta: sicurezza.meta,      Panel: StubPanel, Toolbar: StubToolbar },
}

export function getDevice(id: string): RegisteredDevice {
  return registry[id] ?? stubDevice
}

export function allDevices(): RegisteredDevice[] {
  return Object.values(registry)
}
```

- [ ] **Step 4: Run the test, expect pass**

```bash
pnpm test --run src/devices/index.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(devices): explicit registry + Vitest setup

getDevice() returns _stub for unknown ids. allDevices() enumerates.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Selection store (URL-driven)

**Files:**
- Create: `src/store/selection-store.ts`, `src/hooks/use-selected-device.ts`
- Install: `react-router-dom`, `zustand`

- [ ] **Step 1: Install deps**

```bash
pnpm add react-router-dom@^7 zustand
```

- [ ] **Step 2: Add Router to main.tsx**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 3: Write the selection store**

```ts
// src/store/selection-store.ts
import { create } from 'zustand'

interface SelectionState {
  hoveredId: string | null
  setHovered: (id: string | null) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  hoveredId: null,
  setHovered: (hoveredId) => set({ hoveredId }),
}))
```

- [ ] **Step 4: Write `use-selected-device.ts`**

```ts
// src/hooks/use-selected-device.ts
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getDevice } from '@/devices'

export function useSelectedDevice() {
  const [params, setParams] = useSearchParams()
  const id = params.get('device')

  const select = useCallback(
    (next: string | null) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next) p.set('device', next)
          else p.delete('device')
          return p
        },
        { replace: false },
      )
    },
    [setParams],
  )

  const device = id ? getDevice(id) : null
  return { id, device, select, clear: () => select(null) }
}
```

- [ ] **Step 5: Verify with a test**

```ts
// src/hooks/use-selected-device.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useSelectedDevice } from './use-selected-device'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes><Route path="*" element={children} /></Routes>
    </MemoryRouter>
  )
}

describe('useSelectedDevice', () => {
  it('reads device from URL', () => {
    const { result } = renderHook(() => useSelectedDevice(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/?device=portale-testa-1']}>
          <Routes><Route path="*" element={children} /></Routes>
        </MemoryRouter>
      ),
    })
    expect(result.current.id).toBe('portale-testa-1')
    expect(result.current.device?.meta.label).toBe('Testa 1')
  })

  it('select() updates the URL', () => {
    const { result } = renderHook(() => useSelectedDevice(), { wrapper })
    expect(result.current.id).toBeNull()
    act(() => result.current.select('robot'))
    expect(result.current.id).toBe('robot')
    act(() => result.current.clear())
    expect(result.current.id).toBeNull()
  })
})
```

Run:

```bash
pnpm test --run src/hooks/use-selected-device.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(store): selection store + URL-driven device hook

Selection is derived from ?device= search param. Hover is non-URL.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Device tree rendering

**Files:**
- Create: `src/shell/tree/device-tree.tsx`, `src/shell/tree/tree-item.tsx`
- Modify: `src/shell/left-panel.tsx`

- [ ] **Step 1: Write `tree-item.tsx`**

```tsx
// src/shell/tree/tree-item.tsx
import type { DeviceMeta } from '@/types'
import { ChevronRight } from 'lucide-react'

interface Props {
  meta: DeviceMeta
  depth: number
  selected: boolean
  hasChildren: boolean
  expanded: boolean
  onToggle: () => void
  onSelect: () => void
  onHover: (id: string | null) => void
}

export function TreeItem({ meta, depth, selected, hasChildren, expanded, onToggle, onSelect, onHover }: Props) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(meta.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        if (hasChildren && (e.target as HTMLElement).dataset.role === 'toggle') {
          onToggle()
        } else {
          onSelect()
        }
      }}
      className={[
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition',
        selected ? 'bg-[var(--bg-muted)] text-[var(--text-default)]' : 'text-[var(--text-subtle)] hover:bg-[var(--bg-muted)]',
      ].join(' ')}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      {hasChildren ? (
        <ChevronRight
          data-role="toggle"
          size={14}
          className={`transition-transform ${expanded ? 'rotate-90' : ''} text-[var(--icon-default-subtle)]`}
        />
      ) : (
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--icon-default-muted)]" />
      )}
      <span className="font-medium">{meta.label}</span>
    </button>
  )
}
```

- [ ] **Step 2: Write `device-tree.tsx`**

```tsx
// src/shell/tree/device-tree.tsx
import { useState } from 'react'
import { allDevices } from '@/devices'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { useSelectionStore } from '@/store/selection-store'
import { TreeItem } from './tree-item'

export function DeviceTree() {
  const { id: selectedId, select } = useSelectedDevice()
  const setHovered = useSelectionStore((s) => s.setHovered)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['portale']))

  const devices = allDevices().map((d) => d.meta)
  const byParent = new Map<string | null, typeof devices>()
  devices.forEach((d) => {
    const arr = byParent.get(d.parentId) ?? []
    arr.push(d)
    byParent.set(d.parentId, arr)
  })

  function render(parentId: string | null, depth = 0): React.ReactNode {
    const children = byParent.get(parentId) ?? []
    return children.map((meta) => {
      const kids = byParent.get(meta.id) ?? []
      const hasChildren = kids.length > 0
      const isOpen = expanded.has(meta.id)
      return (
        <div key={meta.id}>
          <TreeItem
            meta={meta}
            depth={depth}
            selected={selectedId === meta.id}
            hasChildren={hasChildren}
            expanded={isOpen}
            onToggle={() =>
              setExpanded((prev) => {
                const next = new Set(prev)
                if (next.has(meta.id)) next.delete(meta.id)
                else next.add(meta.id)
                return next
              })
            }
            onSelect={() => select(meta.id)}
            onHover={setHovered}
          />
          {hasChildren && isOpen && render(meta.id, depth + 1)}
        </div>
      )
    })
  }

  return <div className="flex flex-col gap-0.5">{render(null)}</div>
}
```

- [ ] **Step 3: Mount in `left-panel.tsx`**

Replace the `<ScrollArea>` placeholder content:

```tsx
import { DeviceTree } from './tree/device-tree'
// ...
<ScrollArea className="h-[440px] px-5 pb-5">
  <DeviceTree />
</ScrollArea>
```

- [ ] **Step 4: Visual + URL check**

`pnpm dev`. Click "Portale" — chevron rotates and Testa 1/Testa 2 appear. Click "Testa 1" — URL becomes `?device=portale-testa-1`; tree item highlights. Refresh page — selection persists. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): device tree with URL-driven selection + expand/collapse

Click toggles selection (URL update); chevron toggles expand state.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Stub panel + toolbar wiring

**Files:**
- Modify: `src/shell/right-panel.tsx`, `src/shell/bottom-toolbar.tsx`

- [ ] **Step 1: Wire RightPanel to selection**

```tsx
// src/shell/right-panel.tsx
import { X } from 'lucide-react'
import { useSelectedDevice } from '@/hooks/use-selected-device'

export function RightPanel() {
  const { device, clear } = useSelectedDevice()
  if (!device) return null

  const { Panel, meta } = device
  return (
    <div
      className="h-full w-[348px] m-5 ml-0 bg-[var(--bg-default)] rounded-[var(--radius-md)] flex flex-col overflow-hidden"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <header className="flex items-center justify-between border-b border-[var(--border-mute)] px-5 py-4">
        <span className="text-[18px] font-medium">{meta.label}</span>
        <button type="button" onClick={clear} aria-label="Close" className="grid h-8 w-8 place-items-center rounded hover:bg-[var(--bg-muted)]">
          <X size={20} />
        </button>
      </header>
      <div className="flex-1 overflow-auto">
        <Panel label={meta.label} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire BottomToolbar to selection**

```tsx
// src/shell/bottom-toolbar.tsx
import { useSelectedDevice } from '@/hooks/use-selected-device'

export function BottomToolbar() {
  const { device } = useSelectedDevice()
  if (!device) return null
  const { Toolbar } = device
  return (
    <div className="grid h-full place-items-center">
      <div
        className="h-[76px] min-w-[348px] bg-[var(--bg-default)] rounded-[var(--radius-md)] px-3 py-3"
        style={{ boxShadow: 'var(--shadow-demo)' }}
      >
        <Toolbar />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Visual check**

`pnpm dev`. Click any tree item — right panel slides in showing "Coming soon" + "Not implemented yet"; bottom pill says "No commands yet". Click X — panel and pill disappear; URL clears.

- [ ] **Step 4: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): right panel + bottom toolbar render device's Panel/Toolbar

Both unmount when nothing is selected; X clears the URL param.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.5 — 3D viewport load + render

### Task 19: Install R3F deps + base Canvas

**Files:**
- Create: `src/viewport/canvas.tsx`, `src/viewport/machine-model.tsx`, `src/viewport/assets/index.ts`
- Modify: `src/app.tsx`

- [ ] **Step 1: Install R3F**

```bash
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing three-stdlib camera-controls
pnpm add -D @types/three
```

- [ ] **Step 2: GLB loader**

```ts
// src/viewport/assets/index.ts
import { useGLTF } from '@react-three/drei'

export function preloadMachine() {
  useGLTF.preload('/models/machine.glb')
}

export function useMachineGLTF() {
  return useGLTF('/models/machine.glb', /* draco */ true, /* meshopt */ true)
}
```

- [ ] **Step 3: Machine model component**

```tsx
// src/viewport/machine-model.tsx
import { Suspense } from 'react'
import { useMachineGLTF } from './assets'

export function MachineModel() {
  const { scene } = useMachineGLTF()
  return <primitive object={scene} />
}

export function MachineModelSuspense() {
  return (
    <Suspense fallback={null}>
      <MachineModel />
    </Suspense>
  )
}
```

- [ ] **Step 4: Canvas shell**

```tsx
// src/viewport/canvas.tsx
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import { MachineModelSuspense } from './machine-model'

export function Viewport() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [8, 6, 10], fov: 35 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerspectiveCamera makeDefault position={[8, 6, 10]} fov={35} />
      <Environment preset="studio" background={false} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow={false} />
      <MachineModelSuspense />
      <ContactShadows position={[0, 0, 0]} opacity={0.35} blur={2.5} far={4} />
    </Canvas>
  )
}
```

- [ ] **Step 5: Mount in app**

In `src/app.tsx`, replace the placeholder viewport section:

```tsx
import { Viewport } from './viewport/canvas'
// ...
<section style={{ gridArea: 'left / left / bottom / right' }} className="relative">
  <Viewport />
</section>
```

- [ ] **Step 6: Verify**

`pnpm dev`. Expected: machine renders in viewport, lit, with contact shadow. Browser console may show GLB load timing. Stop dev.

- [ ] **Step 7: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(viewport): R3F Canvas + GLB load + studio IBL + contact shadows

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: PerfHud behind ?perf

**Files:**
- Create: `src/viewport/helpers/perf-hud.tsx`
- Modify: `src/viewport/canvas.tsx`

- [ ] **Step 1: Write PerfHud**

```tsx
// src/viewport/helpers/perf-hud.tsx
import { Stats } from '@react-three/drei'

export function PerfHud() {
  if (typeof window === 'undefined') return null
  const enabled = new URLSearchParams(window.location.search).has('perf')
  if (!enabled) return null
  return <Stats />
}
```

- [ ] **Step 2: Add to Canvas**

```tsx
// inside <Canvas>...
import { PerfHud } from './helpers/perf-hud'
// ...
<PerfHud />
```

- [ ] **Step 3: Verify**

Open http://localhost:5173/?perf — FPS panel appears top-left. Without `?perf`, no panel.

- [ ] **Step 4: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(viewport): PerfHud behind ?perf URL flag

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.6 — Mesh ↔ device mapping + hover

### Task 21: Build mesh index

**Files:**
- Create: `src/viewport/device-meshes.ts`, `src/viewport/device-meshes.test.ts`

- [ ] **Step 1: TDD — write the test**

```ts
// src/viewport/device-meshes.test.ts
import { describe, it, expect } from 'vitest'
import { Object3D, Mesh, BoxGeometry, MeshBasicMaterial } from 'three'
import { buildDeviceMeshIndex } from './device-meshes'

function mesh(name: string) {
  const m = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())
  m.name = name
  return m
}

describe('buildDeviceMeshIndex', () => {
  it('matches by exact name', () => {
    const scene = new Object3D()
    scene.add(mesh('Portale_Testa_1'))
    const index = buildDeviceMeshIndex(scene, [
      { id: 'portale-testa-1', meshNames: ['Portale_Testa_1'] },
    ])
    expect(index['portale-testa-1']?.meshes).toHaveLength(1)
  })

  it('matches by glob suffix', () => {
    const scene = new Object3D()
    scene.add(mesh('Portale_Testa_1'))
    scene.add(mesh('Portale_Testa_1_Sub'))
    const index = buildDeviceMeshIndex(scene, [
      { id: 'portale-testa-1', meshNames: ['Portale_Testa_1', 'Portale_Testa_1_*'] },
    ])
    expect(index['portale-testa-1']?.meshes).toHaveLength(2)
  })

  it('omits devices with no matches', () => {
    const scene = new Object3D()
    const index = buildDeviceMeshIndex(scene, [
      { id: 'robot', meshNames: ['Robot_*'] },
    ])
    expect(index.robot).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test --run src/viewport/device-meshes.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/viewport/device-meshes.ts
import { Box3, Object3D, Vector3, Mesh } from 'three'

interface DeviceWithMeshes {
  id: string
  meshNames?: string[]
}

export interface MeshIndexEntry {
  meshes: Mesh[]
  boundingBox: Box3
  center: Vector3
}

function nameMatches(name: string, pattern: string): boolean {
  if (!pattern.endsWith('*')) return name === pattern
  const prefix = pattern.slice(0, -1)
  return name.startsWith(prefix)
}

export function buildDeviceMeshIndex(
  scene: Object3D,
  devices: DeviceWithMeshes[],
): Record<string, MeshIndexEntry> {
  const meshesByName: Mesh[] = []
  scene.traverse((obj) => {
    if ((obj as Mesh).isMesh) meshesByName.push(obj as Mesh)
  })

  const out: Record<string, MeshIndexEntry> = {}
  for (const dev of devices) {
    const patterns = dev.meshNames ?? []
    if (patterns.length === 0) continue
    const matched = meshesByName.filter((m) => patterns.some((p) => nameMatches(m.name, p)))
    if (matched.length === 0) continue
    const bbox = new Box3()
    for (const m of matched) bbox.expandByObject(m)
    const center = new Vector3()
    bbox.getCenter(center)
    out[dev.id] = { meshes: matched, boundingBox: bbox, center }
  }
  return out
}
```

- [ ] **Step 4: Run, expect pass**

```bash
pnpm test --run src/viewport/device-meshes.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(viewport): mesh→device index with glob matching

buildDeviceMeshIndex walks scene, matches mesh names against
device meshNames patterns, computes bounding boxes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: Wire mesh index in MachineModel + dev-only mismatch report

**Files:**
- Modify: `src/viewport/machine-model.tsx`

- [ ] **Step 1: Add the index hook**

```tsx
// src/viewport/machine-model.tsx
import { Suspense, useEffect, useMemo } from 'react'
import { useMachineGLTF } from './assets'
import { allDevices } from '@/devices'
import { buildDeviceMeshIndex, type MeshIndexEntry } from './device-meshes'

export interface MachineModelProps {
  onIndex?: (index: Record<string, MeshIndexEntry>) => void
}

export function MachineModel({ onIndex }: MachineModelProps) {
  const { scene } = useMachineGLTF()
  const index = useMemo(
    () => buildDeviceMeshIndex(scene, allDevices().map((d) => d.meta)),
    [scene],
  )

  useEffect(() => {
    onIndex?.(index)
    if (import.meta.env.DEV) {
      const matched = Object.keys(index)
      const all = allDevices().map((d) => d.meta.id).filter((id) => id !== '_stub')
      const unmatched = all.filter((id) => !matched.includes(id))
      // eslint-disable-next-line no-console
      console.info('[viewport] mesh matches:', { matched, unmatched })
    }
  }, [index, onIndex])

  return <primitive object={scene} />
}

export function MachineModelSuspense(props: MachineModelProps) {
  return (
    <Suspense fallback={null}>
      <MachineModel {...props} />
    </Suspense>
  )
}
```

- [ ] **Step 2: Plumb index to a shared store**

Add to selection store:

```ts
// src/store/selection-store.ts (extend)
import { create } from 'zustand'
import type { MeshIndexEntry } from '@/viewport/device-meshes'

interface SelectionState {
  hoveredId: string | null
  setHovered: (id: string | null) => void
  meshIndex: Record<string, MeshIndexEntry>
  setMeshIndex: (i: Record<string, MeshIndexEntry>) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  hoveredId: null,
  setHovered: (hoveredId) => set({ hoveredId }),
  meshIndex: {},
  setMeshIndex: (meshIndex) => set({ meshIndex }),
}))
```

- [ ] **Step 3: Plumb in Canvas**

```tsx
// src/viewport/canvas.tsx — pass onIndex
import { useSelectionStore } from '@/store/selection-store'
// ...
const setMeshIndex = useSelectionStore((s) => s.setMeshIndex)
// ...
<MachineModelSuspense onIndex={setMeshIndex} />
```

(Hooks must be called inside the component body; move the `useSelectionStore` line into the `Viewport()` function.)

- [ ] **Step 4: Verify console log**

`pnpm dev`. Open DevTools console. Expected one log line `[viewport] mesh matches: { matched: [...], unmatched: [...] }`. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(viewport): expose mesh index via selection store + dev log

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: Hover + click outline

**Files:**
- Create: `src/viewport/outline.tsx`
- Modify: `src/viewport/canvas.tsx`, `src/viewport/machine-model.tsx`

- [ ] **Step 1: Outline component**

```tsx
// src/viewport/outline.tsx
import { Selection, Select, EffectComposer, Outline } from '@react-three/postprocessing'
import { useSelectionStore } from '@/store/selection-store'
import { useSelectedDevice } from '@/hooks/use-selected-device'

export function SelectionOutline({ children }: { children: React.ReactNode }) {
  const hoveredId = useSelectionStore((s) => s.hoveredId)
  const meshIndex = useSelectionStore((s) => s.meshIndex)
  const { id: selectedId } = useSelectedDevice()

  const selectedMeshes = selectedId ? meshIndex[selectedId]?.meshes ?? [] : []
  const hoveredMeshes = hoveredId && hoveredId !== selectedId ? meshIndex[hoveredId]?.meshes ?? [] : []

  return (
    <Selection>
      <EffectComposer multisampling={4} autoClear={false}>
        <Outline
          edgeStrength={2.5}
          visibleEdgeColor={0x14110f}
          hiddenEdgeColor={0x14110f}
          blur={false}
        />
      </EffectComposer>
      <Select enabled={selectedMeshes.length > 0}>
        {selectedMeshes.map((m, i) => (
          <primitive key={i} object={m} />
        ))}
      </Select>
      <Select enabled={hoveredMeshes.length > 0}>
        {hoveredMeshes.map((m, i) => (
          <primitive key={i} object={m} />
        ))}
      </Select>
      {children}
    </Selection>
  )
}
```

- [ ] **Step 2: Wrap MachineModel in canvas**

```tsx
// src/viewport/canvas.tsx
import { SelectionOutline } from './outline'
// ...
<SelectionOutline>
  <MachineModelSuspense onIndex={setMeshIndex} />
</SelectionOutline>
```

- [ ] **Step 3: Pointer events on meshes**

In `machine-model.tsx`, add hover/click on the primitive scene by listening at the scene root and walking up to find the matching device:

```tsx
// src/viewport/machine-model.tsx (modify primitive)
import type { ThreeEvent } from '@react-three/fiber'
import { useSelectionStore } from '@/store/selection-store'
import { useSelectedDevice } from '@/hooks/use-selected-device'

// inside MachineModel(), after useEffect:
const setHovered = useSelectionStore((s) => s.setHovered)
const { select } = useSelectedDevice()

function findDeviceIdForMesh(meshName: string, idx: Record<string, MeshIndexEntry>): string | null {
  for (const [id, entry] of Object.entries(idx)) {
    if (entry.meshes.some((m) => m.name === meshName)) return id
  }
  return null
}

function onPointerOver(e: ThreeEvent<PointerEvent>) {
  e.stopPropagation()
  const name = (e.object as { name: string }).name
  setHovered(findDeviceIdForMesh(name, index))
}
function onPointerOut() { setHovered(null) }
function onClick(e: ThreeEvent<MouseEvent>) {
  e.stopPropagation()
  const name = (e.object as { name: string }).name
  const id = findDeviceIdForMesh(name, index)
  if (id) select(id)
}

return <primitive object={scene} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick} />
```

- [ ] **Step 4: Verify**

`pnpm dev`. Hover the machine — cursor becomes pointer over matched parts; outline appears on hovered mesh. Click a part — URL gets `?device=...`; right panel opens (stub). Hover then click a different part — selection changes. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(viewport): outline-based hover + click selection

Hover sets selectionStore.hoveredId; click pushes URL via useSelectedDevice.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.7 — Camera animation

### Task 24: capture-view helper

**Files:**
- Create: `src/viewport/helpers/capture-view.ts`, `src/viewport/helpers/capture-view.test.ts`

- [ ] **Step 1: TDD — write the test**

```ts
// src/viewport/helpers/capture-view.test.ts
import { describe, it, expect } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { captureView } from './capture-view'

describe('captureView', () => {
  it('captures position + target', () => {
    const cam = new PerspectiveCamera()
    cam.position.set(8, 6, 10)
    const target = new Vector3(0, 0, 0)
    const view = captureView(cam, target)
    expect(view.position).toEqual([8, 6, 10])
    expect(view.target).toEqual([0, 0, 0])
  })
})
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test --run src/viewport/helpers/capture-view.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/viewport/helpers/capture-view.ts
import type { Camera, Vector3 } from 'three'

export interface CapturedView {
  position: [number, number, number]
  target: [number, number, number]
}

export function captureView(cam: Camera, target: Vector3): CapturedView {
  return {
    position: [cam.position.x, cam.position.y, cam.position.z],
    target: [target.x, target.y, target.z],
  }
}
```

- [ ] **Step 4: Run, expect pass**

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(viewport): captureView helper

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 25: CameraControls + fit-to-box on select / return on close

**Files:**
- Create: `src/viewport/camera.tsx`
- Modify: `src/viewport/canvas.tsx`

- [ ] **Step 1: Write camera component**

```tsx
// src/viewport/camera.tsx
import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useSelectionStore } from '@/store/selection-store'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { captureView, type CapturedView } from './helpers/capture-view'

export function Camera() {
  const ref = useRef<CameraControls | null>(null)
  const meshIndex = useSelectionStore((s) => s.meshIndex)
  const { id: selectedId } = useSelectedDevice()
  const home = useRef<CapturedView | null>(null)
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as CameraControls | null

  useEffect(() => {
    const cc = ref.current ?? controls
    if (!cc) return

    if (!home.current) {
      // capture initial home view once
      const target = cc.getTarget(new (camera as any).position.constructor())
      home.current = captureView(camera, target as any)
    }

    if (selectedId) {
      const entry = meshIndex[selectedId]
      if (!entry) return
      cc.fitToBox(entry.boundingBox, /* enableTransition */ true, {
        paddingLeft: 0.2,
        paddingRight: 0.2,
        paddingTop: 0.2,
        paddingBottom: 0.2,
      })
    } else if (home.current) {
      const [px, py, pz] = home.current.position
      const [tx, ty, tz] = home.current.target
      cc.setLookAt(px, py, pz, tx, ty, tz, true)
    }
  }, [selectedId, meshIndex, camera, controls])

  return <CameraControls ref={ref} makeDefault smoothTime={0.25} />
}
```

- [ ] **Step 2: Mount in canvas**

```tsx
// src/viewport/canvas.tsx (remove old PerspectiveCamera + OrbitControls if any)
import { Camera } from './camera'
// inside <Canvas>:
<PerspectiveCamera makeDefault position={[8, 6, 10]} fov={35} />
<Camera />
```

- [ ] **Step 3: Verify motion**

`pnpm dev`. Click a tree item — camera smoothly zooms to that part. Click another — interpolates between framings. Click X in right panel — camera returns to original home. Drag in viewport to orbit — works. Stop dev.

- [ ] **Step 4: Invoke emil-design-eng for motion review**

Run the `emil-design-eng` skill against the camera animation. Tune `smoothTime` (current 0.25), padding (0.2), and edge cases (rapid selection switches). Apply changes inline.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(viewport): camera fit-to-box on select, return on close

CameraControls with smoothTime 0.25; home view captured once.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.8 — Portale Testa 1 state + tick

### Task 26: animate-value helper

**Files:**
- Create: `src/lib/animate-value.ts`, `src/lib/animate-value.test.ts`

- [ ] **Step 1: TDD — test**

```ts
// src/lib/animate-value.test.ts
import { describe, it, expect } from 'vitest'
import { lerpToward } from './animate-value'

describe('lerpToward', () => {
  it('moves toward target by rate * dt', () => {
    expect(lerpToward(0, 10, 0.5, 100)).toBeCloseTo(5, 5)
  })
  it('snaps when within epsilon', () => {
    expect(lerpToward(9.9999, 10, 0.5, 100)).toBe(10)
  })
  it('clamps overshoot', () => {
    expect(lerpToward(9, 10, 10, 1000)).toBe(10)
  })
})
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test --run src/lib/animate-value.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/lib/animate-value.ts
/**
 * Move `current` toward `target` at `rate` per second, given `dtMs`.
 * Snaps to target when within `eps`.
 */
export function lerpToward(current: number, target: number, rate: number, dtMs: number, eps = 0.001): number {
  const dt = dtMs / 1000
  const step = rate * dt
  if (Math.abs(target - current) <= Math.max(eps, step)) return target
  return current + Math.sign(target - current) * step
}
```

- [ ] **Step 4: Run, expect pass**

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(lib): lerpToward helper for smooth value animation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 27: machine store + tick loop

**Files:**
- Create: `src/store/machine-store.ts`

- [ ] **Step 1: Write the store**

```ts
// src/store/machine-store.ts
import { create } from 'zustand'

export interface MachineState {
  devices: Record<string, unknown>
  setDevice<T>(id: string, next: T): void
  patchDevice<T extends object>(id: string, patch: Partial<T>): void
  tick: number
}

export const useMachineStore = create<MachineState>((set) => ({
  devices: {},
  tick: 0,
  setDevice: (id, next) =>
    set((s) => ({ devices: { ...s.devices, [id]: next } })),
  patchDevice: (id, patch) =>
    set((s) => ({
      devices: {
        ...s.devices,
        [id]: { ...(s.devices[id] as object), ...patch },
      },
    })),
}))

const TICK_MS = 100
let interval: ReturnType<typeof setInterval> | null = null
const tickers: Array<(dtMs: number) => void> = []

export function registerTicker(fn: (dtMs: number) => void): () => void {
  tickers.push(fn)
  if (!interval) {
    interval = setInterval(() => {
      for (const t of tickers) t(TICK_MS)
      useMachineStore.setState((s) => ({ tick: s.tick + 1 }))
    }, TICK_MS)
  }
  return () => {
    const i = tickers.indexOf(fn)
    if (i >= 0) tickers.splice(i, 1)
    if (tickers.length === 0 && interval) {
      clearInterval(interval)
      interval = null
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(store): machine store with shared 100ms tick loop

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 28: Portale Testa 1 state + tick

**Files:**
- Create: `src/devices/portale-testa-1/state.ts`, `src/devices/portale-testa-1/state.test.ts`
- Modify: `src/devices/portale-testa-1/meta.ts`

- [ ] **Step 1: TDD — test the tick math**

```ts
// src/devices/portale-testa-1/state.test.ts
import { describe, it, expect } from 'vitest'
import { initialState, applyTick, type PortaleTesta1State } from './state'

describe('portale-testa-1 tick', () => {
  it('drifts x toward target', () => {
    const s: PortaleTesta1State = { ...initialState, position: { x: 1264, y: 514, z: 92 } }
    const next = applyTick(s, 100)
    expect(next.position.x).not.toBe(1264)
  })
  it('keeps idLavoro stable across ticks', () => {
    const s = applyTick(initialState, 100)
    expect(s.lavorazione?.idLavoro).toBe(initialState.lavorazione?.idLavoro)
  })
})
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test --run src/devices/portale-testa-1/state.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/devices/portale-testa-1/state.ts
import { z } from 'zod'
import { lerpToward } from '@/lib/animate-value'

export const portaleTesta1Schema = z.object({
  kind: z.literal('portale-testa-1'),
  id: z.literal('portale-testa-1'),
  label: z.string(),
  parentId: z.string().nullable(),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string().optional(),
  codiceErrori: z.array(z.string()).optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  positionTarget: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  lavorazione: z.object({
    idLavoro: z.string(),
    idLastra: z.string(),
    indiceForo: z.string(),
    inizio: z.number(),
    finePrec: z.number().nullable(),
  }).nullable(),
  tenuta: z.object({
    codiceStato: z.string(),
    livelloDepressione: z.number(),
    modalita: z.enum(['soffio', 'aspirazione', 'niente']),
  }),
  erogatore: z.object({
    stato: z.enum(['aperto', 'chiuso']),
  }),
})
export type PortaleTesta1State = z.infer<typeof portaleTesta1Schema>

export const initialState: PortaleTesta1State = {
  kind: 'portale-testa-1',
  id: 'portale-testa-1',
  label: 'Testa 1',
  parentId: 'portale',
  status: 'active',
  position: { x: 1264.0, y: 514.2, z: 92.0 },
  positionTarget: { x: 1264.0, y: 514.2, z: 92.0 },
  lavorazione: {
    idLavoro: 'JOB-0430',
    idLastra: 'L-2403-117',
    indiceForo: 'F-023',
    inizio: Date.now(),
    finePrec: null,
  },
  tenuta: { codiceStato: 'OK', livelloDepressione: 0.82, modalita: 'aspirazione' },
  erogatore: { stato: 'chiuso' },
}

let secsSinceTargetRoll = 0
let secsSinceForoBump = 0
const RATE_MM_PER_SEC = 18

export function applyTick(prev: PortaleTesta1State, dtMs: number): PortaleTesta1State {
  const dt = dtMs / 1000
  secsSinceTargetRoll += dt
  secsSinceForoBump += dt

  let posT = prev.positionTarget
  if (secsSinceTargetRoll >= 4) {
    secsSinceTargetRoll = 0
    posT = {
      x: prev.position.x + (Math.random() - 0.5) * 4,
      y: prev.position.y + (Math.random() - 0.5) * 4,
      z: prev.position.z + (Math.random() - 0.5) * 1,
    }
  }
  const position = {
    x: lerpToward(prev.position.x, posT.x, RATE_MM_PER_SEC, dtMs),
    y: lerpToward(prev.position.y, posT.y, RATE_MM_PER_SEC, dtMs),
    z: lerpToward(prev.position.z, posT.z, RATE_MM_PER_SEC, dtMs),
  }

  let lavorazione = prev.lavorazione
  if (lavorazione && secsSinceForoBump >= 12) {
    secsSinceForoBump = 0
    const n = Number(lavorazione.indiceForo.replace('F-', ''))
    lavorazione = { ...lavorazione, indiceForo: `F-${String(n + 1).padStart(3, '0')}` }
  }

  const livello = Math.max(0.4, Math.min(1, prev.tenuta.livelloDepressione + (Math.random() - 0.5) * 0.04))

  return {
    ...prev,
    position,
    positionTarget: posT,
    lavorazione,
    tenuta: { ...prev.tenuta, livelloDepressione: livello },
  }
}
```

- [ ] **Step 4: Wire into machine store at app start**

Add to `meta.ts`:

```ts
// src/devices/portale-testa-1/meta.ts
import type { DeviceMeta } from '@/types'
export const meta: DeviceMeta = {
  id: 'portale-testa-1',
  label: 'Testa 1',
  parentId: 'portale',
  meshNames: ['Portale_Testa_1', 'Portale_Testa_1_*'],
}
```

Create a registration hook used by `App`:

```ts
// src/devices/portale-testa-1/register.ts
import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import { applyTick, initialState } from './state'

export function useRegisterPortaleTesta1() {
  useEffect(() => {
    useMachineStore.getState().setDevice('portale-testa-1', initialState)
    const unsub = registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['portale-testa-1'] as ReturnType<typeof applyTick>
      if (!prev) return
      s.setDevice('portale-testa-1', applyTick(prev, dt))
    })
    return unsub
  }, [])
}
```

Mount in `app.tsx`:

```tsx
import { useRegisterPortaleTesta1 } from './devices/portale-testa-1/register'
// at the top of App():
useRegisterPortaleTesta1()
```

- [ ] **Step 5: Run, expect tests pass**

```bash
pnpm test --run src/devices/portale-testa-1
```

- [ ] **Step 6: Verify in browser**

`pnpm dev`. Open DevTools → React DevTools → inspect `useMachineStore`. Expected: `devices['portale-testa-1'].position.x` changes every ~100ms. Stop dev.

- [ ] **Step 7: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(portale-testa-1): state schema + tick (drift, indice foro, depressione)

Initial values match Figma reference (JOB-0430, L-2403-117, F-023, 1264/514.2/92.0).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Install zod first if missing:

```bash
pnpm add zod
```

---

## Milestone G.9 — Portale Testa 1 right panel

### Task 29: Text + StatusBadge + Icon primitives

**Files:**
- Create: `src/components/primitives/text.tsx`, `src/components/primitives/status-badge.tsx`, `src/components/primitives/icon.tsx`

- [ ] **Step 1: Text primitive**

```tsx
// src/components/primitives/text.tsx
import type { JSX } from 'react'
import { cn } from '@/lib/cn'

type Variant =
  | '3xl/medium' | 'xl/medium' | 'lg/medium'
  | 'sm/medium' | 'sm/normal' | 'xs/medium'

const styles: Record<Variant, string> = {
  '3xl/medium': 'text-[30px] leading-9 font-medium tracking-[-0.033em]',
  'xl/medium':  'text-[20px] leading-7 font-medium',
  'lg/medium':  'text-[18px] leading-7 font-medium',
  'sm/medium':  'text-[14px] leading-5 font-medium',
  'sm/normal':  'text-[14px] leading-5 font-normal',
  'xs/medium':  'text-[12px] leading-4 font-medium tracking-[0.143em]',
}

interface Props extends React.HTMLAttributes<HTMLElement> {
  variant: Variant
  as?: keyof JSX.IntrinsicElements
  uppercase?: boolean
}

export function Text({ variant, as: As = 'span', uppercase, className, ...rest }: Props) {
  const Component = As as any
  return <Component className={cn(styles[variant], uppercase && 'uppercase', className)} {...rest} />
}
```

- [ ] **Step 2: StatusBadge**

```tsx
// src/components/primitives/status-badge.tsx
import { cn } from '@/lib/cn'
import type { DeviceStatus } from '@/types'

const styles: Record<DeviceStatus, { bg: string; dot: string; text: string }> = {
  active:  { bg: 'bg-[var(--bg-badge-green)]', dot: 'bg-[var(--status-active)]',  text: 'text-[var(--text-success)]' },
  idle:    { bg: 'bg-[var(--bg-muted)]',       dot: 'bg-[var(--status-idle)]',    text: 'text-[var(--text-muted)]' },
  warning: { bg: 'bg-[var(--bg-muted)]',       dot: 'bg-[var(--status-warning)]', text: 'text-[var(--text-default)]' },
  error:   { bg: 'bg-[var(--bg-badge-red)]',   dot: 'bg-[var(--status-error)]',   text: 'text-[var(--bg-state-danger)]' },
  offline: { bg: 'bg-[var(--bg-muted)]',       dot: 'bg-[var(--status-offline)]', text: 'text-[var(--text-muted)]' },
}

export function StatusBadge({ status, children }: { status: DeviceStatus; children: React.ReactNode }) {
  const s = styles[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium', s.bg, s.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {children}
    </span>
  )
}
```

- [ ] **Step 3: Icon wrapper (forces currentColor + 20px)**

```tsx
// src/components/primitives/icon.tsx
import type { LucideProps } from 'lucide-react'
export function Icon({ as: As, size = 20, ...props }: { as: React.ComponentType<LucideProps>; size?: number } & LucideProps) {
  return <As size={size} {...props} />
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(primitives): Text variants + StatusBadge + Icon wrapper

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 30: DataRow + DataSection patterns

**Files:**
- Create: `src/components/patterns/data-row.tsx`, `src/components/patterns/data-section.tsx`

- [ ] **Step 1: DataRow**

```tsx
// src/components/patterns/data-row.tsx
import { Text } from '@/components/primitives/text'

export function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <Text variant="sm/normal" className="text-[var(--text-muted)]">{label}</Text>
      <Text variant="sm/normal" className="text-[var(--text-default)] tabular-nums">{value}</Text>
    </div>
  )
}
```

- [ ] **Step 2: DataSection**

```tsx
// src/components/patterns/data-section.tsx
import { Text } from '@/components/primitives/text'

export function DataSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--border-mute)] last:border-b-0">
      <header className="px-3 pt-3 pb-2">
        <Text variant="sm/medium">{title}</Text>
      </header>
      <div className="pb-3">{children}</div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(patterns): DataRow + DataSection

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 31: format helpers + use-device-state hook

**Files:**
- Create: `src/lib/format.ts`, `src/hooks/use-device-state.ts`

- [ ] **Step 1: format helpers**

```ts
// src/lib/format.ts
export function formatMm(n: number): string {
  return `${n.toFixed(1)} mm`
}
export function formatTime(epochMs: number | null): string {
  if (!epochMs) return '—'
  const d = new Date(epochMs)
  return d.toTimeString().slice(0, 8)
}
export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}
```

- [ ] **Step 2: hook**

```ts
// src/hooks/use-device-state.ts
import { useMachineStore } from '@/store/machine-store'

export function useDeviceState<T>(id: string): T | undefined {
  return useMachineStore((s) => s.devices[id] as T | undefined)
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(lib): format helpers + useDeviceState hook

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 32: Portale Testa 1 right panel

**Files:**
- Create: `src/devices/portale-testa-1/panel.tsx`, `src/devices/portale-testa-1/panel.test.tsx`
- Modify: `src/devices/index.ts`

- [ ] **Step 1: Write the panel**

```tsx
// src/devices/portale-testa-1/panel.tsx
import { useDeviceState } from '@/hooks/use-device-state'
import { DataSection } from '@/components/patterns/data-section'
import { DataRow } from '@/components/patterns/data-row'
import { StatusBadge } from '@/components/primitives/status-badge'
import { formatMm, formatPercent, formatTime } from '@/lib/format'
import type { PortaleTesta1State } from './state'

export function Panel() {
  const s = useDeviceState<PortaleTesta1State>('portale-testa-1')
  if (!s) return null
  return (
    <div className="flex flex-col">
      <div className="px-5 pt-4 pb-3">
        <StatusBadge status={s.status}>{s.status === 'active' ? 'Attivo' : s.status}</StatusBadge>
      </div>
      <DataSection title="Coordinate">
        <DataRow label="X" value={formatMm(s.position.x)} />
        <DataRow label="Y" value={formatMm(s.position.y)} />
        <DataRow label="Z" value={formatMm(s.position.z)} />
      </DataSection>
      {s.lavorazione && (
        <DataSection title="Sistema di insertatura">
          <DataRow label="ID lavoro" value={s.lavorazione.idLavoro} />
          <DataRow label="ID lastra" value={s.lavorazione.idLastra} />
          <DataRow label="Indice foro" value={s.lavorazione.indiceForo} />
          <DataRow label="Inizio / fine" value={formatTime(s.lavorazione.inizio)} />
        </DataSection>
      )}
      <DataSection title="Sistema di prova tenuta">
        <DataRow label="Codice stato" value={s.tenuta.codiceStato} />
        <DataRow label="Livello depressione" value={formatPercent(s.tenuta.livelloDepressione)} />
        <DataRow label="Modalità" value={s.tenuta.modalita} />
      </DataSection>
      <DataSection title="Erogatore (resina)">
        <DataRow label="Stato" value={s.erogatore.stato} />
      </DataSection>
    </div>
  )
}
```

- [ ] **Step 2: Register the panel in the registry**

Edit `src/devices/index.ts`:

```ts
import { Panel as PortaleTesta1Panel } from './portale-testa-1/panel'
// ...
'portale-testa-1': {
  meta: portaleTesta1.meta,
  Panel: PortaleTesta1Panel as React.ComponentType<{ label: string }>,
  Toolbar: StubToolbar,
},
```

- [ ] **Step 3: Verify**

`pnpm dev`. Click Testa 1 in the tree. Expected: right panel shows live-ticking X/Y/Z, JOB-0430, L-2403-117, indice foro that increments, depressione %, modalità, erogatore stato. Stop dev.

- [ ] **Step 4: Add a unit test for the panel**

```tsx
// src/devices/portale-testa-1/panel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta1 Panel', () => {
  it('renders coordinate, insertatura, tenuta, erogatore sections', () => {
    useMachineStore.getState().setDevice('portale-testa-1', initialState)
    render(<Panel />)
    expect(screen.getByText('Coordinate')).toBeInTheDocument()
    expect(screen.getByText('Sistema di insertatura')).toBeInTheDocument()
    expect(screen.getByText('Sistema di prova tenuta')).toBeInTheDocument()
    expect(screen.getByText('Erogatore (resina)')).toBeInTheDocument()
    expect(screen.getByText('JOB-0430')).toBeInTheDocument()
  })
})
```

Run:

```bash
pnpm test --run src/devices/portale-testa-1/panel.test.tsx
```

Expected: 1 test passes.

- [ ] **Step 5: Invoke impeccable on the panel**

Run the `impeccable` skill against the right panel. Capture typographic rhythm, density, hierarchy critique. Apply changes inline.

- [ ] **Step 6: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(portale-testa-1): right panel with live data + impeccable pass

Sections: Coordinate, Sistema di insertatura, Tenuta, Erogatore.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.10 — Bottom toolbar + commands

### Task 33: role-gate + role/mode stores

**Files:**
- Create: `src/lib/role-gate.ts`, `src/lib/role-gate.test.ts`, `src/store/role-store.ts`, `src/store/mode-store.ts`

- [ ] **Step 1: TDD — role-gate test**

```ts
// src/lib/role-gate.test.ts
import { describe, it, expect } from 'vitest'
import { canRunCommand } from './role-gate'

describe('canRunCommand', () => {
  it('operatore cannot run admin command', () => {
    expect(canRunCommand({ requiredRole: 'admin' }, 'operatore')).toBe(false)
  })
  it('admin can run operatore command', () => {
    expect(canRunCommand({ requiredRole: 'operatore' }, 'admin')).toBe(true)
  })
  it('superadmin can run anything', () => {
    expect(canRunCommand({ requiredRole: 'superadmin' }, 'superadmin')).toBe(true)
    expect(canRunCommand({ requiredRole: 'admin' },      'superadmin')).toBe(true)
    expect(canRunCommand({ requiredRole: 'operatore' },  'superadmin')).toBe(true)
  })
})
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test --run src/lib/role-gate.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/lib/role-gate.ts
import type { Role } from '@/types'

const rank: Record<Role, number> = { operatore: 0, admin: 1, superadmin: 2 }

export function canRunCommand(cmd: { requiredRole: Role }, current: Role): boolean {
  return rank[current] >= rank[cmd.requiredRole]
}
```

- [ ] **Step 4: Stores with persist middleware**

```ts
// src/store/role-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types'

export const useRoleStore = create<{ role: Role; setRole: (r: Role) => void }>()(
  persist(
    (set) => ({ role: 'superadmin', setRole: (role) => set({ role }) }),
    { name: 'flexpin1.role' },
  ),
)
```

```ts
// src/store/mode-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useModeStore = create<{ mode: 'auto' | 'manuale'; setMode: (m: 'auto' | 'manuale') => void }>()(
  persist(
    (set) => ({ mode: 'manuale', setMode: (mode) => set({ mode }) }),
    { name: 'flexpin1.mode' },
  ),
)
```

- [ ] **Step 5: Run tests, expect pass**

- [ ] **Step 6: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(lib+store): role-gate + role/mode persisted stores

Default role=superadmin, mode=manuale.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 34: CommandButton pattern

**Files:**
- Create: `src/components/patterns/command-button.tsx`, `src/hooks/use-command-dispatch.ts`
- Add shadcn AlertDialog: `pnpm dlx shadcn@latest add alert-dialog`

- [ ] **Step 1: Dispatch hook**

```ts
// src/hooks/use-command-dispatch.ts
import { useCallback } from 'react'
import { useRoleStore } from '@/store/role-store'
import { useModeStore } from '@/store/mode-store'
import { canRunCommand } from '@/lib/role-gate'
import type { Command } from '@/types'

export function useCommandDispatch() {
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)

  const dispatch = useCallback(
    async (cmd: Command, deviceId: string) => {
      if (!canRunCommand(cmd, role)) {
        // eslint-disable-next-line no-console
        console.warn(`[command] denied: ${cmd.id} requires ${cmd.requiredRole}, current is ${role}`)
        return
      }
      if (cmd.manualOnly && mode !== 'manuale') return
      await cmd.handler({ deviceId, role, mode })
    },
    [role, mode],
  )

  return { dispatch, role, mode }
}
```

- [ ] **Step 2: CommandButton**

```tsx
// src/components/patterns/command-button.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { canRunCommand } from '@/lib/role-gate'
import { useRoleStore } from '@/store/role-store'
import { useModeStore } from '@/store/mode-store'
import type { Command } from '@/types'

export function CommandButton({ command, deviceId }: { command: Command; deviceId: string }) {
  const { dispatch } = useCommandDispatch()
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)
  const [open, setOpen] = useState(false)

  const disabled = !canRunCommand(command, role) || (command.manualOnly && mode !== 'manuale')

  if (command.requiresConfirm) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button disabled={disabled} variant={command.destructive ? 'destructive' : 'default'} className="h-[52px] min-w-[156px]">
            {command.label}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{command.label}</AlertDialogTitle>
            {command.description && <AlertDialogDescription>{command.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => dispatch(command, deviceId)}>Conferma</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  return (
    <Button
      disabled={disabled}
      variant={command.destructive ? 'destructive' : 'default'}
      className="h-[52px] min-w-[156px]"
      onClick={() => dispatch(command, deviceId)}
    >
      {command.label}
    </Button>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(patterns): CommandButton with role/mode gate + confirm dialog

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 35: Portale Testa 1 commands + toolbar

**Files:**
- Create: `src/devices/portale-testa-1/commands.ts`, `src/devices/portale-testa-1/toolbar.tsx`
- Modify: `src/devices/index.ts`

- [ ] **Step 1: Commands**

```ts
// src/devices/portale-testa-1/commands.ts
import type { Command } from '@/types'
import { useMachineStore } from '@/store/machine-store'
import type { PortaleTesta1State } from './state'

const REST_1 = { x: 0,    y: 0,   z: 0 }
const REST_2 = { x: 3500, y: 0,   z: 0 }

function setTarget(target: typeof REST_1) {
  const s = useMachineStore.getState()
  const prev = s.devices['portale-testa-1'] as PortaleTesta1State | undefined
  if (!prev) return
  s.setDevice('portale-testa-1', { ...prev, positionTarget: target })
}

export const commands: Command[] = [
  {
    id: 'portale-testa-1.riposo-1',
    label: 'Riposo 1',
    description: 'Sposta la testa fuori ingombro 1',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => setTarget(REST_1),
  },
  {
    id: 'portale-testa-1.riposo-2',
    label: 'Riposo 2',
    description: 'Sposta la testa fuori ingombro 2',
    requiredRole: 'operatore',
    manualOnly: true,
    destructive: true,
    handler: () => setTarget(REST_2),
  },
]
```

- [ ] **Step 2: Toolbar**

```tsx
// src/devices/portale-testa-1/toolbar.tsx
import { CommandButton } from '@/components/patterns/command-button'
import { commands } from './commands'

export function Toolbar() {
  return (
    <div className="flex h-full items-center justify-center gap-3">
      {commands.map((c) => (
        <CommandButton key={c.id} command={c} deviceId="portale-testa-1" />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Register in `src/devices/index.ts`**

```ts
import { Toolbar as PortaleTesta1Toolbar } from './portale-testa-1/toolbar'
// ...
'portale-testa-1': {
  meta: portaleTesta1.meta,
  Panel: PortaleTesta1Panel as React.ComponentType<{ label: string }>,
  Toolbar: PortaleTesta1Toolbar,
},
```

- [ ] **Step 4: Verify**

`pnpm dev`. Click Testa 1. Two big buttons appear at bottom — "Riposo 1" (dark) and "Riposo 2" (red). Click Riposo 1 → X/Y/Z values animate down to ~0 in the panel above. Click Riposo 2 → values animate to 3500/0/0.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(portale-testa-1): Riposo 1 + Riposo 2 commands and bottom toolbar

Commands set a new positionTarget; the existing tick animates toward it.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.11 — TopBar wiring

### Task 36: Bind TopBar chips to live status

**Files:**
- Modify: `src/shell/top-bar.tsx`

- [ ] **Step 1: Make chips clickable and read live status**

```tsx
// src/shell/top-bar.tsx
import { Badge } from '@/components/ui/badge'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { useDeviceState } from '@/hooks/use-device-state'
import type { PortaleTesta1State } from '@/devices/portale-testa-1/state'

function Chip({ label, primary, deviceId, secondaryItems = [] }: { label: string; primary: string; deviceId?: string; secondaryItems?: string[] }) {
  const { select } = useSelectedDevice()
  const state = useDeviceState<{ status?: string }>(deviceId ?? '__none__')
  return (
    <button
      type="button"
      onClick={() => deviceId && select(deviceId)}
      className="flex flex-col gap-2 px-6 py-4 border-r border-[var(--border-mute)] min-w-[200px] text-left hover:bg-[var(--bg-muted)] transition"
    >
      <span className="text-[12px] font-medium tracking-[0.143em] uppercase text-[var(--text-muted)]">{label}</span>
      <span className="text-[14px] font-medium text-[var(--text-default)] truncate">{primary}</span>
      <div className="flex gap-2 flex-wrap">
        {secondaryItems.map((s) => (
          <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
        ))}
        {state?.status && (
          <Badge variant="outline" className="font-normal">{state.status}</Badge>
        )}
      </div>
    </button>
  )
}

export function TopBar() {
  const testa1 = useDeviceState<PortaleTesta1State>('portale-testa-1')
  return (
    <div className="flex items-stretch h-full">
      <Chip label="Ricetta" primary="Lastra 1500x450x6 Gress Rosso" secondaryItems={['F3Y1080.1', 'Flex 3', 'Visualizza Ordini']} />
      <Chip label="Robot" primary="L12 - Insertatura" deviceId="robot" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip
        label="Portale - Testa 1"
        primary={testa1?.lavorazione ? `${testa1.lavorazione.idLavoro} - Insertatura` : 'L12 - Insertatura'}
        deviceId="portale-testa-1"
        secondaryItems={[testa1?.lavorazione?.idLastra ?? 'Lastra 1', testa1?.lavorazione?.indiceForo ?? 'Foro 2']}
      />
      <Chip label="Portale - Testa 2" primary="L12 - Insertatura" deviceId="portale-testa-2" secondaryItems={['Lastra 1', 'Foro 2']} />
      <Chip label="Speed" primary="L1 - Foratura" deviceId="speed" secondaryItems={['Lastra 1', 'Foro 2']} />
    </div>
  )
}
```

- [ ] **Step 2: Verify**

`pnpm dev`. Watch the "Portale - Testa 1" chip — its "Foro F-XXX" badge updates every ~12s as the tick increments. Click the chip → tree selects Testa 1, right panel opens. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
feat(shell): TopBar chips clickable + live status for Portale Testa 1

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.12 — Tests + visual baseline

### Task 37: Playwright config + shell e2e

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/shell.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 2: Config**

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
```

- [ ] **Step 3: Shell e2e**

```ts
// tests/e2e/shell.spec.ts
import { test, expect } from '@playwright/test'

test('shell renders TopBar, LeftPanel, Viewport', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Flex 3')).toBeVisible()         // recipe chip
  await expect(page.getByText('FlexPin')).toBeVisible()        // left panel headline
  await expect(page.getByText('Attivo')).toBeVisible()         // active badge
  // canvas exists
  await expect(page.locator('canvas')).toBeVisible()
})

test('tree expands Portale and selects Testa 1', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Portale' }).click()  // expand
  await page.getByRole('button', { name: 'Testa 1' }).click()  // select
  await expect(page).toHaveURL(/device=portale-testa-1/)
})
```

- [ ] **Step 4: Add script**

In `package.json`:

```jsonc
"test:e2e": "playwright test",
"test:visual": "playwright test --grep @visual"
```

- [ ] **Step 5: Run**

```bash
pnpm test:e2e tests/e2e/shell.spec.ts
```

Expected: both tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
test(e2e): Playwright config + shell + tree selection coverage

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 38: Portale Testa 1 flow e2e

**Files:**
- Create: `tests/e2e/portale-testa-1.spec.ts`

- [ ] **Step 1: Write the flow**

```ts
// tests/e2e/portale-testa-1.spec.ts
import { test, expect } from '@playwright/test'

test('Portale Testa 1: select → panel → command → close', async ({ page }) => {
  await page.goto('/?device=portale-testa-1')
  await expect(page.getByText('Coordinate')).toBeVisible()
  await expect(page.getByText('Sistema di insertatura')).toBeVisible()
  await expect(page.getByText('JOB-0430')).toBeVisible()

  // X value present
  await expect(page.getByText(/^X$/)).toBeVisible()
  await expect(page.getByText(/mm/).first()).toBeVisible()

  // Riposo 1 command
  await page.getByRole('button', { name: 'Riposo 1' }).click()
  // wait for X to drift below initial 1264
  await page.waitForFunction(
    () => {
      const cells = Array.from(document.querySelectorAll('div')).map((d) => d.textContent ?? '')
      const xCell = cells.find((t) => /^\d+\.\d mm$/.test(t.trim()))
      if (!xCell) return false
      return parseFloat(xCell) < 1264
    },
    { timeout: 4000 },
  )

  // Close panel
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page).toHaveURL(/^http:\/\/localhost:5173\/?$/)
})
```

- [ ] **Step 2: Run**

```bash
pnpm test:e2e tests/e2e/portale-testa-1.spec.ts
```

Expected: 1 test passes.

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
test(e2e): Portale Testa 1 select/panel/command/close flow

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 39: Visual baseline snapshot

**Files:**
- Create: `tests/visual/shell.snap.spec.ts`

- [ ] **Step 1: Write a snapshot test**

```ts
// tests/visual/shell.snap.spec.ts
import { test, expect } from '@playwright/test'

test('@visual shell baseline at 1920x1080', async ({ page }) => {
  await page.goto('/')
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(1500) // let GLB settle
  await expect(page).toHaveScreenshot('shell.png', { maxDiffPixels: 200 })
})

test('@visual Portale Testa 1 selected', async ({ page }) => {
  await page.goto('/?device=portale-testa-1')
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(1500)
  await expect(page).toHaveScreenshot('portale-testa-1.png', { maxDiffPixels: 500 })
})
```

- [ ] **Step 2: Generate the baseline**

```bash
pnpm test:visual --update-snapshots
```

Expected: PNGs appear under `tests/visual/__screenshots__/`. Subsequent runs compare against them.

- [ ] **Step 3: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
test(visual): shell + Portale Testa 1 baseline screenshots

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Milestone G.13 — Final polish

### Task 40: Final impeccable + emil-design-eng pass

- [ ] **Step 1: Full-surface impeccable review**

Run the `impeccable` skill against the running app (`pnpm dev`). Walk through:
- TopBar spacing / chip alignment
- LeftPanel headline + tree typography rhythm
- RightPanel section density, label/value alignment, badge placement
- BottomToolbar button spacing, color balance (dark vs red)
- Empty states (no device selected)
- Hover states (tree, 3D mesh, chips)

Apply changes inline.

- [ ] **Step 2: Motion review with emil-design-eng**

Run the `emil-design-eng` skill. Walk through:
- Camera zoom in / out / switch
- Right panel mount / unmount (currently abrupt — add a transition?)
- Bottom toolbar mount / unmount
- Outline appearance on hover/select
- Badge state changes (e.g. when status flips active → warning)

Apply changes inline. Stay within the motion tokens from Task 3 (`--duration-*`, `--ease-*`).

- [ ] **Step 3: README**

```bash
cat > README.md <<'EOF'
# Geos-Design — Flexpin1 HMI

Frontend-only HMI for the Flexpin1 facade-ventilate machine.

## Quick start

```bash
pnpm install
pnpm dev
# open http://localhost:5173
```

## Other scripts

- `pnpm test`         — Vitest unit tests
- `pnpm test:e2e`     — Playwright e2e
- `pnpm test:visual`  — Playwright visual snapshots
- `pnpm build`        — production build
- `pnpm build:model`  — re-compress the GLB (requires `public/models/machine.original.glb`)

## Architecture

See `docs/superpowers/specs/2026-05-25-flexpin1-hmi-design.md`.

## Adding a new device

1. `mkdir src/devices/<id>` and add `meta.ts`, `state.ts`, `commands.ts`, `panel.tsx`, `toolbar.tsx`
2. Register it in `src/devices/index.ts`
3. Done.
EOF
```

- [ ] **Step 4: Run the full test suite**

```bash
pnpm test --run && pnpm test:e2e && pnpm test:visual
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add -A && \
GIT_AUTHOR_NAME="Andrea Mangano" GIT_AUTHOR_EMAIL="andrea@manganodesign.com" \
GIT_COMMITTER_NAME="Andrea Mangano" GIT_COMMITTER_EMAIL="andrea@manganodesign.com" \
git commit -m "$(cat <<'EOF'
polish: full impeccable + emil-design-eng pass + README

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Done — Step 1 complete

After Task 40, step 1 is shippable: app shell, 3D viewport, Portale Testa 1 fully working (live data, commands, role gate, camera animation), every other device stubbed but visible in the tree.

Next steps follow the per-device pattern in the spec (`§9. Step 2+`):
- **Step 2** — Portale Testa 2 (mirror of Testa 1, schema reuse)
- **Step 3** — Robot (6 joint angles, gripper-mounted state)
- **Step 4** — Speed (tavola, soffiatore, barra di lavaggio)
- ...

Each device folder is self-contained: drop in `meta.ts` (instantly visible in tree), `state.ts` (alive in store), `panel.tsx` + `toolbar.tsx` (full interaction). One impeccable + emil pass per device.
