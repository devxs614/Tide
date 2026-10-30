'use client';

// The "Install Tide" control for Settings → About and What's new (v2 spec
// 17.3). What it shows depends on the browser: a real button where the
// browser offers installing, the two taps to do on an iPhone or iPad, a
// quiet note when Tide is already installed, and an honest line elsewhere.
import { Download, Share } from 'lucide-react';
import { copy } from '@/copy/en';
import { promptInstall, useInstallState } from '@/lib/install';
import { Button } from '@/components/ui/button';

export function InstallButton() {
  const state = useInstallState();
  if (state === 'installed') return <p className="text-ink-soft">{copy.install.installed}</p>;
  if (state === 'ios') {
    return (
      <div className="flex flex-col gap-1 rounded-card bg-surface-2 p-3">
        <p className="flex items-center gap-2 font-bold">
          <Share aria-hidden className="size-5 text-primary" />
          {copy.install.iosTitle}
        </p>
        <p>{copy.install.ios}</p>
      </div>
    );
  }
  if (state === 'unavailable') return <p className="text-ink-soft">{copy.install.unavailable}</p>;
  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" className="self-start" onClick={() => void promptInstall()}>
        <Download aria-hidden />
        {copy.install.button}
      </Button>
      <p className="text-caption text-ink-soft">{copy.install.body}</p>
    </div>
  );
}
