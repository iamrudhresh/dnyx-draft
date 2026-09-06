# Troubleshooting Guide

## Common Issues & Solutions

### 1. IndexedDB quota exceeded
- Clear old soft-deleted files from the Trash Bin or export and clean up the workspace.

### 2. Mermaid diagram not rendering
- Verify that your diagram syntax matches standard Mermaid.js syntax and contains no unescaped HTML characters.

### 3. Port 3000 already in use
- Run with custom port: `pnpm dev -p 3001`.
