'use client';

// v1's name for the toggle pill, kept so every v1 import still works. The
// pill itself is the v2 Chip in components/ui/chip.tsx.
import { Chip } from '@/components/ui/chip';

export function ToggleChip({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
  return <Chip label={label} pressed={pressed} onToggle={onToggle} />;
}
