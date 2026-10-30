'use client';

// "What's new" for people who used Tide v1 (v2 spec 11.3): six short pages
// (companions, the new look, the Shore, Close the day, settings, the demo),
// each with "Set it up" and "Maybe later". Nobody is pushed through
// onboarding again, and nothing changes until they choose: their Classic
// look stays, and they have no companion until they pick one.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { SPECIES } from '@/lib/companion/registry';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { WaveMark } from '@/components/ui/wave-mark';
import { Companion } from '@/components/companion/Companion';
import { cn } from '@/lib/utils';

type PageId = keyof typeof copy.whatsNew.pages;
const PAGES: Array<{ id: PageId; href: string }> = [
  { id: 'companions', href: '/companion' },
  { id: 'look', href: '/settings#appearance' },
  { id: 'shore', href: '/shore' },
  { id: 'wrap', href: '/' },
  { id: 'settings', href: '/settings' },
  { id: 'demo', href: '/settings#demo' },
];

export function WhatsNewSheet({ asPage = false, onClose }: { asPage?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const { update, updateMany } = useSettings();
  const [index, setIndex] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const page = PAGES[index];
  const words = copy.whatsNew.pages[page.id];
  const last = index === PAGES.length - 1;

  useEffect(() => titleRef.current?.focus(), [index]);

  const close = (href?: string) => {
    void update('whatsNew.seen', true);
    onClose?.();
    if (href) router.push(href);
    else if (asPage) router.push('/');
  };

  return (
    <div
      role={asPage ? undefined : 'dialog'}
      aria-modal={asPage ? undefined : true}
      aria-labelledby="whats-new-title"
      className={cn('flex flex-col gap-5 bg-bg p-5', asPage ? 'min-h-dvh' : 'fixed inset-0 z-50 mx-auto max-w-[430px] overflow-y-auto')}
    >
      <div className="flex items-center gap-3">
        <p className="font-display font-extrabold">{copy.whatsNew.title}</p>
        <Button variant="quiet" size="sm" className="ml-auto" onClick={() => close()}>
          <X aria-hidden />
          {copy.global.close}
        </Button>
      </div>
      <ProgressBar value={index + 1} max={PAGES.length} label={fill(copy.whatsNew.pageOf, { n: index + 1, total: PAGES.length })} />
      <section key={page.id} className="flow-enter flex flex-1 flex-col gap-4">
        <div aria-hidden className="flex h-36 items-end justify-center gap-1 rounded-card border-2 border-line bg-linear-to-b from-sky-top to-sand p-3">
          {page.id === 'companions' ? (
            SPECIES.map((s) => <Companion key={s} override={{ species: s }} size={52} expression="waving" decorative />)
          ) : (
            <WaveMark className="h-16 w-28" />
          )}
        </div>
        <h1 id="whats-new-title" ref={titleRef} tabIndex={-1} className="text-h1 font-extrabold outline-none">
          {words.title}
        </h1>
        <p className="text-ink-soft">{words.body}</p>
        {page.id === 'look' && (
          <Button
            variant="secondary"
            className="self-start"
            onClick={() => void updateMany({ 'appearance.theme': 'lagoon', 'appearance.followSystem': false, 'appearance.font': 'playful' })}
          >
            {copy.whatsNew.tryLook}
          </Button>
        )}
      </section>
      <div className="flex flex-col gap-2">
        <Button size="block" onClick={() => close(page.href)}>
          {copy.whatsNew.setUp}
        </Button>
        <Button variant="secondary" onClick={() => (last ? close() : setIndex(index + 1))}>
          {last ? copy.whatsNew.done : copy.whatsNew.later}
        </Button>
      </div>
    </div>
  );
}
