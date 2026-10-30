'use client';

// The dev-only gallery behind /dev/companions. Not linked from the app; it's
// for checking that every species reads well in every expression, size,
// color and accessory, in whatever theme and motion level is set.
import { useState } from 'react';
import { ACCESSORIES, COMPANIONS, EXPRESSIONS, SIZES, SPECIES, type AccessoryId, type CompanionSpecies } from '@/lib/companion/registry';
import { Companion } from './Companion';

export function CompanionGallery() {
  const [accessory, setAccessory] = useState<AccessoryId>('none');
  const [only, setOnly] = useState<CompanionSpecies | 'all'>('all');
  const list = only === 'all' ? SPECIES : [only];
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 bg-bg p-6 text-ink">
      <h1 className="text-h1 font-extrabold">Companion gallery (dev only)</h1>
      <div className="flex flex-wrap gap-3">
        <select value={only} onChange={(e) => setOnly(e.target.value as CompanionSpecies | 'all')} className="min-h-12 rounded-input border-2 border-line bg-surface px-3">
          <option value="all">All species</option>
          {SPECIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={accessory} onChange={(e) => setAccessory(e.target.value as AccessoryId)} className="min-h-12 rounded-input border-2 border-line bg-surface px-3">
          {ACCESSORIES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {list.map((species) => (
        <section key={species} className="card flex flex-col gap-4 p-4">
          <h2 className="text-h2 font-extrabold">{COMPANIONS[species].defaultName}</h2>
          <div className="flex flex-wrap items-end gap-4">
            {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
              <figure key={s} className="flex flex-col items-center gap-1">
                <Companion override={{ species, accessory }} size={SIZES[s]} />
                <figcaption className="text-caption text-ink-soft">{s}</figcaption>
              </figure>
            ))}
            {COMPANIONS[species].variants.map((v) => (
              <figure key={v.id} className="flex flex-col items-center gap-1">
                <Companion override={{ species, variant: v.id, accessory }} size={SIZES.md} />
                <figcaption className="text-caption text-ink-soft">{v.id}</figcaption>
              </figure>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
            {EXPRESSIONS.map((e) => (
              <figure key={e} className="flex flex-col items-center gap-1 rounded-md bg-surface-2 p-2">
                <Companion override={{ species, accessory }} expression={e} size={SIZES.md} />
                <figcaption className="text-caption text-ink-soft">{e}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
