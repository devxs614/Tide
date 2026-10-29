'use client';

// On a low day, a reminder from Maya's own proof log: "Last Thursday felt
// like this too. You still finished: lab outline." It looks for the most
// recent win from an earlier day when she also checked in as Ebb. If there
// is none, it says something that is still true instead of inventing a match.
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy, fill } from '@/copy/en';
import { db } from '@/lib/db';
import { startOfDay, toISODate, weekdayName } from '@/lib/time';
import { winInSentence } from '@/lib/wins';
import type { CheckIn, Win } from '@/lib/types';

async function pickWin(before: number): Promise<{ win: Win; sameFeeling: boolean } | null> {
  const wins = await db.wins.where('ts').below(before).reverse().sortBy('ts');
  if (wins.length === 0) return null;
  const ebbDays = new Set(
    (await db.checkins.where('ts').below(before).toArray())
      .filter((c) => c.quadrant === 'ebb' && !c.safetyTriggered)
      .map((c) => toISODate(c.ts)),
  );
  const match = wins.find((w) => ebbDays.has(toISODate(w.ts)));
  return match ? { win: match, sameFeeling: true } : { win: wins[0], sameFeeling: false };
}

export function WinCard({ latest }: { latest: CheckIn }) {
  const before = startOfDay(latest.ts);
  const picked = useLiveQuery(() => pickWin(before), [before]);
  if (latest.quadrant !== 'ebb' || !picked) return null;
  const { win, sameFeeling } = picked;
  const text = sameFeeling
    ? fill(copy.today.winCard, { weekday: weekdayName(win.ts), win: winInSentence(win.text) })
    : fill(copy.today.winCardRecent, { win: winInSentence(win.text) });
  return (
    <div className="flex flex-col gap-1 rounded-card bg-surface-2 p-3">
      <p>{text}</p>
      <Link href="/proof" className="self-start text-primary underline underline-offset-4">
        {copy.today.seeProof}
      </Link>
    </div>
  );
}
