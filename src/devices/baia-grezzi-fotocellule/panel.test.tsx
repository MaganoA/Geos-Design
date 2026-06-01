import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('BaiaGrezziFotocellule Panel', () => {
  it('renders sicurezza section with stato', () => {
    useMachineStore
      .getState()
      .setDevice('baia-grezzi-fotocellule', initialState)
    render(<Panel />)
    expect(screen.getByText('Sistema sicurezza intrusione')).toBeInTheDocument()
    expect(screen.getByText('Stato')).toBeInTheDocument()
    expect(screen.getByText('Attiva')).toBeInTheDocument()
  })
})
