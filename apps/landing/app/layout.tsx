import type { Metadata } from 'next';
import type React from 'react';
import '../styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Dnyx Draft — The Modern, Local-First Markdown IDE',
  description:
    'Ultra-fast, private Markdown editor with live preview, LaTeX math, Mermaid diagrams, AES-256 password vault, and version history.',
  keywords: [
    'markdown editor',
    'live preview',
    'katex math',
    'mermaid diagrams',
    'aes-256 vault',
    'local first',
    'docx export',
  ],
  authors: [{ name: 'Dnyx Products' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-blue-500/20 selection:text-blue-600">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
