import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('DispenserDistanziali Panel', () => {
  it('renders dispenser + pistoni sections', () => {
    useMachineStore.getState().setDevice('dispenser-distanziali', initialState)
    render(<Panel />)
    expect(screen.getByText('Dispenser')).toBeInTheDocument()
    expect(screen.getByText('Pistoni (6)')).toBeInTheDocument()
    expect(screen.getByText('DST-2.4-AL')).toBeInTheDocument()
    expect(screen.getByText('P1')).toBeInTheDocument()
    expect(screen.getByText('P6')).toBeInTheDocument()
  })
})
