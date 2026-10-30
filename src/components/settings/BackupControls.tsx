'use client';

// Settings → Privacy & data, the file actions (v2 spec 15.5): export and
// import just the settings, import a whole backup (checked first, with a
// summary and Replace or Cancel), and clear the voice clips Tide saved.
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { exportSettingsFile, parseBackup, parseSettingsFile, restoreBackup, type ParsedBackup } from '@/lib/repo/backup';
import { useSettings } from '@/lib/settings';
import { clearVoiceCache } from '@/lib/voice/cloudEngine';
import { realNow } from '@/lib/clock';
import { toISODate } from '@/lib/time';
import { Button } from '@/components/ui/button';

function download(name: string, data: unknown) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function readJson(file: File): Promise<unknown> {
  try {
    return JSON.parse(await file.text());
  } catch {
    return null;
  }
}

export function BackupControls() {
  const { settings, updateMany } = useSettings();
  const backupInput = useRef<HTMLInputElement>(null);
  const settingsInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ParsedBackup | null>(null);
  const L = copy.set.labels;

  const pickBackup = async (file?: File) => {
    const parsed = file ? parseBackup(await readJson(file)) : null;
    if (!parsed) return void toast(L.importFailed);
    setPending(parsed);
  };
  const pickSettings = async (file?: File) => {
    const parsed = file ? parseSettingsFile(await readJson(file)) : null;
    if (!parsed) return void toast(L.importFailed);
    await updateMany(parsed.values);
    toast(parsed.invalid.length ? fill(L.settingsImportedSome, { n: parsed.invalid.length }) : L.settingsImported);
  };
  const replace = async () => {
    if (!pending) return;
    const ok = await restoreBackup(pending);
    setPending(null);
    toast(ok ? L.importDone : L.importFailed);
  };
  const summary = pending ? Object.entries(pending.counts).filter(([, n]) => n > 0).map(([table, n]) => `${n} ${table}`).join(', ') || '0' : '';

  return (
    <div id="setting-backup" className="setting-target flex flex-col gap-2 rounded-card">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => download(`tide-settings-${toISODate(realNow())}.json`, exportSettingsFile(settings))}>
          {L.exportSettings}
        </Button>
        <Button variant="secondary" onClick={() => settingsInput.current?.click()}>
          {L.importSettings}
        </Button>
        <Button variant="secondary" onClick={() => backupInput.current?.click()}>
          {L.importBackup}
        </Button>
        <Button variant="secondary" onClick={() => void clearVoiceCache().then(() => toast(L.voiceCacheCleared))}>
          {L.clearVoiceCache}
        </Button>
      </div>
      <input ref={settingsInput} type="file" accept="application/json" hidden aria-label={L.importSettings} onChange={(e) => void pickSettings(e.target.files?.[0])} />
      <input ref={backupInput} type="file" accept="application/json" hidden aria-label={L.importBackup} onChange={(e) => void pickBackup(e.target.files?.[0])} />
      {pending && (
        <div role="alertdialog" aria-labelledby="backup-summary" className="card flex flex-col gap-2 p-4">
          <p id="backup-summary">{fill(L.importSummary, { summary })}</p>
          <div className="flex gap-2">
            <Button onClick={() => void replace()}>{L.importReplace}</Button>
            <Button variant="secondary" onClick={() => setPending(null)}>
              {copy.global.cancel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
