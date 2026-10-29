'use client';

// Your data: download everything as a JSON file (contacts only if Maya ticks
// the box, because they are other people's details), or delete everything
// from this device after a clear two-button confirmation.
import { useState } from 'react';
import { Download } from 'lucide-react';
import { copy } from '@/copy/en';
import { realNow } from '@/lib/clock';
import { deleteEverything, exportData } from '@/lib/repo/data';
import { toISODate } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Section } from './Section';

export function DataSection() {
  const [includeContacts, setIncludeContacts] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const download = async () => {
    const file = await exportData(includeContacts);
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `tide-export-${toISODate(realNow())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wipe = async () => {
    await deleteEverything();
    window.location.reload();
  };

  return (
    <Section id="data" title={copy.settings.yourData}>
      <CheckboxRow id="include-contacts" label={copy.settings.includeContacts} checked={includeContacts} onCheckedChange={setIncludeContacts} />
      <Button variant="secondary" className="self-start" onClick={() => void download()}>
        <Download aria-hidden />
        {copy.settings.exportData}
      </Button>
      <Button variant="notice" className="self-start" onClick={() => setConfirming(true)}>
        {copy.settings.deleteEverything}
      </Button>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="pr-0">
            <DialogTitle>{copy.settings.deleteTitle}</DialogTitle>
            <DialogDescription>{copy.settings.deleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirming(false)} autoFocus>
              {copy.settings.keepData}
            </Button>
            <Button variant="notice" onClick={() => void wipe()}>
              {copy.settings.deleteEverything}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
