'use client';

import {
  Archive,
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  Clock,
  Copy,
  Edit2,
  FilePlus,
  FileText,
  Folder,
  FolderInput,
  FolderPlus,
  HardDrive,
  Hash,
  History,
  ListTree,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Type,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TEMPLATE_LIST, type TemplateItem } from '@/lib/constants/templates';
import { db } from '@/lib/db';
import type { DocumentItem, FolderItem, RevisionItem } from '@/lib/db/schema';
import { generateWorkspaceZip } from '@/lib/export/zip';
import { openLocalDirectory } from '@/lib/fs/local-folder';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { calculateReadingTime, cn } from '@/lib/utils';
import { calculateDocumentMetrics } from '@/lib/utils/markdown-formatter';
import { KnowledgeGraphView } from '../graph/KnowledgeGraphView';
import { CreateFolderModal } from '../modals/CreateFolderModal';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../ui/context-menu';

// Inline rename input
const InlineRenameInput: React.FC<{
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}> = ({ initialValue, onSave, onCancel }) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== initialValue) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') onCancel();
      }}
      className="bg-white dark:bg-slate-900 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-white outline-none w-full shadow-xs"
      onClick={(e) => e.stopPropagation()}
    />
  );
};

// Outline Panel
const OutlinePanel: React.FC = () => {
  const { documents, activeDocumentId, viewMode } = useWorkspaceStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);
  const content = activeDoc?.content || '';

  const headings = useMemo(() => {
    const lines = content.split('\n');
    const result: { level: number; text: string; lineIndex: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        result.push({
          level: match[1].length,
          text: match[2].trim(),
          lineIndex: i,
        });
      }
    }
    return result;
  }, [content]);

  if (headings.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
        <ListTree className="h-8 w-8 opacity-30" />
        <p className="text-xs">No headings found in this document.</p>
        <p className="text-[11px] opacity-60">Use # Heading in Markdown to build an outline.</p>
      </div>
    );
  }

  // Fix #21: guard against editor-only mode where no preview is rendered.
  const scrollToHeading = (text: string) => {
    if (viewMode === 'editor') {
      toast.info('Switch to Split or Preview mode to navigate headings.');
      return;
    }
    const preview = document.querySelector('.markdown-body');
    if (!preview) return;
    const headingEls = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const el of headingEls) {
      if (el.textContent?.trim().toLowerCase() === text.toLowerCase()) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
      <div className="px-2 py-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Document Outline ({headings.length})
      </div>
      {headings.map((h, i) => (
        <button
          key={i}
          type="button"
          onClick={() => scrollToHeading(h.text)}
          className="w-full text-left flex items-start gap-1.5 px-2 py-1.5 text-xs rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
          style={{ paddingLeft: `${8 + (h.level - 1) * 12}px` }}
          title={h.text}
        >
          <Hash
            className={cn(
              'h-3 w-3 shrink-0 mt-0.5 opacity-40 group-hover:opacity-70',
              h.level === 1 && 'text-blue-500',
              h.level === 2 && 'text-indigo-500',
              h.level === 3 && 'text-purple-500',
            )}
          />
          <span
            className={cn(
              'truncate leading-relaxed',
              h.level === 1 && 'font-semibold text-slate-700 dark:text-slate-200',
              h.level === 2 && 'font-medium',
            )}
          >
            {h.text}
          </span>
        </button>
      ))}
    </div>
  );
};

// Templates Panel
const TemplatesPanel: React.FC = () => {
  const { createDocument } = useWorkspaceStore();

  const handleUseTemplate = async (template: TemplateItem) => {
    const _docId = await createDocument(`${template.title}.md`, null, template.content);
    toast.success(`Created "${template.title}.md" from template`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Pre-Built Templates
      </div>
      <div className="space-y-2">
        {TEMPLATE_LIST.map((template) => (
          <div
            key={template.id}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] hover:border-blue-500/80 transition-colors space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                {template.category}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {template.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {template.description}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUseTemplate(template)}
              className="w-full text-xs h-7 gap-1.5 font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 border-slate-200 dark:border-slate-800"
            >
              <Plus className="h-3 w-3" />
              <span>Use Template</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Diagnostics Panel
const DiagnosticsPanel: React.FC = () => {
  const { documents, activeDocumentId } = useWorkspaceStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);
  const content = activeDoc?.content || '';

  const { words, chars, minutes } = calculateReadingTime(content);
  const metrics = calculateDocumentMetrics(content);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Document Diagnostics
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-1">Words</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
            {words}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-1">Characters</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
            {chars}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-1">Read Time</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
            {minutes} min
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-1">Speech Pace</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
            {Math.max(1, Math.round(words / 130))} min
          </span>
        </div>
      </div>

      {/* Readability Score */}
      <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
            Flesch Reading Ease
          </span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {metrics.fleschScore} / 100
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
          Level:{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {metrics.readabilityLabel}
          </span>
          . Sentences: {metrics.sentenceCount}.
        </p>
      </div>
    </div>
  );
};

// History Panel
const HistoryPanel: React.FC = () => {
  const { documents, activeDocumentId, updateDocument } = useWorkspaceStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const localDb = db;
    if (!activeDoc || !localDb) return;
    const loadRevisions = async () => {
      setLoading(true);
      try {
        const list = await localDb.revisions
          .where('documentId')
          .equals(activeDoc.id)
          .reverse()
          .sortBy('timestamp');
        setRevisions(list);
      } finally {
        setLoading(false);
      }
    };
    loadRevisions();
  }, [activeDoc]);

  const handleRollback = (rev: RevisionItem) => {
    if (!activeDoc) return;
    updateDocument(activeDoc.id, { content: rev.content });
    toast.success(`Restored revision from ${new Date(rev.timestamp).toLocaleTimeString()}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Revision History ({revisions.length})
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading history...</div>
      ) : revisions.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 space-y-1">
          <History className="h-6 w-6 mx-auto opacity-40 mb-2" />
          <p>No snapshots saved yet.</p>
          <p className="text-[11px] opacity-60">
            Snapshots are created automatically as you write.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(rev.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(rev.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-mono">
                {rev.content.slice(0, 100)}...
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleRollback(rev)}
                className="w-full text-xs h-7 gap-1 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 border-slate-200 dark:border-slate-800"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restore Revision</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const WorkspaceSidebar: React.FC = () => {
  const {
    documents,
    folders,
    activeDocumentId,
    searchQuery,
    selectedTag,
    sortBy,
    sortOrder,
    activeActivityTab,
    initialize,
    createDocument,
    updateDocument,
    deleteDocument,
    restoreDocument,
    emptyTrash,
    createFolder,
    deleteFolder,
    renameFolder,
    renameDocument,
    duplicateDocument,
    setSearchQuery,
    setSelectedTag,
    setSortBy,
    setSortOrder,
    setActiveDocument,
  } = useWorkspaceStore();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [selectedParentFolder, setSelectedParentFolder] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [trashExpanded, setTrashExpanded] = useState(false);
  const [sortPanelOpen, setSortPanelOpen] = useState(false);

  const toggleFolder = (id: string) => setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  const collapseAllFolders = () => setExpandedFolders({});

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initialize();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleOpenFolderModal = (parentId: string | null = null) => {
    setSelectedParentFolder(parentId);
    setFolderModalOpen(true);
  };

  const handleMountLocalFolder = async () => {
    const res = await openLocalDirectory();
    if (!res) return;
    // Fix #3: createFolder now returns the new folder's ID directly,
    // avoiding the stale-closure bug of looking it up in `folders` after the await.
    const folderId = await createFolder(res.folderName);
    for (const f of res.files) {
      await createDocument(f.title, folderId, f.content);
    }
    toast.success(`Imported ${res.files.length} files from "${res.folderName}"`);
  };

  const handleQuickZipExport = async () => {
    setIsExportingZip(true);
    try {
      const blob = await generateWorkspaceZip(documents, folders);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Workspace exported as ZIP');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export workspace');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Fix #15: use the dedicated renameDocument action for consistency.
  const handleRenameDoc = async (id: string, newTitle: string) => {
    await renameDocument(id, newTitle);
    setRenamingDocId(null);
    toast.success('Document renamed');
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    await renameFolder(id, newName);
    setRenamingFolderId(null);
    toast.success('Folder renamed');
  };

  const handleDeleteDoc = async (id: string) => {
    await deleteDocument(id);
    toast.success('Moved to Trash');
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    toast.success('Folder deleted');
  };

  // Fix #14: delegate to store's duplicateDocument for consistent naming.
  const handleDuplicate = async (id: string) => {
    await duplicateDocument(id);
    toast.success('Document duplicated');
  };

  // Sorting
  const sortDocs = useCallback(
    (docs: DocumentItem[]) => {
      const sorted = [...docs];
      sorted.sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') cmp = a.title.localeCompare(b.title);
        else if (sortBy === 'modified') cmp = (b.updatedAt || 0) - (a.updatedAt || 0);
        else if (sortBy === 'created') cmp = (b.createdAt || 0) - (a.createdAt || 0);
        else if (sortBy === 'wordcount')
          cmp = b.content.split(/\s+/).length - a.content.split(/\s+/).length;
        return sortOrder === 'asc' ? -cmp : cmp;
      });
      return sorted;
    },
    [sortBy, sortOrder],
  );

  const filteredDocs = useMemo(() => {
    return sortDocs(
      documents.filter((doc) => {
        if (doc.isTrash) return false;
        if (filterFavorites && !doc.isFavorite) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            doc.title.toLowerCase().includes(q) ||
            doc.content.toLowerCase().includes(q) ||
            (doc.searchableText?.toLowerCase().includes(q) ?? false)
          );
        }
        if (selectedTag && !doc.tags?.includes(selectedTag)) return false;
        return true;
      }),
    );
  }, [documents, filterFavorites, searchQuery, selectedTag, sortDocs]);

  const trashedDocs = documents.filter((d) => d.isTrash);
  const rootDocs = filteredDocs.filter((d) => !d.folderId);
  const allTags = Array.from(new Set(documents.flatMap((d) => (d.isTrash ? [] : d.tags || []))));

  // Get search match excerpt
  const getMatchExcerpt = (content: string, query: string): string | null => {
    if (!query) return null;
    const idx = content.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return null;
    const start = Math.max(0, idx - 30);
    const end = Math.min(content.length, idx + query.length + 50);
    return (
      (start > 0 ? '…' : '') + content.slice(start, end).trim() + (end < content.length ? '…' : '')
    );
  };

  // Recursive folder tree
  const renderFolder = (folder: FolderItem, depth = 0): React.ReactNode => {
    const isExpanded = expandedFolders[folder.id];
    const isRenaming = renamingFolderId === folder.id;
    const folderDocs = filteredDocs.filter((d: DocumentItem) => d.folderId === folder.id);
    const subFolders = folders.filter((f: FolderItem) => f.parentId === folder.id);

    return (
      <div key={folder.id} className="space-y-0.5" style={{ marginLeft: depth > 0 ? 8 : 0 }}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              onClick={() => toggleFolder(folder.id)}
              onDoubleClick={(e) => {
                e.preventDefault();
                setRenamingFolderId(folder.id);
              }}
              className="group flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                )}
                <Folder className="h-4 w-4 text-blue-500 shrink-0" />
                {isRenaming ? (
                  <InlineRenameInput
                    initialValue={folder.name}
                    onSave={(val) => handleRenameFolder(folder.id, val)}
                    onCancel={() => setRenamingFolderId(null)}
                  />
                ) : (
                  <span className="font-medium truncate">{folder.name}</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                {folderDocs.length}
              </span>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuLabel>{folder.name}</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => createDocument('Untitled.md', folder.id)}>
              <FilePlus /> New File Here
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleOpenFolderModal(folder.id)}>
              <FolderPlus /> New Sub-folder
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setRenamingFolderId(folder.id)}>
              <Edit2 /> Rename Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleDeleteFolder(folder.id)}
              className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <Trash2 /> Delete Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isExpanded && (
          <div className="pl-4 ml-2 border-l border-slate-200/70 dark:border-slate-800/70 space-y-0.5">
            {/* Sub-folders */}
            {subFolders.map((sf) => renderFolder(sf, depth + 1))}
            {/* Files */}
            {folderDocs.map((doc: DocumentItem) => (
              <FileItem key={doc.id} doc={doc} />
            ))}
            {subFolders.length === 0 && folderDocs.length === 0 && (
              <div className="text-[10px] text-slate-400 px-2.5 py-1 italic">Empty folder</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // File context menu items
  const FileContextMenuItems: React.FC<{ doc: DocumentItem }> = ({ doc }) => (
    <ContextMenuContent>
      <ContextMenuLabel className="max-w-[180px] truncate">{doc.title}</ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => setRenamingDocId(doc.id)}>
        <Edit2 /> Rename
        <ContextMenuShortcut>F2</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => handleDuplicate(doc.id)}>
        <Copy /> Duplicate
      </ContextMenuItem>
      <ContextMenuItem onClick={() => updateDocument(doc.id, { isFavorite: !doc.isFavorite })}>
        <Star className={doc.isFavorite ? 'text-amber-500 fill-current' : ''} />
        {doc.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
      </ContextMenuItem>

      {/* Move to folder */}
      {folders.length > 0 && (
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FolderInput /> Move to Folder
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => updateDocument(doc.id, { folderId: null })}>
              Root Workspace
            </ContextMenuItem>
            <ContextMenuSeparator />
            {folders.map((f) => (
              <ContextMenuItem
                key={f.id}
                onClick={() => updateDocument(doc.id, { folderId: f.id })}
              >
                {f.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      )}

      <ContextMenuSeparator />
      <ContextMenuItem
        onClick={() => handleDeleteDoc(doc.id)}
        className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
      >
        <Trash2 /> Move to Trash
        <ContextMenuShortcut>Del</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );

  // Single file item
  const FileItem: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
    const isRenaming = renamingDocId === doc.id;
    const excerpt = searchQuery ? getMatchExcerpt(doc.content, searchQuery) : null;

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            onClick={() => !isRenaming && setActiveDocument(doc.id)}
            onDoubleClick={(e) => {
              e.preventDefault();
              setRenamingDocId(doc.id);
            }}
            className={cn(
              'group flex flex-col px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-all',
              activeDocumentId === doc.id
                ? 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium border border-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
                {isRenaming ? (
                  <InlineRenameInput
                    initialValue={doc.title}
                    onSave={(val) => handleRenameDoc(doc.id, val)}
                    onCancel={() => setRenamingDocId(null)}
                  />
                ) : (
                  <span className="truncate">{doc.title}</span>
                )}
              </div>
              {!isRenaming && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDocument(doc.id, { isFavorite: !doc.isFavorite });
                    }}
                    className="hover:text-amber-500 p-0.5 rounded"
                  >
                    <Star
                      className={cn('h-3 w-3', doc.isFavorite && 'fill-amber-500 text-amber-500')}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDoc(doc.id);
                    }}
                    className="hover:text-red-500 p-0.5 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {/* Search match excerpt */}
            {excerpt && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed line-clamp-2 pl-5">
                {excerpt}
              </p>
            )}
          </div>
        </ContextMenuTrigger>
        <FileContextMenuItems doc={doc} />
      </ContextMenu>
    );
  };

  // Root folders
  const rootFolders = folders.filter((f) => !f.parentId);

  return (
    <>
      <aside className="w-72 h-full flex flex-col bg-slate-50/95 dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 select-none z-10 transition-colors">
        {/* Render Modular Panel based on activeActivityTab */}
        {activeActivityTab === 'outline' && <OutlinePanel />}
        {activeActivityTab === 'templates' && <TemplatesPanel />}
        {activeActivityTab === 'graph' && <KnowledgeGraphView />}
        {activeActivityTab === 'history' && <HistoryPanel />}
        {activeActivityTab === 'diagnostics' && <DiagnosticsPanel />}

        {/* Default Explorer View */}
        {(activeActivityTab === 'explorer' || activeActivityTab === 'search') && (
          <>
            {/* Explorer header & action ribbon */}
            <div className="p-2.5 border-b border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeActivityTab === 'search' ? 'Search Files' : 'Explorer'}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => createDocument('Untitled.md')}
                    title="New File (Ctrl+N)"
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenFolderModal(null)}
                    title="New Folder"
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    title="Refresh"
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <RefreshCw
                      className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin text-blue-500')}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={collapseAllFolders}
                    title="Collapse All"
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <ChevronsDownUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortPanelOpen((p) => !p)}
                    title="Sort options"
                    className={cn(
                      'p-1 rounded transition-colors',
                      sortPanelOpen
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800',
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMountLocalFolder}
                    title="Open Local Folder"
                    className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <HardDrive className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isExportingZip}
                    onClick={handleQuickZipExport}
                    title="Export as ZIP"
                    className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    {isExportingZip ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Archive className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sort panel */}
              {sortPanelOpen && (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-2 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Sort by
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {(
                      [
                        { value: 'modified', label: 'Modified', icon: Clock },
                        { value: 'name', label: 'Name', icon: Type },
                        { value: 'created', label: 'Created', icon: Clock },
                        { value: 'wordcount', label: 'Length', icon: Hash },
                      ] as const
                    ).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSortBy(value)}
                        className={cn(
                          'flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md transition-all',
                          sortBy === value
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSortOrder('asc')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1 py-1 text-[11px] rounded-md transition-all',
                        sortOrder === 'asc'
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                      )}
                    >
                      <ArrowUpAZ className="h-3 w-3" /> Ascending
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortOrder('desc')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1 py-1 text-[11px] rounded-md transition-all',
                        sortOrder === 'desc'
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                      )}
                    >
                      <ArrowDownAZ className="h-3 w-3" /> Descending
                    </button>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                />
                {searchQuery && (
                  <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400">
                    {filteredDocs.length}
                  </span>
                )}
              </div>

              {/* Favorites filter + file count */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all',
                    filterFavorites
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800',
                  )}
                >
                  <Star className="h-3 w-3 fill-current" />
                  Favorites
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  {filteredDocs.length} files
                </span>
              </div>
            </div>

            {/* File tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {rootFolders.map((folder: FolderItem) => renderFolder(folder))}
              {rootDocs.map((doc: DocumentItem) => (
                <FileItem key={doc.id} doc={doc} />
              ))}
              {filteredDocs.length === 0 && !searchQuery && (
                <div className="text-center py-10 text-xs text-slate-400 space-y-2">
                  <div className="text-3xl opacity-30">📂</div>
                  <p>No documents yet.</p>
                  <p className="opacity-60">Click the + button to create one.</p>
                </div>
              )}
              {filteredDocs.length === 0 && searchQuery && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No documents match "{searchQuery}"
                </div>
              )}
            </div>

            {/* Tags section */}
            {allTags.length > 0 && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#0b0f19]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Filter by Tag
                </span>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={cn(
                        'px-2 py-0.5 text-[11px] font-medium rounded-md flex items-center gap-1 transition-all',
                        selectedTag === tag
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700',
                      )}
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trash section */}
            {trashedDocs.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800/80 p-2">
                <button
                  type="button"
                  onClick={() => setTrashExpanded(!trashExpanded)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-red-500/80">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Trash ({trashedDocs.length})</span>
                  </div>
                  {trashExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>

                {trashExpanded && (
                  <div className="mt-1 space-y-1 pl-2">
                    <div className="flex justify-end pr-1">
                      <button
                        type="button"
                        onClick={emptyTrash}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Empty Trash
                      </button>
                    </div>
                    {trashedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 group"
                      >
                        <span className="truncate flex-1 line-through">{doc.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => restoreDocument(doc.id)}
                            title="Restore"
                            className="text-blue-500 hover:text-blue-600 p-0.5"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDocument(doc.id, true)}
                            title="Permanently Delete"
                            className="text-red-500 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </aside>

      <CreateFolderModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        parentId={selectedParentFolder}
      />
    </>
  );
};
