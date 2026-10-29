'use client';

// The bar at the top of each tab: the screen title on the left and a menu on
// the right with the places that aren't tabs (Proof log, Settings, Talk to a
// person, About). In demo mode a quiet "Demo data" badge sits next to the
// title so judges are never misled about whose data they are looking at.
import Link from 'next/link';
import { HeartHandshake, Info, Menu, Settings as SettingsIcon, Trophy } from 'lucide-react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function TopBar({ title }: { title: string }) {
  const { settings } = useSettings();
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-line bg-bg/95 px-5 backdrop-blur">
      {/* At 130% and 150% text there isn't room for all three in one row; the
          badge drops under the title so the menu never gets pushed off screen. */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-h2 font-bold text-ink">{title}</h1>
        {settings.demoMode && (
          <span
            className="rounded-full border border-line bg-surface-2 px-3 py-0.5 text-caption whitespace-nowrap text-ink-soft"
            aria-label={copy.global.demoBadgeLabel}
          >
            {copy.global.demoBadge}
          </span>
        )}
      </div>
      <div className="ml-auto shrink-0">
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
