// GET /api/config: the few non-secret settings the browser needs, like how
// long to wait for an AI answer. It reports whether a key is configured as a
// yes/no only; the key itself never leaves the server.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    timeoutMs: Number(process.env.TIDE_AI_TIMEOUT_MS ?? 8000),
    demoTimeoutMs: Number(process.env.TIDE_AI_DEMO_TIMEOUT_MS ?? 4000),
    hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
