import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ErogazioneResinaErogatore Panel', () => {
  it('renders erogatore section with stato and aria', () => {
    useMachineStore
      .getState()
      .setDevice('erogazione-resina-erogatore', initialState)
    render(<Panel />)
    expect(screen.getByText('Erogatore')).toBeInTheDocument()
    expect(screen.getByText('Chiuso')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
  })
})
