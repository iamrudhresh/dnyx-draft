import { describe, expect, it } from 'vitest';
import {
  base64Decode,
  base64Encode,
  escapeJsonString,
  escapeXmlEntities,
  unescapeJsonString,
  unescapeXmlEntities,
  urlDecode,
  urlEncode,
} from '@/lib/utils/escape';

describe('JSON string escape/unescape', () => {
  it('round-trips a string with quotes and newlines', () => {
    const input = 'He said "hi"\nnew line';
    const escaped = escapeJsonString(input);
    expect(escaped).toBe('"He said \\"hi\\"\\nnew line"');
    expect(unescapeJsonString(escaped)).toBe(input);
  });
});

describe('XML entity escape/unescape', () => {
  it('round-trips reserved characters', () => {
    const input = `<a href="x">Tom & Jerry's</a>`;
    const escaped = escapeXmlEntities(input);
    expect(escaped).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;');
    expect(unescapeXmlEntities(escaped)).toBe(input);
  });
});

describe('URL encode/decode', () => {
  it('round-trips special characters', () => {
    const input = 'a b/c?d=e&f#g';
    const encoded = urlEncode(input);
    expect(urlDecode(encoded)).toBe(input);
  });

  it('throws on malformed percent-encoding', () => {
    expect(() => urlDecode('%')).toThrow();
  });
});

describe('Base64 encode/decode', () => {
  it('round-trips ASCII text', () => {
    expect(base64Decode(base64Encode('hello world'))).toBe('hello world');
  });

  it('round-trips non-ASCII UTF-8 text', () => {
    const input = '日本語 emoji 🎉 café';
    expect(base64Decode(base64Encode(input))).toBe(input);
  });

  it('throws on malformed base64', () => {
    expect(() => base64Decode('not base64!!')).toThrow();
  });
});
