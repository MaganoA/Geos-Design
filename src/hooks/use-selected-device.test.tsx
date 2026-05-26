import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useSelectedDevice } from './use-selected-device'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes><Route path="*" element={children} /></Routes>
    </MemoryRouter>
  )
}

describe('useSelectedDevice', () => {
  it('reads device from URL', () => {
    const { result } = renderHook(() => useSelectedDevice(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/?device=portale-testa-1']}>
          <Routes><Route path="*" element={children} /></Routes>
        </MemoryRouter>
      ),
    })
    expect(result.current.id).toBe('portale-testa-1')
    expect(result.current.device?.meta.label).toBe('Testa 1')
  })

  it('select() updates the URL', () => {
    const { result } = renderHook(() => useSelectedDevice(), { wrapper })
    expect(result.current.id).toBeNull()
    act(() => result.current.select('robot'))
    expect(result.current.id).toBe('robot')
    act(() => result.current.clear())
    expect(result.current.id).toBeNull()
  })
})
