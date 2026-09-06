export async function formatCsv(content: string, delimiter = ','): Promise<string> {
  const { default: Papa } = await import('papaparse');
  const parsed = Papa.parse<string[]>(content.trim(), { skipEmptyLines: true, delimiter });
  return Papa.unparse(parsed.data, { delimiter });
}

export async function minifyCsv(content: string): Promise<string> {
  const { default: Papa } = await import('papaparse');
  const parsed = Papa.parse<string[]>(content.trim(), { skipEmptyLines: true, delimiter: ',' });
  const trimmed = parsed.data.map((row) => row.map((cell) => cell.trim()));
  return Papa.unparse(trimmed, { newline: '\n' });
}

export interface CsvValidationResult {
  valid: boolean;
  error?: string;
  warnings: string[];
}

export async function validateCsv(content: string): Promise<CsvValidationResult> {
  const { default: Papa } = await import('papaparse');
  const parsed = Papa.parse<string[]>(content.trim(), { skipEmptyLines: true, delimiter: ',' });
  const fatalError = parsed.errors.find(
    (e) =>
      e.code !== 'TooFewFields' && e.code !== 'TooManyFields' && e.code !== 'UndetectableDelimiter',
  );
  if (fatalError) {
    return { valid: false, error: fatalError.message, warnings: [] };
  }
  const warnings: string[] = [];
  const columnCount = parsed.data[0]?.length ?? 0;
  parsed.data.forEach((row, i) => {
    if (row.length !== columnCount) {
      warnings.push(`Row ${i + 1} has ${row.length} columns, expected ${columnCount}`);
    }
  });
  return { valid: true, warnings };
}
