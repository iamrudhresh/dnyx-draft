export async function generateDocxBlob(markdown: string, title = 'Document'): Promise<Blob> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  } = await import('docx');

  const lines = markdown.split('\n');
  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block handling
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeBlockLines.join('\n'),
                font: 'Courier New',
                size: 20,
              }),
            ],
            spacing: { before: 120, after: 120 },
          }),
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Table handling
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Skip separator rows like | --- | --- |
      if (!line.includes('---')) {
        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        tableRows.push(cells);
      }
      continue;
    }

    if (inTable) {
      // Build table
      const docxRows = tableRows.map((row, rowIndex) => {
        return new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cell,
                        bold: rowIndex === 0,
                        size: 22,
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                },
              }),
          ),
        });
      });

      children.push(
        new Table({
          rows: docxRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      );
      inTable = false;
      tableRows = [];
    }

    // Headings
    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: line.replace('# ', ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
      );
    } else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.replace('## ', ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      );
    } else if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.replace('### ', ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        }),
      );
    } else if (line.startsWith('> ')) {
      // Blockquote
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace('> ', ''),
              italics: true,
              color: '555555',
            }),
          ],
          spacing: { before: 100, after: 100 },
        }),
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // List
      children.push(
        new Paragraph({
          text: line.substring(2),
          bullet: { level: 0 },
          spacing: { before: 60, after: 60 },
        }),
      );
    } else if (line.trim().length > 0) {
      // Normal paragraph
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { before: 60, after: 100 },
        }),
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title.replace(/\.md$/, ''),
            heading: HeadingLevel.TITLE,
            spacing: { after: 200 },
          }),
          ...children,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
