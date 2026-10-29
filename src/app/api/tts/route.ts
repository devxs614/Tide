// POST /api/tts — turns on-screen text into natural-sounding audio when the
// team has set up a voice provider. The logic lives in lib/voice/tts.server.
import { handleTts } from '@/lib/voice/tts.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(req: Request) {
  return handleTts(req);
}
