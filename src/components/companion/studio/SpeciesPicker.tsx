'use client';

// The species row in the Studio's Look tab (v2 spec 8.8): seven cards in a
// row that scrolls sideways, the six companions plus "none", each with a
// small drawing, its default name and one line about its personality. "None"
// sits first so it reads as a real choice, not a leftover.
import { COMPANION_COPY } from '@/copy/companionCopy';
import { COMPANIONS, SIZES, SPECIES, type CompanionSpecies } from '@/lib/companion/registry';
import { CardButton } from '@/components/ui/card';
import { Companion } from '../Companion';
import { NoneCompanion } from '../NoneCompanion';

export function SpeciesPicker({
  value,
  onChange,
}: {
  value: CompanionSpecies | 'none' | null;
  onChange: (species: CompanionSpecies | 'none') => void;
}) {
  const t = COMPANION_COPY;
  return (
    <div role="group" aria-labelledby="studio-species" className="flex flex-col gap-2">
      <h2 id="studio-species" className="font-display font-extrabold">
        {t.studio.species}
      </h2>
      <p className="text-small text-ink-soft">{t.studio.speciesHelp}</p>
      {/* Negative margins let the row scroll to the screen edge while the
          first and last cards still line up with the page. */}
      <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pt-2 pb-3">
        <CardButton
          selected={value === 'none'}
          onClick={() => onChange('none')}
          className="w-36 shrink-0 snap-start items-center text-center"
        >
          <NoneCompanion size={SIZES.sm} />
          <span className="font-display font-extrabold">{t.none.name}</span>
          <span className="text-caption text-ink-soft">{t.none.personality}</span>
        </CardButton>
        {SPECIES.map((species) => (
          <CardButton
            key={species}
            selected={value === species}
            onClick={() => onChange(species)}
            className="w-36 shrink-0 snap-start items-center text-center"
          >
            <Companion override={{ species }} size={SIZES.sm} decorative />
            <span className="font-display font-extrabold">{COMPANIONS[species].defaultName}</span>
            <span className="text-caption text-ink-soft">
              {t.species[species].kind}. {t.species[species].personality}
            </span>
          </CardButton>
        ))}
      </div>
    </div>
  );
}
