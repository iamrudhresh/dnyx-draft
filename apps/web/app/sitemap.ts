import type { MetadataRoute } from 'next';

const BASE_URL = 'https://draft.dnyxgroup.com';

/**
 * All 15 supported locales and their hreflang codes.
 * The canonical English base URL counts as one entry; each additional
 * locale maps to a query-parameter URL so search engines can index
 * them as distinct resources.
 */
const LOCALES: { lang: string; hreflang: string }[] = [
  { lang: 'en', hreflang: 'en' },
  { lang: 'zh', hreflang: 'zh-Hans' },
  { lang: 'ja', hreflang: 'ja' },
  { lang: 'ko', hreflang: 'ko' },
  { lang: 'fr', hreflang: 'fr' },
  { lang: 'de', hreflang: 'de' },
  { lang: 'es', hreflang: 'es' },
  { lang: 'pt-BR', hreflang: 'pt-BR' },
  { lang: 'ru', hreflang: 'ru' },
  { lang: 'ar', hreflang: 'ar' },
  { lang: 'hi', hreflang: 'hi' },
  { lang: 'bg', hreflang: 'bg' },
  { lang: 'tr', hreflang: 'tr' },
  { lang: 'it', hreflang: 'it' },
  { lang: 'nl', hreflang: 'nl' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Main app pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/readme-builder`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Localized alternate URLs — one entry per locale so each hreflang
  // variant is independently indexable with its own canonical.
  const localizedPages: MetadataRoute.Sitemap = LOCALES.filter((l) => l.lang !== 'en').map(
    ({ lang }) => ({
      url: `${BASE_URL}/?lang=${lang}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }),
  );

  return [...staticPages, ...localizedPages];
}
