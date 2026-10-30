'use client';

// Particles for big celebrations (v2 spec 10.4): confetti (80 pieces,
// gravity 0.9), slow sparkles, or light bubbles rising for Still. A small
// canvas system written for Tide instead of adding canvas-confetti (D86):
// it's a few dozen lines, uses the theme's colors, runs for under three
// seconds, and never catches a tap. It's only loaded with the overlay.
import { useEffect, useRef } from 'react';
import type { Particles as Kind } from '@/lib/celebrate/matrix';

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  spin: number;
  angle: number;
  color: string;
  born: number;
}

const COLOR_VARS = ['--primary', '--accent', '--q-swell', '--q-still', '--q-surge', '--q-ebb', '--foam'];
const RUN_MS = 2600;
const GRAVITY = 0.9;

function spawn(kind: Kind, w: number, h: number, scale: number, colors: string[], i: number): Piece {
  const color = colors[i % colors.length];
  if (kind === 'bubbles') {
    return { x: Math.random() * w, y: h + Math.random() * h * 0.3, vx: 0, vy: -(0.6 + Math.random() * 0.8) * scale, size: (6 + Math.random() * 10) * scale, spin: 0, angle: 0, color, born: Math.random() * 600 };
  }
  if (kind === 'sparkles') {
    return { x: Math.random() * w, y: Math.random() * h * 0.7, vx: 0, vy: 0.2 * scale, size: (3 + Math.random() * 4) * scale, spin: 0, angle: 0, color, born: Math.random() * 1200 };
  }
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
  const speed = (10 + Math.random() * 8) * scale;
  return { x: w / 2, y: h * 0.55, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: (5 + Math.random() * 5) * scale, spin: (Math.random() - 0.5) * 0.3, angle: Math.random() * Math.PI, color, born: 0 };
}

export function Particles({ kind }: { kind: Kind }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || kind === 'none') return;
    const scale = Math.min(2, window.devicePixelRatio || 1);
    const w = (canvas.width = window.innerWidth * scale);
    const h = (canvas.height = window.innerHeight * scale);
    const styles = getComputedStyle(document.documentElement);
    const colors = COLOR_VARS.map((v) => styles.getPropertyValue(v).trim()).filter(Boolean);
    const count = kind === 'confetti' ? 80 : kind === 'sparkles' ? 36 : 24;
    const pieces = Array.from({ length: count }, (_, i) => spawn(kind, w, h, scale, colors.length ? colors : ['gray'], i));
    const start = performance.now();
    let raf = 0;

    const tick = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        if (elapsed < p.born) continue;
        const life = Math.min(1, (elapsed - p.born) / (RUN_MS - p.born));
        ctx.globalAlpha = 1 - life * life;
        ctx.fillStyle = p.color;
        if (kind === 'confetti') {
          p.vy += GRAVITY * 0.35 * scale;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.angle += p.spin;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, kind === 'sparkles' ? p.size * (0.6 + 0.4 * Math.sin(elapsed / 180 + p.born)) : p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        p.x += p.vx;
        p.y += p.vy;
      }
      if (elapsed < RUN_MS) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [kind]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 size-full" />;
}
