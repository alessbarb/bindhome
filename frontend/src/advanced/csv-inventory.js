// @ts-check

/**
 * Parse RFC-4180-style CSV into rows while preserving embedded commas,
 * escaped quotes and embedded newlines.
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field.length === 0) {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char === "\r") {
      if (text[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function encodeField(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** @param {string[][]} rows */
export function serializeCsv(rows) {
  return `${rows.map((row) => row.map(encodeField).join(",")).join("\n")}\n`;
}

/**
 * Filter a full BindHome inventory export to one HA Floor or Area.
 * @param {string} csvText
 * @param {{scope:'all'|'floor'|'area', floorId?:string|null, areaId?:string|null, areas?:Array<{area_id:string,floor_id?:string|null}>}} options
 */
export function scopeInventoryCsv(csvText, options) {
  if (options.scope === "all") return csvText;
  const rows = parseCsv(csvText);
  if (!rows.length) return csvText;
  const header = rows[0];
  const areaIndex = header.indexOf("area_id");
  if (areaIndex < 0) throw new Error("BindHome CSV is missing area_id");

  const allowed = new Set();
  if (options.scope === "area" && options.areaId) {
    allowed.add(options.areaId);
  } else if (options.scope === "floor" && options.floorId) {
    for (const area of options.areas ?? []) {
      if (area.floor_id === options.floorId) allowed.add(area.area_id);
    }
  }

  return serializeCsv([
    header,
    ...rows.slice(1).filter((row) => allowed.has(row[areaIndex] ?? "")),
  ]);
}

export function csvFilename(scope, id = null) {
  const safe = id ? id.replace(/[^a-zA-Z0-9_-]+/g, "-") : null;
  if (scope === "floor" && safe) return `bindhome-inventory-floor-${safe}.csv`;
  if (scope === "area" && safe) return `bindhome-inventory-area-${safe}.csv`;
  return "bindhome-inventory.csv";
}
