import { describe, expect, it } from 'vitest';
import { formatJson, minifyJson, validateJson } from '@/lib/format/json';

describe('formatJson', () => {
  it('pretty-prints with 2-space indent by default', () => {
    expect(formatJson('{"a":1,"b":[1,2]}')).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });

  it('throws on invalid JSON', () => {
    expect(() => formatJson('{bad')).toThrow();
  });
});

describe('minifyJson', () => {
  it('collapses whitespace', () => {
    expect(minifyJson('{\n  "a": 1\n}')).toBe('{"a":1}');
  });
});

describe('validateJson', () => {
  it('reports valid JSON', () => {
    expect(validateJson('{"a":1}')).toEqual({ valid: true });
  });

  it('reports an error message for invalid JSON', () => {
    const result = validateJson('{bad');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
