'use client';

// A slim banner on the other tabs when a switch is 15 minutes away, so Maya
// doesn't miss it while she's in Tasks or the toolkit. Today shows the full
// Bridge card instead.
import { usePathname } from 'next/navigation';
import { copy, fill } from '@/copy/en';
import { useBridgeSheet } from '@/lib/ui';
import { useNow } from '@/lib/useNow';
import { Button } from '@/components/ui/button';
import { bridgeNames } from './BridgeCard';
import { useUpcomingBridge } from './useUpcomingBridge';

export function BridgeBanner() {
  const pathname = usePathname();
  const nowTs = useNow(30_000);
  const bridge = useUpcomingBridge(nowTs);
  const { openBridge } = useBridgeSheet();
  if (pathname === '/' || !bridge) return null;
  const { from, to } = bridgeNames(bridge);
  return (
    <div role="region" aria-label={copy.bridge.getReady} className="mx-5 mt-3 flex flex-wrap items-center gap-2 rounded-card border border-primary bg-surface px-4 py-2">
      <p className="flex-1 font-bold">{fill(copy.bridge.banner, { from, to, m: bridge.minutesUntil })}</p>
      <Button size="sm" onClick={() => openBridge(bridge.to.id)}>
        {copy.bridge.getReady}
      </Button>
    </div>
  );
}
