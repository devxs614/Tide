'use client';

// The dev-only celebration preview behind /dev/celebrations: one button per
// tier and state, played through the real host with the real decision, but
// without reading or writing any data. Not linked from the app.
import { decide, type Column, type Tier } from '@/lib/celebrate/matrix';
import { showCelebration } from '@/lib/celebrate/store';
import { celebrationText } from '@/lib/celebrate/text';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';

const COLUMNS: Column[] = ['swell', 'still', 'neutral', 'surge', 'ebb'];
const TIERS: Tier[] = ['micro', 'small', 'big'];

export function CelebrationPreview() {
  const level = useMotionLevel();
  const { settings } = useSettings();
  const play = (tier: Tier, column: Column) => {
    const decision = decide({
      event: 'taskDone',
      tier,
      quadrant: column === 'neutral' ? null : column,
      level,
      setting: settings['motion.celebrations'],
      confetti: settings['motion.confetti'],
    });
    const text = celebrationText('taskDone', settings.communicationMode, { title: 'Lab report', companion: 'Pebble' });
    showCelebration({ decision, anchor: null, title: text.title, message: text.message, announce: decision.toast ?? text.title });
  };
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 bg-bg p-6 text-ink">
      <h1 className="text-h1 font-extrabold">Celebration preview (dev only)</h1>
      <p className="text-ink-soft">Motion level: {level}</p>
      {TIERS.map((tier) => (
        <section key={tier} className="flex flex-col gap-2">
          <h2 className="text-h3 font-bold">{tier}</h2>
          <div className="flex flex-wrap gap-2">
            {COLUMNS.map((column) => (
              <Button key={column} variant="secondary" size="sm" onClick={() => play(tier, column)}>
                {column}
              </Button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
