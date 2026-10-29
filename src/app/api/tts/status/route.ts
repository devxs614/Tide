// GET /api/tts/status — whether natural voices are available, which provider
// and which voices, so Settings can offer them. Never includes the key.
import { ttsStatusBody } from '@/lib/voice/tts.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(ttsStatusBody());
}
