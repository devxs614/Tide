'use client';

// What an item means, when Maya taps it (v2 spec 13.8): the item drawn
// large, its name and meaning, the win it came from, when, and a way to
// hear it or see it in the list.
import Link from 'next/link';
import { copy } from '@/copy/en';
import { SHORE_ITEMS } from '@/data/shoreItems';
import type { ShoreItem } from '@/lib/shore/items';
import { formatLongDate, formatTime } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ItemArt } from './ItemArt';

export function ItemDetailsSheet({ item, onClose }: { item: ShoreItem | null; onClose: () => void }) {
  const info = item ? SHORE_ITEMS[item.type] : null;
  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent aria-describedby={undefined}>
        {item && info && (
          <>
            <SheetHeader>
              <SheetTitle>{info.name}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-center gap-3 overflow-y-auto px-5 pt-2 pb-6 text-center">
              <svg aria-hidden viewBox="-24 -24 48 48" className="size-28">
                <ItemArt type={item.type} variant={item.variant} />
              </svg>
              <p className="text-lead font-bold">{item.description}</p>
              {item.winText && <p className="text-ink-soft">{item.winText}</p>}
              <p className="text-small text-ink-soft">
                {formatLongDate(item.ts)} · {formatTime(item.ts)}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <ReadAloudButton text={[item.description, item.winText].filter(Boolean).join(' ')} />
                <Button variant="secondary" asChild>
                  <Link href="/proof">{copy.shore.seeInList}</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
