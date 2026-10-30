'use client';

// "How this screen works" (v2 spec 17.8): a few plain sentences about the
// screen Maya is on, opened from the top bar menu, with Read aloud. Loaded
// the first time someone asks.
import { copy } from '@/copy/en';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type ScreenId = keyof typeof copy.screenHelp.screens;

export function screenFor(pathname: string): ScreenId {
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/toolkit')) return 'toolkit';
  if (pathname.startsWith('/patterns')) return 'patterns';
  if (pathname.startsWith('/shore')) return 'shore';
  if (pathname.startsWith('/proof')) return 'proof';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/support')) return 'support';
  return 'today';
}

export function ScreenHelpSheet({ pathname, open, onOpenChange }: { pathname: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const screen = copy.screenHelp.screens[screenFor(pathname)];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{copy.screenHelp.title}</SheetTitle>
          <SheetDescription>{screen.name}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 overflow-y-auto px-5 pt-3 pb-6">
          {screen.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <ReadAloudButton text={screen.body.join(' ')} />
          {/* Only useful with a keyboard; coarse pointers (phones) skip it. */}
          <p className="text-caption text-ink-soft [@media(pointer:coarse)]:hidden">{copy.screenHelp.shortcutsHint}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
