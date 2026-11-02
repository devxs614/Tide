'use client';

// "Time of day" on the Shore (v2.1 F-12): Auto follows the clock; Dawn,
// Day, Sunset, Dusk or Night stay put, for a calming night shore at noon or
// a bright day on a heavy evening. Each choice shows a little swatch of its
// sky. The same setting is in Settings → Shore.
import { Moon, Sun } from 'lucide-react';
import { settingsCopy } from '@/copy/settingsCopy';
import { useSettings } from '@/lib/settings';
import { mixSky, TONES, type TimeOfDay } from '@/lib/shore/skyTone';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CHOICES: TimeOfDay[] = ['auto', 'dawn', 'day', 'sunset', 'dusk', 'night'];

function swatch(choice: TimeOfDay): string {
  const base = 'var(--sky-top)';
  if (choice === 'auto' || choice === 'day') return `linear-gradient(${base}, var(--sky-bottom))`;
  const tone = choice === 'night' ? TONES.night : TONES[choice];
  return `linear-gradient(${mixSky(base, tone, choice === 'night' ? 70 : 35)}, ${mixSky('var(--sky-bottom)', tone, choice === 'night' ? 70 : 55)})`;
}

export function TimeOfDayMenu() {
  const { settings, update } = useSettings();
  const choice = settings['shore.timeOfDay'];
  const names = settingsCopy.timesOfDay;
  const Icon = choice === 'night' || choice === 'dusk' ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="quiet" size="sm" data-demo-id="shore-time">
          <Icon aria-hidden />
          {choice === 'auto' ? settingsCopy.labels.timeOfDayShort : names[choice]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{settingsCopy.labels.timeOfDayShort}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={choice} onValueChange={(v) => void update('shore.timeOfDay', v as TimeOfDay)}>
          {CHOICES.map((c) => (
            <DropdownMenuRadioItem key={c} value={c} className="min-h-12 gap-2 text-body">
              <span aria-hidden className="size-5 shrink-0 rounded-full border border-line" style={{ background: swatch(c) }} />
              {names[c]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
