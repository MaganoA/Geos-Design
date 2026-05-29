import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type RobotState } from './state'
import { commands, POSITION_PRESETS } from './commands'

const ctx: CommandCtx = {
  deviceId: 'robot',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): RobotState {
  return useMachineStore.getState().devices['robot'] as RobotState
}

describe('robot commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('robot', initialState)
  })

  it('all 5 macros are manual-only operatore commands', () => {
    expect(commands).toHaveLength(5)
    for (const c of commands) {
      expect(c.requiredRole).toBe('operatore')
      expect(c.manualOnly).toBe(true)
    }
  })

  it('tutto-a-sinistra writes the left-end preset', () => {
    run('robot.tutto-a-sinistra')
    const s = read()
    expect(s.angoli).toEqual(POSITION_PRESETS['tutto-a-sinistra']!.angoli)
    expect(s.distanza).toBe(POSITION_PRESETS['tutto-a-sinistra']!.distanza)
  })

  it('tutto-a-destra writes the right-end preset', () => {
    run('robot.tutto-a-destra')
    const s = read()
    expect(s.angoli).toEqual(POSITION_PRESETS['tutto-a-destra']!.angoli)
    expect(s.distanza).toBe(POSITION_PRESETS['tutto-a-destra']!.distanza)
  })

  it('vai-piano-aspirato writes the suction-frame preset', () => {
    run('robot.vai-piano-aspirato')
    const s = read()
    expect(s.angoli).toEqual(POSITION_PRESETS['vai-piano-aspirato']!.angoli)
    expect(s.distanza).toBe(POSITION_PRESETS['vai-piano-aspirato']!.distanza)
  })

  it('vai-baia-grezzi writes the grezzi-bay preset', () => {
    run('robot.vai-baia-grezzi')
    const s = read()
    expect(s.angoli).toEqual(POSITION_PRESETS['vai-baia-grezzi']!.angoli)
  })

  it('vai-baia-lavorati writes the lavorati-bay preset', () => {
    run('robot.vai-baia-lavorati')
    const s = read()
    expect(s.angoli).toEqual(POSITION_PRESETS['vai-baia-lavorati']!.angoli)
  })

  it('all five presets touch six angles', () => {
    for (const preset of Object.values(POSITION_PRESETS)) {
      expect(preset.angoli).toHaveLength(6)
    }
  })
})
