import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('BaiaLavoratiVassoio Panel', () => {
  it('renders Vassoio section with id', () => {
    useMachineStore.getState().setDevice('baia-lavorati-vassoio', initialState)
    render(<Panel />)
    expect(screen.getByText('Vassoio')).toBeInTheDocument()
    expect(screen.getByText('VAS-L-0091')).toBeInTheDocument()
  })
})
