'use client';

// AI suggestions: one switch, and plain words about what is sent, what is
// not, and that suggestions can be wrong. It also says where recent
// suggestions came from (AI, built-in, or saved demo answers), the one place
// Tide shows that, so the cards themselves stay uncluttered.
import { copy, fill } from '@/copy/en';
import { recentAiSources } from '@/lib/ai/runAi';
import type { AiSource } from '@/lib/ai/types';
import { useSettings } from '@/lib/settings';
import { SwitchRow } from '@/components/ui/switch';
import { Section } from './Section';

const SOURCE_WORDS: Record<AiSource, string> = {
  ai: copy.settings.sourceAi,
  fallback: copy.settings.sourceFallback,
  'demo-cache': copy.settings.sourceDemo,
};

export function AiSection() {
  const { settings, update } = useSettings();
  const recent = [...new Set(recentAiSources())].map((s) => SOURCE_WORDS[s]);
  return (
    <Section id="ai" title={copy.settings.ai}>
      <SwitchRow id="set-ai" label={copy.settings.useAi} checked={settings.aiEnabled} onCheckedChange={(v) => void update('aiEnabled', v)} />
      {!settings.aiEnabled && <p className="rounded-card bg-surface-2 p-3">{copy.global.aiOff}</p>}
      <h3 className="font-bold">{copy.settings.aboutSuggestions}</h3>
      {copy.settings.aboutSuggestionsBody.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {recent.length > 0 && <p className="text-ink-soft">{fill(copy.settings.lastSuggestions, { source: recent.join(', ') })}</p>}
    </Section>
  );
}
