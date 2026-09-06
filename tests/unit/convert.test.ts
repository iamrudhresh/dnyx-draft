import { describe, expect, it } from 'vitest';
import { convert } from '@/lib/convert';

describe('convert', () => {
  it('converts JSON to XML and back', async () => {
    const json = JSON.stringify({ root: { a: '1', b: '2' } });
    const xml = await convert(json, 'json', 'xml');
    expect(xml).toContain('<a>1</a>');

    const backToJson = await convert(xml, 'xml', 'json');
    const parsed = JSON.parse(backToJson);
    // fast-xml-parser coerces numeric-looking text nodes to numbers by default.
    expect(parsed.root.a).toBe(1);
  });

  it('converts JSON to YAML and back', async () => {
    const json = JSON.stringify({ a: 1, b: [1, 2] });
    const yaml = await convert(json, 'json', 'yaml');
    expect(yaml).toContain('a: 1');

    const backToJson = await convert(yaml, 'yaml', 'json');
    expect(JSON.parse(backToJson)).toEqual({ a: 1, b: [1, 2] });
  });

  it('converts JSON array to CSV and back', async () => {
    const json = JSON.stringify([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    const csv = await convert(json, 'json', 'csv');
    expect(csv).toContain('name,age');
    expect(csv).toContain('Alice,30');

    const backToJson = await convert(csv, 'csv', 'json');
    const parsed = JSON.parse(backToJson);
    expect(parsed).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]);
  });

  it('flattens nested objects when converting to CSV', async () => {
    const json = JSON.stringify([{ name: 'Alice', address: { city: 'NYC' } }]);
    const csv = await convert(json, 'json', 'csv');
    expect(csv).toContain('address.city');
    expect(csv).toContain('NYC');
  });

  it('converts YAML to XML', async () => {
    const yaml = 'root:\n  a: hello\n';
    const xml = await convert(yaml, 'yaml', 'xml');
    expect(xml).toContain('<a>hello</a>');
  });

  it('rejects converting a bare primitive to CSV', async () => {
    await expect(convert('"just a string"', 'json', 'csv')).rejects.toThrow();
  });

  it('returns content unchanged when source and target formats match', async () => {
    const json = '{"a":1}';
    await expect(convert(json, 'json', 'json')).resolves.toBe(json);
  });
});
