async function assertWellFormed(content: string) {
  const { XMLValidator } = await import('fast-xml-parser');
  const result = XMLValidator.validate(content);
  if (result !== true) throw new Error(result.err.msg);
}

export async function formatXml(content: string): Promise<string> {
  await assertWellFormed(content);
  const { XMLParser, XMLBuilder } = await import('fast-xml-parser');
  const parser = new XMLParser({ preserveOrder: true, ignoreAttributes: false, trimValues: false });
  const parsed = parser.parse(content);
  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
    format: true,
    indentBy: '  ',
  });
  return builder.build(parsed).trim();
}

export async function minifyXml(content: string): Promise<string> {
  await assertWellFormed(content);
  const { XMLParser, XMLBuilder } = await import('fast-xml-parser');
  const parser = new XMLParser({ preserveOrder: true, ignoreAttributes: false, trimValues: true });
  const parsed = parser.parse(content);
  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
    format: false,
  });
  return builder.build(parsed).trim();
}

export async function validateXml(content: string): Promise<{ valid: boolean; error?: string }> {
  const { XMLValidator } = await import('fast-xml-parser');
  const result = XMLValidator.validate(content);
  if (result === true) return { valid: true };
  return { valid: false, error: result.err.msg };
}
