// A titled block on the Settings screen, with an anchor so other screens can
// link straight to it ("Add someone" goes to #people).
import type { ReactNode } from 'react';

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="flex scroll-mt-20 flex-col gap-3">
      <h2 id={`${id}-heading`} className="text-h2 font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
