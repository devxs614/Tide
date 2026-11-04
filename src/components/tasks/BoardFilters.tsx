'use client';

// The quick filter chips under the Tasks header (v2.3 spec 5.3). They
// scroll sideways inside the frame when they don't fit, and "Clear
// filters" appears once one is on.
import { tasksCopy as t } from '@/copy/tasksCopy';
import { BOARD_FILTERS, clearFilters, toggleFilter, useBoardFilters } from '@/lib/tasks/boardFilters';
import { cn } from '@/lib/utils';

export function BoardFilters() {
  const active = useBoardFilters();
  return (
    <div role="group" aria-label={t.filtersLabel} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {BOARD_FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={active.includes(f)}
          onClick={() => toggleFilter(f)}
          className={cn(
            'min-h-12 shrink-0 rounded-full border px-3 text-caption whitespace-nowrap',
            active.includes(f) ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface text-ink',
          )}
        >
          {t.filters[f]}
        </button>
      ))}
      {active.length > 0 && (
        <button type="button" onClick={clearFilters} className="min-h-12 shrink-0 rounded-full px-3 text-caption font-bold whitespace-nowrap text-primary underline">
          {t.clearFilters}
        </button>
      )}
    </div>
  );
}
