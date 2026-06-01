import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('SpeedSoffiatore Panel', () => {
  afterEach(cleanup)

  it('shows the blower off by default', () => {
    useMachineStore.getState().setDevice('speed-soffiatore', initialState)
    render(<Panel />)
    expect(screen.getByText('Soffiatore')).toBeInTheDocument()
    expect(screen.getByText('Spento')).toBeInTheDocument()
  })

  it('reflects an active blower', () => {
    useMachineStore.getState().setDevice('speed-soffiatore', {
      ...initialState,
      accese: true,
      status: 'active',
    })
    render(<Panel />)
    expect(screen.getByText('Acceso')).toBeInTheDocument()
  })
})
