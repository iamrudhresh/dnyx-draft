export async function convertHtmlToMarkdown(html: string): Promise<string> {
  const TurndownService = (await import('turndown')).default;
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  return td.turndown(html);
}
