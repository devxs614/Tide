// POST /api/ai/daymode: which tasks to keep today and which to move for a
// Gentle or Minimum day. The check makes sure every task is placed exactly
// once, so a plan can never quietly drop one.
import { handleAiRoute } from '@/lib/ai/route';
import { DayModeInput, DayModeOutput, checkDayModeOutput } from '@/lib/ai/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleAiRoute(req, {
    route: 'daymode',
    tier: 'smart',
    maxTokens: 600,
    input: DayModeInput,
    output: DayModeOutput,
    check: checkDayModeOutput,
  });
}
