'use client';

import { useEffect, useState } from 'react';

interface ConfigViewerProps {
  content: string;
  filename?: string;
}

function parseEnv(text: string): Array<{ key: string; value: string; comment?: string }> {
  const rows: Array<{ key: string; value: string; comment?: string }> = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    rows.push({ key, value });
  }
  return rows;
}

function parseIni(text: string): Array<{ key: string; value: string; section?: string }> {
  const rows: Array<{ key: string; value: string; section?: string }> = [];
  let currentSection: string | undefined;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    rows.push({
      key: trimmed.slice(0, eq).trim(),
      value: trimmed.slice(eq + 1).trim(),
      section: currentSection,
    });
  }
  return rows;
}

export function ConfigViewer({ content, filename }: ConfigViewerProps) {
  const ext = filename?.split('.').pop()?.toLowerCase() ?? '';
  const [rows, setRows] = useState<Array<{ key: string; value: string; section?: string }>>([]);

  useEffect(() => {
    if (ext === 'toml') {
      // Use indirect import to prevent bundlers from statically resolving the optional package
      // eslint-disable-next-line no-new-func
      const dynamicImport = new Function('m', 'return import(m)') as (
        m: string,
      ) => Promise<{ parse: (s: string) => Record<string, unknown> }>;
      dynamicImport('@iarna/toml')
        .then((toml) => {
          try {
            const parsed = toml.parse(content);
            const flat: Array<{ key: string; value: string; section?: string }> = [];
            function flatten(obj: Record<string, unknown>, prefix = '') {
              for (const [k, v] of Object.entries(obj)) {
                if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                  flatten(v as Record<string, unknown>, prefix ? `${prefix}.${k}` : k);
                } else {
                  flat.push({ key: prefix ? `${prefix}.${k}` : k, value: String(v) });
                }
              }
            }
            flatten(parsed);
            setRows(flat);
          } catch {
            setRows([{ key: 'error', value: 'Invalid TOML' }]);
          }
        })
        .catch(() => {
          setRows([
            {
              key: 'note',
              value: '@iarna/toml not installed — add it to package.json to parse .toml files',
            },
          ]);
        });
    } else {
      const parsed = ext === 'ini' ? parseIni(content) : parseEnv(content);
      setRows(parsed);
    }
  }, [content, ext]);

  const sections = [...new Set(rows.map((r) => r.section).filter(Boolean))];
  const global = rows.filter((r) => !r.section);

  const renderRows = (items: typeof rows) => (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-800">
          <th className="text-left px-3 py-2 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 w-1/3">
            Key
          </th>
          <th className="text-left px-3 py-2 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((row, i) => (
          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 font-mono text-blue-700 dark:text-blue-400">
              {row.key}
            </td>
            <td className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300 break-all">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {global.length > 0 && renderRows(global)}
      {sections.map((section) => (
        <div key={section}>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            [{section}]
          </h3>
          {renderRows(rows.filter((r) => r.section === section))}
        </div>
      ))}
      {rows.length === 0 && (
        <div className="text-slate-400 text-sm text-center">Empty config file</div>
      )}
    </div>
  );
}
