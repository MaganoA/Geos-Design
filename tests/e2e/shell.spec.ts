import { test, expect } from '@playwright/test'

test('shell renders TopBar, LeftPanel, Viewport', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Flex 3')).toBeVisible()
  await expect(page.getByText('FlexPin')).toBeVisible()
  await expect(page.getByText('Attivo')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
})

test('tree expands Portale and selects Testa 1', async ({ page }) => {
  await page.goto('/')
  // The Portale node is expanded by default; Testa 1 should be visible
  // immediately. Click it to drive the URL selection.
  await page.getByRole('button', { name: 'Testa 1', exact: true }).click()
  await expect(page).toHaveURL(/device=portale-testa-1/)
})
