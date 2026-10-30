'use client';

// "Good afternoon, Maya" and "Thursday, November 5", with her companion on
// the right (v2 spec 12). The companion waves and says hello once per part
// of the day, reacts to check-ins and finished tasks, and opens the
// Companion Studio when tapped. The name only appears if she set one in
// Settings; the greeting follows the (demo-aware) clock.
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { dayPart, formatLongDate } from '@/lib/time';

// The host brings the companion's lines, sound and voice; loading it after
// the page keeps Today's first load inside its budget (v2 spec 5.6). The
// header text simply makes room when it arrives.
const CompanionHost = dynamic(() => import('@/components/companion/CompanionHost').then((m) => m.CompanionHost), {
  ssr: false,
  loading: () => null,
});

export function TodayHeader({ nowTs }: { nowTs: number }) {
  const { settings } = useSettings();
  const router = useRouter();
  const greeting = copy.today.greeting[dayPart(nowTs)];
  const name = settings.name.trim();
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="text-h1 font-bold">{name ? fill(copy.today.greetingWithName, { greeting, name }) : greeting}</h2>
        <p className="text-ink-soft">{formatLongDate(nowTs)}</p>
      </div>
      <CompanionHost
        placement="today"
        greet
        listens={['checkinSaved', 'taskDone', 'celebrate', 'say']}
        onTap={() => router.push('/companion')}
        className="shrink-0"
      />
    </div>
  );
}
