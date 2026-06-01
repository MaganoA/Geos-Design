import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ErogazioneResina Panel', () => {
  it('renders sistema di erogazione section', () => {
    useMachineStore.getState().setDevice('erogazione-resina', initialState)
    render(<Panel />)
    expect(screen.getByText('Sistema di erogazione')).toBeInTheDocument()
    expect(screen.getByText('ID resina')).toBeInTheDocument()
    expect(screen.getByText('RES-EPX-228')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
    // codiceStato is the right-panel badge — must NOT leak into the body
    expect(screen.queryByText('Codice stato')).not.toBeInTheDocument()
  })
})
