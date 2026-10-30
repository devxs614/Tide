'use client';

// Mounted for the whole app, and nearly free: outside the demo workspace it
// renders nothing and loads nothing. Inside it, the demo runtime loads.
import dynamic from 'next/dynamic';
import { useIsClient } from '@/lib/useIsClient';
import { currentWorkspace } from '@/lib/workspace';

const DemoRuntime = dynamic(() => import('./DemoRuntime'), { ssr: false });

export function DemoHost() {
  const isClient = useIsClient();
  if (!isClient || currentWorkspace() !== 'demo') return null;
  return <DemoRuntime />;
}
