export interface LocalFile {
  name: string;
  handle: FileSystemFileHandle;
}

export interface LocalFolder {
  name: string;
  handle: FileSystemDirectoryHandle;
  files: LocalFile[];
}

/**
 * Prompts user to select a folder from their local computer using Web File System Access API.
 */
export async function openLocalDirectory(): Promise<{
  folderName: string;
  files: { title: string; content: string }[];
} | null> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    alert(
      'The File System Access API is supported in Chrome, Edge, Opera, and modern Chromium browsers.',
    );
    return null;
  }

  try {
    const pickerWindow = window as unknown as {
      showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
    };
    const dirHandle = await pickerWindow.showDirectoryPicker();
    const files: { title: string; content: string }[] = [];

    for await (const entry of dirHandle.values()) {
      if (
        entry.kind === 'file' &&
        (entry.name.endsWith('.md') ||
          entry.name.endsWith('.markdown') ||
          entry.name.endsWith('.txt'))
      ) {
        const file = await entry.getFile();
        const content = await file.text();
        files.push({
          title: entry.name,
          content,
        });
      }
    }

    return {
      folderName: dirHandle.name,
      files,
    };
  } catch (err: unknown) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to open local directory:', err);
    }
    return null;
  }
}
