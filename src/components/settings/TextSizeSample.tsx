'use client';

// Under the text size choices (v2.1 F-02, spec 6.5): a task card and a
// setting row drawn at the size just picked, a line saying Tide rearranges
// itself as text grows, and a button that copies the details the team needs
// to fix a layout problem (page, window size, text size, font). It only
// copies to the clipboard; nothing is sent anywhere.
import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';

export function TextSizeSample() {
  const { settings } = useSettings();
  const t = copy.textSize;
  const copyDetails = async () => {
    const details = [
      'Tide layout details',
      `Page: ${window.location.pathname}`,
      `Window: ${window.innerWidth} × ${window.innerHeight}`,
      `Text size: ${Math.round(settings.textScale * 100)}%`,
      `Font: ${settings['appearance.font']}`,
      `Bold text: ${settings['appearance.boldText'] ? 'on' : 'off'}`,
      `Extra spacing: ${settings.extraSpacing ? 'on' : 'off'}`,
      `Theme: ${settings['appearance.theme']}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(details);
      toast(t.copied);
    } catch {
      toast(t.copyFailed);
    }
  };
  return (
    <div className="flex flex-col gap-3">
      {/* A picture of the result, not working controls. */}
      <div aria-hidden className="flex flex-col gap-3 rounded-card border-2 border-dashed border-line p-3">
        <span className="text-caption text-ink-soft">{t.sampleLabel}</span>
        <div className="card flex flex-col gap-1 p-3">
          <span className="font-display font-extrabold">{t.sampleTask}</span>
          <span className="text-caption text-ink-soft">{t.sampleMeta}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0">{t.sampleSwitch}</span>
          <span className="flex h-8 w-13 shrink-0 items-center rounded-full bg-primary p-1">
            <span className="ml-auto size-6 rounded-full bg-on-primary" />
          </span>
        </div>
      </div>
      <p className="text-caption text-ink-soft">{t.note}</p>
      <Button variant="secondary" size="sm" className="self-start" onClick={() => void copyDetails()}>
        <ClipboardCopy aria-hidden />
        {t.report}
      </Button>
    </div>
  );
}
