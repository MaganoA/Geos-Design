import { describe, it, expect } from 'vitest'
import {
  initialState,
  deriveStatus,
  recomputeVentose,
  VENTOSE_LAYOUT,
  type PianoAspirato1State,
} from './state'

describe('piano-aspirato-1 state', () => {
  it('exposes the 5×12 = 60 ventose layout constants', () => {
    expect(VENTOSE_LAYOUT.rows).toBe(5)
    expect(VENTOSE_LAYOUT.cols).toBe(12)
    expect(VENTOSE_LAYOUT.total).toBe(60)
    expect(VENTOSE_LAYOUT.boardDimensions).toEqual({
      width: 3720,
      height: 1600,
    })
    expect(VENTOSE_LAYOUT.distance).toEqual({ x: 310, y: 320 })
    expect(VENTOSE_LAYOUT.firstCup).toEqual({ x: 40, y: 40 })
    expect(VENTOSE_LAYOUT.cupSize).toBe(82)
  })

  it('starts in vuoto with 60 ventose all abilitate and attive', () => {
    expect(initialState.modalita).toBe('vuoto')
    expect(initialState.ventose).toHaveLength(60)
    expect(initialState.ventose.every((v) => v.abilitata)).toBe(true)
    expect(initialState.ventose.every((v) => v.stato === 'attiva')).toBe(true)
    expect(initialState.status).toBe('active')
  })

  it('recomputeVentose: vuoto + abilitata → attiva; soffio or !abilitata → disattiva', () => {
    const mixed: PianoAspirato1State['ventose'] = [
      { stato: 'disattiva', abilitata: true },
      { stato: 'attiva', abilitata: false },
      { stato: 'disattiva', abilitata: true },
    ]
    const inVuoto = recomputeVentose(mixed, 'vuoto')
    expect(inVuoto[0]!.stato).toBe('attiva')
    expect(inVuoto[1]!.stato).toBe('disattiva') // not abilitata
    expect(inVuoto[2]!.stato).toBe('attiva')

    const inSoffio = recomputeVentose(mixed, 'soffio')
    expect(inSoffio.every((v) => v.stato === 'disattiva')).toBe(true)
  })

  it('deriveStatus: errors → error; otherwise active', () => {
    expect(deriveStatus(['VAC-1'])).toBe('error')
    expect(deriveStatus([])).toBe('active')
  })
})
