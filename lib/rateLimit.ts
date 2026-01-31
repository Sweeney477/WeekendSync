type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitConfig = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
};

const STORE_KEY = "__weekendsync_rate_limit_store__";

function getStore(): Map<string, RateLimitRecord> {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, RateLimitRecord>;
  };
  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = new Map();
  }
  return globalStore[STORE_KEY]!;
}

export function rateLimit(key: string, config: RateLimitConfig) {
  const store = getStore();
  const now = Date.now();
  const namespacedKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
  const existing = store.get(namespacedKey);

  if (!existing || now > existing.resetAt) {
    const record = { count: 1, resetAt: now + config.windowMs };
    store.set(namespacedKey, record);
    return { ok: true, remaining: config.max - 1, resetAt: record.resetAt };
  }

  existing.count += 1;
  store.set(namespacedKey, existing);
  return {
    ok: existing.count <= config.max,
    remaining: Math.max(0, config.max - existing.count),
    resetAt: existing.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
