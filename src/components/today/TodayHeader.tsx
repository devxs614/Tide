'use client';

// "Good afternoon, Maya" and "Thursday, November 5". The name only appears
// if she set one in Settings; the greeting follows the (demo-aware) clock.
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { dayPart, formatLongDate } from '@/lib/time';

export function TodayHeader({ nowTs }: { nowTs: number }) {
  const { settings } = useSettings();
  const greeting = copy.today.greeting[dayPart(nowTs)];
  const name = settings.name.trim();
  return (
    <div className="flex flex-col">
      <h2 className="text-h1 font-bold">{name ? fill(copy.today.greetingWithName, { greeting, name }) : greeting}</h2>
      <p className="text-ink-soft">{formatLongDate(nowTs)}</p>
    </div>
  );
}
