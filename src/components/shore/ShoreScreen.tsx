'use client';

// "Your Shore": the Proof log as a place, where every win washes up as a
// shell, a pebble or a piece of sea glass. Until the scene is built (V7) it
// shows the real empty state the finished screen uses, never "coming soon".
import { copy } from '@/copy/en';
import { EmptyState } from '@/components/ui/empty-state';

export function ShoreScreen() {
  return (
    <div className="flex flex-col gap-4">
      <EmptyState title={copy.shore.shoreTitle} body={copy.shore.shoreEmpty} />
      <p className="text-center text-ink-soft">{copy.shore.shoreHint}</p>
    </div>
  );
}
