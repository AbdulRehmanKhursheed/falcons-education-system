/**
 * Minimal CSV parser (RFC 4180-ish).
 *
 * Handles:
 *  - Quoted fields with embedded commas
 *  - Escaped quotes inside quoted fields ("")
 *  - Mixed line endings (\r\n, \n, \r)
 *  - Trailing newlines (no empty trailing row)
 *  - Empty lines are skipped
 *
 * Returns rows as string[][]. Whitespace inside cells is preserved; only the
 * caller decides how to trim. Header row is included as the first element.
 */
export function parseCSV(input: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
  const n = input.length;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    // Skip rows that are entirely empty (a single empty field & nothing else).
    if (row.length === 1 && row[0] === '') {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  while (i < n) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        // Lookahead — doubled quote means escaped quote
        if (i + 1 < n && input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        // End of quoted section
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      pushField();
      i++;
      continue;
    }
    if (ch === '\n') {
      pushField();
      pushRow();
      i++;
      continue;
    }
    if (ch === '\r') {
      pushField();
      pushRow();
      // Swallow following \n if present (handle \r\n)
      if (i + 1 < n && input[i + 1] === '\n') i += 2;
      else i++;
      continue;
    }
    field += ch;
    i++;
  }

  // Flush trailing field/row (file may not end with a newline)
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  return rows;
}
