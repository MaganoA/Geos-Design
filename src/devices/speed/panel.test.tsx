import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('Speed Panel', () => {
  afterEach(cleanup)

  it('renders position, velocità, angoli, utensili', () => {
    useMachineStore.getState().setDevice('speed', {
      ...initialState,
      angoloAsseC: 45.5,
      angoloRalla: 12,
      velocitaRelazionale: 248,
    })
    render(<Panel />)
    expect(screen.getByText('Posizione')).toBeInTheDocument()
    expect(screen.getByText('Macchinario')).toBeInTheDocument()
    expect(screen.getByText('Utensile connesso')).toBeInTheDocument()
    expect(screen.getByText('T07')).toBeInTheDocument()
    expect(screen.getByText('T12')).toBeInTheDocument()
    expect(screen.getByText('45.5°')).toBeInTheDocument()
    expect(screen.getByText('12.0°')).toBeInTheDocument()
    expect(screen.getByText('248 mm/s')).toBeInTheDocument()
  })
})
