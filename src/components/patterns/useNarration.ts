'use client';

// Words for the computed patterns. Only each pattern's facts go to the
// narrate route; the answers are cached in memory by key + k + n + mode, so
// switching tabs or periods doesn't ask again, and a pattern only gets new
// wording when its numbers change. With AI off, the template answers.
import { useEffect, useState } from 'react';
import type { NarrateCard } from '@/lib/ai/schemas';
import { useAi } from '@/lib/ai/useAi';
import type { PatternResult } from '@/lib/patterns/types';
import type { CommunicationMode } from '@/lib/types';

const cache = new Map<string, NarrateCard>();
const cacheKey = (p: PatternResult, mode: CommunicationMode) => `${p.key}:${p.k}:${p.n}:${mode}`;

export function useNarration(patterns: PatternResult[], mode: CommunicationMode): Array<NarrateCard | null> {
  const { run } = useAi('narrate');
  const [, setVersion] = useState(0);
  const missing = patterns.filter((p) => !cache.has(cacheKey(p, mode)));
  const signature = missing.map((p) => cacheKey(p, mode)).join('|');

  useEffect(() => {
    if (!signature) return;
    void (async () => {
      const result = await run({ mode, patterns: missing.map((p) => ({ key: p.key, kind: p.kind, facts: p.facts })) });
      for (const card of result.data.cards) {
        const pattern = missing.find((p) => p.key === card.key);
        if (pattern) cache.set(cacheKey(pattern, mode), card);
      }
      setVersion((v) => v + 1);
    })();
    // `signature` captures exactly which patterns are missing words.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, mode]);

  return patterns.map((p) => cache.get(cacheKey(p, mode)) ?? null);
}

export function resetNarrationCacheForTests(): void {
  cache.clear();
}
