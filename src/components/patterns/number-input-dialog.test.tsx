import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberInputDialog } from './number-input-dialog'

describe('NumberInputDialog', () => {
  afterEach(cleanup)

  it('opens via the trigger and seeds the input with initialValue', async () => {
    const user = userEvent.setup()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="Modifica angolo"
        min={0}
        max={90}
        unit="°"
        initialValue={45}
        onConfirm={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.value).toBe('45')
  })

  it('confirms with the typed value and closes', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="Modifica angolo"
        min={0}
        max={90}
        initialValue={45}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(input, { target: { value: '60' } })
    await user.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(onConfirm).toHaveBeenCalledWith(60)
  })

  it('clamps the confirmed value to [min, max]', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="Modifica potenza"
        min={0}
        max={100}
        initialValue={50}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(input, { target: { value: '150' } })
    await user.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(onConfirm).toHaveBeenCalledWith(100)
  })

  it('does not call onConfirm when Annulla is pressed', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NumberInputDialog
        trigger={<button type="button">Open</button>}
        title="X"
        min={0}
        max={10}
        initialValue={5}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
