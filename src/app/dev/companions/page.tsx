// /dev/companions — a review gallery for the companion art (v2 spec V3):
// every species in every expression, color and accessory, side by side. It
// exists only in development; production builds answer "not found".
import { notFound } from 'next/navigation';
import { CompanionGallery } from '@/components/companion/CompanionGallery';

export default function CompanionGalleryPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <CompanionGallery />;
}
