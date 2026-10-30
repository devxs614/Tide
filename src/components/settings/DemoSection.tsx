'use client';

// Settings → Demo (v2 spec 16.2–16.3). The demo now runs in its own
// workspace with its own database, so starting it never replaces Maya's
// data (an intentional change from v1). Inside the demo: leave it, or move
// the demo clock to the moments the tour uses. Someone who used v1's demo
// mode still has example data in their main space, and can clear it.
import { useState } from 'react';
import { copy } from '@/copy/en';
import { DEMO_START } from '@/lib/clock';
import { DEMO_BRIDGE_TIME, leaveDemo, setDemoTime } from '@/lib/repo/demo';
import { useSettings } from '@/lib/settings';
import { currentWorkspace, enterDemoWorkspace, leaveDemoWorkspace } from '@/lib/workspace';
import { Button } from '@/components/ui/button';
import { Section } from './Section';

const EVENING = new Date(2026, 10, 5, 20, 35).getTime();

export function DemoSection() {
  const { settings } = useSettings();
  const [confirming, setConfirming] = useState(false);
  const inDemo = currentWorkspace() === 'demo';
  const d = copy.demo;

  return (
    <Section id="demo" title={copy.settings.demo}>
      {inDemo ? (
        <>
          <p className="card-flat p-3">{d.inDemo}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => enterDemoWorkspace('full')}>{d.full.title}</Button>
            <Button variant="secondary" onClick={() => void setDemoTime(DEMO_START)}>
              {d.restartClock}
            </Button>
            <Button variant="secondary" onClick={() => void setDemoTime(DEMO_BRIDGE_TIME)}>
              {d.jumpBridge}
            </Button>
            <Button variant="secondary" onClick={() => void setDemoTime(EVENING)}>
              {d.jumpEvening}
            </Button>
            <Button variant="quiet" onClick={leaveDemoWorkspace}>
              {d.leave}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-ink-soft">{d.launcherBody}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => enterDemoWorkspace('full')}>{d.full.title}</Button>
            <Button variant="secondary" onClick={() => enterDemoWorkspace('pitch')}>
              {d.pitch.title}
            </Button>
            <Button variant="secondary" onClick={() => enterDemoWorkspace('presenter')}>
              {d.presenter.title}
            </Button>
            <Button variant="quiet" onClick={() => enterDemoWorkspace('explore')}>
              {d.explore}
            </Button>
          </div>
          {settings.demoMode && (
            <div className="card-flat flex flex-col gap-2 p-3">
              <p>{d.oldDemoData}</p>
              {confirming ? (
                <Button variant="notice" className="self-start" onClick={() => void leaveDemo().then(() => setConfirming(false))}>
                  {d.clearOld}
                </Button>
              ) : (
                <Button variant="secondary" className="self-start" onClick={() => setConfirming(true)}>
                  {d.clearOld}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Section>
  );
}
