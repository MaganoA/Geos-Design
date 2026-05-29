import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta2 Panel', () => {
  it('renders Posizione and Lavorazione sections (no Sotto-dispositivi rollup)', () => {
    useMachineStore.getState().setDevice('portale-testa-2', initialState)
    render(<Panel />)
    expect(screen.getByText('Posizione')).toBeInTheDocument()
    expect(screen.getByText('Lavorazione in corso')).toBeInTheDocument()
    expect(screen.getByText('JOB-0431')).toBeInTheDocument()
    // Rollup removed by request — Sotto-dispositivi section must not appear.
    expect(screen.queryByText('Sotto-dispositivi')).not.toBeInTheDocument()
    expect(screen.queryByText('Gripper dei pin')).not.toBeInTheDocument()
    expect(screen.queryByText('Lampade UV')).not.toBeInTheDocument()
  })
})
