export interface DocxConversionResult {
  markdown: string;
  warnings: string[];
}

export async function convertDocxToMarkdown(
  arrayBuffer: ArrayBuffer,
): Promise<DocxConversionResult> {
  const mammoth = (await import('mammoth')).default;
  const TurndownService = (await import('turndown')).default;
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return {
    markdown: td.turndown(result.value),
    warnings: result.messages
      .filter((m) => m.type === 'warning')
      .map((m) => m.message),
  };
}
