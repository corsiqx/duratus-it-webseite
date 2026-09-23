/**
 * Thin, failure-tolerant wrapper around Web Storage. Private mode or blocked storage must never break the portal,
 * so every access is guarded and falls back to "nothing stored".
 */
export function readJson<T>(storage: 'local' | 'session', key: string): T | null {
  try {
    const raw = (storage === 'local' ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(storage: 'local' | 'session', key: string, value: unknown): void {
  try {
    (storage === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the demo keeps working in memory.
  }
}

export function removeKey(storage: 'local' | 'session', key: string): void {
  try {
    (storage === 'local' ? localStorage : sessionStorage).removeItem(key);
  } catch {
    // ignore
  }
}
