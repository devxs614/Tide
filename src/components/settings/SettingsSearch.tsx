'use client';

// The search field at the top of Settings (v2 spec 15.4). Results show the
// setting and its section; choosing one opens that section at the control
// and rings it briefly.
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { searchSettings } from '@/lib/settings/searchIndex';

export function SettingsSearch() {
  const [q, setQ] = useState('');
  const hits = searchSettings(q);
  return (
    <div role="search" className="flex flex-col gap-2">
      <label htmlFor="settings-search" className="sr-only">
        {copy.set.searchLabel}
      </label>
      <div className="flex items-center gap-2 rounded-input border-2 border-line bg-surface px-3">
        <Search aria-hidden className="size-5 text-ink-soft" />
        <input
          id="settings-search"
          type="search"
          value={q}
          placeholder={copy.set.searchPlaceholder}
          onChange={(e) => setQ(e.target.value)}
          className="min-h-12 flex-1 bg-transparent text-body outline-none"
        />
      </div>
      {q.trim() && (
        <ul aria-live="polite" className="flex flex-col gap-1">
          {hits.length === 0 && <li className="text-ink-soft">{fill(copy.set.noResults, { q: q.trim() })}</li>}
          {hits.map((hit) => (
            <li key={hit.anchor}>
              <Link href={`/settings/${hit.section}#${hit.anchor}`} className="card-flat flex min-h-12 flex-col justify-center px-3 py-2 hover:bg-surface-2">
                <span className="font-bold">{hit.label}</span>
                <span className="text-caption text-ink-soft">{hit.sectionLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
