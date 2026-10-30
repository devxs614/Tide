// /dev/celebrations — plays any celebration (tier × state) at the current
// motion level, for reviewing the matrix by eye (v2 spec 10.3). Nothing is
// saved. It exists only in development; production builds answer "not found".
import { notFound } from 'next/navigation';
import { CelebrationPreview } from '@/components/celebrate/CelebrationPreview';

export default function CelebrationPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <CelebrationPreview />;
}
