export function formatJson(content: string, indent = 2): string {
  return JSON.stringify(JSON.parse(content), null, indent);
}

export function minifyJson(content: string): string {
  return JSON.stringify(JSON.parse(content));
}

export function validateJson(content: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}
