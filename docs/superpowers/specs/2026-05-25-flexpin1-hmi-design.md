# Flexpin1 HMI — Frontend Design Spec

**Date**: 2026-05-25
**Status**: Approved (brainstorming phase complete; ready for implementation plan)
**Source requirements**: `Flexpin1 (2).md` v25.05.20
**Design reference**: Figma file `48Bp6ZLNh6F5F8ce2un2iF` node `1398:12509` ("MacBook Pro 16" - 82")
**3D asset**: `machine (4).glb` (~33 MB raw → ~4 MB compressed)

---

## 1. Purpose & Scope

Build a frontend-only HMI for the Flexpin1 facade-ventilate machine. The UI surfaces every device in the machine (Portale, Robot, Baie, Piani Aspirati, Speed, Dispenser, Ausiliari, Sicurezza), shows live state, and exposes per-device commands gated by operator role and machine mode.

**Out of scope for this spec**: backend, PLC integration, real telemetry, authentication. All data is mocked client-side with a deterministic tick loop that makes values feel live.

**Step 1 deliverable** (this spec's primary target): app shell + 3D viewport + fully working **Portale Testa 1** device (right panel + bottom toolbar + camera animation). Every other device appears in the tree but renders a "Not implemented yet" stub panel. This proves the registration seam so future devices ship one folder at a time without touching shell code.

---

## 2. Stack & Architecture

### 2.1 Stack
- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4 (`@theme` directive) + Shadcn UI (copy-in, `src/components/ui/`)
- `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` + `three-stdlib`
- Zustand (state) — one store per concern (machine, selection, mode, role)
- `react-router-dom` v7 (URL drives selection; deep-linking + browser back work)
- `lucide-react` icons; `class-variance-authority` + `tailwind-merge` (Shadcn defaults)
- Vitest + Testing Library (unit); Playwright (e2e + visual regression)

### 2.2 Runtime architecture
```
┌───────────────────────────────────────────────────────────────┐
│ App shell (always mounted)                                     │
│  ├─ TopBar (active recipe + per-subsystem chips)              │
│  ├─ LeftRail (icons, account/role footer)                     │
│  ├─ LeftPanel (collapsible device tree)                       │
│  ├─ Viewport ── R3F Canvas ── <MachineModel/> + Selectable    │
│  ├─ RightPanel (contextual; mounts <DevicePanel/>)            │
│  └─ BottomToolbar (contextual; mounts <DeviceToolbar/>)       │
└───────────────────────────────────────────────────────────────┘
       ▲                           ▲
       │ reads selectedDeviceId    │ reads role + device state
       ▼                           ▼
  selectionStore                machineStore
  (URL-derived)                 (devices + tick + dispatchCommand)
```

### 2.3 The extensibility seam: one folder per device
Each device lives in `src/devices/<id>/` exporting `{ meta, Panel?, Toolbar?, tick?, commands? }`. The shell reads from `src/devices/index.ts` (explicit registry). Adding a new device is dropping a folder + adding one line to the registry — no shell edits.

If a device has no `Panel`/`Toolbar`, the shell falls back to `_stub`. Meta-only devices appear in the tree and show a "Coming soon" panel — no special-casing.

---

## 3. Information Architecture

### 3.1 Device tree (full target)
```
FlexPin (machine root)
├─ Portale
│   ├─ Testa 1 ◀── step 1 target
│   │   ├─ Sistema di prova tenuta
│   │   └─ Erogatore resina
│   └─ Testa 2
│       ├─ Gripper dei pin
│       └─ Lampade UV
├─ Dispenser
│   └─ Dispenser dei distanziali (6 pistoni)
├─ Robot
│   ├─ Robot (braccio)
│   ├─ Gripper (montato)
│   └─ Tool stand (piccolo / medio / grande / distanziali)
├─ Baie
│   ├─ Baia dei grezzi (vassoio + fotocellule + tastatore)
│   └─ Baia dei lavorati
├─ Piani Aspirati (Piano 1, Piano 2 — 60 ventose ciascuno)
├─ Speed (tavola + soffiatore + barra di lavaggio)
└─ Ausiliari
    ├─ Impianto del vuoto
    ├─ Impianto acqua
    ├─ Impianto aria
    ├─ Sistema di erogazione resina (serbatoio + erogatore + alimentatore inserti)
    └─ Sicurezza (elettroserrature)
```

### 3.2 Stable device IDs (kebab-case)
Used for URL, store keys, GLB mesh name matching:

```
portale, portale-testa-1, portale-testa-1-tenuta, portale-testa-1-erogatore,
portale-testa-2, portale-testa-2-gripper-pin, portale-testa-2-lampade-uv,
dispenser-distanziali,
robot, robot-gripper, robot-tool-stand,
baia-grezzi, baia-grezzi-vassoio, baia-grezzi-fotocellule, baia-grezzi-tastatore,
baia-lavorati,
piano-aspirato-1, piano-aspirato-2,
speed, speed-soffiatore, speed-barra-lavaggio,
impianto-vuoto, impianto-acqua, impianto-aria,
erogazione-resina, sicurezza
```

### 3.3 Selection model — single source of truth: URL
```
URL  ?device=portale-testa-1
              │
              ▼
       selectionStore (derived from URL via useSearchParams)
              │
   ┌──────────┼─────────────┬───────────────┐
   ▼          ▼             ▼               ▼
 Tree     3D viewport   RightPanel    BottomToolbar
(highlight)(highlight) (mount panel)  (mount toolbar)
```

- Tree click, 3D mesh click, breadcrumb click → `setDevice(id)` → URL update
- Close button (X in panel) → `clear()` → URL clears, panel + toolbar unmount
- Hover state lives in a separate non-URL store (`hoveredDeviceId`); 60Hz updates have no business in browser history
- Keyboard: ↑/↓ navigate tree, Enter selects, Esc clears selection

### 3.4 Tree ↔ 3D ↔ Panel contract
Each device exposes `meta.ts`:
```ts
export const meta = {
  id: 'portale-testa-1',
  label: 'Testa 1',
  parentId: 'portale',
  icon: TargetIcon,
  meshNames: ['Portale_Testa_1', 'Portale_Testa_1_*'], // matched in GLB
  status: 'active' | 'idle' | 'error' | 'warning',
}
```
The shell uses `meshNames` to know which meshes light up on hover/select and to translate 3D clicks → device id. If a device has no matching mesh in the GLB, it still works from the tree; the 3D highlight is a no-op. **Devices and GLB evolve independently — neither blocks the other.**

### 3.5 Portale Testa 1 — right panel content
Following the requirements doc (Figma is the visual reference; the doc lists Lampade UV under Testa 2, not Testa 1):

- Breadcrumb header `Portale → Testa 1` + status badge + close (X)
- Section **Coordinate** — X / Y / Z mm (live-ticking)
- Section **Sistema di insertatura** — `idLavoro`, `idLastra`, `indiceForo`, `inizio` / `fine` precedente
- Section **Sistema di prova tenuta** — codice stato, codice errori, livello depressione (live), `modalita` selector (soffio / aspirazione / niente)
- Section **Erogatore (resina)** — stato (aperto / chiuso); inherits resin system status

### 3.6 Portale Testa 1 — bottom toolbar
From requirements doc § Teste del portale → Testa del portale 1:
- `Riposo 1` (fuori ingombro 1)
- `Riposo 2` (fuori ingombro 2)

Both visible to `operatore`. No superadmin-only commands listed in the doc for Testa 1 itself (sub-systems carry their own when selected). Visual treatment matches Figma's bottom-tab pattern (large, rounded, dark primary, secondary in red `--bg-state-danger`).

---

## 4. Data Model, Roles & Live Simulation

### 4.1 Device record (discriminated union)
```ts
type DeviceStatus = 'active' | 'idle' | 'warning' | 'error' | 'offline'
type Role = 'operatore' | 'admin' | 'superadmin'

interface DeviceBase {
  id: string
  label: string
  parentId: string | null
  status: DeviceStatus
  codiceStato?: string
  codiceErrori?: string[]
}

interface PortaleTesta1 extends DeviceBase {
  kind: 'portale-testa-1'
  position: { x: number; y: number; z: number }
  lavorazione: {
    idLavoro: string
    idLastra: string
    indiceForo: string
    inizio: number          // epoch ms
    finePrec: number | null
  } | null
  tenuta: {
    codiceStato: string
    livelloDepressione: number   // 0..1
    modalita: 'soffio' | 'aspirazione' | 'niente'
  }
  erogatore: { stato: 'aperto' | 'chiuso' }
}
// ... one interface per device kind, added one at a time
```

### 4.2 Command record
```ts
interface Command {
  id: string                    // 'portale-testa-1.riposo-1'
  label: string
  description?: string
  requiredRole: Role
  requiresConfirm?: boolean
  destructive?: boolean
  guidedProcedure?: boolean     // multi-step wizard
  hotkey?: string
  manualOnly?: boolean          // only enabled when mode === 'manuale'
  handler: (ctx: CommandCtx) => Promise<void> | void
}
```
Every command is registered alongside its device. `BottomToolbar` reads `commandsByDevice[selectedId]` and renders.

### 4.3 Operating mode (separate axis from role)
```ts
type Mode = 'auto' | 'manuale'
```
Lives in `modeStore`. Many commands are `manualOnly: true`. Mode + role together decide enabled state. For step 1: small toggle in TopBar; default `manuale`.

### 4.4 Role gating
```ts
canRunCommand(cmd, role) =>
  roleRank[role] >= roleRank[cmd.requiredRole]
// roleRank = { operatore: 0, admin: 1, superadmin: 2 }
```
Default role is `superadmin` (no switcher in step 1 — every control visible). The gate code path runs on every dispatch from day 1, so swapping in a switcher later is one line.

### 4.5 Live simulation
Single `setInterval(tick, 100)` in `machineStore`. Each device kind optionally exports `tick(prev, dtMs) => next`. For Portale Testa 1:
- `position.x/y/z` drift ±2mm with smooth lerp toward a target that re-rolls every 4s
- `tenuta.livelloDepressione` follows a bounded noisy curve
- `lavorazione.indiceForo` increments every ~12s (F-023 → F-024 …)
- Status occasionally flips `active → warning → active` for a few seconds

Devices without a tick simply don't update — the loop is fine. Commands share the same code path: a `riposo-1` handler sets a new target for `position`, and the next ticks animate toward it visibly.

### 4.6 Store layout
```
src/store/
├─ machine-store.ts     # devices Record + tick loop + dispatchCommand
├─ selection-store.ts   # derived from URL; hoveredId for non-URL hover
├─ mode-store.ts        # auto | manuale + persist (localStorage)
└─ role-store.ts        # current role (fixed = superadmin) + persist
```
Only `mode` and `role` persist; mock device state resets on reload (this is what you want during dev).

---

## 5. Design System

Tokens extracted from Figma node `1398:12509`. Warm-neutral palette (stone-tinted, not slate). Three layers: primitives → semantic → component.

### 5.1 Primitives (`src/styles/tokens.css`, Tailwind v4 `@theme`)
```css
@theme {
  --font-body: "Suisse Int'l", ui-sans-serif, system-ui, sans-serif;
  --font-headline: "Suisse Int'l", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Suisse Int'l Mono", ui-monospace, monospace;

  --text-xs:  12px;   --leading-xs:  16px;
  --text-sm:  14px;   --leading-sm:  20px;
  --text-lg:  18px;   --leading-lg:  28px;
  --text-xl:  20px;   --leading-xl:  28px;
  --text-3xl: 30px;   --leading-3xl: 36px;
  --tracking-wide: 0.143em;
  --tracking-tight-3xl: -0.033em;

  --space-2: 2px;  --space-4: 4px;   --space-6: 6px;
  --space-8: 8px;  --space-10: 10px; --space-12: 12px;
  --space-14: 14px; --space-20: 20px; --space-24: 24px;

  --radius-none: 0;  --radius-xs: 1px;  --radius-md: 8px;
  --radius-xl: 16px; --radius-full: 9999px;

  --stone-25:  #ffffff;  --stone-50:  #f5f5f4;  --stone-100: #e7e5e4;
  --stone-300: #a6a09b;  --stone-500: #79716b;  --stone-600: #57534d;
  --stone-800: #24211e;  --stone-900: #14110f;  --stone-950: #141413;

  --green-300: #4fc660;  --green-500: #33803f;  --green-bg:  #66dc7e1a;
  --red-500:   #e2433b;  --red-bg:    #e2433b1a;
  --amber-500: #d97706;
}
```

### 5.2 Semantic tokens (`:root`)
```css
:root {
  /* Backgrounds */
  --bg-default:        var(--stone-25);
  --bg-muted:          var(--stone-50);
  --bg-input-soft:     var(--stone-50);
  --bg-state-primary:  var(--stone-800);
  --bg-state-secondary:var(--stone-25);
  --bg-state-danger:   var(--red-500);
  --bg-badge-green:    var(--green-bg);
  --bg-badge-red:      var(--red-bg);

  /* Text */
  --text-default:  var(--stone-900);
  --text-subtle:   var(--stone-600);
  --text-muted:    var(--stone-500);
  --text-inverted: var(--stone-25);
  --text-success:  var(--green-500);

  /* Borders */
  --border-mute:    rgb(39 39 42 / 0.06);
  --border-default: rgb(39 39 42 / 0.10);
  --border-darker:  rgb(39 39 42 / 0.15);

  /* Icons */
  --icon-default:        var(--stone-800);
  --icon-default-muted:  var(--stone-300);
  --icon-default-subtle: var(--stone-600);

  /* Status (device state semantics) */
  --status-active:  var(--green-300);
  --status-idle:    var(--stone-300);
  --status-warning: var(--amber-500);
  --status-error:   var(--red-500);
  --status-offline: var(--stone-500);

  /* Elevation */
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

  /* Motion */
  --duration-fast:   120ms;
  --duration-base:   200ms;
  --duration-slow:   400ms;
  --duration-camera: 800ms;
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-camera: cubic-bezier(0.32, 0.72, 0, 1);
}
```

### 5.3 Shadcn bridge (`src/styles/shadcn-bridge.css`)
Map Shadcn's expected CSS variables to our semantics so copy-paste components Just Work:
```css
--background:         var(--bg-default);
--foreground:         var(--text-default);
--primary:            var(--bg-state-primary);
--primary-foreground: var(--text-inverted);
--muted:              var(--bg-muted);
--muted-foreground:   var(--text-muted);
--border:             var(--border-default);
--ring:               var(--stone-800);
--destructive:        var(--bg-state-danger);
```

### 5.4 Typography primitive
```tsx
<Text variant="3xl/medium">FlexPin</Text>          // headline
<Text variant="lg/medium">Portale Testa 1</Text>    // section title
<Text variant="sm/medium">Coordinate</Text>         // group header
<Text variant="sm/normal">1264.0 mm</Text>          // body / data
<Text variant="xs/medium" uppercase>ATTIVO</Text>   // overline / badge
```
This is the only component that reads type tokens directly. Everything else uses `<Text>`.

### 5.5 Iconography
- `lucide-react` for generic icons (chevrons, close, settings, search)
- Custom device icons under `src/components/icons/devices/`, 20×20 stroked SVGs in `currentColor`. Step 1: only `portale-testa-1.svg`. Other devices fall back to Lucide picks (`Cog`, `Boxes`, `Cpu`, `Wrench`) until custom drawings are made.

### 5.6 Status pattern
Single `<StatusBadge status="active">Attivo</StatusBadge>` component reads `--status-*` and `--bg-badge-*`. No hardcoded colors downstream.

---

## 6. 3D Viewport

### 6.1 GLB pipeline
Source `machine (4).glb` is 32.8 MB — far too heavy. Compression is part of step 1:

```bash
# scripts/compress-model.sh
gltf-transform meshopt   in.glb out.meshopt.glb
gltf-transform draco     out.meshopt.glb out.draco.glb -c quantize
gltf-transform webp      out.draco.glb   out.final.glb --quality 85
```
Expected output ≤ 5 MB. Build-time, not runtime. Loaded with `useGLTF('/models/machine.glb', /* draco */ true, /* meshopt */ true)`.

```
public/models/
├─ machine.original.glb     # gitignored
└─ machine.glb              # compressed, committed
```

### 6.2 Mesh → device mapping
On scene load, `useDeviceMeshes()` walks the loaded glTF once and builds:
```ts
Record<deviceId, { meshes: Mesh[], boundingBox: Box3, center: Vector3 }>
```
Matching is by glob against `meta.meshNames`. Dev-only console report lists matched vs unmatched device IDs so missing meshes are visible immediately. Production has no such log.

### 6.3 Scene composition
```tsx
<Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
  <Suspense fallback={<LoadingPlane/>}>
    <PerspectiveCamera makeDefault fov={35} position={[8, 6, 10]} />
    <CameraControls ref={cameraRef} smoothTime={0.25} />

    <Environment preset="studio" background={false} />
    <ambientLight intensity={0.6} />
    <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow={false} />

    <MachineModel onMeshClick={onMeshClick} />
    <Selection>
      <EffectComposer multisampling={4} autoClear={false}>
        <Outline edgeStrength={2.5} visibleEdgeColor={SELECTED_COLOR} blur={false}/>
        {monochrome && <Monochrome saturation={0.15} />}
      </EffectComposer>
    </Selection>

    <ContactShadows position={[0, 0, 0]} opacity={0.35} blur={2.5} far={4} />
  </Suspense>
</Canvas>
```

Why these specifics:
- `dpr` capped at 1.5 — friendly to industrial-PC integrated GPUs
- No real shadows; `ContactShadows` is 5–10× cheaper
- `Environment preset=studio` for IBL only — no visible skybox (white bg matches Figma)
- `multisampling=4` because outlines alias badly on white
- Monochrome post-pass is **optional** (off by default; toggled in dev menu); when on, `saturation=0.15` matches Figma's desaturated B&W feel

### 6.4 Hover & selection visualisation
- **Hover**: cursor → pointer, low-strength outline (1.5), lighter color, floating `<Html occlude>` label with device name. Throttled to one update per frame.
- **Selected**: full-strength outline (2.5), accent `--stone-800`, driven by `selectionStore.selectedDeviceId`.

### 6.5 Camera animation (the core interaction)
```ts
useEffect(() => {
  const cam = cameraRef.current
  if (!cam) return

  if (selectedId) {
    const target = deviceMeshes[selectedId]?.boundingBox
    if (!target) return
    homeViewRef.current ??= captureView(cam)   // capture once
    cam.fitToBox(target, /* enableTransition */ true, {
      paddingTop: 0.2, paddingBottom: 0.2,
      paddingLeft: 0.2, paddingRight: 0.2,
    })
  } else if (homeViewRef.current) {
    cam.setLookAt(
      ...homeViewRef.current.position,
      ...homeViewRef.current.target,
      /* enableTransition */ true,
    )
  }
}, [selectedId])
```

Behaviour:
- **Select** → smooth fit-to-box with 20% padding, ~800ms with Vercel-style settle (`--ease-camera`)
- **Switch** → smooth interpolation between two framed views; no return-to-home in between
- **Close (X)** → camera returns to the first-captured home view
- **User orbit/pan/zoom** is always enabled; selecting a new part overrides any manual pose
- **No matching mesh** → skip camera move, panel still opens, log dev warning
- **Tab hidden during transition** → settles with damping on next visible frame, no stutter

Timing curve: `CameraControls.smoothTime = 0.25` (critical-damped interpolation from `camera-controls`). The `emil-design-eng` pass during implementation may fine-tune.

### 6.6 Suspense fallback
Minimal scene: ground plane + skeletal box at machine footprint + centered "Caricamento macchina…". Replaced atomically when GLB resolves. Prevents white-flash FOUC.

### 6.7 Performance budget
| Metric                   | Target              |
|--------------------------|---------------------|
| Triangles                | < 500k (post compression) |
| Draw calls               | < 80                |
| Frame time               | < 16 ms on Intel UHD 620 |
| GPU memory               | < 80 MB             |
| GLB over the wire        | < 5 MB              |
| Time-to-first-render     | < 1.5s cold         |

Enforced by `<PerfHud/>` (drei `<Stats/>`) behind `?perf` URL param; off by default in production.

### 6.8 Tab-hidden behaviour
`<Canvas frameloop={visible ? 'always' : 'demand'}/>`. CPU drops 90%+ when hidden or off-screen.

---

## 7. File / Folder Structure

```
Geos-Design/
├─ public/
│   └─ models/
│       ├─ machine.glb              // compressed, committed
│       └─ machine.original.glb     // gitignored
├─ scripts/
│   └─ compress-model.sh
├─ docs/
│   └─ superpowers/specs/
│       └─ 2026-05-25-flexpin1-hmi-design.md
├─ tests/
│   ├─ e2e/
│   │   ├─ shell.spec.ts
│   │   └─ portale-testa-1.spec.ts
│   └─ visual/
│       └─ shell.snap.spec.ts
├─ src/
│   ├─ main.tsx
│   ├─ app.tsx
│   ├─ router.tsx
│   │
│   ├─ shell/
│   │   ├─ top-bar.tsx
│   │   ├─ left-rail.tsx
│   │   ├─ left-panel.tsx
│   │   ├─ right-panel.tsx
│   │   ├─ bottom-toolbar.tsx
│   │   └─ tree/
│   │       ├─ device-tree.tsx
│   │       └─ tree-item.tsx
│   │
│   ├─ viewport/
│   │   ├─ canvas.tsx
│   │   ├─ machine-model.tsx
│   │   ├─ camera.tsx
│   │   ├─ device-meshes.ts
│   │   ├─ outline.tsx
│   │   ├─ postprocessing/
│   │   │   └─ monochrome.tsx
│   │   ├─ helpers/
│   │   │   ├─ capture-view.ts
│   │   │   └─ perf-hud.tsx
│   │   └─ assets/
│   │       └─ index.ts
│   │
│   ├─ devices/
│   │   ├─ index.ts                 // explicit registry
│   │   ├─ _stub/                   // "Not implemented yet" fallback
│   │   │   ├─ meta.ts
│   │   │   ├─ panel.tsx
│   │   │   └─ toolbar.tsx
│   │   │
│   │   ├─ portale-testa-1/         // step 1: fully built
│   │   │   ├─ meta.ts
│   │   │   ├─ state.ts
│   │   │   ├─ commands.ts
│   │   │   ├─ panel.tsx
│   │   │   ├─ toolbar.tsx
│   │   │   └─ panel.test.tsx
│   │   │
│   │   ├─ portale/                 // step 1: meta only
│   │   │   └─ meta.ts
│   │   │
│   │   ├─ portale-testa-2/         // later (meta-only stub)
│   │   ├─ dispenser-distanziali/   // later
│   │   ├─ robot/                   // later
│   │   ├─ baia-grezzi/             // later
│   │   ├─ baia-lavorati/           // later
│   │   ├─ piano-aspirato-1/        // later
│   │   ├─ piano-aspirato-2/        // later
│   │   ├─ speed/                   // later
│   │   ├─ impianto-vuoto/          // later
│   │   ├─ impianto-acqua/          // later
│   │   ├─ impianto-aria/           // later
│   │   ├─ erogazione-resina/       // later
│   │   └─ sicurezza/               // later
│   │
│   ├─ store/
│   │   ├─ machine-store.ts
│   │   ├─ selection-store.ts
│   │   ├─ mode-store.ts
│   │   └─ role-store.ts
│   │
│   ├─ components/
│   │   ├─ ui/                      // shadcn (only what we use)
│   │   │   ├─ button.tsx
│   │   │   ├─ alert-dialog.tsx
│   │   │   ├─ tooltip.tsx
│   │   │   ├─ badge.tsx
│   │   │   ├─ separator.tsx
│   │   │   └─ scroll-area.tsx
│   │   ├─ primitives/
│   │   │   ├─ text.tsx
│   │   │   ├─ status-badge.tsx
│   │   │   ├─ icon.tsx
│   │   │   └─ kbd.tsx
│   │   ├─ icons/
│   │   │   └─ devices/
│   │   │       └─ portale-testa-1.svg
│   │   └─ patterns/
│   │       ├─ data-row.tsx
│   │       ├─ data-section.tsx
│   │       └─ command-button.tsx
│   │
│   ├─ styles/
│   │   ├─ tokens.css
│   │   ├─ shadcn-bridge.css
│   │   └─ globals.css
│   │
│   ├─ lib/
│   │   ├─ cn.ts
│   │   ├─ animate-value.ts
│   │   ├─ format.ts
│   │   └─ role-gate.ts
│   │
│   ├─ hooks/
│   │   ├─ use-selected-device.ts
│   │   ├─ use-device-state.ts
│   │   ├─ use-command-dispatch.ts
│   │   ├─ use-tick.ts
│   │   └─ use-keyboard.ts
│   │
│   └─ types/
│       ├─ device.ts
│       ├─ command.ts
│       └─ index.ts
│
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ components.json                  // shadcn config
├─ playwright.config.ts
├─ vitest.config.ts
├─ .eslintrc.cjs
├─ .prettierrc
├─ .gitignore
└─ README.md
```

### 7.1 Device registry (`src/devices/index.ts`)
```ts
import * as stub from './_stub'
import * as portale from './portale'
import * as testa1 from './portale-testa-1'
import * as testa2 from './portale-testa-2'
// ... one import per device

export const devices = {
  [portale.meta.id]: portale,
  [testa1.meta.id]: testa1,
  [testa2.meta.id]: testa2,
} as const

export function getDevice(id: string) {
  return devices[id as keyof typeof devices] ?? stub
}
```
**Explicit, not `import.meta.glob`** — preserves typecheck, makes additions visible in diffs.

### 7.2 `package.json` scripts
```jsonc
{
  "scripts": {
    "dev":          "vite",
    "build":        "tsc -b && vite build",
    "preview":      "vite preview",
    "test":         "vitest",
    "test:e2e":     "playwright test",
    "test:visual":  "playwright test --grep @visual",
    "lint":         "eslint src --max-warnings 0",
    "format":       "prettier -w src",
    "build:model":  "scripts/compress-model.sh",
    "ui:add":       "pnpm dlx shadcn@latest add"
  }
}
```

### 7.3 `.gitignore` additions
```
public/models/machine.original.glb
.vite/
.playwright/
test-results/
*.tsbuildinfo
```

---

## 8. Implementation Order — Step 1

Thirteen verifiable milestones. Each ends with something runnable and screenshot-able. Skills tagged where they fire.

| #     | Milestone                              | Skill pass                  | Verify                                                  |
|-------|----------------------------------------|-----------------------------|---------------------------------------------------------|
| G.1   | Scaffold + design tokens               | —                           | App boots; tokens resolve in DevTools; Suisse Int'l loaded |
| G.2   | GLB compression pipeline               | —                           | Output ≤ 5 MB; model intact in three.js editor          |
| G.3   | Empty shell layout                     | `impeccable` (first pass)   | Side-by-side vs Figma at 1920×1080                      |
| G.4   | Device registry + tree                 | —                           | Every tree node clickable; URL deep-link round-trips     |
| G.5   | 3D viewport — load + render            | —                           | 60fps target; ≤ 500k tris; ≤ 80 draw calls               |
| G.6   | Mesh ↔ device mapping + hover          | —                           | Hover Portale Testa 1 highlights mesh; click opens stub  |
| G.7   | Camera animation                       | `emil-design-eng` (first)   | 3 motion checkpoints (select / return / switch)         |
| G.8   | Portale Testa 1 — state + tick         | —                           | Store devtools shows values changing every 100ms        |
| G.9   | Portale Testa 1 — right panel          | `impeccable`                | Panel matches Figma; live values visibly tick           |
| G.10  | Portale Testa 1 — bottom toolbar       | —                           | Riposo 1 drives X/Y/Z to rest; role gate logged         |
| G.11  | TopBar wiring                          | —                           | Chip statuses change with mock status flips             |
| G.12  | Tests + visual baseline                | —                           | Green CI; baseline snapshot committed                   |
| G.13  | Final polish pass                      | `impeccable` + `emil-design-eng` | Demo-ready recording vs Figma                      |

### 8.1 Skill workflow summary
- **`impeccable`** runs on every visual milestone: shell layout (G.3), right panel (G.9), final polish (G.13). Also applies to every future device's panel/toolbar.
- **`emil-design-eng`** runs on every motion-bearing milestone: camera animation (G.7), final polish (G.13). Future devices that introduce new motion (panel slide-in for new layouts, custom transitions) get an additional pass.
- **`three.js-*`** skills (fundamentals, lighting, interaction, postprocessing, loaders) are available for the 3D milestones (G.5–G.7); they are reference, not gates.
- **`superpowers:test-driven-development`** for any milestone that adds testable logic (G.4, G.8, G.10, G.12).
- **`superpowers:verification-before-completion`** before each "complete" claim.

---

## 9. Step 2+ — Per-Device Pattern

After step 1, every new device follows three sub-milestones:
```
N.a — meta.ts             (instantly visible in tree; _stub panel)
N.b — state.ts + tick     (alive in store; status reactive)
N.c — panel + toolbar     (full interaction; impeccable + emil)
```

Suggested order (cheapest-first, dependency-aware):

| Step | Device                       | Notes                                                                 |
|------|------------------------------|-----------------------------------------------------------------------|
| 2    | Portale Testa 2              | Mirror of Testa 1 — schema reuse; test reuse                          |
| 3    | Robot                        | 6 joint angles; gripper-mounted state; macro commands                 |
| 4    | Speed                        | Tavola rotation; soffiatore + barra di lavaggio sub-toggles           |
| 5    | Baie (grezzi + lavorati)     | Introduces vassoio 2D layout view inside panel                        |
| 6    | Piani Aspirati (1 + 2)       | 60-ventose grid component + by-pass procedure (multi-step wizard)     |
| 7    | Dispenser + Erogazione resina| 6 pistoni; serbatoio level meter; alimentatore inserti pin-change     |
| 8    | Ausiliari (vuoto/acqua/aria) | Simple toggles — fast wins                                            |
| 9    | Sicurezza                    | Elettroserrature status + central alarm surface in TopBar             |

Cross-cutting passes after device coverage: guided procedures (Tool Stand setup wizards), `auto` vs `manuale` mode wiring, role switcher UI (replace default-superadmin with selectable), keyboard shortcuts polish, accessibility audit, optional EN alongside IT.

---

## 10. Open Questions (deferred, not blockers for step 1)
- **Hardware target**: which physical industrial PC / touchpanel ships this UI? Affects DPR cap, font rendering choice, and whether a `kiosk` mode is needed.
- **Display orientation**: confirmed 1920×1080 landscape; any portrait or tablet target?
- **Real PLC integration**: when it comes, will it speak OPC UA / WebSocket / REST? The mock store should adopt that data shape so the swap is mechanical.
- **Recipe management UI**: TopBar shows the active recipe; managing recipes (CRUD) is a separate workflow not in this spec.
- **Audit log / event history**: every command dispatched should arguably be logged. Where does that surface? — out of scope here.

These do not block step 1; capture and revisit before step 5 or 6.
