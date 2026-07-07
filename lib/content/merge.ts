// Merge helpers for the DB-override-over-static-defaults content pattern.
// Overrides only replace a value when it is meaningfully filled — empty
// strings/arrays in a saved override fall back to the layer below.

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function mergeSection<T>(base: T, override: unknown): T {
  if (!isFilled(override)) return base;

  // Arrays replace wholesale (a saved list is a complete list).
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  if (typeof base === "object" && base !== null && typeof override === "object") {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
      if (!(key in result)) continue; // whitelist: only known keys
      result[key] = mergeSection(result[key], value);
    }
    return result as T;
  }

  return override as T;
}

/**
 * Layer partial overrides over typed defaults. Later layers win. Only keys
 * present in the defaults shape are considered (structural whitelist).
 */
export function mergeContent<T extends object>(
  defaults: T,
  ...overrides: (Record<string, unknown> | null | undefined)[]
): T {
  let result = defaults;
  for (const override of overrides) {
    if (!override) continue;
    result = mergeSection(result, override);
  }
  return result;
}

/** Safely parse a JSON string column; null on any failure. */
export function parseJsonContent(raw: string | null | undefined): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}
