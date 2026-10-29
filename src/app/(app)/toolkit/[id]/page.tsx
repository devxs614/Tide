// /toolkit/[id]?context=toolkit|bridge|unstick&ref=<id> — one strategy. The
// context and ref say where Maya came from (a stuck task or a switch), so
// the use is recorded against it and she returns there afterwards.
import { StrategyRunner } from '@/components/toolkit/StrategyRunner';
import type { StrategyContext } from '@/lib/types';

const CONTEXTS: StrategyContext[] = ['toolkit', 'bridge', 'unstick'];

export default async function StrategyPage({ params, searchParams }: PageProps<'/toolkit/[id]'>) {
  const { id } = await params;
  const query = await searchParams;
  const context = CONTEXTS.includes(query.context as StrategyContext) ? (query.context as StrategyContext) : 'toolkit';
  const ref = typeof query.ref === 'string' ? query.ref : undefined;
  return <StrategyRunner key={`${id}:${context}:${ref ?? ''}`} id={id} context={context} refId={ref} />;
}
