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
