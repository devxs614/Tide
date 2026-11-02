'use client';

// Count back (v2.1 F-13): from 100 (or 50, 30, 20) by 7 (or 6 down to 2,
// which is easier). Think of the next number and reveal it, or type it.
// A typed miss just shows the number and carries on from there; nothing
// is ever marked wrong. Ten steps, or until zero, then a moment to notice
// breathing and the usual re-check. Choices are remembered in Settings.
import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { byMode, copy, fill } from '@/copy/en';
import { toolsCopy } from '@/copy/toolsCopy';
import { emitCompanion } from '@/lib/companion/bus';
import { checkAnswer, COUNT_STARTS, COUNT_STEPS, countBackSequence } from '@/lib/countBack';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { ToolProps } from './types';

const t = toolsCopy.countBack;

export function CountBack({ onDone }: ToolProps) {
  const { settings, updateMany } = useSettings();
  const level = useMotionLevel();
  const step = settings['toolkit.countBackStep'];
  const start = settings['toolkit.countBackStart'];
  const mode = settings['toolkit.countBackMode'];
  const seq = useMemo(() => countBackSequence(start, step), [start, step]);
  const total = seq.length - 1;
  const [at, setAt] = useState(0);
  const [typed, setTyped] = useState('');
  const [said, setSaid] = useState<{ right: boolean; text: string } | null>(null);
  const finished = at >= total;
  const instruction = fill(byMode(t.instruction, settings.communicationMode), { start, step });

  // A new step or start begins again from the top.
  const choose = (patch: Partial<Settings>) => {
    void updateMany(patch);
    setAt(0);
    setTyped('');
    setSaid(null);
  };
  const advance = () => {
    setAt(at + 1);
    if (level === 'lively') emitCompanion({ type: 'nudge', expression: 'happy', reaction: 'hop' });
  };
  const submit = () => {
    const answer = checkAnswer(typed, seq[at + 1]);
    if (answer.kind === 'empty') return;
    setSaid({ right: answer.kind === 'right', text: fill(answer.kind === 'right' ? t.right : t.close, { n: seq[at + 1] }) });
    setTyped('');
    advance();
  };

  return (
    <section className="flex flex-col gap-4 card p-4">
      <div role="group" aria-label={t.stepLabel} className="flex flex-col gap-2">
        <span className="font-bold">{t.stepLabel}</span>
        <div className="flex flex-wrap gap-2">
          {COUNT_STEPS.map((n) => (
            <Chip key={n} label={fill(t.stepChip, { n })} pressed={step === n} onToggle={() => choose({ 'toolkit.countBackStep': n })} />
          ))}
        </div>
        <span className="text-caption text-ink-soft">{t.stepHint}</span>
      </div>
      <div role="group" aria-label={t.startLabel} className="flex flex-col gap-2">
        <span className="font-bold">{t.startLabel}</span>
        <div className="flex flex-wrap gap-2">
          {COUNT_STARTS.map((n) => (
            <Chip key={n} label={fill(t.startChip, { n })} pressed={start === n} onToggle={() => choose({ 'toolkit.countBackStart': n })} />
          ))}
        </div>
      </div>
      <SegmentedControl
        label={t.modeLabel}
        value={mode}
        onChange={(v) => choose({ 'toolkit.countBackMode': v as Settings['toolkit.countBackMode'] })}
        options={(['reveal', 'type'] as const).map((v) => ({ value: v, label: t.modes[v] }))}
      />
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1">{instruction}</p>
        <ReadAloudButton text={`${fill(t.current, { n: seq[at] })}. ${instruction}`} />
      </div>

      <div className="flex flex-col items-center gap-2 rounded-card bg-surface-2 p-4">
        <p aria-live="polite" className="sr-only">
          {fill(t.current, { n: seq[at] })}
        </p>
        {/* The number turns over (Lively), fades (Calm) or just changes (Off). */}
        <span key={at} aria-hidden className="count-in font-display text-display font-extrabold tabular-nums">
          {seq[at]}
        </span>
        <span className="text-caption text-ink-soft">{fill(t.progress, { k: at, total })}</span>
        {said && (
          <p className="flex items-center gap-1 text-ink-soft" role="status">
            {said.right && <Check aria-hidden className="size-4 text-primary" />}
            {said.text}
          </p>
        )}
      </div>

      {finished ? (
        <div className="flex flex-col gap-2">
          <p className="font-bold" role="status">
            {t.done}
          </p>
          <Button onClick={onDone}>{t.continue}</Button>
        </div>
      ) : mode === 'reveal' ? (
        <Button onClick={advance} autoFocus data-demo-id="countback-next">
          {t.next}
        </Button>
      ) : (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1">
            <label htmlFor="countback-answer" className="font-bold">
              {t.answerLabel}
            </label>
            <input
              id="countback-answer"
              inputMode="numeric"
              value={typed}
              onChange={(e) => setTyped(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              className="min-h-12 rounded-input border border-line bg-surface px-3 text-body"
            />
          </div>
          <Button type="submit">{t.check}</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSaid(null);
              advance();
            }}
          >
            {t.showMe}
          </Button>
        </form>
      )}
      {!finished && (
        <Button variant="quiet" className="self-start" onClick={onDone}>
          {copy.toolkit.imDone}
        </Button>
      )}
    </section>
  );
}
