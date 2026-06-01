import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('BaiaGrezzi Panel', () => {
  it('renders stato baia and lastra sections', () => {
    useMachineStore.getState().setDevice('baia-grezzi', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato baia')).toBeInTheDocument()
    expect(screen.getByText('Lastra caricata')).toBeInTheDocument()
    expect(screen.getByText('L-2403-117')).toBeInTheDocument()
    expect(screen.getByText('Presente')).toBeInTheDocument()
    expect(screen.getByText('Attive')).toBeInTheDocument()
  })
})
