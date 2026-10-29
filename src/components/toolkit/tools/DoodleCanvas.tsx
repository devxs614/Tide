'use client';

// A two-minute doodle: draw anything with a finger or mouse in one of three
// colors. Nothing is saved, ever; "Clear" wipes it. The pen colors are read
// from Tide's tokens at draw time, so they follow light and dark mode.
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SoftTimer } from './SoftTimer';
import type { ToolProps } from './types';

const PENS = [
  { id: 'ink', token: '--ink', label: copy.tools.doodle.ink, swatch: 'bg-ink' },
  { id: 'teal', token: '--primary', label: copy.tools.doodle.teal, swatch: 'bg-primary' },
  { id: 'warm', token: '--q-surge', label: copy.tools.doodle.warm, swatch: 'bg-surge' },
];

function tokenColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

export function DoodleCanvas({ onDone }: ToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [pen, setPen] = useState(PENS[0]);

  // Match the canvas's pixel size to its on-screen size so lines are sharp.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
  }, []);

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = point(e);
    ctx.strokeStyle = tokenColor(pen.token);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext('2d');
    const { x, y } = point(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col gap-3">
      <SoftTimer seconds={120} />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={copy.tools.doodle.label}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
        className="h-72 w-full touch-none rounded-card border border-line bg-surface"
      />
      <div role="group" aria-label={copy.tools.doodle.colors} className="flex flex-wrap gap-2">
        {PENS.map((p) => (
          <Button key={p.id} variant="secondary" size="sm" aria-pressed={pen.id === p.id} onClick={() => setPen(p)} className={cn(pen.id === p.id && 'border-primary')}>
            <span aria-hidden className={cn('size-4 rounded-full', p.swatch)} />
            {p.label}
          </Button>
        ))}
        <Button variant="quiet" size="sm" onClick={clear}>
          {copy.tools.doodle.clear}
        </Button>
      </div>
      <Button onClick={onDone}>{copy.toolkit.imDone}</Button>
    </div>
  );
}
