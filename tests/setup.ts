import '@testing-library/jest-dom/vitest'

// jsdom doesn't ship matchMedia; the Scrubber primitive (and any other
// hover/pointer-aware UI) needs it. Polyfill once for the whole suite.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
