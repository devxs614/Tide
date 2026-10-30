'use client';

// The Studio's Look tab (v2 spec 8.7–8.8): who the companion is, its color,
// what it wears and how big it shows up in the app. Every choice is shown on
// the companion itself, so there's no guessing what "Sea glass" means. All
// twelve accessories are there from day one; nothing is locked or earned.
import { COMPANION_COPY } from '@/copy/companionCopy';
import { useSettings } from '@/lib/settings';
import { useCompanion } from '@/lib/companion/useCompanion';
import { ACCESSORIES, COMPANIONS, SIZES, type CompanionSpecies } from '@/lib/companion/registry';
import type { Settings } from '@/lib/types';
import { CardButton } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SwitchRow } from '@/components/ui/switch';
import { Companion } from '../Companion';
import { SpeciesPicker } from './SpeciesPicker';

const SIZE_KEYS: Array<Settings['companion.size']> = ['sm', 'md', 'lg'];

export function LookTab({ onSpecies }: { onSpecies: (species: CompanionSpecies | 'none') => void }) {
  const { settings, update } = useSettings();
  const profile = useCompanion();
  const t = COMPANION_COPY;
  const species = profile.species;
  const variant = species ? COMPANIONS[species].variants.find((v) => v.id === profile.variant)?.id ?? COMPANIONS[species].variants[0].id : '';

  return (
    <div className="flex flex-col gap-6">
      <SpeciesPicker value={settings['companion.species']} onChange={onSpecies} />

      {species && (
        <>
          <div role="group" aria-labelledby="studio-color" className="flex flex-col gap-2">
            <h3 id="studio-color" className="font-display font-extrabold">
              {t.studio.color}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {COMPANIONS[species].variants.map((v) => (
                <CardButton
                  key={v.id}
                  selected={variant === v.id}
                  onClick={() => void update('companion.variant', v.id)}
                  className="items-center gap-1 px-1 py-2 text-center"
                >
                  <Companion override={{ species, variant: v.id, accessory: profile.accessory }} size={SIZES.sm} decorative />
                  <span className="text-caption font-bold">{t.variants[v.id] ?? v.id}</span>
                </CardButton>
              ))}
            </div>
          </div>

          <div role="group" aria-labelledby="studio-accessory" className="flex flex-col gap-2">
            <h3 id="studio-accessory" className="font-display font-extrabold">
              {t.studio.accessory}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {ACCESSORIES.map((a) => (
                <CardButton
                  key={a}
                  selected={profile.accessory === a}
                  onClick={() => void update('companion.accessory', a)}
                  className="items-center gap-1 px-1 py-2 text-center"
                >
                  <Companion override={{ species, variant, accessory: a }} size={SIZES.sm} decorative />
                  <span className="text-caption font-bold">{t.accessories[a]}</span>
                </CardButton>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-display font-extrabold">{t.studio.size}</span>
            <SegmentedControl
              label={t.studio.size}
              value={settings['companion.size']}
              onChange={(v) => void update('companion.size', v)}
              options={SIZE_KEYS.map((s) => ({ value: s, label: t.sizes[s] }))}
            />
          </div>

          {species === 'jellyfish' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <span className="font-display font-extrabold">{t.faceStyle.label}</span>
                <SegmentedControl
                  label={t.faceStyle.label}
                  value={settings['companion.faceStyle']}
                  onChange={(v) => void update('companion.faceStyle', v)}
                  options={[
                    { value: 'dots', label: t.faceStyle.dots },
                    { value: 'none', label: t.faceStyle.none },
                  ]}
                />
              </div>
              <SwitchRow
                id="companion-mirror"
                label={t.mirrorState}
                checked={settings['companion.mirrorState']}
                onCheckedChange={(v) => void update('companion.mirrorState', v)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
