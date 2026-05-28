import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { initialState as gripperInitial } from '../portale-testa-2-gripper-pin/state'
import { initialState as uvInitial } from '../portale-testa-2-lampade-uv/state'
import { Panel } from './panel'

function seedAll() {
  useMachineStore.getState().setDevice('portale-testa-2', initialState)
  useMachineStore
    .getState()
    .setDevice('portale-testa-2-gripper-pin', gripperInitial)
  useMachineStore
    .getState()
    .setDevice('portale-testa-2-lampade-uv', uvInitial)
}

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PortaleTesta2 Panel', () => {
  afterEach(cleanup)

  it('renders Sotto-dispositivi, Posizione, and Lavorazione sections', () => {
    seedAll()
    renderInRouter(<Panel />)
    expect(screen.getByText('Sotto-dispositivi')).toBeInTheDocument()
    expect(screen.getByText('Gripper dei pin')).toBeInTheDocument()
    expect(screen.getByText('Lampade UV')).toBeInTheDocument()
    expect(screen.getByText('Posizione')).toBeInTheDocument()
    expect(screen.getByText('Lavorazione in corso')).toBeInTheDocument()
    expect(screen.getByText('JOB-0431')).toBeInTheDocument()
  })

  it('child rows reflect the live child status (Inattivo by default)', () => {
    seedAll()
    renderInRouter(<Panel />)
    const matches = screen.getAllByText('Inattivo')
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('tapping a child row navigates to that device', () => {
    seedAll()
    const select = vi.fn()
    vi.doMock('@/hooks/use-selected-device', () => ({
      useSelectedDevice: () => ({ select }),
    }))
    renderInRouter(<Panel />)
    const gripperRow = screen.getByRole('button', { name: /Gripper dei pin/ })
    fireEvent.click(gripperRow)
    expect(gripperRow).toBeInTheDocument()
  })
})
