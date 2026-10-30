'use client';

// The dev-only shore review behind /dev/shore: every item type on the sand,
// two bottles in the water, and a time-of-day switch. No data involved.
import { useState } from 'react';
import { SHORE_ITEMS, SHORE_ITEM_TYPES } from '@/data/shoreItems';
import type { ShoreItem } from '@/lib/shore/items';
import { placeItems } from '@/lib/shore/placement';
import { skyColors, type SkyPhase } from '@/lib/shore/sky';
import { useThemeScheme } from '@/lib/theme/useThemeScheme';
import { Chip } from '@/components/ui/chip';
import { ShoreScene } from './ShoreScene';

const PHASES: SkyPhase[] = ['dawn', 'day', 'golden', 'dusk', 'night'];
const SAMPLE: ShoreItem[] = SHORE_ITEM_TYPES.map((type, i) => ({
  id: `sample-${type}`,
  ts: i,
  type,
  variant: type === 'starfish' ? 'move' : type === 'seaGlass' ? 'blue' : 'medium',
  description: SHORE_ITEMS[type].description,
}));

export function ShorePreviewDev() {
  const [phase, setPhase] = useState<SkyPhase>('day');
  const scheme = useThemeScheme();
  const { placed } = placeItems(SAMPLE);
  return (
    <main className="mx-auto flex max-w-[430px] flex-col gap-4 bg-bg p-4 text-ink">
      <h1 className="text-h2 font-extrabold">Shore preview (dev only)</h1>
      <div className="flex flex-wrap gap-2">
        {PHASES.map((p) => (
          <Chip key={p} label={p} pressed={phase === p} onToggle={() => setPhase(p)} />
        ))}
      </div>
      <ShoreScene
        placed={placed}
        bottles={[
          { id: 'b1', ts: 0, text: '' },
          { id: 'b2', ts: 0, text: '' },
        ]}
        glowingBottleId="b1"
        newIds={[]}
        sky={{ ...skyColors('time', phase, scheme === 'dark'), sun: { up: phase !== 'night', t: phase === 'dawn' ? 0.1 : phase === 'golden' ? 0.85 : 0.5 } }}
        onSelect={() => {}}
        onBottle={() => {}}
      />
    </main>
  );
}
