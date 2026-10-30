'use client';

// The day as a tide (v2 spec 14.4, step 3): energy through the day as a
// smooth line that never overshoots a check-in, each piece colored by its
// nearest check-in's state, the check-ins as dots, and a row of small marks
// for what happened. It draws itself at Lively, fades in at Calm, and just
// appears at Off. Screen readers get the whole day in words, and anyone can
// switch to a plain list.
import { useState } from 'react';
import { copy, fill, quadrantName } from '@/copy/en';
import { getEmotion } from '@/data/emotions';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { formatTime } from '@/lib/time';
import { monotonePath } from '@/lib/wrap/monotone';
import type { DayFacts } from '@/lib/wrap/facts';
import { Button } from '@/components/ui/button';

const W = 340;
const H = 140;
const PAD = 14;

function hours(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h + (m || 0) / 60;
}

export function DayTideChart({ facts, dayStart, dayEnd }: { facts: DayFacts; dayStart: string; dayEnd: string }) {
  const level = useMotionLevel();
  const [asList, setAsList] = useState(false);
  const from = hours(dayStart);
  const to = Math.max(from + 1, hours(dayEnd));
  const x = (ts: number) => {
    const d = new Date(ts);
    const h = Math.min(to, Math.max(from, d.getHours() + d.getMinutes() / 60));
    return PAD + ((h - from) / (to - from)) * (W - 2 * PAD);
  };
  const y = (energy: number) => PAD + ((5 - energy) / 10) * (H - 2 * PAD);
  const points = facts.checkins.map((c) => ({ x: x(c.ts), y: y(c.energy) }));
  const flat = points.length < 2;
  const path = flat ? `M${PAD} ${points[0]?.y ?? y(0)} L${W - PAD} ${points[0]?.y ?? y(0)}` : monotonePath(points);
  const marks = [
    ...facts.tasksDone.map((t) => ({ ts: t.doneAt!, label: t.title })),
    ...facts.transitions.map((t) => ({ ts: t.ts, label: t.label })),
    ...facts.focusBlocks.map((b) => ({ ts: b.ts, label: copy.wrap.tideTitle })),
  ];
  const description = facts.checkins.map((c) => `${formatTime(c.ts)} ${quadrantName(c.quadrant)}`).join(', ') || copy.wrap.noCheckin;

  return (
    <div className="flex flex-col gap-2">
      {asList ? (
        <table className="w-full text-left text-small">
          <tbody>
            {[...facts.checkins.map((c) => ({ ts: c.ts, label: `${quadrantName(c.quadrant)} ${c.emotions.map((e) => getEmotion(e)?.word ?? e).join(', ')}` })), ...marks]
              .sort((a, b) => a.ts - b.ts)
              .map((row) => (
                <tr key={`${row.ts}-${row.label}`} className="border-b border-line">
                  <td className="py-2 pr-3 whitespace-nowrap">{formatTime(row.ts)}</td>
                  <td className="py-2">{row.label}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <svg role="img" aria-label={fill(copy.wrap.chartLabel, { points: description })} viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
          <line x1={PAD} x2={W - PAD} y1={y(0)} y2={y(0)} stroke="var(--line)" strokeDasharray="4 4" />
          <path d={path} fill="none" stroke="var(--primary)" strokeWidth={3.5} strokeLinecap="round" pathLength={1} className={level === 'lively' ? 'tide-draw' : level === 'calm' ? 'anim-pop' : undefined} />
          {facts.checkins.map((c) => (
            <circle key={c.id} cx={x(c.ts)} cy={y(c.energy)} r={6} fill={`var(--q-${c.quadrant})`} stroke="var(--surface)" strokeWidth={2} />
          ))}
          {marks.map((m) => (
            <circle key={`${m.ts}-${m.label}`} cx={x(m.ts)} cy={H + 12} r={4} fill="var(--accent)" />
          ))}
        </svg>
      )}
      {flat && <p className="text-small text-ink-soft">{facts.checkins.length === 1 ? copy.wrap.oneCheckin : copy.wrap.noCheckin}</p>}
      <Button variant="link" size="inline" className="self-start" onClick={() => setAsList(!asList)}>
        {asList ? copy.wrap.showChart : copy.wrap.showList}
      </Button>
    </div>
  );
}
