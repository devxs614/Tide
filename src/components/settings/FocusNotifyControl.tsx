'use client';

// Settings → Focus → "Notify me if Tide is in the background" (v2.1 F-06).
// Turning it on asks the browser for permission right then, from the tap;
// if the browser says no, the switch stays off and says why. The help is
// honest that a long-hidden tab can deliver it up to a minute late.
import { useState } from 'react';
import { settingsCopy } from '@/copy/settingsCopy';
import { useSettings } from '@/lib/settings';
import { SwitchRow } from '@/components/ui/switch';

export function FocusNotifyControl() {
  const { settings, update } = useSettings();
  const [problem, setProblem] = useState<string | null>(null);
  const change = async (on: boolean) => {
    setProblem(null);
    if (!on) return void update('focus.notifyAtEnd', false);
    if (typeof Notification === 'undefined') return setProblem(settingsCopy.notifyUnsupported);
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') return setProblem(settingsCopy.notifyBlocked);
    void update('focus.notifyAtEnd', true);
  };
  return (
    <div className="flex flex-col gap-1">
      <SwitchRow
        id="focus-notify"
        label={settingsCopy.labels.notifyAtEnd}
        description={settingsCopy.notifyHelp}
        checked={settings['focus.notifyAtEnd']}
        onCheckedChange={(on) => void change(on)}
      />
      <p className="text-small text-ink-soft">{settingsCopy.notifyIos}</p>
      {problem && (
        <p className="text-small text-notice" role="status">
          {problem}
        </p>
      )}
    </div>
  );
}
