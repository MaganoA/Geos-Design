import { test, expect } from '@playwright/test'

// WebGL canvas + continuous useFrame loop means the page never reaches a
// "stable" state by Playwright's default 5 s window — the camera damping
// fades to within sub-pixel motion, but never to literal zero. Loosen
// the comparison timeout per-shot so the baseline can be generated.
const SHOT_TIMEOUT = 30_000

test('@visual shell baseline at 1920x1080', async ({ page }) => {
  await page.goto('/')
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(1500)
  await expect(page).toHaveScreenshot('shell.png', {
    maxDiffPixels: 200,
    timeout: SHOT_TIMEOUT,
  })
})

test('@visual Portale Testa 1 selected', async ({ page }) => {
  await page.goto('/?device=portale-testa-1')
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(1500)
  await expect(page).toHaveScreenshot('portale-testa-1.png', {
    maxDiffPixels: 500,
    timeout: SHOT_TIMEOUT,
  })
})
