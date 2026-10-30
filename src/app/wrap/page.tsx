// /wrap — Close the day (v2 spec 14.3): full screen, outside the tab layout,
// like Focus. `?reopen=1` opens a closed day at its summary.
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { WrapScreen } from '@/components/wrap/WrapScreen';

export default async function WrapPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return (
    <PhoneFrame>
      <main>
        <WrapScreen reopen={query.reopen === '1'} />
      </main>
    </PhoneFrame>
  );
}
