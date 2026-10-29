# Tide v1 inventory

A map of what Tide v1 contained at the `v1-baseline` tag (2026-10-29), written
in Phase V0 of the v2 upgrade. v2 only adds to this list. If something here
disappears or changes meaning, that is a regression unless
`docs/TIDE_V2_UPGRADE_PROMPT.md` Section 3.5 lists it as intentional.

## Baseline

- Test files: 33. Tests: 164. All passing.
- `npm run lint`, `npm run typecheck`, `npm run build`: clean, no warnings.
- First-load JS, gzipped, measured with `scripts/measure-first-load.mjs` on
  `next start`: `/` 267 KB, `/tasks` 277 KB, `/toolkit` 262 KB,
  `/settings` 310 KB, `/patterns` 351 KB (framer-motion is only on Patterns).
- v2 budget for `/`: 300 KB gzipped (the stricter of "≤ 300 KB" and
  "baseline + 60 KB").

## Routes

| URL | File |
|---|---|
| `/` (Today) | `src/app/(app)/page.tsx` |
| `/tasks` (`?unstick=<id>` reopens Unstick) | `src/app/(app)/tasks/page.tsx` |
| `/toolkit`, `/toolkit/[id]` (`?context=&ref=`) | `src/app/(app)/toolkit/…` |
| `/patterns` | `src/app/(app)/patterns/page.tsx` |
| `/proof` | `src/app/(app)/proof/page.tsx` |
| `/settings` | `src/app/(app)/settings/page.tsx` |
| `/support` (`?crisis=1`) | `src/app/(app)/support/page.tsx` |
| `/focus/[taskId]` (`?minutes=`) | `src/app/focus/[taskId]/page.tsx` |
| `/onboarding` | `src/app/onboarding/page.tsx` |
| `/prompts-doc` | `src/app/prompts-doc/page.tsx` |
| `POST /api/ai/label`, `unstick`, `daymode`, `bridge`, `narrate` | `src/app/api/ai/*/route.ts` |
| `GET /api/config` | `src/app/api/config/route.ts` |

## Components (`src/components/`)

- **bridge:** BridgeBanner, BridgeCard, BridgeClose, BridgePrep, BridgeSheet, BridgeShift, BridgeSteps, TransitionRating
- **checkin:** AllWords, BodyPath, CheckInSheet, EmotionCandidateCard, LeaveConfirm, MoodMap, StepBehind, StepHeader, StepHearing, StepNeed, StepWhat, ToggleChip
- **focus:** FocusOutcome, FocusScreen, WaterFill
- **onboarding:** OnboardingScreen, WaveArt
- **patterns:** NotTrueDialog, PatternCard, PatternsScreen, PeriodDots, TopStrategies, TransitionsSummary, WhyPanel
- **proof:** AddWinForm, ProofScreen, RewardsList, WinItem
- **safety:** ContactList, CrisisLines, CrisisScreen, SupportScreen, TalkToAPersonButton
- **settings:** AboutSection, AiSection, ComfortSection, DataSection, DemoSection, PeopleSection, PreferencePickers, Section, SettingsScreen, VoicePicker
- **shell:** AppShell, CheckInFab, PhoneFrame, TabBar (4 tabs), TopBar, WhenOpened
- **tasks:** LeftOffNote, MoveToMenu, StateColumn, TaskBoard, TaskCard, TaskForm, TasksScreen, UnstickReasons, UnstickSheet, UnstickStep
- **today:** AddEventSheet, DayModeBanner, DayModeProposal, DayModeSheet, NextTransitionCard, StateCard, TideLine, TodayHeader, TodayScreen, WinCard
- **toolkit:** ReCheck, StrategyCard, StrategyMeta, StrategyRunner, ToolArea, ToolkitScreen; tools: BoxBreathing, BrainDump, DoodleCanvas, Grounding54321, MessageTemplate, SoftTimer, StepsTimer, Sudoku4x4, TimerControls, WalkTimer
- **ui:** DictateButton (frozen), Dots, ReadAloudButton, StateChip, button, checkbox, dialog, dropdown-menu, sheet, slider, sonner, switch, tabs

## Repo functions (`src/lib/repo/`)

| File | Exports |
|---|---|
| checkins.ts | createCheckIn, latestCheckIn |
| data.ts | exportData, clearData, deleteEverything |
| dayPlans.ts | applyDayPlan, undoDayPlan, bringBackToday |
| demo.ts | loadDemoData, leaveDemo, setDemoTime |
| events.ts | addEvent |
| focus.ts | saveFocusBlock |
| patterns.ts | dismissPattern, dismissedKeys |
| rewards.ts | addReward, removeReward |
| settings.ts | settingsFromRows, getSettings, setSetting, setSettings, DEFAULT_SETTINGS |
| strategies.ts | recordStrategyUse |
| tasks.ts | addTask, getTask, moveTask, setStuckReason, setFirstStep, setParkingNote |
| transitions.ts | saveTransition, transitionLabels, rateTransition |
| wins.ts | addWin |

## Settings keys (key/value rows in the `settings` table)

`theme` ('system' | 'light' | 'dark'), `textScale` (1 | 1.15 | 1.3 | 1.5),
`extraSpacing`, `reduceMotion`, `vibration`, `communicationMode`
('gentle' | 'direct' | 'literal'), `aiEnabled`, `readAloudRate`
(0.8 | 1 | 1.2), `readAloudVoice` (voice name or '', added after Phase 10,
D57), `demoMode`, `onboarded`, `trustedContacts`, `campusSupport`, `name`,
`demoClock`, `dayModeBannerDismissedFor`.

## Copy (`src/copy/en.ts`)

Top-level groups: `global`, `quadrants`, `shell`, `stateChip`, `checkin`,
`moodMap`, `today`, `eventForm`, `dayMode`, `tasks`, `taskForm`, `unstick`,
`focus`, `bridge`, `toolkit`, `tools`, `patterns`, `proof`, `support`,
`settings`, `onboarding`, `readAloud`. Helpers: `fill`, `byMode`,
`quadrantName`, `quadrantLabel`. No key may be renamed or deleted in v2.

## Dexie (`src/lib/db.ts`, database name `tide`)

Version 1 only:

| Table | Indexes |
|---|---|
| checkins | `id, ts, quadrant` |
| tasks | `id, status, type, due, order` |
| events | `id, start, kind` |
| focusBlocks | `id, ts, taskId` |
| strategyUses | `id, ts, strategyId, context` |
| transitions | `id, ts, toEventId` |
| wins | `id, ts` |
| rewards | `id` |
| dismissedPatterns | `key` |
| dayPlans | `date` |
| settings | `key` |

## AI routes

`label`, `unstick`, `daymode`, `bridge`, `narrate`: zod in and out, semantic
checks, one retry, fallbacks in `src/lib/ai/fallbacks.ts`, prompts in
`/prompts/00–05`, client entry `runAi` / `useAi`, demo answers in
`src/data/demo/cachedResponses.ts`.

## Pattern engine

Rules: `strategyBeforeTask` (A), `hardTransition` (B), `stateTaskStart` (C),
`strategyEffect` (D). n ≥ 3, confidence at 3/5/8/12. Planted demo keys:
`strategyBeforeTask:m-walk-3:writing`, `hardTransition:lab->class`,
`strategyEffect:c-box`.

## Tests (the v1 regression suite, `npm run test:v1`)

```
src/app/api/ai/routes.test.ts
src/app/prompts-doc/page.test.tsx
src/components/bridge/BridgeFlow.test.tsx
src/components/checkin/CheckInSheet.test.tsx
src/components/focus/FocusScreen.test.tsx
src/components/patterns/PatternsFlow.test.tsx
src/components/safety/CrisisScreen.test.tsx
src/components/settings/Settings.test.tsx
src/components/settings/VoicePicker.test.tsx
src/components/tasks/TasksFlow.test.tsx
src/components/today/TodayFlow.test.tsx
src/components/toolkit/Toolkit.test.tsx
src/data/demo/cachedResponses.test.ts
src/data/demo/seed.test.ts
src/data/sudoku.test.ts
src/lib/ai/client.test.ts
src/lib/ai/fallbacks.test.ts
src/lib/ai/runAi.test.ts
src/lib/ai/schemas.test.ts
src/lib/bridge.test.ts
src/lib/clock.test.ts
src/lib/daymode.test.ts
src/lib/patterns/__tests__/engine.test.ts
src/lib/quadrant.test.ts
src/lib/repo/repo.test.ts
src/lib/safety/detect.test.ts
src/lib/speech.test.ts
src/lib/spokenNumbers.test.ts
src/lib/strategyRank.test.ts
src/lib/time.test.ts
src/lib/voices.test.ts
src/test/demoScript.test.tsx
src/test/guards.test.ts
```

Guards: `Date.now(` only in `lib/clock.ts`; no raw hex in `src/components/`;
any React duplicate-key warning fails a test (`src/test/setup.ts`).

## `data-*` attributes

Only those generated by shadcn/Radix (`data-slot`, `data-variant`,
`data-size`, `data-inset`). There are no `data-demo-id` attributes yet.

## Frozen: dictation

Do not edit these. `src/test/frozen-dictation.test.ts` compares their
SHA-256 hashes with the values recorded here in V0.

| File | What is frozen |
|---|---|
| `src/lib/speech.ts` | `interface RecognitionLike`, `type RecognitionCtor`, `function recognitionCtor`, `function isDictationSupported`, `function startDictation` (the read-aloud code in the same file is left in place and no longer edited) |
| `src/components/ui/DictateButton.tsx` | The whole file |
| `src/copy/en.ts` | `global.dictate` ("Dictate"), `global.listening` ("Listening… tap to stop") |

Callers (may be restyled around the button, never changed inside it):
`checkin/StepWhat.tsx`, `bridge/BridgeClose.tsx`, `proof/AddWinForm.tsx`,
`toolkit/tools/BrainDump.tsx`.
