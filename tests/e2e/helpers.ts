import type { Page } from '@playwright/test';

export async function resetWorkspace(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    indexedDB.deleteDatabase('DnyxDraftDB');
    indexedDB.deleteDatabase('MarkdownViewerDB');
  });
  await page.reload();

  // Dismiss the "What's New" dialog shown on a fresh workspace, if present.
  const whatsNew = page.getByRole('dialog', { name: "What's New" });
  if (await whatsNew.isVisible().catch(() => false)) {
    await whatsNew.getByRole('button', { name: 'Close' }).first().click();
    await whatsNew.waitFor({ state: 'hidden' });
  }
}

export async function importFile(page: Page, filename: string, content: string) {
  await page.getByRole('button', { name: 'Tools', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Import File…' }).click();

  const dialog = page.getByRole('dialog', { name: 'Import File' });
  await dialog.locator('input[type="file"]:not([webkitdirectory])').setInputFiles({
    name: filename,
    mimeType: 'text/plain',
    buffer: Buffer.from(content, 'utf-8'),
  });

  await dialog.waitFor({ state: 'hidden' });
}
