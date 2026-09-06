import { describe, expect, it } from 'vitest';
import { generateDocxBlob } from '@/lib/export/docx';

describe('Microsoft Word (.docx) Export Engine', () => {
  it('should generate a valid DOCX blob from markdown content', async () => {
    const md = `# Project Architecture

This is a paragraph description.

## Features
- First item
- Second item

| Tool | Status |
| --- | --- |
| Next.js | Active |

\`\`\`typescript
const greeting = "Hello";
\`\`\`
`;

    const blob = await generateDocxBlob(md, 'Architecture.md');
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  });
});
