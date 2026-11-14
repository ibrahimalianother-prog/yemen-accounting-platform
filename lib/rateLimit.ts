type Bucket = { count: number; resetAt: number };

// In-memory, per-process limiter. Behind several instances, use a shared store (e.g. Redis) instead.
const buckets = new Map<string, Bucket>();

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > 5000) {
    buckets.forEach((bucket, bucketKey) => {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    });
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfter: 0 };
}
