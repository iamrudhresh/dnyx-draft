import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';

const BASE_URL = 'https://draft.dnyxgroup.com';

const EXPECTED_LOCALES = ['zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt-BR', 'ru', 'ar', 'hi', 'bg', 'tr', 'it', 'nl'];

describe('sitemap()', () => {
  it('returns exactly 16 entries (2 static + 14 locale alternates)', () => {
    const entries = sitemap();
    // 2 static pages + 14 non-English locales (en is the canonical base)
    expect(entries).toHaveLength(16);
  });

  it('includes the canonical root URL with priority 1.0', () => {
    const entries = sitemap();
    const root = entries.find((e) => e.url === BASE_URL);
    expect(root).toBeDefined();
    expect(root?.priority).toBe(1.0);
    expect(root?.changeFrequency).toBe('weekly');
  });

  it('includes /readme-builder with priority 0.8', () => {
    const entries = sitemap();
    const builder = entries.find((e) => e.url === `${BASE_URL}/readme-builder`);
    expect(builder).toBeDefined();
    expect(builder?.priority).toBe(0.8);
    expect(builder?.changeFrequency).toBe('monthly');
  });

  it('includes a localized entry for every non-English locale', () => {
    const entries = sitemap();
    for (const lang of EXPECTED_LOCALES) {
      const found = entries.some((e) => e.url === `${BASE_URL}/?lang=${lang}`);
      expect(found, `missing locale entry for ${lang}`).toBe(true);
    }
  });

  it('does NOT include an English locale query-param URL (en uses canonical)', () => {
    const entries = sitemap();
    const enLocale = entries.find((e) => e.url === `${BASE_URL}/?lang=en`);
    expect(enLocale).toBeUndefined();
  });

  it('all locale entries have priority 0.7', () => {
    const entries = sitemap();
    const localeEntries = entries.filter((e) => e.url.includes('?lang='));
    expect(localeEntries.length).toBe(14);
    for (const entry of localeEntries) {
      expect(entry.priority).toBe(0.7);
    }
  });

  it('all locale entries use changeFrequency "monthly"', () => {
    const entries = sitemap();
    const localeEntries = entries.filter((e) => e.url.includes('?lang='));
    for (const entry of localeEntries) {
      expect(entry.changeFrequency).toBe('monthly');
    }
  });

  it('all entries have a lastModified date', () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });

  it('all URLs are absolute and start with the base URL', () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(entry.url.startsWith(BASE_URL)).toBe(true);
    }
  });

  it('no duplicate URLs', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);
  });
});
