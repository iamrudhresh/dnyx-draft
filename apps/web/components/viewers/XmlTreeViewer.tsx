'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { escapeXmlEntities } from '@/lib/utils/escape';
import { DataViewerToolbar } from './DataViewerToolbar';
import { JsonTreeViewer } from './JsonTreeViewer';

function domToObject(node: Element): unknown {
  const obj: Record<string, unknown> = {};

  if (node.attributes.length > 0) {
    const attrs: Record<string, string> = {};
    for (const attr of Array.from(node.attributes)) {
      attrs[attr.name] = attr.value;
    }
    obj['@attributes'] = attrs;
  }

  for (const child of Array.from(node.children)) {
    const key = child.tagName;
    const val = child.children.length > 0 ? domToObject(child) : (child.textContent?.trim() ?? '');
    if (key in obj) {
      if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
      (obj[key] as unknown[]).push(val);
    } else {
      obj[key] = val;
    }
  }

  if (Object.keys(obj).length === 0) {
    return node.textContent?.trim() ?? '';
  }

  return obj;
}

/** Inverse of domToObject: rebuilds an XML element string from the {'@attributes': ..., childTag: ...} shape. */
function buildElement(tagName: string, value: unknown, depth: number): string {
  const indent = '  '.repeat(depth);
  if (value === null || value === undefined) return `${indent}<${tagName} />`;

  if (typeof value !== 'object') {
    const text = escapeXmlEntities(String(value));
    return text ? `${indent}<${tagName}>${text}</${tagName}>` : `${indent}<${tagName} />`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => buildElement(tagName, item, depth)).join('\n');
  }

  const record = value as Record<string, unknown>;
  const attrs = (record['@attributes'] as Record<string, string> | undefined) ?? {};
  const attrString = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeXmlEntities(String(v))}"`)
    .join('');

  const childKeys = Object.keys(record).filter((k) => k !== '@attributes');
  if (childKeys.length === 0) {
    return `${indent}<${tagName}${attrString} />`;
  }

  const children = childKeys.map((k) => buildElement(k, record[k], depth + 1)).join('\n');
  return `${indent}<${tagName}${attrString}>\n${children}\n${indent}</${tagName}>`;
}

function objectToXml(wrapped: Record<string, unknown>): string {
  const [rootTag, rootValue] = Object.entries(wrapped)[0] ?? ['root', ''];
  return `${buildElement(rootTag, rootValue, 0)}\n`;
}

interface XmlTreeViewerProps {
  content: string;
  docId?: string;
  editable?: boolean;
}

export function XmlTreeViewer({ content, docId, editable = false }: XmlTreeViewerProps) {
  const { updateDocument } = useWorkspaceStore();
  const [jsonContent, setJsonContent] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');
      const parseErr = doc.querySelector('parsererror');
      if (parseErr) throw new Error(parseErr.textContent ?? 'XML parse error');
      const root = doc.documentElement;
      const obj = { [root.tagName]: domToObject(root) };
      setJsonContent(JSON.stringify(obj, null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
    }
  }, [content]);

  const handleChange = useCallback(
    (newJson: string) => {
      if (!docId) return;
      const obj = JSON.parse(newJson) as Record<string, unknown>;
      updateDocument(docId, { content: objectToXml(obj) });
    },
    [docId, updateDocument],
  );

  const toolbar =
    editable && docId ? <DataViewerToolbar fileType="xml" content={content} docId={docId} /> : null;

  if (error) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {toolbar}
        <div className="p-6 text-red-500 text-sm font-mono">
          <p className="font-semibold mb-1">Invalid XML</p>
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
