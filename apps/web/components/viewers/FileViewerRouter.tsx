'use client';

import type { DocumentItem } from '@/lib/db/schema';
import { ArchiveViewer } from './ArchiveViewer';
import { CodeFileViewer } from './CodeFileViewer';
import { ConfigViewer } from './ConfigViewer';
import { CsvTableViewer } from './CsvTableViewer';
import { ImageViewer } from './ImageViewer';
import { JsonTreeViewer } from './JsonTreeViewer';
import { NotebookViewer } from './NotebookViewer';
import { PdfViewer } from './PdfViewer';
import { XlsxTableViewer } from './XlsxTableViewer';
import { XmlTreeViewer } from './XmlTreeViewer';
import { YamlTreeViewer } from './YamlTreeViewer';

interface FileViewerRouterProps {
  doc: DocumentItem;
}

export function FileViewerRouter({ doc }: FileViewerRouterProps) {
  switch (doc.fileType) {
    case 'csv':
      return <CsvTableViewer content={doc.content} docId={doc.id} editable />;
    case 'json':
      return <JsonTreeViewer content={doc.content} docId={doc.id} editable />;
    case 'yaml':
      return <YamlTreeViewer content={doc.content} docId={doc.id} editable />;
    case 'code':
      return <CodeFileViewer content={doc.content} filename={doc.title} />;
    case 'image':
      return <ImageViewer doc={doc} />;
    case 'pdf':
      return <PdfViewer doc={doc} />;
    case 'notebook':
      return <NotebookViewer content={doc.content} />;
    case 'xlsx':
      return <XlsxTableViewer content={doc.content} docId={doc.id} />;
    case 'xml':
      return <XmlTreeViewer content={doc.content} docId={doc.id} editable />;
    case 'config':
      return <ConfigViewer content={doc.content} filename={doc.title} />;
    case 'archive':
      return <ArchiveViewer doc={doc} />;
    default:
      return null;
  }
}
