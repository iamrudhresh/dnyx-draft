'use client';

import {
  Activity,
  Columns,
  Download,
  Edit3,
  Eye,
  FilePlus,
  FileText,
  FolderPlus,
  History,
  LayoutTemplate,
  Lock,
  Maximize,
  Moon,
  Search,
  Settings,
  Sun,
  Table,
  Tv,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import type React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface CommandPaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenGlobalSearch?: () => void;
  onOpenExport?: () => void;
  onOpenTemplates?: () => void;
  onOpenDiagnostics?: () => void;
  onOpenPresentation?: () => void;
  onOpenSettings?: () => void;
  onOpenVersionHistory?: () => void;
  onOpenEncryptVault?: () => void;
  onFormatDocument?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  open,
  onOpenChange,
  onOpenGlobalSearch,
  onOpenExport,
  onOpenTemplates,
  onOpenDiagnostics,
  onOpenPresentation,
  onOpenSettings,
  onOpenVersionHistory,
  onOpenEncryptVault,
  onFormatDocument,
}) => {
  const { documents, setActiveDocument, createDocument, createFolder, setViewMode, toggleSidebar } =
    useWorkspaceStore();
  const { theme, setTheme } = useTheme();

  const activeDocs = documents.filter((d) => !d.isTrash);

  const runCommand = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search documents..." />
      <CommandList>
        <CommandEmpty>No matching documents or commands found.</CommandEmpty>

        {/* Documents Section */}
        <CommandGroup heading="Documents">
          {activeDocs.map((doc) => (
            <CommandItem
              key={doc.id}
              value={`doc:${doc.title}`}
              onSelect={() => {
                runCommand(() => setActiveDocument(doc.id));
              }}
            >
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              <span>{doc.title}</span>
              {doc.isFavorite && (
                <span className="ml-2 text-[10px] text-amber-500 font-semibold bg-amber-100 dark:bg-amber-950/60 px-1 rounded">
                  ★ Favorite
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* File & Workspace Actions */}
        <CommandGroup heading="File Actions">
          <CommandItem
            value="global search find in files replace all workspace regex"
            onSelect={() => runCommand(() => onOpenGlobalSearch?.())}
          >
            <Search className="mr-2 h-4 w-4 text-blue-500" />
            <span>Global Workspace Search &amp; Replace</span>
            <CommandShortcut>Ctrl+Shift+F</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="create new document file"
            onSelect={() => runCommand(() => createDocument('Untitled.md'))}
          >
            <FilePlus className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Create New Document</span>
            <CommandShortcut>Ctrl+N</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="create new folder"
            onSelect={() => runCommand(() => createFolder('New Folder'))}
          >
            <FolderPlus className="mr-2 h-4 w-4 text-blue-500" />
            <span>Create New Folder</span>
          </CommandItem>

          <CommandItem
            value="open templates picker modal"
            onSelect={() => runCommand(() => onOpenTemplates?.())}
          >
            <LayoutTemplate className="mr-2 h-4 w-4 text-purple-500" />
            <span>Browse Document Templates</span>
          </CommandItem>

          <CommandItem
            value="document version history snapshots restore"
            onSelect={() => runCommand(() => onOpenVersionHistory?.())}
          >
            <History className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Document Version History & Diffs</span>
            <CommandShortcut>Alt+H</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="encrypt lock document password vault aes"
            onSelect={() => runCommand(() => onOpenEncryptVault?.())}
          >
            <Lock className="mr-2 h-4 w-4 text-amber-500" />
            <span>Document Password Lock & Crypto Vault</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* View & Layout Actions */}
        <CommandGroup heading="View & Layout">
          <CommandItem
            value="switch view mode editor only"
            onSelect={() => runCommand(() => setViewMode('editor'))}
          >
            <Edit3 className="mr-2 h-4 w-4 text-blue-400" />
            <span>View: Editor Only</span>
          </CommandItem>

          <CommandItem
            value="switch view mode split view"
            onSelect={() => runCommand(() => setViewMode('split'))}
          >
            <Columns className="mr-2 h-4 w-4 text-blue-500" />
            <span>View: Split Editor & Preview</span>
          </CommandItem>

          <CommandItem
            value="switch view mode preview only"
            onSelect={() => runCommand(() => setViewMode('preview'))}
          >
            <Eye className="mr-2 h-4 w-4 text-blue-400" />
            <span>View: Live Preview Only</span>
            <CommandShortcut>Ctrl+Shift+V</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="toggle sidebar explorer"
            onSelect={() => runCommand(() => toggleSidebar())}
          >
            <Maximize className="mr-2 h-4 w-4 text-slate-400" />
            <span>Toggle Sidebar Explorer</span>
            <CommandShortcut>Ctrl+B</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="presentation mode slide deck present"
            onSelect={() => runCommand(() => onOpenPresentation?.())}
          >
            <Tv className="mr-2 h-4 w-4 text-purple-500" />
            <span>Present Document as Slides</span>
          </CommandItem>

          <CommandItem
            value="document diagnostics readability stats word count"
            onSelect={() => runCommand(() => onOpenDiagnostics?.())}
          >
            <Activity className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Document Diagnostics & Readability</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Tools & Export */}
        <CommandGroup heading="Tools & Export">
          <CommandItem
            value="format markdown tables align beautify"
            onSelect={() => runCommand(() => onFormatDocument?.())}
          >
            <Table className="mr-2 h-4 w-4 text-blue-500" />
            <span>Format & Align Markdown Tables</span>
            <CommandShortcut>Shift+Alt+F</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="export document markdown word docx html zip"
            onSelect={() => runCommand(() => onOpenExport?.())}
          >
            <Download className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Export Document (Word, HTML, ZIP, MD)</span>
            <CommandShortcut>Ctrl+E</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="toggle light dark theme"
            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-indigo-400" />
            )}
            <span>Toggle Color Theme ({theme === 'dark' ? 'Light' : 'Dark'})</span>
          </CommandItem>

          <CommandItem
            value="settings editor preferences font theme"
            onSelect={() => runCommand(() => onOpenSettings?.())}
          >
            <Settings className="mr-2 h-4 w-4 text-slate-400" />
            <span>Open Settings & Preferences</span>
            <CommandShortcut>Ctrl+,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
