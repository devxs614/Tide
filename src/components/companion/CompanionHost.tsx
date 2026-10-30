'use client';

// One companion in one place (v2 spec 8.9 and 9). It listens to the event
// bus and turns what happened into a reaction: soft and close after an Ebb
// check-in, a happy hop after a Swell one, thinking while the AI works, a
// focused little activity during a focus block. Its face drifts back to the
// place's resting expression after 4 seconds. It speaks only as much as Maya
// chose (quiet, some, chatty), and never on the crisis screen. If she chose
// no companion, the place shows calm waves or nothing; if she hasn't chosen
// yet (everyone coming from v1), the place looks exactly as it did in v1.
import { useCallback, useEffect, useRef, useState } from 'react';
import { companionLine, type LineContext } from '@/copy/companions';
import { COMPANION_COPY } from '@/copy/companionCopy';
import { fill, quadrantName } from '@/copy/en';
import { emitCompanion, onCompanionEvent, type CompanionEvent } from '@/lib/companion/bus';
import { type Expression, type Placement, type Reaction } from '@/lib/companion/registry';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useCompanionVoice } from '@/lib/companion/useCompanionVoice';
import { useSettings } from '@/lib/settings';
import { useSound } from '@/lib/sound/useSound';
import { useVoice } from '@/lib/voice/useVoice';
import { toISODate } from '@/lib/time';
import { now } from '@/lib/clock';
import { Companion } from './Companion';
import { CompanionSay } from './CompanionSay';
import { NoneCompanion } from './NoneCompanion';
import type { BreathPhase } from './CompanionFigure';
import type { Quadrant } from '@/lib/types';
import { cn } from '@/lib/utils';

const DECAY_MS = 4000;

interface Response {
  expression?: Expression;
  reaction?: Reaction;
  line?: LineContext;
  vars?: Record<string, string | number>;
  // Stay in this expression instead of drifting back.
  hold?: boolean;
}

// After a check-in: close and gentle for the hard quadrants, a hop for Swell,
// calm for Still (v2 spec 9).
export const afterCheckIn: Record<Quadrant, Response> = {
  surge: { expression: 'soft', reaction: 'lean' },
  swell: { expression: 'happy', reaction: 'hop' },
  ebb: { expression: 'soft', reaction: 'lean' },
  still: { expression: 'calm' },
};

// What a companion does for each event (v2 spec 9). Hosts only hear the
// events their placement lists.
export function responseTo(event: CompanionEvent): Response | null {
  switch (event.type) {
    case 'checkinSaved':
      return {
        ...afterCheckIn[event.quadrant],
        line: `after_checkin_${event.quadrant}` as LineContext,
        vars: { quadrant: quadrantName(event.quadrant) },
      };
    case 'typing':
      return event.active ? { expression: 'listening', hold: true } : { expression: 'idle' };
    case 'aiLoading':
      return { expression: 'thinking', hold: true };
    case 'aiDone':
      return { expression: 'curious' };
    case 'taskDone':
      return { expression: 'happy', reaction: 'hop' };
    case 'focusStarted':
      return { expression: 'focused', line: 'focus_start', hold: true };
    case 'focusEnded':
      if (event.outcome === 'got_going') return { expression: 'proud', reaction: 'wiggle', line: 'focus_end_got_going' };
      if (event.outcome === 'didnt_start') return { expression: 'soft', line: 'focus_end_didnt_start' };
      return { expression: 'happy', line: 'focus_end_got_going' };
    case 'bridgeOpened':
      return { expression: 'packing', reaction: 'special', line: 'bridge_start', hold: true };
    case 'breathPhase':
      return event.phase ? { expression: 'breathing', hold: true } : { expression: 'calm' };
    case 'celebrate':
      if (event.quadrant === 'ebb') return { expression: 'soft' };
      if (event.quadrant === 'surge') return { expression: 'calm', reaction: 'lean' };
      if (event.quadrant === 'still') return { expression: 'calm' };
      return event.tier === 'big' ? { expression: 'proud', reaction: 'wiggle', line: 'celebration' } : { expression: 'happy', reaction: 'hop' };
    case 'shoreItem':
      return { expression: 'curious', line: 'shore_new_item' };
    case 'wrapStarted':
      return { expression: 'calm', line: 'wrap_start', hold: true };
    case 'wrapEnded':
      return { expression: 'sleeping', line: 'wrap_end', hold: true };
    case 'say':
      return { line: event.context, vars: event.vars };
    case 'nudge':
      return { expression: event.expression, reaction: event.reaction };
    default:
      return null;
  }
}

// Key moments are spoken at "some"; "quiet" keeps only breathing guidance.
const QUIET_LINES: LineContext[] = ['breathing_invite'];

function dayPart(hour: number): LineContext {
  if (hour < 12) return 'greeting_morning';
  if (hour < 18) return 'greeting_afternoon';
  return 'greeting_evening';
}

export interface CompanionHostProps {
  placement: Placement;
  size?: number;
  base?: Expression;
  listens?: CompanionEvent['type'][];
  // Say hello once per part of the day (Today header).
  greet?: boolean;
  // A line to say when this host first appears (e.g. checkin_listening).
  openingLine?: LineContext;
  breathPhase?: BreathPhase | null;
  breathPhaseMs?: number;
  walking?: boolean;
  // Above the companion, reaching to its left or right; inline, in a row to
  // its right (the top of a sheet, or a centered companion, where a bubble
  // above would leave the screen or hide the title); or no bubble at all.
  bubble?: 'left' | 'right' | 'inline' | 'none';
  // What "no companion" shows here.
  noneAlt?: 'waves' | 'nothing';
  onTap?: () => void;
  className?: string;
  decorative?: boolean;
}

export function CompanionHost({
  placement,
  size,
  base = 'idle',
  listens = [],
  greet = false,
  openingLine,
  breathPhase,
  breathPhaseMs,
  walking,
  bubble = 'left',
  noneAlt = 'waves',
  onTap,
  className,
  decorative,
}: CompanionHostProps) {
  const profile = useCompanion();
  const { settings } = useSettings();
  const play = useSound();
  const voice = useVoice();
  const naturalVoice = useCompanionVoice();
  const decay = useRef(0);
  const tapIndex = useRef(0);
  const placed = profile.placements[placement];
  const shown = placed && !!profile.species;
  const px = size ?? profile.size;
  const lineText = useCallback(
    (context: LineContext, vars: Record<string, string | number> = {}) =>
      profile.species ? companionLine(profile.species, context, settings.communicationMode, { name: settings.name, ...vars }, toISODate(now())) : '',
    [profile.species, settings.communicationMode, settings.name],
  );

  // What this place says as it appears, decided once: hello once per part of
  // the day (Today), or a fixed opening line (Check-in, Unstick…).
  const [opening] = useState<{ context: LineContext; greeting: boolean } | null>(() => {
    if (!shown) return null;
    if (greet) {
      const context = dayPart(new Date(now()).getHours());
      const key = `tide-greeted-${toISODate(now())}-${context}`;
      let seen = false;
      try {
        seen = localStorage.getItem(key) === '1';
        localStorage.setItem(key, '1');
      } catch {
        // Storage blocked: greeting every time is harmless.
      }
      return seen ? null : { context, greeting: true };
    }
    return openingLine && (profile.talkativeness !== 'quiet' || QUIET_LINES.includes(openingLine)) ? { context: openingLine, greeting: false } : null;
  });
  const [expression, setExpression] = useState<Expression>(opening?.greeting ? 'waving' : base);
  const [reaction, setReaction] = useState<{ name: Reaction | null; key: number }>({ name: null, key: 0 });
  const [line, setLine] = useState<{ text: string; key: number } | null>(() =>
    opening && (opening.greeting ? profile.talkativeness !== 'quiet' : true) ? { text: lineText(opening.context), key: 1 } : null,
  );

  // A new resting expression for this place (say, the focus block began).
  const [restingBase, setRestingBase] = useState(base);
  if (restingBase !== base) {
    setRestingBase(base);
    setExpression(base);
  }

  const say = useCallback(
    (context: LineContext, vars: Record<string, string | number> = {}, tapped = false) => {
      if (!profile.species) return;
      const allowed =
        tapped || profile.talkativeness !== 'quiet' || QUIET_LINES.includes(context);
      if (!allowed) return;
      const text = lineText(context, vars);
      setLine((prev) => ({ text, key: (prev?.key ?? 0) + 1 }));
      play(`chirp-${profile.species}`);
      if (settings['voice.readCompanion']) void voice.speak(text, { naturalVoice, quiet: true });
    },
    [profile.species, profile.talkativeness, naturalVoice, settings, play, voice, lineText],
  );

  const respond = useCallback(
    (r: Response) => {
      window.clearTimeout(decay.current);
      if (r.expression) setExpression(r.expression);
      if (r.reaction) setReaction((prev) => ({ name: r.reaction!, key: prev.key + 1 }));
      if (r.line) say(r.line, r.vars);
      if (r.expression && !r.hold) decay.current = window.setTimeout(() => setExpression(base), DECAY_MS);
    },
    [base, say],
  );

  useEffect(() => () => window.clearTimeout(decay.current), []);

  useEffect(() => {
    if (!shown || listens.length === 0) return;
    return onCompanionEvent((event) => {
      if (!listens.includes(event.type)) return;
      const r = responseTo(event);
      if (r) respond(r);
    });
  }, [shown, listens, respond]);

  // The opening line's chirp and voice, and the hello wave settling back.
  useEffect(() => {
    if (!opening || !profile.species) return;
    if (line) {
      play(`chirp-${profile.species}`);
      if (settings['voice.readCompanion']) void voice.speak(line.text, { naturalVoice, quiet: true });
    }
    if (opening.greeting) decay.current = window.setTimeout(() => setExpression(base), DECAY_MS);
    // Only when this place first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!shown) {
    // Only an explicit "none" gets the calm wave; "not chosen yet" and a
    // switched-off place show nothing at all.
    return placed && profile.chosen && profile.isNone && noneAlt === 'waves' ? <NoneCompanion size={px} /> : null;
  }

  const figure = (
    <Companion
      size={px}
      expression={expression}
      reaction={reaction.name}
      reactionKey={reaction.key}
      breathPhase={breathPhase}
      breathPhaseMs={breathPhaseMs}
      walking={walking}
      holdIdle={expression === 'listening' || !!breathPhase}
      decorative={decorative}
    />
  );

  const tap = () => {
    if (onTap) return onTap();
    const cycle: Reaction[] = ['wave', 'hop', 'wiggle', 'special'];
    respond({ reaction: cycle[tapIndex.current++ % cycle.length], expression: 'happy' });
    say(profile.talkativeness === 'chatty' ? 'idle_tip' : dayPart(new Date(now()).getHours()), {}, true);
  };

  // A real button, so the tap works from the keyboard too. Decorative
  // places (the breathing square) just show the figure.
  const body = decorative ? (
    figure
  ) : (
    <button type="button" onClick={tap} aria-label={onTap ? fill(COMPANION_COPY.openStudio, { name: profile.name }) : undefined} className="block shrink-0 rounded-card">
      {figure}
    </button>
  );

  if (bubble === 'inline') {
    return (
      <div className={cn('flex min-h-14 items-center gap-3', className)} data-companion-placement={placement}>
        {body}
        {line && <CompanionSay text={line.text} lineKey={line.key} side="inline" onDone={() => setLine(null)} className="min-w-0" />}
      </div>
    );
  }

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)} data-companion-placement={placement}>
      {bubble !== 'none' && line && (
        <CompanionSay
          text={line.text}
          lineKey={line.key}
          side={bubble}
          onDone={() => setLine(null)}
          className={cn('absolute bottom-full z-10 mb-1 w-max', bubble === 'left' ? 'right-0' : 'left-0')}
        />
      )}
      {body}
    </div>
  );
}

// Lets screens say things without importing the bus (e.g. "say the
// breathing invite now").
export const companionSays = (context: LineContext, vars?: Record<string, string | number>) => emitCompanion({ type: 'say', context, vars });
