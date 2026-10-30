// The launcher's choices (narration, captions, speed), remembered on this
// device between runs. Losing them is harmless: the tour uses its defaults.
export interface DemoOptions {
  narration: boolean;
  captions: boolean;
  speed: number;
}

const KEY = 'tide.demoOptions';
export const DEFAULT_DEMO_OPTIONS: DemoOptions = { narration: false, captions: true, speed: 1 };

export function readDemoOptions(): DemoOptions {
  try {
    return { ...DEFAULT_DEMO_OPTIONS, ...JSON.parse(window.localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return DEFAULT_DEMO_OPTIONS;
  }
}

export function saveDemoOptions(options: DemoOptions): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(options));
  } catch {
    // Not remembered; fine.
  }
}
