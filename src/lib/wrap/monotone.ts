// A smooth line through the day's check-ins that never overshoots (v2 spec
// 14.4, the Day tide chart): monotone cubic interpolation (Fritsch–Carlson).
// A plain curve could swing above a "very high" check-in or below a "very
// low" one, which would show a feeling Maya never reported.
export interface Point {
  x: number;
  y: number;
}

// An SVG path through the points, sorted by x.
export function monotonePath(points: Point[]): string {
  const p = [...points].sort((a, b) => a.x - b.x);
  if (p.length === 0) return '';
  if (p.length === 1) return `M${p[0].x} ${p[0].y}`;
  const n = p.length;
  const dx = p.slice(1).map((q, i) => q.x - p[i].x);
  const slope = p.slice(1).map((q, i) => (dx[i] === 0 ? 0 : (q.y - p[i].y) / dx[i]));
  const m: number[] = [slope[0], ...slope.slice(1).map((s, i) => (s * slope[i] <= 0 ? 0 : (s + slope[i]) / 2)), slope[n - 2]];
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${p[0].x} ${p[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${p[i].x + h} ${p[i].y + m[i] * h} ${p[i + 1].x - h} ${p[i + 1].y - m[i + 1] * h} ${p[i + 1].x} ${p[i + 1].y}`;
  }
  return d;
}
