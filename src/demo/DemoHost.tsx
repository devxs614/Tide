'use client';

// Mounted for the whole app, and nearly free: outside the demo workspace it
// renders nothing and loads nothing. Inside it, the demo runtime loads.
// "Inside" means this page opened the demo database: the workspace flag in
// localStorage is shared by every tab, so another tab entering the demo
// flips it while this one still holds someone's own data, and this host
// re-renders on every settings change. Before the demo fix pack, that tab
// could mount the runtime and seed Maya's data over the real data.
import dynamic from 'next/dynamic';
import { useIsClient } from '@/lib/useIsClient';
import { isDemoDatabase } from '@/lib/db';
import { currentWorkspace } from '@/lib/workspace';

const DemoRuntime = dynamic(() => import('./DemoRuntime'), { ssr: false });

export function DemoHost() {
  const isClient = useIsClient();
  if (!isClient || currentWorkspace() !== 'demo' || !isDemoDatabase()) return null;
  return <DemoRuntime />;
}
