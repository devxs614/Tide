// The voice list of a real Mac set to Spanish, shared by the read-aloud tests.
// Its default voice is Paulina (Mexican Spanish), which read English badly.

export function voice(name: string, lang: string, localService = true, isDefault = false): SpeechSynthesisVoice {
  return { name, lang, localService, default: isDefault, voiceURI: name } as SpeechSynthesisVoice;
}

export const SPANISH_MAC = [
  voice('Paulina', 'es-MX', true, true),
  voice('Albert', 'en-US'),
  voice('Bubbles', 'en-US'),
  voice('Eddy (inglés (Estados Unidos))', 'en-US'),
  voice('Fred', 'en-US'),
  voice('Zarvox', 'en-US'),
  voice('Daniel', 'en-GB'),
  voice('Samantha', 'en-US'),
  voice('Karen', 'en-AU'),
  voice('Moira', 'en-IE'),
];
