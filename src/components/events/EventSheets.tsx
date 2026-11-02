'use client';

// Shows whichever event sheet is open (v2.1 F-04): details, the edit form
// or the delete question. AppShell loads this file the first time one
// opens, so Today's first load doesn't carry it.
import { closeEventSheet, useEventSheet } from '@/lib/eventSheets';
import { DeleteEventDialog } from './DeleteEventDialog';
import { EditEventSheet } from './EditEventSheet';
import { EventDetailSheet } from './EventDetailSheet';

export function EventSheets() {
  const sheet = useEventSheet();
  if (!sheet) return null;
  if (sheet.kind === 'detail') return <EventDetailSheet id={sheet.id} onClose={closeEventSheet} />;
  if (sheet.kind === 'edit') return <EditEventSheet id={sheet.id} onClose={closeEventSheet} />;
  return <DeleteEventDialog id={sheet.id} onClose={closeEventSheet} />;
}
