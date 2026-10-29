// The v1 regression suite (`npm run test:v1`): exactly the test files that
// existed at the v1-baseline tag, listed in docs/V1_INVENTORY.md. It has to
// stay green at the end of every v2 phase, so a v2 change that breaks a v1
// behavior shows up on its own, not buried among the new tests.
import { defineConfig, mergeConfig } from "vitest/config";
import base from "./vitest.config.mts";

const V1_TESTS = [
  "src/app/api/ai/routes.test.ts",
  "src/app/prompts-doc/page.test.tsx",
  "src/components/bridge/BridgeFlow.test.tsx",
  "src/components/checkin/CheckInSheet.test.tsx",
  "src/components/focus/FocusScreen.test.tsx",
  "src/components/patterns/PatternsFlow.test.tsx",
  "src/components/safety/CrisisScreen.test.tsx",
  "src/components/settings/Settings.test.tsx",
  "src/components/settings/VoicePicker.test.tsx",
  "src/components/tasks/TasksFlow.test.tsx",
  "src/components/today/TodayFlow.test.tsx",
  "src/components/toolkit/Toolkit.test.tsx",
  "src/data/demo/cachedResponses.test.ts",
  "src/data/demo/seed.test.ts",
  "src/data/sudoku.test.ts",
  "src/lib/ai/client.test.ts",
  "src/lib/ai/fallbacks.test.ts",
  "src/lib/ai/runAi.test.ts",
  "src/lib/ai/schemas.test.ts",
  "src/lib/bridge.test.ts",
  "src/lib/clock.test.ts",
  "src/lib/daymode.test.ts",
  "src/lib/patterns/__tests__/engine.test.ts",
  "src/lib/quadrant.test.ts",
  "src/lib/repo/repo.test.ts",
  "src/lib/safety/detect.test.ts",
  "src/lib/speech.test.ts",
  "src/lib/spokenNumbers.test.ts",
  "src/lib/strategyRank.test.ts",
  "src/lib/time.test.ts",
  "src/lib/voices.test.ts",
  "src/test/demoScript.test.tsx",
  "src/test/guards.test.ts",
];

// mergeConfig would append to the base include glob, so the list replaces it.
const config = mergeConfig(base, defineConfig({}));
config.test = { ...config.test, include: V1_TESTS };
export default config;
