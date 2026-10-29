'use client';

// The four tabs at the bottom: Today, Tasks, Toolkit, Patterns. Each tab is a
// link with an icon and a visible word, and the current one is marked for
// screen readers with aria-current as well as by color and the top line.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartLine, ListTodo, Sparkles, Sun } from 'lucide-react';
import { copy } from '@/copy/en';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', label: copy.shell.tabs.today, icon: Sun },
  { href: '/tasks', label: copy.shell.tabs.tasks, icon: ListTodo },
  { href: '/toolkit', label: copy.shell.tabs.toolkit, icon: Sparkles },
  { href: '/patterns', label: copy.shell.tabs.patterns, icon: ChartLine },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label={copy.shell.tabNavLabel}
      className="border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid h-16 grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-caption',
                  active ? 'font-bold text-primary' : 'text-ink-soft hover:text-ink',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-4 top-0 h-[3px] rounded-b-full',
                    active ? 'bg-primary' : 'bg-transparent',
                  )}
                />
                <Icon className="size-6" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
