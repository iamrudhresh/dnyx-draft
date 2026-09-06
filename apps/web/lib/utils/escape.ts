export function escapeJsonString(input: string): string {
  return JSON.stringify(input);
}

export function unescapeJsonString(input: string): string {
  const trimmed = input.trim();
  const quoted =
    trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed : JSON.stringify(trimmed);
  return JSON.parse(quoted);
}

const XML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const XML_UNESCAPE_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
};

export function escapeXmlEntities(input: string): string {
  return input.replace(/[&<>"']/g, (c) => XML_ESCAPE_MAP[c]);
}

export function unescapeXmlEntities(input: string): string {
  return input.replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, (e) => XML_UNESCAPE_MAP[e]);
}

export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    throw new Error('Malformed URI sequence');
  }
}

export function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64Decode(input: string): string {
  let binary: string;
  try {
    binary = atob(input);
  } catch {
    throw new Error('Malformed Base64 string');
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
