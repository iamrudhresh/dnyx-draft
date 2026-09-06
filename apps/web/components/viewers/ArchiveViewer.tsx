'use client';

import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { DocumentItem } from '@/lib/db/schema';
import { routeFileImport } from '@/lib/import/file-router';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface ArchiveEntry {
  name: string;
  size: number;
  isDirectory: boolean;
  path: string;
}

function buildTree(entries: ArchiveEntry[]): FileNode {
  const root: FileNode = { name: '/', children: {}, isDir: true, entry: null };
  for (const entry of entries) {
    const parts = entry.path.split('/').filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!node.children[part]) {
        node.children[part] = {
          name: part,
          children: {},
          isDir: i < parts.length - 1 || entry.isDirectory,
          entry: i === parts.length - 1 ? entry : null,
        };
      }
      node = node.children[part];
    }
  }
  return root;
}

interface FileNode {
  name: string;
  children: Record<string, FileNode>;
  isDir: boolean;
  entry: ArchiveEntry | null;
}

function FileTree({
  node,
  depth,
  onOpenEntry,
}: {
  node: FileNode;
  depth: number;
  onOpenEntry: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = Object.keys(node.children).length > 0;

  if (node.name === '/') {
    return (
      <div>
        {Object.values(node.children)
          .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name))
          .map((child) => (
            <FileTree key={child.name} node={child} depth={depth + 1} onOpenEntry={onOpenEntry} />
          ))}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-0.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm"
        style={{ paddingLeft: depth * 12 + 8 }}
        onClick={() => {
          if (node.isDir) setExpanded((p) => !p);
          else if (node.entry) onOpenEntry(node.entry.path);
        }}
      >
        {node.isDir ? (
          <>
            {hasChildren && expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            ) : hasChildren ? (
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            <Folder className="h-4 w-4 text-amber-400 shrink-0" />
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <File className="h-4 w-4 text-slate-400 shrink-0" />
          </>
        )}
        <span className={node.isDir ? 'font-medium text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'}>
          {node.name}
        </span>
        {node.entry && !node.isDir && (
          <span className="ml-auto text-xs text-slate-400">
            {(node.entry.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
      {node.isDir && expanded && Object.values(node.children)
        .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name))
        .map((child) => (
          <FileTree key={child.name} node={child} depth={depth + 1} onOpenEntry={onOpenEntry} />
        ))}
    </div>
  );
}

interface ArchiveViewerProps {
  doc: DocumentItem;
}

export function ArchiveViewer({ doc }: ArchiveViewerProps) {
  const { createDocument, updateDocument } = useWorkspaceStore();
  const [tree, setTree] = useState<FileNode | null>(null);
  const [zipRef, setZipRef] = useState<unknown>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      let data: ArrayBuffer | null = null;
      if (doc.blobId && db) {
        const blob = await db.blobs.get(doc.blobId);
        if (blob) data = blob.data;
      }
      if (!data) return;

      const { default: JSZip } = await import('jszip');
      const zip = await JSZip.loadAsync(data);
      setZipRef(zip);

      const entries: ArchiveEntry[] = [];
      zip.forEach((path, entry) => {
        entries.push({ path, name: path.split('/').pop() ?? path, size: 0, isDirectory: entry.dir });
      });
      setTree(buildTree(entries));
    }
    load();
  }, [doc.blobId]);

  const handleOpenEntry = async (path: string) => {
    if (!zipRef) return;
    setOpening(path);
    try {
      const zip = zipRef as { file: (p: string) => { async: (t: string) => Promise<ArrayBuffer> } | null };
      const fileObj = zip.file(path);
      if (!fileObj) return;
      const buf = await fileObj.async('arraybuffer');
      const name = path.split('/').pop() ?? path;
      const blob = new Blob([buf as unknown as BlobPart]);
      const file = Object.assign(blob, { name, lastModified: Date.now() }) as unknown as File;
      const routed = await routeFileImport(file);
      const docId = await createDocument(routed.title, null, routed.content);
      await updateDocument(docId, { fileType: routed.fileType });
    } catch (e) {
      console.error('Failed to open archive entry:', e);
    } finally {
      setOpening(null);
    }
  };

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading archive…
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 shrink-0">
        Click a file to open it in a viewer
        {opening && <span className="ml-2 text-blue-500">Opening {opening}…</span>}
      </div>
      <div className="flex-1 overflow-auto p-2 font-mono">
        <FileTree node={tree} depth={0} onOpenEntry={handleOpenEntry} />
      </div>
    </div>
  );
}
