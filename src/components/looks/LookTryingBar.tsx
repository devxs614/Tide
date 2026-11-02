'use client';

// "Trying: Sunset" (v2.1 F-11): while a look is being tried, a bar offers
// Keep it, Back to my look, and Next look. Leaving the page while trying
// keeps the look, with one Undo toast to go back.
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { looksCopy as t } from '@/copy/looksCopy';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { useLooks } from './useLooks';

// How many bars are on screen. React's development mode mounts, unmounts
// and mounts again at once; the leave step waits a tick and only runs if
// no bar came back.
let mounted = 0;

export function LookTryingBar() {
  const { settings, updateMany } = useSettings();
  const looks = useLooks();
  const snap = settings['appearance.lookSnapshot'];
  // The latest snapshot, for the moment the page goes away.
  const snapRef = useRef(snap);
  useEffect(() => {
    snapRef.current = snap;
  });
  useEffect(() => {
    mounted += 1;
    return () => {
      mounted -= 1;
      window.setTimeout(() => {
        const left = snapRef.current;
        if (mounted > 0 || !left) return;
        void updateMany({ 'appearance.lookSnapshot': null });
        const name = t.looks[left.trying as keyof typeof t.looks]?.name ?? '';
        toast(fill(t.kept, { name }), { action: { label: copy.global.undo, onClick: () => void updateMany(left.values) } });
      }, 0);
    };
    // Only when the page goes away.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!looks.trying) return null;
  return (
    <div data-overlay="chrome" className="sticky top-16 z-(--z-sticky) flex flex-wrap items-center gap-2 rounded-card border-2 border-primary bg-surface p-3 big-text:static" role="status">
      <span className="min-w-0 flex-1 basis-40 font-bold">{fill(t.trying, { name: t.looks[looks.trying].name })}</span>
      <Button size="sm" onClick={looks.keep} data-demo-id="look-keep">
        {t.keep}
      </Button>
      <Button variant="secondary" size="sm" onClick={looks.back} data-demo-id="look-back">
        {t.back}
      </Button>
      <Button variant="quiet" size="sm" onClick={looks.next}>
        {t.next}
      </Button>
    </div>
  );
}
