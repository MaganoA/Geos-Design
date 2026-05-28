# Portale Testa 2 + Gripper pin + Lampade UV — Design

> Status: **Approvato per implementazione** · Data: 2026-05-28 · Owner: Andrea
> Brainstorming companion: `feedback_hmi_device_status_badge.md`, `project_flexpin1_hmi.md`

## 1. Obiettivo e scope

Implementare tre device dell'HMI Flexpin1:

1. **`portale-testa-2`** — la seconda testa del portale; replica della Testa 1 (stesso schema state, stessi comandi, simulazione random-drift della posizione) con valori iniziali distinti per non sovrapporsi visivamente.
2. **`portale-testa-2-gripper-pin`** — gripper dei pin montato sulla Testa 2; gestisce ganasce (aperto/chiuso) e rotazione (0–90°).
3. **`portale-testa-2-lampade-uv`** — bank di lampade UV; gestisce accensione, intensità %, posizione slitta (alta/bassa).

In aggiunta, una sola nuova primitive condivisa:

- **`NumberInputDialog`** in `src/components/patterns/` — estensione di `AlertDialog` con un campo `<input type="number">` (min/max/step/unit). Riusata sia per *Modifica angolo destinazione* (gripper) sia per *Modifica potenza* (UV).

Tutti i comandi seguono il pattern già stabilito (`CommandButton` + role/mode gating). Niente `HoldButton`: per scelta di product, i motion command sono *tap-to-start, auto-stop a target* o *tap istantaneo* (cfr. §3).

## 2. Architettura

Stessa convenzione dei device esistenti:

```
src/devices/portale-testa-2/
  meta.ts          (già presente, stub)
  state.ts         schema zod + initialState + applyTick + deriveStatus (se serve)
  commands.ts      array Command[] + helpers
  panel.tsx        React panel
  toolbar.tsx      React toolbar
  register.ts      useRegister<Device>()  — seed + ticker
  state.test.ts
  commands.test.ts
  panel.test.tsx
```

Idem per `portale-testa-2-gripper-pin/` e `portale-testa-2-lampade-uv/`.

Wiring in `src/devices/index.ts` (sostituire `entry(meta)` con la registrazione completa `{meta, Panel, Toolbar}`) e in `src/app.tsx` (chiamare i 3 `useRegister*()` con gli altri).

## 3. Decisioni di product (sintesi)

Tutte derivate dal brainstorming + ricerca ISA-101 / NAMUR / cluster automotive (vedi §11).

| Argomento | Scelta | Motivo |
|---|---|---|
| Setpoint numerici | `NumberInputDialog` (dialog dal toolbar) | Pattern uniforme con `CommandButton+confirm` esistente; panel resta read-only. |
| Apri/Chiudi gripper | Tap istantaneo, no conferma | Zero friction; simmetrico; trade-off pinch-hazard accettato. |
| Ruota gripper | Tap toggle: start motion → auto-stop a target; secondo tap durante motion → ferma a metà | Coerente con la scelta "zero friction" senza nuova primitive. |
| Preleva un pin | `requiresConfirm + guidedProcedure`; handler chiude le ganasce | Procedura nominata nello spec ma la macro vera vive lato portale (idem `cambio ugello` dell'erogatore). |
| Accendi lampade UV | `requiresConfirm` | Eye-safety (radiazione UV); cluster pattern. |
| Spegni lampade UV | Tap istantaneo | Spegnere riduce hazard. |
| Modifica potenza UV | `NumberInputDialog` (0–100, step 5, %) | Uniforme con angolo. |
| Slitta UV alta/bassa | Tap istantaneo | Coerente con "zero friction"; movimento sintetico immediato. |
| Tabular numerals | Disciplina applicata su ogni valore numerico variabile (gauge centre, DataRow values con numeri) | Cluster automotive (BMW/Audi/Polestar). Una CSS class. |
| Parent rollup Testa 2 | Sezione "Sotto-dispositivi" in cima al panel destro di Testa 2: mini-tabella con badge + key-line di ciascun figlio, tap → naviga | ISA-101 hierarchy. Rollup nel tree = differito (modifica shell). |

## 4. Nuova primitive — `NumberInputDialog`

**File:** `src/components/patterns/number-input-dialog.tsx`

**Responsabilità:** apre un `AlertDialog` con header (titolo + descrizione opzionale), body con un `<input type="number">`, footer con Annulla + Conferma.

**Props:**

```ts
interface NumberInputDialogProps {
  trigger: React.ReactNode          // di solito un <Button>
  title: string
  description?: string
  min: number
  max: number
  step?: number                     // default 1
  unit?: string                     // es. '°' o '%'
  initialValue: number              // valore di partenza all'apertura
  onConfirm: (value: number) => void
}
```

**Comportamento:**
- L'input è controlled. Validazione live: il valore viene clampato a `[min, max]` al blur o al Conferma.
- Conferma chiama `onConfirm(value)` e chiude. Annulla chiude senza chiamare.
- Tap-target del Conferma ≥ 60 px (touch-with-gloves).
- Tabular numerals nell'input.

**Estensione del tipo `Command`** in `src/types/command.ts`:

```ts
interface Command {
  // ...esistenti
  requiresValueInput?: {
    min: number
    max: number
    step?: number
    unit?: string
    initial?: (state: unknown) => number  // letto dal device state al click
  }
}
```

Estendere anche `CommandCtx` con `value?: number` (opzionale, presente solo nei command value-input).

**Aggiornamento `CommandButton`:** se `command.requiresValueInput`, renderizzare un `NumberInputDialog` invece di `AlertDialog`; al Conferma chiamare `dispatch(command, deviceId, { value })`.

**Aggiornamento `useCommandDispatch`:** firma del dispatch diventa `dispatch(cmd, deviceId, extra?: { value?: number })`; passa `value` nel `CommandCtx`.

**Test:** `number-input-dialog.test.tsx` copre: apertura/chiusura, clamp a `[min,max]`, callback `onConfirm` con il valore corretto.

## 5. `portale-testa-2`

### State

Schema identico a `portale-testa-1` ma con `kind`/`id` = `'portale-testa-2'`, `parentId` = `'portale'`.

```ts
{
  kind, id, label: 'Testa 2', parentId: 'portale',
  status: 'active',
  mode: 'operativa' | 'riposo-1' | 'riposo-2',
  codiceStato?, codiceErrori?,
  position: {x, y, z},
  positionTarget: {x, y, z},
  lavorazione: {idLavoro, idLavorazione, idLastra, indiceForo, inizio, finePrec} | null
}
```

**Initial values distinti** dalla Testa 1:
- `position` = `{x: 2236.0, y: 514.2, z: 92.0}` (specchio rispetto al centro del portale)
- `lavorazione.idLavoro = 'JOB-0431'`, `idLavorazione = 'LAV-2403-05'`, `idLastra = 'L-2403-118'`, `indiceForo = 'F-009'`
- `inizio = Date.now() - 8 * 60 * 1000`, `finePrec = Date.now() - 18 * 60 * 1000`

### `applyTick`
Stesso comportamento di Testa 1: random drift di `positionTarget` ogni 4 s in modalità `operativa`, lerp su `position` con `RATE_MM_PER_SEC = 18`, parking immobile in `riposo-*`, `indiceForo` incrementa ogni 12 s. **Riusa `lerpToward` da `@/lib/animate-value`.**

### Commands
- `portale-testa-2.riposo-1` — toggle in/out `mode='riposo-1'`, sposta `positionTarget` a `{0,0,0}`.
- `portale-testa-2.riposo-2` — toggle in/out `mode='riposo-2'`, sposta `positionTarget` a `{3500,0,0}`.
Entrambi `manualOnly`, `requiredRole: 'operatore'`. Pattern toggle identico a `portale-testa-1` (`COMMAND_MODE` map per highlight in toolbar).

### Panel
**Sezione 1 (nuova) — "Sotto-dispositivi"**: mini-tabella con due righe:

```tsx
<DataSection title="Sotto-dispositivi">
  <ChildLink id="portale-testa-2-gripper-pin" />
  <ChildLink id="portale-testa-2-lampade-uv" />
</DataSection>
```

Dove `ChildLink` è un nuovo componente helper (locale al panel di Testa 2; non globale per ora) che:
- Label statica: `getDevice(id).meta.label` (registry — fonte unica)
- Slice live: `useDeviceState<{status?: DeviceStatus}>(id)` per il badge
- Renderizza una riga con: label, `<StatusBadge status={status ?? 'offline'}>{STATUS_LABELS[…]}</StatusBadge>`, freccia `→`
- Al tap, chiama `useSelectedDevice().select(id)` per navigare

**Sezione 2 — "Posizione"**: `DataRow X/Y/Z` con `formatMm` (tabular-nums).
**Sezione 3 — "Lavorazione in corso"** (solo se `lavorazione !== null`): `DataRow` id lavoro/lavorazione/lastra/indice foro/inizio/fine precedente.

### Toolbar
Due `ModeButton` (Riposo 1, Riposo 2). Stesso markup di `portale-testa-1/toolbar.tsx`; estraibile come primitive solo se ne servirà una terza istanza altrove (YAGNI per ora).

### Test
- `state.test.ts`: drift della posizione, indiceForo stabile, parking blocca il drift.
- `panel.test.tsx`: rende le 3 sezioni; sezione *Sotto-dispositivi* mostra i child labels + badge; tap su una riga cambia il device selezionato (verifica con `react-router-dom` MemoryRouter o stub di `useSelectedDevice`).
- `commands.test.ts`: tap Riposo 1 / Riposo 2 cambia `mode` e `positionTarget`; secondo tap torna a `operativa`.

## 6. `portale-testa-2-gripper-pin`

### State

```ts
{
  kind: 'portale-testa-2-gripper-pin',
  id: 'portale-testa-2-gripper-pin',
  label: 'Gripper dei pin',
  parentId: 'portale-testa-2',
  status: DeviceStatus,
  codiceStato?, codiceErrori?,
  stato: 'aperto' | 'chiuso',           // ganasce
  angolo: number,                       // gradi correnti, 0–90
  angoloDestinazione: number,           // setpoint, 0–90
  inRotazione: boolean,                 // motore attivo
}
```

`initialState`: `stato='chiuso'`, `angolo=0`, `angoloDestinazione=0`, `inRotazione=false`, `status='idle'`, `codiceStato='OK'`, `codiceErrori=[]`.

### `applyTick`
Se `inRotazione === true`:
- `angolo = lerpToward(angolo, angoloDestinazione, ROTATION_RATE_DEG_PER_SEC, dtMs)` con rate `30`.
- Se `angolo === angoloDestinazione` (post-lerp), set `inRotazione = false`.

`stato` non cambia in tick (è cambiato solo dai comandi Apri/Chiudi/Preleva).

### `deriveStatus(inRotazione, stato)`
- `inRotazione → 'warning'` (motion attivo)
- `stato === 'aperto' && !inRotazione → 'active'`
- `stato === 'chiuso' && !inRotazione → 'idle'`

Aggiornato in ogni command handler dopo il `setDevice`.

### Commands
Tutti `manualOnly`, `requiredRole: 'operatore'`. Id col prefisso device-id pieno per coerenza col pattern attuale.

1. **`portale-testa-2-gripper-pin.apri`** — label "Apri", instant. Handler: `stato='aperto'`, recompute status.
2. **`portale-testa-2-gripper-pin.chiudi`** — label "Chiudi", instant. Handler: `stato='chiuso'`, recompute status.
3. **`portale-testa-2-gripper-pin.modifica-angolo`** — label "Modifica angolo", `requiresValueInput: {min:0, max:90, step:1, unit:'°', initial: s=>s.angoloDestinazione}`. Handler: `(ctx) => setDevice({...prev, angoloDestinazione: ctx.value})`. Non avvia rotazione.
4. **`portale-testa-2-gripper-pin.ruota`** — label "Ruota", instant toggle. Handler: `inRotazione = !prev.inRotazione`, recompute status.
5. **`portale-testa-2-gripper-pin.preleva-pin`** — label "Preleva un pin", `requiresConfirm`, `guidedProcedure`. Handler: chiude le ganasce (`stato='chiuso'`) e logga (la vera macro vive lato portale).

### Panel
Sezione "Stato del gripper":
- `DataRow` "Ganasce" → `Aperto` / `Chiuso` ⚠️ ammessa nonostante coincida col badge nei casi non-rotazione, perché disambigua "Attivo" generico (badge dice solo *attivo*, la riga dice *quale stato meccanico*).
- `DataRow` "Angolo" → `${angolo.toFixed(1)}°` (tabular-nums)
- `DataRow` "Destinazione" → `${angoloDestinazione}°` — render solo se `angoloDestinazione !== angolo` (altrimenti ridondante).

### Toolbar
Cinque `CommandButton` (Apri, Chiudi, Modifica angolo, Ruota, Preleva un pin). Modifica angolo apre `NumberInputDialog`. Preleva un pin apre `AlertDialog` standard.

### Test
- `state.test.ts`: lerp dell'angolo verso destinazione mentre `inRotazione`; auto-stop quando raggiunge; nessun lerp se `!inRotazione`. `deriveStatus` per tutte le combinazioni.
- `commands.test.ts`: apri/chiudi settano `stato`; modifica-angolo (con `value` nel ctx) setta `angoloDestinazione` senza avviare rotazione; ruota toggla `inRotazione`; preleva-pin chiude ganasce + ha `requiresConfirm` + `guidedProcedure`.
- `panel.test.tsx`: ganasce label + angolo con tabular-nums; destinazione visibile solo se diversa; `afterEach(cleanup)`.

## 7. `portale-testa-2-lampade-uv`

### State

```ts
{
  kind: 'portale-testa-2-lampade-uv',
  id: 'portale-testa-2-lampade-uv',
  label: 'Lampade UV',
  parentId: 'portale-testa-2',
  status: DeviceStatus,
  codiceStato?, codiceErrori?,
  accese: boolean,
  intensita: number,                    // 0–100 %
  slittaPosizione: 'alta' | 'bassa',
}
```

`initialState`: `accese=false`, `intensita=0`, `slittaPosizione='alta'`, `status='idle'`.

### `applyTick`
Opzionale micro-jitter ±0.5% su `intensita` quando `accese && intensita > 0`. Implementabile come iterazione 2 se Andrea vuole il "feeling live"; **per la prima iterazione, nessun tick** (intensità statica). Niente register-ticker.

### `deriveStatus(accese, intensita, codiceErrori)`
- `codiceErrori.length > 0 → 'error'`
- `accese && intensita > 0 → 'active'`
- `else → 'idle'`

### Commands
Tutti `manualOnly`, `requiredRole: 'operatore'`.

1. **`portale-testa-2-lampade-uv.accendi`** — label "Accendi lampade", `requiresConfirm` (eye-safety). Handler: `accese=true`.
2. **`portale-testa-2-lampade-uv.spegni`** — label "Spegni lampade", instant. Handler: `accese=false`.
3. **`portale-testa-2-lampade-uv.modifica-potenza`** — label "Modifica potenza", `requiresValueInput: {min:0, max:100, step:5, unit:'%', initial: s=>s.intensita}`. Handler: `intensita = ctx.value`.
4. **`portale-testa-2-lampade-uv.slitta-alta`** — label "Slitta alta", instant. Handler: `slittaPosizione='alta'`.
5. **`portale-testa-2-lampade-uv.slitta-bassa`** — label "Slitta bassa", instant. Handler: `slittaPosizione='bassa'`.

### Panel
Sezione "Stato dei comandi":
- `DataRow` "Lampade" → `Accese` / `Spente`
- `DataRow` "Intensità" → `${intensita} %` (tabular-nums)
- `DataRow` "Slitta" → `Alta` / `Bassa`

### Toolbar
Cinque `CommandButton`. Accendi apre `AlertDialog`. Modifica potenza apre `NumberInputDialog`. Spegni/Slitta sono istantanei.

### Test
- `state.test.ts`: `deriveStatus` per tutte le combinazioni (incluso error con `codiceErrori`).
- `commands.test.ts`: ogni comando modifica la slot corretta; modifica-potenza con `value` nel ctx; `requiresConfirm` solo su Accendi.
- `panel.test.tsx`: tre righe coerenti per gli stati on/off/intensità/slitta.

## 8. Wiring

`src/devices/index.ts`:
- Aggiungere 3 import `Panel`/`Toolbar` (gli stub `import * as ...Meta` sono già presenti).
- Sostituire le 3 entry `entry(...)` con registrazione completa `{ meta, Panel, Toolbar }`.

`src/app.tsx`:
- 3 import `useRegister*`.
- 3 call dentro `App()` accanto agli esistenti `useRegisterPortaleTesta1Tenuta()` ecc.

## 9. Tabular numerals — disciplina

Ogni numero variabile sullo schermo deve usare `tabular-nums`. Audit dei componenti toccati:
- `Gauge` (centre `<span>`) — già presente `tabular-nums`.
- `DataRow` value — già presente `tabular-nums`.
- `NumberInputDialog` input — aggiungere `tabular-nums` allo styling dell'input.

Niente da fare nel resto del codebase (out of scope).

## 10. Out of scope (raccomandazioni future)

Dal sintesi ricerca §1 — *non* implementate in questa design, documentate per follow-up:

1. **Refactor del badge taxonomy**: separare lifecycle (offline/inattivo/attivo) da severity (P3 avviso amber / P2 attenzione / P1 allarme red). NAMUR NE 107 overlay per device health.
2. **Predictive amber** su `Gauge`: arc passa a amber quando il valore entra nel 10–15% finale della banda, red fuori-banda.
3. **Strip persistente Mode/Role** nello shell (top-right): chip amber/red quando `manuale` o `superadmin`.
4. **Sparkline** 60–120 s accanto al `Gauge` della tenuta per distinguere noise da drift.
5. **Tree rollup**: badge della Testa 2 nel device-tree = worst-of dei figli, con superscript count se >1 anomalia.
6. **Theme dark** calibrato per eventuali turni notturni.

Tutto questo migliora il sistema globalmente ma non è bloccante per Testa 2; va in una iterazione successiva (richiede modifiche shell/tree/Gauge condivise).

## 11. Riferimenti ricerca

Sintesi completa in trascritto sessione `2026-05-28`. Standard chiave consultati:
- **ISA-101** — high-performance HMI colour philosophy, gauge guidance, hierarchy.
- **NAMUR NE 107** — device health diagnostics (F/C/S/M).
- **ISO 13850 / IEC 60204-1** — e-stop e colour reservation.
- **ISO 13849** — framing hold-to-run (non-safety-rated su HMI).
- **ISO 9241-410** — touch ergonomics.
- Cluster automotive: BMW digital cluster, Audi Virtual Cockpit, Polestar, MBUX — tabular numerals + damped needle + alarm staging.

## 12. Pre-launch checklist

Prima di chiudere il plan di implementazione:
- [ ] Tutti i test verdi (state + commands + panel × 3 devices + number-input-dialog test)
- [ ] `pnpm exec tsc -b` OK
- [ ] `pnpm exec eslint <new files>` OK
- [ ] Verifica live su :5173: navigazione tra Testa 2 → Gripper / Lampade UV funziona; `NumberInputDialog` apre, valida, conferma; comandi instant e confirm comportano correttamente
- [ ] Memoria aggiornata: aggiungere riga ai "Fatto" di `project_flexpin1_hmi.md` con i 3 device gids/handle e il pattern `NumberInputDialog`/`requiresValueInput`

---

**Approval gate:** questo spec è il contratto. Cambi durante l'implementazione che lo invalidano (es. aggiungere uno stato, cambiare un confirm) richiedono di tornare a brainstorming, non andare di getto.
