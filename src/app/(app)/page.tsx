// Today, Tide's home screen. `?bridge=<id>` reopens the Bridge after Maya
// comes back from a strategy she started in it.
import { TodayScreen } from '@/components/today/TodayScreen';

export default async function TodayPage({ searchParams }: PageProps<'/'>) {
  const params = await searchParams;
  return <TodayScreen bridgeRef={typeof params.bridge === 'string' ? params.bridge : undefined} />;
}
