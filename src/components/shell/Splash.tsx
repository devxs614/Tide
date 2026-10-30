// What shows for the moment Tide reads its settings on a new visit (v2 spec
// 17.4): the wave mark on the theme background. It fades in only if loading
// takes longer than a blink, so a fast load never flashes a logo, and it
// never holds up the app: the screen replaces it as soon as settings arrive.
// (The companion can't wave here yet: who it is lives in those settings.)
import { copy } from '@/copy/en';
import { WaveMark } from '@/components/ui/wave-mark';

export function Splash() {
  return (
    <div role="status" aria-label={copy.global.loading} className="splash-in flex flex-1 items-center justify-center">
      <WaveMark className="h-20 w-32" />
    </div>
  );
}
