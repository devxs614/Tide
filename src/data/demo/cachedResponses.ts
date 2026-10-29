// Saved AI answers for the exact inputs of the scripted stage demo, so the
// demo looks the same every time and still works if the venue network dies.
// useAi races the live call against these in demo mode only. Phase 8 fills
// in the real entries; until then nothing matches and the live call or the
// built-in fallback answers as usual.
import type { AiRouteName, AiOutputs } from '@/lib/ai/types';

export function findCachedResponse<R extends AiRouteName>(
  route: R,
  input: unknown,
): AiOutputs[R] | undefined {
  void route;
  void input;
  return undefined;
}
