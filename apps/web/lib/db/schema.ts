export type DocumentFileType =
  | 'markdown'
  | 'csv'
  | 'json'
  | 'code'
  | 'yaml'
  | 'image'
  | 'pdf'
  | 'notebook'
  | 'xlsx'
  | 'xml'
  | 'config'
  | 'archive';

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  folderId?: string | null;
  tags?: string[];
  isFavorite?: boolean;
  isSecret?: boolean;
  isTrash?: boolean;
  trashedAt?: number;
  createdAt: number;
  updatedAt: number;
  fileType?: DocumentFileType;
  sourceFormat?: 'docx' | 'html' | 'pdf';
  blobId?: string;
  searchableText?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: number;
}

export interface TabItem {
  id: string;
  documentId: string;
  title: string;
}

export interface RevisionItem {
  id: string;
  documentId: string;
  title: string;
  content: string;
  summary?: string;
  timestamp: number;
}

export interface BlobItem {
  id: string;
  name: string;
  mimeType: string;
  data: ArrayBuffer;
  createdAt: number;
}

export interface ReplyItem {
  id: string;
  content: string;
  author: string;
  createdAt: number;
}

export interface CommentItem {
  id: string;
  documentId: string;
  anchorText: string;
  content: string;
  author: string;
  resolved: boolean;
  replies: ReplyItem[];
  createdAt: number;
  updatedAt: number;
}

export interface TokenItem {
  id: string;
  name: string;
  encryptedToken: string;
  createdAt: number;
}
