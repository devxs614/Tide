# Tide — rules for Claude Code in this repo

Tide is a local-first web app for neurodivergent college students that
connects how they feel with what they can do next. The base specification is
`docs/TIDE_BUILD_PROMPT.md` (v1). Version 2 is specified in
`docs/TIDE_V2_UPGRADE_PROMPT.md`, which wins for v2 features; where the code
and the v1 spec disagree, trust the code and log it in DECISIONS. This page
is the short version so a resumed session behaves the same way.

## Tide v2 (branch `v2-experience`, Phases V0–V12)
- **Prime directive: add without breaking.** Every v1 behavior, route,
  setting key, copy key, table and test keeps working. Only the changes in
  v2 spec Section 3.5 may alter a v1 test, and each one is logged.
- **Dictation is frozen.** Don't touch `startDictation`,
  `isDictationSupported`, `recognitionCtor` or the recognition types in
  `src/lib/speech.ts`, `src/components/ui/DictateButton.tsx`, or the
  "Dictate"/"Listening" copy. `src/test/frozen-dictation.test.ts` enforces it.
  Treat `speech.ts` as untouchable; new read-aloud work goes in
  `src/lib/voice/`.
- Each phase also runs `npm run test:v1` (the v1 suite, listed in
  `docs/V1_INVENTORY.md`) and updates `CHANGELOG.md`.
- Motion has three levels (off, calm, lively); timings come from
  `src/lib/motion/tokens.ts`; animate only transform and opacity.
- Companions support and never judge: no sadness, guilt, "missed you" or
  streaks; never on the crisis screen; "none" is a first-class choice.
  Companion lines live in `src/copy/companions.ts`.
- First-load JS for `/` stays ≤ 300 KB gzipped
  (`node scripts/measure-first-load.mjs /` against `next start -p 3100`).
- Resume message: Appendix D.2 of the v2 spec.

## Where things stand
- Progress and the current phase: the end of `docs/AI_DEV_LOG.md` and
  `git log --oneline`.
- Decisions taken where the spec was silent: `docs/DECISIONS.md`.
- Things only humans can do: `docs/TEAM_TODO.md`.

## How to work (the phase cycle, Section 1.3)
For each phase (v1: Section 18; v2: Section 22), in order, without asking
the team to confirm:
1. Re-read the sections the phase lists. Write "Before Phase N" in the log.
2. Plan the steps.
3. Build them in order, with natural comments as you go.
4. Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:v1`,
   `npm run build`, then exercise the flow (flow tests, plus the browser when
   available).
5. Fix anything red now.
6. Write "After Phase N" in the log; update `AI_ATTRIBUTION.md`,
   `docs/DECISIONS.md`, `docs/CODE_WALKTHROUGH.md`, `docs/TEAM_TODO.md`
   (and `CHANGELOG.md` in v2).
7. Commit (`<type>(<scope>): <summary>` + a short body), using the Git
   identity configured on the machine. Per the team's instruction, commit
   messages carry no AI trailers or co-author lines; AI attribution lives in
   `AI_ATTRIBUTION.md` and the logs.
8. Continue. Stop only for the blockers in Section 1.5.

## Comment voice (Section 1.7)
Every file starts with a 2–5 line header saying what it is for and how it
fits Tide. Comments explain why, the trade-off, or the user-facing reason.
No "This function handles…", "Helper to…", "TODO: implement". No emojis.

Bad:
```ts
// Validate the output
const parsed = LabelOutput.safeParse(json);
```
Good:
```ts
// The model sometimes adds a fourth emotion or invents one that isn't in
// our list. Zod catches the shape; the check below catches made-up words.
const parsed = LabelOutput.safeParse(json);
```

## Non-negotiables (Section 2)
- No login, accounts, analytics, telemetry or third-party scripts.
- No streaks, points, lost badges, "you failed", red error states, alarms.
- No automatic sending of messages; templates are copied by the user.
- No server storage or logging of user text. Server logs: route, status,
  latency, fallback flag. Nothing else.
- No emojis in UI copy. Icons always come with a visible text label.
- No invented facts or statistics in the UI. Demo data is labeled.
- No secrets in the repo. Keys live in `.env.local` and Vercel only.
- Not a medical product: no diagnosis, no clinical labels about the user.
- The safety layer runs before any AI call on free text.

## Stack
Next.js 16 (App Router, TypeScript strict, `src/`, `@/*`), Tailwind 4
(tokens in `src/app/globals.css`, no tailwind.config), shadcn/ui on Radix,
lucide-react, framer-motion, Dexie + dexie-react-hooks, zod 4,
@anthropic-ai/sdk (server only), Vitest + Testing Library + fake-indexeddb.
Next 16 removed `next lint`; `npm run lint` runs `eslint .`.

## Code rules
- Colors: tokens only (`bg-surface`, `text-ink`, `bg-ebb-tint`…). No raw
  hex in `src/components/` (a guard test enforces this).
- Copy: every user-facing string comes from `src/copy/en.ts`. Mode variants
  use `{ gentle, direct, literal }` and `byMode()`.
- Time: `now()` from `src/lib/clock.ts` only. `Date.now(` anywhere else in
  `src/` fails the guard test.
- Data: components read with `useLiveQuery`; every write goes through
  `src/lib/repo/*`. Schema changes add a new Dexie `version()`.
- AI: server-side only in `src/app/api/ai/*`. zod on every input and output,
  semantic checks after zod, one retry, then a deterministic fallback from
  `src/lib/ai/fallbacks.ts`. The client hook is `useAi`.
- Files small (aim under ~200 lines), one component per file, plain names,
  no clever abstractions. A second-year student should follow every file.
- No `console.log` in committed code except the AI route status log.
- Accessibility: WCAG 2.2 AA, 48px targets, visible 3px focus ring, every
  drag has a non-drag alternative, `useReducedMotionPref()` for animation.

## Log-keeping duties (Section 17)
Write in the first person, plainly and honestly: what I built, how I
checked it, what broke, what I decided, what is still open.
- `docs/AI_DEV_LOG.md`: Before and After entries for every phase.
- `AI_ATTRIBUTION.md`: one row per generated file or tight folder group,
  every dependency with its license.
- `docs/DECISIONS.md`: D-numbered decisions with reason and rejected option.
- `docs/CODE_WALKTHROUGH.md`: per module, files, data flow, likely questions.
- `docs/TEAM_TODO.md`: human-only tasks, with why and by when.
- `docs/progress/YYYY-MM-DD.md`: daily report draft in the team's voice.

Refer to `docs/TIDE_BUILD_PROMPT.md` for details.
