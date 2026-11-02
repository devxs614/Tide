'use client';

// The Focus screen's "⋯" menu (v2.1 F-07): a quick way to turn refocus
// nudges off, visual, or visual with sound, without leaving the block. The
// same setting as Settings → Focus. The first time a block of 15 minutes
// or more starts, a one-time hint (FocusCoach) points here.
import { Ellipsis } from 'lucide-react';
import { fill } from '@/copy/en';
import { nudgeCopy as t } from '@/copy/nudgeCopy';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CoachMark } from '@/components/ui/coach-mark';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Level = Settings['focus.refocusNudge'];
const LEVELS: Level[] = ['off', 'visual', 'visual_sound'];

export function FocusMenu({ onOpen }: { onOpen: () => void }) {
  const { settings, update } = useSettings();
  return (
    <DropdownMenu onOpenChange={(open) => open && onOpen()}>
      <DropdownMenuTrigger asChild>
        <Button variant="quiet" data-demo-id="focus-menu">
          <Ellipsis aria-hidden />
          {t.menuLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>{t.nudgesLabel}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={settings['focus.refocusNudge']} onValueChange={(v) => void update('focus.refocusNudge', v as Level)}>
          {LEVELS.map((level) => (
            <DropdownMenuRadioItem key={level} value={level} className="min-h-12 text-body">
              {t.levels[level]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// In the page's flow under the header, never floating over the timer.
export function FocusCoach({ onDone }: { onDone: () => void }) {
  const name = useSettings().settings.name.trim();
  return (
    <div className="flex flex-col items-end gap-2 self-end">
      <CoachMark side="bottom">{name ? fill(t.coach, { name }) : t.coachNoName}</CoachMark>
      <Button variant="secondary" size="sm" onClick={onDone}>
        {t.gotIt}
      </Button>
    </div>
  );
}
