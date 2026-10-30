'use client';

// "Choose a companion?" on Today, for people who came from v1 and haven't
// picked one (v2 spec 11.3). It asks gently until they choose one in the
// Studio or tap "No thanks", which hides it for good.
import Link from 'next/link';
import { copy } from '@/copy/en';
import { SPECIES } from '@/lib/companion/registry';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Companion } from '@/components/companion/Companion';

export function ChooseCompanionCard() {
  const { settings, update } = useSettings();
  if (settings.demoMode || settings['companion.species'] !== null || settings['today.companionCardDismissed']) return null;
  return (
    <section aria-labelledby="choose-companion" className="card flex flex-col gap-3 p-4">
      <div aria-hidden className="flex justify-between">
        {SPECIES.map((s) => (
          <Companion key={s} override={{ species: s }} size={40} decorative />
        ))}
      </div>
      <h2 id="choose-companion" className="text-h3 font-extrabold">
        {copy.whatsNew.chooseCompanion}
      </h2>
      <p className="text-ink-soft">{copy.whatsNew.chooseCompanionSub}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/companion">{copy.whatsNew.chooseCompanionYes}</Link>
        </Button>
        <Button variant="secondary" onClick={() => void update('today.companionCardDismissed', true)}>
          {copy.whatsNew.noThanks}
        </Button>
      </div>
    </section>
  );
}
