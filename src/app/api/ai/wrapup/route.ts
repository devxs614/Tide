// POST /api/ai/wrapup: the evening summary (v2 spec 14.6). Only facts and
// the labels Maya picked go in; her own notes stay on her device. Anything
// that judges the day, invents a number or quotes a task that doesn't exist
// is replaced by the fallback template.
import { handleAiRoute } from '@/lib/ai/route';
import { WrapupInput, WrapupOutput, checkWrapupOutput } from '@/lib/ai/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleAiRoute(req, {
    route: 'wrapup',
    tier: 'smart',
    maxTokens: 600,
    input: WrapupInput,
    output: WrapupOutput,
    check: checkWrapupOutput,
  });
}
