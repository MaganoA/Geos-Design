import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('BaiaLavorati Panel', () => {
  it('renders stato + lastra sections', () => {
    useMachineStore.getState().setDevice('baia-lavorati', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato baia')).toBeInTheDocument()
    expect(screen.getByText('Lastra caricata')).toBeInTheDocument()
    expect(screen.getByText('L-2403-115')).toBeInTheDocument()
  })
})
