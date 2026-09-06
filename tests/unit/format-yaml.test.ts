import { describe, expect, it } from 'vitest';
import { formatYaml, minifyYaml, validateYaml } from '@/lib/format/yaml';

describe('formatYaml', () => {
  it('round-trips data through load/dump', async () => {
    const result = await formatYaml('a: 1\nb:\n  - 1\n  - 2\n');
    expect(result).toContain('a: 1');
    expect(result).toContain('- 1');
  });

  it('drops comments on re-dump (known limitation)', async () => {
    const result = await formatYaml('# a comment\na: 1\n');
    expect(result).not.toContain('# a comment');
  });

  it('throws on invalid YAML', async () => {
    await expect(formatYaml('a: [1, 2\n')).rejects.toThrow();
  });
});

describe('minifyYaml', () => {
  it('produces flow-style output', async () => {
    const result = await minifyYaml('a: 1\nb:\n  - 1\n  - 2\n');
    expect(result.trim()).toBe('{a: 1, b: [1, 2]}');
  });
});

describe('validateYaml', () => {
  it('accepts valid YAML', async () => {
    expect((await validateYaml('a: 1')).valid).toBe(true);
  });

  it('rejects invalid YAML', async () => {
    const result = await validateYaml('a: [1, 2\n');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
