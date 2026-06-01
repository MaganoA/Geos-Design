import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('DispenserDistanziali Panel', () => {
  it('renders dispenser section (no pistoni grid — covered by toolbar)', () => {
    useMachineStore.getState().setDevice('dispenser-distanziali', initialState)
    render(<Panel />)
    expect(screen.getByText('Dispenser')).toBeInTheDocument()
    expect(screen.getByText('DST-2.4-AL')).toBeInTheDocument()
    expect(screen.queryByText(/Pistoni \(/)).not.toBeInTheDocument()
    expect(screen.queryByText('Codice stato')).not.toBeInTheDocument()
  })
})
