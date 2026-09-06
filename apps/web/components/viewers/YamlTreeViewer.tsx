'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { DataViewerToolbar } from './DataViewerToolbar';
import { JsonTreeViewer } from './JsonTreeViewer';

interface YamlTreeViewerProps {
  content: string;
  docId?: string;
  editable?: boolean;
}

export function YamlTreeViewer({ content, docId, editable = false }: YamlTreeViewerProps) {
  const { updateDocument } = useWorkspaceStore();
  const [jsonContent, setJsonContent] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import('js-yaml').then(({ default: yaml }) => {
      try {
        const parsed = yaml.load(content);
        setJsonContent(JSON.stringify(parsed, null, 2));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid YAML');
      }
    });
  }, [content]);

  const handleChange = useCallback(
    async (newJson: string) => {
      if (!docId) return;
      const { default: yaml } = await import('js-yaml');
      const obj = JSON.parse(newJson);
      const yamlStr = yaml.dump(obj, { lineWidth: 120 });
      updateDocument(docId, { content: yamlStr });
    },
    [docId, updateDocument],
  );

  const toolbar =
    editable && docId ? (
      <DataViewerToolbar fileType="yaml" content={content} docId={docId} />
    ) : null;

  if (error) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {toolbar}
        <div className="p-6 text-red-500 text-sm font-mono">
          <p className="font-semibold mb-1">Invalid YAML</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {toolbar}
      <div className="flex-1 overflow-hidden">
        <JsonTreeViewer
          content={jsonContent}
          editable={editable}
          showToolbar={false}
          onChange={editable && docId ? handleChange : undefined}
        />
      </div>
    </div>
  );
}
