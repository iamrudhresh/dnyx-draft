import { routeFileImport, type RoutedFile } from './file-router';

export interface FolderImportResult {
  files: Array<RoutedFile & { originalFile: File }>;
  skipped: string[];
}

export async function routeFolderImport(files: FileList | File[]): Promise<FolderImportResult> {
  const results: Array<RoutedFile & { originalFile: File }> = [];
  const skipped: string[] = [];

  for (const file of Array.from(files)) {
    try {
      const routed = await routeFileImport(file);
      results.push({ ...routed, originalFile: file });
    } catch {
      skipped.push(file.name);
    }
  }

  return { files: results, skipped };
}
