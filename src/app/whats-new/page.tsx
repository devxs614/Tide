// /whats-new — the same "What's new" pages as the sheet existing users see
// once (v2 spec 11.3), reachable any time from the menu.
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { WhatsNewSheet } from '@/components/whatsnew/WhatsNewSheet';

export default function WhatsNewPage() {
  return (
    <PhoneFrame>
      <main>
        <WhatsNewSheet asPage />
      </main>
    </PhoneFrame>
  );
}
