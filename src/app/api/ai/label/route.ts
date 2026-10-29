// POST /api/ai/label: emotion words from Maya's own words or body cues.
// Uses the fast model; the made-up-id check keeps answers inside the
// 48-word vocabulary.
import { handleAiRoute } from '@/lib/ai/route';
import { LabelInput, LabelOutput, checkLabelOutput } from '@/lib/ai/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleAiRoute(req, {
    route: 'label',
    tier: 'fast',
    maxTokens: 500,
    input: LabelInput,
    output: LabelOutput,
    check: checkLabelOutput,
  });
}
