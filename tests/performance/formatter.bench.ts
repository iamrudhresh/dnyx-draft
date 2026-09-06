import { bench, describe } from 'vitest';
import { formatMarkdownDocument } from '@/lib/utils/markdown-formatter';

// ---------------------------------------------------------------------------
// Sample documents of varying complexity
// ---------------------------------------------------------------------------

const SMALL_TABLE = `| Name | Age | City |
| --- | --- | --- |
| Alice | 25 | New York |
| Bob | 30 | San Francisco |
| Carol | 22 | London |`;

const MEDIUM_DOCUMENT = `---
title: Benchmark Document
date: 2024-01-01
author: Test
---

# Introduction

This document tests the performance of the Markdown formatter across
multiple sections containing prose, code, and tabular data.

## Data Overview

${Array.from({ length: 10 }, (_, i) => `| Column${i + 1} | Value${i + 1} | Notes${i + 1} |`).join('\n')}
| --- | --- | --- |
${Array.from({ length: 20 }, (_, i) => `| Row${i + 1} | ${i * 10} | Some note ${i + 1} |`).join('\n')}

## Code Section

\`\`\`typescript
function example(n: number): string {
  return Array.from({ length: n }, (_, i) => \`item-\${i}\`).join(', ');
}
\`\`\`

## Math

$$
E = mc^2
\\sum_{i=0}^{n} i = \\frac{n(n+1)}{2}
$$

## Nested Tables

| Feature | Status | Priority |
| --- | --- | --- |
| Table formatting | Done | High |
| Code fence skip | Done | High |
| Math block skip | Done | Medium |
| Frontmatter skip | Done | Low |
`;

// Generate a large document with many tables and code fences
const LARGE_DOCUMENT = Array.from({ length: 50 }, (_, section) =>
  [
    `## Section ${section + 1}`,
    '',
    `Prose content for section ${section + 1} with some explanation text.`,
    '',
    '| Name | Score | Grade |',
    '| --- | --- | --- |',
    ...Array.from({ length: 5 }, (_, r) => `| Student ${r + 1} | ${80 + r} | A |`),
    '',
    '```ts',
    `const result${section} = compute(${section});`,
    '```',
    '',
  ].join('\n'),
).join('\n');

const PROSE_ONLY = `
# Long prose document without any tables

${Array.from({ length: 100 }, (_, i) =>
  `Paragraph ${i + 1}: The quick brown fox jumps over the lazy dog. ` +
  'This sentence is repeated to generate sufficient text volume for benchmarking.',
).join('\n\n')}
`;

const TABLE_HEAVY = Array.from({ length: 30 }, (_, t) =>
  [
    `| Table${t + 1}Col1 | Table${t + 1}Col2 | Table${t + 1}Col3 | Table${t + 1}Col4 |`,
    '| --- | --- | --- | --- |',
    ...Array.from({ length: 8 }, (_, r) =>
      `| Row${r + 1}Data${t + 1} | ${r * 100} | some-value-${r} | status-${r % 3} |`,
    ),
    '',
  ].join('\n'),
).join('\n');

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe('formatMarkdownDocument performance', () => {
  bench('small — 5-row table (baseline)', () => {
    formatMarkdownDocument(SMALL_TABLE);
  });

  bench('medium — frontmatter + prose + 1 large table + code fence + math', () => {
    formatMarkdownDocument(MEDIUM_DOCUMENT);
  });

  bench('large — 50 sections with tables and code fences', () => {
    formatMarkdownDocument(LARGE_DOCUMENT);
  });

  bench('prose-only — 100 paragraphs (no tables, formatter pass-through)', () => {
    formatMarkdownDocument(PROSE_ONLY);
  });

  bench('table-heavy — 30 tables × 8 rows × 4 columns', () => {
    formatMarkdownDocument(TABLE_HEAVY);
  });
});
