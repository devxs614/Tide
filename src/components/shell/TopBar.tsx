'use client';

// The bar at the top of each tab: the screen title on the left and a menu on
// the right with the places that aren't tabs (Proof log, Settings, Talk to a
// person, About). In demo mode a quiet "Demo data" badge sits next to the
// title so judges are never misled about whose data they are looking at.
// With a companion, its head sits by the menu (v2 spec 4.4), except on
// Today, where the companion is already in the header, and on the support
// pages, where the crisis screen lives. v2.3 Item 3: tapping the head brings
// back the last thing it said (a bubble that faded is never lost); the
// menu's "My companion" still opens the Companion Studio.
// "How this screen works" opens a short explanation of the current screen.
import { useState } from 'react';
import { CompanionSay } from '@/components/companion/CompanionSay';
import { COMPANION_COPY } from '@/copy/companionCopy';
import { recentLine, showCaption } from '@/lib/companion/speech';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleHelp, HeartHandshake, Info, Menu, Moon, PawPrint, PlayCircle, Settings as SettingsIcon, Sparkles, Trophy } from 'lucide-react';
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
import { WhenOpened } from './WhenOpened';

const ScreenHelpSheet = dynamic(() => import('./ScreenHelpSheet').then((m) => m.ScreenHelpSheet), { ssr: false });

const HEAD_SIZE = 40;

export function TopBar({ title }: { title: string }) {
  const { settings } = useSettings();
  const companion = useCompanion();
  const pathname = usePathname();
  const inDemo = currentWorkspace() === 'demo';
  const [helpOpen, setHelpOpen] = useState(false);
  const [headLine, setHeadLine] = useState<{ text: string; key: number } | null>(null);
  const [headEl, setHeadEl] = useState<HTMLButtonElement | null>(null);
  const showLastLine = () => {
    const text = recentLine()?.text ?? fill(COMPANION_COPY.lastLineNone, { name: companion.name });
    if (settings['companion.speechStyle'] === 'captions') showCaption(text);
    else setHeadLine((prev) => ({ text, key: (prev?.key ?? 0) + 1 }));
  };
  const showHead = !!companion.species && pathname !== '/' && !pathname.startsWith('/support');
  return (
    <header data-overlay="chrome" className="@container/bar sticky top-0 z-(--z-sticky) flex min-h-16 items-center gap-3 border-b-2 border-line bg-bg/95 px-5 backdrop-blur">
      {/* At 130% and 150% text there isn't room for all three in one row; the
          badge drops under the title so the menu never gets pushed off screen. */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="min-w-0 text-h2 font-extrabold text-ink">{title}</h1>
        {(settings.demoMode || inDemo) && (
          <span
            className="max-w-full rounded-full border border-line bg-surface-2 px-3 py-0.5 text-caption text-ink-soft"
            aria-label={copy.global.demoBadgeLabel}
          >
            {copy.global.demoBadge}
          </span>
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {showHead && (
          <button
            ref={setHeadEl}
            type="button"
            onClick={showLastLine}
            aria-label={fill(COMPANION_COPY.lastLine, { name: companion.name })}
            // At big text on a phone the title needs the room more than the
            // head does (the head is a shortcut; the menu has the same link).
            // v2.2 B-03: this asked the window's width, so on a laptop the
            // head stayed in the 430px frame and squeezed "Toolkit" into
            // "Toolki t". It asks the bar's own width now, and also steps
            // aside below 17.5em (a 320px phone at 115% text); at 100% that
            // phone's bar is 18.8em, so nothing changes there.
            className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-surface-2 big-text:@max-[480px]/bar:hidden @max-[17.5em]/bar:hidden"
          >
            <Companion size={HEAD_SIZE} decorative />
          </button>
        )}
        {headLine && <CompanionSay text={headLine.text} lineKey={headLine.key} anchor={headEl} tapped onDone={() => setHeadLine(null)} />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="default" className="px-3">
              <Menu aria-hidden />
              {/* At big text the word yields its room to the title; it stays
                  the button's name for screen readers (v2.2 B-03). */}
              <span className="big-text:sr-only">{copy.shell.profileMenu}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuItem onSelect={() => setHelpOpen(true)}>
              <CircleHelp aria-hidden />
              {copy.shell.helpScreen}
            </DropdownMenuItem>
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
              <Link href="/settings/about">
                <Info aria-hidden />
                {copy.shell.aboutTide}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <WhenOpened open={helpOpen}>
        <ScreenHelpSheet pathname={pathname} open={helpOpen} onOpenChange={setHelpOpen} />
      </WhenOpened>
    </header>
  );
}
