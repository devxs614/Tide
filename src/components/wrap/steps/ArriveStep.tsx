'use client';

// Step 1, Arrive: what this is and how long it takes, a start, and a way out
// with no consequences.
import { useRouter } from 'next/navigation';
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import type { WrapStepProps } from '../WrapStep';

export function ArriveStep({ next }: WrapStepProps) {
  const router = useRouter();
  return (
    <>
      <h1 className="text-h1 font-extrabold">{copy.wrap.arriveTitle}</h1>
      <p className="text-ink-soft">{copy.wrap.arriveSub}</p>
      <div className="mt-auto flex flex-col gap-2">
        <Button size="block" onClick={next}>
          {copy.wrap.start}
        </Button>
        <Button variant="secondary" onClick={() => router.push('/')}>
          {copy.wrap.notTonight}
        </Button>
      </div>
    </>
  );
}
