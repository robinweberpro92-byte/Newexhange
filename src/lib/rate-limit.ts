type Entry = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var yasarRateLimitStore: Map<string, Entry> | undefined;
}

const store = global.yasarRateLimitStore ?? new Map<string, Entry>();
if (!global.yasarRateLimitStore) {
  global.yasarRateLimitStore = store;
}

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { success: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  store.set(key, current);

  return { success: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}
