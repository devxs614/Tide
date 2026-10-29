'use client';

// Mounts a sheet the first time it is opened and keeps it mounted after
// that, so its closing animation still plays. Until then, its code (and
// everything it imports, like the AI validation schemas) isn't downloaded,
// which keeps the first load of every screen light.
import { useState, type ReactNode } from 'react';

export function WhenOpened({ open, children }: { open: boolean; children: ReactNode }) {
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);
  return opened || open ? <>{children}</> : null;
}
