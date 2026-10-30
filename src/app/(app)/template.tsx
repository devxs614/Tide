// Page enter for every tab screen (v2 spec 5.4). A template re-mounts on
// each navigation, so the new page rises in gently: a short fade and lift at
// Lively, a fade at Calm, nothing at Off (all in globals.css). Exits aren't
// animated; the App Router can't hold the old page.
import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
