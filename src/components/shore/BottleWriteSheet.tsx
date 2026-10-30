'use client';

// "Write a note to future you" (v2 spec 13.7): up to 280 characters, with
// dictation, for a hard day later. The safety check runs before saving,
// exactly like a check-in: if the words sound like a crisis, nothing is
// saved and the support screen opens.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { writeBottle } from '@/lib/repo/bottles';
import { detectCrisis } from '@/lib/safety/detect';
import { useCelebrate } from '@/lib/celebrate/useCelebrate';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { DictateButton } from '@/components/ui/DictateButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function BottleWriteSheet({ open, onClose, fromWrapDate }: { open: boolean; onClose: () => void; fromWrapDate?: string }) {
  const router = useRouter();
  const celebrate = useCelebrate();
  const [text, setText] = useState('');
  const [example] = useState(() => copy.bottle.examples[Math.floor(Math.random() * copy.bottle.examples.length)]);

  const save = async () => {
    if (detectCrisis(text)) {
      onClose();
      router.push('/support?crisis=1');
      return;
    }
    await writeBottle(text, fromWrapDate);
    setText('');
    onClose();
    toast(copy.bottle.saved);
    if ((await db.bottles.count()) === 1) void celebrate('firstTime', { feature: 'bottle' });
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{copy.bottle.writeTitle}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col gap-3 overflow-y-auto px-5 pt-2 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <p className="text-ink-soft">{copy.bottle.writePrompt}</p>
          <label htmlFor="bottle-text" className="font-bold">
            {copy.bottle.label}
          </label>
          <textarea
            id="bottle-text"
            rows={4}
            maxLength={280}
            value={text}
            placeholder={example}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-y rounded-input border-2 border-line bg-surface p-3 text-body placeholder:text-ink-soft"
          />
          <p className="text-caption text-ink-soft" aria-live="polite">
            {fill(copy.bottle.count, { n: text.length })}
          </p>
          <DictateButton value={text} onChange={setText} />
          <Button type="submit" size="block" disabled={text.trim().length < 2}>
            {copy.bottle.save}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
