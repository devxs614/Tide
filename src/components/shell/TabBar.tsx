'use client';

// The five tabs at the bottom (v2 spec 4.4): Today, Tasks, Toolkit, Patterns
// and Shore. Each tab is a link with an icon above a visible word; the
// current one is marked for screen readers with aria-current, and on screen
// by color, a filled icon and a pill that slides under it. The pill slides
// with a CSS spring rather than an animation library (D62).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartLine, ListTodo, Shell, Sparkles, Sun } from 'lucide-react';
import { copy } from '@/copy/en';
import { cn } from '@/lib/utils';

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

export function TabBar() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((tab) => isActive(pathname, tab.href));
  return (
    <nav
      aria-label={copy.shell.tabNavLabel}
      className="border-t-2 border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {/* min-height, not height: at big text the labels need more room. */}
      <ul className="@container relative grid min-h-[72px] grid-cols-5">
        {activeIndex >= 0 && (
          <li
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 left-0 flex w-1/5 justify-center transition-transform duration-(--dur-spring-snappy) ease-(--spring-snappy)"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="h-1 w-8 rounded-full bg-primary" />
          </li>
        )}
        {TABS.map(({ href, label, icon: Icon }, i) => {
          const active = i === activeIndex;
          return (
            <li key={href} className="flex min-w-0">
              <Link
                data-demo-id={`tab-${href === "/" ? "today" : href.slice(1)}`}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  // v2.2 B-03: labels used `overflow-wrap: anywhere`, so at
                  // big text "Patterns" split into "Patter ns". Now a label
                  // never breaks: it grows with text size only up to 1.2×,
                  // like native tab bars, and never past 4% of the bar's
                  // width, so "Patterns" always fits in its fifth (D205).
                  // At 100% nothing changes.
                  'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 pt-1.5 pb-2 text-center font-display text-[length:min(calc(0.8235rem/var(--text-scale)*min(var(--text-scale),1.2)),4cqi)] leading-tight font-bold break-normal max-[359px]:text-[length:min(calc(0.7059rem/var(--text-scale)*min(var(--text-scale),1.2)),4cqi)]',
                  active ? 'text-primary' : 'text-ink-soft hover:text-ink',
                )}
              >
                {/* The key restarts the little bounce each time a tab becomes active. */}
                <Icon
                  key={active ? 'on' : 'off'}
                  className={cn('size-6 shrink-0 stroke-[2.5] big-text:size-5', active && 'tab-bounce fill-primary/20')}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
