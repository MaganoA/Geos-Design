import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('BaiaGrezziVassoio Panel', () => {
  it('renders Vassoio section with id', () => {
    useMachineStore.getState().setDevice('baia-grezzi-vassoio', initialState)
    render(<Panel />)
    expect(screen.getByText('Vassoio')).toBeInTheDocument()
    expect(screen.getByText('ID vassoio')).toBeInTheDocument()
    expect(screen.getByText('VAS-G-0142')).toBeInTheDocument()
  })
})
