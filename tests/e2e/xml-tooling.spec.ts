import { expect, test } from '@playwright/test';
import { importFile, resetWorkspace } from './helpers';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.beforeEach(async ({ page }) => {
  await resetWorkspace(page);
  await importFile(page, 'sample.xml', '<root><a>1</a><b>2</b></root>');
});

test('validates XML', async ({ page }) => {
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByText('Valid XML')).toBeVisible();
});

test('formats and minifies XML in place', async ({ page }) => {
  await page.getByRole('button', { name: 'Minify', exact: true }).click();
  await expect(page.getByText('Minified')).toBeVisible();
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(page.getByText('Formatted')).toBeVisible();
});

test('shows the tree view after import (editability wired through)', async ({ page }) => {
  // The XML viewer reuses JsonTreeViewer for the tree display; its keys should be visible.
  await expect(page.getByText('root').first()).toBeVisible();
});

test('converts XML to JSON via the converter modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Convert XML/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'JSON' }).click();
  await expect(dialog.locator('textarea')).toContainText('"a"');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
});
