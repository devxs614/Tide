'use client';

// The Studio's "Where it appears" tab (v2 spec 8.7): one switch per place,
// each with a small icon and its name. Some people like company everywhere;
// others only want it on Today. The crisis screen isn't in the list because
// the companion never appears there, and the page says so.
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRightLeft, ChartColumn, Footprints, HeartHandshake, Inbox, MessageSquare, Moon, PartyPopper, PenLine, Shell, Sun, Timer, Wind,
} from 'lucide-react';
import { COMPANION_COPY } from '@/copy/companionCopy';
import { useSettings } from '@/lib/settings';
import { PLACEMENTS, type Placement } from '@/lib/companion/registry';
import { Switch } from '@/components/ui/switch';

const ICONS: Record<Placement, LucideIcon> = {
  today: Sun,
  checkin: PenLine,
  unstick: Footprints,
  focus: Timer,
  bridge: ArrowRightLeft,
  toolkit: Wind,
  patterns: ChartColumn,
  shore: Shell,
  wrap: Moon,
  celebrations: PartyPopper,
  toasts: MessageSquare,
  empty: Inbox,
  support: HeartHandshake,
};

export function WhereTab() {
  const { settings, update } = useSettings();
  const placements = settings['companion.placements'];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-small text-ink-soft">{COMPANION_COPY.studio.whereHelp}</p>
      <ul className="flex flex-col">
        {PLACEMENTS.map((p) => {
          const Icon = ICONS[p];
          return (
            <li key={p} className="flex min-h-12 items-center gap-3 border-b border-line/60 last:border-b-0">
              <Icon aria-hidden className="size-5 shrink-0 text-ink-soft" />
              <label htmlFor={`place-${p}`} className="flex-1">
                {COMPANION_COPY.placements[p]}
              </label>
              <Switch
                id={`place-${p}`}
                checked={placements[p]}
                onCheckedChange={(on) => void update('companion.placements', { ...placements, [p]: on })}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
