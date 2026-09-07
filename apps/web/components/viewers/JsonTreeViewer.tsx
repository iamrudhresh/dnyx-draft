'use client';

import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { DataViewerToolbar } from './DataViewerToolbar';

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

interface TreeNodeProps {
  value: JsonValue;
  label?: string;
  depth?: number;
  editable?: boolean;
  onChange?: (v: JsonValue) => void;
}

function TreeNode({ value, label, depth = 0, editable, onChange }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');

  const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isPrimitive = !isObject && !isArray;

  const typeColor =
    typeof value === 'string'
      ? 'text-emerald-600 dark:text-emerald-400'
      : typeof value === 'number'
        ? 'text-blue-600 dark:text-blue-400'
        : typeof value === 'boolean'
          ? 'text-purple-600 dark:text-purple-400'
          : value === null
            ? 'text-slate-400'
            : '';

  const commitPrimitive = () => {
    setEditing(false);
    if (!onChange) return;
    const n = Number(editVal);
    if (!Number.isNaN(n) && editVal.trim() !== '') onChange(n);
    else if (editVal === 'true') onChange(true);
    else if (editVal === 'false') onChange(false);
    else if (editVal === 'null') onChange(null);
    else onChange(editVal);
  };

  return (
    <div className="font-mono text-sm" style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
      <div className="flex items-center gap-1 min-h-[22px] group">
        {(isObject || isArray) && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}
        {isPrimitive && <span className="w-3.5 shrink-0" />}

        {label !== undefined && (
          <span className="text-slate-700 dark:text-slate-300 shrink-0">{label}:</span>
        )}

        {isPrimitive &&
          (editable && editing ? (
            <input
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={commitPrimitive}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitPrimitive();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="bg-white dark:bg-slate-900 border border-blue-500 rounded px-1 outline-none min-w-0 flex-1"
            />
          ) : (
            <span
              className={`${typeColor} ${editable ? 'cursor-pointer hover:underline' : ''}`}
              onClick={() => {
                if (!editable) return;
                setEditVal(String(value));
                setEditing(true);
              }}
            >
              {typeof value === 'string' ? `"${value}"` : String(value)}
            </span>
          ))}

        {isObject && (
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {expanded
              ? '{'
              : `{ ${Object.keys(value as object).length === 0 ? '' : `${Object.keys(value as object).length} ${Object.keys(value as object).length === 1 ? 'key' : 'keys'}`} }`}
          </span>
        )}
        {isArray && (
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {expanded
              ? '['
              : `[ ${(value as JsonValue[]).length === 0 ? '' : `${(value as JsonValue[]).length} ${(value as JsonValue[]).length === 1 ? 'item' : 'items'}`} ]`}
          </span>
        )}

        {editable && isObject && onChange && expanded && (
          <button
            type="button"
            title="Add key"
            onClick={() => {
              const k = prompt('Key name:');
              if (!k) return;
              onChange({ ...(value as object), [k]: '' });
              setExpanded(true);
            }}
            className="opacity-0 group-hover:opacity-100 ml-1 text-blue-400 hover:text-blue-600"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      {(isObject || isArray) && expanded && (
        <div>
          {isObject &&
            Object.entries(value as { [k: string]: JsonValue }).map(([k, v]) => (
              <div key={k} className="flex items-start group/row">
                <TreeNode
                  value={v}
                  label={k}
                  depth={depth + 1}
                  editable={editable}
                  onChange={
                    editable && onChange
                      ? (newV) => onChange({ ...(value as object), [k]: newV })
                      : undefined
                  }
                />
                {editable && onChange && (
                  <button
                    type="button"
                    onClick={() => {
                      const { [k]: _, ...rest } = value as { [k: string]: JsonValue };
                      onChange(rest);
                    }}
                    className="opacity-0 group-hover/row:opacity-100 mt-0.5 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          {isArray &&
            (value as JsonValue[]).map((v, i) => (
              <TreeNode
                key={i}
                value={v}
                label={String(i)}
                depth={depth + 1}
                editable={editable}
                onChange={
                  editable && onChange
                    ? (newV) => {
                        const arr = [...(value as JsonValue[])];
                        arr[i] = newV;
                        onChange(arr);
                      }
                    : undefined
                }
              />
            ))}
          {/* Closing bracket */}
          <div
            className="font-mono text-sm text-slate-500 dark:text-slate-400"
            style={{ paddingLeft: depth > 0 ? 16 : 0 }}
          >
            {isObject ? '}' : ']'}
          </div>
        </div>
      )}
    </div>
  );
}

interface JsonTreeViewerProps {
  content: string;
  docId?: string;
  editable?: boolean;
  showToolbar?: boolean;
  /** When provided, tree edits call this instead of writing JSON directly to docId — used by viewers (YAML/XML) that need to re-serialize the tree back to their own format. */
  onChange?: (json: string) => void;
}

export function JsonTreeViewer({
  content,
  docId,
  editable = false,
  showToolbar = true,
  onChange,
}: JsonTreeViewerProps) {
  const { updateDocument } = useWorkspaceStore();
  const [tree, setTree] = useState<JsonValue>(null);
  const [error, setError] = useState<string | null>(null);
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content);
      setTree(parsed);
      setError(null);

      if (typeof parsed === 'object' && parsed !== null && '$schema' in parsed) {
        import('ajv').then(({ default: Ajv }) => {
          import('ajv/dist/2020').then(({ default: Ajv2020 }) => {
            try {
              const ajv = new Ajv2020({ allErrors: true });
              const validate = ajv.compile(parsed);
              validate(parsed);
              if (validate.errors) {
                setSchemaErrors(validate.errors.map((e) => `${e.instancePath} ${e.message}`));
              }
            } catch {
              // ignore ajv compile errors on self-referential schemas
            }
          });
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [content]);

  const handleChange = useCallback(
    (newTree: JsonValue) => {
      setTree(newTree);
      const json = JSON.stringify(newTree, null, 2);
      if (onChange) {
        onChange(json);
      } else if (docId) {
        updateDocument(docId, { content: json });
      }
    },
    [docId, onChange, updateDocument],
  );

  const toolbar =
    showToolbar && editable && docId ? (
      <DataViewerToolbar fileType="json" content={content} docId={docId} />
    ) : null;

  if (error) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {toolbar}
        <div className="p-6 text-red-500 text-sm font-mono">
          <p className="font-semibold mb-1">Invalid JSON</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {toolbar}
      <div className="flex-1 overflow-auto p-6">
        {schemaErrors.length > 0 && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400">
            <p className="font-semibold mb-1">Schema validation errors ({schemaErrors.length}):</p>
            {schemaErrors.map((e, i) => (
              <p key={i}>• {e}</p>
            ))}
          </div>
        )}
        <TreeNode
          value={tree}
          depth={0}
          editable={editable}
          onChange={editable ? handleChange : undefined}
        />
      </div>
    </div>
  );
}
