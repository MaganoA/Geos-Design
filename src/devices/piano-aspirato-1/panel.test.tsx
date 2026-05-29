import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PianoAspirato1 Panel', () => {
  afterEach(cleanup)

  it('renders modalità vuoto plus a 60-cell ventose grid', () => {
    useMachineStore.getState().setDevice('piano-aspirato-1', initialState)
    render(<Panel />)
    expect(screen.getByText('Vuoto')).toBeInTheDocument()
    expect(screen.getAllByRole('switch')).toHaveLength(60)
  })

  it('tapping a ventosa toggles its abilitata flag', () => {
    useMachineStore.getState().setDevice('piano-aspirato-1', initialState)
    render(<Panel />)
    const cells = screen.getAllByRole('switch')
    fireEvent.click(cells[5]!)
    const after = useMachineStore.getState().devices[
      'piano-aspirato-1'
    ] as typeof initialState
    expect(after.ventose[5]!.abilitata).toBe(false)
    expect(after.ventose[5]!.stato).toBe('disattiva')
  })
})
