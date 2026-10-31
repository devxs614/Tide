'use client';

// The demo, running (v2 spec 16.3–16.5). Loaded only in the demo
// workspace: it fills the demo database the first time, starts the tour the
// launcher asked for, and draws the tour's controls, spotlight, cursor, end
// screen and (with ?demoDebug=1) the list of steps.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { copy } from '@/copy/en';
import { setDemoForceCache } from '@/lib/ai/runAi';
import { now, setDemoSpeed } from '@/lib/clock';
import { resetDemoWorkspace, seedDemoWorkspace, setDemoTime } from '@/lib/repo/demo';
import { useVoice } from '@/lib/voice/useVoice';
import { director, type DirectorMode } from './director/engine';
import { runCustom } from './director/customActions';
import { DemoCursor } from './director/DemoCursor';
import { DirectorHUD } from './director/DirectorHUD';
import { EndScreen } from './director/EndScreen';
import { Spotlight } from './director/Spotlight';
import { FULL } from './director/scripts/full';
import { PITCH } from './director/scripts/pitch';
import { readDemoOptions } from './demoOptions';

export default function DemoRuntime() {
  const router = useRouter();
  const voice = useVoice();
  const state = useSyncExternalStore(director.subscribe, director.getState, director.getState);
  // Read once: the tour navigates right away, and the address loses its
  // ?demoDebug=1 with the first page change.
  const [debug] = useState(() => new URLSearchParams(window.location.search).has('demoDebug'));

  const start = async (mode: DirectorMode, script = mode === 'pitch' ? PITCH : FULL) => {
    // Every tour starts from the seed, so it plays the same each time.
    await resetDemoWorkspace();
    const options = readDemoOptions();
    // Autoplay plays the saved answers only, so it's the same every time
    // and needs no network; presenter mode can still use live AI.
    setDemoForceCache(mode !== 'presenter');
    director.start(script, mode, {
      navigate: (path) => router.push(path),
      speak: async (text) => {
        await voice.speak(text, { quiet: true });
      },
      custom: (name, args) => runCustom(name, args, (path) => router.push(path), director.getState().speed),
      setClock: (ts) => setDemoTime(ts),
      setSpeed: async (m) => {
        setDemoSpeed(m);
        if (m === 1) await setDemoTime(now());
      },
    }, options);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    // A tour fills the database itself (start resets it to the seed).
    if (demo === 'start') {
      void start((params.get('mode') as DirectorMode | null) ?? 'full');
    } else {
      void seedDemoWorkspace().then(() => {
        if (demo === 'explore') router.replace('/');
      });
    }
    // Once, when the demo workspace opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.running) return null;
  return (
    <>
      <Spotlight target={state.target} />
      <DemoCursor target={state.target} />
      {state.done ? (
        <EndScreen onExplore={director.exit} onPitch={() => void start(state.presenter ? 'presenter' : 'pitch', PITCH)} />
      ) : (
        <DirectorHUD state={state} />
      )}
      {debug && (
        <aside aria-label={copy.demo.debugTitle} className="fixed top-2 right-2 z-[75] max-h-[60vh] w-56 overflow-y-auto rounded-card border-2 border-line bg-surface p-2 text-caption">
          <p className="font-bold">{copy.demo.debugTitle}</p>
          <ul>
            {state.log.map((l, i) => (
              <li key={`${l.id}-${i}`}>
                {l.ok ? 'ok' : 'skipped'} · {l.id}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </>
  );
}
