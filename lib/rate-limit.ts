// In-memory sliding-window rate limiter, keyed by IP.
// Deliberately fail-open and per-instance (no Redis) — the partial unique
// index on appointments(date, time) is the real double-booking guard.

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

export function rateLimit(key: string): { allowed: boolean } {
  try {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    const timestamps = (attempts.get(key) ?? []).filter((t) => t > windowStart);
    if (timestamps.length >= MAX_ATTEMPTS) {
      attempts.set(key, timestamps);
      return { allowed: false };
    }

    timestamps.push(now);
    attempts.set(key, timestamps);

    // Occasional prune so the map doesn't grow unbounded.
    if (attempts.size > 1000) {
      for (const [k, ts] of attempts) {
        if (ts.every((t) => t <= windowStart)) attempts.delete(k);
      }
    }

    return { allowed: true };
  } catch {
    return { allowed: true }; // fail-open by design
  }
}
