const cache = new Map();
export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const requests = cache.get(key) || [];
  const recent = requests.filter((t: number) => now - t < windowMs);
  if (recent.length >= limit) return true;
  recent.push(now);
  cache.set(key, recent);
  return false;
}
