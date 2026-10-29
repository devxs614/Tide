'use client';

// Today, top to bottom. In Phase 2 it shows the state card; Phase 4 adds the
// greeting, the Day Mode banner, the next-event card and the Tide Line.
import { StateCard } from './StateCard';

export function TodayScreen() {
  return (
    <div className="flex flex-col gap-5">
      <StateCard />
    </div>
  );
}
