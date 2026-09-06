import { expect, test } from '@playwright/test';
import { importFile, resetWorkspace } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetWorkspace(page);
  await importFile(page, 'sample.csv', 'name,age\nAlice,30\nBob,25\n');
});

test('renders imported rows in the table', async ({ page }) => {
  await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Bob' })).toBeVisible();
});

test('validates CSV', async ({ page }) => {
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByText('Valid CSV')).toBeVisible();
});

test('formats and minifies CSV in place', async ({ page }) => {
  await page.getByRole('button', { name: 'Minify', exact: true }).click();
  await expect(page.getByText('Minified')).toBeVisible();
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(page.getByText('Formatted')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible();
});

test('converts CSV to JSON via the converter modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Convert CSV/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'JSON' }).click();
  await expect(dialog.locator('textarea')).toContainText('Alice');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
});
