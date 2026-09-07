import { describe, expect, it } from 'vitest';
import {
  calculateDocumentMetrics,
  convertCsvToMarkdown,
  formatMarkdownDocument,
  formatMarkdownTables,
} from '@/lib/utils/markdown-formatter';

// ---------------------------------------------------------------------------
// formatMarkdownDocument — grammar-aware table alignment
// ---------------------------------------------------------------------------
describe('formatMarkdownDocument — table alignment', () => {
  it('aligns an unaligned table with uniform column padding', () => {
    const input = `| Name | Age | City |
| --- | --- | --- |
| Alice | 25 | New York |
| Bob | 30 | San Francisco |`;

    const out = formatMarkdownDocument(input);
    expect(out).toContain('| Alice | 25  | New York      |');
    expect(out).toContain('| Bob   | 30  | San Francisco |');
  });

  it('preserves separator alignment markers (left / center / right)', () => {
    const input = `| A | B | C |
| :--- | :---: | ---: |
| x | y | z |`;

    const out = formatMarkdownDocument(input);
    // The formatter normalises separator width to match column width.
    // A/B/C are each 1 char wide → min 3 → separators become `:--`, `:-:`, `--:`.
    expect(out).toMatch(/:-+/); // left-aligned marker present
    expect(out).toMatch(/:-+:/); // center-aligned marker present
    expect(out).toMatch(/-+:/); // right-aligned marker present
  });

  it('does NOT reformat content inside a fenced code block', () => {
    const raw = '| a | b |\n| - | - |\n| 1 | 2 |';
    const input = `\`\`\`markdown\n${raw}\n\`\`\``;

    const out = formatMarkdownDocument(input);
    // The table inside the fence must be left exactly as-is
    expect(out).toBe(input);
  });

  it('does NOT touch ~~~ fenced code blocks', () => {
    const input = `~~~\n| x | y |\n| - | - |\n~~~`;
    const out = formatMarkdownDocument(input);
    expect(out).toBe(input);
  });

  it('does NOT reformat content inside a $$ math block', () => {
    const input = `$$\na + b = c\n$$`;
    const out = formatMarkdownDocument(input);
    expect(out).toBe(input);
  });

  it('preserves YAML frontmatter unchanged', () => {
    const input = `---\ntitle: My Doc\ndate: 2024-01-01\n---\n\n# Hello\n`;
    const out = formatMarkdownDocument(input);
    expect(out.startsWith('---\ntitle: My Doc\ndate: 2024-01-01\n---')).toBe(true);
  });

  it('formats tables that appear after frontmatter', () => {
    const input = `---\ntitle: Test\n---\n\n| A | B |\n| - | - |\n| long value | x |`;
    const out = formatMarkdownDocument(input);
    // Column B minimum width is 3 (from separator `---`), so `x` pads to `x  ` and `B` to `B  `.
    expect(out).toContain('| long value | x   |');
    expect(out).toContain('| A          | B   |');
  });

  it('handles a document mixing frontmatter, prose, code, math, and tables', () => {
    const input = [
      '---',
      'title: Mixed',
      '---',
      '',
      '# Section',
      '',
      '```ts',
      'const x = 1;',
      '```',
      '',
      '| Col1 | Col2 |',
      '| --- | --- |',
      '| hello | world |',
      '',
      '$$',
      'E = mc^2',
      '$$',
    ].join('\n');

    const out = formatMarkdownDocument(input);
    // Frontmatter intact
    expect(out).toContain('title: Mixed');
    // Code block intact
    expect(out).toContain('const x = 1;');
    // Table formatted
    expect(out).toContain('| hello | world |');
    // Math block intact
    expect(out).toContain('E = mc^2');
  });

  it('returns empty string unchanged', () => {
    expect(formatMarkdownDocument('')).toBe('');
  });

  it('returns frontmatter-only document unchanged', () => {
    const input = '---\ntitle: Only frontmatter\n---';
    expect(formatMarkdownDocument(input)).toBe(input);
  });
});

// ---------------------------------------------------------------------------
// formatMarkdownTables — legacy alias delegates to formatMarkdownDocument
// ---------------------------------------------------------------------------
describe('formatMarkdownTables (backwards-compat alias)', () => {
  it('still aligns tables correctly', () => {
    const input = `| Name | Age | City |
| --- | --- | --- |
| Alice | 25 | New York |
| Bob | 30 | San Francisco |`;

    const out = formatMarkdownTables(input);
    expect(out).toContain('| Alice | 25  | New York      |');
    expect(out).toContain('| Bob   | 30  | San Francisco |');
  });
});

// ---------------------------------------------------------------------------
// convertCsvToMarkdown
// ---------------------------------------------------------------------------
describe('convertCsvToMarkdown', () => {
  it('converts CSV to aligned markdown table', () => {
    const csv = `Fruit,Quantity,Color\nApple,10,Red\nBanana,5,Yellow\nOrange,8,Orange`;
    const md = convertCsvToMarkdown(csv);
    expect(md).toContain('| Fruit');
    expect(md).toContain('| Apple');
    expect(md).toContain('| Banana');
    expect(md).toContain('| Orange');
  });

  it('converts TSV (tab-separated) data correctly', () => {
    const tsv = `A\tB\nfoo\tbar`;
    const md = convertCsvToMarkdown(tsv);
    expect(md).toContain('| A');
    expect(md).toContain('| foo');
  });

  it('strips surrounding quotes from cells', () => {
    const csv = `"Name","Value"\n"Alice","42"`;
    const md = convertCsvToMarkdown(csv);
    expect(md).toContain('Name');
    expect(md).not.toContain('"Name"');
  });
});

// ---------------------------------------------------------------------------
// calculateDocumentMetrics
// ---------------------------------------------------------------------------
describe('calculateDocumentMetrics', () => {
  it('calculates Flesch score, word count, and reading time', () => {
    const text =
      'Dnyx Draft is a fast, local-first editor. It enables technical teams to write, preview, and format documentation.';
    const m = calculateDocumentMetrics(text);

    expect(m.wordCount).toBeGreaterThan(10);
    expect(m.sentenceCount).toBeGreaterThanOrEqual(1);
    expect(m.fleschScore).toBeGreaterThanOrEqual(0);
    expect(m.fleschScore).toBeLessThanOrEqual(100);
    expect(m.readingTimeMin).toBeGreaterThanOrEqual(1);
    expect(m.speakingTimeMin).toBeGreaterThanOrEqual(1);
  });

  it('returns valid values for single-word input', () => {
    const m = calculateDocumentMetrics('Hello');
    expect(m.wordCount).toBe(1);
    expect(m.fleschScore).toBeGreaterThanOrEqual(0);
  });

  it('clamps Flesch score between 0 and 100', () => {
    // Dense academic text — should score low but never negative
    const dense =
      'Epistemological hermeneutics poststructuralist deconstruction phenomenological.'.repeat(5);
    const m = calculateDocumentMetrics(dense);
    expect(m.fleschScore).toBeGreaterThanOrEqual(0);
    expect(m.fleschScore).toBeLessThanOrEqual(100);
  });
});
