'use client';

// The live preview at the top of each Settings page (v2 spec 15.1): a mini
// Today card, a 3D button, a chip, a state and the companion, redrawn the
// moment a setting changes, so Maya sees what a choice does before leaving.
import { copy, fill, quadrantLabel } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { formatLongDate, formatTime } from '@/lib/time';
import { now } from '@/lib/clock';
import { SIZES } from '@/lib/companion/registry';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { QuadrantDot } from '@/components/ui/QuadrantDot';
import { LazyCompanion } from '@/components/companion/LazyCompanion';

export function LivePreview() {
  const { settings } = useSettings();
  const name = settings.name.trim();
  const ts = now();
  return (
    <details open className="sticky top-16 z-20 rounded-card border-2 border-line bg-bg/95 p-3 backdrop-blur">
      <summary className="min-h-12 cursor-pointer font-display font-extrabold">{copy.set.preview}</summary>
      <div aria-hidden className="card mt-2 flex items-center gap-3 p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-h3 font-bold">{name ? fill(copy.today.greetingWithName, { greeting: copy.set.previewGreeting, name }) : copy.set.previewGreeting}</span>
          <span className="text-small text-ink-soft">
            {formatLongDate(ts)} · {formatTime(ts)}
          </span>
          <span className="inline-flex items-center gap-2 text-small">
            <QuadrantDot quadrant="still" /> {quadrantLabel('still', settings.communicationMode)}
          </span>
          <p className="text-small">{copy.set.previewBody}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" tabIndex={-1}>
              {copy.set.previewButton}
            </Button>
            <Chip label={copy.set.previewChip} pressed onToggle={() => {}} className="pointer-events-none" />
          </div>
        </div>
        {settings['companion.species'] && settings['companion.species'] !== 'none' && <LazyCompanion size={SIZES.sm} expression="happy" decorative />}
      </div>
    </details>
  );
}
