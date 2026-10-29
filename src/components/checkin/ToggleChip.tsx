'use client';

// A pill that can be switched on and off (causes, body places, feelings).
// It is a real toggle button with aria-pressed, and the selected state shows
// a check mark as well as a color change.
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToggleChip({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'inline-flex min-h-12 items-center gap-2 rounded-full border px-4 py-2 text-body',
        pressed ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink hover:bg-surface-2',
      )}
    >
      {pressed && <Check className="size-4" aria-hidden />}
      {label}
    </button>
  );
}
