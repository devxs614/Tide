'use client';

// "Try a look" (v2.1 F-11, spec 15.3): the eight looks as cards, each a
// small live preview in that look's own colors (sky and sea, a raised
// button, lines of text), with its name, a one-liner and "Try it". Cards
// scroll sideways and snap; at large text they stack. Arrow keys move
// between cards; Enter tries. "Surprise me" picks one for you.
import { useRef } from 'react';
import { Shuffle } from 'lucide-react';
import { looksCopy as t } from '@/copy/looksCopy';
import { LOOKS, type Look } from '@/data/looks';
import { useSettings } from '@/lib/settings';
import { THEMES, type ThemeId } from '@/lib/theme/themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LookTryingBar } from './LookTryingBar';
import { useLooks } from './useLooks';

function Preview({ look }: { look: Look }) {
  const c = THEMES[look.values['appearance.theme'] as ThemeId].tokens;
  const round = look.values['appearance.roundness'] === 'round' ? 'rounded-full' : 'rounded-md';
  return (
    <span aria-hidden className="flex flex-col gap-1.5 p-2.5" style={{ background: c.bg }}>
      <span className="h-6 rounded-md" style={{ background: `linear-gradient(${c.skyTop}, ${c.sea})` }} />
      <span className="h-1.5 w-4/5 rounded-full" style={{ background: c.ink }} />
      <span className="h-1.5 w-3/5 rounded-full" style={{ background: c.inkSoft }} />
      <span className={cn('h-5 w-16 self-start', round)} style={{ background: c.primary, boxShadow: `0 3px 0 ${c.primaryShadow}` }} />
    </span>
  );
}

export function LookCarousel() {
  const { settings } = useSettings();
  const looks = useLooks();
  const list = useRef<HTMLUListElement>(null);
  const stacked = settings.textScale >= 1.3;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>('[data-look-try]') ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    buttons[(at + keys[e.key] + buttons.length) % buttons.length]?.focus();
  };

  return (
    <section aria-labelledby="looks-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="looks-title" className="font-display font-extrabold">
          {t.title}
        </h3>
        <Button variant="secondary" size="sm" onClick={looks.surprise} data-demo-id="look-surprise">
          <Shuffle aria-hidden />
          {t.surprise}
        </Button>
      </div>
      <p className="text-small text-ink-soft">{t.intro}</p>
      <LookTryingBar />
      <ul
        ref={list}
        onKeyDown={onKeyDown}
        className={cn('flex gap-3', stacked ? 'flex-col' : 'snap-x snap-mandatory overflow-x-auto pb-2')}
      >
        {LOOKS.map((look) => {
          const words = t.looks[look.id];
          const on = looks.trying === look.id;
          return (
            <li key={look.id} className={cn('flex shrink-0 snap-start flex-col overflow-hidden rounded-card border-2', stacked ? 'w-full' : 'w-44', on ? 'border-primary' : 'border-line')}>
              <Preview look={look} />
              <span className="flex flex-1 flex-col gap-1 p-2.5">
                <span className="font-bold">{words.name}</span>
                <span className="text-caption text-ink-soft">{words.line}</span>
                <Button
                  size="sm"
                  variant={on ? 'default' : 'secondary'}
                  className="mt-auto self-start"
                  aria-pressed={on}
                  onClick={() => looks.tryLook(look.id)}
                  data-look-try
                  data-demo-id={`look-${look.id}`}
                >
                  {t.tryIt}
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
