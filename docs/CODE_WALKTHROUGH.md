# Code walkthrough

A guide so anyone on the team can explain Tide's code to a reviewer in a few
minutes. It is organized by module, in the order of Tide's loop. I write it
as I build each part. — Claude Code

---

## Shell

**What it does for Maya.** Every tab screen sits in the same phone-sized
frame: a title bar with a menu, the content, the round "Check in" button and
four tabs. Checking in is always one tap away, from anywhere.

**Files**
- `src/app/layout.tsx` — root HTML: font, `lang="en"`, and a tiny inline
  script that applies saved theme and text size before the first paint.
- `src/app/providers.tsx` — settings, motion preference, sheet state,
  tooltips and toasts, wrapped around every page.
- `src/app/(app)/layout.tsx` — wraps the tab routes in `AppShell`.
- `src/components/shell/AppShell.tsx` — top bar, content, Check in, tabs, in
  the keyboard order the spec asks for.
- `src/components/shell/PhoneFrame.tsx` — the 430px column (1100px for the
  task board on big screens).
- `src/components/shell/TopBar.tsx` — title, "Demo data" badge, menu.
- `src/components/shell/TabBar.tsx` — four links with icon and word.
- `src/components/shell/CheckInFab.tsx` — the Check in button.

**Data flow.** Reads settings (for the demo badge). Opens the check-in sheet
through `useCheckInSheet()` from `src/lib/ui.tsx`.

**Decisions worth defending**
- The DOM order is top bar → content → Check in → tabs, so keyboard users
  reach the content first and the navigation last, exactly like the spec.
- The theme script runs before React loads. Without it, someone who chose
  dark mode and 150% text would see a white page at normal size flash first.

**Likely reviewer questions**
- *Why is the app phone-width on a laptop?* It's designed mobile-first; on a
  projector the centered column keeps the demo readable.
- *Where does the screen title come from?* `titleFor()` in `AppShell`, from
  the copy catalog.
- *Why is "Check in" a button and not a tab?* It's an action that opens a
  sheet over whatever screen you're on, not a place.

---

## Data

**What it does for Maya.** Everything she records stays on her device, in
IndexedDB, and the screens update by themselves when something changes.

**Files**
- `src/lib/types.ts` — the record shapes (CheckIn, Task, FocusBlock…).
- `src/lib/db.ts` — the Dexie database and its tables.
- `src/lib/repo/*.ts` — the only code that writes: `createCheckIn`,
  `moveTask`, `saveFocusBlock`, `recordStrategyUse`, `rateTransition`,
  `applyDayPlan`, settings, export and delete.
- `src/lib/wins.ts` — the wording of proof-log wins.
- `src/lib/clock.ts` — `now()`, with the demo clock.
- `src/lib/time.ts` — "3:40 pm", "Due tomorrow", "in 70 min".
- `src/lib/quadrant.ts` — energy and pleasantness → Surge, Swell, Ebb, Still.
- `src/lib/settings.tsx` — the settings provider and `useReducedMotionPref()`.
- `src/lib/strategyRank.ts` — which strategies to suggest first.
- `src/copy/en.ts` — every string on screen.
- `src/data/*` — emotions, strategies, task types, crisis lines.

**Data flow.** Components read with `useLiveQuery(() => db.tasks...)` and
call repo functions to write. Repo functions also apply side effects (a
finished task adds a win) inside one Dexie transaction.

**Decisions worth defending**
- I put all writes behind `src/lib/repo/*` so the rules ("finishing a task
  adds a win", "safety check-ins never store text") live in one tested place
  instead of being repeated in components.
- The quadrant is always computed in `createCheckIn`, never passed in, so a
  saved check-in can't contradict its own numbers.
- `now()` is the only clock. A guard test fails the build if `Date.now(`
  appears anywhere else in `src/`, which keeps demo mode trustworthy.

**Likely reviewer questions**
- *Is anything stored on a server?* No. IndexedDB only. The AI routes relay
  minimal text and store nothing.
- *What happens if the schema changes?* A new Dexie `version()` with an
  upgrade function; version 1 is never edited.
- *Why Dexie and not localStorage?* Real queries and indexes (by time, by
  status), transactions, and live queries that re-render the UI.

---

## AI layer

**What it does for Maya.** It turns her messy words into three emotion words
to choose from, suggests one small first step for a stuck task, proposes a
lighter day, prepares a switch between activities, and puts her patterns
into plain sentences. If anything goes wrong, a built-in answer appears
instead, so she is never blocked.

**Files**
- `prompts/*.md` — the five system prompts plus the shared preamble. One copy
  each; the server reads them and the AI Prompts PDF prints them.
- `src/lib/ai/schemas.ts` — zod schemas for every route's input and output,
  plus `check*` functions for what zod can't see (made-up ids, a task left
  out of a plan, numbers that aren't in the facts).
- `src/lib/ai/prompts.ts` — reads the prompt files on the server.
- `src/lib/ai/client.ts` — `callJson()`: one request, parse, validate, one
  retry with the error, typed `AiError`s. Server only.
- `src/lib/ai/route.ts` — the shared route body: rate limit → validate →
  call → check → envelope, and the metadata-only log line.
- `src/app/api/ai/{label,unstick,daymode,bridge,narrate}/route.ts` — each
  route is ~20 lines of configuration.
- `src/app/api/config/route.ts` — timeouts and "is a key configured?" for the
  browser (never the key).
- `src/lib/ai/rateLimit.ts` — per-IP sliding window.
- `src/lib/ai/fallbacks.ts`, `unstickTable.ts` — the deterministic answers,
  including all 36 Unstick steps.
- `src/lib/ai/runAi.ts`, `useAi.ts`, `types.ts` — the browser side: safety
  pre-check, AI-off, demo cache race, timeout, validation, fallback.
- `src/data/demo/cachedResponses.ts` — saved answers for the scripted demo.

**Data flow.** A screen calls `run(input)` from `useAi('route')`. The input
holds only what the schema allows (no names, no contacts). The server adds
the system prompt, calls Claude, validates, and returns
`{ ok, data, source }`. The browser validates again and falls back on any
problem. Nothing is stored on the server.

**Decisions worth defending**
- *The code calculates; the AI words things.* Patterns, budgets and rankings
  are computed by code; the AI only phrases them, and a regex check swaps any
  card that mentions a number not in its facts.
- *Validation on both sides.* The browser runs the same zod schemas and
  checks, so even a stale deployment can't push a malformed answer to Maya.
- *Thinking off, low effort, no temperature* (D11): these are short JSON
  answers with an 8-second budget; current models reject sampling settings.

**Likely reviewer questions**
- *What if the model invents an emotion that isn't in the list?* The check
  catches it, the model gets one retry with the reason, and if it does it
  again the built-in lexicon answers instead.
- *What does the server log?* One line per call: route, status, latency and
  whether the browser will fall back. Never the request or the answer.
- *Does the app work without an API key?* Yes. Every route returns
  `missing_key`, and every screen uses its fallback.

## Safety

**What it does for Maya.** If her words sound like a crisis, Tide stops
coaching, saves the check-in without her words, and shows crisis lines,
the people she trusts and her campus support, with a quiet way back.

**Files**
- `src/lib/safety/keywords.ts` — English and Spanish phrases, in one file
  for the team and their partner to review.
- `src/lib/safety/detect.ts` — normalizes text (case, accents, apostrophes,
  punctuation) and matches whole phrases.
- `src/components/safety/CrisisScreen.tsx` — the still crisis version.
- `src/components/safety/SupportScreen.tsx` — the everyday "Talk to a
  person" screen.
- `src/components/safety/CrisisLines.tsx`, `ContactList.tsx`,
  `TalkToAPersonButton.tsx` — the pieces they share.
- `src/data/resources.ts` — crisis numbers (to be verified by the team).
- `src/app/(app)/support/page.tsx` — `/support` and `/support?crisis=1`.

**Data flow.** `runAi` checks free text with `detectCrisis()` before any
network call; the label route's `safetyFlag` is treated the same way. The
caller then saves the check-in through `createCheckIn`, which drops the text
when `safetyTriggered` is set, and navigates to `/support?crisis=1`.

**Decisions worth defending**
- Whole-phrase matching with idioms excluded (D17): "this deadline is killing
  me" doesn't trigger it; "kill myself" does.
- The detector runs in the browser, so it works offline and with AI off.
- The crisis screen has no animation and no AI: calm and predictable.

**Likely reviewer questions**
- *Isn't keyword matching crude?* It's the first of two layers; the model's
  `safetyFlag` is the second. A false alarm shows a kind screen with a "take
  me back" button, which is the safer mistake.
- *Does Tide call anyone?* Never. Buttons open the phone's own dialer or
  messages app; the person decides.
- *Is the crisis text stored?* No. The check-in is saved with
  `safetyTriggered: true` and no text, and patterns ignore it.

## Check-in

**What it does for Maya.** She writes (or says) whatever is going on, and
Tide offers three feeling words with plain definitions; she picks up to two
or none, places herself on the mood map, optionally says what's behind it,
and picks what she needs next. If words won't come, she starts from her body.

**Files**
- `src/components/checkin/CheckInSheet.tsx` — the sheet: runs the steps,
  calls the label route, handles the crisis path, saves the check-in, and
  hands off to Day Mode, the toolkit or Support.
- `src/components/checkin/checkInState.ts` — the reducer for all steps, the
  dot-position rule and the body-cue format.
- `StepWhat.tsx`, `BodyPath.tsx`, `StepHearing.tsx`, `AllWords.tsx`,
  `StepBehind.tsx`, `StepNeed.tsx` — one file per step.
- `EmotionCandidateCard.tsx` — a word, its definition, a round check, read
  aloud.
- `MoodMap.tsx` — drag, tap, arrow keys, spoken value, slider alternative.
- `StepHeader.tsx`, `ToggleChip.tsx`, `LeaveConfirm.tsx` — small shared parts.
- `src/components/ui/StateChip.tsx`, `ReadAloudButton.tsx`,
  `DictateButton.tsx`, `Dots.tsx` — UI pieces used across the app.
- `src/lib/speech.ts` — dictation and read aloud (Web Speech API).
- `src/components/today/StateCard.tsx` — shows today's check-in on Today.

**Data flow.** Words or body cues → `useAi('label')` → three candidates →
Maya's choices in the reducer → `createCheckIn()` (which computes the
quadrant) → the need decides where she goes next. Nothing is saved before
step 4, and a crisis phrase saves a check-in with no text.

**Decisions worth defending**
- The AI never preselects a word; the dot resting on the first suggestion is
  only a starting position, and Next stays disabled until she acts (D21).
- The mood map is fully usable without a mouse (D22), and the slider
  alternative exists for anyone who finds dragging awkward.
- Typed words are never lost by accident: Escape asks first.

**Likely reviewer questions**
- *What if none of the words fit?* "None of these" opens all 48 words by
  state, and she can add her own word; the map decides its state.
- *How is the state decided?* By the map position, through `toQuadrant()`,
  computed when the check-in is saved.
- *Can it be done without typing?* Yes: the body path, or "Skip to the map".

## Tasks, Unstick and Focus

**What it does for Maya.** Her tasks sit on a four-column board where
"Stuck" is a normal column. Moving a task to Stuck asks what makes it hard
and offers one small, physical first step that fits how she feels, plus a
strategy that helped her before this kind of task, when her data says so.
Then a short focus block with a timer, and "How did it go?" at the end.

**Files**
- `src/components/tasks/TasksScreen.tsx`, `TaskBoard.tsx`, `StateColumn.tsx`
  — the board: segmented control on phones, four columns on wide screens,
  dnd-kit with keyboard support.
- `TaskCard.tsx`, `MoveToMenu.tsx`, `useTaskMoves.ts` — a card, the non-drag
  way to move it, and the side effects of a move (toast, open Unstick).
- `TaskForm.tsx` — add a task; "Break it down for me".
- `UnstickSheet.tsx`, `UnstickReasons.tsx`, `UnstickStep.tsx`,
  `LeftOffNote.tsx`, `unstickCache.ts` — the two Unstick steps.
- `src/components/focus/FocusScreen.tsx`, `useFocusTimer.ts`,
  `WaterFill.tsx`, `FocusOutcome.tsx` — the focus block.
- `src/app/focus/[taskId]/page.tsx` — the full-screen route.
- `src/lib/patterns/rules/strategyBeforeTask.ts` — "walk before writing"
  groups, shared with Patterns.
- `src/lib/latestState.ts` — the check-in from the last six hours.

**Data flow.** The board reads `db.tasks` live and writes through
`moveTask()`. Unstick reads the task, the recent check-in and the pattern
input, calls `useAi('unstick')`, then writes `firstStep`, `stuckReason` and
the status. Focus writes one FocusBlock through `saveFocusBlock()`, which also
adds "Got unstuck" when it applies.

**Decisions worth defending**
- Every move has a non-drag path (the menu), and drag has keyboard support.
- The timer computes from timestamps, so it stays right after the phone
  sleeps (D29).
- The "helped you k of n times" line comes from the same rule as the
  Patterns card, so the two can't disagree (D24).

**Likely reviewer questions**
- *What if the AI suggests a strategy that never helped?* The server and the
  browser both reject any strategy id not in `helpfulStrategies`, which only
  includes strategies seen at least 3 times before that task type.
- *Does the step really change with the state?* Yes, the prompt is told to,
  and the fallback adds a state-specific line and focus length (D16).
- *Is a task ever deleted?* No. Done tasks can be moved back; wins stay.

## Today and Day Mode

**What it does for Maya.** Today greets her, shows how she checked in, and on
a low day reminds her of something she managed on a day that felt the same.
If she's low, it offers a lighter plan; she picks Gentle or Minimum, sees
which tasks stay and which move to tomorrow, flips any of them, and can undo.
Below that, what's next and the rest of her day as a simple line.

**Files**
- `src/components/today/TodayScreen.tsx`, `useTodayData.ts` — the screen and
  its one live query.
- `TodayHeader.tsx`, `StateCard.tsx`, `WinCard.tsx`, `DayModeBanner.tsx`,
  `NextTransitionCard.tsx`, `TideLine.tsx`, `AddEventSheet.tsx` — its parts.
- `DayModeSheet.tsx`, `DayModeProposal.tsx` — the lighter-day sheet.
- `src/lib/daymode.ts` — banner rules, budgets, today's tasks, the route input.
- `src/lib/repo/dayPlans.ts` — apply, undo, bring back.
- `src/lib/useNow.ts` — redraws on a schedule, reads `now()` every render.

**Data flow.** Today reads tasks, today's events, today's DayPlan and the
latest check-in live. The banner is pure logic (`shouldShowBanner`). The sheet
sends minimal task data to `useAi('daymode')`, then `applyDayPlan()` writes
the plan and the moved dates in one transaction and returns a snapshot that
`undoDayPlan()` restores.

**Decisions worth defending**
- A plan never deletes: moved tasks keep their place on the board and just
  carry "Moved to tomorrow".
- The server rejects any plan that leaves a task out or puts one in twice,
  and keeps the budget honest (budget + 1 at most).
- Undo restores the exact previous fields and the previous plan, not a guess.

**Likely reviewer questions**
- *Who decides what moves?* The AI proposes, the fallback rule proposes the
  same way with AI off, and Maya decides with the toggles.
- *What if she says "Not now"?* The banner hides until her next check-in.
- *How does the screen know what time it is in the demo?* Everything reads
  `now()`, which follows the demo clock.

## Toolkit

**What it does for Maya.** Short strategies for the moments before a task
or a switch, sorted by what has worked for her and what suits how she feels
now. Each one runs with an interactive tool and ends with one question:
better, same or worse.

**Files**
- `src/components/toolkit/ToolkitScreen.tsx` — header with the current state,
  "Show all", "Works for you", family tabs.
- `StrategyCard.tsx`, `StrategyMeta.tsx`, `familyIcons.ts` — the list items.
- `StrategyRunner.tsx`, `ReCheck.tsx`, `ToolArea.tsx` — the runner, the
  question, and the tool picker (sudoku and doodle are lazy-loaded).
- `tools/*` — BoxBreathing, Grounding54321, Sudoku4x4, DoodleCanvas,
  WalkTimer, BrainDump, MessageTemplate, StepsTimer, plus TimerControls and
  SoftTimer.
- `src/data/strategies.ts`, `src/data/sudoku.ts` — the library and puzzles.
- `src/lib/strategyRank.ts`, `src/lib/useCountdown.ts` — ranking and timers.
- `src/app/(app)/toolkit/page.tsx`, `toolkit/[id]/page.tsx` — routes.

**Data flow.** The list reads the recent check-in and all StrategyUses to
rank. The runner writes one StrategyUse through `recordStrategyUse()` (with
the context and the task or transition id), which adds a win for "better",
then returns to `/toolkit`, `/tasks?unstick=<task>` or `/?bridge=<id>`.

**Decisions worth defending**
- Ranking uses Laplace smoothing, so one lucky try doesn't jump to the top,
  and anything that made her feel worse twice in four weeks sinks (9.4).
- Timers measure from timestamps and never move on by themselves.
- The breathing square announces phases, not seconds; with reduced motion
  the dot is still and only the words change.

**Likely reviewer questions**
- *Why does a skipped re-check still count?* The "walk before writing"
  pattern only needs to know the walk happened (D34).
- *Is anything typed in a tool saved?* Only brain-dump lines Maya chooses to
  turn into tasks, after the safety check. Doodles and grounding notes are
  never saved.
- *Does Tide send the message for her?* No; she copies it and sends it
  herself.

## Bridge

**What it does for Maya.** About 15 minutes before the next event, a card
appears: "Chemistry lab → Calculus · leave in 9 min", with "has felt hard 3 of
the last 4 times" when her data shows it. "Get ready" opens three steps:
write where she's leaving off, do one short strategy, check what to bring.
Ten minutes into the next event, Today asks how the switch went.

**Files**
- `src/lib/bridge.ts` — when a Bridge appears, what it's "from", which switch
  waits for a rating.
- `src/lib/patterns/rules/hardTransition.ts` — the hard-switch rule, shared
  with Patterns.
- `src/components/bridge/BridgeCard.tsx`, `BridgeBanner.tsx` — the card on
  Today and the banner on other tabs.
- `BridgeSheet.tsx`, `BridgeSteps.tsx`, `BridgeClose.tsx`, `BridgeShift.tsx`,
  `BridgePrep.tsx` — the sheet and its three steps.
- `TransitionRating.tsx` — "How was the switch?"
- `useUpcomingBridge.ts`, `bridgeDrafts.ts` — the live lookup and the
  in-memory draft.

**Data flow.** The card reads events, in-progress tasks and transitions every
30 seconds. The sheet asks `useAi('bridge')` for the parking question, one
strategy among the top three short ones, and prep steps. "Save note" writes
`task.parkingNote` (after the safety check). "Start" opens the runner with
`context=bridge&ref=<draft id>`. "Done, I'm going" writes the Transition with
the note and the strategy use. The rating writes `rating` and maybe a win.

**Decisions worth defending**
- The pattern line uses the same rule and threshold as the Patterns card, so
  the numbers can't differ (D40).
- "From" includes an event that just ended, which is how switches actually
  happen (D38).
- The parking note shows up first the next time she opens that task, in
  Unstick and in Focus.

**Likely reviewer questions**
- *Does Tide send notifications?* No; that's out of scope for the MVP. The
  card and banner appear inside the app.
- *What if she ignores the Bridge?* Nothing happens; there is no rating
  prompt for a switch she didn't bridge.
- *Can the AI pick any strategy?* Only one of the candidates the app sent,
  all three minutes or less.

## Patterns and Proof log

**What it does for Maya.** "What works for you" shows a calendar of her
check-ins, a few plain sentences about what tends to help her ("a 3-minute
walk before writing tasks", 4 of 5 times), the moments each one comes from,
and a way to say "not true for me". The proof log keeps the things she did,
by day, with no counts.

**Files**
- `src/lib/patterns/engine.ts` — runs the rules, drops dismissed keys, sorts,
  caps at six.
- `src/lib/patterns/rules/strategyBeforeTask.ts`, `hardTransition.ts`,
  `stateTaskStart.ts`, `strategyEffect.ts` — one file per rule (12.4 A–D).
- `src/lib/patterns/confidence.ts`, `data.ts`, `types.ts` — confidence from
  n, the window, loading records.
- `src/lib/patterns/__tests__/*` — the 12.6 tests and their fixtures.
- `src/components/patterns/PatternsScreen.tsx`, `PeriodDots.tsx`,
  `PatternCard.tsx`, `WhyPanel.tsx`, `NotTrueDialog.tsx`, `TopStrategies.tsx`,
  `TransitionsSummary.tsx`, `useNarration.ts` — the screen.
- `src/components/proof/*` — the proof log, adding a win, rewards.

**Data flow.** `loadPatternInput()` reads all tables (dropping safety
check-ins) → `computePatterns()` → each result's `facts` go to
`useAi('narrate')` → cards show the AI's words next to the engine's numbers.
"Not true for me" writes a DismissedPattern; the engine skips that key from
then on.

**Decisions worth defending**
- I split the engine into one file per rule so each rule can be tested on its
  own, and both Unstick and the Bridge read the same rule code as this screen.
- A pattern needs at least 3 observations, always shows "k of n", and the
  wording says "tends to" and "in your data", never "causes".
- The proof log never counts or compares; wins are only ever added.

**Likely reviewer questions**
- *Does the AI see Maya's history?* No. It sees only computed facts like
  `{ strategyName, taskType, k: 4, n: 5, baselinePct: 25 }`.
- *What stops the AI from inventing a statistic?* Any number in its text must
  appear in the facts, or the card is replaced by the template (and the
  numbers shown come from the engine anyway).
- *What if a pattern is a coincidence?* "Not true for me" hides it for good,
  with an optional reason kept on the device.

## Settings, Onboarding and Support
*(Phase 8)*

## Demo mode
*(Phase 8)*

## How to answer "how does the AI work?" in 60 seconds

Tide uses Claude in five small, server-side routes, and only where a fixed
rule can't do the job: reading free language into emotion words, adapting a
first step to a specific task and feeling, reshaping a day, preparing a
switch, and wording patterns. Each route gets the minimum input (no names),
a system prompt we publish in the AI Prompts PDF, and must answer with JSON
that we validate twice, once on the server and once in the browser. If the
answer is invalid, the model gets one retry; if it fails again, or the
network is down, or AI is switched off, a deterministic fallback answers
instantly. The AI never computes statistics: the pattern engine is plain
code, and the AI only puts its numbers into words, with a check that blocks
any number that isn't in the data. Before any call, a safety check runs in
the browser; crisis language stops the AI completely and shows human help.
(Finalized in Phase 9.)
