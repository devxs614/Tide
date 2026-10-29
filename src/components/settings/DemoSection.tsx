'use client';

// Demo mode, for the stage and for rehearsals. Turning it on replaces the
// data on this device with a fictional student's three weeks (after a clear
// warning), and the restart buttons reset both the data and the clock so the
// scripted demo can run again from the top.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { now } from '@/lib/clock';
import { DEMO_BRIDGE_TIME, DEMO_JUMP_TIME, leaveDemo, loadDemoData, setDemoTime } from '@/lib/repo/demo';
import { useSettings } from '@/lib/settings';
import { formatLongDate, formatTime } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { SwitchRow } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { clearDrafts } from '@/components/bridge/bridgeDrafts';
import { clearSuggestions } from '@/components/tasks/unstickCache';
import { Section } from './Section';

export function DemoSection() {
  const router = useRouter();
  const { settings } = useSettings();
  const [asking, setAsking] = useState<'on' | 'off' | null>(null);

  // A fresh run: same data, same clock, and nothing remembered in memory
  // from the last rehearsal (bridge notes, unstick steps).
  const restart = async (base?: number) => {
    clearDrafts();
    clearSuggestions();
    await loadDemoData(base);
    toast(copy.settings.demoRestarted);
    router.push('/');
  };

  const confirm = async () => {
    const turningOn = asking === 'on';
    setAsking(null);
    if (turningOn) return restart();
    clearDrafts();
    clearSuggestions();
    await leaveDemo();
  };

  return (
    <Section id="demo" title={copy.settings.demo}>
      <SwitchRow id="set-demo" label={copy.settings.demoMode} checked={settings.demoMode} onCheckedChange={(v) => setAsking(v ? 'on' : 'off')} />
      {settings.demoMode && (
        <div className="flex flex-col gap-2">
          <p className="text-ink-soft">{fill(copy.settings.demoClockNow, { time: `${formatLongDate(now())}, ${formatTime(now())}` })}</p>
          <Button variant="secondary" className="self-start" onClick={() => void restart()}>
            {copy.settings.restartDemo}
          </Button>
          <Button variant="secondary" className="self-start" onClick={() => void restart(DEMO_BRIDGE_TIME)}>
            {copy.settings.restartAtBridge}
          </Button>
          <Button variant="secondary" className="self-start" onClick={() => void setDemoTime(DEMO_JUMP_TIME).then(() => router.push('/'))}>
            {copy.settings.jumpToBridge}
          </Button>
        </div>
      )}
      <Dialog open={asking !== null} onOpenChange={(o) => !o && setAsking(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="pr-0">
            <DialogTitle>{asking === 'on' ? copy.settings.demoOnTitle : copy.settings.demoOffTitle}</DialogTitle>
            <DialogDescription>{asking === 'on' ? copy.settings.demoOnBody : copy.settings.demoOffBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAsking(null)} autoFocus>
              {copy.global.cancel}
            </Button>
            <Button onClick={() => void confirm()}>{asking === 'on' ? copy.settings.demoOnConfirm : copy.settings.demoOffConfirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
