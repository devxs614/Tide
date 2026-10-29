# Tide — AI development log

I'm Claude Code. The Tide team asked me to build their app for the North
American AI Challenge for Neurodiverse Learning 2026 from their product
specification (docs/TIDE_BUILD_PROMPT.md). The organizers allowed fully
AI-generated code, so I wrote the code, the tests and most of the
documentation. This log is my working journal: what I understood before
each part, what I built, what broke, what I decided and what's still open.
The team owns the product, the research and the pitch.

## What I understood before starting
2026-10-28, 23:18

Tide is for students like Maya: a 19-year-old first-year engineering student
with ADHD who doesn't fail at planning, she gets stuck at two moments, starting
a task and switching between activities, and her feelings decide whether she
can move. The product is one loop: name the feeling, adapt the plan, bridge
the transition, regulate, re-check, and learn what works for her. Every screen
I build has to feed or use that loop.

What matters most for the judges, as I read the spec: a live demo that cannot
fail (so every AI call has a deterministic fallback and the demo has cached
responses and its own clock), a pattern engine that is honest (k of n, n ≥ 3,
"Not true for me"), real accessibility (keyboard, reduced motion, text size,
Literal mode, read aloud), a safety layer that stops coaching on crisis
language, and a repository a student can explain line by line.

Rules I must not break: no accounts, no analytics, no server storage of user
text, no streaks or guilt, no red error states, no emojis in the UI, no
secrets in the repo, no invented facts or statistics in the app, and honest
attribution of everything I generate.

How I'll work: Phases 0 to 10 in order, each one with a "Before" entry here,
then build, run lint/typecheck/tests/build, walk the flow (tests, plus the
in-app browser where I can), fix, write the "After" entry, update the other
docs, commit and move on.

## Before Phase 0 — Foundation
2026-10-28, 23:18

This phase is invisible to Maya but everything she touches sits on it: the
calm colors and big readable type, the local database that keeps her data on
her phone, the clock that lets the demo pretend it's Thursday afternoon, and
the content lists (48 emotion words, 20 strategies, crisis resources).

It reads nothing and writes the foundations: tokens in globals.css, Dexie
tables, repo functions that every later phase writes through, a settings
provider, the copy catalog, and the app shell with four tabs and the
"Check in" button.

What "done" means for me: the app runs, the four tabs navigate, theme and
text size apply, Dexie opens, the tests for quadrant mapping, strategy
ranking and the clock pass, and the two guard tests (no `Date.now(` outside
clock.ts, no raw hex in components) pass. Every file gets a real header
comment.

What could go wrong: the installed versions are newer than what I know well.
Before writing this entry I scaffolded the project so I could read what was
actually installed: Next.js 16.4 (its bundled AGENTS.md warns that APIs have
changed), Tailwind 4 (CSS-first config, no tailwind.config file), zod 4,
Anthropic SDK 1.3, Vitest 5 and shadcn 4. I read the bundled Next docs for
route handlers, Cache Components and the removal of `next lint`, and the SDK
types for `messages.create`. I'll record every place where the spec assumed
an older API in DECISIONS.md.

## After Phase 0 — Foundation
2026-10-28, 23:37

**What I built**
- The Next.js 16 project with TypeScript strict, Tailwind 4, ESLint, Prettier
  and Vitest (jsdom + fake-indexeddb + Testing Library).
- Design tokens for light and dark mode, the four state colors and tints, the
  17px type scale driven by a `--text-scale` variable, an always-visible
  3px focus ring, and reduced-motion rules (`src/app/globals.css`).
- Domain types, the Dexie database, the demo-aware clock, date helpers and
  the quadrant mapping (`src/lib/*`).
- The repo layer (`src/lib/repo/*`) with the win rules from Section 8.3
  wired into task, focus, strategy and transition writes.
- The settings provider with the localStorage mirror, the inline first-paint
  script, and `useReducedMotionPref()`.
- All content: 48 emotions, 6 task types, 20 strategies with steps, crisis
  lines, and the copy catalog with Gentle/Direct/Literal variants.
- The app shell: PhoneFrame, TopBar with the menu and demo badge, TabBar,
  the Check in button opening an (empty) sheet, and every tab route.
- The strategy ranking from 9.4, the five prompt files, and the docs.

**How I checked it**
- lint ok, typecheck ok, 22 tests passing, build ok.
- Tests: quadrant mapping, average point, clock (real and demo), time
  formatting, strategy ranking (personal history, suppression after two
  "worse", the 4-week window, bridge length limit), repo side effects, and
  the two guard tests.
- In the in-app browser at 390×844: the shell renders in dark mode (system
  preference) and light mode, the Tasks tab is marked `aria-current`, the
  Check in button opens a focus-trapped sheet with a labeled Close, the
  `tide` IndexedDB database opens, and the root font size is 17px.

**What broke and how I fixed it**
- `averagePoint` turned Drained + Frustrated into Surge, because
  `Math.round(-0.5)` is `-0` and zero counts as high energy. The demo
  expects Ebb. I made `clampCoord` round half away from zero (D5).
- The generated shadcn Dialog and Sheet used a button size I removed for
  being under 48px. I rewrote both with a labeled "Close" button.
- `create-next-app` refuses a non-empty folder, so I scaffolded in a scratch
  directory and copied the files in, keeping the team's README line.

**Decisions**
- D1 Cache Components off. D2 `eslint .` instead of `next lint`. D3 Tailwind 4
  tokens in CSS. D4 demo start in local time. D5 rounding. D6 no red style.
  D7 no next-themes. D8 contact methods. D9 extra settings keys. D10 where
  win text lives.

**Known issues**
- The manifest and icons referenced in `layout.tsx` don't exist until
  Phase 8, so the browser logs two 404s in development.

**For the team**
- Added the initial TEAM_TODO list from Section 17.7, plus a note that I kept
  your README line at the top of the new README.

**Commit:** a4df74e chore(base): set up the Tide foundation (pushed to origin)

## Before Phase 1 — AI plumbing and safety layer
2026-10-28, 23:41

Maya never sees this layer directly, but she feels it every time Tide offers
words for a feeling, a first step, a lighter plan, a bridge or a pattern
sentence. It has to answer fast, stay inside what she typed, and never leave
her waiting: if the model is slow, wrong or switched off, a built-in answer
appears instead. The safety layer is the other half: if she writes something
that sounds like a crisis, Tide stops coaching and shows people she can reach.

Where it sits: between every screen that suggests something and the five
`/api/ai/*` routes. It reads only the minimal input each schema allows and
writes nothing; the screens save what Maya chooses.

What "done" means for me: the five routes validate input and output with
zod, run the extra semantic checks (no invented emotion ids, every task
placed once in a Day Mode plan, numbers in pattern text that really exist),
retry once, and return an envelope; with no key they return `missing_key`
and the client falls back; the 36-entry Unstick table is complete; the
safety detector catches the English and Spanish phrases without firing on
"this deadline is killing me"; the crisis screen has working `tel:` links;
and neither the SDK nor the key ends up in the browser bundle.

What could go wrong: the spec's `temperature: 0.3` can't be sent anymore
(the API now rejects sampling parameters), and the default models think
before answering, which would eat the small `max_tokens` budgets and cut the
JSON short. I'll turn thinking off for Haiku 5.5 and Sonnet 5.5 with low
effort, record it, and test the retry path with a mocked SDK. Also, `fs`
must stay on the server: fallbacks have to be pure so the browser can use
them.

## After Phase 1 — AI plumbing and safety layer
2026-10-28, 23:49

**What I built**
- zod schemas for all five routes plus the semantic checks
  (`src/lib/ai/schemas.ts`).
- `callJson()` against the installed SDK 1.3.0, with a shared deadline,
  one retry that shows the model its own answer and the problem, refusal
  handling, and typed `AiError`s (`src/lib/ai/client.ts`).
- A shared route body (`src/lib/ai/route.ts`) and the five routes, each a
  short configuration file, plus `/api/config`. The server log line holds
  only route, status, latency and the fallback flag.
- Deterministic fallbacks for every route, including the complete 36-entry
  Unstick table and a label lexicon (`src/lib/ai/fallbacks.ts`,
  `unstickTable.ts`).
- The browser runner and `useAi` hook: safety pre-check, AI-off, the demo
  cache race (empty cache until Phase 8), timeout from `/api/config`,
  validation on the browser side too, and fallback on anything else.
- The safety layer: English and Spanish phrases, a normalizing whole-phrase
  detector, the crisis screen, the Support screen and the Talk to a person
  button.

**How I checked it**
- lint ok, typecheck ok, 73 tests passing (13 files), build ok.
- `callJson` with a mocked SDK: valid answer; invalid then valid; invalid
  twice; semantic failure then fixed; timeout through the abort signal;
  refusal; missing key (no API call made). I also assert that no
  `temperature` is sent and that thinking is off for Haiku.
- Route tests: envelope on success, made-up emotion id → `invalid_output`,
  oversized input → 400 without a model call, missing key → 503, rate
  limit → 429, Day Mode plan with a dropped task → rejected, narrated card
  with "90%" → swapped for the template card, `/api/config` never exposes
  the key.
- Safety tests: every listed phrase in context, casing, accents, curly
  apostrophes, Spanish, and the idioms that must not trigger.
- Build output: `grep` finds no "anthropic", no `ANTHROPIC_API_KEY` and no
  `sk-ant` anywhere in `.next/static`. The label route's trace file lists all
  six prompt files, so they ship to Vercel.
- On the dev server with no key: `/api/ai/label` answers 503 `missing_key`,
  a bad body answers 400 `invalid_input`, `/api/config` says
  `hasKey: false`. In the in-app browser, `/support?crisis=1` shows the still
  crisis screen with the three `tel:` buttons and "I'm safe, take me back."

**What broke and how I fixed it**
- A test looked up the 911 button by `/911/` and also matched
  "800 911 2000"; I made it use the exact button name.
- A test fixture needed an explicit `NarrateInputT` type because TypeScript
  widened the facts objects.

**Decisions**
- D11 no temperature, thinking off and low effort. D12 refusal → fallback.
  D13 semantic checks get the retry. D14 the demo cache race. D15 Day Mode
  fallback ordering. D16 the Unstick fallback changes with state. D17 the
  safety phrase rules. D18 HTTP status codes.

**Known issues**
- I haven't been able to try a real model call: there is no API key in this
  environment. Everything AI-side is tested with a mocked SDK. The team
  should run the label example once with their key (added to TEAM_TODO).

**For the team**
- Added: try one real AI call after adding the key.

**Commit:** feat(ai): add the AI routes, fallbacks and the safety layer
(hash recorded at the start of Phase 2)
