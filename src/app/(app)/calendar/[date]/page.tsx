// /calendar/YYYY-MM-DD — one day, ahead or past (v2.1 F-10).
import { CalendarDayScreen } from '@/components/calendar/CalendarDayScreen';

export default async function CalendarDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <CalendarDayScreen date={date} />;
}
