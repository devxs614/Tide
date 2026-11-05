# Code guide

How we find our way around Tide's code, module by module: what each part does for the person using it, where it lives, how data moves, and one decision we'd defend in a review. For the big picture, start with [architecture.md](architecture.md).

## How the AI works in 60 seconds

Tide uses Claude in six small server routes, only where a fixed rule can't do the job: reading free language into feeling words, fitting a first step to a task and a state, reshaping a day, preparing a switch, wording patterns, and summarizing a closed day. Each route gets the minimum input (no names, no contacts), a system prompt we publish (`/prompts`, printed by `/prompts-doc`), and must answer with JSON that we validate twice, on the server and in the browser. An invalid answer gets one retry; after that, or with no network, no key or AI switched off, a deterministic fallback answers at once. The AI never computes anything: the pattern engine is plain code, and a check blocks any sentence with a number that isn't in the facts. Before any call, a safety check runs in the browser; crisis language stops the AI completely and shows people to reach.

## Where to start reading

1. `src/lib/db.ts`: the database, its tables and versions.
2. `src/lib/repo/checkins.ts`: how a check-in is saved, the shape every write follows.
3. `src/lib/ai/route.ts`: the body every AI route shares (rate limit, validation, one call, checks, envelope).
4. `src/lib/ai/runAi.ts`: the browser side (safety, AI off, demo answers, timeout, fallback).
5. `src/lib/safety/keywords.ts`: the crisis check that runs before any AI call.
6. `src/lib/patterns/engine.ts`: the rules that find what works, with "k of n".
7. `src/components/shell/AppShell.tsx`: the frame every screen lives in.
8. `src/demo/director/engine.ts`: the guided tour's state machine.

## Data and the shell

**For the user:** everything stays on their device, and screens update by themselves.
**Files:** `src/lib/types.ts`, `src/lib/db.ts`, `src/lib/repo/*`, `src/lib/clock.ts`, `src/lib/settings.tsx`, `src/components/shell/*`, `src/copy/*`.
**Flow:** components read with `useLiveQuery` and call repo functions to write; a repo function applies its side effects (a finished task adds a win) in one Dexie transaction. Every string on screen comes from `src/copy/`.
**Decision we'd defend:** `now()` in `clock.ts` is the only clock. A guard test fails if `Date.now(` appears anywhere else, which is what lets the demo land on the same Thursday afternoon on any laptop.

## AI layer

**For the user:** feeling words, first steps, lighter days, switch prep and pattern sentences, or a built-in answer when anything goes wrong.
**Files:** `prompts/*.md`, `src/lib/ai/schemas.ts`, `client.ts`, `route.ts`, `fallbacks.ts`, `unstickTable.ts`, `runAi.ts`, `useAi.ts`, `src/app/api/ai/*/route.ts`.
**Flow:** a screen calls `run(input)` from `useAi('route')`; the server adds the prompt, calls Claude, validates and returns `{ ok, data }`; the browser validates again or falls back.
**Decision we'd defend:** validation on both sides. Even a stale deployment can't push a malformed answer to the screen.

## Safety

**For the user:** if their words sound like a crisis, coaching stops, the check-in is saved without their words, and crisis lines, trusted people and campus support appear.
**Files:** `src/lib/safety/*`, `src/components/safety/*`, `src/data/resources.ts` (crisis lines).
**Flow:** the keyword check runs in the browser before free text could reach a route; the model's own flag is a second net.
**Decision we'd defend:** whole-phrase matching with idioms excluded, in English and Spanish, so "I'm dying to see it" doesn't trigger the crisis screen and real crisis language always does.

## Check-in

**For the user:** name what's going on in their own words or from their body, pick from three suggested words, place themselves on the mood map, choose what they need.
**Files:** `src/components/checkin/*`, `src/lib/checkin/*`, `src/lib/quadrant.ts`, `src/data/emotions.ts`, `src/components/shell/CheckInFab.tsx`.
**Decision we'd defend:** the quadrant is computed when the check-in is saved, never passed in, so a saved check-in can't contradict its own numbers.

## Tasks, Unstick and Focus

**For the user:** a board where Stuck is normal, one small first step, then a focus block with an end alert, optional nudges and background sounds.
**Files:** `src/components/tasks/*`, `src/components/focus/*`, `src/lib/repo/tasks.ts`, `src/lib/repo/focus.ts`, `src/lib/focus/*`, `src/lib/sound/ambiencePlayer.ts`.
**Decision we'd defend:** every drag has a non-drag way (a "Move to…" menu and a list view), so the board works with a keyboard, a screen reader or a shaky hand.

## Today, Day Modes and Calendar

**For the user:** the day as a line with "Now", a Gentle or Minimum plan on a low day, a month view.
**Files:** `src/components/today/*`, `src/lib/daymode.ts`, `src/components/calendar/*`, `src/lib/events/*`.
**Decision we'd defend:** a Day Mode plan is only a proposal; nothing moves until the person says yes, and every move can be flipped or undone.

## Bridge and Toolkit

**For the user:** help with the switch before the next class; twenty short strategies sorted by what worked.
**Files:** `src/lib/bridge.ts`, `src/components/bridge/*`, `src/components/toolkit/*`, `src/data/strategies.ts`, `src/lib/strategyRank.ts`.
**Decision we'd defend:** every strategy ends with "better, same or worse?", and that answer is the data the Patterns screen counts.

## Patterns and Proof log

**For the user:** what tends to help them, with the moments behind it; a log of things they did.
**Files:** `src/lib/patterns/*`, `src/components/patterns/*`, `src/components/proof/*`, `src/lib/wins.ts`.
**Decision we'd defend:** at least three observations, always "k of n" and a confidence level, "tends to" and never "causes", and a "Not true for me" button.

## Your Shore and Close the day

**For the user:** a beach where things they did wash up and nothing is lost; a skippable three-minute wind-down.
**Files:** `src/lib/shore/*`, `src/components/shore/*`, `src/lib/wrap/*`, `src/components/wrap/*`, `src/lib/repo/dayWraps.ts`.
**Decision we'd defend:** a collection, not a score. Nothing on the Shore can be lost, and there are no streaks anywhere in Tide.

## Companions and celebrations

**For the user:** an optional companion that reacts softly and never judges; celebrations that fit how they feel.
**Files:** `src/lib/companion/*`, `src/components/companion/*`, `src/copy/companions.ts`, `src/lib/celebrate/*`, `src/components/celebrate/*`.
**Flow:** screens emit events on a small bus; each `CompanionHost` reacts with an expression and maybe a line.
**Decision we'd defend:** events, not calls. With no companion, or on the crisis screen, nothing listens and nothing changes.

## Settings, themes, motion, sound and voice

**For the user:** fifteen themes, fonts, text up to 150%, motion levels, presets, sound off by default, read aloud and dictation.
**Files:** `src/lib/settings/*`, `src/lib/theme/*`, `src/lib/motion/*`, `src/lib/sound/*`, `src/lib/voice/*`, `src/lib/speech.ts` (dictation).
**Decision we'd defend:** every Settings page comes from one catalog, so search, presets and export can't drift from what's on screen.

## Demo

**For the user (the audience):** a guided tour on a fictional student's data that never touches anyone's own.
**Files:** `src/lib/workspace.ts`, `src/lib/repo/demo.ts`, `src/data/demo/*`, `src/demo/*`.
**Flow:** the launcher reloads into the `tide-demo` database, the seed fills it in one transaction, and the director plays a script against the real screens by their `data-demo-id`.
**Decision we'd defend:** the director is a state machine with an abortable step, so pause stops everything at once (including the demo clock) and only a person can resume it.

## Tests and tools

`npm test` runs about 660 Vitest tests in jsdom with a fake IndexedDB; `npm run test:v1` is our v1 regression suite. `scripts/layout-audit.ts` and `scripts/audit/*` check every screen at six widths and four text sizes in Chrome, `scripts/visual-baseline.ts` and `visual-compare.ts` compare screenshots, `scripts/run-tour.ts` plays the guided tour, and `scripts/measure-first-load.mjs` keeps Today's first load under 300 KB. Development-only pages (companions, celebrations, the Shore) live in `src/app/dev/` and return "not found" in production builds.
