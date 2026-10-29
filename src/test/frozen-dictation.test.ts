// Dictation is frozen for v2. The team says it works very well, so nobody may
// change it, not even to tidy it up. These hashes were recorded in Phase V0
// (docs/V1_INVENTORY.md); if one fails, put the dictation code back instead
// of updating the hash.
import { describe, expect, it } from 'vitest';
import { declarationSource, readSource, sha256 } from './frozenSource';

const FROZEN_SPEECH: Record<string, string> = {
  RecognitionLike: '2479d887e0eabfaeed8eef95ce52559ccc4b3a60e0e519098abe0958560f0da1',
  RecognitionCtor: 'eeb961c0407e287e0c180d02bc27bfe21e512f2433b4579b17ee6809747c050b',
  recognitionCtor: 'fc1e7b23c47bbdf47e00441a060f6085fc999de9c49d346cc149488d8c06e4a3',
  isDictationSupported: '8c72ceef19c1856e10fe67b5338cb6d118465032b0f925e1802e4b2143019a81',
  startDictation: 'd50dd0d26ab12d8f78a8c1b9c5a504bed2e172256ef8c08ebc9c77faac90ccef',
};
const FROZEN_BUTTON = '51fd21f73dbfaac7a213acaf0b5ecfabf0460e770452dcdfeebccb9eceecb9b6';
const FROZEN_COPY = 'd41d732316b71d43f7af2298ca1f9d298af542dd8bdd55c5ea0b93a6d21600f4';

const WHY = 'Dictation is frozen for Tide v2 (docs/TIDE_V2_UPGRADE_PROMPT.md, Section 3.2). Revert the change instead of updating this hash.';

describe('frozen dictation', () => {
  const speech = readSource('src/lib/speech.ts');

  it.each(Object.entries(FROZEN_SPEECH))('%s in src/lib/speech.ts is unchanged', (name, hash) => {
    expect(sha256(declarationSource(speech, name)), `${name}: ${WHY}`).toBe(hash);
  });

  it('DictateButton is unchanged', () => {
    expect(sha256(readSource('src/components/ui/DictateButton.tsx')), WHY).toBe(FROZEN_BUTTON);
  });

  it('the Dictate and Listening labels are unchanged', () => {
    const lines = readSource('src/copy/en.ts')
      .split('\n')
      .filter((line) => /^\s+(dictate|listening): /.test(line));
    expect(sha256(lines.join('\n')), WHY).toBe(FROZEN_COPY);
  });
});
