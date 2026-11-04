// Runs the v2.3 phone migration once per workspace (v2.3 Item 2): saved
// phone contacts and the campus phone get a country code and digits; any
// that can't be read are kept exactly as typed and flagged for review.
// Loaded on demand from the shell, so Today's first load doesn't carry it.
import { getSettings, setSettings } from '@/lib/repo/settings';
import { defaultCountry, migrateCampus, migrateContact } from '@/lib/phone';

export async function runContactMigration(): Promise<void> {
  const s = await getSettings();
  if (s['contacts.migratedV23']) return;
  const fallback = defaultCountry();
  await setSettings({
    trustedContacts: s.trustedContacts.map((c) => migrateContact(c, fallback)),
    campusSupport: migrateCampus(s.campusSupport, fallback),
    'contacts.migratedV23': true,
  });
}
