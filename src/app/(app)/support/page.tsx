// /support — "Talk to a person". With ?crisis=1 (set by the safety layer) it
// shows the still, crisis version instead of the everyday one.
import { CrisisScreen } from '@/components/safety/CrisisScreen';
import { SupportScreen } from '@/components/safety/SupportScreen';

export default async function SupportPage({ searchParams }: PageProps<'/support'>) {
  const params = await searchParams;
  return params.crisis === '1' ? <CrisisScreen /> : <SupportScreen />;
}
