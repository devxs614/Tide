// /demo — the demo launcher (v2 spec 16.2): the full tour, the pitch cut or
// presenter mode, with narration, captions and speed. Presenters can open
// this address directly.
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { DemoLauncher } from '@/demo/DemoLauncher';

export default function DemoPage() {
  return (
    <PhoneFrame>
      <main>
        <DemoLauncher />
      </main>
    </PhoneFrame>
  );
}
