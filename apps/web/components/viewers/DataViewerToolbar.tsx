'use client';

import { ArrowRightLeft, Braces, CheckCircle2, Minimize2, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FormatConverterModal } from '@/components/modals/FormatConverterModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCsv, minifyCsv, validateCsv } from '@/lib/format/csv';
import { formatJson, minifyJson, validateJson } from '@/lib/format/json';
import { formatXml, minifyXml, validateXml } from '@/lib/format/xml';
import { formatYaml, minifyYaml, validateYaml } from '@/lib/format/yaml';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  base64Decode,
  base64Encode,
  escapeJsonString,
  escapeXmlEntities,
  unescapeJsonString,
  unescapeXmlEntities,
  urlDecode,
  urlEncode,
} from '@/lib/utils/escape';

export type DataViewerFormat = 'json' | 'xml' | 'yaml' | 'csv';

interface DataViewerToolbarProps {
  fileType: DataViewerFormat;
  content: string;
  docId?: string;
}

const ESCAPE_ACTIONS: { label: string; run: (input: string) => string }[] = [
  { label: 'JSON escape', run: escapeJsonString },
  { label: 'JSON unescape', run: unescapeJsonString },
  { label: 'XML entity escape', run: escapeXmlEntities },
  { label: 'XML entity unescape', run: unescapeXmlEntities },
  { label: 'URL encode', run: urlEncode },
  { label: 'URL decode', run: urlDecode },
  { label: 'Base64 encode', run: base64Encode },
  { label: 'Base64 decode', run: base64Decode },
];

export function DataViewerToolbar({ fileType, content, docId }: DataViewerToolbarProps) {
  const { updateDocument } = useWorkspaceStore();
  const [converterOpen, setConverterOpen] = useState(false);

  const applyContent = (result: string, successMessage: string) => {
    if (!docId) return;
    updateDocument(docId, { content: result });
    toast.success(successMessage);
  };

  const handleFormat = async () => {
    try {
      const result =
        fileType === 'json'
          ? formatJson(content)
          : fileType === 'xml'
            ? await formatXml(content)
            : fileType === 'yaml'
              ? await formatYaml(content)
              : await formatCsv(content);
      applyContent(result, 'Formatted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to format');
    }
  };

  const handleMinify = async () => {
    try {
      const result =
        fileType === 'json'
          ? minifyJson(content)
          : fileType === 'xml'
            ? await minifyXml(content)
            : fileType === 'yaml'
              ? await minifyYaml(content)
              : await minifyCsv(content);
      applyContent(result, 'Minified');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to minify');
    }
  };

  const handleValidate = async () => {
    try {
      if (fileType === 'json') {
        const result = validateJson(content);
        if (result.valid) toast.success('Valid JSON');
        else toast.error(result.error ?? 'Invalid JSON');
        return;
      }
      if (fileType === 'xml') {
        const result = await validateXml(content);
        if (result.valid) toast.success('Valid XML');
        else toast.error(result.error ?? 'Invalid XML');
        return;
      }
      if (fileType === 'yaml') {
        const result = await validateYaml(content);
        if (result.valid) toast.success('Valid YAML');
        else toast.error(result.error ?? 'Invalid YAML');
        return;
      }
      const result = await validateCsv(content);
      if (!result.valid) toast.error(result.error ?? 'Invalid CSV');
      else if (result.warnings.length > 0)
        toast.warning(`Valid CSV with warnings: ${result.warnings[0]}`);
      else toast.success('Valid CSV');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to validate');
    }
  };

  const handleEscapeAction = async (run: (input: string) => string) => {
    try {
      const result = run(content);
      await navigator.clipboard.writeText(result);
      toast.success('Copied to clipboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Transform failed');
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
      <button
        type="button"
        onClick={handleFormat}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        <Braces className="h-3.5 w-3.5" /> Format
      </button>
      <button
        type="button"
        onClick={handleMinify}
        className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-medium"
      >
        <Minimize2 className="h-3.5 w-3.5" /> Minify
      </button>
      <button
        type="button"
        onClick={handleValidate}
        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Validate
      </button>
      <button
        type="button"
        onClick={() => setConverterOpen(true)}
        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
      >
        <ArrowRightLeft className="h-3.5 w-3.5" /> Convert
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-medium"
          >
            <WandSparkles className="h-3.5 w-3.5" /> Escape/Unescape
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Copies transformed text to clipboard</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ESCAPE_ACTIONS.map((action) => (
            <DropdownMenuItem key={action.label} onClick={() => handleEscapeAction(action.run)}>
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <FormatConverterModal
        open={converterOpen}
        onOpenChange={setConverterOpen}
        sourceFormat={fileType}
        content={content}
        docId={docId}
      />
    </div>
  );
}
