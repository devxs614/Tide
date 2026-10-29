// Device voice ranking with voice lists like the ones each platform really
// reports (v2 spec 7.3). The point: the natural voice wins, and novelty or
// robotic voices are never chosen.
import { describe, expect, it } from 'vitest';
import { cleanVoiceName, pickVoice, rankVoices, type VoiceLike } from '../voiceRanking';

const v = (name: string, lang: string, localService = true): VoiceLike => ({ name, lang, voiceURI: name, localService });

const WINDOWS_EDGE = [
  v('Microsoft David Desktop - English (United States)', 'en-US'),
  v('Microsoft Zira Desktop - English (United States)', 'en-US'),
  v('Microsoft Aria Online (Natural) - English (United States)', 'en-US', false),
  v('Microsoft Guy Online (Natural) - English (United States)', 'en-US', false),
  v('Microsoft Sonia Online (Natural) - English (United Kingdom)', 'en-GB', false),
];
const WINDOWS_CHROME = [
  v('Microsoft David - English (United States)', 'en-US'),
  v('Microsoft Mark - English (United States)', 'en-US'),
  v('Google US English', 'en-US', false),
  v('Google UK English Female', 'en-GB', false),
];
const MAC_SAFARI = [v('Albert', 'en-US'), v('Fred', 'en-US'), v('Bubbles', 'en-US'), v('Karen', 'en-AU'), v('Samantha', 'en-US'), v('Daniel', 'en-GB')];
const MAC_CHROME_SPANISH = [
  v('Paulina', 'es-MX'),
  v('Eddy (inglés (Estados Unidos))', 'en-US'),
  v('Grandpa (inglés (Reino Unido))', 'en-GB'),
  v('Samantha', 'en-US'),
  v('Moira', 'en-IE'),
  v('Google US English', 'en-US', false),
];
const ANDROID_CHROME = [
  v('English United States', 'en-US'),
  v('English United Kingdom', 'en-GB'),
  v('espeak English', 'en'),
];
const IOS_SAFARI = [v('Samantha (Compact)', 'en-US'), v('Samantha (Enhanced)', 'en-US'), v('Daniel', 'en-GB'), v('Trinoids', 'en-US')];

describe('voice ranking', () => {
  it('picks the Natural voice on Edge, never a Desktop voice', () => {
    expect(pickVoice(WINDOWS_EDGE)?.name).toMatch(/Aria Online \(Natural\)/);
  });
  it("picks Google's network voice on Windows Chrome", () => {
    expect(pickVoice(WINDOWS_CHROME)?.name).toBe('Google US English');
  });
  it('picks Samantha on a Mac, never a novelty voice', () => {
    expect(pickVoice(MAC_SAFARI)?.name).toBe('Samantha');
    expect(rankVoices(MAC_SAFARI).map((x) => x.name)).not.toContain('Albert');
  });
  it('skips Spanish and the robotic Eloquence voices on a Mac set to Spanish', () => {
    const ranked = rankVoices(MAC_CHROME_SPANISH).map((x) => x.name);
    expect(ranked).not.toContain('Paulina');
    expect(ranked.some((n) => /Eddy|Grandpa/.test(n))).toBe(false);
    expect(pickVoice(MAC_CHROME_SPANISH)?.name).toBe('Google US English');
  });
  it('uses the best local voice when offline', () => {
    expect(pickVoice(MAC_CHROME_SPANISH, { online: false })?.name).toBe('Samantha');
  });
  it('avoids eSpeak on Android', () => {
    expect(pickVoice(ANDROID_CHROME)?.name).toBe('English United States');
    expect(rankVoices(ANDROID_CHROME).map((x) => x.name)).not.toContain('espeak English');
  });
  it('prefers Enhanced over Compact on iOS', () => {
    expect(pickVoice(IOS_SAFARI)?.name).toBe('Samantha (Enhanced)');
  });
  it('honors the accent preference and a chosen voice', () => {
    expect(pickVoice(MAC_SAFARI, { accent: 'en-GB' })?.name).toBe('Daniel');
    expect(pickVoice(MAC_SAFARI, { chosenURI: 'Karen' })?.name).toBe('Karen');
    expect(pickVoice(MAC_SAFARI, { chosenURI: 'Not on this device' })?.name).toBe('Samantha');
  });
  it('cleans long voice names for the picker', () => {
    expect(cleanVoiceName('Microsoft Aria Online (Natural) - English (United States)')).toBe('Aria (Natural)');
    expect(cleanVoiceName('Samantha')).toBe('Samantha');
  });
});
