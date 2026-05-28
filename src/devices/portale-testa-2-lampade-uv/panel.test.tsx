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
