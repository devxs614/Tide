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
import { settingsV1 } from '@/copy/settingsV1Copy';

const SOURCE_WORDS: Record<AiSource, string> = {
  ai: settingsV1.sourceAi,
  fallback: settingsV1.sourceFallback,
  'demo-cache': settingsV1.sourceDemo,
};

export function AiSection() {
  const { settings, update } = useSettings();
  const recent = [...new Set(recentAiSources())].map((s) => SOURCE_WORDS[s]);
  return (
    <Section id="ai" title={settingsV1.ai}>
      <SwitchRow id="set-ai" label={settingsV1.useAi} checked={settings.aiEnabled} onCheckedChange={(v) => void update('aiEnabled', v)} />
      {!settings.aiEnabled && <p className="rounded-card bg-surface-2 p-3">{copy.global.aiOff}</p>}
      <h3 className="font-bold">{settingsV1.aboutSuggestions}</h3>
      {settingsV1.aboutSuggestionsBody.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {recent.length > 0 && <p className="text-ink-soft">{fill(settingsV1.lastSuggestions, { source: recent.join(', ') })}</p>}
    </Section>
  );
}
