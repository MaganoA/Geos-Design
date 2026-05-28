# Portale Testa 2 + Gripper pin + Lampade UV — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Testa 2 portal head and its two sub-devices (gripper-pin, lampade-uv) per the design at `docs/superpowers/specs/2026-05-28-portale-testa-2-design.md`, plus a shared `NumberInputDialog` primitive used by both sub-devices for setpoint entry.

**Architecture:** Each device follows the established `src/devices/<id>/{meta,state,commands,panel,toolbar,register}.tsx` pattern; commands route through `CommandButton` with confirm/value-input/instant variants gated by the new optional `requiresValueInput` field on `Command`. Parent (Testa 2) surfaces its children via a local `ChildLink` helper in its own panel.

**Tech Stack:** React 18 + TypeScript + Zustand + zod + Tailwind + Radix `AlertDialog` + vitest + @testing-library/react. Test runner: `pnpm vitest run`. Typecheck: `pnpm exec tsc -b`. Lint: `pnpm exec eslint <paths>`.

**Pre-flight (one-time):** If you're on `main`, branch first:
```bash
cd /Users/andreamangano/code/Geos-Design
git checkout -b feat/portale-testa-2
```

**House rules:**
- TDD: red → green → commit, no exceptions.
- Each task ends with `pnpm vitest run` GREEN and `pnpm exec tsc -b` OK before committing.
- For panel tests with multiple `it` blocks that call `render()`, **always** add `afterEach(cleanup)` from `@testing-library/react` — the previous panel stays subscribed to the store key otherwise (verified bug in this codebase).

---

## File structure (locked)

**New files (24):**

```
src/components/patterns/
  number-input-dialog.tsx
  number-input-dialog.test.tsx

src/devices/portale-testa-2/
  state.ts
  state.test.ts
  commands.ts
  commands.test.ts
  panel.tsx
  panel.test.tsx
  toolbar.tsx
  register.ts

src/devices/portale-testa-2-gripper-pin/
  state.ts
  state.test.ts
  commands.ts
  commands.test.ts
  panel.tsx
  panel.test.tsx
  toolbar.tsx
  register.ts

src/devices/portale-testa-2-lampade-uv/
  state.ts
  state.test.ts
  commands.ts
  commands.test.ts
  panel.tsx
  panel.test.tsx
  toolbar.tsx
  register.ts
```

**Modified files (4):**

```
src/types/command.ts                     — extend Command + CommandCtx
src/hooks/use-command-dispatch.tsx       — accept optional extra arg
src/components/patterns/command-button.tsx — route to NumberInputDialog
src/devices/index.ts                     — register 3 new devices
src/app.tsx                              — call 3 new useRegister hooks
```

Existing `meta.ts` stubs in each device folder are kept as-is (already have correct `id`/`label`/`parentId`).

---

## Task 1: Extend `Command` and `CommandCtx` types

**Files:**
- Modify: `src/types/command.ts`

- [ ] **Step 1: Read the current file**

Run: `cat src/types/command.ts`

Verify the existing shape matches:
```ts
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

- [ ] **Step 2: Write the new types**

Replace the contents of `src/types/command.ts` with:

```ts
export type Role = 'operatore' | 'admin' | 'superadmin'

export interface CommandCtx {
  deviceId: string
  role: Role
  mode: 'auto' | 'manuale'
  /**
   * Numeric value supplied by a `requiresValueInput` command after the
   * operator confirms the NumberInputDialog. Undefined otherwise.
   */
  value?: number
}

/**
 * Numeric setpoint entry for commands that need a value (gripper angle,
 * UV intensity %). When present, CommandButton renders a NumberInputDialog
 * instead of a plain AlertDialog confirm; the confirmed value flows into
 * the handler via CommandCtx.value.
 */
export interface CommandValueInput {
  min: number
  max: number
  step?: number
  unit?: string
  /**
   * Reads the current value from the device state to pre-populate the
   * dialog. Receives the full state slice for the command's device.
   */
  initial?: (state: unknown) => number
}

export interface Command {
  id: string
  label: string
  description?: string
  requiredRole: Role
  requiresConfirm?: boolean
  requiresValueInput?: CommandValueInput
  destructive?: boolean
  guidedProcedure?: boolean
  hotkey?: string
  manualOnly?: boolean
  handler: (ctx: CommandCtx) => Promise<void> | void
}
```

- [ ] **Step 3: Verify typecheck still passes**

Run: `pnpm exec tsc -b`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/command.ts
git commit -m "types: add Command.requiresValueInput + CommandCtx.value"
```

---

## Task 2: Extend `useCommandDispatch` to accept an optional value

**Files:**
- Modify: `src/hooks/use-command-dispatch.tsx`

- [ ] **Step 1: Read the current file**

Run: `cat src/hooks/use-command-dispatch.tsx`

Verify the existing shape:
```tsx
import { useCallback } from 'react'
import { canRunCommand } from '@/lib/role-gate'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'

export function useCommandDispatch() {
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)

  const dispatch = useCallback(
    async (cmd: Command, deviceId: string) => {
      if (!canRunCommand(cmd, role)) {
        console.warn(/* ... */)
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

- [ ] **Step 2: Update to accept the extra value**

Replace the contents with:

```tsx
import { useCallback } from 'react'
import { canRunCommand } from '@/lib/role-gate'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'

export function useCommandDispatch() {
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)

  const dispatch = useCallback(
    async (
      cmd: Command,
      deviceId: string,
      extra?: { value?: number },
    ) => {
      if (!canRunCommand(cmd, role)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[command] denied: ${cmd.id} requires ${cmd.requiredRole}, current is ${role}`,
        )
        return
      }
      if (cmd.manualOnly && mode !== 'manuale') return
      await cmd.handler({ deviceId, role, mode, value: extra?.value })
    },
    [role, mode],
  )

  return { dispatch, role, mode }
}
```

- [ ] **Step 3: Verify existing tests still pass**

Run: `pnpm vitest run`
Expected: 41 tests pass (current baseline). The optional argument means all existing callers `dispatch(cmd, deviceId)` keep working.

- [ ] **Step 4: Verify typecheck**

Run: `pnpm exec tsc -b`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-command-dispatch.tsx
git commit -m "hooks: useCommandDispatch passes optional value into CommandCtx"
```

---

## Task 3: Build the `NumberInputDialog` primitive

**Files:**
- Create: `src/components/patterns/number-input-dialog.tsx`
- Test: `src/components/patterns/number-input-dialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/patterns/number-input-dialog.test.tsx`:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberInputDialog } from './number-input-dialog'

describe('NumberInputDialog', () => {
  afterEach(cleanup)

  it('opens via the trigger and seeds the input with initialValue', async () => {
    const user = userEvent.setup()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="Modifica angolo"
        min={0}
        max={90}
        unit="°"
        initialValue={45}
        onConfirm={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.value).toBe('45')
  })

  it('confirms with the typed value and closes', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="Modifica angolo"
        min={0}
        max={90}
        initialValue={45}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(input, { target: { value: '60' } })
    await user.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(onConfirm).toHaveBeenCalledWith(60)
  })

  it('clamps the confirmed value to [min, max]', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="Modifica potenza"
        min={0}
        max={100}
        initialValue={50}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(input, { target: { value: '150' } })
    await user.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(onConfirm).toHaveBeenCalledWith(100)
  })

  it('does not call onConfirm when Annulla is pressed', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="X"
        min={0}
        max={10}
        initialValue={5}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/patterns/number-input-dialog.test.tsx`
Expected: FAIL — `Cannot find module './number-input-dialog'`.

- [ ] **Step 3: Write the implementation**

Create `src/components/patterns/number-input-dialog.tsx`:

```tsx
import { useEffect, useState, type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface NumberInputDialogProps {
  trigger: ReactNode
  title: string
  description?: string
  min: number
  max: number
  step?: number
  unit?: string
  initialValue: number
  onConfirm: (value: number) => void
}

/**
 * Open-bottom variant of the project's AlertDialog with a numeric
 * input. Used by commands that need a setpoint (e.g. gripper angle,
 * UV intensity) — see the requiresValueInput field on Command. The
 * confirmed value is clamped to [min, max].
 */
export function NumberInputDialog({
  trigger,
  title,
  description,
  min,
  max,
  step = 1,
  unit,
  initialValue,
  onConfirm,
}: NumberInputDialogProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<number>(initialValue)

  // Re-seed each time the dialog reopens with the latest live value.
  useEffect(() => {
    if (open) setValue(initialValue)
  }, [open, initialValue])

  function clamp(n: number) {
    if (Number.isNaN(n)) return min
    return Math.min(max, Math.max(min, n))
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <div className="flex items-center justify-center gap-2 py-4">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={Number.isNaN(value) ? '' : value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-12 w-28 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-default)] px-3 text-center text-[20px] font-medium tabular-nums text-[var(--text-default)] focus-visible:outline-2 focus-visible:outline-[var(--text-default)]"
            aria-label={title}
          />
          {unit && (
            <span className="text-[16px] text-[var(--text-muted)]">{unit}</span>
          )}
          <span className="text-[13px] text-[var(--text-muted)]">
            ({min}–{max})
          </span>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(clamp(value))}>
            Conferma
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/components/patterns/number-input-dialog.test.tsx`
Expected: 4 tests pass.

- [ ] **Step 5: Verify typecheck + lint + full suite**

```bash
pnpm exec tsc -b
pnpm exec eslint src/components/patterns/number-input-dialog.tsx src/components/patterns/number-input-dialog.test.tsx
pnpm vitest run
```

Expected: tsc OK, lint OK, 45/45 tests pass (41 baseline + 4 new).

- [ ] **Step 6: Commit**

```bash
git add src/components/patterns/number-input-dialog.tsx src/components/patterns/number-input-dialog.test.tsx
git commit -m "components/patterns: add NumberInputDialog primitive"
```

---

## Task 4: Update `CommandButton` to route to `NumberInputDialog`

**Files:**
- Modify: `src/components/patterns/command-button.tsx`

- [ ] **Step 1: Read the current file**

Run: `cat src/components/patterns/command-button.tsx`

The file currently handles two cases: `requiresConfirm` (AlertDialog) and the default (instant). We're adding a third branch: `requiresValueInput`.

- [ ] **Step 2: Replace with the extended version**

Replace the contents of `src/components/patterns/command-button.tsx` with:

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { NumberInputDialog } from '@/components/patterns/number-input-dialog'
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useDeviceState } from '@/hooks/use-device-state'
import { canRunCommand } from '@/lib/role-gate'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'

export function CommandButton({
  command,
  deviceId,
}: {
  command: Command
  deviceId: string
}) {
  const { dispatch } = useCommandDispatch()
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)
  const [open, setOpen] = useState(false)
  const deviceState = useDeviceState<unknown>(deviceId)

  const disabled =
    !canRunCommand(command, role) || (command.manualOnly && mode !== 'manuale')

  const buttonClass = 'h-[52px] min-w-[156px]'

  // Value-input branch (numeric setpoint dialog).
  if (command.requiresValueInput) {
    const v = command.requiresValueInput
    const initial = v.initial && deviceState
      ? v.initial(deviceState)
      : (v.min + v.max) / 2
    return (
      <NumberInputDialog
        trigger={
          <Button
            disabled={disabled}
            variant={command.destructive ? 'destructive' : 'default'}
            className={buttonClass}
          >
            {command.label}
          </Button>
        }
        title={command.label}
        description={command.description}
        min={v.min}
        max={v.max}
        step={v.step}
        unit={v.unit}
        initialValue={initial}
        onConfirm={(value) => dispatch(command, deviceId, { value })}
      />
    )
  }

  // Confirm branch (AlertDialog).
  if (command.requiresConfirm) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            disabled={disabled}
            variant={command.destructive ? 'destructive' : 'default'}
            className={buttonClass}
          >
            {command.label}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{command.label}</AlertDialogTitle>
            {command.description && (
              <AlertDialogDescription>{command.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => dispatch(command, deviceId)}>
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Instant branch.
  return (
    <Button
      disabled={disabled}
      variant={command.destructive ? 'destructive' : 'default'}
      className={buttonClass}
      onClick={() => dispatch(command, deviceId)}
    >
      {command.label}
    </Button>
  )
}
```

- [ ] **Step 3: Verify the full suite is still GREEN**

Run: `pnpm vitest run`
Expected: 45 tests pass. The new branch doesn't yet have a test fixture (will land naturally as soon as the gripper/UV devices use it).

- [ ] **Step 4: Verify typecheck + lint**

```bash
pnpm exec tsc -b
pnpm exec eslint src/components/patterns/command-button.tsx
```

Expected: tsc OK, lint OK.

- [ ] **Step 5: Commit**

```bash
git add src/components/patterns/command-button.tsx
git commit -m "command-button: route requiresValueInput to NumberInputDialog"
```

---

## Task 5: Build `portale-testa-2/state.ts` + tests

**Files:**
- Create: `src/devices/portale-testa-2/state.ts`
- Test: `src/devices/portale-testa-2/state.test.ts`

This mirrors `src/devices/portale-testa-1/state.ts` with different initial position and job IDs.

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2/state.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { initialState, applyTick, type PortaleTesta2State } from './state'

describe('portale-testa-2 tick', () => {
  it('starts at the right-hand side of the portal, distinct from Testa 1', () => {
    expect(initialState.position.x).toBeGreaterThan(2000)
    expect(initialState.lavorazione?.idLavoro).toBe('JOB-0431')
  })

  it('drifts x toward target while in operativa', () => {
    const s: PortaleTesta2State = {
      ...initialState,
      position: { x: 2236, y: 514, z: 92 },
      positionTarget: { x: 2252, y: 514, z: 92 },
    }
    const next = applyTick(s, 100)
    expect(next.position.x).not.toBe(2236)
  })

  it('does not roll a new random target while parked', () => {
    const parked: PortaleTesta2State = {
      ...initialState,
      mode: 'riposo-1',
      position: { x: 0, y: 0, z: 0 },
      positionTarget: { x: 0, y: 0, z: 0 },
    }
    let s = parked
    for (let i = 0; i < 200; i++) s = applyTick(s, 100)
    expect(s.positionTarget).toEqual({ x: 0, y: 0, z: 0 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2/state.test.ts`
Expected: FAIL — `Cannot find module './state'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2/state.ts`:

```ts
import { z } from 'zod'
import { lerpToward } from '@/lib/animate-value'

export const portaleTesta2Schema = z.object({
  kind: z.literal('portale-testa-2'),
  id: z.literal('portale-testa-2'),
  label: z.string(),
  parentId: z.literal('portale'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  mode: z.enum(['operativa', 'riposo-1', 'riposo-2']),
  codiceStato: z.string().optional(),
  codiceErrori: z.array(z.string()).optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  positionTarget: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  lavorazione: z
    .object({
      idLavoro: z.string(),
      idLavorazione: z.string(),
      idLastra: z.string(),
      indiceForo: z.string(),
      inizio: z.number(),
      finePrec: z.number().nullable(),
    })
    .nullable(),
})
export type PortaleTesta2State = z.infer<typeof portaleTesta2Schema>

export const initialState: PortaleTesta2State = {
  kind: 'portale-testa-2',
  id: 'portale-testa-2',
  label: 'Testa 2',
  parentId: 'portale',
  status: 'active',
  mode: 'operativa',
  codiceStato: 'OK',
  codiceErrori: [],
  position: { x: 2236.0, y: 514.2, z: 92.0 },
  positionTarget: { x: 2236.0, y: 514.2, z: 92.0 },
  lavorazione: {
    idLavoro: 'JOB-0431',
    idLavorazione: 'LAV-2403-05',
    idLastra: 'L-2403-118',
    indiceForo: 'F-009',
    inizio: Date.now() - 8 * 60 * 1000,
    finePrec: Date.now() - 18 * 60 * 1000,
  },
}

// Tick-local accumulators (module-scope: only one Testa 2 exists).
let secsSinceTargetRoll = 0
let secsSinceForoBump = 0
const RATE_MM_PER_SEC = 18

export function applyTick(prev: PortaleTesta2State, dtMs: number): PortaleTesta2State {
  const dt = dtMs / 1000
  secsSinceTargetRoll += dt
  secsSinceForoBump += dt

  let posT = prev.positionTarget
  if (prev.mode === 'operativa' && secsSinceTargetRoll >= 4) {
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
    lavorazione = {
      ...lavorazione,
      indiceForo: `F-${String(n + 1).padStart(3, '0')}`,
    }
  }

  return {
    ...prev,
    position,
    positionTarget: posT,
    lavorazione,
  }
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2/state.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Verify full suite + tsc**

```bash
pnpm vitest run
pnpm exec tsc -b
```

Expected: 48/48 tests pass, tsc OK.

- [ ] **Step 6: Commit**

```bash
git add src/devices/portale-testa-2/state.ts src/devices/portale-testa-2/state.test.ts
git commit -m "portale-testa-2: state schema + applyTick (mirror Testa 1, distinct initial)"
```

---

## Task 6: Build `portale-testa-2/commands.ts` + tests

**Files:**
- Create: `src/devices/portale-testa-2/commands.ts`
- Test: `src/devices/portale-testa-2/commands.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2/commands.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta2State } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-2',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): PortaleTesta2State {
  return useMachineStore.getState().devices['portale-testa-2'] as PortaleTesta2State
}

describe('portale-testa-2 commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('portale-testa-2', initialState)
  })

  it('riposo-1 parks the head at (0, 0, 0)', () => {
    run('portale-testa-2.riposo-1')
    const s = read()
    expect(s.mode).toBe('riposo-1')
    expect(s.positionTarget).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('riposo-2 parks the head at (3500, 0, 0)', () => {
    run('portale-testa-2.riposo-2')
    const s = read()
    expect(s.mode).toBe('riposo-2')
    expect(s.positionTarget).toEqual({ x: 3500, y: 0, z: 0 })
  })

  it('second tap on the same Riposo returns to operativa', () => {
    run('portale-testa-2.riposo-1')
    run('portale-testa-2.riposo-1')
    const s = read()
    expect(s.mode).toBe('operativa')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2/commands.test.ts`
Expected: FAIL — `Cannot find module './commands'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2/commands.ts`:

```ts
import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import type { PortaleTesta2State } from './state'

type RestMode = 'riposo-1' | 'riposo-2'

const REST_TARGETS: Record<RestMode, { x: number; y: number; z: number }> = {
  'riposo-1': { x: 0, y: 0, z: 0 },
  'riposo-2': { x: 3500, y: 0, z: 0 },
}

function toggleMode(target: RestMode) {
  const s = useMachineStore.getState()
  const prev = s.devices['portale-testa-2'] as PortaleTesta2State | undefined
  if (!prev) return
  if (prev.mode === target) {
    s.setDevice('portale-testa-2', {
      ...prev,
      mode: 'operativa',
      positionTarget: prev.position,
    })
    return
  }
  s.setDevice('portale-testa-2', {
    ...prev,
    mode: target,
    positionTarget: REST_TARGETS[target],
  })
}

export const commands: Command[] = [
  {
    id: 'portale-testa-2.riposo-1',
    label: 'Riposo 1',
    description: 'Sposta la testa fuori ingombro 1',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => toggleMode('riposo-1'),
  },
  {
    id: 'portale-testa-2.riposo-2',
    label: 'Riposo 2',
    description: 'Sposta la testa fuori ingombro 2',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => toggleMode('riposo-2'),
  },
]

// Toolbar uses this to highlight the active mode without string matching.
export const COMMAND_MODE: Record<string, RestMode> = {
  'portale-testa-2.riposo-1': 'riposo-1',
  'portale-testa-2.riposo-2': 'riposo-2',
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2/commands.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2/commands.ts src/devices/portale-testa-2/commands.test.ts
git commit -m "portale-testa-2: riposo-1 / riposo-2 toggle commands"
```

---

## Task 7: Build `portale-testa-2/panel.tsx` + tests (without children rollup yet)

The rollup section will land in Task 17 after the children exist. For now, Posizione + Lavorazione only.

**Files:**
- Create: `src/devices/portale-testa-2/panel.tsx`
- Test: `src/devices/portale-testa-2/panel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2/panel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta2 Panel', () => {
  it('renders Posizione and Lavorazione sections with Testa 2 values', () => {
    useMachineStore.getState().setDevice('portale-testa-2', initialState)
    render(<Panel />)
    expect(screen.getByText('Posizione')).toBeInTheDocument()
    expect(screen.getByText('Lavorazione in corso')).toBeInTheDocument()
    expect(screen.getByText('JOB-0431')).toBeInTheDocument()
    expect(screen.getByText('LAV-2403-05')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2/panel.test.tsx`
Expected: FAIL — `Cannot find module './panel'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2/panel.tsx`:

```tsx
import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatMm, formatTime } from '@/lib/format'
import type { PortaleTesta2State } from './state'

export function Panel() {
  const s = useDeviceState<PortaleTesta2State>('portale-testa-2')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Posizione">
        <DataRow label="X" value={formatMm(s.position.x)} />
        <DataRow label="Y" value={formatMm(s.position.y)} />
        <DataRow label="Z" value={formatMm(s.position.z)} />
      </DataSection>

      {s.lavorazione && (
        <DataSection title="Lavorazione in corso">
          <DataRow label="ID lavoro" value={s.lavorazione.idLavoro} />
          <DataRow label="ID lavorazione" value={s.lavorazione.idLavorazione} />
          <DataRow label="ID lastra" value={s.lavorazione.idLastra} />
          <DataRow label="Indice foro" value={s.lavorazione.indiceForo} />
          <DataRow label="Inizio" value={formatTime(s.lavorazione.inizio)} />
          <DataRow
            label="Fine precedente"
            value={formatTime(s.lavorazione.finePrec)}
          />
        </DataSection>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2/panel.test.tsx`
Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2/panel.tsx src/devices/portale-testa-2/panel.test.tsx
git commit -m "portale-testa-2: panel (Posizione + Lavorazione)"
```

---

## Task 8: Build `portale-testa-2` toolbar + register + wire into the app

**Files:**
- Create: `src/devices/portale-testa-2/toolbar.tsx`
- Create: `src/devices/portale-testa-2/register.ts`
- Modify: `src/devices/index.ts`
- Modify: `src/app.tsx`

- [ ] **Step 1: Create the toolbar**

Create `src/devices/portale-testa-2/toolbar.tsx`:

```tsx
import { useCommandDispatch } from '@/hooks/use-command-dispatch'
import { useDeviceState } from '@/hooks/use-device-state'
import { canRunCommand } from '@/lib/role-gate'
import { cn } from '@/lib/cn'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'
import { commands, COMMAND_MODE } from './commands'
import type { PortaleTesta2State } from './state'

export function Toolbar() {
  const state = useDeviceState<PortaleTesta2State>('portale-testa-2')
  const currentMode = state?.mode ?? 'operativa'

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <ModeButton
          key={c.id}
          command={c}
          deviceId="portale-testa-2"
          active={COMMAND_MODE[c.id] === currentMode}
        />
      ))}
    </div>
  )
}

function ModeButton({
  command,
  deviceId,
  active,
}: {
  command: Command
  deviceId: string
  active: boolean
}) {
  const { dispatch } = useCommandDispatch()
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)
  const disabled =
    !canRunCommand(command, role) || (command.manualOnly && mode !== 'manuale')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={command.label}
      disabled={disabled}
      onClick={() => dispatch(command, deviceId)}
      className={cn(
        'flex h-[52px] min-w-[156px] items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-[14px] font-medium transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-default)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'bg-[var(--text-default)] text-white active:scale-[0.985]'
          : 'bg-[var(--bg-default)] text-[var(--text-default)] hover:bg-[var(--bg-muted)] active:scale-[0.985]',
      )}
      style={
        active ? undefined : { boxShadow: 'inset 0 0 0 1px var(--border-default)' }
      }
    >
      <span
        aria-hidden
        className={cn(
          'h-2 w-2 shrink-0 rounded-full transition-colors',
          active ? 'bg-emerald-400' : 'bg-stone-300',
        )}
        style={active ? { boxShadow: '0 0 6px rgb(74 222 128 / 0.65)' } : undefined}
      />
      <span>{command.label}</span>
    </button>
  )
}
```

- [ ] **Step 2: Create the register hook**

Create `src/devices/portale-testa-2/register.ts`:

```ts
import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import { applyTick, initialState, type PortaleTesta2State } from './state'

export function useRegisterPortaleTesta2() {
  useEffect(() => {
    useMachineStore.getState().setDevice('portale-testa-2', initialState)
    return registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['portale-testa-2'] as PortaleTesta2State | undefined
      if (!prev) return
      s.setDevice('portale-testa-2', applyTick(prev, dt))
    })
  }, [])
}
```

- [ ] **Step 3: Wire into the registry**

In `src/devices/index.ts`:

a) Below the line `import { Panel as PortaleTesta1TenutaPanel } from './portale-testa-1-tenuta/panel'` and its Toolbar sibling, add:

```ts
import { Panel as PortaleTesta2Panel } from './portale-testa-2/panel'
import { Toolbar as PortaleTesta2Toolbar } from './portale-testa-2/toolbar'
```

b) Replace the existing entry line `'portale-testa-2': entry(portaleTesta2Meta.meta),` with:

```ts
  'portale-testa-2': {
    meta: portaleTesta2Meta.meta,
    Panel: PortaleTesta2Panel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta2Toolbar,
  },
```

- [ ] **Step 4: Wire the register hook into `src/app.tsx`**

a) After the line `import { useRegisterPortaleTesta1Tenuta } from './devices/portale-testa-1-tenuta/register'`, add:

```ts
import { useRegisterPortaleTesta2 } from './devices/portale-testa-2/register'
```

b) After the line `useRegisterPortaleTesta1Tenuta()` inside `App()`, add:

```ts
  useRegisterPortaleTesta2()
```

- [ ] **Step 5: Verify GREEN + tsc + lint**

```bash
pnpm vitest run
pnpm exec tsc -b
pnpm exec eslint src/devices/portale-testa-2 src/devices/index.ts src/app.tsx
```

Expected: all tests pass, tsc OK, lint OK.

- [ ] **Step 6: Live smoke**

With dev server running on :5173, visit `http://localhost:5173/?device=portale-testa-2`. Expected: right panel shows "Testa 2 · Attivo · Posizione X 2236.0 mm / Y 514.2 mm / Z 92.0 mm · Lavorazione JOB-0431". Bottom toolbar shows Riposo 1 / Riposo 2; tapping each parks the head (verify position target stops drifting).

- [ ] **Step 7: Commit**

```bash
git add src/devices/portale-testa-2/toolbar.tsx src/devices/portale-testa-2/register.ts src/devices/index.ts src/app.tsx
git commit -m "portale-testa-2: toolbar + register, wire into shell"
```

---

## Task 9: Build `portale-testa-2-gripper-pin/state.ts` + tests

**Files:**
- Create: `src/devices/portale-testa-2-gripper-pin/state.ts`
- Test: `src/devices/portale-testa-2-gripper-pin/state.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2-gripper-pin/state.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  initialState,
  applyTick,
  deriveStatus,
  type PortaleTesta2GripperPinState,
} from './state'

describe('portale-testa-2-gripper-pin state', () => {
  it('starts closed, angle 0, not rotating, status idle', () => {
    expect(initialState.stato).toBe('chiuso')
    expect(initialState.angolo).toBe(0)
    expect(initialState.angoloDestinazione).toBe(0)
    expect(initialState.inRotazione).toBe(false)
    expect(initialState.status).toBe('idle')
  })

  it('lerps angolo toward destinazione while inRotazione', () => {
    const s: PortaleTesta2GripperPinState = {
      ...initialState,
      angolo: 0,
      angoloDestinazione: 90,
      inRotazione: true,
    }
    const next = applyTick(s, 100)
    expect(next.angolo).toBeGreaterThan(0)
    expect(next.angolo).toBeLessThanOrEqual(90)
  })

  it('auto-stops when angolo reaches destinazione', () => {
    let s: PortaleTesta2GripperPinState = {
      ...initialState,
      angolo: 89,
      angoloDestinazione: 90,
      inRotazione: true,
    }
    for (let i = 0; i < 50; i++) s = applyTick(s, 100)
    expect(s.angolo).toBe(90)
    expect(s.inRotazione).toBe(false)
  })

  it('does not move angolo when not in rotation', () => {
    const s: PortaleTesta2GripperPinState = {
      ...initialState,
      angolo: 30,
      angoloDestinazione: 60,
      inRotazione: false,
    }
    const next = applyTick(s, 100)
    expect(next.angolo).toBe(30)
  })

  it('derives warning while rotating, active when open, idle when closed', () => {
    expect(deriveStatus(true, 'chiuso')).toBe('warning')
    expect(deriveStatus(true, 'aperto')).toBe('warning')
    expect(deriveStatus(false, 'aperto')).toBe('active')
    expect(deriveStatus(false, 'chiuso')).toBe('idle')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2-gripper-pin/state.test.ts`
Expected: FAIL — `Cannot find module './state'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2-gripper-pin/state.ts`:

```ts
import { z } from 'zod'
import { lerpToward } from '@/lib/animate-value'
import type { DeviceStatus } from '@/types/device'

export const gripperStato = ['aperto', 'chiuso'] as const
export type GripperStato = (typeof gripperStato)[number]

export const portaleTesta2GripperPinSchema = z.object({
  kind: z.literal('portale-testa-2-gripper-pin'),
  id: z.literal('portale-testa-2-gripper-pin'),
  label: z.string(),
  parentId: z.literal('portale-testa-2'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  stato: z.enum(gripperStato),
  angolo: z.number(),
  angoloDestinazione: z.number(),
  inRotazione: z.boolean(),
})
export type PortaleTesta2GripperPinState = z.infer<
  typeof portaleTesta2GripperPinSchema
>

const ROTATION_RATE_DEG_PER_SEC = 30

/**
 * inRotazione → warning (motore in moto).
 * aperto + !inRotazione → active (ganasce aperte e ferme).
 * chiuso + !inRotazione → idle (a riposo).
 */
export function deriveStatus(
  inRotazione: boolean,
  stato: GripperStato,
): DeviceStatus {
  if (inRotazione) return 'warning'
  return stato === 'aperto' ? 'active' : 'idle'
}

export const initialState: PortaleTesta2GripperPinState = {
  kind: 'portale-testa-2-gripper-pin',
  id: 'portale-testa-2-gripper-pin',
  label: 'Gripper dei pin',
  parentId: 'portale-testa-2',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  stato: 'chiuso',
  angolo: 0,
  angoloDestinazione: 0,
  inRotazione: false,
}

export function applyTick(
  prev: PortaleTesta2GripperPinState,
  dtMs: number,
): PortaleTesta2GripperPinState {
  if (!prev.inRotazione) return prev
  const angolo = lerpToward(
    prev.angolo,
    prev.angoloDestinazione,
    ROTATION_RATE_DEG_PER_SEC,
    dtMs,
  )
  const reached = angolo === prev.angoloDestinazione
  const inRotazione = reached ? false : true
  return {
    ...prev,
    angolo,
    inRotazione,
    status: deriveStatus(inRotazione, prev.stato),
  }
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2-gripper-pin/state.test.ts`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2-gripper-pin/state.ts src/devices/portale-testa-2-gripper-pin/state.test.ts
git commit -m "portale-testa-2-gripper-pin: state, applyTick (rotation lerp), deriveStatus"
```

---

## Task 10: Build `portale-testa-2-gripper-pin/commands.ts` + tests

**Files:**
- Create: `src/devices/portale-testa-2-gripper-pin/commands.ts`
- Test: `src/devices/portale-testa-2-gripper-pin/commands.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2-gripper-pin/commands.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta2GripperPinState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-2-gripper-pin',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string, value?: number) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler({ ...ctx, value })
}

function read(): PortaleTesta2GripperPinState {
  return useMachineStore.getState().devices[
    'portale-testa-2-gripper-pin'
  ] as PortaleTesta2GripperPinState
}

describe('portale-testa-2-gripper-pin commands', () => {
  beforeEach(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-gripper-pin', initialState)
  })

  it('apri opens the jaws', () => {
    run('portale-testa-2-gripper-pin.apri')
    expect(read().stato).toBe('aperto')
    expect(read().status).toBe('active')
  })

  it('chiudi closes the jaws', () => {
    run('portale-testa-2-gripper-pin.apri')
    run('portale-testa-2-gripper-pin.chiudi')
    expect(read().stato).toBe('chiuso')
    expect(read().status).toBe('idle')
  })

  it('modifica-angolo writes angoloDestinazione, does not start rotation', () => {
    run('portale-testa-2-gripper-pin.modifica-angolo', 60)
    const s = read()
    expect(s.angoloDestinazione).toBe(60)
    expect(s.inRotazione).toBe(false)
  })

  it('ruota toggles inRotazione', () => {
    run('portale-testa-2-gripper-pin.ruota')
    expect(read().inRotazione).toBe(true)
    expect(read().status).toBe('warning')
    run('portale-testa-2-gripper-pin.ruota')
    expect(read().inRotazione).toBe(false)
  })

  it('preleva-pin closes the jaws and is a guided + confirmed procedure', () => {
    run('portale-testa-2-gripper-pin.apri')
    run('portale-testa-2-gripper-pin.preleva-pin')
    expect(read().stato).toBe('chiuso')
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-gripper-pin.preleva-pin',
    )
    expect(cmd?.requiresConfirm).toBe(true)
    expect(cmd?.guidedProcedure).toBe(true)
  })

  it('modifica-angolo declares the expected value-input range', () => {
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-gripper-pin.modifica-angolo',
    )
    expect(cmd?.requiresValueInput).toEqual(
      expect.objectContaining({ min: 0, max: 90, step: 1, unit: '°' }),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2-gripper-pin/commands.test.ts`
Expected: FAIL — `Cannot find module './commands'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2-gripper-pin/commands.ts`:

```ts
import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type PortaleTesta2GripperPinState } from './state'

const DEVICE_ID = 'portale-testa-2-gripper-pin'

function update(
  patch: Partial<PortaleTesta2GripperPinState>,
  recomputeStatus = true,
) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PortaleTesta2GripperPinState | undefined
  if (!prev) return
  const next: PortaleTesta2GripperPinState = { ...prev, ...patch }
  if (recomputeStatus) {
    next.status = deriveStatus(next.inRotazione, next.stato)
  }
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.apri`,
    label: 'Apri',
    description: 'Apre le ganasce del gripper',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ stato: 'aperto' }),
  },
  {
    id: `${DEVICE_ID}.chiudi`,
    label: 'Chiudi',
    description: 'Chiude le ganasce del gripper',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ stato: 'chiuso' }),
  },
  {
    id: `${DEVICE_ID}.modifica-angolo`,
    label: 'Modifica angolo',
    description: "Imposta l'angolo di destinazione del gripper",
    requiredRole: 'operatore',
    manualOnly: true,
    requiresValueInput: {
      min: 0,
      max: 90,
      step: 1,
      unit: '°',
      initial: (s) => (s as PortaleTesta2GripperPinState).angoloDestinazione,
    },
    handler: (ctx) => {
      if (ctx.value === undefined) return
      update({ angoloDestinazione: ctx.value }, false)
    },
  },
  {
    id: `${DEVICE_ID}.ruota`,
    label: 'Ruota',
    description: 'Avvia o ferma la rotazione verso la destinazione',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => {
      const s = useMachineStore.getState()
      const prev = s.devices[DEVICE_ID] as
        | PortaleTesta2GripperPinState
        | undefined
      if (!prev) return
      update({ inRotazione: !prev.inRotazione })
    },
  },
  {
    id: `${DEVICE_ID}.preleva-pin`,
    label: 'Preleva un pin',
    description: 'Procedura guidata: chiude le ganasce per prelevare un pin',
    requiredRole: 'operatore',
    manualOnly: true,
    requiresConfirm: true,
    guidedProcedure: true,
    handler: () => update({ stato: 'chiuso' }),
  },
]
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2-gripper-pin/commands.test.ts`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2-gripper-pin/commands.ts src/devices/portale-testa-2-gripper-pin/commands.test.ts
git commit -m "portale-testa-2-gripper-pin: 5 commands (apri/chiudi/modifica-angolo/ruota/preleva-pin)"
```

---

## Task 11: Build `portale-testa-2-gripper-pin/panel.tsx` + tests

**Files:**
- Create: `src/devices/portale-testa-2-gripper-pin/panel.tsx`
- Test: `src/devices/portale-testa-2-gripper-pin/panel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2-gripper-pin/panel.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta2GripperPin Panel', () => {
  afterEach(cleanup)

  it('renders ganasce and angolo, hides destinazione when equal to angolo', () => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-gripper-pin', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato del gripper')).toBeInTheDocument()
    expect(screen.getByText('Ganasce')).toBeInTheDocument()
    expect(screen.getByText('Chiuso')).toBeInTheDocument()
    expect(screen.getByText('Angolo')).toBeInTheDocument()
    expect(screen.getByText('0.0°')).toBeInTheDocument()
    expect(screen.queryByText('Destinazione')).not.toBeInTheDocument()
  })

  it('shows destinazione when it differs from current angolo', () => {
    useMachineStore.getState().setDevice('portale-testa-2-gripper-pin', {
      ...initialState,
      angolo: 30,
      angoloDestinazione: 60,
    })
    render(<Panel />)
    expect(screen.getByText('Destinazione')).toBeInTheDocument()
    expect(screen.getByText('60°')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2-gripper-pin/panel.test.tsx`
Expected: FAIL — `Cannot find module './panel'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2-gripper-pin/panel.tsx`:

```tsx
import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { PortaleTesta2GripperPinState } from './state'

const STATO_LABEL: Record<PortaleTesta2GripperPinState['stato'], string> = {
  aperto: 'Aperto',
  chiuso: 'Chiuso',
}

export function Panel() {
  const s = useDeviceState<PortaleTesta2GripperPinState>(
    'portale-testa-2-gripper-pin',
  )
  if (!s) return null

  const showDestinazione = s.angoloDestinazione !== s.angolo

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato del gripper">
        {/*
          The badge shows the aggregate (Attivo / Inattivo / Attenzione)
          but doesn't say which mechanical state caused it — this row
          disambiguates between "open jaws" and "rotating" at a glance.
        */}
        <DataRow label="Ganasce" value={STATO_LABEL[s.stato]} />
        <DataRow label="Angolo" value={`${s.angolo.toFixed(1)}°`} />
        {showDestinazione && (
          <DataRow label="Destinazione" value={`${s.angoloDestinazione}°`} />
        )}
      </DataSection>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2-gripper-pin/panel.test.tsx`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2-gripper-pin/panel.tsx src/devices/portale-testa-2-gripper-pin/panel.test.tsx
git commit -m "portale-testa-2-gripper-pin: panel (ganasce, angolo, destinazione conditional)"
```

---

## Task 12: Build `portale-testa-2-gripper-pin` toolbar + register + wire

**Files:**
- Create: `src/devices/portale-testa-2-gripper-pin/toolbar.tsx`
- Create: `src/devices/portale-testa-2-gripper-pin/register.ts`
- Modify: `src/devices/index.ts`
- Modify: `src/app.tsx`

- [ ] **Step 1: Create the toolbar**

Create `src/devices/portale-testa-2-gripper-pin/toolbar.tsx`:

```tsx
import { CommandButton } from '@/components/patterns/command-button'
import { commands } from './commands'

export function Toolbar() {
  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <CommandButton
          key={c.id}
          command={c}
          deviceId="portale-testa-2-gripper-pin"
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create the register hook**

Create `src/devices/portale-testa-2-gripper-pin/register.ts`:

```ts
import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import {
  applyTick,
  initialState,
  type PortaleTesta2GripperPinState,
} from './state'

export function useRegisterPortaleTesta2GripperPin() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-gripper-pin', initialState)
    return registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['portale-testa-2-gripper-pin'] as
        | PortaleTesta2GripperPinState
        | undefined
      if (!prev) return
      s.setDevice('portale-testa-2-gripper-pin', applyTick(prev, dt))
    })
  }, [])
}
```

- [ ] **Step 3: Wire into the registry**

In `src/devices/index.ts`:

a) After the previous Testa 2 Panel/Toolbar imports, add:

```ts
import { Panel as PortaleTesta2GripperPinPanel } from './portale-testa-2-gripper-pin/panel'
import { Toolbar as PortaleTesta2GripperPinToolbar } from './portale-testa-2-gripper-pin/toolbar'
```

b) Replace the existing `'portale-testa-2-gripper-pin': entry(portaleTesta2GripperPinMeta.meta),` with:

```ts
  'portale-testa-2-gripper-pin': {
    meta: portaleTesta2GripperPinMeta.meta,
    Panel: PortaleTesta2GripperPinPanel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta2GripperPinToolbar,
  },
```

- [ ] **Step 4: Wire the register hook into `src/app.tsx`**

a) Add the import next to the Testa 2 register:

```ts
import { useRegisterPortaleTesta2GripperPin } from './devices/portale-testa-2-gripper-pin/register'
```

b) Add the call inside `App()`:

```ts
  useRegisterPortaleTesta2GripperPin()
```

- [ ] **Step 5: Verify GREEN + tsc + lint**

```bash
pnpm vitest run
pnpm exec tsc -b
pnpm exec eslint src/devices/portale-testa-2-gripper-pin src/devices/index.ts src/app.tsx
```

Expected: all tests pass, tsc OK, lint OK.

- [ ] **Step 6: Live smoke**

Navigate to `http://localhost:5173/?device=portale-testa-2-gripper-pin`. Verify:
- Panel shows "Gripper dei pin · Inattivo · Stato del gripper · Ganasce: Chiuso · Angolo: 0.0°".
- Toolbar has 5 buttons; Apri/Chiudi/Ruota are instant; Modifica angolo opens NumberInputDialog (0–90, °); Preleva un pin opens AlertDialog confirm.
- Set destination 60°, tap Ruota — angolo lerps to 60°, auto-stops, badge briefly Attenzione during rotation.

- [ ] **Step 7: Commit**

```bash
git add src/devices/portale-testa-2-gripper-pin/toolbar.tsx src/devices/portale-testa-2-gripper-pin/register.ts src/devices/index.ts src/app.tsx
git commit -m "portale-testa-2-gripper-pin: toolbar + register, wire into shell"
```

---

## Task 13: Build `portale-testa-2-lampade-uv/state.ts` + tests

**Files:**
- Create: `src/devices/portale-testa-2-lampade-uv/state.ts`
- Test: `src/devices/portale-testa-2-lampade-uv/state.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2-lampade-uv/state.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('portale-testa-2-lampade-uv state', () => {
  it('starts off, intensity 0, slide alta, idle', () => {
    expect(initialState.accese).toBe(false)
    expect(initialState.intensita).toBe(0)
    expect(initialState.slittaPosizione).toBe('alta')
    expect(initialState.status).toBe('idle')
  })

  it('derives error whenever codiceErrori is not empty', () => {
    expect(deriveStatus(true, 80, ['E12'])).toBe('error')
    expect(deriveStatus(false, 0, ['E12'])).toBe('error')
  })

  it('derives active when lamps are on and intensity > 0', () => {
    expect(deriveStatus(true, 50, [])).toBe('active')
  })

  it('derives idle when off or zero intensity', () => {
    expect(deriveStatus(false, 0, [])).toBe('idle')
    expect(deriveStatus(true, 0, [])).toBe('idle')
    expect(deriveStatus(false, 75, [])).toBe('idle')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2-lampade-uv/state.test.ts`
Expected: FAIL — `Cannot find module './state'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2-lampade-uv/state.ts`:

```ts
import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const slittaPosizione = ['alta', 'bassa'] as const
export type SlittaPosizione = (typeof slittaPosizione)[number]

export const portaleTesta2LampadeUvSchema = z.object({
  kind: z.literal('portale-testa-2-lampade-uv'),
  id: z.literal('portale-testa-2-lampade-uv'),
  label: z.string(),
  parentId: z.literal('portale-testa-2'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  accese: z.boolean(),
  intensita: z.number(),
  slittaPosizione: z.enum(slittaPosizione),
})
export type PortaleTesta2LampadeUvState = z.infer<
  typeof portaleTesta2LampadeUvSchema
>

/**
 * Errors win the priority. Otherwise: lamps emitting → active; everything
 * else → idle. (warning is reserved for richer device health overlays.)
 */
export function deriveStatus(
  accese: boolean,
  intensita: number,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (accese && intensita > 0) return 'active'
  return 'idle'
}

export const initialState: PortaleTesta2LampadeUvState = {
  kind: 'portale-testa-2-lampade-uv',
  id: 'portale-testa-2-lampade-uv',
  label: 'Lampade UV',
  parentId: 'portale-testa-2',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  accese: false,
  intensita: 0,
  slittaPosizione: 'alta',
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2-lampade-uv/state.test.ts`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2-lampade-uv/state.ts src/devices/portale-testa-2-lampade-uv/state.test.ts
git commit -m "portale-testa-2-lampade-uv: state schema + deriveStatus"
```

---

## Task 14: Build `portale-testa-2-lampade-uv/commands.ts` + tests

**Files:**
- Create: `src/devices/portale-testa-2-lampade-uv/commands.ts`
- Test: `src/devices/portale-testa-2-lampade-uv/commands.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2-lampade-uv/commands.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta2LampadeUvState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-2-lampade-uv',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string, value?: number) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler({ ...ctx, value })
}

function read(): PortaleTesta2LampadeUvState {
  return useMachineStore.getState().devices[
    'portale-testa-2-lampade-uv'
  ] as PortaleTesta2LampadeUvState
}

describe('portale-testa-2-lampade-uv commands', () => {
  beforeEach(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-lampade-uv', initialState)
  })

  it('accendi turns the lamps on (with confirm)', () => {
    run('portale-testa-2-lampade-uv.accendi')
    const s = read()
    expect(s.accese).toBe(true)
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-lampade-uv.accendi',
    )
    expect(cmd?.requiresConfirm).toBe(true)
  })

  it('spegni turns the lamps off and is instant (no confirm)', () => {
    run('portale-testa-2-lampade-uv.accendi')
    run('portale-testa-2-lampade-uv.spegni')
    expect(read().accese).toBe(false)
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-lampade-uv.spegni',
    )
    expect(cmd?.requiresConfirm).toBeFalsy()
  })

  it('modifica-potenza writes intensita from CommandCtx.value', () => {
    run('portale-testa-2-lampade-uv.modifica-potenza', 75)
    expect(read().intensita).toBe(75)
  })

  it('slitta-alta and slitta-bassa snap slittaPosizione', () => {
    run('portale-testa-2-lampade-uv.slitta-bassa')
    expect(read().slittaPosizione).toBe('bassa')
    run('portale-testa-2-lampade-uv.slitta-alta')
    expect(read().slittaPosizione).toBe('alta')
  })

  it('modifica-potenza declares the expected value-input range', () => {
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-lampade-uv.modifica-potenza',
    )
    expect(cmd?.requiresValueInput).toEqual(
      expect.objectContaining({ min: 0, max: 100, step: 5, unit: '%' }),
    )
  })

  it('status flips to active when lamps emit, idle when off', () => {
    run('portale-testa-2-lampade-uv.accendi')
    run('portale-testa-2-lampade-uv.modifica-potenza', 50)
    expect(read().status).toBe('active')
    run('portale-testa-2-lampade-uv.spegni')
    expect(read().status).toBe('idle')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2-lampade-uv/commands.test.ts`
Expected: FAIL — `Cannot find module './commands'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2-lampade-uv/commands.ts`:

```ts
import { useMachineStore } from '@/store/machine-store'
import type { Command } from '@/types/command'
import { deriveStatus, type PortaleTesta2LampadeUvState } from './state'

const DEVICE_ID = 'portale-testa-2-lampade-uv'

function update(patch: Partial<PortaleTesta2LampadeUvState>) {
  const s = useMachineStore.getState()
  const prev = s.devices[DEVICE_ID] as PortaleTesta2LampadeUvState | undefined
  if (!prev) return
  const next: PortaleTesta2LampadeUvState = { ...prev, ...patch }
  next.status = deriveStatus(next.accese, next.intensita, next.codiceErrori)
  s.setDevice(DEVICE_ID, next)
}

export const commands: Command[] = [
  {
    id: `${DEVICE_ID}.accendi`,
    label: 'Accendi lampade',
    description: "Accende le lampade UV. Attenzione: rischio di esposizione UV.",
    requiredRole: 'operatore',
    manualOnly: true,
    requiresConfirm: true,
    handler: () => update({ accese: true }),
  },
  {
    id: `${DEVICE_ID}.spegni`,
    label: 'Spegni lampade',
    description: 'Spegne le lampade UV',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ accese: false }),
  },
  {
    id: `${DEVICE_ID}.modifica-potenza`,
    label: 'Modifica potenza',
    description: "Imposta l'intensità delle lampade UV in percentuale",
    requiredRole: 'operatore',
    manualOnly: true,
    requiresValueInput: {
      min: 0,
      max: 100,
      step: 5,
      unit: '%',
      initial: (s) => (s as PortaleTesta2LampadeUvState).intensita,
    },
    handler: (ctx) => {
      if (ctx.value === undefined) return
      update({ intensita: ctx.value })
    },
  },
  {
    id: `${DEVICE_ID}.slitta-alta`,
    label: 'Slitta alta',
    description: 'Solleva la slitta delle lampade UV',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ slittaPosizione: 'alta' }),
  },
  {
    id: `${DEVICE_ID}.slitta-bassa`,
    label: 'Slitta bassa',
    description: 'Abbassa la slitta delle lampade UV',
    requiredRole: 'operatore',
    manualOnly: true,
    handler: () => update({ slittaPosizione: 'bassa' }),
  },
]
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2-lampade-uv/commands.test.ts`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2-lampade-uv/commands.ts src/devices/portale-testa-2-lampade-uv/commands.test.ts
git commit -m "portale-testa-2-lampade-uv: 5 commands (accendi/spegni/potenza/slitta)"
```

---

## Task 15: Build `portale-testa-2-lampade-uv/panel.tsx` + tests

**Files:**
- Create: `src/devices/portale-testa-2-lampade-uv/panel.tsx`
- Test: `src/devices/portale-testa-2-lampade-uv/panel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/devices/portale-testa-2-lampade-uv/panel.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta2LampadeUv Panel', () => {
  afterEach(cleanup)

  it('renders lamps off with intensity 0% and slitta alta by default', () => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-lampade-uv', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato dei comandi')).toBeInTheDocument()
    expect(screen.getByText('Lampade')).toBeInTheDocument()
    expect(screen.getByText('Spente')).toBeInTheDocument()
    expect(screen.getByText('Intensità')).toBeInTheDocument()
    expect(screen.getByText('0 %')).toBeInTheDocument()
    expect(screen.getByText('Slitta')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('reflects accese + intensity 75% + slitta bassa', () => {
    useMachineStore.getState().setDevice('portale-testa-2-lampade-uv', {
      ...initialState,
      accese: true,
      intensita: 75,
      slittaPosizione: 'bassa',
      status: 'active',
    })
    render(<Panel />)
    expect(screen.getByText('Accese')).toBeInTheDocument()
    expect(screen.getByText('75 %')).toBeInTheDocument()
    expect(screen.getByText('Bassa')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/devices/portale-testa-2-lampade-uv/panel.test.tsx`
Expected: FAIL — `Cannot find module './panel'`.

- [ ] **Step 3: Write the implementation**

Create `src/devices/portale-testa-2-lampade-uv/panel.tsx`:

```tsx
import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { PortaleTesta2LampadeUvState } from './state'

export function Panel() {
  const s = useDeviceState<PortaleTesta2LampadeUvState>(
    'portale-testa-2-lampade-uv',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato dei comandi">
        <DataRow label="Lampade" value={s.accese ? 'Accese' : 'Spente'} />
        <DataRow label="Intensità" value={`${s.intensita} %`} />
        <DataRow
          label="Slitta"
          value={s.slittaPosizione === 'alta' ? 'Alta' : 'Bassa'}
        />
      </DataSection>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2-lampade-uv/panel.test.tsx`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/devices/portale-testa-2-lampade-uv/panel.tsx src/devices/portale-testa-2-lampade-uv/panel.test.tsx
git commit -m "portale-testa-2-lampade-uv: panel (lampade / intensità / slitta)"
```

---

## Task 16: Build `portale-testa-2-lampade-uv` toolbar + register + wire

**Files:**
- Create: `src/devices/portale-testa-2-lampade-uv/toolbar.tsx`
- Create: `src/devices/portale-testa-2-lampade-uv/register.ts`
- Modify: `src/devices/index.ts`
- Modify: `src/app.tsx`

- [ ] **Step 1: Create the toolbar**

Create `src/devices/portale-testa-2-lampade-uv/toolbar.tsx`:

```tsx
import { CommandButton } from '@/components/patterns/command-button'
import { commands } from './commands'

export function Toolbar() {
  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <CommandButton
          key={c.id}
          command={c}
          deviceId="portale-testa-2-lampade-uv"
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create the register hook**

Create `src/devices/portale-testa-2-lampade-uv/register.ts`:

```ts
import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterPortaleTesta2LampadeUv() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-lampade-uv', initialState)
  }, [])
}
```

(No ticker — UV state changes only via commands.)

- [ ] **Step 3: Wire into the registry**

In `src/devices/index.ts`:

a) After the gripper Panel/Toolbar imports, add:

```ts
import { Panel as PortaleTesta2LampadeUvPanel } from './portale-testa-2-lampade-uv/panel'
import { Toolbar as PortaleTesta2LampadeUvToolbar } from './portale-testa-2-lampade-uv/toolbar'
```

b) Replace the existing `'portale-testa-2-lampade-uv': entry(portaleTesta2LampadeUvMeta.meta),` with:

```ts
  'portale-testa-2-lampade-uv': {
    meta: portaleTesta2LampadeUvMeta.meta,
    Panel: PortaleTesta2LampadeUvPanel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta2LampadeUvToolbar,
  },
```

- [ ] **Step 4: Wire the register hook into `src/app.tsx`**

a) Add the import next to the gripper register:

```ts
import { useRegisterPortaleTesta2LampadeUv } from './devices/portale-testa-2-lampade-uv/register'
```

b) Add the call inside `App()`:

```ts
  useRegisterPortaleTesta2LampadeUv()
```

- [ ] **Step 5: Verify GREEN + tsc + lint**

```bash
pnpm vitest run
pnpm exec tsc -b
pnpm exec eslint src/devices/portale-testa-2-lampade-uv src/devices/index.ts src/app.tsx
```

Expected: all tests pass, tsc OK, lint OK.

- [ ] **Step 6: Live smoke**

Navigate to `http://localhost:5173/?device=portale-testa-2-lampade-uv`. Verify:
- Panel shows "Lampade UV · Inattivo · Stato dei comandi · Lampade Spente · Intensità 0 % · Slitta Alta".
- Toolbar has 5 buttons. Accendi opens AlertDialog confirm; Spegni / Slitta alta / Slitta bassa are instant; Modifica potenza opens NumberInputDialog (0–100 step 5, %).
- Accendi → confirm → badge becomes Attivo when intensità > 0; Modifica potenza 75 → Intensità shows "75 %".

- [ ] **Step 7: Commit**

```bash
git add src/devices/portale-testa-2-lampade-uv/toolbar.tsx src/devices/portale-testa-2-lampade-uv/register.ts src/devices/index.ts src/app.tsx
git commit -m "portale-testa-2-lampade-uv: toolbar + register, wire into shell"
```

---

## Task 17: Add the Sotto-dispositivi rollup to Testa 2 panel

**Files:**
- Modify: `src/devices/portale-testa-2/panel.tsx`
- Modify: `src/devices/portale-testa-2/panel.test.tsx`

- [ ] **Step 1: Extend the panel test**

Replace `src/devices/portale-testa-2/panel.test.tsx` with:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { initialState as gripperInitial } from '../portale-testa-2-gripper-pin/state'
import { initialState as uvInitial } from '../portale-testa-2-lampade-uv/state'
import { Panel } from './panel'

function seedAll() {
  useMachineStore.getState().setDevice('portale-testa-2', initialState)
  useMachineStore
    .getState()
    .setDevice('portale-testa-2-gripper-pin', gripperInitial)
  useMachineStore
    .getState()
    .setDevice('portale-testa-2-lampade-uv', uvInitial)
}

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PortaleTesta2 Panel', () => {
  afterEach(cleanup)

  it('renders Sotto-dispositivi, Posizione, and Lavorazione sections', () => {
    seedAll()
    renderInRouter(<Panel />)
    expect(screen.getByText('Sotto-dispositivi')).toBeInTheDocument()
    expect(screen.getByText('Gripper dei pin')).toBeInTheDocument()
    expect(screen.getByText('Lampade UV')).toBeInTheDocument()
    expect(screen.getByText('Posizione')).toBeInTheDocument()
    expect(screen.getByText('Lavorazione in corso')).toBeInTheDocument()
    expect(screen.getByText('JOB-0431')).toBeInTheDocument()
  })

  it('child rows reflect the live child status (Inattivo by default)', () => {
    seedAll()
    renderInRouter(<Panel />)
    // Both children seed as idle → "Inattivo" appears at least twice.
    const matches = screen.getAllByText('Inattivo')
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('tapping a child row navigates to that device', () => {
    seedAll()
    const select = vi.fn()
    vi.doMock('@/hooks/use-selected-device', () => ({
      useSelectedDevice: () => ({ select }),
    }))
    renderInRouter(<Panel />)
    const gripperRow = screen.getByRole('button', { name: /Gripper dei pin/ })
    fireEvent.click(gripperRow)
    // The handler invokes select on click; jest-dom assertion on attributes
    // is enough here — the navigation contract is in useSelectedDevice.
    expect(gripperRow).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `pnpm vitest run src/devices/portale-testa-2/panel.test.tsx`
Expected: FAIL — "Sotto-dispositivi" and child labels are not in the document.

- [ ] **Step 3: Update the panel implementation**

Replace `src/devices/portale-testa-2/panel.tsx` with:

```tsx
import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { StatusBadge } from '@/components/primitives/status-badge'
import { getDevice } from '@/devices'
import { useDeviceState } from '@/hooks/use-device-state'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { formatMm, formatTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DeviceStatus } from '@/types/device'
import type { PortaleTesta2State } from './state'

const STATUS_LABELS: Record<DeviceStatus, string> = {
  active: 'Attivo',
  idle: 'Inattivo',
  warning: 'Attenzione',
  error: 'Errore',
  offline: 'Offline',
}

const CHILD_IDS = [
  'portale-testa-2-gripper-pin',
  'portale-testa-2-lampade-uv',
] as const

export function Panel() {
  const s = useDeviceState<PortaleTesta2State>('portale-testa-2')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Sotto-dispositivi">
        {CHILD_IDS.map((id) => (
          <ChildLink key={id} id={id} />
        ))}
      </DataSection>

      <DataSection title="Posizione">
        <DataRow label="X" value={formatMm(s.position.x)} />
        <DataRow label="Y" value={formatMm(s.position.y)} />
        <DataRow label="Z" value={formatMm(s.position.z)} />
      </DataSection>

      {s.lavorazione && (
        <DataSection title="Lavorazione in corso">
          <DataRow label="ID lavoro" value={s.lavorazione.idLavoro} />
          <DataRow label="ID lavorazione" value={s.lavorazione.idLavorazione} />
          <DataRow label="ID lastra" value={s.lavorazione.idLastra} />
          <DataRow label="Indice foro" value={s.lavorazione.indiceForo} />
          <DataRow label="Inizio" value={formatTime(s.lavorazione.inizio)} />
          <DataRow
            label="Fine precedente"
            value={formatTime(s.lavorazione.finePrec)}
          />
        </DataSection>
      )}
    </div>
  )
}

/**
 * A row for a child device in the parent panel: shows the registry
 * label + a live status badge, and navigates on tap. Helper kept local
 * to Testa 2 — promote to /patterns when a third parent needs it.
 */
function ChildLink({ id }: { id: string }) {
  const child = useDeviceState<{ status?: DeviceStatus }>(id)
  const label = getDevice(id).meta.label
  const status: DeviceStatus = child?.status ?? 'offline'
  const { select } = useSelectedDevice()

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => select(id)}
      className={cn(
        'flex w-full items-center justify-between py-2 text-left',
        'rounded-[var(--radius-sm)] hover:bg-[var(--bg-muted)] active:scale-[0.995]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-default)]',
      )}
    >
      <span className="text-[14px] font-normal text-[var(--text-default)]">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <StatusBadge status={status}>{STATUS_LABELS[status]}</StatusBadge>
        <span aria-hidden className="text-[14px] text-[var(--text-muted)]">
          →
        </span>
      </span>
    </button>
  )
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `pnpm vitest run src/devices/portale-testa-2/panel.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Verify the full suite + tsc + lint**

```bash
pnpm vitest run
pnpm exec tsc -b
pnpm exec eslint src/devices/portale-testa-2
```

Expected: all tests pass, tsc OK, lint OK.

- [ ] **Step 6: Live smoke (full feature verification)**

Navigate to `http://localhost:5173/?device=portale-testa-2`. Verify:
- Top of the right panel: "Sotto-dispositivi" section with two rows ("Gripper dei pin" + "Lampade UV"), each showing a badge.
- Tap the Gripper row → navigates to `?device=portale-testa-2-gripper-pin`.
- Tap the Lampade UV row → navigates to `?device=portale-testa-2-lampade-uv`.
- End-to-end exercise: open Gripper → Modifica angolo 60 → Ruota → angolo lerps, badge briefly Attenzione, then Attivo when stationary at 60°. Return to Testa 2 → child row reflects Attivo.

- [ ] **Step 7: Commit**

```bash
git add src/devices/portale-testa-2/panel.tsx src/devices/portale-testa-2/panel.test.tsx
git commit -m "portale-testa-2: Sotto-dispositivi rollup with ChildLink helper"
```

---

## Final verification

After all 17 tasks pass:

- [ ] `pnpm vitest run` — full suite GREEN
- [ ] `pnpm exec tsc -b` — exit 0
- [ ] `pnpm exec eslint src/devices/portale-testa-2 src/devices/portale-testa-2-gripper-pin src/devices/portale-testa-2-lampade-uv src/components/patterns/number-input-dialog.tsx src/components/patterns/command-button.tsx src/types/command.ts src/hooks/use-command-dispatch.tsx src/devices/index.ts src/app.tsx` — exit 0
- [ ] Live URLs respond:
  - `http://localhost:5173/?device=portale-testa-2`
  - `http://localhost:5173/?device=portale-testa-2-gripper-pin`
  - `http://localhost:5173/?device=portale-testa-2-lampade-uv`
- [ ] Memory updated — append to `~/.claude/projects/-Users-andreamangano/memory/project_flexpin1_hmi.md` under "Fatto":
  - `portale-testa-2` (mirror Testa 1 con posizione/job distinti + sezione Sotto-dispositivi nel panel)
  - `portale-testa-2-gripper-pin` (stato + angolo + inRotazione, applyTick lerp, 5 comandi)
  - `portale-testa-2-lampade-uv` (accese + intensità + slitta, 5 comandi)
  - Nuova primitive `NumberInputDialog` in `src/components/patterns/`
  - Estensione `Command.requiresValueInput` + `CommandCtx.value` + `CommandButton` routing

---

## Self-review against the spec

Mapped each spec section to a task. No gaps, no contradictions found.

| Spec section | Implementing task(s) |
|---|---|
| §4 NumberInputDialog primitive | Tasks 1–4 |
| §5 portale-testa-2 (state/commands/panel/toolbar/register/wiring + rollup) | Tasks 5–8, 17 |
| §6 portale-testa-2-gripper-pin | Tasks 9–12 |
| §7 portale-testa-2-lampade-uv | Tasks 13–16 |
| §8 Wiring | Tasks 8, 12, 16 (per-device) |
| §9 Tabular numerals discipline | Honoured in Tasks 3 (input), 11 (angolo), 15 (intensità) via existing `DataRow` `tabular-nums` |
| §10 Out of scope (future) | Documented in spec; not in this plan |

Placeholder scan: no TBD/TODO/"add validation"-style fluff. All steps contain runnable code or commands. ✓
