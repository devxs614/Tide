'use client';

// The rehearsal panel, only with ?demoDebug=1 (v2 spec 16; demo fix pack
// Section 8): the steps that ran or were skipped (the tour check script
// reads this list), the demo clock's time and speed, and a timed log of
// what the director did (state changes and who caused them, ignored
// toggles, steps, waits for the screen, narration, themes), with a button
// that copies it so the team can paste it into a message.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { copy, fill } from '@/copy/en';
import { demoCopy } from '@/copy/demoCopy';
import { demoSpeed, now } from '@/lib/clock';
import { formatTime } from '@/lib/time';
import { director } from './engine';

const stamp = (ms: number) => `${Math.floor(ms / 60_000)}:${String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`;

export function DebugPanel() {
  const state = useSyncExternalStore(director.subscribe, director.getState, director.getState);
  const [, redraw] = useState(0);
  const [copied, setCopied] = useState(false);
  // New log lines, and the clock, twice a second.
  useEffect(() => {
    const off = director.onNote(() => redraw((n) => n + 1));
    const tick = window.setInterval(() => redraw((n) => n + 1), 500);
    return () => {
      off();
      window.clearInterval(tick);
    };
  }, []);
  const lines = director.journal().map((l) => `${stamp(l.at)} ${l.text}`);
  const copyLog = () => {
    void navigator.clipboard?.writeText(lines.join('\n')).then(() => setCopied(true), () => undefined);
  };
  return (
    <aside aria-label={copy.demo.debugTitle} className="fixed top-2 right-2 z-[calc(var(--z-demo)+4)] max-h-[60vh] w-64 overflow-y-auto rounded-card border-2 border-line bg-surface p-2 text-caption">
      <p className="font-bold">{copy.demo.debugTitle}</p>
      <p>{fill(demoCopy.clockLabel, { time: formatTime(now()), speed: demoSpeed() })}</p>
      <ul>
        {state.log.map((l, i) => (
          <li key={`${l.id}-${i}`}>
            {l.ok ? 'ok' : 'skipped'} · {l.id}
          </li>
        ))}
      </ul>
      <button type="button" className="min-h-12 font-bold text-primary underline underline-offset-4" onClick={copyLog}>
        {copied ? demoCopy.logCopied : demoCopy.copyLog}
      </button>
      <pre className="whitespace-pre-wrap break-words">{lines.join('\n')}</pre>
    </aside>
  );
}
