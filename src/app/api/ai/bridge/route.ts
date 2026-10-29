// POST /api/ai/bridge: the parking question, one strategy and the prep list
// for a switch between activities. The strategy must come from the ranked
// candidates the app sent.
import { handleAiRoute } from '@/lib/ai/route';
import { BridgeInput, BridgeOutput, checkBridgeOutput } from '@/lib/ai/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleAiRoute(req, {
    route: 'bridge',
    tier: 'fast',
    maxTokens: 350,
    input: BridgeInput,
    output: BridgeOutput,
    check: checkBridgeOutput,
  });
}
