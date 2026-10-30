'use client';

// celebrate(event, context) for the screens (v2 spec 10.4): it checks that a
// celebration is welcome right now, reads how Maya said she feels (her
// latest check-in in the last six hours), applies her settings and the
// caps, then plays the result: the effect or overlay (through
// CelebrationHost), the sound, the companion's reaction and any words.
// It returns the decision, so a screen with its own toast can use the words.
import { useCallback } from 'react';
import { toast } from 'sonner';
import { copy } from '@/copy/en';
import { now } from '@/lib/clock';
import { emitCompanion } from '@/lib/companion/bus';
import { useCompanion } from '@/lib/companion/useCompanion';
import { recentCheckIn } from '@/lib/latestState';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { useSettings } from '@/lib/settings';
import { isQuiet, soundSettingsFrom } from '@/lib/sound/useSound';
import { capTier } from './caps';
import { BASE_TIER, decide, type CelebrationEvent, type Decision, type Tier } from './matrix';
import { celebrationsBlocked, showCelebration } from './store';
import { celebrationText, type TextVars } from './text';

export interface CelebrateContext extends Omit<TextVars, 'companion'> {
  // A different tier than the event's usual one (a hard task is big).
  tier?: Tier;
  // The element where the win happened, so the sparkle plays there.
  anchor?: Element | null;
  // The screen shows its own toast and will use decision.toast itself.
  ownToast?: boolean;
}

export function useCelebrate() {
  const { settings } = useSettings();
  const level = useMotionLevel();
  const profile = useCompanion();

  return useCallback(
    async (event: CelebrationEvent, ctx: CelebrateContext = {}): Promise<Decision | null> => {
      if (celebrationsBlocked()) return null;
      const latest = await recentCheckIn(now());
      const tier = capTier(ctx.tier ?? BASE_TIER[event], now());
      const decision = decide({
        event,
        tier,
        quadrant: latest?.quadrant ?? null,
        level,
        setting: settings['motion.celebrations'],
        confetti: settings['motion.confetti'],
      });

      if (decision.sound && settings['sound.enabled'] && !isQuiet()) {
        const sound = soundSettingsFrom(settings);
        const { name, volume } = decision.sound;
        void import('@/lib/sound/engine').then((engine) => engine.playSound(name, { ...sound, volume: sound.volume * volume }));
      }
      // Small and big wins get a reaction from every companion on screen;
      // micro ones (a check-in) already have their own.
      if (decision.tier !== 'micro') emitCompanion({ type: 'celebrate', tier: decision.tier, quadrant: latest?.quadrant ?? null });

      const text = celebrationText(event, settings.communicationMode, { ...ctx, companion: profile.species ? profile.name : undefined });
      // A first is small (no overlay), so its words ("First check-in!") go
      // in a toast; hard-day wording takes their place when it applies.
      const words = decision.toast ?? (event === 'firstTime' ? text.title : null);
      const detail = event === 'firstTime' && text.message ? text.message : undefined;
      const rect = ctx.anchor?.getBoundingClientRect();
      showCelebration({
        decision,
        anchor: rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null,
        title: text.title,
        message: text.message,
        announce: words ?? (decision.overlay ? text.title : copy.celebrate.announce[event]),
      });
      if (words && !ctx.ownToast) toast(words, { description: detail });
      return decision;
    },
    [settings, level, profile],
  );
}
