import { expect, test } from '@playwright/test';
import { importFile, resetWorkspace } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetWorkspace(page);
  await importFile(page, 'sample.yaml', 'a: 1\nb:\n  - 1\n  - 2\n');
});

test('validates YAML', async ({ page }) => {
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByText('Valid YAML')).toBeVisible();
});

test('formats and minifies YAML in place', async ({ page }) => {
  await page.getByRole('button', { name: 'Minify', exact: true }).click();
  await expect(page.getByText('Minified')).toBeVisible();
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(page.getByText('Formatted')).toBeVisible();
});

test('converts YAML to JSON via the converter modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Convert YAML/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'JSON' }).click();
  await expect(dialog.locator('textarea')).toContainText('"a": 1');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
});
