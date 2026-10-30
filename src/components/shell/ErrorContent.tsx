'use client';

// What the error page shows (v2 spec 17.5): calm, kind, and clear that
// nothing was lost, because everything lives on this device. "Try again"
// re-renders the page; "Go to Today" is the way out. No stack trace, no blame.
import Link from 'next/link';
import { copy } from '@/copy/en';
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { EmptyStateArt } from '@/components/companion/EmptyStateArt';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export function ErrorContent({ reset }: { reset: () => void }) {
  return (
    <PhoneFrame>
      <main className="flex flex-1 items-center justify-center">
        <EmptyState
          title={copy.errors.errorTitle}
          body={copy.errors.errorSub}
          art={<EmptyStateArt expression="soft" />}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={reset}>{copy.errors.tryAgain}</Button>
              <Button variant="secondary" asChild>
                <Link href="/">{copy.errors.goToday}</Link>
              </Button>
            </div>
          }
        />
      </main>
    </PhoneFrame>
  );
}
