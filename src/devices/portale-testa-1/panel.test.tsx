import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta1 Panel', () => {
  it('renders coordinate, insertatura, tenuta, erogatore sections', () => {
    useMachineStore.getState().setDevice('portale-testa-1', initialState)
    render(<Panel />)
    expect(screen.getByText('Coordinate')).toBeInTheDocument()
    expect(screen.getByText('Sistema di insertatura')).toBeInTheDocument()
    expect(screen.getByText('Sistema di prova tenuta')).toBeInTheDocument()
    expect(screen.getByText('Erogatore (resina)')).toBeInTheDocument()
    expect(screen.getByText('JOB-0430')).toBeInTheDocument()
  })
})
