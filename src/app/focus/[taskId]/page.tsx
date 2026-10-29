// /focus/[taskId] — the full-screen focus block, deliberately outside the
// tab layout so there is nothing else to look at. `?minutes=` carries the
// length Unstick suggested.
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { FocusScreen } from '@/components/focus/FocusScreen';
import type { FocusMinutes } from '@/lib/types';

const ALLOWED = [5, 10, 15, 25];

export default async function FocusPage({ params, searchParams }: PageProps<'/focus/[taskId]'>) {
  const { taskId } = await params;
  const query = await searchParams;
  const asNumber = Number(query.minutes);
  const minutes = ALLOWED.includes(asNumber) ? (asNumber as FocusMinutes) : undefined;
  return (
    <PhoneFrame>
      <main>
        {/* A new key per visit resets the timer when "Smaller step" sends
            Maya back here with a new suggestion. */}
        <FocusScreen key={`${taskId}:${query.minutes ?? ''}`} taskId={taskId} suggestedMinutes={minutes} />
      </main>
    </PhoneFrame>
  );
}
