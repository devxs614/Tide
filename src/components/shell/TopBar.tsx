'use client';

// The bar at the top of each tab: the screen title on the left and a menu on
// the right with the places that aren't tabs (Proof log, Settings, Talk to a
// person, About). In demo mode a quiet "Demo data" badge sits next to the
// title so judges are never misled about whose data they are looking at.
// With a companion, its head sits by the menu and opens the Companion Studio
// (v2 spec 4.4), except on Today, where the companion is already in the
// header, and on the support pages, where the crisis screen lives.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, Info, Menu, Moon, PawPrint, PlayCircle, Settings as SettingsIcon, Sparkles, Trophy } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useCompanion } from '@/lib/companion/useCompanion';
import { currentWorkspace } from '@/lib/workspace';
import { LazyCompanion as Companion } from '@/components/companion/LazyCompanion';

const HEAD_SIZE = 40;

export function TopBar({ title }: { title: string }) {
  const { settings } = useSettings();
  const companion = useCompanion();
  const pathname = usePathname();
  const inDemo = currentWorkspace() === 'demo';
  const showHead = !!companion.species && pathname !== '/' && !pathname.startsWith('/support');
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b-2 border-line bg-bg/95 px-5 backdrop-blur">
      {/* At 130% and 150% text there isn't room for all three in one row; the
          badge drops under the title so the menu never gets pushed off screen. */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-h2 font-extrabold text-ink">{title}</h1>
        {(settings.demoMode || inDemo) && (
          <span
            className="rounded-full border border-line bg-surface-2 px-3 py-0.5 text-caption whitespace-nowrap text-ink-soft"
            aria-label={copy.global.demoBadgeLabel}
          >
            {copy.global.demoBadge}
          </span>
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {showHead && (
          <Link
            href="/companion"
            aria-label={fill(copy.shell.companion, { name: companion.name })}
            className="flex size-12 items-center justify-center rounded-full hover:bg-surface-2"
          >
            <Companion size={HEAD_SIZE} decorative />
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="default" className="px-3">
              <Menu aria-hidden />
              {copy.shell.profileMenu}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuItem asChild>
              <Link href="/proof">
                <Trophy aria-hidden />
                {copy.shell.proofLog}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/demo">
                <PlayCircle aria-hidden />
                {copy.demo.launcherTitle}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/wrap">
                <Moon aria-hidden />
                {copy.wrap.closeDay}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/companion">
                <PawPrint aria-hidden />
                {copy.shell.myCompanion}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/whats-new">
                <Sparkles aria-hidden />
                {copy.shell.whatsNew}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon aria-hidden />
                {copy.shell.settings}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">
                <HeartHandshake aria-hidden />
                {copy.global.talkToPerson}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings#about">
                <Info aria-hidden />
                {copy.shell.aboutTide}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
