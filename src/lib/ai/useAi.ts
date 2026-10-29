'use client';

// The hook screens use to ask for a suggestion:
//   const { run, data, status, source } = useAi('label');
//   const result = await run(input);
// It wires runAi() to the current settings (AI on or off, demo mode) and
// keeps a status the screen can show as a calm loading line. If Maya asks
// again before the first answer lands, only the newest answer is kept.
import { useCallback, useRef, useState } from 'react';
import { useSettings } from '@/lib/settings';
import { runAi } from './runAi';
import type { AiInputs, AiOutputs, AiResult, AiRouteName, AiSource } from './types';

type Status = 'idle' | 'loading' | 'done';

interface AiState<R extends AiRouteName> {
  status: Status;
  data?: AiOutputs[R];
  source?: AiSource;
}

export function useAi<R extends AiRouteName>(route: R) {
  const { settings } = useSettings();
  const [state, setState] = useState<AiState<R>>({ status: 'idle' });
  const latest = useRef(0);

  const run = useCallback(
    async (input: AiInputs[R]): Promise<AiResult<R>> => {
      const id = ++latest.current;
      setState({ status: 'loading' });
      const result = await runAi(route, input, {
        aiEnabled: settings.aiEnabled,
        demoMode: settings.demoMode,
      });
      if (id === latest.current) setState({ status: 'done', data: result.data, source: result.source });
      return result;
    },
    [route, settings.aiEnabled, settings.demoMode],
  );

  const reset = useCallback(() => {
    latest.current++;
    setState({ status: 'idle' });
  }, []);

  return { run, reset, ...state };
}
