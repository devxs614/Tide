'use client';

// Listens for the desktop shortcuts on the main screens (v2 spec 17.1) and
// owns the "?" sheet. Mounted by AppShell, so full-screen moments (focus,
// Close the day, onboarding) are never interrupted by a stray key. It stays
// quiet while a sheet or menu is open, while the demo tour has the keyboard,
// and on the support pages, where nobody should be sent elsewhere by accident.
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useSettings } from '@/lib/settings';
import { useCheckInSheet } from '@/lib/ui';
import { shortcutFor } from '@/lib/shortcuts';
import { WhenOpened } from './WhenOpened';

const ShortcutsSheet = dynamic(() => import('./ShortcutsSheet').then((m) => m.ShortcutsSheet), { ssr: false });

function somethingElseHasTheKeyboard(): boolean {
  return !!document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"], [data-demo-hud]');
}

export function KeyboardShortcuts() {
  const { settings } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const { openCheckIn } = useCheckInSheet();
  const [helpOpen, setHelpOpen] = useState(false);
  const enabled = settings['shortcuts.enabled'] && !pathname.startsWith('/support');

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const action = shortcutFor(e);
      if (!action || somethingElseHasTheKeyboard()) return;
      e.preventDefault();
      switch (action.kind) {
        case 'checkIn':
          return openCheckIn();
        case 'newTask':
          return router.push('/tasks?new=1');
        case 'tab':
          return router.push(action.href);
        case 'wrap':
          return router.push('/wrap');
        case 'help':
          return setHelpOpen(true);
        case 'demo':
          return router.push('/demo');
        case 'searchSettings': {
          const field = document.getElementById('settings-search');
          if (field) field.focus();
          else router.push('/settings#search');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, openCheckIn, router]);

  return (
    <WhenOpened open={helpOpen}>
      <ShortcutsSheet open={helpOpen} onOpenChange={setHelpOpen} />
    </WhenOpened>
  );
}
