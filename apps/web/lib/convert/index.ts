export type ConvertFormat = 'json' | 'xml' | 'yaml' | 'csv';

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Flattens a record's nested objects into "a.b.c" keys; arrays are JSON-stringified. */
function flattenRecord(record: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainRecord(value)) {
      Object.assign(out, flattenRecord(value, path));
    } else if (Array.isArray(value)) {
      out[path] = JSON.stringify(value);
    } else {
      out[path] = value;
    }
  }
  return out;
}

/** Converts arbitrary parsed content into an array of flat records, the shape CSV requires. */
function toCsvRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.map((item) => (isPlainRecord(item) ? flattenRecord(item) : { value: item }));
  }
  if (isPlainRecord(value)) {
    return [flattenRecord(value)];
  }
  throw new Error('Value must be an object or array of objects to convert to CSV');
}

/** Parses `content` in `format` into a canonical JS value (object/array/primitive). */
export async function toObject(content: string, format: ConvertFormat): Promise<unknown> {
  switch (format) {
    case 'json':
      return JSON.parse(content);
    case 'yaml': {
      const { default: yaml } = await import('js-yaml');
      return yaml.load(content);
    }
    case 'xml': {
      const { XMLParser } = await import('fast-xml-parser');
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      return parser.parse(content);
    }
    case 'csv': {
      const { default: Papa } = await import('papaparse');
      const parsed = Papa.parse<Record<string, unknown>>(content.trim(), {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
      });
      if (parsed.errors.length > 0) throw new Error(parsed.errors[0].message);
      return parsed.data;
    }
    default:
      throw new Error(`Unsupported format: ${format satisfies never}`);
  }
}

/** Serializes a canonical JS value into `format`. */
export async function fromObject(value: unknown, format: ConvertFormat): Promise<string> {
  switch (format) {
    case 'json':
      return JSON.stringify(value, null, 2);
    case 'yaml': {
      const { default: yaml } = await import('js-yaml');
      return yaml.dump(value, { lineWidth: 120 });
    }
    case 'xml': {
      const { XMLBuilder } = await import('fast-xml-parser');
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        format: true,
        indentBy: '  ',
      });
      const root = isPlainRecord(value) ? value : { root: value };
      return builder.build(root);
    }
    case 'csv': {
      const { default: Papa } = await import('papaparse');
      return Papa.unparse(toCsvRecords(value));
    }
    default:
      throw new Error(`Unsupported format: ${format satisfies never}`);
  }
}

export async function convert(
  content: string,
  from: ConvertFormat,
  to: ConvertFormat,
): Promise<string> {
  if (from === to) return content;
  const obj = await toObject(content, from);
  return fromObject(obj, to);
}
