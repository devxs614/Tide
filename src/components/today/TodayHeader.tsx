'use client';

// "Good afternoon, Maya" and "Thursday, November 5", with her companion on
// the right (v2 spec 12). The companion waves and says hello once per part
// of the day, reacts to check-ins and finished tasks, and opens the
// Companion Studio when tapped. The name only appears if she set one in
// Settings; the greeting follows the (demo-aware) clock.
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
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
    // When the greeting gets cramped (a narrow phone, big text), the
    // companion moves above it instead of squeezing "afternoon" under its
    // feet. The em-based size follows the text size, not just the screen.
    <div className="@container">
      <div className="flex items-center gap-3 @max-[21em]:flex-col-reverse @max-[21em]:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-h1 font-bold">{name ? fill(copy.today.greetingWithName, { greeting, name }) : greeting}</h2>
          {/* v2.1 F-10: the date and the button both open the calendar. */}
          <div className="flex flex-wrap items-center gap-x-3">
            <Link href="/calendar" className="rounded-md text-ink-soft underline-offset-4 hover:underline" data-small-target-ok>
              {formatLongDate(nowTs)}
            </Link>
            <Link
              href="/calendar"
              className="inline-flex min-h-12 items-center gap-1 rounded-full px-2 font-bold text-primary hover:bg-surface-2"
              data-demo-id="today-calendar"
            >
              <CalendarDays aria-hidden className="size-5" />
              {copy.shell.titles.calendar}
            </Link>
          </div>
        </div>
        <CompanionHost
          placement="today"
          greet
          listens={['checkinSaved', 'taskDone', 'celebrate', 'say']}
          onTap={() => router.push('/companion')}
          className="shrink-0 @max-[21em]:self-end"
        />
      </div>
    </div>
  );
}
