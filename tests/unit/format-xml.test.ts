import { describe, expect, it } from 'vitest';
import { formatXml, minifyXml, validateXml } from '@/lib/format/xml';

describe('formatXml', () => {
  it('pretty-prints with indentation', async () => {
    const result = await formatXml('<root><a>1</a></root>');
    expect(result).toContain('\n');
    expect(result).toContain('<a>1</a>');
  });

  it('preserves attributes through a round-trip', async () => {
    const result = await formatXml('<root id="5"><a>1</a></root>');
    expect(result).toContain('id="5"');
  });

  it('throws on malformed XML', async () => {
    await expect(formatXml('<root><a></root>')).rejects.toThrow();
  });
});

describe('minifyXml', () => {
  it('strips whitespace between tags', async () => {
    const result = await minifyXml('<root>\n  <a>1</a>\n</root>');
    expect(result).not.toContain('\n');
  });
});

describe('validateXml', () => {
  it('accepts well-formed XML', async () => {
    const result = await validateXml('<root><a>1</a></root>');
    expect(result.valid).toBe(true);
  });

  it('rejects malformed XML', async () => {
    const result = await validateXml('<root><a></root>');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
