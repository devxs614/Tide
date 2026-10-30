'use client';

// One Settings section (v2 spec 15.1): the live preview, the section's
// controls from the catalog, and "Reset this section", which puts only this
// section's keys back to their defaults (with Undo). Arriving from search,
// the chosen control is scrolled into view and ringed for a moment.
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { copy } from '@/copy/en';
import { DEFAULT_SETTINGS } from '@/lib/repo/settings';
import { keysOf, sectionById, type SectionId } from '@/lib/settings/catalog';
import { useUndoableUpdate } from '@/lib/settings/useUndoableUpdate';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CustomControl } from './CustomControl';
import { LivePreview } from './LivePreview';
import { SettingControl } from './SettingControl';

export function SectionPage({ id }: { id: SectionId }) {
  const section = sectionById(id)!;
  const undoable = useUndoableUpdate();

  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    const el = anchor ? document.getElementById(anchor) : null;
    if (!el) return;
    el.scrollIntoView({ block: 'center' });
    el.classList.add('setting-highlight');
    const t = window.setTimeout(() => el.classList.remove('setting-highlight'), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const reset = () => {
    const keys = keysOf(id);
    const values = Object.fromEntries(keys.map((k) => [k, DEFAULT_SETTINGS[k]])) as Partial<Settings>;
    undoable(values, copy.set.resetDone);
  };

  return (
    <div className="flex flex-col gap-5">
      <Button variant="quiet" size="sm" className="self-start" asChild>
        <Link href="/settings">
          <ArrowLeft aria-hidden />
          {copy.set.backToSettings}
        </Link>
      </Button>
      <h2 className="text-h1 font-extrabold">{copy.set.sections[id]}</h2>
      <LivePreview />
      <div className="flex flex-col gap-5">
        {section.entries.map((entry) =>
          entry.kind === 'custom' ? <CustomControl key={entry.id} id={entry.id} /> : <SettingControl key={String(entry.key)} entry={entry} />,
        )}
      </div>
      {keysOf(id).length > 0 && (
        <Button variant="secondary" className="self-start" onClick={reset}>
          {copy.set.resetSection}
        </Button>
      )}
    </div>
  );
}
