// Writes the demo tour scripts to docs/audits/demo-script-<label>.json (demo
// fix pack 1.1), so the tour before and after the fixes can be compared
// line by line. The test in src/demo/__tests__/scriptSnapshot.test.ts holds
// the scripts to a copy of the "before" file kept in its fixtures folder;
// this is for reading the difference. The output folder isn't committed.
//
// Run: TZ=America/Monterrey JITI_ALIAS='{"@/":"./src/"}' npx jiti scripts/demo-script-snapshot.ts before
import { writeFileSync } from 'node:fs';
import { FULL } from '../src/demo/director/scripts/full';
import { PITCH } from '../src/demo/director/scripts/pitch';
import { scriptSnapshot } from '../src/demo/director/scriptSnapshot';

const label = process.argv[2] ?? 'after';
const out = `docs/audits/demo-script-${label}.json`;
writeFileSync(out, JSON.stringify({ full: scriptSnapshot(FULL), pitch: scriptSnapshot(PITCH) }, null, 2) + '\n');
console.log(`wrote ${out}: full ${FULL.steps.length} steps, pitch ${PITCH.steps.length} steps`);
