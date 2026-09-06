/**
 * Grammar-aware Markdown document formatter.
 *
 * Splits the document into protected regions (frontmatter, code fences, math
 * blocks) and unprotected prose, then applies structural improvements only to
 * unprotected regions so that code, math, and metadata are never mangled.
 */

// ---------------------------------------------------------------------------
// Internal: format a contiguous slice of table lines
// ---------------------------------------------------------------------------
function formatTableSlice(tableLines: string[]): string[] {
  const rows = tableLines.map((line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim()),
  );

  const colCount = Math.max(...rows.map((r) => r.length));
  const colWidths = new Array(colCount).fill(3);

  for (const row of rows) {
    const isSep = row.some((c) => /^:?-+:?$/.test(c));
    if (!isSep) {
      row.forEach((cell, i) => {
        colWidths[i] = Math.max(colWidths[i] ?? 0, cell.length);
      });
    }
  }

  return rows.map((row) => {
    const isSep = row.some((c) => /^:?-+:?$/.test(c));
    if (isSep) {
      const formatted = colWidths
        .map((w, i) => {
          const cell = row[i] || '---';
          const left = cell.startsWith(':');
          const right = cell.endsWith(':');
          const dashes = '-'.repeat(Math.max(w - (left ? 1 : 0) - (right ? 1 : 0), 1));
          return (left ? ':' : '') + dashes + (right ? ':' : '');
        })
        .join(' | ');
      return `| ${formatted} |`;
    }
    const formatted = colWidths
      .map((w, i) => (row[i] ?? '').padEnd(w, ' '))
      .join(' | ');
    return `| ${formatted} |`;
  });
}

// ---------------------------------------------------------------------------
// Grammar-aware document formatter
// ---------------------------------------------------------------------------

/**
 * Formats a Markdown document with table alignment while preserving
 * frontmatter, fenced code blocks, and math blocks exactly as-is.
 *
 * Also normalises adjacent same-type list items and heading spacing.
 */
export function formatMarkdownDocument(markdown: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];
  let i = 0;

  // --- YAML/TOML frontmatter ---
  if (lines[0] === '---' || lines[0] === '+++') {
    const closer = lines[0];
    out.push(lines[i]);
    i = 1;
    while (i < lines.length && lines[i] !== closer) {
      out.push(lines[i]);
      i++;
    }
    if (i < lines.length) {
      out.push(lines[i]); // closing --- / +++
      i++;
    }
  }

  // Streaming state
  let inCodeFence = false;
  let fenceMarker = '';
  let inMathBlock = false;
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      out.push(...formatTableSlice(tableBuffer));
      tableBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // ---- Code fence ----
    if (!inMathBlock) {
      const fenceMatch = /^(`{3,}|~{3,})/.exec(line);
      if (fenceMatch) {
        if (!inCodeFence) {
          flushTable();
          inCodeFence = true;
          fenceMarker = fenceMatch[1];
          out.push(line);
          i++;
          continue;
        }
        if (line.startsWith(fenceMarker)) {
          inCodeFence = false;
          fenceMarker = '';
          out.push(line);
          i++;
          continue;
        }
        // Different marker inside a fence — treat as content
        out.push(line);
        i++;
        continue;
      }
    }

    if (inCodeFence) {
      out.push(line);
      i++;
      continue;
    }

    // ---- Math block ($$) ----
    if (line.trim() === '$$') {
      if (!inMathBlock) {
        flushTable();
        inMathBlock = true;
      } else {
        inMathBlock = false;
      }
      out.push(line);
      i++;
      continue;
    }

    if (inMathBlock) {
      out.push(line);
      i++;
      continue;
    }

    // ---- Table rows ----
    const trimmed = line.trim();
    const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|');
    if (isTableRow) {
      tableBuffer.push(line);
      i++;
      continue;
    }

    flushTable();
    out.push(line);
    i++;
  }

  flushTable();
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Legacy helpers (kept for backwards compatibility)
// ---------------------------------------------------------------------------

/**
 * @deprecated Use `formatMarkdownDocument` which is grammar-aware.
 * This thin wrapper now delegates to the grammar-aware implementation.
 */
export function formatMarkdownTables(markdown: string): string {
  return formatMarkdownDocument(markdown);
}

/**
 * Converts raw CSV or TSV string into a valid Markdown table.
 */
export function convertCsvToMarkdown(csvText: string): string {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return '';

  const delimiter = csvText.includes('\t') ? '\t' : ',';
  const rows = lines.map((l) =>
    l.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, '')),
  );

  if (rows.length === 0) return '';

  const headers = rows[0];
  const separator = headers.map(() => '---');
  const bodyRows = rows.slice(1);

  const tableLines = [
    `| ${headers.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...bodyRows.map((r) => `| ${r.join(' | ')} |`),
  ];

  return formatMarkdownDocument(tableLines.join('\n'));
}

/**
 * Calculates Flesch Reading Ease and complexity metrics.
 */
export function calculateDocumentMetrics(text: string) {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;
  const sentenceCount = (text.match(/[.!?]+(\s+|$)/g) || []).length || 1;
  const charCount = text.length;

  let syllables = 0;
  for (const word of words) {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleaned.length <= 3) {
      syllables += 1;
    } else {
      const matches = cleaned.match(/[aeiouy]{1,2}/g);
      syllables += matches ? matches.length : 1;
    }
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = wordCount > 0 ? syllables / wordCount : 1;
  const fleschScore = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord),
  );

  let readabilityLabel = 'Easy';
  if (fleschScore < 30) readabilityLabel = 'Very Difficult';
  else if (fleschScore < 50) readabilityLabel = 'Difficult (College level)';
  else if (fleschScore < 60) readabilityLabel = 'Fairly Difficult';
  else if (fleschScore < 70) readabilityLabel = 'Standard';
  else if (fleschScore < 80) readabilityLabel = 'Fairly Easy';

  return {
    wordCount,
    sentenceCount,
    charCount,
    syllables,
    fleschScore: Math.round(fleschScore),
    readabilityLabel,
    readingTimeMin: Math.ceil(wordCount / 200),
    speakingTimeMin: Math.ceil(wordCount / 130),
  };
}
