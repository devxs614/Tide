// /dev/shore — the shore scene with one of every item and two bottles, for
// reviewing the art by eye in each theme and at each time of day. Nothing is
// read or saved. It exists only in development.
import { notFound } from 'next/navigation';
import { ShorePreviewDev } from '@/components/shore/ShorePreviewDev';

export default function ShoreDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <ShorePreviewDev />;
}
