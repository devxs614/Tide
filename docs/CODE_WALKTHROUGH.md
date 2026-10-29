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
*(Phase 3)*

## Today and Day Mode
*(Phase 4)*

## Toolkit
*(Phase 5)*

## Bridge
*(Phase 6)*

## Patterns and Proof log
*(Phase 7)*

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
