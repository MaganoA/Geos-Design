import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PianoAspirato2 Panel', () => {
  afterEach(cleanup)

  it('renders modalità vuoto plus a 60-cell ventose grid', () => {
    useMachineStore.getState().setDevice('piano-aspirato-2', initialState)
    render(<Panel />)
    expect(screen.getByText('Vuoto')).toBeInTheDocument()
    expect(screen.getAllByRole('switch')).toHaveLength(60)
  })

  it('shows the by-pass count when lastreBypass is non-empty', () => {
    useMachineStore.getState().setDevice('piano-aspirato-2', {
      ...initialState,
      lastreBypass: ['L-001', 'L-005', 'L-009'],
    })
    render(<Panel />)
    expect(screen.getByText('Lastre in by-pass')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('tapping a ventosa toggles its abilitata flag', () => {
    useMachineStore.getState().setDevice('piano-aspirato-2', initialState)
    render(<Panel />)
    const cells = screen.getAllByRole('switch')
    fireEvent.click(cells[7]!)
    const after = useMachineStore.getState().devices[
      'piano-aspirato-2'
    ] as typeof initialState
    expect(after.ventose[7]!.abilitata).toBe(false)
  })
})
