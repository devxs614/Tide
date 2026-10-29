// POST /api/ai/narrate: plain-language cards for patterns the app already
// computed. The model only words them. Any card that mentions a number not in
// its facts is swapped for the template card, so the AI can't invent stats.
import { handleAiRoute } from '@/lib/ai/route';
import { NarrateInput, NarrateOutput, checkNarrateKeys, numbersAreFromFacts } from '@/lib/ai/schemas';
import { narrateTemplate } from '@/lib/ai/fallbacks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleAiRoute(req, {
    route: 'narrate',
    tier: 'smart',
    maxTokens: 600,
    input: NarrateInput,
    output: NarrateOutput,
    check: checkNarrateKeys,
    finalize: (input, output) => ({
      cards: output.cards.map((card) => {
        const pattern = input.patterns.find((p) => p.key === card.key)!;
        return numbersAreFromFacts(card, pattern.facts) ? card : narrateTemplate(pattern);
      }),
    }),
  });
}
