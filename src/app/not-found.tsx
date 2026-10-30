// Tide's 404 (v2 spec 17.5): the page drifted away, and Today is one tap
// back. The companion looks soft, not lost.
import Link from 'next/link';
import { copy } from '@/copy/en';
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { EmptyStateArt } from '@/components/companion/EmptyStateArt';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PhoneFrame>
      <main className="flex flex-1 items-center justify-center">
        <EmptyState
          title={copy.errors.notFound}
          art={<EmptyStateArt expression="soft" />}
          action={
            <Button asChild>
              <Link href="/">{copy.errors.goToday}</Link>
            </Button>
          }
        />
      </main>
    </PhoneFrame>
  );
}
