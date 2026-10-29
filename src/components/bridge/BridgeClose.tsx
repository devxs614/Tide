'use client';

// Bridge step 1, Close: one line about where Maya is leaving off, so the
// next time she opens the task it says "You left off at: …" first. The
// question comes from the AI (or the plain fallback for her mode).
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { DictateButton } from '@/components/ui/DictateButton';

export function BridgeClose({ prompt, note, onNote, onSave }: { prompt: string; note: string; onNote: (n: string) => void; onSave: () => void }) {
  return (
    <section aria-labelledby="bridge-close" className="flex flex-col gap-2">
      <h3 id="bridge-close" className="text-h3 font-bold">
        1 · {copy.bridge.close}
      </h3>
      <label htmlFor="parking-note">{prompt}</label>
      <input
        id="parking-note"
        value={note}
        maxLength={140}
        onChange={(e) => onNote(e.target.value)}
        className="min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body"
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onSave}>
          {copy.bridge.saveNote}
        </Button>
        <DictateButton value={note} onChange={onNote} />
      </div>
    </section>
  );
}
