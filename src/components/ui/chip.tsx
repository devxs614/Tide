'use client';

// A pill that can be switched on and off (v2 spec 4.4): causes, body places,
// feelings, filters. It's a real toggle button with aria-pressed, and the
// selected state shows a check that slides in plus a tinted fill, so it
// never depends on color alone.
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Chip({
  label,
  pressed,
  onToggle,
  className,
}: {
  label: string;
  pressed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 py-2 font-display text-[0.8824rem] font-bold transition-colors duration-(--dur-fast)',
        pressed
          ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))] text-ink'
          : 'border-line bg-surface text-ink hover:bg-surface-2',
        className,
      )}
    >
      {pressed && <Check className="anim-slide-in size-4 stroke-[3] text-primary" aria-hidden />}
      {label}
    </button>
  );
}
