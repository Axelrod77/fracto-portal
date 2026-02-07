/**
 * Parse CSV text into an array of objects using the first row as headers.
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? "").trim();
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse JSON text into an array of objects.
 */
export function parseJSON(text: string): Record<string, unknown>[] {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) {
    return parsed.data;
  }
  return [parsed];
}

/**
 * Try to parse file content as CSV or JSON, based on file extension or content.
 */
export function parseFile(
  content: string,
  filename: string
): Record<string, unknown>[] {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "json") {
    return parseJSON(content);
  }

  if (ext === "csv") {
    return parseCSV(content);
  }

  // Try JSON first, fall back to CSV
  try {
    return parseJSON(content);
  } catch {
    return parseCSV(content);
  }
}

/**
 * Normalize a header name: lowercase, replace spaces/dashes with underscores.
 */
export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Map raw row keys to expected field names using fuzzy matching.
 */
export function mapFields<T extends Record<string, string>>(
  rows: Record<string, unknown>[],
  fieldMap: T
): Record<string, string>[] {
  if (rows.length === 0) return [];

  const rawHeaders = Object.keys(rows[0]);
  const normalizedMap: Record<string, string> = {};

  // Build mapping from normalized raw header → expected field name
  for (const rawHeader of rawHeaders) {
    const normalized = normalizeHeader(rawHeader);
    for (const [expectedNorm, expectedField] of Object.entries(fieldMap)) {
      if (
        normalized === expectedNorm ||
        normalized.includes(expectedNorm) ||
        expectedNorm.includes(normalized)
      ) {
        normalizedMap[rawHeader] = expectedField;
        break;
      }
    }
  }

  return rows.map((row) => {
    const mapped: Record<string, string> = {};
    for (const [rawKey, mappedKey] of Object.entries(normalizedMap)) {
      mapped[mappedKey] = String(row[rawKey] ?? "");
    }
    return mapped;
  });
}
