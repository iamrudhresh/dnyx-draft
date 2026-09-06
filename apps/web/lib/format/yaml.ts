export async function formatYaml(content: string, indent = 2): Promise<string> {
  const { default: yaml } = await import('js-yaml');
  const parsed = yaml.load(content);
  return yaml.dump(parsed, { indent, lineWidth: 120 });
}

export async function minifyYaml(content: string): Promise<string> {
  const { default: yaml } = await import('js-yaml');
  const parsed = yaml.load(content);
  return yaml.dump(parsed, { flowLevel: 0, lineWidth: Number.POSITIVE_INFINITY });
}

export async function validateYaml(content: string): Promise<{ valid: boolean; error?: string }> {
  const { default: yaml } = await import('js-yaml');
  try {
    yaml.load(content);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Invalid YAML' };
  }
}
