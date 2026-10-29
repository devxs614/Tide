// POST /api/ai/unstick: one small first step for a stuck task, fitted to the
// reason and Maya's current state. The strategy it suggests must be one the
// pattern engine already found helpful.
import { handleAiRoute } from '@/lib/ai/route';
import { UnstickInput, UnstickOutput, checkUnstickOutput } from '@/lib/ai/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleAiRoute(req, {
    route: 'unstick',
    tier: 'fast',
    maxTokens: 350,
    input: UnstickInput,
    output: UnstickOutput,
    check: checkUnstickOutput,
  });
}
