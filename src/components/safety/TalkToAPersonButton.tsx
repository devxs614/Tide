// "Talk to a person": always reachable from the check-in, every strategy,
// the bridge, the patterns screen and the menu. It only opens the Support
// screen; Tide never contacts anyone on Maya's behalf.
import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TalkToAPersonButton({ className }: { className?: string }) {
  return (
    <Button asChild variant="secondary" className={cn('self-start', className)}>
      <Link href="/support">
        <HeartHandshake aria-hidden />
        {copy.global.talkToPerson}
      </Link>
    </Button>
  );
}
