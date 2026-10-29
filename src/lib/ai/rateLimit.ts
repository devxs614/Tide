// A small per-IP limit on the AI routes, because the deployment is public
// and the API key costs money. It is an in-memory sliding window: good
// enough for one serverless instance and a demo, not a security boundary.
// When it trips, the route answers 429 and the browser uses its fallback.

const hits = new Map<string, number[]>();

export function rateLimitConfig() {
  return {
    max: Number(process.env.TIDE_RATE_LIMIT_MAX ?? 40),
    windowMs: Number(process.env.TIDE_RATE_LIMIT_WINDOW_MS ?? 600_000),
  };
}

// `at` is the server's request time. This runs on the server, outside the
// app's demo clock, so it uses the real time passed in by the caller.
export function allowRequest(ip: string, at: number, max: number, windowMs: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => at - t < windowMs);
  if (recent.length >= max) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(at);
  hits.set(ip, recent);
  return true;
}

export function resetRateLimitForTests(): void {
  hits.clear();
}
