// Demo autoplay (v2 spec 16.6) never touches the network, found missing in
// V12 when a real run of the tour called the narrate route: with nothing
// saved for an input, the built-in answer is used instead of a live call.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EMOTION_IDS } from '@/data/emotions';
import { resetAiClientStateForTests, runAi, setDemoForceCache } from './runAi';

afterEach(() => {
  setDemoForceCache(false);
  resetAiClientStateForTests();
  vi.unstubAllGlobals();
});

describe('demo autoplay', () => {
  it('answers from the built-in fallback without any request when nothing was saved', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    setDemoForceCache(true);
    const result = await runAi(
      'label',
      { mode: 'gentle', localTime: 'Thu 3:40 pm', text: 'Words no saved answer has.', vocabulary: EMOTION_IDS },
      { aiEnabled: true, demoMode: true },
    );
    expect(result.source).toBe('fallback');
    expect(result.data.candidates).toHaveLength(3);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
