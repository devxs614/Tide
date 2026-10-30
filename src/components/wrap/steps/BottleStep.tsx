'use client';

// Step 10, a note for later (optional): the bottle sheet, right here. The
// note remembers which evening it was written on.
import { useState } from 'react';
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { BottleWriteSheet } from '@/components/shore/BottleWriteSheet';
import type { WrapStepProps } from '../WrapStep';

export function BottleStep({ facts }: WrapStepProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.bottleTitle}</h1>
      <p>{copy.wrap.bottleSub}</p>
      <Button variant="secondary" className="self-start" onClick={() => setOpen(true)}>
        {copy.wrap.writeBottle}
      </Button>
      <BottleWriteSheet open={open} onClose={() => setOpen(false)} fromWrapDate={facts.date} />
    </>
  );
}
