'use client';

// The refocus nudge (v2.1 F-07): a small card that slides up from the
// bottom of the Focus screen (a CSS entrance, so motion Off keeps it still),
// never a full-screen interruption. "I drifted"
// shows the first step again; unanswered for a minute, the card shrinks to
// a "Still on it?" pill that waits quietly until tapped.
import { useEffect, useState } from 'react';
import { byMode, fill } from '@/copy/en';
import { nudgeCopy as t } from '@/copy/nudgeCopy';
import { useSettings } from '@/lib/settings';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SIZES } from '@/lib/companion/registry';
import { CompanionHost } from '@/components/companion/CompanionHost';
import type { NudgeKind } from './useNudges';

interface Props {
  kind: NudgeKind;
  task: Task;
  onYes: () => void;
  onDrifted: () => void;
  onPickUp: () => void;
  onBreak: () => void;
  onStop: () => void;
}

export function NudgeCard({ kind, task, onYes, onDrifted, onPickUp, onBreak, onStop }: Props) {
  const { settings } = useSettings();
  const [view, setView] = useState<'ask' | 'drift' | 'pill'>('ask');
  const mode = settings.communicationMode;
  const name = settings.name.trim();

  useEffect(() => {
    if (view !== 'ask') return;
    const id = window.setTimeout(() => setView('pill'), 60_000);
    return () => window.clearTimeout(id);
  }, [view]);

  if (view === 'pill') {
    return (
      <div data-overlay="nudge" className="fixed right-4 bottom-4 z-[var(--z-toast)]">
        <Button variant="secondary" onClick={() => setView('ask')}>
          {t.pill}
        </Button>
      </div>
    );
  }

  const title =
    kind === 'return'
      ? fill(byMode(t.returnTitle, mode), { task: task.title })
      : mode === 'gentle' && !name
        ? fill(t.titleNoName, { task: task.title })
        : fill(byMode(t.title, mode), { name, task: task.title });

  return (
    // flow-enter slides it up at Calm and Lively and does nothing at Off
    // (globals.css), the same entrance as the app's flows.
    <section data-overlay="nudge" aria-label={title} className="flow-enter fixed inset-x-0 bottom-0 z-[var(--z-toast)] p-4">
      <div className="card mx-auto flex max-w-md flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <CompanionHost placement="focus" size={SIZES.sm} base="curious" bubble="none" noneAlt="nothing" decorative />
          <p role="status" className="min-w-0 flex-1 font-bold break-words">
            {title}
          </p>
        </div>
        {view === 'drift' ? (
          <>
            {task.firstStep && <p className="break-words">{fill(t.firstStep, { step: task.firstStep })}</p>}
            {task.parkingNote && <p className="break-words text-ink-soft">{fill(t.youWereAt, { note: task.parkingNote })}</p>}
            <Button onClick={onPickUp}>{t.pickUp}</Button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Button onClick={onYes}>{t.yes}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                onDrifted();
                setView('drift');
              }}
            >
              {t.drifted}
            </Button>
            <Button variant="secondary" onClick={onBreak}>
              {t.takeBreak}
            </Button>
            <Button variant="quiet" onClick={onStop}>
              {t.stop}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
