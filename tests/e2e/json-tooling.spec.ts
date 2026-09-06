import { expect, test } from '@playwright/test';
import { importFile, resetWorkspace } from './helpers';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.beforeEach(async ({ page }) => {
  await resetWorkspace(page);
  await importFile(page, 'sample.json', '{"a": 1, "b": [1, 2, 3]}');
});

test('validates JSON', async ({ page }) => {
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByText('Valid JSON')).toBeVisible();
});

test('minifies JSON in place', async ({ page }) => {
  await page.getByRole('button', { name: 'Minify', exact: true }).click();
  await expect(page.getByText('Minified')).toBeVisible();
});

test('formats JSON in place', async ({ page }) => {
  await page.getByRole('button', { name: 'Minify', exact: true }).click();
  await expect(page.getByText('Minified')).toBeVisible();
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(page.getByText('Formatted')).toBeVisible();
});

test('converts JSON to XML via the converter modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Convert JSON/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'XML' }).click();
  await expect(dialog.locator('textarea')).toContainText('<a>1</a>');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
});

test('escapes JSON content to the clipboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Escape/Unescape' }).click();
  await page.getByRole('menuitem', { name: 'JSON escape' }).click();
  await expect(page.getByText('Copied to clipboard')).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.startsWith('"')).toBe(true);
});
