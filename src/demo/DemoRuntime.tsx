'use client';

// The demo, running (v2 spec 16.3–16.5). Loaded only in the demo
// workspace: it fills the demo database the first time, starts the tour the
// launcher asked for, and draws the tour's controls, spotlight, cursor, end
// screen and (with ?demoDebug=1) the list of steps.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { setDemoForceCache } from '@/lib/ai/runAi';
import { now, setDemoSpeed } from '@/lib/clock';
import { seedDemoWorkspace, setDemoTime } from '@/lib/repo/demo';
import { demoCopy } from '@/copy/demoCopy';
import { Button } from '@/components/ui/button';
import { resumeAudio } from '@/lib/sound/engine';
import { director, type DirectorMode } from './director/engine';
import { useAutoPause } from './director/useAutoPause';
import { useNarrator } from './director/useNarrator';
import { runCustom } from './director/customActions';
import { DebugPanel } from './director/DebugPanel';
import { DemoCursor } from './director/DemoCursor';
import { DirectorHUD } from './director/DirectorHUD';
import { EndScreen } from './director/EndScreen';
import { Spotlight } from './director/Spotlight';
import { FULL } from './director/scripts/full';
import { PITCH } from './director/scripts/pitch';
import { readDemoOptions } from './demoOptions';

export default function DemoRuntime() {
  const router = useRouter();
  const narrator = useNarrator();
  const state = useSyncExternalStore(director.subscribe, director.getState, director.getState);
  // Read once: the tour navigates right away, and the address loses its
  // ?demoDebug=1 with the first page change.
  const [debug] = useState(() => new URLSearchParams(window.location.search).has('demoDebug'));

  // When the seed fails (it shouldn't any more), a calm retry instead of a
  // red error, and the tour that was asked for starts once it works.
  const [seedFailed, setSeedFailed] = useState<null | (() => void)>(null);
  const prepare = async (force: boolean, retry: () => void): Promise<boolean> => {
    try {
      await seedDemoWorkspace({ force });
      setSeedFailed(null);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      setSeedFailed(() => retry);
      return false;
    }
  };

  const start = async (mode: DirectorMode, script = mode === 'pitch' ? PITCH : FULL) => {
    // Every tour starts from the seed, so it plays the same each time.
    if (!(await prepare(true, () => void start(mode, script)))) return;
    const options = readDemoOptions();
    // Autoplay plays the saved answers only, so it's the same every time
    // and needs no network; presenter mode can still use live AI.
    setDemoForceCache(mode !== 'presenter');
    const captions = script.steps.flatMap((s) => (s.caption ? [s.caption] : []));
    director.start(script, mode, {
      navigate: (path) => router.push(path),
      speak: (text, signal) => narrator.say(text, { signal }),
      prime: () => narrator.prime(),
      warmUp: async () => {
        resumeAudio();
        await narrator.warmUp(captions);
        return !narrator.unavailable;
      },
      prefetch: (text) => narrator.prefetch(text),
      custom: (name, args, signal) => runCustom(name, args, (path) => router.push(path), director.getState().speed, signal),
      setClock: (ts) => setDemoTime(ts),
      setSpeed: async (m) => {
        setDemoSpeed(m);
        if (m === 1) await setDemoTime(now());
      },
    }, {
      ...options,
      // The tour starts on a page that was just loaded. A browser speaks
      // only after a tap on the page, so with narration on it waits for
      // play, unless this page has had a tap already.
      waitForTap: options.narration && !navigator.userActivation?.hasBeenActive,
    });
  };

  // Once per page, even though React's Strict Mode runs this effect twice
  // in development: that double start was one of the two seeds that
  // collided on the closed days (D-1). The seed is single-flight too.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    // A tour reseeds the database itself (forced); opening the workspace
    // to explore only fills it if it isn't filled yet.
    if (demo === 'start') {
      void start((params.get('mode') as DirectorMode | null) ?? 'full');
    } else {
      const open = () =>
        void prepare(false, open).then((ok) => {
          if (ok && demo === 'explore') router.replace('/');
        });
      open();
    }
    // Once, when the demo workspace opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutoPause(state.running);

  // Marks the page while a tour runs (D-3), for the rules in globals.css:
  // one toast at a time, above the bar; the page's end clear of the bar;
  // and, in a step that isn't about the companion, its page bubbles and
  // caption bar out of the way (its lines still go to "last line").
  useEffect(() => {
    const root = document.documentElement;
    if (state.running && !state.done) root.dataset.demoRunning = '';
    else delete root.dataset.demoRunning;
    if (state.running && !state.done && state.companionQuiet) root.dataset.demoQuiet = '';
    else delete root.dataset.demoQuiet;
  }, [state.running, state.done, state.companionQuiet]);
  useEffect(
    () => () => {
      delete document.documentElement.dataset.demoRunning;
      delete document.documentElement.dataset.demoQuiet;
    },
    [],
  );

  if (seedFailed)
    return (
      <section role="status" data-overlay="demo" className="card fixed inset-x-4 bottom-24 z-[calc(var(--z-demo)+2)] mx-auto flex max-w-[400px] flex-col gap-2 p-3">
        <p>{demoCopy.seedFailed}</p>
        <Button variant="secondary" className="self-start" onClick={seedFailed}>
          {demoCopy.tryAgain}
        </Button>
      </section>
    );
  if (!state.running) return null;
  return (
    <>
      <Spotlight target={state.target} />
      <DemoCursor cursor={state.cursor} />
      {state.done ? (
        <EndScreen onExplore={director.exit} onPitch={() => void start(state.presenter ? 'presenter' : 'pitch', PITCH)} />
      ) : (
        <DirectorHUD state={state} />
      )}
      {debug && <DebugPanel />}
    </>
  );
}
