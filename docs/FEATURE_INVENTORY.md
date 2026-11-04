# Tide feature inventory (v2.2 bug sweep)

I'm Claude Code. Before the sweep changed any code, I listed every feature
and flow a person can see in Tide v2.1.0 (tag `v2.1-baseline`), grouped by
screen, from the four specs, `docs/V1_INVENTORY.md` and the code. Each line
says how it's verified. The "S6" box is ticked at the end of the sweep, to
prove nothing disappeared or stopped working.

How it's verified, in short:
- **test**: an automated test file under `src/` (named);
- **tour**: the full demo tour or the pitch cut (`npm run tour:check`);
- **audit**: the layout audit (`npm run audit:layout`);
- **visual**: the visual baseline (`scripts/visual-baseline.ts`);
- **team**: a manual check in `docs/TEAM_TODO.md` (real devices, sound).

Baseline at `v2.1-baseline` (2026-11-03): lint and typecheck clean, 568
tests in 99 files, v1 suite 164 tests in 33 files, build clean, `/` first
load 299.5 KB gzipped.

## App shell and navigation
- [ ] Five tabs (Today, Tasks, Toolkit, Patterns, Shore) with the active state — test `shell/quality.test.tsx`, tour, visual
- [ ] TopBar title, companion head, Menu with its items — test `shell/quality.test.tsx`, visual
- [ ] Check-in button (FAB) on every app screen — test `checkin/CheckInSheet.test.tsx`, tour
- [ ] Every route loads by URL; friendly 404; per-route error boundary with "Try again" — test `shell/ErrorContent.test.tsx`, audit
- [ ] Onboarding redirect only for new users — test `demo/__tests__/demo.test.tsx`, `onboarding/Onboarding.test.tsx`
- [ ] Splash, once per session, skipped at motion Off — test `shell/quality.test.tsx`
- [ ] Offline pill — test `shell/quality.test.tsx`
- [ ] Keyboard shortcuts (C, T, F, M, ?), never while typing — test `shell/quality.test.tsx`
- [ ] Browser and Android Back close the top sheet (v2.1 F-08) — test `lib/backToClose.test.tsx`, `test/backAndCancel.test.tsx`
- [ ] Desktop phone frame (`PhoneFrame`) and the wide layouts for Tasks and Calendar — audit, visual
- [ ] Install prompt (PWA) — team

## Onboarding (`/onboarding`)
- [ ] Every step in order, Back, resume after reload, "Skip setup" defaults — test `onboarding/Onboarding.test.tsx`
- [ ] Companion choice (six species or none), name, colors — test `onboarding/Onboarding.test.tsx`
- [ ] Trusted contacts step — test `onboarding/Onboarding.test.tsx`
- [ ] First check-in coach marks, the welcome shore — test `onboarding/Onboarding.test.tsx`
- [ ] What's new, once for existing users, with the look carousel — test `looks/Looks.test.tsx`, `onboarding/Onboarding.test.tsx`

## Check-in (sheet)
- [ ] Words path: text, Next at 3+ characters, AI or fallback candidates, max two, "None of these" and a custom word — test `checkin/CheckInSheet.test.tsx`, `lib/ai/fallbacks.test.ts`
- [ ] Dictation (frozen; verify only) — test `test/frozen-dictation.test.ts`, `lib/speech.test.ts`
- [ ] Mood map drag and keyboard, sliders mode — test `checkin/CheckInSheet.test.tsx`, `test/a11y.test.tsx`
- [ ] Causes step, four needs and their routing, the toast, the companion reaction — test `checkin/CheckInSheet.test.tsx`, `checkin/CheckInCompanion.test.tsx`
- [ ] Body path (wordless) — test `checkin/CheckInSheet.test.tsx`
- [ ] Simple vocabulary (16 words) — test `checkin/CheckInSheet.test.tsx`
- [ ] Back keeps words and picks, no second AI call; Close asks first — test `test/backAndCancel.test.tsx`
- [ ] Safety path (English and Spanish): no AI, nothing saved, crisis screen — test `lib/safety/detect.test.ts`, `safety/CrisisScreen.test.tsx`

## Today (`/`)
- [ ] Greeting, state card, win card, bottle card, morning card, evening card — test `today/TodayFlow.test.tsx`, `shore/Shore.test.tsx`, `wrap/Wrap.test.tsx`
- [ ] Quick actions — test `today/QuickActions.test.tsx`
- [ ] Tide Line with the Now marker, events, moved and snoozed groups, "Next" card — test `today/TodayFlow.test.tsx`
- [ ] Shore preview strip with its "New" pill and chosen sky — test `shore/Shore.test.tsx`
- [ ] Calendar link in the header — test `calendar/Calendar.test.tsx`, tour
- [ ] Ambience mini player — test `ambience/AmbienceFlow.test.tsx`
- [ ] Empty states — test `today/TodayFlow.test.tsx`

## Day Mode and Bridge
- [ ] Day Mode proposal (AI or fallback), budgets, toggles, energy total, Undo restores exactly — test `lib/daymode.test.ts`, `today/TodayFlow.test.tsx`, tour
- [ ] Bridge at the lead time, parking note, strategy pick, prep steps, rating after the event, wins; never for deleted events — test `lib/bridge.test.ts`, `bridge/BridgeFlow.test.tsx`, tour

## Tasks (`/tasks`, `/tasks/completed`)
- [ ] Board with Not started, In progress, Stuck, Done; mobile segmented view; wide layout on desktop — test `tasks/TasksFlow.test.tsx`, audit, visual
- [ ] Add task (title, type, energy, due, first step, "Break it down for me") — test `tasks/TasksFlow.test.tsx`
- [ ] Move by drag (mouse, touch, keyboard) and by "Move to…" — test `tasks/TasksFlow.test.tsx`
- [ ] Task detail sheet, edit, delete with Undo and optional history removal — test `tasks/TaskEditFlow.test.tsx`, `lib/repo/taskEdits.test.ts`, tour
- [ ] Done shows the last 24 hours (adjustable), "Clear done now", Completed archive and its actions — test `tasks/CompletedFlow.test.tsx`, `lib/repo/doneVisibility.test.ts`
- [ ] Someday, snooze, the anchor badge — test `tasks/TasksFlow.test.tsx`, `lib/repo/repo.test.ts`
- [ ] Unstick: each reason, "Different step", strategy-first suggestion, parking note — test `tasks/TasksFlow.test.tsx`, `lib/strategyRank.test.ts`, tour

## Focus (`/focus/[taskId]`)
- [ ] Duration rule, start, pause, resume, end early, End, the outcome sheet — test `focus/FocusScreen.test.tsx`, tour
- [ ] End alert: sound, glow, tab title and icon, heads-up, notification — test `focus/FocusAlert.test.tsx`, `lib/focus/alertEngine.test.ts`, `lib/focus/alertPlan.test.ts`; team (hearing it)
- [ ] Refocus nudges with caps, break, welcome back — test `focus/Nudges.test.tsx`, `lib/focus/nudgePlan.test.ts`
- [ ] Sounds panel (nine sounds), "until focus ends" — test `ambience/AmbienceFlow.test.tsx`, `lib/sound/ambiencePlayer.test.ts`; team (listening)
- [ ] Wake lock, title countdown — test `focus/FocusScreen.test.tsx`
- [ ] Companion working beside the timer, its lines — test `focus/FocusScreen.test.tsx`, visual

## Toolkit (`/toolkit`, `/toolkit/[id]`)
- [ ] Strategy list by family, search, re-check after a tool — test `toolkit/Toolkit.test.tsx`
- [ ] Tools: walk and steps timers, soft timers, box breathing, 5-4-3-2-1, long exhale, doodle, three words, brain dump ("Turn lines into tasks", safety check), message templates (copy only), Sudoku (five puzzles), count back (2–7, two ways), spot blue — test `toolkit/Toolkit.test.tsx`, `toolkit/tools/CountBack.test.tsx`, `data/sudoku.test.ts`
- [ ] Cancel and End early; cancelled uses ignored by patterns — test `test/backAndCancel.test.tsx`
- [ ] Ambience in Toolkit and the mini player — test `ambience/AmbienceFlow.test.tsx`

## Patterns (`/patterns`) and Proof log (`/proof`)
- [ ] Pattern cards from the engine, narration (AI or cached), "Why am I seeing this?", "Not true for me", "Show dismissed again" — test `patterns/PatternsFlow.test.tsx`, `lib/patterns/__tests__/engine.test.ts`
- [ ] Period toggle and dots — test `patterns/PatternsFlow.test.tsx`
- [ ] Seed's planted pattern keys — test `data/demo/seed.test.ts`, `data/demo/seedV2.test.ts`
- [ ] Proof log: wins, add your own — test `lib/repo/repo.test.ts`

## Shore (`/shore`, `/shore/collection`)
- [ ] Items per win kind, placement, arrivals, "New", list view — test `shore/Shore.test.tsx`, `lib/shore/__tests__/shore.test.ts`
- [ ] Item details sheet; Collection with "Not found yet" — test `shore/Shore.test.tsx`
- [ ] Bottles: write (safety check), eligibility, open, keep, release — test `shore/Shore.test.tsx`
- [ ] Time of day: auto and the five choices, the companion's pose — test `lib/shore/__tests__/shore.test.ts`, tour
- [ ] Save as image (with or without name) — test `lib/shore/__tests__/shore.test.ts`; team (open the file)
- [ ] Item drawings (sand dollar), Lolo's gills on the Shore — test `shore/ItemArt.test.tsx`, visual

## Close the day (`/wrap`)
- [ ] All steps, Back keeps data, Close and resume — test `wrap/Wrap.test.tsx`, `lib/wrap/__tests__/wrap.test.ts`, tour
- [ ] Tide chart and its list, loose ends with Undo, tomorrow's anchor and first step, summary (AI or fallback), goodnight, driftwood — test `wrap/Wrap.test.tsx`, `app/api/ai/wrapup/route.test.ts`

## Calendar (`/calendar`, `/calendar/[date]`)
- [ ] Month grid, week start setting, keyboard navigation, agenda list at large text — test `calendar/Calendar.test.tsx`, `lib/calendar/grid.test.ts`
- [ ] Day views (past, future; today goes to Today), add event, weekly repeats — test `calendar/Calendar.test.tsx`
- [ ] Event edit and delete with "only this / this and future / all" — test `events/EventEditFlow.test.tsx`, `lib/repo/eventEdits.test.ts`

## Companion Studio (`/companion`) and companions
- [ ] Six species, every expression, variant and accessory; "none" — test `companion/__tests__/species.test.tsx`, `lib/companion/__tests__/registry.test.ts`
- [ ] Studio: name, colors, accessory, talkativeness, placements — test `companion/studio/CompanionStudio.test.tsx`
- [ ] Speech bubbles fully readable, one at a time — test `companion/CompanionSay.test.tsx`, audit
- [ ] Never on the crisis screen — test `safety/CrisisCompanion.test.tsx`
- [ ] Celebrations matrix and caps — test `celebrate/Celebrations.test.tsx`, `lib/celebrate/__tests__/matrix.test.ts`

## Settings (`/settings`, 18 sections)
- [ ] Index, search with synonyms and deep links — test `settings/Settings2.test.tsx`
- [ ] Sections: profile, companion, appearance, motion, sound, voice, language, check-in, day, focus, toolkit, patterns, shore, privacy, people, shortcuts, demo, about — test `settings/Settings.test.tsx`, `settings/Settings2.test.tsx`, `test/auditStates.test.ts`
- [ ] Presets with the diff and Undo — test `settings/Settings2.test.tsx`
- [ ] Looks: try, next, keep, Back to my look, Surprise me — test `looks/Looks.test.tsx`, `lib/looks.test.ts`, tour
- [ ] 15 themes with readable contrast — test `lib/theme/__tests__/contrast.test.ts`, `test/guards.test.ts`
- [ ] Fonts, text size, bold, extra spacing — audit
- [ ] Motion levels — test `lib/motion/motion.test.ts`
- [ ] Voice picker and read-aloud — test `settings/VoicePicker.test.tsx`, `ui/ReadAloudButton.test.tsx`, `lib/voice/__tests__/*`
- [ ] Trusted contacts (People) and campus support — test `settings/Settings.test.tsx`
- [ ] Export and import, reset — test `lib/repo/backup.test.ts`
- [ ] Settings migration — test `lib/settings/__tests__/migrate.test.ts`

## Support and crisis (`/support`)
- [ ] Support page, crisis screen (`?crisis=1`), contacts and resources, no companion, sounds or celebrations — test `safety/CrisisScreen.test.tsx`, `safety/CrisisCompanion.test.tsx`
- [ ] Crisis preview only in the demo workspace — test `demo/__tests__/demo.test.tsx`

## Demo (`/demo`)
- [ ] Launcher: full tour, pitch cut, presenter mode, captions, narration, speed — test `demo/__tests__/demo.test.tsx`, tour
- [ ] Demo workspace never touches the main data; Leave demo — test `demo/__tests__/demo.test.tsx`
- [ ] Autoplay with cached AI answers only — test `lib/ai/demoAutoplay.test.ts`, `data/demo/cachedResponses.test.ts`, tour
- [ ] v1 pitch path — test `test/demoScript.test.tsx`

## AI layer and prompts
- [ ] Routes label, unstick, daymode, bridge, narrate, wrapup: zod in and out, semantic checks, retry, fallback — test `app/api/ai/routes.test.ts`, `lib/ai/schemas.test.ts`, `lib/ai/runAi.test.ts`, `lib/ai/client.test.ts`
- [ ] `/prompts-doc` shows every prompt — test `app/prompts-doc/page.test.tsx`
- [ ] No user text in server logs — test `app/api/ai/routes.test.ts`

## Data and storage
- [ ] Dexie v1 → v2 → v3 upgrades — test `lib/__tests__/dbUpgrade.test.ts`, `lib/__tests__/dbUpgradeV3.test.ts`
- [ ] Every write through `lib/repo`, reads with live queries — test `test/repoReads.test.ts`
- [ ] `now()` only from the clock, demo clock — test `lib/clock.test.ts`, `test/guards.test.ts`
- [ ] Copy from `src/copy`, no raw hex in components, no emojis — test `test/copyGuards.test.ts`, `test/guards.test.ts`
