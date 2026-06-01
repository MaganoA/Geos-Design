import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('BaiaGrezziTastatore Panel', () => {
  it('renders allineatore lungo and laterali sections', () => {
    useMachineStore
      .getState()
      .setDevice('baia-grezzi-tastatore', initialState)
    render(<Panel />)
    expect(screen.getByText('Allineatore lungo')).toBeInTheDocument()
    expect(screen.getByText('Allineatori laterali')).toBeInTheDocument()
    expect(screen.getByText('Laser 1')).toBeInTheDocument()
    expect(screen.getByText('Sinistra')).toBeInTheDocument()
  })
})
