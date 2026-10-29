// WCAG 2.x contrast math for the theme tests and the theme picker. Kept as
// plain functions so the tests can check all 15 themes without a browser.

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(rgb: Rgb): number {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

export function contrastRatio(a: string | Rgb, b: string | Rgb): number {
  const la = luminance(typeof a === 'string' ? hexToRgb(a) : a);
  const lb = luminance(typeof b === 'string' ? hexToRgb(b) : b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// A translucent color laid over an opaque one, the way the browser paints a
// quadrant tint over a card.
export function composite(top: string, alpha: number, under: string): Rgb {
  const t = hexToRgb(top);
  const u = hexToRgb(under);
  return [0, 1, 2].map((i) => Math.round(t[i] * alpha + u[i] * (1 - alpha))) as Rgb;
}
