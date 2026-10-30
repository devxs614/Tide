// "No companion" is a first-class choice (v2 spec 2.3): where a companion
// would stand, a calm abstract wave moves instead (not at motion Off). It's
// decoration, so screen readers skip it.
import { WaveMark } from '@/components/ui/wave-mark';

export function NoneCompanion({ size }: { size: number }) {
  return (
    <span aria-hidden className="none-companion inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <WaveMark className="h-3/5 w-4/5" />
    </span>
  );
}
