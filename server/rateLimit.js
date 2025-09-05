// Simple in-memory sliding window rate limiter by IP + key

const buckets = new Map();

function nowMs() { return Date.now(); }

export function rateLimit({ key = 'global', windowMs = 60_000, max = 100 }) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    const bucketKey = `${key}:${ip}`;
    const ts = nowMs();
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    const arr = buckets.get(bucketKey);
    // drop old
    while (arr.length && ts - arr[0] > windowMs) arr.shift();

    if (arr.length >= max) {
      const retryAfterMs = arr.length ? Math.max(0, windowMs - (ts - arr[0])) : windowMs;
      res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((ts + retryAfterMs) / 1000));
      res.status(429).json({ error: 'Too Many Requests', key, windowMs, max, retryAfterMs });
      return;
    }

    // Accept request
    arr.push(ts);
    const firstTs = arr[0];
    const resetMs = Math.max(0, windowMs - (ts - firstTs));
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - arr.length));
    res.setHeader('X-RateLimit-Reset', Math.ceil((ts + resetMs) / 1000));
    next();
  };
}

// Socket limiter (per id/address)
export function makeSocketLimiter({ key = 'socket', windowMs = 60_000, max = 60 }) {
  const sockBuckets = new Map(); // map id->timestamps array
  return function checkAllowed(id) {
    const ts = nowMs();
    const bKey = `${key}:${id}`;
    if (!sockBuckets.has(bKey)) sockBuckets.set(bKey, []);
    const arr = sockBuckets.get(bKey);
    while (arr.length && ts - arr[0] > windowMs) arr.shift();
    if (arr.length >= max) return false;
    arr.push(ts);
    return true;
  };
}


