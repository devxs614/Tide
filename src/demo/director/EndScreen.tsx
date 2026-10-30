'use client';

// The end of the tour (v2 spec 16.5): "That's Tide.", everything the tour
// showed, and three ways on: explore, the pitch cut, or back to your own
// space.
import { Check } from 'lucide-react';
import { copy } from '@/copy/en';
import { leaveDemoWorkspace } from '@/lib/workspace';
import { Button } from '@/components/ui/button';

export function EndScreen({ onExplore, onPitch }: { onExplore: () => void; onPitch: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="demo-end" className="fixed inset-0 z-[72] flex items-center justify-center bg-bg/90 p-5">
      <div className="card flex w-full max-w-sm flex-col gap-4 p-5">
        <h2 id="demo-end" className="text-h1 font-extrabold">
          {copy.demo.endTitle}
        </h2>
        <ul className="grid grid-cols-2 gap-2 text-small">
          {copy.demo.endFeatures.map((f) => (
            <li key={f} className="flex items-start gap-1.5">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button size="block" onClick={onExplore} autoFocus>
          {copy.demo.exploreOwn}
        </Button>
        <Button variant="secondary" onClick={onPitch}>
          {copy.demo.runPitch}
        </Button>
        <Button variant="quiet" onClick={leaveDemoWorkspace}>
          {copy.demo.leave}
        </Button>
      </div>
    </div>
  );
}
