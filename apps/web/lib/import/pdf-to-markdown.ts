export interface PdfConversionResult {
  markdown: string;
  pageCount: number;
}

export async function convertPdfToMarkdown(
  arrayBuffer: ArrayBuffer,
): Promise<PdfConversionResult> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: string[] = [
    '> **Note:** This is a best-effort conversion from PDF. Review the output carefully.',
    '',
  ];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();
    const pageText = (textContent.items as Array<Record<string, unknown>>)
      .filter((item) => typeof item['str'] === 'string')
      .map((item) => item['str'] as string)
      .join(' ')
      .trim();
    if (pageText) lines.push(pageText, '');
  }

  return { markdown: lines.join('\n'), pageCount: pdf.numPages };
}
