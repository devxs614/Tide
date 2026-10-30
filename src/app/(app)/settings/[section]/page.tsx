// /settings/[section] — one Settings page (v2 spec 15.1). Unknown sections
// are a 404, the calm one.
import { notFound } from 'next/navigation';
import { SECTIONS, type SectionId } from '@/lib/settings/catalog';
import { SectionPage } from '@/components/settings/SectionPage';

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.id }));
}

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!SECTIONS.some((s) => s.id === section)) notFound();
  return <SectionPage id={section as SectionId} />;
}
