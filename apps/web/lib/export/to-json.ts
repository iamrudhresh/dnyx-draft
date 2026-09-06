import type { DocumentItem } from '../db/schema';

interface Section {
  level: number;
  heading: string;
  content: string;
}

function extractSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const lines = markdown.split('\n');
  let currentSection: Section | null = null;
  const contentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        sections.push(currentSection);
        contentLines.length = 0;
      }
      currentSection = {
        level: headingMatch[1].length,
        heading: headingMatch[2].trim(),
        content: '',
      };
    } else if (currentSection) {
      contentLines.push(line);
    }
  }

  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    sections.push(currentSection);
  }

  return sections;
}

export function exportDocumentToJson(doc: DocumentItem): string {
  const sections = extractSections(doc.content);
  const output = {
    metadata: {
      id: doc.id,
      title: doc.title,
      tags: doc.tags ?? [],
      isFavorite: doc.isFavorite ?? false,
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
    },
    sections,
    raw: doc.content,
  };
  return JSON.stringify(output, null, 2);
}
