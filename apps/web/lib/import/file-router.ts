import type { DocumentFileType } from '../db/schema';

export interface RoutedFile {
  title: string;
  content: string;
  fileType: DocumentFileType;
  sourceFormat?: 'docx' | 'html' | 'pdf';
  warnings?: string[];
  searchableText?: string;
}

const CODE_EXTENSIONS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'cpp', 'c',
  'cs', 'php', 'swift', 'kt', 'sh', 'bash', 'zsh', 'fish', 'ps1',
  'css', 'scss', 'sass', 'less', 'sql', 'graphql', 'vue', 'svelte',
  'r', 'lua', 'dart', 'elixir', 'ex', 'exs', 'clj', 'hs', 'ml',
]);

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']);

export async function routeFileImport(file: File): Promise<RoutedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const title = file.name.replace(/\.[^.]+$/, '');

  if (ext === 'docx') {
    const { convertDocxToMarkdown } = await import('./docx-to-markdown');
    const buf = await file.arrayBuffer();
    const { markdown, warnings } = await convertDocxToMarkdown(buf);
    return { title, content: markdown, fileType: 'markdown', sourceFormat: 'docx', warnings };
  }

  if (ext === 'html' || ext === 'htm') {
    const { convertHtmlToMarkdown } = await import('./html-to-markdown');
    const html = await file.text();
    const markdown = await convertHtmlToMarkdown(html);
    return { title, content: markdown, fileType: 'markdown', sourceFormat: 'html' };
  }

  if (ext === 'pdf') {
    const { convertPdfToMarkdown } = await import('./pdf-to-markdown');
    const buf = await file.arrayBuffer();
    const { markdown } = await convertPdfToMarkdown(buf);
    return { title, content: markdown, fileType: 'markdown', sourceFormat: 'pdf' };
  }

  if (ext === 'md' || ext === 'markdown' || ext === 'txt') {
    return { title, content: await file.text(), fileType: 'markdown' };
  }

  if (ext === 'csv' || ext === 'tsv') {
    return { title, content: await file.text(), fileType: 'csv' };
  }

  if (ext === 'json') {
    return { title, content: await file.text(), fileType: 'json' };
  }

  if (ext === 'yaml' || ext === 'yml') {
    return { title, content: await file.text(), fileType: 'yaml' };
  }

  if (ext === 'ipynb') {
    const raw = await file.text();
    let searchableText = '';
    try {
      const nb = JSON.parse(raw) as { cells?: Array<{ source: string | string[] }> };
      searchableText = (nb.cells ?? [])
        .map((c) => (Array.isArray(c.source) ? c.source.join('') : c.source))
        .join('\n');
    } catch { /* leave empty */ }
    return { title, content: raw, fileType: 'notebook', searchableText };
  }

  if (ext === 'xlsx' || ext === 'xls') {
    return { title, content: await file.text(), fileType: 'xlsx' };
  }

  if (ext === 'xml') {
    return { title, content: await file.text(), fileType: 'xml' };
  }

  if (ext === 'env' || ext === 'ini' || ext === 'toml') {
    return { title, content: await file.text(), fileType: 'config' };
  }

  if (ext === 'zip') {
    return { title, content: '', fileType: 'archive' };
  }

  if (IMAGE_EXTENSIONS.has(ext)) {
    return { title, content: '', fileType: 'image' };
  }

  if (CODE_EXTENSIONS.has(ext)) {
    return { title, content: await file.text(), fileType: 'code' };
  }

  // Guard against binaries
  const text = await file.text();
  if (text.includes('\0')) {
    throw new Error(`Unsupported binary file type: .${ext}`);
  }
  throw new Error(`Unsupported file type: .${ext}`);
}
