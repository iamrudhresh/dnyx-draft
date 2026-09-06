import type { DocumentItem, FolderItem } from '../db/schema';

/**
 * Generates a ZIP archive Blob containing all workspace documents organized by folder hierarchy.
 */
export async function generateWorkspaceZip(
  documents: DocumentItem[],
  folders: FolderItem[],
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Create folder maps
  const folderMap = new Map<string, typeof zip>();
  for (const folder of folders) {
    const sanitizedName = folder.name.replace(/[/\\?%*:|"<>]/g, '_');
    const folderZip = zip.folder(sanitizedName);
    if (folderZip) {
      folderMap.set(folder.id, folderZip);
    }
  }

  // Add files to respective folders or root
  for (const doc of documents) {
    if (doc.isTrash) continue;
    const filename = doc.title.endsWith('.md') ? doc.title : `${doc.title}.md`;
    const sanitizedFilename = filename.replace(/[/\\?%*:|"<>]/g, '_');

    if (doc.folderId && folderMap.has(doc.folderId)) {
      const folderZip = folderMap.get(doc.folderId);
      folderZip?.file(sanitizedFilename, doc.content);
    } else {
      zip.file(sanitizedFilename, doc.content);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}
