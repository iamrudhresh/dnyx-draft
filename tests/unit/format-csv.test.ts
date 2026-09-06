import { describe, expect, it } from 'vitest';
import { formatCsv, minifyCsv, validateCsv } from '@/lib/format/csv';

describe('formatCsv', () => {
  it('round-trips quoted fields with embedded commas and newlines', async () => {
    const input = 'name,note\n"Doe, John","Line1\nLine2"\n';
    const result = await formatCsv(input);
    expect(result).toContain('"Doe, John"');
    expect(result).toContain('"Line1\nLine2"');
  });
});

describe('minifyCsv', () => {
  it('trims whitespace from cells', async () => {
    const result = await minifyCsv('a, b\n 1 , 2 \n');
    expect(result).toBe('a,b\n1,2');
  });
});

describe('validateCsv', () => {
  it('accepts consistent rows with no warnings', async () => {
    const result = await validateCsv('a,b\n1,2\n3,4\n');
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns about inconsistent column counts', async () => {
    const result = await validateCsv('a,b\n1,2\n3\n');
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
