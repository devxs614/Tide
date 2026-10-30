'use client';

// "Your Shore" (v2 spec 13.2): the Proof log as a place. Every win washes up
// as a shell, a pebble, sea glass or a starfish; firsts are pearls; notes to
// future Maya bob in the shallows. Nothing is lost, nothing expires, and
// there are no totals here: it's for the days that feel heavy. Things that
// arrived since her last visit wash in one by one.
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, Download, List, Mail } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { now } from '@/lib/clock';
import { emitCompanion } from '@/lib/companion/bus';
import { db } from '@/lib/db';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { getEligibleBottle } from '@/lib/repo/bottles';
import { useSettings } from '@/lib/settings';
import { exportShoreImage } from '@/lib/shore/exportImage';
import { shoreItems, type ShoreItem, type ShoreRange } from '@/lib/shore/items';
import { placeItems } from '@/lib/shore/placement';
import { skyColors, skyPhase, sunProgress } from '@/lib/shore/sky';
import { useThemeScheme } from '@/lib/theme/useThemeScheme';
import { toISODate } from '@/lib/time';
import type { Bottle } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { CheckboxRow } from '@/components/ui/checkbox';
import { SIZES } from '@/lib/companion/registry';
import { CompanionHost } from '@/components/companion/CompanionHost';
import { BottleOpenDialog } from './BottleOpenDialog';
import { BottleWriteSheet } from './BottleWriteSheet';
import { ItemDetailsSheet } from './ItemDetailsSheet';
import { ShoreScene } from './ShoreScene';
import { Skeleton } from '@/components/ui/skeleton';

const RANGES: ShoreRange[] = ['today', 'week', 'all'];
const MAX_ARRIVALS = 6;

export function ShoreScreen() {
  const { settings, update } = useSettings();
  const level = useMotionLevel();
  const scheme = useThemeScheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [range, setRange] = useState<ShoreRange>('week');
  const [selected, setSelected] = useState<ShoreItem | null>(null);
  const [writing, setWriting] = useState(false);
  const [opening, setOpening] = useState<Bottle | null>(null);
  const [withName, setWithName] = useState(false);
  // What counts as new is decided once, as the shore opens.
  const [seenAt] = useState(() => settings['shore.lastSeenAt']);
  const wins = useLiveQuery(() => db.wins.toArray(), []);
  const floating = useLiveQuery(() => db.bottles.filter((b) => !b.openedAt && !b.releasedAt).toArray(), []) ?? [];
  const eligible = useLiveQuery(() => getEligibleBottle(now()), []);

  const nowTs = now();
  const items = useMemo(() => shoreItems(wins ?? [], settings.firsts, range, nowTs), [wins, settings.firsts, range, nowTs]);
  const { placed, overflow } = useMemo(() => placeItems(items), [items]);
  const fresh = placed.filter((p) => p.item.ts > seenAt).sort((a, b) => a.item.ts - b.item.ts);
  const newIds = fresh.slice(-MAX_ARRIVALS).map((p) => p.item.id);
  const phase = skyPhase(nowTs, settings['day.start']);
  const sky = { ...skyColors(settings['shore.sky'], phase, scheme === 'dark'), sun: level === 'off' ? { up: phase !== 'night', t: 0.5 } : sunProgress(nowTs) };

  // Mark the shore as seen once the arrivals have been shown, and let the
  // companion notice them.
  const arrived = fresh.length;
  const loaded = wins !== undefined;
  useEffect(() => {
    if (!loaded) return;
    if (arrived > 0) emitCompanion({ type: 'shoreItem', kind: 'new' });
    void update('shore.lastSeenAt', now());
    // Once per visit, after the wins have loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const latest = fresh.at(-1)?.item;
  const empty = wins !== undefined && wins.length === 0 && Object.keys(settings.firsts).length === 0;

  return (
    <div className="flex flex-col gap-4">
      <a href="#shore-list" className="sr-only-focusable self-start rounded-full bg-primary px-4 py-2 text-on-primary">
        {copy.shore.skipToList}
      </a>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={copy.shore.rangeLabel} className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <Chip key={r} label={copy.shore.ranges[r]} pressed={range === r} onToggle={() => setRange(r)} />
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          <Button variant="quiet" size="sm" asChild>
            <Link href="/shore/collection" data-demo-id="shore-collection">
              <BookOpen aria-hidden />
              {copy.shore.collection}
            </Link>
          </Button>
          <Button variant="quiet" size="sm" asChild>
            <Link href="/proof" id="shore-list">
              <List aria-hidden />
              {copy.shore.list}
            </Link>
          </Button>
        </div>
      </div>

      {/* Until the wins load, a calm placeholder of the same size, so the
          sand doesn't fill in all at once a moment later. */}
      {wins === undefined ? (
        <Skeleton className="h-[min(62vh,560px)]" />
      ) : (
        <ShoreScene
          svgRef={svgRef}
          showLabels={settings['shore.showLabels']}
          placed={placed}
          bottles={floating}
          glowingBottleId={eligible?.id}
          newIds={level === 'off' ? [] : newIds}
          sky={sky}
          onSelect={setSelected}
          onBottle={(b) => (b.id === eligible?.id ? setOpening(b) : toast(copy.shore.waitingBottle))}
          companion={
            <CompanionHost placement="shore" size={SIZES.md} base={phase === 'night' ? 'sleeping' : 'idle'} listens={['shoreItem']} bubble="right" noneAlt="nothing" />
          }
        />
      )}
      <p aria-live="polite" className="sr-only">
        {latest ? fill(copy.shore.newOnShore, { item: latest.description }) : ''}
      </p>
      {overflow > 0 && (
        <Link href="/shore/collection" className="self-start rounded-full border-2 border-line bg-surface px-3 py-1 text-small font-bold">
          {fill(copy.shore.more, { n: overflow })}
        </Link>
      )}
      <p className="text-center text-ink-soft">{empty ? copy.shore.shoreEmpty : copy.shore.shoreHint}</p>

      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={() => setWriting(true)}>
          <Mail aria-hidden />
          {copy.shore.writeNote}
        </Button>
        <Button
          variant="secondary"
          onClick={() => svgRef.current && void exportShoreImage(svgRef.current, withName && settings.name.trim() ? fill(copy.shore.imageName, { name: settings.name.trim() }) : null, toISODate(nowTs))}
        >
          <Download aria-hidden />
          {copy.shore.saveImage}
        </Button>
        {settings.name.trim() && <CheckboxRow id="shore-with-name" label={copy.shore.includeName} checked={withName} onCheckedChange={setWithName} />}
      </div>

      <ItemDetailsSheet item={selected} onClose={() => setSelected(null)} />
      <BottleWriteSheet open={writing} onClose={() => setWriting(false)} />
      <BottleOpenDialog bottle={opening} onClose={() => setOpening(null)} />
    </div>
  );
}
