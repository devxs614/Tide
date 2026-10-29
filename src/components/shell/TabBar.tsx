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
      <ul className="relative grid h-[72px] grid-cols-5">
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
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 pb-2 font-display text-[0.8235rem] font-bold max-[359px]:text-[0.7059rem]',
                  active ? 'text-primary' : 'text-ink-soft hover:text-ink',
                )}
              >
                {/* The key restarts the little bounce each time a tab becomes active. */}
                <Icon
                  key={active ? 'on' : 'off'}
                  className={cn('size-6 stroke-[2.5]', active && 'tab-bounce fill-primary/20')}
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
