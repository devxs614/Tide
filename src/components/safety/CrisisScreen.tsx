'use client';

// What Maya sees if her words sound like a crisis. It is deliberately still:
// no animation, no AI, no coaching. Just a kind sentence, crisis lines she
// can call, the people she trusts, her campus support, and a quiet way back.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { holdQuiet } from '@/lib/sound/useSound';
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { CrisisLines } from './CrisisLines';
import { CampusSupport, TrustedContacts } from './ContactList';
import { useSettings } from '@/lib/settings';
import { holdCelebrations } from '@/lib/celebrate/store';
import { currentWorkspace } from '@/lib/workspace';

// `preview` (v2 spec 16.8): the demo tour shows this screen with a banner
// saying it's a preview and nothing was saved. Only in the demo workspace;
// in Maya's own space the flag is ignored.
export function CrisisScreen({ preview = false }: { preview?: boolean } = {}) {
  const router = useRouter();
  const showPreview = preview && currentWorkspace() === 'demo';
  const { settings } = useSettings();
  // No sound here, ever: not a tap, not a chime (v2 spec 6.4).
  useEffect(() => holdQuiet(), []);
  // Never a celebration here, whatever happens elsewhere (v2 spec 10.4).
  useEffect(() => holdCelebrations(), []);
  return (
    <section aria-labelledby="crisis-heading" className="flex flex-col gap-6">
      {showPreview && <p className="rounded-card border-2 border-line bg-surface-2 p-3 font-bold">{copy.demo.crisisPreview}</p>}
      <div className="flex flex-col gap-2">
        <h2 id="crisis-heading" className="text-h1 font-bold">
          {copy.support.crisisHeading}
        </h2>
        <p className="text-lead">{copy.support.crisisBody}</p>
      </div>

      <CrisisLines />

      {settings.trustedContacts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-h3 font-bold">{copy.support.trusted}</h3>
          <TrustedContacts showAddLink={false} />
        </div>
      )}

      {settings.campusSupport && (
        <div className="flex flex-col gap-3">
          <h3 className="text-h3 font-bold">{copy.support.campus}</h3>
          <CampusSupport showAddLink={false} />
        </div>
      )}

      <p className="text-ink-soft">{copy.support.neverContacts}</p>

      <Button variant="quiet" className="self-start" onClick={() => router.push('/')}>
        {copy.support.imSafe}
      </Button>
    </section>
  );
}
