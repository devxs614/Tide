'use client';

// The "?" sheet: every shortcut, and how to turn them off (v2 spec 17.1).
// Loaded the first time someone presses "?".
import Link from 'next/link';
import { copy } from '@/copy/en';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ShortcutsList } from './ShortcutsList';

export function ShortcutsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{copy.shortcuts.title}</SheetTitle>
          <SheetDescription>{copy.shortcuts.intro}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-3 pb-6">
          <ShortcutsList />
          <p className="text-ink-soft">{copy.shortcuts.turnOff}</p>
          <Link
            href="/settings/shortcuts"
            onClick={() => onOpenChange(false)}
            className="self-start font-bold text-primary underline underline-offset-4"
          >
            {copy.shortcuts.openSettings}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
