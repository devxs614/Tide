// SHA-256 as hex, for voice cache keys and clip file names. The clip script
// on the server and the app in the browser must agree on these, so both use
// this one function (Web Crypto works in both).
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function voiceCacheKey(provider: string, voice: string, speed: number, text: string): Promise<string> {
  return sha256Hex(`${provider}|${voice}|${speed}|${text}`);
}
