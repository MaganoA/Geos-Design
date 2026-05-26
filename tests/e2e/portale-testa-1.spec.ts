import { test, expect } from '@playwright/test'

test('Portale Testa 1: select → panel → command → close', async ({ page }) => {
  await page.goto('/?device=portale-testa-1')
  await expect(page.getByText('Coordinate')).toBeVisible()
  await expect(page.getByText('Sistema di insertatura')).toBeVisible()
  await expect(page.getByText('JOB-0430', { exact: true })).toBeVisible()

  // Riposo 1 command should set positionTarget to (0,0,0) and the tick
  // should animate X downward from its initial ~1264 value.
  await page.getByRole('button', { name: 'Riposo 1' }).click()
  await page.waitForFunction(
    () => {
      const nodes = Array.from(document.querySelectorAll('span'))
      const xMatch = nodes.find((n) => /^\d+(\.\d+)? mm$/.test((n.textContent ?? '').trim()))
      if (!xMatch) return false
      const v = parseFloat(xMatch.textContent ?? '0')
      return v < 1264
    },
    null,
    { timeout: 6000 },
  )

  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page).toHaveURL(/^http:\/\/localhost:5173\/?$/)
})
