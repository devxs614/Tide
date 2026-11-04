'use client';

// The five tabs at the bottom (v2 spec 4.4): Today, Tasks, Toolkit, Patterns
// and Shore. Each tab is a link with an icon above a visible word; the
// current one is marked for screen readers with aria-current, and on screen
// by color, a filled icon and a pill that slides under it. The pill slides
// with a CSS spring rather than an animation library (D62).
// v2.3 Item 1: with "Check-in button: In the tab bar", a sixth item in the
// middle opens the check-in instead of the floating button; with six items,
// a narrow frame or big text shows icons only (each keeps its name, and a
// tooltip says it).
import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartLine, ListTodo, Shell, Sparkles, Sun, WavesHorizontal } from 'lucide-react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { useCheckInSheet } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { HintLabel } from '@/components/ui/hint-label';

const TABS = [
  { href: '/', label: copy.shell.tabs.today, icon: Sun },
  { href: '/tasks', label: copy.shell.tabs.tasks, icon: ListTodo },
  { href: '/toolkit', label: copy.shell.tabs.toolkit, icon: Sparkles },
  { href: '/patterns', label: copy.shell.tabs.patterns, icon: ChartLine },
  { href: '/shore', label: copy.shell.tabs.shore, icon: Shell },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// v2.2 B-03: labels used `overflow-wrap: anywhere`, so at big text
// "Patterns" split into "Patter ns". Now a label never breaks: it grows with
// text size only up to 1.2×, like native tab bars, and never past a share of
// the bar's width that "Patterns" always fits in (D205). At 100% nothing
// changes. Six items (v2.3) get a smaller share.
const LINK =
  'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 pt-1.5 pb-2 text-center font-display leading-tight font-bold break-normal';
const FIVE =
  'text-[length:min(calc(0.8235rem/var(--text-scale)*min(var(--text-scale),1.2)),4cqi)] max-[359px]:text-[length:min(calc(0.7059rem/var(--text-scale)*min(var(--text-scale),1.2)),4cqi)]';
const SIX = 'text-[length:min(calc(0.7059rem/var(--text-scale)*min(var(--text-scale),1.2)),3.4cqi)]';

export function TabBar() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { openCheckIn } = useCheckInSheet();
  const withCheckIn = settings['checkin.buttonMode'] === 'tabbar';
  const tabIndex = TABS.findIndex((tab) => isActive(pathname, tab.href));
  // With the check-in item in the middle, tabs after Tasks move one over.
  const activeIndex = withCheckIn && tabIndex >= 2 ? tabIndex + 1 : tabIndex;
  const n = withCheckIn ? 6 : 5;
  const iconsOnly = withCheckIn && settings.textScale >= 1.3;
  return (
    <nav
      aria-label={copy.shell.tabNavLabel}
      className="border-t-2 border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {/* min-height, not height: at big text the labels need more room. */}
      <ul className={cn('@container relative grid min-h-[72px]', withCheckIn ? 'grid-cols-6' : 'grid-cols-5')}>
        {activeIndex >= 0 && (
          <li
            aria-hidden
            className={cn('pointer-events-none absolute bottom-1.5 left-0 flex justify-center transition-transform duration-(--dur-spring-snappy) ease-(--spring-snappy)', n === 6 ? 'w-1/6' : 'w-1/5')}
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="h-1 w-8 rounded-full bg-primary" />
          </li>
        )}
        {TABS.map(({ href, label, icon: Icon }, i) => {
          const at = withCheckIn && i >= 2 ? i + 1 : i;
          const active = at === activeIndex;
          return (
            <Fragment key={href}>
              {withCheckIn && i === 2 && (
                <li className="flex min-w-0">
                  <button type="button" data-demo-id="tab-checkin" aria-label={copy.shell.checkIn} onClick={openCheckIn} className={cn(LINK, SIX, 'group text-primary')}>
                    <WavesHorizontal className="size-6 shrink-0 stroke-[2.5] big-text:size-5" aria-hidden />
                    <span aria-hidden className={cn(iconsOnly ? 'sr-only' : '@max-[360px]:sr-only')}>
                      {copy.shell.checkIn}
                    </span>
                    <HintLabel label={copy.shell.checkIn} show={iconsOnly} />
                  </button>
                </li>
              )}
              <li className="flex min-w-0">
                <Link
                    data-demo-id={`tab-${href === "/" ? "today" : href.slice(1)}`}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    aria-label={withCheckIn ? label : undefined}
                    className={cn(LINK, withCheckIn ? SIX : FIVE, withCheckIn && 'group', active ? 'text-primary' : 'text-ink-soft hover:text-ink')}
                  >
                    {/* The key restarts the little bounce each time a tab becomes active. */}
                    <Icon
                      key={active ? 'on' : 'off'}
                      className={cn('size-6 shrink-0 stroke-[2.5] big-text:size-5', active && 'tab-bounce fill-primary/20')}
                      aria-hidden
                    />
                    {withCheckIn ? (
                      <span aria-hidden className={cn(iconsOnly ? 'sr-only' : '@max-[360px]:sr-only')}>
                        {label}
                      </span>
                    ) : (
                      label
                    )}
                    <HintLabel label={label} show={iconsOnly} />
                  </Link>
              </li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
