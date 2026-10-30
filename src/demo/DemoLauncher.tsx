'use client';

// The demo launcher: three big choices and three options. Starting moves to
// the demo workspace (its own database) and begins the tour there.
import { useState } from 'react';
import { copy } from '@/copy/en';
import { enterDemoWorkspace, type DemoMode } from '@/lib/workspace';
import { CardButton } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SwitchRow } from '@/components/ui/switch';
import { readDemoOptions, saveDemoOptions, type DemoOptions } from './demoOptions';

const MODES: Array<Exclude<DemoMode, 'explore'>> = ['full', 'pitch', 'presenter'];

export function DemoLauncher() {
  const [options, setOptions] = useState<DemoOptions>(() => (typeof window === 'undefined' ? { narration: false, captions: true, speed: 1 } : readDemoOptions()));
  const change = (patch: Partial<DemoOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    saveDemoOptions(next);
  };
  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-h1 font-extrabold">{copy.demo.launcherTitle}</h1>
      <p className="text-ink-soft">{copy.demo.launcherBody}</p>
      {MODES.map((mode) => (
        <CardButton key={mode} onClick={() => enterDemoWorkspace(mode)}>
          <span className="text-h3 font-extrabold">{copy.demo[mode].title}</span>
          <span className="text-ink-soft">{copy.demo[mode].body}</span>
        </CardButton>
      ))}
      <SwitchRow id="demo-narration" label={copy.demo.narration} checked={options.narration} onCheckedChange={(v) => change({ narration: v })} />
      <SwitchRow id="demo-captions" label={copy.demo.captions} checked={options.captions} onCheckedChange={(v) => change({ captions: v })} />
      <SegmentedControl
        label={copy.demo.speedLabel}
        value={String(options.speed)}
        onChange={(v) => change({ speed: Number(v) })}
        options={['1', '1.5', '2'].map((v) => ({ value: v, label: `${v}×` }))}
      />
      <button type="button" className="self-start font-bold text-primary underline underline-offset-4" onClick={() => enterDemoWorkspace('explore')}>
        {copy.demo.explore}
      </button>
    </div>
  );
}
