import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function calculateReadingTime(text: string): {
  words: number;
  chars: number;
  minutes: number;
} {
  // Strip markdown syntax so only prose words are counted.
  const stripped = text
    .replace(/```[\s\S]*?```/g, '') // fenced code blocks
    .replace(/`[^`\n]+`/g, '') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → keep text
    .replace(/^\s*#{1,6}\s+/gm, '') // heading markers
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1') // bold / italic
    .replace(/~~([^~\n]+)~~/g, '$1') // strikethrough
    .replace(/==([^=\n]+)==/g, '$1') // highlights
    .replace(/^\s*[-*+>|]\s*/gm, '') // list bullets, blockquotes, table pipes
    .replace(/^\s*\d+\.\s+/gm, '') // ordered list numbers
    .replace(/^[-*_]{3,}\s*$/gm, '') // horizontal rules
    .replace(/\n+/g, ' ');

  const words = stripped.trim() ? stripped.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, chars, minutes };
}
