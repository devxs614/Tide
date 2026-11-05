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

**Commit:** a6ad0cb feat(ai): add the AI routes, fallbacks and the safety layer

## Before Phase 2 — Check-in "Name it"
2026-10-28, 23:52

This is the heart of Tide and the first thing in the demo. Maya opens the
sheet, types whatever comes out ("Heavy. Annoyed at myself."), and Tide
offers three words she can pick from, with plain definitions she can have
read aloud. If she has no words, she can start from her body instead. She
places herself on the map, says what might be behind it, and picks what she
needs next. Tide never picks a feeling for her.

Where it sits: step 1 of the loop. It reads the label route (through
`useAi`) and writes one CheckIn through `createCheckIn`. Its "need" answer
hands off to the rest of the loop: back to the day, a lighter plan (Phase 4
fills that sheet), the toolkit filtered to her state, or Support.

What "done" means for me: a check-in can be finished with the keyboard alone
in under a minute; the AI never preselects a word; a third pick shows a
neutral "You can pick up to two."; "None of these" opens all 48 words by
state and lets her add her own; AI off gives fallback words instantly with
no network call; a crisis phrase saves the check-in without text and opens
`/support?crisis=1`; and the saved quadrant matches the map.

What could go wrong: the mood map is the riskiest control. A drag-only map
would lock out keyboard and screen-reader users, so it gets arrow keys, a
spoken value ("Energy 2, pleasantness minus 3, Surge") and a "Use sliders
instead" switch. Escape must not throw away typed words without asking. And
dictation and read-aloud must vanish quietly where the browser lacks them.

## After Phase 2 — Check-in "Name it"
2026-10-29, 00:04

**What I built**
- The check-in sheet with its four steps, the body path, "None of these"
  with all 48 words and a custom word, the leave confirmation, and focus that
  moves to each step's title (`src/components/checkin/*`).
- The mood map with drag, tap, arrow keys, a spoken value and a slider
  alternative; emotion cards with the two-pick limit.
- Read aloud and dictation (`src/lib/speech.ts`), the state chip, the dot
  meters, and a first Today state card.
- The `useDayModeSheet()` entry point that "Adjust my plan" opens; Phase 4
  attaches the sheet to it.

**How I checked it**
- lint ok, typecheck ok, 81 tests passing (14 files), build ok.
- Flow tests 1–4 from 16.2: words path saves an Ebb check-in with Drained and
  Frustrated; wordless path sends and saves `chest:tight`; a crisis phrase
  makes no AI call, saves no text and opens `/support?crisis=1`; AI off shows
  fallback words with no network call at all. Extra tests for the two-pick
  toast, "None of these" plus a custom word, Escape asking before discarding
  words, and a keyboard-only run using only Tab, Enter and Space.
- In the in-app browser at 390×844 (no API key, so the fallback answered):
  typed the demo sentence, got Drained, Frustrated and Exhausted with nothing
  preselected, picked two, the dot landed in Ebb, saved, and Today showed
  "Ebb · Drained, Frustrated" with the toast. Checked dark mode too.

**What broke and how I fixed it**
- Sheet titles rendered at body size: shadcn's `cn` treated `text-h2` and
  `text-ink` as two colors and dropped the size. I configured `cn` with
  Tide's type scale (D19) and pointed every component at it.
- The sheet reset to step 1 while it was still fading out. The reset now
  waits for the close animation.
- The floating Close button showed content scrolling underneath it; it has a
  solid background now.
- A flow test looked for the crisis heading synchronously right after a
  render that waits for settings; it now waits.
- Renamed `vitest.config.ts` to `.mts` to stop Vite's CommonJS warning.

**Decisions**
- D19 configured `cn`. D20 body cue format. D21 dot follows picks until
  moved. D22 mood map as one slider. D23 "Regulate first" opens the toolkit.

**Known issues**
- The optional body outline drawing from 13.4.1 is not there; the list of
  places is the control (the spec marks the drawing optional).
- Dictation uses `en-US`; Spanish speakers dictating in Spanish would need a
  language switch later.

**For the team**
- Nothing new.

**Commit:** 878b5f5 feat(checkin): add the check-in flow with mood map and body path

## Before Phase 3 — Tasks, Unstick and Focus
2026-10-29, 00:06

This is where a feeling turns into a first step. Maya's tasks live on a
four-column board, and "Stuck" is a column, not a failure. When she moves
the lab report to Stuck, Tide asks why it feels hard and offers one tiny,
physical step that fits how she feels right now, and, if her own history
says so, a strategy that helped before this kind of task. Then a short focus
block with a timer she can trust, and one question at the end: how did it go?

Where it sits: steps 2 and 4 of the loop. It reads tasks, the latest
check-in and past strategy uses and focus blocks (for "a walk helped you 4
of 5 times"); it writes task status changes, the first step, the stuck
reason and FocusBlocks, and the wins those create.

What "done" means for me: every move works without dragging (a "Move to…"
menu on every card), counts update live, done tasks can come back, long
titles wrap; Unstick gives a different step for Ebb and Swell and a smaller
one on "Different step", even with AI off; the focus timer is computed from
timestamps, so it stays right after the tab sleeps; the outcome is saved;
the reduced-motion timer is a plain bar.

What could go wrong: drag and drop is the classic accessibility trap, so it
gets dnd-kit's keyboard sensor and spoken announcements on top of the menu.
The timer must use `now()` (the demo clock) and never count ticks. And the
"helped you k of n times" line must come from the same code the Patterns
screen will use, so I'm writing the strategy-before-task rule now in
`src/lib/patterns/rules/` instead of a one-off query.

## After Phase 3 — Tasks, Unstick and Focus
2026-10-29, 00:15

**What I built**
- The board: segmented control with live counts on phones, four columns at
  1024px and up, dnd-kit drag handles with the keyboard sensor and spoken
  announcements, and a "Move to…" menu on every card.
- The task form with quick picks and "Break it down for me".
- Unstick: six reasons, then one first step with read aloud, the focus
  length, the "helped you k of n times" offer from Maya's own history, "Do it
  first", "Different step", "Not now", and "You left off at…" first.
- The focus block: length picker preselected from Unstick or the state rule,
  a timestamp-based timer with pause and resume, the water fill and its
  reduced-motion bar, the outcome sheet with a reward suggestion, and the
  "Smaller step" path back into Unstick.
- The strategy-before-task rule, shared with Patterns later.

**How I checked it**
- lint ok, typecheck ok, 87 tests passing (16 files), build ok.
- Flow test 5: add a task, In progress and Stuck through the menu, Unstick
  opens, choose a reason, the step appears, "Start 10 min" goes to
  `/focus/<id>?minutes=10` with the status, reason and step saved.
- Flow test 6: a 5-minute block where only `Date` is faked and jumped five
  minutes; the outcome sheet appears on its own and "Got going" saves a
  completed FocusBlock and shows "You could take: Tea break."
- Extra tests: the "Before writing tasks, 3-minute walk helped you 4 of 5
  times" line from fabricated history; Ebb changes the step and "Different
  step" gives a smaller one; pause, resume and "I'm done early" save an
  incomplete block; a done task can move back and keeps its win.
- In the in-app browser: added a task with an 80-character title (it wraps),
  saw four columns at 1280px, moved the task to Stuck through the menu, got
  an Ebb-sized step from the fallback, and started a 5-minute focus block
  that counted down from the clock.

**What broke and how I fixed it**
- React's compiler lint flagged `Math.random()` in an event handler and a
  `setState` inside an effect in Unstick. I moved the random pick to
  `src/lib/random.ts`, and rebuilt Unstick so each opening mounts a keyed body
  that initializes its own state; one line keeps a commented disable where
  the compiler can't see that state is set after awaiting.
- The guard test caught a `Date.now()` I wrote in a test; it uses `now()` now.
- Dropdown items were about 30px tall; they are 48px now.
- A test rendered a card with a stale task object; it reads live now, like
  the board does.

**Decisions**
- D24 rule written once. D25 six-hour state. D26 stuck reason storage.
  D27 Unstick mounted globally. D28 drag commits on drop. D29 timer.

**Known issues**
- Dragging between columns only works where both columns are visible (wide
  screens); on a phone the menu is the way across, which the spec allows.

**For the team**
- Nothing new.

**Commit:** e16a176 feat(tasks): add the board, Unstick and the focus block

## Before Phase 4 — Today and Day Modes
2026-10-29, 00:17

This is the part of Tide where the check-in actually changes Maya's day.
Today is her home screen: a greeting, how she checked in, a reminder of
something she managed on a day that felt like this one, the next thing on
her schedule, and the rest of her day as a simple line with a "Now" marker.
When she's running low, it offers a lighter plan instead of the full one.

Where it sits: step 2 of the loop (adapt). It reads check-ins, tasks,
events, wins and today's DayPlan; it writes DayPlans and the moved-task
dates through `applyDayPlan()`, and events through `addEvent()`.

What "done" means for me: the banner appears only under the three rules in
13.3 and "Not now" hides it until the next check-in; a plan never deletes a
task; Maya's toggles override the suggestion; Undo puts every task and the
plan back exactly as they were; the "Now" marker moves on its own every
minute using `now()`; Today renders with no data, with demo data and with
long titles.

What could go wrong: time. The marker, the banner and the next-event card
all depend on the clock, and if any of them reads the real time instead of
`now()`, demo mode shows the wrong afternoon on stage. The guard test
catches `Date.now(`; I'll also keep "today" consistently computed from
`now()` in one hook. The other risk is the Day Mode budget check: the AI's
plan must place every task once, or it falls back.

## After Phase 4 — Today and Day Modes
2026-10-29, 00:25

**What I built**
- Today: greeting with the optional name, the state card with the win card,
  the Day Mode banner with its three rules and "Not now", the next-event card
  for anything in the next three hours, and the Tide Line with "Earlier
  today", a "Now" marker in the state color, today's tasks, upcoming events,
  empty states, and the "Moved to tomorrow" group with "Bring back".
- The Add event sheet with kind, times, place and up to three prep items.
- The Day Mode sheet: Gentle or Minimum, the AI or fallback proposal, toggles
  per task, the kept-energy total, "Use this plan", and a 10-second Undo.
- `src/lib/daymode.ts` with the banner rules, budgets, today's tasks and the
  route input, and `bringBackToday()` in the day plan repo.

**How I checked it**
- lint ok, typecheck ok, 95 tests passing (18 files), build ok.
- Flow test 7: an Ebb check-in shows the banner, Gentle proposes keeping the
  TA email and the lab report (4 of 4), Maya keeps Laundry too (6 of about
  4), the plan saves with the right kept and moved tasks, no task is
  deleted, "Moved to tomorrow (3)" appears, the banner goes away, and Undo
  removes the plan and clears every moved date.
- Other tests: Today with no data; "Not now" until the next check-in; the
  next-event card text; "Bring back"; the banner rules and today's-tasks
  rules as unit tests.
- In the in-app browser: Today at 390px with the earlier Ebb check-in shows
  the banner, the Tide Line and the in-progress task.

**What broke and how I fixed it**
- A new check-in didn't refresh Today. Dexie live queries only watch the key
  range they read, and mine ended at "now". Open-ended ranges with a time
  filter fixed it there and in `recentCheckIn` (D33).

**Decisions**
- D30 honest win card. D31 today's tasks. D32 what Day Mode plans. D33 live
  query ranges.

**Known issues**
- None that I know of. The Bridge card replaces the next-event card within
  15 minutes in Phase 6.

**For the team**
- Nothing new.

**Commit:** 28e20f4 feat(today): add Today, the Tide Line and Day Modes

## Before Phase 5 — Toolkit and strategy runner
2026-10-29, 00:27

Regulation is step 4 of the loop. When Maya is wound up before a switch or
flat before a task, the toolkit offers short things that actually fit how
she feels: a breathing square, a 3-minute walk, a tiny sudoku, a message she
can send a friend. It puts first what has worked for her before. After each
one, Tide asks a single question, better, same or worse, and that answer is
what lets the Patterns screen learn.

Where it sits: reads the recent check-in and past StrategyUses (for the
ranking and "Worked for you 3 of 4 times"); writes one StrategyUse per run,
with the context (toolkit, unstick or bridge) and the task or transition it
was for, plus a win for "better". Unstick's "Do it first" and the Bridge's
"Start" both come through the same runner and go back where they came from.

What "done" means for me: all eight tools work with a keyboard and a screen
reader, honour reduced motion (no moving dot, no rising water, text
instead), and the re-check saves the right result with the right context and
reference. Every strategy in the library maps to a tool that exists. The
sudoku puzzles are valid, and "Check" never says "wrong".

What could go wrong: the breathing square announcing every second to a
screen reader would be unbearable, so only phase changes are announced. The
brain dump collects free text, so it needs the safety pre-check before
anything is kept. Canvas colors have to come from the tokens, not hex.

## After Phase 5 — Toolkit and strategy runner
2026-10-29, 00:29

**What I built**
- The Toolkit tab: header with the current state (or "Pick what fits right
  now"), "Show all", "Works for you" with "Worked for you k of n times",
  family tabs with icons and plain descriptions, ranked cards, and "Talk to
  a person".
- The strategy runner: numbered steps each with read aloud, the tool, the
  re-check, a kind reply for each answer, and the trip back to the toolkit,
  the stuck task, or the bridge.
- All eight tools: box breathing (moving dot, or still with reduced motion;
  phases announced, not seconds), 5-4-3-2-1 cards, a keyboard-operable 4×4
  sudoku with five unique-solution puzzles and a gentle "Check", a doodle
  canvas with token colors and nothing saved, the walk timer with optional
  vibration, the brain dump with the safety check and "Turn lines into
  tasks", the message template with `{task}` and copy, and the steps timer.
  Sudoku and doodle load only when opened.

**How I checked it**
- lint ok, typecheck ok, 108 tests passing (20 files), build ok.
- Flow test 9: Box breathing, start, stop, "Better" saves a StrategyUse with
  `better` in the toolkit context and adds "Felt better after: Box breathing".
- Other tests: "Worse" gets the thank-you and no win; coming from Unstick
  puts the task in the TA message, records the task id and returns to
  `/tasks?unstick=<id>`; a crisis phrase in a brain dump opens the support
  screen and keeps nothing; chosen lines become tasks; reduced motion keeps
  the breathing dot still; every strategy maps to an existing tool with at
  most five short steps; the toolkit filters to Surge, opens on Calm and
  lifts Box breathing into "Works for you"; each sudoku has one solution.
- In the in-app browser: the toolkit for the Ebb check-in, and the sudoku
  grid with box borders and a 48px number pad.

**What broke and how I fixed it**
- The TA message said "this task" because the tool mounted before the task
  loaded; the runner now waits for the task when there is one.
- Two tests looked for the tool synchronously after that change; they wait
  now.

**Decisions**
- D34 every run is recorded. D35 the first family tab. D36 sudoku checking.
  D37 grounding inputs.

**Known issues**
- The doodle canvas can't be used without a pointer; keyboard and
  screen-reader users can skip it with "I'm done", and the other seven
  tools are fully keyboard operable.

**For the team**
- Nothing new.

**Commit:** 97a61f2 feat(toolkit): add the toolkit, strategy runner and all eight tools

## Before Phase 6 — Bridge
2026-10-29, 00:30

Transitions are where Maya's days fall apart: chemistry lab ends at 4:40,
calculus starts at 4:50, and the switch often goes badly. The Bridge shows
up on its own about 15 minutes before the next event and walks her through
three small things: close (write down where she's leaving off), shift (one
short strategy that has helped before), start (what to bring and where to
go). Later it asks how the switch went, and that answer feeds the patterns.

Where it sits: step 3 of the loop. It reads events, the in-progress task,
the recent check-in, strategy history and past transitions (for "has felt
hard 3 of the last 4 times"); it writes the parking note to the task, one
Transition when she leaves, and the rating (plus a win for easy or okay).

What "done" means for me: in demo mode at the scripted time the card
appears; the parking note is saved and shown first when she returns to the
task; "Start" runs the strategy in the bridge context and comes back; the
rating prompt appears 10 minutes after the event starts and saves the
rating; and the pattern line uses real computed numbers from the same rule
the Patterns screen will use.

What could go wrong: "from" is subtle. At 4:41 the lab has just ended, so a
strict "ongoing event" check would say "from the lab report" instead of
"Chemistry lab → Calculus". I'll treat an event that ended in the last 15
minutes as the one she's coming from, and log it. The parking note is free
text, so it gets the safety check before it is saved.

## After Phase 6 — Bridge
2026-10-29, 00:36

**What I built**
- `src/lib/bridge.ts`: the next event within 15 minutes that hasn't been
  bridged, the "from" resolution (event she's in or just left, else her
  in-progress task, else "what you're doing"), and the pending rating.
- The hard-transition rule, with the with/without-strategy comparison,
  shared with Patterns.
- The Bridge card on Today (it replaces the next-event card inside 15
  minutes), a banner on the other tabs, and the sheet: live countdown, the
  "has felt hard" line, 1 Close with a prefilled parking note, dictation and
  the safety check, 2 Shift with the AI's pick among the top three short
  strategies and "Something else", 3 Start with a prep checklist, and "Done,
  I'm going". The rating prompt sits on Today after the next event starts.
- The strategy round trip: the runner records against the draft and comes
  back to `/?bridge=<id>`, which reopens the same switch and shows "Done:
  {strategy}".

**How I checked it**
- lint ok, typecheck ok, 114 tests passing (22 files), build ok; the full
  suite passed four times in a row after the timeout fix below.
- Flow test 8: a lab that just ended and Calculus in 9 minutes show
  "Chemistry lab → Calculus · leave in 9 min"; the parking note is prefilled
  and saved to the task; the prep list shows Calculator, Notes from Tuesday
  and Go to Room 4-203; Start goes to the runner with the bridge context;
  "Better" comes back to `/?bridge=<id>`; "Done, I'm going" saves the
  Transition with the note and the strategy use; at Calculus + 11 minutes
  Today asks how the switch went, and "Okay" saves the rating and the win.
- Unit tests for the "from" rule, "already bridged", "too early", and when
  the rating is asked.
- In the in-app browser: added a Calculus event 11 minutes ahead; the card
  appeared on its own, and the sheet showed the prefilled note, dictation,
  and a one-minute strategy suited to the earlier Ebb check-in.

**What broke and how I fixed it**
- Writing to the `draft` prop tripped the compiler lint; drafts now change
  through `updateDraft()`.
- Flow test 8 failed once in about five full runs: Testing Library waits one
  second by default, and with every file running in parallel the Bridge
  flow sometimes needed longer. The shared setup now waits up to five
  seconds.
- The Add event fields used wrapping labels that one accessibility tree
  didn't name; they use explicit `htmlFor`/`id` pairs now.

**Decisions**
- D38 "from" includes a just-ended event. D39 drafts in memory. D40 the rule
  written once. D41 prep steps include the place.

**Known issues**
- A reload in the middle of a Bridge forgets the draft (the card stays and a
  new draft starts). Acceptable for the MVP.

**For the team**
- Nothing new.

**Commit:** 8342df1 feat(bridge): add the transition coach with rating and the hard-switch rule

## Before Phase 7 — Pattern engine, Patterns screen and Proof log
2026-10-29, 00:37

This is step 6 of the loop and the part that makes Tide personal. After a
few weeks, Maya can see things like "a 3-minute walk before writing tasks
got you going 4 of 5 times", with exactly which moments that came from, and
she can say "not true for me". The proof log is the other side: a plain list
of things she did, kept for the days that feel heavy, with no counts.

Where it sits: reads everything (check-ins, tasks, events, focus blocks,
strategy uses, transitions, dismissed keys) and computes patterns in plain
code. Only the computed facts go to the narrate route; the AI words them and
never sees the history. It writes dismissed pattern keys, manual wins and
rewards.

What "done" means for me: the four rules and the engine pass every test in
12.6 (thresholds, baselines, the with-strategy comparison, dismissals,
window, safety check-ins ignored, confidence at 3/5/8/12, order and the cap
of six); the numbers on the cards always equal the engine's; "Why am I
seeing this?" lists the real evidence; "Not true for me" survives a reload;
and with AI off the template wording appears.

What could go wrong: the AI narration adding numbers that aren't in the
facts. The server swaps such a card for its template; I'll keep the numbers
in the card's meta line coming from the engine, never from the narration.
The other risk is Phase 8: the seed must plant exactly three patterns, and
the state-before-task rule could catch accidental ones, so I'll make the
engine easy to run against the seed in a test.

## After Phase 7 — Pattern engine, Patterns screen and Proof log
2026-10-29, 00:44

**What I built**
- The rest of the pattern engine: state before task, strategy effect,
  confidence, the engine (dismissals, sort, cap of six), and readable
  evidence rows on every result.
- Narration through the narrate route with an in-memory cache by key, k, n
  and mode; the template answers with AI off.
- The Patterns screen: "This week" / "Last 4 weeks", the check-in calendar
  with a sentence per day and a legend, pattern cards with the engine's own
  numbers and confidence, read aloud, "Why am I seeing this?" with the real
  moments, "Not true for me" with optional reasons and a gentle exit, Top
  strategies, the hardest switch, the not-enough-data state, and the footer.
- The Proof log: wins by day with source icons, "Add a win" with dictation
  and the safety check, and "My rewards".

**How I checked it**
- lint ok, typecheck ok, 129 tests passing (24 files), build ok.
- Engine tests for every case in 12.6: 4 of 5 vs a 1 of 4 baseline shown
  with confidence 2; 2 observations hidden; 60% vs 50% hidden; lab → class 3
  of 4 shown; the with/without box-breathing comparison in the facts;
  dismissed keys; the window (28 and 7 days); safety check-ins ignored;
  confidence at 3, 5, 8 and 12; order and the cap of six.
- Flow test 10 on a small fixture: the walk card and the box-breathing card
  both read "4 of 5 times · Last 4 weeks", Why lists five dated moments,
  "Not true for me" hides the card, saves the reason, and it stays hidden
  after a re-render. Also: valid AI wording appears next to engine numbers,
  the not-enough-data state, the proof log without counts, and the safety
  check on a typed win.
- In the in-app browser (dark mode): the calendar, legend and the Bridge
  banner on the Patterns tab.

**What broke and how I fixed it**
- The React hooks lint read my fixture helper `use()` as React's `use` hook;
  renamed it `strategyUse()`.
- The narration cache leaked between tests; `resetApp()` now clears it.

**Decisions**
- D42 evidence rows. D43 sorting and baselines. D44 numbers never from the
  AI. D45 hardest switch.

**Known issues**
- None that I know of. The full demo seed and its exact-keys test come in
  Phase 8.

**For the team**
- Nothing new.

**Commit:** 60d4a66 feat(patterns): add the pattern engine, Patterns screen and Proof log

## Before Phase 8 — Onboarding, Settings, demo mode and seed data
2026-10-29, 00:46

This phase finishes the product and makes the stage demo reliable. For
Maya, onboarding is three short screens that say what Tide does and
doesn't do, let her make it comfortable (text size, theme, motion, how Tide
talks), and explain privacy plainly. Settings holds all of that later, plus
her people, her data (export, delete everything) and the About text. For the
team, demo mode loads three weeks of a fictional student's life, sets the
clock to Thursday 3:40 pm, and answers the scripted inputs from saved
responses so a dead venue network changes nothing.

Where it sits: settings are read everywhere; this phase writes them, and the
seed writes every table at once (through a repo function, not around it).

What "done" means for me: onboarding works by keyboard and can be skipped
from any step; preferences apply instantly; export downloads JSON without
contacts unless asked; "Delete everything" leaves an empty database; demo
mode shows the "Demo data" badge; the seed plants exactly the three patterns
in 14.2 with the exact numbers, and a test proves no others appear; the
scripted demo works twice in a row with the network off (cache) and on.

What could go wrong: accidental patterns. The state-before-task rule links
focus blocks to check-ins in the three hours before, so if the seeded
writing blocks follow Ebb check-ins, an extra "Ebb before writing" card
appears. I'll keep seeded focus blocks far from check-ins. The win card is
the other trap: it shows the most recent win from an Ebb day, so no Ebb
check-ins between Oct 30 and Nov 4, or "lab outline" won't be the one shown.

## Phase 8 — progress note (session stopped by a usage limit)
2026-10-29, 01:00

**Done so far in Phase 8:** onboarding (three steps, skip, live preferences)
and the shell redirect; the full Settings screen (profile, comfort, how Tide
talks, AI suggestions, people, export, delete everything, demo controls,
about); the deterministic demo seed with exactly the three planted patterns
(`seed.test.ts` proves it); cached demo answers that pass the live checks;
and a scripted-demo test that runs the 14.3 script twice with the network
down and once with live AI. The demo test found a real bug: a task moved to
Stuck no longer counted as the one Maya was coming from in the Bridge, so
the parking note lost its prefill. Stuck tasks count now.

**Checks at this point:** typecheck ok, lint ok, 144 of 145 tests passing.
One test failed in one full parallel run; its name didn't print before the
session stopped, and it passed on the run right after.

**Still to do:** finish Phase 8 (fix that test, `docs/demo-script.md`, PWA
manifest and icons via `sharp`, performance pass, After Phase 8 entry),
then Phase 9 (prompts-doc page, README, architecture, research template,
attribution audit, deploy steps, secret scan) and Phase 10 (full audit).
Resume with the message in Appendix C.2 of the build prompt.

## Resumed
2026-10-29, 09:22

A new session picked up the build. What I found: the last commit is
80cd257 (Phase 8 in progress) and the working tree is clean. Lint and
typecheck are clean, a clean `next build` succeeds, and the full suite
passed 145 of 145 three runs in a row, so the failure noted above looks like
a timing flake under load rather than a broken test; I'll keep an eye on it
in the audit. Still to do: the rest of Phase 8 (demo script doc, manifest
and icons, performance pass), then Phases 9 and 10.

One change in how I commit, at the team's request: commits now use the
team's own Git identity (devxs614) and carry no AI trailer lines. The AI
attribution the rules require stays where it was always meant to be, in
AI_ATTRIBUTION.md, this log and the daily reports. Earlier commits keep the
trailers they had; rewriting pushed history would need a force-push.

## After Phase 8 — Onboarding, Settings, demo mode and seed data
2026-10-29, 09:33

**What I built** (across the stopped session and this one)
- Onboarding: three steps with "Step n of 3", Skip on every step,
  preferences that apply at once, the privacy text and an optional trusted
  person; the shell redirects there until it's done.
- Settings: profile, comfort, how Tide talks, AI suggestions (with where
  recent answers came from), people and campus support, export (contacts
  only if ticked), "Delete everything", demo controls, and About.
- The demo seed: three weeks for Maya, deterministic, with exactly the three
  planted patterns, the win card's Thursday, the rewards and the persona.
- Saved demo answers for all five routes, shaped from the live input.
- `docs/demo-script.md` for presenters.
- The app icon (an original wave mark) as SVG and 192/512 PNGs, and the web
  manifest.
- A performance pass: sheets and forms load on first open, framer-motion
  only on Patterns, the unused Tooltip provider removed.

**How I checked it**
- lint ok, typecheck ok, 145 tests passing in four full runs in a row, clean
  build ok.
- `seed.test.ts`: the engine on the seed returns exactly the three planted
  keys with 4 of 5 (confidence 2, baseline 25%), 3 of 4 (with the box
  breathing comparison) and 4 of 5; no Ebb check-ins from Oct 30 to Nov 4;
  the bridge at the jump time is Chemistry lab → Calculus in 9 minutes.
- `demoScript.test.tsx`: the whole 14.3 script on the real seed, twice in a
  row with the network down (saved answers) and once with the AI answering
  live; every expected text appears, including the win card.
- Flow test 11 and onboarding tests in `Settings.test.tsx`.
- Bundle measured against a production server: Today went from 330 KB to
  267 KB of gzipped first-load JavaScript (D47).

**What broke and how I fixed it**
- The demo test found that a task moved to Stuck stopped counting as where
  Maya was coming from in the Bridge, so the parking note lost its prefill.
  Stuck tasks count now.
- The intermittent failure from the stopped session was flow 8: "Start" in
  the Bridge saves the note before navigating, and the test checked the
  navigation too early under load. It waits now. A second one appeared after
  lazy-loading the task form (flow 5 looked for the field too early); fixed
  the same way.
- The fixture helper and a seed helper were named `use`, which the hooks lint
  read as React's `use`; renamed.

**Decisions**
- D46 no AI trailers in commits. D47 bundle work and the remaining 17 KB.
  D48 no Playwright. D49 demo start times. D50 saved answers from live
  input. D51 leaving demo mode clears the persona.

**Known issues**
- Today's first load is 267 KB, 17 KB over the 250 KB target (D47).

**For the team**
- Nothing new beyond the existing list.

**Commit:** c1a339e feat(demo): finish demo mode, icons and the performance pass
(the earlier part of Phase 8 is in 80cd257)

## Before Phase 9 — Submission documents and deployment readiness
2026-10-29, 09:33

This phase is for the judges and reviewers more than for Maya: the
repository, the AI Prompts PDF and the docs are graded too. The team has to
be able to print the prompts, point a reviewer at a README that explains
Tide in a few minutes, and deploy without guessing.

What I'll produce: the `/prompts-doc` print page (every route's purpose,
model tier, schemas, the exact system prompt read from /prompts, a real
example, validation, fallback and safety), the final README, an architecture
page with a diagram, the research-to-design template, the finished code
walkthrough, a complete attribution table, exact Vercel steps, a secret scan
of the tree and the history, and a sweep for dead code.

What "done" means for me: every document exists and matches the code as it
is now; the prompt page prints cleanly; the build is clean; nothing
key-like is in the repo or its history.

What could go wrong: documents drifting from the code. I'll generate what I
can from the source (the prompts come from the files, the schemas from zod)
instead of retyping them.

## After Phase 9 — Submission documents and deployment readiness
2026-10-29, 09:38

**What I built**
- `/prompts-doc`: the AI Prompts document, printable to PDF, with the
  architecture paragraph, the shared preamble, and for each of the five
  routes its purpose, model tier and token limit, the exact system prompt
  (read from /prompts), the input and output schemas (printed from zod),
  a real example input and output, validation, fallback and safety, plus a
  closing section of safety and formatting guidelines. Print styles put one
  route per page.
- The final README (all 14 parts of 17.8, keeping the team's first line),
  `docs/architecture.md` with a Mermaid diagram, the
  `docs/research-to-design.md` template (placeholders only), and the
  finished 60-second "how does the AI work?" answer in the walkthrough.
- Exact Vercel steps and PDF-printing steps in TEAM_TODO.
- A dead-code sweep: removed 16 unused repo and helper functions and the
  unused RadioGroup component.

**How I checked it**
- lint ok, typecheck ok, 147 tests passing, clean build with no warnings.
- `page.test.tsx`: all five routes and the preamble are on the page, and
  every example output passes its route's schema.
- Looked at `/prompts-doc` in the in-app browser.
- Secret scan: `git grep` over the tree and `git log -p --all` over the
  history for `sk-ant`, `ANTHROPIC_API_KEY=` with a value, and long
  base64-looking strings. Nothing found except the docs that describe the
  scan itself; there is no `.env.local` in the repo.
- Attribution audit: a script lists every tracked file not covered by a row
  in AI_ATTRIBUTION.md; I added rows for the eleven it found.

**What broke and how I fixed it**
- Type checking failed on `.next/types/routes.d 2.ts`. This repo lives in
  `~/Documents`, which iCloud Drive syncs, and iCloud writes "file 2"
  conflict copies when build output is rewritten quickly. tsconfig now
  excludes `**/* 2.*`, .gitignore ignores them, and TEAM_TODO suggests moving
  the repo out of iCloud.

**Decisions**
- None new.

**Known issues**
- Team names and university are placeholders in the README, the About
  section and `/prompts-doc` (listed in TEAM_TODO).
- No deploy yet: the Vercel CLI isn't installed and signed in here.

**For the team**
- Added: Vercel deploy steps, PDF printing steps, keep the repo out of
  iCloud.

**Commit:** 2b0a6c5 docs(docs): add the prompts page, README, architecture and deploy steps

## Before Phase 10 — Full audit and fixes
2026-10-29, 09:39

I built a lot in one run; this phase is where I check that nothing is
missing or broken before the team takes over. For Maya it means every
screen does what the spec promises, with a keyboard, a screen reader, large
text, dark mode, reduced motion and no network.

How I'll work: go through every acceptance block in 13.1–13.14 and write a
criterion → where → how verified → status table; walk the whole loop in the
in-app browser with demo data (check-in → Gentle plan → Stuck → Unstick →
Focus → Bridge → strategy → re-check → patterns with evidence) at 390px and
1280px, light and dark; run the QA list from 16.4 as far as a machine can,
including Lighthouse accessibility if it runs here; re-read every string in
`en.ts` for tone; re-read every file header for the comment rules; and tick
the Definition of Done.

What could go wrong: finding gaps late. Anything I find I fix now; anything
only a person can check goes in TEAM_TODO.

## After Phase 10 — Full audit and fixes
2026-10-29, 10:09

**What I did**
- Walked the whole loop in the in-app browser with demo data at 390px:
  check-in with the scripted sentence → Drained and Frustrated → Adjust my
  plan → Gentle → Use this plan → Tasks → Move to… → Stuck → "I don't know
  where to start" → Do it first (3-minute walk) → I'm back → Better →
  Continue → Start 5 min → focus → Got going → Jump to bridge moment →
  Get ready → Patterns → Why am I seeing this? Then Today and Patterns at
  1280px in dark mode, every screen at 320px, and every screen and the
  check-in sheet at 150% text.
- Re-read every string in `en.ts` for tone, and every file header.
- Wrote the audit table, the 16.4 results and the Definition of Done below.

**What broke and how I fixed it**
- *A walk done twice counted one focus block twice.* After my own run the
  card read "6 of 7" instead of "5 of 6". Rule A now lets each focus block
  count once per strategy (D54). New engine test; I checked it fails on the
  old rule.
- *Back from "Do it first", the sheet offered the same walk again.* It now
  reopens on the same step without the offer, and after a reload it reuses
  the saved reason instead of asking "What's making it hard?" twice (D55).
  The Tasks flow test covers both; I checked it fails without the fix.
- *At 150% text the page was wider than the screen* on every tab (the top
  bar pushed "Menu" and the tab labels off the edge), on Proof log ("Add
  reward") and on Settings ("Remove campus support"). The badge now wraps
  under the title, buttons can shrink and wrap, and the reward row wraps
  (D53). All screens measure exactly the window width at 320px and at 390px
  with 150% text.
- *Sheet titles ran under the Close button* at 390px ("What might be behind
  it?" lost its question mark). `StepHeader` now reserves the same room
  `SheetHeader` already did.
- *The state chip's color dot sat alone on its own line* at 150% text. It now
  rides inside the text next to the state name.
- Lighthouse findings from earlier in this phase: notice color and
  label-in-name (D52).
- Headers: 15 test files had none, seven small files had one line, and
  eleven had six or more. All now have a 2–5 line header; the longer
  explanations became a separate block below it. Tone pass on `en.ts`: no
  emojis, no guilt or pressure words, no clinical labels; nothing to change.
- Housekeeping: a stale radio-group row in AI_ATTRIBUTION and a stale line in
  the walkthrough (providers no longer hold tooltips or motion config).

**Not a bug, but worth knowing**
- In `next dev` with the browser pane hidden, the Day Mode sheet took a few
  seconds to appear the first time (compiling the lazy chunk, throttled
  timers). On the production build the first check-in sheet opens in about
  330 ms, on localhost and with a slow-4G profile.
- Without an API key, the AI routes answer 503 `missing_key` and the app
  uses its fallbacks, as the spec says. The browser logs that 503, so
  Lighthouse best practices on /patterns is 96 on this machine; with the key
  set it goes away.

**Audit (13.1–13.14)**

| Criterion (section) | Where it lives | How I verified it | Status |
|---|---|---|---|
| Tab order TopBar → content → FAB → TabBar (13.1) | `shell/AppShell.tsx` | Read the focus order in the browser: skip link, top bar, content, Check in, tabs | Pass |
| FAB and tabs reachable and labeled (13.1) | `shell/CheckInFab.tsx`, `TabBar.tsx` | axe 0 violations; Lighthouse accessibility 100 | Pass |
| No layout shift between tabs (13.1) | `(app)/layout.tsx` keeps the shell mounted | Switched tabs in the browser | Pass |
| 320px, no horizontal scroll (13.1) | all screens | scrollWidth = 320 on all 9 routes; 390px at 150% text after D53 | Pass (fixed) |
| Onboarding redirect, "Demo data" badge (13.1) | `AppShell.tsx`, `TopBar.tsx` | Browser; Settings tests | Pass |
| Onboarding keyboard and screen-reader operable, prefs apply at once, skip from any step (13.2) | `onboarding/*` | Settings tests "walks three steps…", "can be skipped…"; Skip is in the header of every step; axe 0, Lighthouse 100 | Pass (screen reader by a person: TEAM_TODO) |
| Today with zero data, demo data, long titles (13.3) | `today/*` | TodayFlow "renders calmly with no data"; browser with demo data and a 120-character title at 320px | Pass |
| Time marker updates every minute from `now()` (13.3) | `lib/useNow.ts`, `TodayScreen.tsx` | Code: redraws every 30 s from the clock | Pass |
| BridgeCard appears at ≤ 15 minutes (13.3) | `lib/bridge.ts`, `BridgeBanner.tsx` | bridge.test; BridgeFlow "next event card, not a bridge, when > 15 min"; browser at 4:41 pm | Pass |
| Check-in with keyboard only (13.4) | `checkin/*` | CheckInSheet "can be completed with the keyboard alone" | Pass (the 60-second timing by a person: TEAM_TODO) |
| AI never auto-selects an emotion (13.4) | `StepHearing.tsx` | Flow 1; browser: three cards, none selected | Pass |
| "None of these" and own word (13.4) | `AllWords.tsx` | CheckInSheet "None of these…" | Pass |
| AI off → fallback words at once (13.4) | `lib/ai/fallbacks.ts`, `runAi.ts` | Flow 4; runAi "no network call when AI is off" | Pass |
| Safety path with a test phrase (13.4) | `lib/safety/*`, `CrisisScreen.tsx` | Flow 3; detect tests in English and Spanish | Pass |
| Saved check-in has the right quadrant (13.4) | `repo/checkins.ts`, `lib/quadrant.ts` | Flow 1; repo "computes the quadrant itself" | Pass |
| All task moves without drag; counts live (13.5) | `MoveToMenu.tsx`, `useTaskMoves.ts` | Flow 5; browser | Pass |
| Done tasks move back; long titles wrap (13.5) | `repo/tasks.ts`, `TaskCard.tsx` | TasksFlow "moves a finished task back"; browser at 320px | Pass |
| Unstick step changes with state; "Different step" is smaller; AI off works (13.6) | `UnstickSheet.tsx`, `fallbacks.ts` | TasksFlow "Different step…"; fallbacks "Ebb and Swell"; browser | Pass (D55 fix) |
| Focus timer right after backgrounding; outcome saved; reduced motion (13.7) | `focus/useFocusTimer.ts` | Flow 6; timer is start + pauses + `now()`; reduced-motion CSS checked | Pass (phone sleep by a person: TEAM_TODO) |
| Bridge at the scripted time; parking note saved and shown on return; rating; real numbers (13.8) | `bridge/*`, `rules/hardTransition.ts` | Flow 8; demo script test; browser ("3 of the last 4 times") | Pass |
| Every tool works with keyboard; reduced motion; re-check saved with context (13.9) | `toolkit/*` | Flow 9; Toolkit tests (from Unstick, reduced-motion dot, every strategy has a tool); axe on every tool | Pass (screen reader by a person: TEAM_TODO) |
| Card numbers equal engine output; dismiss persists; AI off (13.10) | `patterns/*`, `lib/patterns/*` | Flow 10; engine tests; cachedResponses "only their own numbers" | Pass (D54 fix) |
| Proof log by day, no counts, safety on typed wins, rewards (13.11) | `proof/*` | PatternsFlow proof tests; browser at 150% | Pass (D53 fix) |
| Settings sections, demo warning (13.12) | `settings/*` | Flow 11; "demo mode only after the warning"; browser | Pass (D53 fix) |
| Support: people, campus, crisis lines, "never contacts anyone" (13.13) | `safety/SupportScreen.tsx` | CrisisScreen tests | Pass |
| Day Mode: nothing deleted, toggles override, Undo exact, fallback (13.14) | `today/DayMode*`, `lib/daymode.ts` | Flow 7 (6 tasks before and after, Undo restores); schemas "rejects a dropped task"; fallbacks tests | Pass |

**QA checklist (16.4)**
- Keyboard-only: the check-in, task moves and Unstick are covered by flow
  tests; the tab order checked in the browser. A full run on a real keyboard
  is in TEAM_TODO.
- Screen reader: human-only, in TEAM_TODO.
- Reduced motion: with the setting on, computed animation and transition
  times are 0.001 ms; the OS setting uses the same rule; the breathing dot
  stays still (test). Pass.
- Text size 150%: three overflows and two cramped spots found and fixed;
  all screens and sheets fit at 390px. Pass.
- Dark mode: axe (contrast included) found 0 violations on all eight screens
  and the check-in sheet with dark mode emulated; walked Today and Patterns.
  Pass.
- AI off: flow 4 and the runAi tests. Pass.
- Offline: the demo script test runs twice with the network down; runAi
  "falls back on a network failure". This machine has no key, so every
  browser run today used fallbacks or saved answers. Pass.
- Safety: flow 3, detect tests in both languages, no text saved. Pass.
- Demo twice after Restart: the demo script test; once by hand in the
  browser today. Pass.
- Lighthouse accessibility (production build, mobile): 100 on Today, Tasks,
  Patterns, Settings and Proof log after today's fixes, and 100 on
  Onboarding, Toolkit, Support and /prompts-doc earlier in the phase. The
  Check-in sheet can't be reached by URL, so axe ran on it instead (0
  violations); Lighthouse on it is in TEAM_TODO.

**Definition of done (19)**
- [x] Every module and screen implemented; no stubs or "coming soon" (grep
  clean; team-name placeholders are only where the spec asks for them).
- [x] Core loop end to end (browser walk above, demo script test).
- [x] Every AI feature has a fallback; works with AI off and with no key
  (this machine has none).
- [x] Safety tested in English and Spanish; crisis screen; no text stored.
- [x] No keys in the repo or history (Phase 9 scan); no SDK code or API
  host in `.next/static`.
- [x] Accessibility as above; the person-only checks are in TEAM_TODO.
- [x] All copy in `en.ts` with mode variants; no hard-coded JSX text found.
- [x] Guard tests pass (clock, colors); no database write outside
  `src/lib/repo` (grep).
- [x] lint, typecheck, 148 tests and build clean.
- [x] Demo reproduces the script online and offline.
- [x] Every file has a 2–5 line header in the Section 1.7 voice.
- [x] README, CLAUDE.md, AI_ATTRIBUTION (every file covered), the log,
  DECISIONS, CODE_WALKTHROUGH, TEAM_TODO, architecture, demo script,
  research template, progress drafts, `/prompts` and `/prompts-doc`.
- [x] "Tide" everywhere.

**Decisions**
- D52 notice color and accessible names, D53 shrinking buttons and the
  wrapping badge, D54 one focus block per strategy, D55 Unstick after "Do it
  first".

**For the team**
- TEAM_TODO now lists the keyboard run (with the 60-second timing),
  Lighthouse on the check-in sheet, and a real-phone check at 150% text,
  dark mode, dictation and phone sleep during a focus block.

**Commit:** fe8587f fix(audit): fix what the Phase 10 audit found and write it up

## Where Tide stands
2026-10-29, 10:09

Everything in the spec is built and works end to end on one device: the
check-in with words or body cues, Day Modes, the task board with Unstick and
focus blocks, the Bridge between activities, the toolkit and its eight tools,
the pattern engine with evidence, the proof log, onboarding, settings,
support and the crisis screen, and demo mode with Maya's three planted
patterns. Every AI feature has a written fallback, so the whole app runs with
AI off or with no key, which is how it ran on this machine: I have never
seen a real model answer here. The routes are tested against a faked SDK.

The demo is reliable in the ways I can test: the 100-second script runs
twice in a row in tests with the network down, and I walked it by hand in the
browser today. Saved answers cover the scripted inputs if the venue Wi-Fi
fails.

What I would test first on a real phone: the check-in sheet with the
on-screen keyboard open, Dictate, the focus timer after locking the phone,
and 150% text with dark mode.

What didn't make it: the Today bundle is 267 KB against the 250 KB target
(D47); there is no deploy yet (no signed-in Vercel CLI here); and the
screen-reader pass needs a person.

The three things to do next:
1. Add the API key, try one real call per route, and deploy to Vercel
   (TEAM_TODO has the exact steps).
2. Verify the crisis numbers and the safety phrase list with the Challenge
   Partner.
3. Rehearse the demo on the presenting phone with Wi-Fi off, and record the
   backup video.

## Fix after Phase 10 — duplicate keys in the strategy steps
2026-10-29, 11:30

**What broke.** The team opened Box breathing from the Bridge before
Calculus, and the dev overlay showed "Encountered two children with the same
key, `Hold for 4.`". `StrategyRunner` used each step's text as its React
key, and box breathing has "Hold for 4." twice. Users saw both steps, but
React warns that it may drop or duplicate one, so it was a real bug.

**Why the tests missed it.** Flow 9 renders box breathing, but React only
logs this as a console error, and a console error doesn't fail a test.

**What I changed**
- Steps are keyed by position (the list never reorders).
- The same pattern could bite in the Bridge: prep items keyed by their text
  (Maya or the AI can repeat one, and ticking one would tick both), and the
  "you did …" lines keyed by strategy name (doing it twice repeats the
  name). Repeated prep items and names now show once.
- `src/test/setup.ts` turns any duplicate-key warning into a failed test. I
  checked that it fails flow 9 on the old code. The full suite found no
  other cases.
- A new test: a repeated prep item shows once and one tick checks one box.
- iCloud had written "file 3.ts" copies into `.next/types`, which broke
  typecheck; the tsconfig and .gitignore patterns now cover any digit.

**How I checked it.** lint, typecheck, 149 tests and the build are clean;
the box breathing page in the browser shows all five steps with no console
errors.

## Fix after Phase 10 — a clearer "Read aloud" voice
2026-10-29, 11:40

**What the team saw.** "Read aloud" was hard to understand. In the browser
they test with, the system default voice is Paulina (Mexican Spanish), and
Tide only set the language, never the voice, so English steps were read in
a Spanish accent.

**What I changed.** `speech.ts` now picks the clearest English voice the
device has (D56): a downloaded Premium or Enhanced voice if there is one,
then voices that read clearly (Samantha, Ava, Daniel…), preferring US
English and on-device voices, and never the Mac's novelty or robotic voices.
The buttons ask for the voice list on mount, since some browsers load it
late.

**How I checked it.** New `speech.test.ts` with the voice list from that
Mac: it picks Samantha, prefers "Ava (Premium)" or "Samantha (mejorada)"
when present, and picks nothing when only unclear voices exist. In the
browser pane, tapping "Read aloud" on Box breathing now uses Samantha in
en-US. lint, typecheck, 153 tests and the build are clean. I noticed the
read-aloud speed in that browser is set to Faster (1.2); I left the
setting alone.

## Fix after Phase 10 — "Read aloud" went silent and stuck
2026-10-29, 11:45

**What happened.** Right after the voice change, the team tapped "Read
aloud" and heard nothing, and the button stayed on "Stop reading". The
cause was my own check: to confirm the chosen voice without playing sound,
I had replaced `speechSynthesis.speak` in that browser tab with a silent
recorder and didn't reload the page afterwards. Their seven taps went to the
recorder. Reloading the page fixed it; a muted test utterance with Samantha
then started and ended normally. The app code was not at fault, and next
time I reload the tab right after a check like that.

**What I changed anyway.** It showed a real weak spot: if speech never
starts, the button waits forever. `speak()` now gives the button back after
3 seconds without a start, reports the end only once, and keeps a reference
to the utterance being read (Chrome can otherwise drop it and never say it
ended). Two new tests cover both cases. lint, typecheck, 155 tests and the
build are clean.

## Fix after Phase 10 — a gentler voice that says numbers in English
2026-10-29, 11:52

**What the team asked.** A gentler voice, and to stop "Breathe in for
cuatro": the words were English but the number was read in Spanish.

**Why the number was Spanish.** The browser runs in Spanish (es-MX), and
the Mac's speech engine reads digits in the system language even with an
English voice. Choosing a better voice couldn't fix that.

**What I built (D57)**
- `spokenNumbers.ts` writes numbers out in English before anything is read:
  "four", "three-minute", "five, four, three, two, one" for a countdown,
  "four fifty pm", "twenty-five percent".
- A calmer pace (0.9 of the chosen speed) and a ranking that puts soft
  voices (Ava, Zoe, Samantha, Moira…) above brisker ones. The voice choice
  moved to its own file, `voices.ts`.
- Settings → Comfort → "Read-aloud voice": Automatic or any readable
  English voice on the device, with "Try this voice". A saved voice the
  device lacks falls back to Automatic.

**How I checked it.** New tests for the number wording, the ranking, the
chosen voice and pace, and the picker (it lists the voices, saves the
choice, and shows Automatic for a missing voice). In the browser pane,
"Try this voice" handed the engine "Breathe in for four. Hold for four.
Breathe out for four." in Samantha's voice; I reloaded the page straight
after that check so the tab kept its normal speech. lint, typecheck, 164
tests and the build are clean. I can't hear voices from here, so which one
sounds gentlest is for the team to judge with "Try this voice".

---

# Tide v2 — the Experience Upgrade

## Before Phase V0 — Baseline and safety net
2026-10-29, 15:32

The team asked me (Claude Code; all of this code is AI-generated) to turn
Tide into version 2 from `docs/TIDE_V2_UPGRADE_PROMPT.md`: companions,
themes, motion, sound, natural voices, a shore of wins, Close the day, a
much bigger Settings and a Demo button. The prime directive is to add all of
it without breaking what works today, and voice dictation is frozen.

For Maya, V0 changes nothing she can see. It's the net under everything
else: a green baseline I can compare against, a `v1-baseline` tag to go
back to, a `v2-experience` branch to work on, an inventory of what exists
so nothing quietly disappears, a test that fails if anyone touches
dictation, and `npm run test:v1` to run the v1 tests on their own.

Two places where I won't follow the v2 spec to the letter, and why:
- The spec's commit convention adds an `AI-Generated: Claude Code`
  trailer. The team told me never to put AI marks in commit messages and
  to commit as the configured Git user (DDG29), so commits carry no
  trailer. AI attribution stays in this log and AI_ATTRIBUTION.md.
- Read-aloud already got a better voice choice today (D56, D57) inside
  `src/lib/speech.ts`, next to dictation. In V2 I'll move that work into
  the new `src/lib/voice/` engine instead of growing `speech.ts`, which I'll
  treat as frozen from now on.

## After Phase V0 — Baseline and safety net
2026-10-29, 15:37

**What I did**
- Recorded the baseline: lint, typecheck and the build are clean; 33 test
  files with 164 tests pass; first-load JS for `/` is 267 KB gzipped
  (`/tasks` 277, `/toolkit` 262, `/settings` 310, `/patterns` 351). The
  tree was clean, so there were no team changes to save first.
- Tagged `v1-baseline` on `main` (e781f49) and created `v2-experience`.
- Copied the v2 spec into `docs/TIDE_V2_UPGRADE_PROMPT.md` and wrote
  `docs/V1_INVENTORY.md`.
- Froze dictation: `src/test/frozen-dictation.test.ts` hashes the five
  dictation declarations in `speech.ts`, the whole DictateButton and the two
  labels. I checked it fails on a one-space change, then restored the file.
- Added `npm run test:v1` (33 files, 164 tests, green),
  `scripts/measure-first-load.mjs`, `CHANGELOG.md` and the v2 rules in
  CLAUDE.md.

**What broke and how I fixed it**
- My first `test:v1` config ran 34 files: Vitest's `mergeConfig` appends
  include lists. The list now replaces the base glob.
- Typecheck refused to import `vitest.config.mts`; I enabled
  `allowImportingTsExtensions` (the project never emits, so it's safe).

**Decisions:** D58 (no AI trailer in commits), D59 (how the v1 suite and the
freeze work), D60 (measuring first-load JS; 33 KB of headroom).

**For the team:** nothing new to do. If v2 ever needs undoing, `v1-baseline`
is the last v1 state.

## Before Phase V1 — Design system 2.0 and themes
2026-10-29, 15:59 (logged late: I started building at 15:40 and only wrote
this entry once the phase was nearly done. The plan below is the one I
followed.)

For Maya this is the phase where Tide starts to feel like a finished,
friendly app: rounded headings, chunky cards, buttons that press down, and
colors she picks from 15 themes, including low-stimulation and high
contrast. What it touches in v1: every screen's look, the settings
provider, the first-paint script, the tab bar and the shared UI components.
How I avoid breaking it: no behavior or v1 API changes (Button keeps every
v1 variant and size; ToggleChip, Switch and Sheet keep their props), v1
users keep exactly the v1 look through a migration, the v1 controls still
on screen keep working, and `test:v1` runs after every step.

## After Phase V1 — Design system 2.0 and themes
2026-10-29, 16:01

**What I built**
- The 15 themes and 4 quadrant palettes (`src/lib/theme/`), painted onto
  `<html>` as CSS variables with a 250ms crossfade between themes, "follow my
  device" with separate light and dark picks, and a first-paint script that
  replays the exact colors before any bundle loads.
- Nunito and Lexend fonts with the four pairings, bold text, roundness and
  density hooks.
- Motion: tokens, the off/calm/lively resolution, CSS springs (D62), and
  motion Off in one CSS block.
- The v1 → v2 settings migration (D63): existing users keep Classic, Classic
  Dark and Hyperlegible; new users get Lagoon and Playful.
- Components: 3D Button (all v1 variants kept, plus primary, accent,
  quadrant and loading), Card/CardButton, Chip, ProgressBar,
  SegmentedControl, CoachMark, EmptyState, IconTile, QuadrantDot (shapes
  for the color-blind palette), restyled Switch, Sheet (drag handle), Dialog
  and toasts.
- The shell: five tabs with a sliding pill, the 3D Check in button that
  breathes only at Lively, and the Shore tab with its real empty state.
- Settings → Appearance with the theme grid (live mini previews), fonts and
  motion level. Every v1 screen restyled through the shared components and
  a card-pattern pass, without behavior changes.

**How I checked it**
- lint, typecheck, 37 files / 227 tests and the v1 suite (33 / 164) green;
  clean build. New tests: contrast for all 15 themes (46 checks), the
  migration, motion resolution.
- First-load JS for `/`: 272 KB gzipped (+5 KB over the baseline, under 300).
- In the browser pane at 390px: Today, check-in sheet, Tasks, Toolkit,
  Patterns, Proof log, Support, Focus and onboarding in Lagoon + Playful;
  Today and Patterns in Midnight Tide (device dark); Patterns in Ink, where
  47 shape markers replaced the dots; the board at 1280px. The pane holds
  the team's own test data, which loaded as Classic + Hyperlegible through
  the migration. I switched it to Lagoon to review and switched it back
  afterwards.

**What broke and how I fixed it**
- Two theme accents failed contrast with white text; darkened (D61).
- My first pass made `settings.tsx` and `useMotionLevel.ts` import each
  other; the pure resolver moved to `motion/resolve.ts`.
- The card-pattern pass turned `bg-surface-2` into a nonsense `card-2`
  class in one place; fixed by hand.
- The v1 Light/Dark buttons would have stopped doing anything once the
  migration was saved; they now write the v2 keys too.

**Decisions:** D61–D66.

**Known gaps (on purpose):** Settings is still one page with v1 sections
plus Appearance until V9; onboarding is still v1's until V6.

## Before Phase V2 — Sound, haptics and voice
2026-10-29, 16:03

For Maya: Tide can make soft sounds if she wants them (off by default), give
a tiny vibration where her phone supports it, and read things aloud in a
voice that sounds like a person: the best voice her device has, text
rewritten for speech, long text split so Chrome doesn't cut it off, and,
if the team adds a key, cloud neural voices. Box breathing can speak its
cues.

What it touches in v1: ReadAloudButton (switches to the new voice engine),
the read-aloud voice picker from D57 (becomes Settings' voice picker), the
box-breathing tool, the toolkit's message tool, and the settings keys.
How I avoid breaking it: dictation and `src/lib/speech.ts` stay untouched
(the old `speak()` there remains as the last fallback), the new engine
lives in `src/lib/voice/`, sound is lazy-loaded and silent unless enabled,
and the read-aloud improvements the team asked for today (numbers said in
English, a calm pace, gentle voices first) carry over into the new engine.

## After Phase V2 — Sound, haptics and voice
2026-10-29, 16:33

**What I built**
- The sound engine: every sound synthesized with Web Audio (taps, toggles,
  chimes, shore sounds, six companion chirps, breath cues, a focus bell),
  three seamless ambiences, categories and volume, nothing before a real
  gesture, at most three at once, loaded only when sound is on (D69).
  Primary buttons, switches, chips, cards and the Check in button give
  feedback; the crisis screen and support page stay silent.
- Haptics where supported, with "Not supported on this device" elsewhere.
- The voice engine in `src/lib/voice/`: the spec's ranking (with today's
  additions, D67), speech-ready text with every 7.4 rule, chunking at 180
  characters, the browser engine with Chrome's keep-alive and a 2-second
  no-start fallback, the cloud engine with Cache Storage and a 200-clip
  limit, the clips engine, and one-voice-at-a-time coordination.
- `/api/tts` and `/api/tts/status` for OpenAI or ElevenLabs, with request
  shapes checked in their docs (D68), validation, rate limiting and a log
  line without the text. `.env.example` lists the new variables.
- Settings → Voice (engine, device voices with samples, cloud voices when
  configured, speed, accent, three switches) and Settings → Sound &
  haptics. Box breathing speaks its cues when asked.
- `npm run voice:clips` (with `--dry-run`): 60 texts today, about 1.4 MB.

**How I checked it**
- lint, typecheck, 43 files / 274 tests and the v1 suite (33 / 164) green;
  clean build; the freeze test still passes (dictation untouched).
- New tests: speech text (19 rules), chunking, ranking with voice lists
  from six platforms, the engine's fallback order and one-voice rule, cache
  keys, the sound engine's gesture and category rules, the TTS route
  (validation, both providers, no key, no text in logs), flow test 15
  (Read aloud), and Settings → Voice.
- In the browser pane: the voice list shows this Mac's real voices
  (Samantha, Moira, Daniel, Karen, Tessa, Rishi; no novelty voices), and
  "Play sample" on Moira sends the sample sentence to Moira at 0.9 with
  pitch 1. I intercepted the call so nothing played out loud, and reloaded
  the tab straight away this time.
- I couldn't test a real cloud voice: there's no provider key here. The
  route is tested against faked provider responses.

**What broke and how I fixed it**
- Flow test 15 caught "Stop reading" never appearing (D72).
- The old D57 picker's test failed once read-aloud moved to the new
  engine; replaced with a test of Settings → Voice (D71).

**Decisions:** D67–D72.

## Before Phase V3 — Companions (engine and art)
2026-10-29, 16:35

For Maya: a small companion to keep her company (Pebble the otter, Lolo
the axolotl, Capi the capybara, Zip the gecko, Luma the jellyfish, Shelby
the hermit crab) or no companion at all. It breathes, blinks, reacts to what
she tells it, has a few kind lines in her communication mode, and never
looks sad or makes her feel she owes it anything. In this phase I build the
characters, their expressions, accessories and lines, the event bus that
will let the rest of the app talk to them, and the Companion Studio page;
V4 places them across the app.

What it touches in v1: nothing that exists yet, except new settings keys
and copy. How I avoid breaking things: everything is new files; the
companion art loads lazily, one species at a time, so first-load size stays
put; existing users get no companion until they choose one.

One design call up front: the spec suggests framer-motion variants for the
animation. I'll animate with CSS transforms and keyframes instead (same
motion, nothing added to the bundle, pausable with one attribute), and log
it as a decision.

## After Phase V3 — Companions (engine and art)
2026-10-29, 20:55

**What I built**
- Six original companions drawn as SVG, one file per species
  (`src/components/companion/species/`), each loaded only when needed. They
  share one face (`parts/Face.tsx`), so every species has all 14
  expressions with the same eyes and mouths, and one set of 12 accessories
  (`parts/Accessory.tsx`) that sit on each species' head, face, neck or back.
- The registry (`src/lib/companion/registry.ts`): names, four color
  variants each, attachment points, sounds, placements and sizes.
- Animation in CSS (`companion.css`): breathing, blinking, a lively bob,
  expression fades, poses, one-shot reactions, each species' signature
  idle, focus activities, breath sync and walking. Only the biggest
  companion on screen loops; the others hold still, and everything pauses
  off screen or in a hidden tab.
- Every line in Appendix B (`src/copy/companions.ts`), plus shared Direct
  and Literal lines, picked by day so a line doesn't flip between renders.
- `useCompanion`, the typed event bus and `CompanionHost`, which turns
  events into an expression, a reaction and a line, and settles back after
  4 seconds. V4 puts hosts on the real screens.
- The speech bubble, the "no companion" wave, and the Companion Studio at
  `/companion`: a little shore with the companion at 180px (tap it for a
  wave, a hop, a wiggle and its signature move), the name with gentle
  validation, Look / Personality / Where it appears / Voice tabs, a
  one-breath preview with the companion leading, and an About paragraph.
  Species and name changes come with Undo. Settings got a Companion row
  that opens the Studio.
- A dev-only gallery at `/dev/companions` (a 404 in production builds).

**How I checked it**
- Lint, typecheck, all 48 test files (320 tests), the v1 suite (33 files,
  164 tests) and the build are green. The freeze test still passes.
- New tests: registry completeness, lines for every species and moment,
  placeholders filled in every mode, a scan of `companions.ts` for the
  forbidden phrases, name rules, every species drawing every expression in
  every color and wearing each accessory once, the figure's screen-reader
  name, and spec flow test 4 (Studio: species, name, color, accessory,
  Undo) plus "none" as a real choice.
- In the browser pane at phone width I looked at every species in the
  gallery in all sizes, colors and accessories, then used the Studio:
  picked Pebble, tapped her, tried colors and accessories, ran the breath
  preview, heard a line in the bubble, went through the tabs and switched
  to Lolo. Afterwards I removed the companion settings I had changed in
  that browser.
- Not checked yet: dark themes and motion Off/Lively side by side in the
  gallery for every species. I looked at a few; V11's visual pass covers
  the rest.

**What broke and how I fixed it**
- Companions that weren't the "loop leader" lost their eyes: the pause
  rule froze the 120ms fade-in at opacity 0. The pause now skips the fade.
- Accessories drew twice on some species, because one call covered every
  slot; each call now names its slots.
- The calm "half" eye read as unimpressed with a flat lid. I curved the
  lid so it reads as relaxed.
- In the breath preview the eyes stayed shut on the out-breath; the spec
  says they open, so the breathing face now rests on soft open eyes and
  closes only on the in-breath and its hold.
- The species row in the Studio snapped its first card against the screen
  edge; scroll padding fixed it.
- A line test failed because the test didn't pass the minutes value. My
  test, not the copy.

**Decisions:** D73–D77.

## Before Phase V4 — Companions across the app
2026-10-29, 21:02

For Maya: the companion she chose shows up where it helps. It waves on
Today, listens while she types a check-in and reacts gently to how she
feels, keeps her company during a focus block, packs a bag before a switch,
and breathes with her in box breathing. It never appears on the crisis
screen.

What it touches in v1: Today's header, the check-in sheet, Unstick, the
focus page, the Bridge, the toolkit tools and re-check, Patterns, the
support page and empty states, plus new error and 404 pages. How I avoid
breaking them: each screen gets one `CompanionHost` and a few
`emitCompanion` calls, nothing in the flows themselves changes, and someone
who hasn't chosen a companion yet (every existing user until V6's What's
new) sees exactly the v1 screens: no companion and no wave alternative.
Only an explicit "none" shows the calm wave alternatives. The v1 suite runs
after each screen.

## After Phase V4 — Companions across the app
2026-10-29, 21:40

**What I built**
- Today: the companion sits right of the greeting, waves and says hello
  once per part of the day, reacts to check-ins and finished tasks, and
  opens the Studio when tapped. Other tabs show its head in the top bar
  (also a way into the Studio); Today and the support pages don't.
- Check-in: a row at the top of the sheet with the companion and its line
  ("I'm listening. Take your time."). It listens while Maya types or
  dictates (a typing signal that settles 400ms after the last key), looks
  thoughtful while the AI works and curious when the words arrive. Saving
  sends `checkinSaved`; Today's companion leans in softly for Surge and Ebb,
  hops for Swell, stays calm for Still, and the "Checked in" toast carries
  its head.
- Unstick and the Bridge: the same top row; soft then happy in Unstick,
  packing its bag in the Bridge.
- Focus: beside the water fill at size L, doing its own little task (body
  doubling), proud after "Got going", soft after "Didn't start".
- Toolkit: in the middle of the box-breathing square, breathing with the
  exact phases (the square grows to fit; the dot stays); a small one in the
  corner of grounding, the sudoku, the message template and the walk timer
  (walking along the top at Lively); beside the re-check answer, glad,
  calm or soft.
- Patterns: a small curious companion by the title that never reacts to a
  pattern. The everyday support page: a small soft one. The crisis screen:
  none, anywhere.
- Empty states, a new error page and a new 404 use the companion (soft on
  the error pages) or the wave. A splash shows the wave mark while settings
  load, fading in only if loading takes longer than a blink.
- `useAi` now tells the companion when Tide is thinking, so every AI screen
  gets that for free. A small `nudge` event lets tools ask for a look.

**How I checked it**
- Lint, typecheck, 51 test files (325 tests), the v1 suite (33 files, 164
  tests) and the build are green.
- New tests: spec flow test 7 (typing → `listening`; saving an Ebb
  check-in → Today's companion `soft` with a lean), the v1 check-in with no
  companion chosen (no companion, no wave), the crisis screen and its top
  bar with a companion chosen (nothing drawn), the support page's soft
  companion, and the error page.
- First-load JS for `/`: 285 KB gzipped (V3 was 274; the budget is 300).
- In the browser pane at phone width, with Pebble: Today's header, the
  check-in row and its listening face while typing, box breathing with
  Pebble breathing in the square, and the top-bar head on Toolkit. I set
  that browser's settings for the check and removed them afterwards. I
  didn't answer the re-check there, so as not to save a record in it, and
  I didn't run a focus block in the browser; tests cover both.

**What broke and how I fixed it**
- The first budget measurement was 320 KB. The root error page wraps every
  screen and pulled in the companion lines, the voice engine and a second
  copy of the copy catalog (about 19 KB on its own); the top bar pulled in
  all the Studio words for one label. The error page now loads its content
  only when an error happens, decorative companions load just after the
  page, the Studio words moved to their own file, and Today's host loads
  lazily (D83).
- My first sheet layout put the companion in the top corner. In the
  browser it sat under the 110px-wide Close button and its bubble hid the
  step title. It's now a row above the step with the line beside it (D80),
  and the v1 headers are untouched.
- A test saw a "no companion" wave where there shouldn't be one: a toast
  left over from the previous test. Not an app bug; the test now looks
  only inside the sheet.

**Decisions:** D78–D85.

## Before Phase V5 — Celebrations and micro-interactions
2026-10-29, 21:45

For Maya: finishing something should feel good, but the celebration has
to fit the day she said she's having. Swell gets sparkles and, for big
moments, confetti; Ebb gets a soft glow and "That counted."; Surge gets one
slow ripple and "Done. One less thing." Nothing pops up while she's
breathing, typing or on the support pages.

What it touches in v1: the places where wins happen (check-in, task moves,
focus, Bridge, transition rating, re-check, Unstick). How I avoid breaking
them: each place calls `celebrate()` after its own work is done, the v1
toasts stay as they are (only a hard-day title replaces "Done. Added to
your proof log.", with the proof-log note kept underneath), and
celebrations draw in one host outside every screen. The overlay and
particles load only when a big moment happens.

## After Phase V5 — Celebrations and micro-interactions
2026-10-29, 22:10

**What I built**
- `src/lib/celebrate/`: the matrix (tier × state, then motion level and
  settings), frequency caps, the words (Gentle, Direct, Literal, and no
  companion name when there's no companion), a small store with the
  "hold" rules, and `useCelebrate()`, which plays a decision: the effect or
  overlay, the sound, the companion's reaction, a toast when words are
  needed, and a screen-reader announcement.
- `CelebrationHost` (mounted once in the providers): small effects in CSS
  (pop, glow, sparkle burst or ring, ripple) and, lazily, the big overlay
  with the companion (or a sparkle ring), title, message and Continue,
  plus a small canvas particle system for confetti, sparkles and bubbles.
- Wired events: check-in saved, task started, task done (big when it was
  stuck or costs 3), unstuck, focus done, Bridge done, transition rated
  easy/okay, re-check Better, and firsts (first check-in, focus block,
  strategy, switch, small first step). Close the day and bottles come with
  V7 and V8.
- Motion: a page-enter transition for every tab (`template.tsx`), a
  slide-up for Focus and the Companion Studio, and emotion candidates that
  arrive one after another. The tab indicator, button press, card select,
  switch spring, tab bounce and FAB breath came with V1.
- `/dev/celebrations`, a dev-only page that plays any tier and state.

**How I checked it**
- Lint, typecheck, 53 test files (339 tests), the v1 suite (33 files, 164
  tests) and the build are green.
- New tests: the matrix for every tier, state and motion level (no overlay
  on hard days, ever; confetti only at Lively; Off turns movement into
  words), the settings, the caps, and spec flow test 8 (Swell → small
  sparkle burst; Ebb → "That counted." and no overlay), plus a big task in
  Swell (overlay, focus on Continue, Escape closes), a big task on a low
  day (kind words, no overlay) and the hold rule.
- In the browser pane at phone width (Calm): the small Swell ring, the
  Surge ripple, and the big overlay with sparkles and the sparkle ring.
- Performance: first-load JS for `/` is 289 KB (V4: 285). During the big
  overlay with particles the page ran at 61 fps on average, worst frame
  19 ms, measured with requestAnimationFrame in the pane at Calm. I could
  not run Chrome DevTools with 4× CPU throttling from here, so the spec's
  throttled 50 fps check on a mid-range phone is still open (TEAM_TODO).

**What broke and how I fixed it**
- At Calm, a sparkle burst with no travel drew all eight sparkles on top
  of each other, so it looked like one. At Calm a burst is now a ring.
- A hook call ended up inside a condition while fixing that; lint would
  have caught it, I moved it first.
- A test used a task type that doesn't exist ("reading"); typecheck
  caught it.

**Not done in this phase (honest list)**
- From the micro-interaction catalog: the task card's water ripple when
  marked done, cards gliding between columns (`layout` animation), number
  count-ups, the checkbox stroke draw and the mood-map dot squash. They
  need framer-motion on screens that don't load it today, and the budget
  is tight; I'll revisit them in V11's polish pass.

**Decisions:** D86–D90.

## Before Phase V6 — Onboarding 2.0 and What's new
2026-10-29, 22:15

For Maya: setting Tide up should feel like making a profile (her name,
her companion, how her senses like things, her colors, her day) without
any account, and every choice should show its effect right away. For
someone who used v1: nobody is pushed through onboarding again; they get a
short "What's new" once, and keep their look until they choose.

What it touches in v1: the onboarding screen (replaced by twelve steps,
spec 3.5 allows this), its two tests (navigation only), the check-in
sheet (two optional props for the coached first check-in), Today (a card
for v1 users) and the menu. How I avoid breaking things: v1 copy keys
stay, the check-in sheet behaves exactly as before without the new props,
and "What's new" never shows in demo mode, so the scripted demo test sees
the same screens.

## After Phase V6 — Onboarding 2.0 and What's new
2026-10-29, 22:40

**What I built**
- Twelve onboarding steps with a progress bar, Back, Skip and "Skip
  setup" (in a menu at the top right), resuming at the saved step:
  welcome (all six companions waving on a beach), your name (with a live
  greeting preview), choosing a companion (a one-card-at-a-time carousel
  with "Say hi", arrows, swipe and dots), naming it, dressing it, the
  senses presets (applied at once) with the sounds switch, colors (the
  theme grid), how Tide talks (with the companion) and reading level,
  read-aloud (three best voices, speed, yes or "No thanks"), your day
  (start, close, switch warning, 12- or 24-hour clock), privacy, and
  finally someone you trust, the first real check-in with hints at each
  step, and the welcome shell on a little shore.
- The presets from spec 15.3 (`lib/settings/presets.ts`) and the "Skip
  setup" defaults (Lagoon, Playful, Calm, sound off, Lolo in pink).
- The welcome shell is a win with `kind: 'welcome'`; the Shore draws it
  in V7. Firsts are recorded in a `firsts` setting (D92).
- "What's new" for v1 users: six pages, each with "Set it up" and "Maybe
  later", shown once in the app (never in demo mode) and any time at
  `/whats-new`; "Try the new look" applies Lagoon and Playful. A "Choose a
  companion?" card on Today until they pick one or say "No thanks". The
  menu gained "My companion" and "What's new".
- The Bridge's lead time now follows the "Warn me before switching"
  choice (15 minutes stays the default, as in v1).

**How I checked it**
- Lint, typecheck, 54 test files (343 tests), the v1 suite (33 files, 164
  tests) and the build are green.
- Spec flow tests 1–3: all twelve steps with the keyboard, through the
  real first check-in to "Go to my day" (choices saved, one welcome win,
  the first check-in recorded, Lolo on Today); "Skip setup" defaults; and
  "What's new" appearing once, with "Try the new look". Also: resuming at
  a saved step.
- The two v1 onboarding tests now navigate twelve steps; they still check
  that a dark theme applies at once, a trusted person is saved, and the
  whole thing can be skipped from the first step (spec 3.5).
- In the browser pane at phone width: the welcome beach, the name step,
  the carousel with "Say hi", naming Lolo, and the senses presets. I put
  that browser's onboarding progress and companion back afterwards.
- First-load JS: `/` 291 KB, `/onboarding` 288 KB.

**What broke and how I fixed it**
- The keyboard test typed "Maya" and saved "Maa": the name field was
  bound to the saved setting, which arrives a moment later, so fast typing
  lost letters. The field now keeps its own text. v1's Settings name field
  had the same bug; I fixed it the same way.
- "Say hi" said "Good morning!" at 9 pm; hellos now follow the time of day
  (also in the Studio's samples).

**Not done in this phase (honest list)**
- "Watch the demo" and "I've used Tide before" on the welcome step: the
  demo workspace (V10) and backup import (V9) don't exist yet, so the
  buttons would lead nowhere. They come with those phases.

**Decisions:** D91–D95.

## Before Phase V7 — Your Shore
2026-10-29, 22:45

For Maya: the Proof log becomes a place. Every win washes up on a little
beach (a scallop for a studying task, sea glass for a switch that went
okay, a starfish for a strategy that helped), firsts are pearls, and she
can write a kind note to her future self that floats in the shallows until
a hard day. No totals, no goals, nothing ever lost.

What it touches in v1: the database (Dexie version 2, with an upgrade that
keeps every row), the functions that create wins (they now also say what
kind of win it is), the Proof log's add-win form, Today (a bottle card and
a shore strip), and "Delete everything"/export (the new tables). How I
avoid breaking things: the upgrade is tested against a real v1 database,
win texts and counts don't change, and the v1 suite runs throughout.

## After Phase V7 — Your Shore
2026-10-29, 23:25

**What I built**
- Dexie version 2: `bottles` and `dayWraps` tables, a `kind` index on
  wins, the new task indexes, and an upgrade that infers each old win's
  kind (and the task's type and energy for task wins). Wins created from
  now on carry `kind` and `meta`.
- The item catalog (`src/data/shoreItems.ts`): 14 kinds, each decided by
  the win, never by chance, with its words and how it arrives. Small flat
  drawings for all of them (`ItemArt.tsx`).
- Placement (`lib/shore/placement.ts`): 48 spots, oldest first, a hashed
  spot per item with jitter, tilt and size; deterministic, never closer
  than 30px, and a new item never moves the others. Beyond 48: the most
  recent 48 and "+n more in your collection".
- The scene (`ShoreScene.tsx`): sky by time of day (dawn, day, golden
  hour, dusk, night with stars; approximate sunrise and sunset for
  Monterrey), the sun or moon on its arc, clouds, three waves with foam,
  sand, dune grass, items as keyboard buttons (Tab, arrows, Enter), bottles
  bobbing (the one ready to open glows), and the companion at the
  waterline, asleep at night. Things that arrived since the last visit
  wash in one by one (up to six); at Off they just appear and a screen
  reader hears what's new.
- The Shore screen: Today / This week / All, the details sheet for each
  item, "Write a note to future you", "Save as image" (with "Include my
  name"), Collection and List links, and a skip link to the list.
- Messages in a bottle: write (with dictation and the safety check first),
  surface (a day old, on an Ebb or Surge day, one a day, oldest first),
  open (keep → a bottle win on the sand; let it drift → still readable in
  the Collection). A Today card when one surfaces.
- The Collection page: a field guide with counts and first-found dates,
  soft outlines and "how it arrives" for kinds not found yet, released
  notes and pearls. No progress bar, no percentages.
- A shore strip on Today with a "New" pill (never a number).
- `/dev/shore`, a dev-only page with every item on the sand.

**How I checked it**
- Lint, typecheck, 57 test files (357 tests), the v1 suite (33 files, 164
  tests) and the build are green.
- New tests: every win kind → item; placement determinism, 30px minimum
  with all 48 spots used, append stability and overflow; sky phases and
  colors; item outlines at least 3:1 on every theme's sand; the Dexie
  v1 → v2 upgrade with real v1 rows; bottle eligibility; spec flow tests 9
  (studying task → scallop → details) and 10 (write → Ebb a day later →
  Today card → open → keep → bottle win).
- In the browser pane at phone width (`/dev/shore`, dark theme): every
  item on the sand, bottles in the water, waves, grass.
- First-load JS: `/` 293 KB, `/shore` 309 KB.

**What broke and how I fixed it**
- A placement test found two items 29.6px apart: rows needed 42px, not 40.
- Item outlines failed contrast on dark themes' sand; they now follow the
  theme (dark on light sand, light on dark sand). My first try used a CSS
  variable, which the browser never saw: the stylesheet build drops a
  variable that only components reference. I checked the served CSS,
  confirmed it, and moved the choice into the component.
- A test found a note from the previous test still there: "Delete
  everything" (and the test reset) didn't know about the new tables. Now
  bottles and wrap-ups are deleted and exported with everything else.
- The guard test caught `Date.now()` in a new test; it uses `realNow()`.
- Today went to 303 KB; the shore strip and the bottle dialog now load
  after the page (293 KB).

**Simplified or not done (honest list)**
- New items wash in along a short curve with a squash, but the front wave
  doesn't swell and the companion doesn't walk over to them; it notices
  them (curious, then its line).
- "Waves follow my check-in" (`shore.mirrorCheckins`, off by default) is
  not built yet; it comes with Settings 2.0.
- "Save as image" leaves the companion out: it's drawn as HTML inside the
  scene, which can't be painted onto the image reliably.
- Collection and List are links at the top of the Shore page, not buttons
  in the top bar, which is shared by every tab.
- Writing a bottle from the Proof log isn't there yet; from the wrap-up it
  comes with V8.
- The 50 fps check with 48 items under CPU throttling is in TEAM_TODO.

**Decisions:** D96–D101.

## Before Phase V8 — Close the day
2026-10-29, 23:30

For Maya: a short evening ritual with her companion, about three minutes
and all of it skippable: see the day as a tide, let the wins wash up, say
what helped and what was hard, decide what to do with loose ends, pick one
thing for tomorrow with its first step ready, and get a kind summary. It is
never required, never nagged about, never scored.

What it touches in v1: the AI layer (a sixth route), the tasks repo (new
helpers only), Today (two new cards), the board (a Someday list), the
pattern engine (one optional rule) and the prompts document. How I avoid
breaking things: new route and rule are additive, v1 pattern calls give
identical results (tested), Today only hides tasks v1 never had (someday,
snoozed), and the v1 prompts document and its test stay as they were.

## After Phase V8 — Close the day
2026-10-30, 00:40

**What I built**
- `/wrap`, thirteen steps with a progress bar, Close and "Skip this step",
  a sky that goes from golden hour to night, and the companion on every
  step (calm, soft on "what was hard", sleepy, asleep at the end). Saved
  after every step; resumes where it stopped; a closed day reopens at its
  summary. After midnight and before the day starts it still counts as
  "tonight".
- The steps: arrive; an optional evening check-in (mood map and quick
  words, saved as a regular check-in); the day as a tide (a smooth line
  that never overshoots a check-in, with a list view and a full text
  description); wins; what helped and what was hard (chips, with
  "Something else" in her own words, which stay on the device and go
  through the safety check); overall (Stormy to Glassy, plain words in
  Literal mode); loose ends (tomorrow, later this week, let it go to
  Someday, keep as is); tomorrow (events, a heads-up from the pattern
  engine for a switch that's often hard, one thing to start with and a
  first step from the Unstick route); a note in a bottle; the summary;
  winding down (a slow minute of breathing, emptying your head into tasks
  for tomorrow, or rest); goodnight (driftwood on the shore and a
  celebration that fits the evening).
- `/api/ai/wrapup`: zod in and out, the prompt (`prompts/06-wrapup.md`),
  checks for judging words, invented numbers and quoted titles that don't
  exist, a template fallback, a cached answer for the demo evening, and a
  v2 section on `/prompts-doc`. Her notes are never part of the input.
- Today: the evening card (from half an hour before her closing time,
  "Not tonight" hides it until tomorrow, "Day closed" with Reopen
  afterwards) and the morning card ("Your one thing today" and its first
  step, until noon). "Close the day" in the menu.
- Someday under the board with "Bring back", "Back on …" on snoozed
  tasks, and both kept off Today.
- Patterns: the `wrap_helped` rule and "What's been hard" (top two, from
  three closed days).

**How I checked it**
- Lint, typecheck, 60 test files (376 tests, three full runs in a row),
  the v1 suite (33 files, 164 tests) and the build are green.
- New tests: the wrap-up schema and checks, the prompt naming exactly the
  schema's fields, the fallback (including an empty day), the route with
  the SDK faked, the day boundary, the line never overshooting, "later
  this week", `wrap_helped` (shows, stays quiet, v1 parity) and "What's
  been hard"; spec flow tests 11 (all the way through with the AI mocked,
  then the morning card the next day) and 12 (resume at step 6).
- In the browser pane: the first step with Lolo and the golden sky. I
  removed the wrap record my visit created. (That browser is now set up
  by someone on the team, so I kept my visit short.)
- First-load JS for `/`: 296 KB, close to the 300 KB line.

**What broke and how I fixed it**
- "Couldn't play the voice on this device" popped up on its own when the
  companion's line couldn't be spoken. That message is for when someone
  presses Read aloud; companion lines now fail quietly.
- React running the start effect twice in development tried to create
  the same day twice (a ConstraintError in the console). Starting a wrap
  is now one transaction.
- The fallback summary said "2 times" and my own check rejected it,
  because 2 wasn't written in the input. Counts of the input's lists are
  facts too, so they're allowed (D102).
- The flow test failed only when the whole suite ran: it pressed Next on a
  step that was already leaving, which skipped a step under load. The test
  now waits for each step's title. (In the app, a double tap only moves
  one step.)
- Time-based tests set the demo clock, which the settings provider resets
  outside demo mode, so they were passing by luck. They now fake only
  `Date` (D105); the Shore tests too.
- Today went to 308 KB: the morning card pulled in the full companion
  host. It uses the light, lazy companion now (296 KB).

**Simplified or not done (honest list)**
- The tide line is one color with each check-in's dot in its state's
  color, not segments colored by state; the event row uses one kind of
  mark, not a shell/drop/starfish per event.
- Quick words in the evening check-in are twelve common feeling words;
  the 16-word simple vocabulary comes with Settings 2.0.
- The tomorrow heads-up uses the engine's own numbers ("felt hard 3 of
  the last 4 times") rather than "last time, box breathing helped", and
  the summary isn't given that hint yet.
- The wins step lists today's items with their drawings rather than a
  small animated shore; goodnight darkens the sky but doesn't animate a
  moon rising.
- Loose ends undo by choosing "Keep as is", which puts the task back
  exactly; there's no separate Undo button.
- Today's quick actions row (spec 12) isn't built yet.

**Decisions:** D102–D106.

## Before Phase V9 — Settings 2.0
2026-10-30, 01:00

For Maya: one place to make Tide fit how her senses and her days work,
without hunting. A search that understands "dark mode" or "pet", presets
for a whole sensory profile, a page per topic with a live preview, Undo
for the changes that would surprise her, and nothing that pretends to be a
setting but does nothing.

What it touches in v1: the Settings screen (an index plus pages, which
spec 3.5 allows), its tests (navigation only), and small reads of new
settings in the check-in, Today, Day Mode, focus, patterns and the shore.
How I avoid breaking things: every new setting's default is v1's
behavior, the v1 tests keep their assertions, and the v1 suite runs
throughout.

## After Phase V9 — Settings 2.0
2026-10-30, 02:10

**What I built**
- `/settings` is an index: search, quick presets (each shows what it will
  change, Apply, Undo), the companion card, and the sections. Each section
  is a page (`/settings/[section]`) with a live preview, its controls, and
  "Reset this section" (with Undo).
- The sections come from one catalog (`lib/settings/catalog.ts`) that also
  feeds search; generic switches, choices, times and texts, plus the
  bigger pieces reused as they were (theme grid, voice, sound, people,
  data, demo, about).
- `SettingsSchema` (zod) for every key, used for importing; export and
  import of settings files; "Import backup" with a summary, Replace or
  Cancel, one transaction and a copy in memory; "Clear saved voice clips".
- New settings, each wired to something real: pronouns; bold text,
  density, corners, state colors and shapes (their controls; the look was
  wired in V1); page transitions and shore waves; background sound volume;
  reading level, 12/24-hour clock and date style; where a check-in starts,
  simple or full feeling words, causes, follow-up question, map or
  sliders; day start and end, Day Mode budgets and banner, moved tasks,
  morning and evening cards; focus length, the companion's activity, end
  sound, keeping the screen on; patterns on/off, how much evidence, the
  default period, showing dismissed patterns again; shore labels.
- Found while wiring: the background sound (waves, rain, brown noise)
  chosen in V2 never played. It now plays during a running focus block
  and the wind-down breathing, if sound is on.
- Undo for theme (any grid), font, motion level and presets.

**Setting → what it changes → how I checked it**
- `name`, `pronouns` → greeting / profile field → v1 flow test; manual
  field render in tests.
- `appearance.theme` (+ light/dark) → `data-theme` and colors → flow 5.
- `appearance.font`, `boldText`, `density`, `roundness`,
  `quadrantPalette`, `showQuadrantShapes`, `textScale`, `extraSpacing` →
  data attributes and CSS variables on `<html>` → V1 theme tests; v1
  text-size test (`--text-scale` 1.5).
- `motion.level` → `data-motion`, all motion → V1 motion tests; the
  matrix tests in V5. `motion.celebrations`, `motion.confetti` → the
  celebration decision → V5 matrix tests. `motion.pageTransitions`,
  `motion.shoreWaves` → `data-page-transitions` / `data-shore-waves` stop
  those animations → code path checked; CSS rule added. `motion.companionIdle`
  → companion idles → V3.
- `sound.*`, `haptics.enabled` → sounds and vibration → V2 tests;
  `sound.ambience` + `sound.ambienceVolume` → background loop in focus and
  wind-down → code path (not testable in jsdom: no Web Audio).
- `voice.*` → read-aloud → V2 tests.
- `communicationMode` → wording everywhere → v1 flow test (Literal).
  `language.readingLevel` → sent to the wrap-up route → V8 input builder.
  `language.timeFormat`, `language.dateStyle` → every time and long date
  → formatter code path (set once by the settings provider).
- `checkin.defaultPath`, `checkin.showCauses`, `checkin.showFollowUp`,
  `checkin.mapStyle`, `checkin.vocabulary` → the check-in's first step,
  step 3, the follow-up line, sliders, and the words offered and sent to
  the AI → code paths; existing check-in tests still pass with defaults.
- `day.*` → evening/morning cards, banner, moved tasks, Day Mode budgets,
  tide chart, Bridge lead → code paths; V6/V8 tests.
- `focus.*` → length, activity, end sound, Wake Lock → code paths (Wake
  Lock isn't in jsdom).
- `patterns.*` → screen on/off, minimum evidence, default period,
  dismissed patterns → V8 engine tests (`minEvidence`), code paths.
- `shore.sky`, `shore.showLabels` → sky colors, names under items → V7
  sky tests; code path.
- `aiEnabled`, `privacy.naturalVoiceAllowed`, data actions → v1 tests,
  V2 tests, backup tests (round trip, broken file, failed replace).
- Search → flow 13 and synonym tests; presets → flow 6.

**How I checked it**
- Lint, typecheck, 63 test files (387 tests, four full runs in a row
  green), the v1 suite (33 files, 164 tests) and the build.
- New tests: the schema (defaults pass, every key covered, bad values
  reported, unknown keys ignored), backups and settings files, flow tests
  5, 6 and 13, search synonyms.
- First-load JS: `/` 299 KB (tight), section pages 291 KB.
- The browser pane is in use by the team right now, so I didn't click
  through Settings there; the tests cover each page.

**What broke and how I fixed it**
- The demo switch lost its label: my anchor `set-demo` repeated v1's
  switch id. Anchors are now `setting-…`.
- Theme picks in the light and dark grids (used when following the
  device) had no Undo; now every theme pick does.
- The full suite started failing now and then (a v1 demo test, an
  onboarding test) with every core busy: some screens took over five
  seconds to appear. Vitest now uses half the cores; four runs in a row
  passed (D110).
- Section pages loaded every settings piece (353 KB); they now load only
  their own (291 KB).
- Tests: the preset test pressed an earlier test's Undo; it now presses
  its own toast's Undo.

**Not built (honest list)**
- Toolkit settings (favorites, hidden, filters, Bridge length, breathing
  pattern), keyboard shortcuts on/off (comes with the shortcuts in V11),
  check-in reminder times, week start, and "waves follow my check-in".
  They aren't shown, rather than shown doing nothing.

**Decisions:** D107–D111.

## Before Phase V10 — Demo workspace and Demo director
2026-10-30, 02:20

For the team (and judges): a Demo button that shows every feature in a
few minutes, smoothly, offline, and without ever touching the real data on
the device. For the live pitch: a presenter mode a clicker can drive.

What it touches in v1: the database (its name is now chosen by
workspace), the demo seed (extended, never changed), the clock (speed and
jumps, only while a demo clock is set), Settings → Demo (spec 3.5's
intentional change: the demo no longer replaces the device's data), the
crisis screen (a preview banner, demo only) and `data-demo-id` attributes
on the elements the tour touches.

## After Phase V10 — Demo workspace and Demo director
2026-10-30, 03:30

**What I built**
- Workspaces: `localStorage['tide.workspace']` picks `tide` or
  `tide-demo` when the app loads; entering or leaving reloads, so the main
  database isn't even opened during a demo. A "Demo" pill in the top bar.
- The demo seed v2 on top of the unchanged v1 seed: Lolo (pink, scarf),
  Lagoon, Lively motion, twelve closed days that plant exactly one wrap
  pattern (`wrapHelped:c-box`), and the October 29 bottle.
- The clock gained speed (60× during the focus block) and jumps.
- Autoplay forces the saved demo answers (no network needed); presenter
  mode can still use live AI.
- The director (`src/demo/director/`): an engine that waits for each
  element, clicks the way a pointer does, types character by character,
  holds so viewers can see results, skips any step it can't do, pauses in
  presenter mode, goes back to a chapter's start, and changes speed; a
  bottom bar with captions, progress and buttons (and keyboard and clicker
  keys); a spotlight; a soft cursor; the end screen; a debug panel
  (`?demoDebug=1`).
- Scripts: the full tour (eleven chapters with the spec's captions) and
  the 100-second pitch cut, built from the same chapter steps.
- `/demo` launcher, Menu → "Run the demo", Settings → Demo (start any
  mode; inside the demo: restart the clock, jump to the bridge or evening,
  leave), "Watch the demo" on the welcome step, and a way to clear v1 demo
  data still in someone's main space.
- Crisis preview: `/support?crisis=1&preview=1` shows a banner saying it's
  a preview and nothing was saved, only in the demo workspace.

**How I checked it**
- Lint, typecheck, all tests (395, two full runs), the v1 suite (33
  files, 164 tests) and the build are green.
- New tests: flow 14 (start and leave the demo; the main data's counts
  don't change), the database name per workspace, the v2 seed (exactly the
  four planted patterns, Lolo, closed days, the bottle, idempotent), the
  director on fake elements (click, type, a missing element skipped, the
  log, presenter pause), every script target present in the code, and the
  crisis preview only in the demo.
- The v1 Settings demo test now checks the v2 behavior (spec 3.5): the
  demo opens its own workspace and the device's task is still there.
- First-load JS: `/` 296 KB (after making Today's occasional cards load
  later), `/demo` 243 KB.

**What broke and how I fixed it**
- The director's engine never "saw" elements in the test environment
  (jsdom has no layout), so each step waited four seconds. Visibility in
  tests now means "in the page".
- `/` reached 300 KB exactly; the cards that only show sometimes (choose a
  companion, bottle, morning, evening) now load after the page.

**Not done (honest list)**
- I haven't watched the whole tour in a browser: the browser pane is in
  use by the team, and the demo workspace flag would switch their tab to
  the demo database too. The tour is built to skip any step it can't do,
  but it needs a rehearsal at 1× on the presenting laptop (TEAM_TODO).
- The tour is shorter than the spec's: the companion species and theme
  cycles, check-in, Day Mode, Unstick and focus, the Bridge, patterns, the
  shore, the start of Close the day, the low-sensory preset and the crisis
  preview are in; the mood-map drag, the bottle opening, the full wrap-up
  and the Literal-mode example aren't.
- Tests don't run the full script end to end (navigation is mocked in
  jsdom); Playwright isn't set up here.
- Shift+D to open the launcher comes with the keyboard shortcuts in V11.
- The v1 seed has five days with box breathing, not six; the wrap pattern
  uses those five (D112).

**Decisions:** D112–D115.

## Before Phase V11 — Quality, accessibility and performance
2026-10-30, 10:05

The last building phase. Section 17 lists the small things that make an
app feel finished: keyboard shortcuts on a computer, saying when the
network is gone, an install button that never nags, help for each screen,
tooltips on icon-only buttons. Then three audits: empty and loading
states on every screen, accessibility on every new flow, and performance
against the budgets in 5.6. Last, a pass over every new string.

Plan: shortcuts as a plain function (easy to test) plus one listener in
the app shell; the offline pill and install control as small pieces that
load with the shell; the help and shortcut sheets loaded only when opened,
so `/` stays under 300 KB. For the audits I'll use axe-core in the test
suite (it's already in `node_modules` through the lint plugin; I'll make it
an explicit dev dependency) and a production build on a second port, so
the team's open browser tab and its data are never touched.

## After Phase V11 — Quality, accessibility and performance
2026-10-30, 11:10

**What I built**
- Keyboard shortcuts (spec 17.1): C check in, N new task, 1 to 5 tabs,
  W close the day, / settings search, ? the list, Shift+D the demo. They
  never fire while typing or with Ctrl, Cmd or Alt held, stay quiet while
  a sheet, menu or the demo's controls are open, and are off on the
  support pages. A new Settings page, Keyboard shortcuts, turns them off
  (`shortcuts.enabled`, default on) and lists them.
- Offline pill under the top bar ("Offline · using built-in
  suggestions"), with a separate polite status line for screen readers.
- Install Tide in Settings → About and on the last page of What's new:
  the browser's own dialog where Chromium offers one (caught at startup,
  shown only on press), the two taps on iPhone and iPad, a quiet note when
  it's already installed, and an honest line everywhere else.
- "How this screen works" in the top bar menu: a few plain sentences per
  screen with Read aloud.
- Tooltips (500 ms, mouse and keyboard focus, never touch) on the
  icon-only buttons: the demo controls, voice samples, onboarding's
  companion arrows.
- Loops pause off screen and in hidden tabs (the shore and the Check in
  button's breath; the companion already did).
- Loading skeletons on Tasks, Toolkit, Patterns, Proof log, the Shore and
  the Collection; the Proof log's empty state now has the companion.
- `?new=1` on Tasks opens the new-task form (the N shortcut).

**How I checked it**
- Lint, typecheck, all tests and the v1 suite (33 files, 164 tests) are
  green; the build is clean. Final counts are at the end of this entry.
- New tests: the shortcut rules (every key; never while typing, with a
  modifier or a held key), the shortcuts on the real app shell (tabs,
  demo, help sheet, quiet with a sheet open, off in Settings, off on
  support), the offline announcement, the install control in each
  browser situation (the browser's prompt only on press), the help sheet,
  the new-task landing, pausing loops, a copy guard and an axe audit.
- In a production build on port 3100 (a different origin from the team's
  tab, so their data was never touched): N opens the form with focus in
  the title and typing "c" types a "c"; ? opens the list; the offline pill
  appears and is announced; every new screen at 375 px wide with text at
  150% has no sideways scrolling; with motion Off nothing loops.

**Empty and loading states (spec 17.9)**

| Screen | Empty state | Loading state |
|---|---|---|
| Today | "Nothing on your list" with Add a task; companion in the header | v1's blank page-height block; the top bar shows first |
| Tasks | "Nothing here right now." per column; Add task above | New: skeleton cards |
| Toolkit | Never empty (built-in strategies) | New: skeleton cards |
| Patterns | "Tide needs a few more check-ins…" with progress; companion in the header | New: skeleton cards |
| Proof log | New: companion + one line; Add a win above | New: skeleton cards |
| Your Shore | The empty beach with the companion + "Your shore is quiet for now…" | New: a sky-sized placeholder, so items don't pop in |
| Collection | Every item shown as "not found yet" with how to find it | New: skeleton (before, every item flashed as not found) |
| Close the day | Never empty (steps from the day's facts) | Blank until facts load (under 50 ms here) |
| Settings | Never empty | Section pieces load with the page |
| Talk to a person | "Add someone" when no contacts | Instant (settings already loaded) |
| Companion studio, onboarding, demo | Never empty | Splash while settings load |

I left two on purpose: Patterns doesn't get a second companion (its
header already has one, and two would compete), and Today keeps v1's
blank block: it's one quick read, and a skeleton there would flash for a
few milliseconds on every visit.

**Accessibility audit**

| Flow | Keyboard path | Focus in overlays | Live regions | Labels and roles (axe) | 150% text at 375 px | Motion Off |
|---|---|---|---|---|---|---|
| Onboarding | Tab order Skip, More options, main button; each step moves focus to its heading (browser) | Radix menu | Step heading | Pass | No overflow | No loops |
| Companion studio | Radix tabs (arrow keys); species and colors are buttons | — | Bubble `status` | Pass after fix 1 | No overflow | Static figure |
| Shore and Collection | Items are buttons with arrow keys between them; a skip link to the list | Radix sheet returns focus | New-item line | Pass | No overflow (the SVG clips itself) | No loops |
| Close the day | Fixed (fix 6): each step's heading now takes focus (test) | — | Companion line | Pass | Fixed (fix 3) | No loops |
| Settings index, search and all 17 pages | Search, presets, rows; anchors from search (V9 tests) | Undo toasts | Search results `polite` | Pass after fix 2 | No overflow | — |
| Demo launcher and HUD | Real buttons, Space/arrows/Esc while the tour runs | — | Caption `polite` | Pass | No overflow | — |
| Shortcuts and help sheets | ? and the menu; Escape closes (test) | Radix traps and returns focus | — | Pass | — | — |
| What's new | Heading takes focus on each page | It's a page-sized dialog | — | Pass | No overflow | — |

Contrast for every theme's text pairs is checked by
`lib/theme/__tests__/contrast.test.ts` (jsdom can't compute colors, so axe
skips it there).

Fixes the audit found:
1. The studio's section headings jumped from h1 to h3; they're h2 now.
2. With "follow my device" on, Appearance had two "Light", "Dark" and
   "High contrast" regions; they're named groups now ("When my device is
   light, Dark").
3. In Close the day, at 150% text, the companion's bubble ran 9 px off the
   right edge, and when centered it covered Close. It now sits beside the
   companion. While there I noticed every bubble's tail pointed away from
   the companion; it now points at it.
4. The menu's About Tide and What's new's links still used v1's
   `/settings#about`, which opened the Settings index instead of the page.
   Old hash links now open the right page (the support page's v1 link
   too).
5. The shortcut list put "1 2 3 4 5" one per line; it says "1 to 5".
6. Close the day kept focus on the Next button when the step changed, so
   a screen reader didn't say the new step. Each step's heading now takes
   focus, as in onboarding and What's new.

**Performance (spec 5.6)**

| Check | Result |
|---|---|
| First-load JS, `/` | 298 KB gzipped (budget 300; V10 was 296) |
| Other routes | `/tasks` 309, `/shore` 316, `/settings` 296, `/wrap` 337, `/demo` 244 KB (no budget in the spec) |
| Frame rate, Lively motion, no throttling | Today 60 fps, check-in sheet opening 60 fps, Shore 60 fps; no frame over 20 ms in 3 s |
| Loops off screen or hidden | Shore and Check in breath pause (unit test); companion already did |
| Lazy pieces | Shortcut list, help sheet and tooltips load only where used |

**Copy pass**
All new strings are sentence case, short, and say what happens. A new
test (`src/test/copyGuards.test.ts`) walks every string in `en.ts` and the
companion copy: no emojis, and none of the guilt phrases (streaks, "missed
you", "overdue", "you failed", "falling behind"…). None of V11's strings
change by communication mode; they're already literal.

**Not done (honest list)**
- Frame rate with 4× CPU throttling: the browser pane here can't throttle,
  so it stays with the team (TEAM_TODO, Performance).
- The install prompt itself: this browser pane doesn't offer installing,
  so I saw the honest "doesn't offer" line; the Chromium path is covered
  by a test with a fake event. A real check on Chrome and an iPhone is in
  TEAM_TODO.
- No service worker: if Tide is reloaded with no network, the browser
  can't load it. The pill covers the network dropping while it's open.
- A real screen reader pass is still a human job (TEAM_TODO).
- The top bar's companion head has no tooltip: it's a picture with an
  accessible name, and a tooltip there would load Radix Tooltip on every
  first visit, with `/` at 298 of 300 KB.

**Final checks:** lint and typecheck clean; 439 tests in 69 files and the
v1 suite (33 files, 164 tests) green; build clean; `/` 298 KB gzipped.
The bubble fix re-measured at 150% text on a 375 px screen: it sits at
179–343 px, inside the page, and focus lands on the step's heading.

**Decisions:** D116–D123.

## Before Phase V12 — Documentation, final audit and merge
2026-10-30, 11:25 (written up in the evening, after a usage-limit pause)

The last phase: the README, architecture and prompts page for v2, the
final audit of every acceptance criterion in the v2 spec and the
Definition of Done, today's progress report, and the merge to `main` if
everything is green. The kickoff says to merge; pushing publishes, so I'll
merge and tag locally and ask the team before pushing, as with v1.

Two things I know are open from earlier phases and will try to close
here instead of only listing them: Today's quick actions row (spec 12),
and watching the guided tour run in a real browser. For the second, a
production build on port 3100 is a different origin from the team's tab,
so the demo database there is separate from anything they have open.

## After Phase V12 — Documentation, final audit and merge
2026-10-30, 19:20

**What I built**
- Today's quick actions (spec 12), the last missing piece of Today 2.0:
  Check in, Regulate, Focus (pick a task first) and Close the day (from two
  hours before the usual closing time, "later" before that).
- The README for v2 (what's new, "Delight without guilt", running the
  demo, natural voices, themes, companions), `docs/architecture.md` with a
  second diagram for the v2 layer, the voice note and six routes on
  `/prompts-doc`, the final CHANGELOG entry, TEAM_TODO additions, and
  today's progress report. Settings → About shows 2.0.0.

**What I found by running the tour for real, and fixed**
Until now the guided tour had only run in tests, where custom actions and
navigation are mocked. In V12 I ran it on a production build: first in a
background tab of the browser pane on port 3100 (a separate origin, so the
team's data was never in reach), and, once those tabs had been closed, in
a separate headless Chrome with its own temporary profile, driven over the
DevTools protocol, so the team's browser pane was left alone. It was badly
broken, and the tests could not have shown it:
1. **Every tour ended at its first step.** Each chapter's setup sends
   Escape to close any open sheet; it bubbled up to the window, where the
   HUD treats Escape as "exit the tour". It no longer bubbles (test added).
2. **On a browser that had never opened the demo, Pitch cut opened
   onboarding.** The shell sent the still-empty demo database to
   onboarding before the seed ran, which also lost `?demo=start`. Inside
   the demo workspace it now shows the splash until the seed is done
   (D125, test added and checked to fail without the fix).
3. **A second tour in a row skipped the Bridge**, because the first run
   had completed it, and the planted patterns' numbers had moved. Each tour
   now starts from the seed (D126); the reset refuses outside the demo.
4. **Autoplay called the AI** for a pattern whose numbers had moved (no
   saved answer). Autoplay now never calls it (D127).
5. **The focus block never ended in time** in the pitch cut (60× for 4 s is
   4 minutes of a 10-minute block), so the outcome step was skipped. It
   fast-forwards at 400× now.
6. **Captions flashed by** in under a second in the pitch cut, which ran in
   about 40 seconds. Captions now hold at least 1 s plus 50 ms a character
   (D128).
7. `?demoDebug=1` disappeared with the tour's first page change; it's read
   once now.
The launcher, README and demo script said "about 4 minutes" and "100
seconds"; they now give the measured times.

**How I checked it**
- Lint and typecheck clean; 447 tests in 71 files green; the v1 suite (33
  files, 164 tests) and the dictation freeze test green; the build clean.
- First-load JS: `/` 299 KB gzipped (budget 300), `/demo` 245 KB.
- The tour in headless Chrome against the production build, fresh
  profile, twice in a row each: Pitch cut 80 s, 28 of 28 steps, twice;
  Full tour 133 s, 45 of 45 steps, twice; no step skipped, no AI request
  (the only `/api/` call is the voice availability check, which falls back
  to the device's voices without a network).
- No secrets in the repository (`git grep` for key patterns; only
  `.env.example` is tracked).

**Final audit: phase acceptance criteria (spec 22)**

| Phase | Criterion | Where | How verified | Status |
|---|---|---|---|---|
| V0 | Green baseline, tag and branch, freeze test | tag `v1-baseline`, branch `v2-experience`, `src/test/frozen-dictation.test.ts` | Tag present; freeze test 7/7 today | Met |
| V1 | v1 flows work, v2 look, contrast, existing users keep Classic + Hyperlegible | `lib/theme/*`, `lib/settings/__tests__/migrate.test.ts` | `test:v1` 164/164; contrast tests for 15 themes; migration test | Met |
| V2 | Good voice, speech-friendly text, cloud voice with fallback, freeze | `lib/voice/*`, `/api/tts` | Ranking, `speechText`, engine and TTS route tests | Met in tests; a real provider key was never available (TEAM_TODO) |
| V3 | Six companions + none, all expressions, Studio | `lib/companion/*`, `components/companion/*` | Registry and species tests, flow 4 | Met; "charming for 18–24" is the team's call (TEAM_TODO) |
| V4 | Flow 7; never on the crisis screen; v1 flows unchanged | `CheckInCompanion.test.tsx`, `CrisisCompanion.test.tsx` | Tests; `test:v1` | Met |
| V5 | Flow 8; frame rate; `test:v1`; v1 pitch e2e | `Celebrations.test.tsx` | Test; 61 fps unthrottled (V5); no Playwright | Met, throttled fps open (TEAM_TODO) |
| V6 | Flows 1–3 | `Onboarding.test.tsx` | Tests | Met |
| V7 | Flows 9–10; 48 items smoothly; Off fully static and accessible | `Shore.test.tsx`, `lib/shore/__tests__` | Tests; 60 fps unthrottled (V11); Off checked in a build (V11); axe | Met, 48-item throttled check open (TEAM_TODO) |
| V8 | Flows 11–12; wrap-up schema and semantic tests; patterns | `Wrap.test.tsx`, `api/ai/wrapup/route.test.ts`, `lib/wrap/__tests__`, pattern engine tests | Tests | Met (simplifications listed in After V8) |
| V9 | Flows 5, 6, 13; every setting in a checklist | `Settings2.test.tsx`, checklist in After V9 | Tests; checklist | Partly: toolkit settings, reminder times, week start and "waves follow my check-in" aren't built (hidden, not fake) |
| V10 | Flow 14; tour start to finish, offline, twice in a row, main data untouched | `demo.test.tsx`, headless runs above | Test; two runs per mode with no AI calls | Met in V12 after the fixes above. Pages still load from the server, so with no internet run Tide locally |
| V11 | Audit tables, issues fixed or explained | After V11 | Tables and fixes | Met |
| V12 | Docs, audit, merge | This entry | — | Met (merge below) |

**Definition of Done (spec 23)**

- [x] Every v1 feature works as before; `test:v1` passes. (The v1
  100-second script is covered by the v1 suite; the v2 pitch cut replaces
  it in the demo workspace.)
- [x] Dictation byte-for-byte unchanged (freeze test).
- [x] 15 themes with contrast tests; Classic matches v1; picker with live preview.
- [~] Design system on every screen; checked at 375 px with 150% text in
  V11. A desktop-width screenshot pass in three themes is in TEAM_TODO.
- [x] Motion Off/Calm/Lively everywhere; OS reduced motion maps to Off;
  `/` within budget; throttled fps explained (TEAM_TODO).
- [x] Sound engine and ambience, off by default; haptics where supported.
- [~] Read-aloud with the best voice, speech text and chunking, voice
  picker with samples; the cloud voice is tested only with mocks (no key).
- [x] Six companions + none, expressions, variants, accessories, Studio,
  lines in every mode, placements and talkativeness, never on the crisis
  screen, never guilt (copy guard).
- [x] Companions across the app, breathing in sync, focus body doubling.
- [x] State-aware celebrations with caps.
- [x] 12-step onboarding with resume and skip; What's new; no login.
- [x] Today 2.0: header, quick actions (V12), morning, bottle and evening
  cards, shore strip.
- [x] Your Shore: scene, 14 item types, deterministic placement,
  arrivals, details, collection, bottles, save as image, list view.
- [x] Close the day: 13 steps, chart, loose ends, anchor and first step,
  AI summary with checks and fallback, bottle, wind-down, goodnight;
  morning card; `wrap_helped` (simplifications in After V8).
- [~] Settings 2.0: presets, search, live preview, import/export, backup
  restore; four settings from 15.2 aren't built (After V9).
- [x] Demo: separate workspace; launcher, onboarding, menu and Settings
  entries; full tour, pitch cut and presenter mode; no AI calls in
  autoplay; never touches the main data; crisis preview only in the demo.
- [x] Quality features (spec 17).
- [~] Accessibility: keyboard paths and axe clean on every new flow, text
  equivalents for visuals; Lighthouse wasn't run in v2 (TEAM_TODO).
- [x] All tests green; build clean; no secrets; `.env.example` has the voice keys.
- [x] Docs and logs updated (README, CHANGELOG, this log, attribution,
  decisions, walkthrough, TEAM_TODO, demo script, architecture,
  prompts-doc, progress report).
- [x] Merged to `main` and tagged `v2.0.0` locally; not pushed until the
  team says so (D129).

**Not done (honest list)**
- The four Settings 2.0 items above; a desktop screenshot pass; throttled
  frame rates; Lighthouse; a real cloud-voice key; a human screen reader
  pass; Playwright e2e suites (not installed). All are in TEAM_TODO.
- `/` has 1 KB of budget left: anything new on Today or the shell must load
  after the page.

**Decisions:** D124–D129.

---

# Tide v2.1 "Partner-Ready"

## Before Phase R0 — Baseline
2026-11-01

The team used v2, showed it to their Challenge Partner, and wrote a
prioritized list of bugs and improvements; `docs/TIDE_V2_1_FIXES_PROMPT.md`
turns it into items F-01 to F-16. The partner meeting is on Tuesday, so P0
and P1 come first. Before changing anything I need a green baseline to
detect regressions, a tag to come back to, and a branch of my own.

The kickoff message the team pasted is the v2 one (it says "Phases V0 to
V12" and "commit on v2-experience"); the v2.1 spec has its own plan
(phases R0 to R7, branch `v2.1-partner-ready`). I'm following the spec's
plan and logging it (D130). Two of the team's instructions override the
spec: commits go out as `devxs614` with no AI trailer (the spec asks for
an `AI-Generated` trailer), and I'll ask before pushing.

## After Phase R0 — Baseline
2026-11-01

- `git status` was clean; nothing on GitHub was newer. `main` and
  `v2-experience` were the same commit (4c76b76, v2.0.0).
- Baseline: lint and typecheck clean; `npm run test` 447 tests in 71
  files, all green; `npm run test:v1` 164 tests in 33 files, green; build
  clean; first-load JS for `/` 299 KB gzipped (budget 300).
- Tagged `v2.0-baseline` on `main` and created `v2.1-partner-ready` from it.
- Saved the spec as `docs/TIDE_V2_1_FIXES_PROMPT.md`.

One constraint to keep in mind for every item: `/` has 1 KB of budget
left, so anything new on Today or in the shell must load after the page.
Another: the team's dev server on port 3000 runs from this folder, so they
will see my work as I go, and once the Dexie version 3 upgrade lands their
browser's database moves to version 3 (additive, but v2 code can't open it
afterwards). I'll have the upgrade tested before it ships.

## Before R1.1 — The layout audit tool
2026-11-01

Before fixing anything visual I want a map of every overlap and clip,
measured rather than guessed, and something that keeps them fixed. The
spec asks for a Playwright script plus the same checks as a test.
Playwright wasn't installed. I added `@playwright/test` without its
browser download and point it at the Chrome already on this Mac, against a
production build on port 3100 (a different origin from the team's
`npm run dev` tab, so their data is never touched).

## Before F-01 — Companion speech bubble cut off or covered (P0)
2026-11-01

What the person experiences: they tap the companion, or it speaks after a
check-in, and the bubble's words are cut off at an edge or hidden behind
the top bar, a card, the tab bar or a sheet. For someone who relies on the
companion's words (Literal mode especially) that removes information, and
it makes the app feel broken. Fixed means: in every placement, at every
width and text size, the full line is readable, never covered, and stays
up long enough to read. What could break: the bubble inside sheets (Radix
makes everything outside an open dialog inert), the shore (the companion
lives inside the scene's SVG), the demo tour's captions about the
companion, and the check-in tests that read the bubble's text.

## After R1.1 — The layout audit tool
2026-11-01

**What I built.** `scripts/layout-audit.ts` (`npm run audit:layout`) and
`e2e/layout-audit.spec.ts` (`npm run e2e`) share `scripts/audit/`: the
in-page checks (page overflow, clipped text, overlap and covered content
within the same layer, controls past the edge, the companion's bubble,
content stuck under the bars at the end of a page, small targets as
warnings), workspace preparation (the demo workspace seeded by the app
itself, or an empty one), and 61 screens and open states: every tab,
every Settings page, Close the day steps 1/3/8/9/11, onboarding steps
1/3/6/7/10, check-in steps, Day Mode, Unstick, the Bridge, TaskForm,
the event form, and the companion speaking in each place. A unit test
fails if a Settings section is added without the audit visiting it.

**Layers.** Sticky bars, sheets, dialogs, the bubble, the celebration and
the demo controls now carry `data-overlay` (an attribute only). Content
only counts as covered by something in its own layer, or when an overlay
ends up under the page; content passing under a sticky bar mid-scroll is
scrolling, but anything still under the tab bar at the very end of a page
(or under the top bar at the very top) is a failure.

**False alarms I fixed in the tool before trusting it:** the skip link
(clipped to nothing on purpose), content inside closed `<details>`, round
buttons whose corners hit-test through to what's behind them (corner
samples are now inset by the corner radius), and the bubble following
its companion off screen once the page scrolls.

**The "before" map** (`docs/audits/2026-11-01-before.json`): 1,224 state
runs over 6 widths × 4 text sizes in 873 s, with 21,156 findings. Most
are the same few causes repeated across sizes and scroll positions:
- the top bar's title runs into the companion head and Menu at narrow
  widths and big text;
- tab bar labels overlap (Patterns and Shore);
- the page scrolls sideways at 320–390px from 1.15× up;
- Settings' sticky Live Preview slides over the settings below it;
- theme cards clip their text; the Studio's name heading is truncated;
- onboarding's "More options" runs off the screen;
- sheets' bottom buttons cover content at 150%;
- and the bubble (below).
A bubble-only pass on the same build (`2026-11-01-before-bubbles.json`)
reproduced F-01.

## After F-01 — Companion speech bubble cut off or covered
2026-11-01

**Reproduction** (v2.0 build, `docs/audits/2026-11-01-before-bubbles.json`,
widths 320/390/1280 × text 1 and 1.5):
- Today: the greeting bubble sits above the companion, under the sticky
  top bar ("hidden-under-bar", 22–87px).
- Shore: the bubble lives inside the scene's SVG (`foreignObject`), which
  clips it; 5 of 5 sample points hidden at every size.
- Focus at 320px: the bubble runs past the left edge (−19px, −36px at 1.5).
- Check-in and Unstick sheets at 1.5: the sheet's Close button sits on the
  bubble.

**Root cause.** The bubble was absolutely positioned inside the
companion's own box, so whatever clipped or stacked over that box (the
SVG, a card with `overflow: hidden`, the sticky top bar) did the same to
the bubble, and it always opened in the same direction whatever the room.
In sheets, the Close button floated over the corner and headers guessed
how much room to leave (`pr-28`); at big text sizes Close grew past it.

**Fix.**
- `CompanionSay` renders in a portal on the nearest overlay layer
  (`#tide-overlays`, or the sheet it belongs to: `data-overlay-root` on
  sheet and dialog content), placed by Floating UI next to the companion's
  body group: above it in the lower half of the screen, below it in the
  upper half, with flip, shift, a size cap of min(320px, available
  width), and a tail positioned by the arrow middleware. It follows
  scroll and resizes.
- Text wraps anywhere, never clamps, scales with the text size; in the
  rare case it's taller than the screen it scrolls inside itself and is
  focusable.
- It stays up for max(3.5s, words × 0.45s × text size + 1.5s); hover,
  focus or touch pause it; a tap pins it; a pinned or tapped bubble shows
  a close button ("Close message", 44px target) and takes Escape before
  the sheet behind it does.
- When you tap the companion, the companion button points at the bubble
  with `aria-describedby` instead of a live region.
- The Studio hero and onboarding's "Say hi" use the same bubble.
- Every z-index in the app maps to the scale in spec 5.4 (D133).
- Sheets give Close its own row at the top (last in the DOM, so focus
  still starts in the content), and the `pr-24`/`pr-28` guesses are gone.
- In sheet headers the bubble stays inline beside the companion (D134).

**How I checked it.**
- New tests: the bubble portals out of a box with `overflow: hidden` and
  a transform; inside a sheet it stays in the sheet; the timing formula;
  one bubble at a time; close button and Escape.
- Audit (`2026-11-01-f01-bubbles.json`): every bubble check (fully on
  screen, nothing on top of it at its center and corners, no text cut)
  passes in every placement (Today, Shore, Studio, Focus, Box breathing,
  check-in, Unstick, Bridge, Close the day) at 320, 390 and 1280px, at
  text 1 and 1.5. I also looked at a screenshot of the Shore bubble.
- `/` first-load JS: 299.7 KB gzipped, budget 300 (Floating UI's
  positioning was already in the page through Radix's menus). The
  measuring script now prints one decimal; with 0.3 KB left, everything
  new on Today and in the shell has to load after the page.

**Left open:** the spec's 120ms crossfade between two lines isn't there
(a new line simply replaces the old one, with the usual pop). The other
findings in the same audit runs (top bar, sheet footers, Studio chips,
page overflow) belong to F-02.

## Before F-02 — Large text and responsive layout; Settings overlap (P0)
2026-11-01

What the person experiences: with text at 130% (and more so at 150%, with
Lexend, bold text or extra spacing, on a narrow phone), parts of Tide
overlap, labels collide with switches, text is cut off and some screens
scroll sideways; Settings was the worst. For an app built for
accessibility that's a contradiction (WCAG 1.4.4 Resize text, 1.4.10
Reflow). Fixed means: at 115%, 130% and 150%, from 320 to 1280px, no
overlapping, clipped or covered text anywhere and no sideways scrolling.
What could break: v1 layouts people know (the tab bar, Today, sheets),
the demo tour's taps, and the first-load budget (0.3 KB left).

## After F-02 — Large text and responsive layout; Settings overlap
2026-11-01

**Reproduction.** The "before" audit (`2026-11-01-before.json`) had 21,156
findings over the 6 × 4 matrix; a focused run at 320/390px × 130/150%
after F-01 still had 474. I looked at screenshots for the worst cases
(Today and the check-in sheet at 320–390px, 150%).

**Root causes** (one or two sentences each):
- *Everything scrolled sideways at 320–390px:* the offline pill is
  invisible but was one unbreakable line wider than a narrow phone.
- *Settings overlap:* the segmented controls' `z-10` and the sticky Live
  Preview shared the top bar's layer, so settings painted over the top bar
  and the preview slid over the settings as you scrolled; at 130%+ the
  preview also took half the screen.
- *Sheets at big text:* a fixed header (Close row 96px), a fixed
  companion row (149px) and a fixed footer (231px) left 275px for the
  step on a 390×800 phone, the companion row overflowed into "Step 1", and
  "Skip to the map" was pushed off the bottom, unreachable.
- *The top bar:* the "Demo data" badge couldn't wrap and the title
  couldn't shrink, so they ran into the companion head and Menu.
- *Tab labels:* "Patterns" at 150% is wider than a 64px tab.
- *Rows with a label and a button* (People, Proof rewards, the onboarding
  header, the Shore's buttons, the onboarding carousel, the Settings
  search field): labels with no `min-w-0` and rows that couldn't wrap
  pushed buttons off the side.
- *Fixed grids* (theme cards in 2 columns, Studio colors in 4 and
  accessories in 3, the Patterns legend switching on screen width) were
  too narrow for their text; the Studio's name was truncated.
- *Today's greeting* ran under the companion; the Shore companion was cut
  by the scene's crop at 320px; the mood map's marker could sit on a
  quadrant's name.

**Fix.** The structural rules from spec 6.2 and the component table 6.3,
as listed in `docs/CODE_WALKTHROUGH.md` ("Large text and responsive
layout"): long words break; rows wrap and labels shrink; container
queries in em (switch rows, the Today header); auto-fill grids; the
segmented control turns into a vertical radio list when a label doesn't
fit; sheets scroll as a whole with a sticky Close row and sticky buttons
(D136); `main` is isolated so nothing inside it rises above the bars; a
`big-text` variant (D139) unsticks the Live Preview and the Tasks toolbar,
folds the preview and the demo controls, and drops the top bar's
companion head on phones; tab labels may break inside a word (D138); the
mood map grows with text (20em); toasts sit 10rem up so they clear the
bars at any size; demo captions show three lines. The text size picker
shows a live task card and setting row, the note from spec 6.5, and
"Copy layout details for the team" (clipboard only).

**How I checked it.**
- Final audit, `docs/audits/2026-11-01-after.json`: 1,296 state runs (61
  screens and states × 6 widths × 4 text sizes), **0 failures**; plus
  Hyperlegible + bold and Lexend + extra spacing + Midnight Tide at
  360/390 × 1.3/1.5 (0), 200% zoom as a 640px viewport at 1.3 (0), and the
  WCAG 1.4.12 text-spacing overrides on Today, the check-in steps and
  Settings (0). 653 small-target warnings remain (mostly inline links and
  the shore's items); they're warnings by the spec's rules.
- New tests: the segmented control stacks when a label overflows and
  keeps its radios; the switch row carries its container query.
- I fixed one flaky v2 test along the way: the Companion Studio flow test
  clicked "the last Undo button", which was a timing guess; it now clicks
  the Undo in the toast it means (it failed 2 of 3 runs even before F-02).
- Lint, typecheck, 456 tests (74 files) and the v1 suite (33 files, 164
  tests) green. `/` is 299.6 KB: the keyboard shortcuts' listener now
  loads just after the page to stay under 300.

**Left open (honest list):** spec 6.3 items the audit didn't need and I
didn't build: preset-row arrow buttons and "See all", the Check in
button's label moving into a pill (D138), the Tide Line's 5em time column
and a separate row for "Now", the Focus timer's clamp, and a measured
`--tabbar-h` (D137). Real phones at their largest OS text size are in
TEAM_TODO.

## R2.4 — Dexie version 3 (before and after)
2026-11-01

**Before.** F-03 to F-05 need new, optional data: deleted, cleared and
edited tasks; deleted, detached and edited events; weekly event series;
cancelled strategy uses; and a few focus-block counters for later. All of
it must be additive: v2's rows keep their meaning and the planted pattern
numbers can't move. The risk: the team's own browser (their dev server
runs from this folder) moves to version 3 as soon as this lands, and v2
code can't open a version 3 database, so the upgrade has to be right the
first time.

**After.** `version(3)` restates only the two changed tables (tasks and
events, with their full v2 index lists plus `deletedAt`/`clearedAt` and
`seriesId`/`deletedAt`) and adds `eventSeries`. The upgrade groups
existing events into weekly series with `groupEventsIntoSeries`
(`src/lib/events/series.ts`): same title, kind, start time and length,
on any set of weekdays (D140). The demo seed applies the same grouping,
because a database created fresh at version 3 never runs the upgrade.
`eventSeries` is in `dataTables()`, so export, import and "Delete
everything" include it; older backups without it still import.

How I checked it: a new test builds a v2-shaped database with the whole
demo seed, opens it with the version 3 class, and finds every check-in,
focus block, strategy use and transition identical, events identical
apart from their new `seriesId`, exactly six series (Calculus and
Chemistry lab on Tue/Thu, Groceries on Sat, the library job on Mon/Wed,
Physics and Programming on Mon/Wed/Fri), and no second upgrade on
reopening. The v2 upgrade test now accepts "version 2 or later". Lint,
typecheck, 458 tests and the v1 suite (164) are green.

## Resumed (v2.1)
2026-11-01, evening

I picked the fix pack up again from a fresh session: re-read CLAUDE.md, the
v2.1 spec and the end of this log, and checked `git status` on
`v2.1-partner-ready`. F-01, F-02 and Dexie version 3 were committed; F-03
was half done in the working tree (the repo helpers, the detail sheet, the
delete dialog and the edit form, no flow tests, no docs). Running every
check found two red tests:
- v1 flow 5 ("In progress (1)" not found after a move). I had routed the
  board's read through a helper that used Dexie's `filter()`, and Dexie 4
  only updates a live query straight away for plain queries. A filtered
  query waits for the commit and runs again, so the board lagged one
  render behind. The helpers now run a plain query and filter afterwards.
- v1 demo script, second run in a row offline: the walk card showed the
  template's title instead of the saved answer. This one also failed
  without my F-03 changes, and only late in the day. The Patterns screen
  from the first run was still mounted while the second run reset the
  app, so for a moment it counted Maya's data against the real clock
  (Sunday), with a different baseline but the same "4 of 5". The word
  cache keyed only on k and n, so that fallback wording stuck. The cache
  key now includes every fact (D145). The v1 test is unchanged.

## F-03 — Edit and delete tasks (before and after)
2026-11-01

**Before.** People couldn't fix a typo or remove a task they no longer
needed, and a cluttered board is exactly what overwhelms our users. Plan:
read-helpers in `src/lib/repo/taskQueries.ts` that hide deleted tasks, a
guard test against direct `db.tasks` reads, soft delete with a 10-second
Undo, the history purge as one transaction, a detail sheet, TaskForm in
edit mode, keyboard shortcuts, and "Permanently remove deleted tasks" in
Settings. Risk: the v1 "Move to…" menu test asserts the exact menu items,
so Edit and Delete can't go in that menu.

**After.**
- Tapping a task's title (board, Today's Tide Line, anywhere a task card
  shows) opens its details: type, energy, due date, first step, where you
  left off, the columns as buttons, and Edit, Focus and Delete (D141).
  With shortcuts on, E edits the focused card and Delete or Backspace asks
  to delete it.
- Edit reuses TaskForm ("Edit task", Save, a first-step field, the neutral
  "Add a few words so you can recognize it." when the title is empty).
- Delete asks first: "Keep it" has focus, "Delete" uses the notice style.
  A plain delete hides the task everywhere and keeps its history; "Also
  remove what washed up on my shore…" removes the task, its focus blocks
  and wins, unlinks strategy uses and transitions, and cleans day plans
  and wrap-ups, but only after the Undo window. If the app closes first,
  it finishes at the next start.
- A task deleted while its focus block runs (only possible from another
  tab) ends the block quietly, and the dialog says so first (D143).
- Settings → Privacy & data: "Permanently remove deleted tasks".
- Every task read outside the repo goes through the helpers; a guard test
  fails on a direct `db.tasks` read.
- The F-03 code pushed Today's first load to 301.8 KB. I moved the copy
  groups that Today never shows (Settings, onboarding, screen help, the
  Toolkit tools) into their own files in `src/copy/`. `/` is now 297.9 KB
  (D144).

**How I checked it.** Repo tests: edit in place; soft delete hides the
task from every read and Undo restores it; the purge removes only that
task's records; pending purges run at start-up. Flow tests: edit from the
board and see the new title on Today; an empty title gets the neutral
message; delete with Undo; delete with history, and after 10 seconds the
win is gone from the database and the shore is empty; a running focus
block ends without the outcome question when its task is deleted. Layout
audit for the detail sheet, the edit form and the delete dialog (plus the
board and the add form) at every width and text size: 120 state runs, 0
failures (`docs/audits/2026-11-01-f03.json`). Lint, typecheck, the full
suite and the v1 suite are green.

**Left open.**
- The swipe gesture (optional in the spec). I skipped it because it would
  fight the board's drag-and-drop on phones.
- The demo tour step from spec 7.7 comes with the other tour additions
  in R7. The `data-demo-id`s it needs are in place.
- Bulk delete arrives with the Completed archive in F-05.

## F-04 — Edit and delete events, including weekly series (before and after)
2026-11-01, late evening

**Before.** A cancelled class kept sitting in the Tide Line and kept
bringing up a Bridge for a switch that wasn't going to happen. Plan:
- read-helpers in `src/lib/repo/eventQueries.ts` and a guard against
  direct `db.events` reads;
- `src/lib/repo/eventEdits.ts` for edits and soft deletes across a series
  ("only this", "this and future", "all"), with one Undo per batch;
- an event detail sheet, an edit sheet that shares its fields with v1's
  Add form, the "which events?" dialog, and the Bridge reacting at once.
Risks: v1's Add form is tested, and the demo's Calculus Bridge must keep
working.

**After.**
- Tapping an event in the Tide Line, or the "Next" card, opens its
  details: kind (icon and label), date, time, place, what to bring and
  "Repeats every Tue and Thu until …". It has Edit, Delete, and "Get
  ready" when the switch is near.
- Edit has the Add form's fields (now shared, `EventFields.tsx`) plus the
  date, five prep slots and, for a series, the days it repeats on. Saving
  an event in a series asks which events to change. A new date only moves
  this event; new days start a new series from this date on; "all" leaves
  past times alone unless "Also change the time of past events" is
  checked (D148–D150). An end before the start says "Events can't cross
  midnight yet. Split it into two." (D151).
- Delete asks "Delete "Calculus" on Thursday, November 5?". For a series
  it offers only this, this and future, or all. "Keep it" has focus and
  the toast's Undo restores the whole batch.
- A deleted event never reaches the Tide Line, the Bridge, Day Mode or the
  wrap-up. `getUpcomingTransition` also skips one if a caller passes it.
  An open Bridge for an event that gets deleted closes with "That event
  was deleted."
- Settings → Privacy & data: "Permanently remove deleted events". One
  that a past switch refers to stays as a stub with only its kind (D153).

**What broke and how I fixed it.**
- v1's "shows the next event within three hours" failed tonight on the
  committed code too: after 10:50 pm, "now + 70 minutes" is tomorrow, and
  Today only looked among today's events. The Next card now also sees the
  first three hours after midnight (D152). The v1 test is unchanged and
  passes at any hour.
- My new flow tests leaked an open sheet into the next test, because the
  sheet stores live outside React. `resetApp` now closes the task and
  event sheets.

**How I checked it.**
- Repo tests (8):
  - edit and delete one event with Undo;
  - "only this" detaches the event, and later series edits skip it;
  - "this and future" moves each date's time;
  - "all" keeps past times unless asked;
  - new weekdays start a new series and end the old one the day before;
  - the three delete scopes, detached events included only with "all";
  - a deleted event never reaches the Bridge;
  - the purge keeps a stub where a switch points.

  The seed's six series are checked in the version 3 upgrade test.
- Flow tests on the demo afternoon:
  - change Calculus to 5:00–6:30 pm "only this", and the Tide Line shows
    it while Tuesday's class keeps 4:50;
  - the midnight note;
  - delete Calculus "only this" at 4:41 pm, and the Bridge card goes
    away; Undo brings both back;
  - an open Bridge closes with its note.
- Layout audit for Today, the add and edit forms, the detail sheet, the
  "which events?" and delete dialogs and Settings' privacy page: 192
  state runs, 0 failures (`docs/audits/2026-11-01-f04.json`).
- `/` is 298.3 KB.
- Lint, typecheck, 480 tests and the v1 suite (164) are green.

**Left open.** Tide has no calendar views yet (month or any-day view is
F-10), so the Tide Line and the Next card are the ways in. The Repeat
field for *new* events also waits for F-10, as the spec allows: until
then, weekday editing exists only for series that already exist.

## F-05 — Done tasks clear themselves from the board (before and after)
2026-11-01, late evening

**Before.** With the demo seed, the Done column was a wall of three weeks
of finished tasks. That's chaotic for our users and the first thing a
judge would see. Plan:
- one visibility rule (`isVisibleInDone`) with a window setting;
- "Clear" with Undo (it hides, never deletes);
- a Completed archive with search, Move back, Delete and Select mode;
- an optional 30-day cleanup.

Risk: v1 tests that count the Done column.

**After.**
- Settings → Day & planning:
  - "Show finished tasks on the board for": 1 day (default), 3 days,
    7 days, Always;
  - "Remove finished tasks after": Never (default) or 30 days. Its help
    says the shells stay on the shore.
- The Done column (and its "Done (n)" count) shows only tasks finished in
  the window and not cleared. Under it: "Completed earlier (n)" →
  `/tasks/completed`. When the column is empty but the archive isn't, it
  says "Nothing finished in the last day." and links to the archive. On
  the demo afternoon, one task shows (finished Wednesday at 9 pm).
- "Clear" (broom icon, visible label) sets `clearedAt` on what's in the
  column, with a 10-second Undo. Moving a task back out of Done clears
  `doneAt` and `clearedAt`; its win stays.
- The archive groups tasks by day ("Today", "Yesterday", "Mon, Nov 2"),
  showing type, time finished and an "On your shore" link to the task's
  shell (the shore now opens an item from `?item=`). It has Move back to
  In progress, Delete, a search field, and Select mode with 48px
  checkboxes and "Delete selected (n)" using F-03's dialog. When there's
  nothing to show, the companion rests beside "Finished tasks will rest
  here."
- Today's Tide Line already left finished tasks out (a v1 rule), so "done
  today only" holds without a change (D155).

**How I checked it.**
- Unit tests:
  - every window's edges, plus "forever";
  - cleared, deleted and unfinished tasks stay hidden;
  - Clear, Undo and moving back, with the wins intact;
  - the 30-day cleanup removes only the old entry and keeps its win.
- Flow tests:
  - the demo board shows "Done (n)" for the last day only, with
    "Completed earlier (m)";
  - Clear empties the column and shows the link, and Undo restores it;
  - the archive searches, moves a task back and bulk-deletes two.
- Layout audit for the board, the Done column, the archive (also in
  Select mode), Settings' Day page and the shore: 168 state runs, 0
  failures (`docs/audits/2026-11-01-f05.json`). My first run "failed" the
  Done state at 1024px and up, where the column picker doesn't exist; the
  audit step now only taps it when it's there.
- `/` is 298.5 KB.
- Lint, typecheck, 487 tests and the v1 suite (164) are green. The clock
  guard caught a `Date.now()` in my new test; it uses `now()` now.

**Left open.** The calendar's "Finished that day" section comes with the
calendar (F-10).

## P0 complete (v2.1)
2026-11-01, near midnight

All five P0 items are in: F-01 (the speech bubble), F-02 (large text and
every width), F-03 (edit and delete tasks), F-04 (edit and delete events
and series) and F-05 (finished tasks leave the board). Dexie version 3
carries the new fields.

Checks at this point:
- Lint, typecheck, 487 tests and the v1 suite (33 files, 164 tests),
  including the dictation freeze test, are green; the build is clean.
- `/` is 298.5 KB gzipped (budget 300).
- The guided tour in headless Chrome against the production build, fresh
  profile, twice in a row each: Pitch cut 28 of 28 steps in 79 s, twice;
  Full tour 45 of 45 steps in 133–134 s, twice; no AI requests. The same
  numbers as at the end of v2. The run is now a script,
  `npm run tour:check -- [pitch|full] [runs]`, so it can be repeated
  instead of driven by hand.
- The v1 pitch path (`demoScript.test.tsx`) passes, also twice in a row
  offline, which needed D145.
- Layout audits for every state F-03 to F-05 added: 0 failures.

Next, in priority order: F-06 (focus end alert), F-07 (refocus nudges),
F-09 (focus sounds), then F-08 (Back and Cancel everywhere).

## F-06 — Focus timer end alert (before and after)
2026-11-02, after midnight

**Before.** In v2 the end of a focus block only made a sound if global
sound was on, and that's off by default, so most people got silence. Plan
(spec 10):
- an end alert the person opts into by starting a timer;
- the sound scheduled on the audio clock so a background tab can't make
  it late;
- a visual end, an optional notification, the tab's title and favicon,
  and a heads-up before the end.

Risks: the spec's table reuses the v2 key `focus.endSound` (a boolean)
for the sound choice, which spec 3.3 forbids; and the tours run a focus
block.

**After.**
- Settings → Focus:
  - "When the timer ends": Sound and visual (default) / Visual only / Off,
    with the help line saying why it plays when other sounds are off;
  - "Sound": Chime, Bell, Marimba, Waves, Gentle rise (`focus.endTone`);
  - "Alert volume" with "Test sound";
  - "Repeat": Once / Up to 3 times until I respond;
  - "Warning before the end": Off / 1 / 2 minutes;
  - "Vibrate at the end";
  - "Notify me if Tide is in the background", which asks the browser for
    permission from the tap and says honestly that it can be a minute
    late, with the iPhone note;
  - "Show the time left in the browser tab".

  v2's `focus.endSound` stays: "When the timer ends" keeps it in step,
  and a v2 user who had turned it off keeps a silent end (D158).
- `src/lib/focus/alertTones.ts` synthesizes Appendix C's recipes (chime,
  bell, marimba, waves, rise, the warning and F-07's nudge).
  `alertEngine.ts`:
  - wakes its own AudioContext from the Start or Resume tap;
  - schedules the end, and the repeats, on the audio clock behind the
    spec's limiter;
  - stops them on pause or an early end;
  - plays at once if the context slept through the end.
- `useFocusAlert` ties it to the timer, adding:
  - vibration;
  - "Time's up · Tide" alternating with the task in a hidden tab (still
    at motion Off), plus a favicon with a dot, both reverted when Tide is
    visible;
  - the notification;
  - "9:41 · Lab report · Tide" while running;
  - "One minute left.";
  - any key or tap afterwards stops a repeating alert.
- The Focus screen shows "Time's up", the companion looks proud (soft
  after an Ebb check-in), and a glow rises and fades twice (a still border
  at motion Off). The timer now also checks the clock when the tab
  becomes visible.
- Presets: Low sensory gets a visual end with Gentle rise; Focused gets
  the 1-minute warning; Playful gets Marimba; Calm gets Chime.

**How I checked it.**
- Engine tests with a fake AudioContext:
  - the end is scheduled at the right audio time;
  - pause stops both notes and resume schedules again at the new time;
  - "repeat" plays at 0, 20 and 40 s, never more;
  - a sound that already played is left alone;
  - a suspended context is woken and the sound plays now.
- Rule tests: v2's switch still silences the end, the warning lead, the
  tab text, and the end time after a pause and resume.
- Flow tests with the engine as spies and the clock moved by hand:
  - a 5-minute block with sound off schedules its end sound;
  - ending while hidden sets the tab title and favicon, plays once and
    notifies once;
  - coming back shows "How did it go?" and puts the tab back;
  - the 1-minute warning;
  - an early end plays nothing;
  - a v2 user with the switch off schedules nothing.
- The v1 focus tests pass unchanged.
- Layout audit for Focus, the focus bubble and every Settings page: 480
  state runs, 0 failures (`docs/audits/2026-11-01-f06.json`).
- `/` is 298.6 KB. The pitch cut runs 28 of 28 steps.
- Lint, typecheck, 496 tests and the v1 suite (164) are green.

**Left open.** Hearing it is a person's job: a laptop with Tide in a
background tab (Chrome and Edge), a phone with Tide in front, and the
notification on a laptop and an installed Android app. Tide registers no
service worker, so Android Chrome, which needs one for notifications, is
a known gap (D160, TEAM_TODO).

## F-07 — Refocus nudge "Earth to {name}" (before and after)
2026-11-02

**Before.** During a focus block, attention drifts and nothing gently
brings it back. The team calls it "Tierra llamando a…". It has to be
optional and easy to switch off, because surprise sounds can overwhelm
people with auditory sensitivity. Plan:
- plain scheduling rules (2-minute edges, 5-minute spacing, 6 a block,
  stop for the block);
- a hook for the interval, hidden-tab and return nudges;
- a small card that shrinks to a pill if unanswered, and a 2-minute
  break;
- a quick toggle in a "⋯" menu with a one-time hint;
- counts saved with the block for later.

Default: off, so nothing changes from v2 unless someone turns it on.

**After.**
- Settings → Focus:
  - "Refocus nudges": Off (default), Visual, Visual and sound;
  - "Check in every" 5/10/15/20 min;
  - "Welcome me back when I return to Tide";
  - "Nudge me if I leave Tide for" off/1/2/5 minutes.

  The Low sensory preset keeps them off; Focused turns on Visual.
- The Focus screen has "Focus options" (the "⋯" menu, with a visible
  label) with Nudges: Off / Visual / Visual + sound. The first block of 15
  minutes or more shows a one-time hint under the header, in the page's
  flow so it never covers the timer.
- The card slides up from the bottom (no movement at motion Off) with
  the companion peeking in:
  - the title follows the mode: "Earth to Maya! Still on Lab report?",
    "Still on Lab report?", or "Are you still working on Lab report?";
    without a name, "Earth to you!…";
  - "Yes, still on it" gets a small hop from the companion;
  - "I drifted" shows the first step and where you left off, with "Pick
    up from here";
  - "Take a 2-minute break" pauses the block, counts down two minutes and
    suggests "Shake it out", then "Back to it";
  - "Stop nudges for this block".

  Unanswered for a minute, the card becomes a "Still on it?" pill.
- With sound on, a hidden tab gets one soft two-note nudge after the
  chosen time, scheduled on the audio clock and cancelled if Tide comes
  back first, plus a notification if those are on. Coming back after 30
  seconds or more brings "Welcome back! Still on {task}?", with no sound.
- The block saves `nudgesShown`, `driftsReported`, `hiddenMs` and `breaks`
  (only when nudges were on). Nothing shows them to anyone; the pattern
  idea is logged in DECISIONS.

**How I checked it.**
- Rule tests:
  - every N minutes, minus the edges (10 and 20 in a 25-minute block, no
    20 in a 21-minute one);
  - 5-minute spacing after a nudge of another kind;
  - the cap of 6;
  - stopped and sheet-open blocks stay quiet, and a skipped mark isn't
    saved for later.
- Flow tests with the clock moved by hand:
  - nothing at 1:00; a nudge at 10:00 and at 20:00; nothing at 23:30;
  - "I drifted" shows the first step;
  - the break pauses, and "Back to it" resumes;
  - after 45 seconds away, the hidden-tab sound is cancelled and "Welcome
    back" shows;
  - "Stop nudges for this block" works;
  - with nudges off, nothing appears.
- Copy test: no "distracted", "lost focus", "fail" or "again?", and three
  different mode variants for both titles.
- Layout audit with a real nudge on screen: Playwright's clock jumps 11
  minutes into a 25-minute block. Also the hint and Settings → Focus: 96
  state runs, 0 failures.
- `/` is 298.8 KB. Lint, typecheck, 506 tests and the v1 suite (164) are
  green.

**What broke.**
- The first hint floated over the timer and off the left edge at 390px.
  It's in the page flow now.
- In the audit, Playwright's clock also freezes framer-motion, so the
  card sat invisible mid-slide. The card now uses the app's CSS entrance
  (`flow-enter`), which also makes motion Off simpler.
- One flow test hid the page outside `act()`, so React hadn't saved "when
  it was hidden" before the page came back. The test was wrong, not the
  hook.

## F-09 — Focus sounds: noise, rain, waves, binaural (before and after)
2026-11-02

**Before.** Many neurodivergent students focus or calm down with noise or
rain in their ears. v2 had three background sounds that played only during
focus and only with sound turned on. Plan:
- one ambience player with Appendix C's nine generated sounds, built on
  v2's ambience code, not next to it;
- a tiny state store so the shell's mini player costs Today almost
  nothing;
- the Sounds sheet in Focus and a section in the Toolkit;
- "Until focus ends" fading before the end alert;
- the crisis screen stops it.

Risk: `/` was at 298.8 KB.

**After.**
- `src/lib/sound/ambience.ts` renders the 10-second loops. Waves, rain
  and brown are v2's code, unchanged; white, pink (Kellet's filter), fan
  and stream are new.
- `ambiencePlayer.ts` replaces the ambience in v2's `engine.ts`:
  - one sound at a time, 1.5-second fades and crossfades;
  - a limiter and a soft maximum (the player's 100% is half of full
    scale);
  - "Play for" fades out over 5 seconds on the audio clock;
  - Media Session metadata and play, pause and stop handlers;
  - binaural is two oscillators panned hard left and right (200/214 Hz,
    180/186 Hz) over a quiet noise bed.
- The crisis and support screens' quiet hold now tells listeners, so a
  playing sound fades out at once and can't start there.
- Settings remember the last sound, the volume and "Play for"
  (`ambience.*`), but nothing ever starts on its own.
- v2's `sound.ambience` still plays during focus and wind-down when sound
  is on (now through the player), and it's the sound preselected in the
  player. A sound picked in the player wins and isn't stopped by that
  path (D170).
- Screens:
  - **Focus:** a "Sounds" button (headphones) that shows the playing
    sound's name, opening a sheet with the tiles, volume, "Play for"
    (with "Until focus ends") and Stop.
  - **Toolkit:** a "Background sounds" section at the top. It's not a
    strategy, so nothing is saved as a strategy use.
  - **Mini player:** elsewhere, a mini player above the bottom bar shows
    "Rain · playing" with Pause or Play, Stop and Hide.
  - **Binaural tiles:** "Use headphones at a low volume." and the factual
    note that research is mixed.
- "Until focus ends" ramps to silence half a second before the block
  ends, so the end alert (F-06) is heard on its own.

**How I checked it.**
- Player tests on a fake AudioContext (`src/test/fakeAudioContext.ts`,
  shared):
  - all nine sounds build;
  - binaural pitches and panning;
  - the volume cap;
  - Stop fades over 1.5 s;
  - "until focus ends" reaches silence at end − 0.5 s;
  - the crisis hold stops it and refuses a new start.
- Flow test: open Sounds in Focus, pick Rain, start the block; Today's
  mini player says "Rain · playing"; its Stop ends it.
- Layout audit for Toolkit, the Sounds sheet, the mini player on Today,
  Focus and Today: 192 state runs, 0 failures. At 130% the mini player
  wraps to two rows, so it now has card corners instead of a pill's.
- Both tours: Pitch cut 28/28 in 80 s, Full tour 45/45 in 134 s, no AI.
- `/` is 299.1 KB (the shell only carries the small state store).
- Lint, typecheck, 513 tests and the v1 suite (164) are green.

**Left open.** Hearing them is a person's job: does each sound loop
without a click, is the volume comfortable, and does a phone keep playing
with the screen locked? The note in the player says it may stop.

## F-08 — Back and Cancel everywhere (before and after)
2026-11-02

**Before.** In a toolkit activity the only way out was finishing it, and
the check-in couldn't go back a step. Feeling trapped during emotional
regulation raises exactly the anxiety Tide is for. Plan (spec 12):
- Back on every step after the first, keeping what was entered;
- Cancel everywhere, asking only when something would be lost;
- browser and Android back closing the top overlay;
- the runner's Cancel with honest history;
- a static check that every flow has its controls.

Risk: history entries under the Next.js App Router.

**After.**
- **Browser and Android back** (`src/lib/backToClose.ts`, wired into the
  shared Sheet and Dialog) close the top overlay through its own close
  rule. Verified on the production build in Chrome:
  - Back closes the check-in and the URL stays;
  - with text typed, Back asks "Leave without saving?", and Back again
    keeps editing with the text intact;
  - after closing with Close, one Back goes to the previous page;
  - a check-in that ends in "Regulate" lands on the Toolkit and stays.
- **Check-in:** Back on steps 2, 3 and 4 (and the body path) keeps
  words, picks and the map dot. Going forward again with the same words
  reuses the suggestions without a second AI call. Leaving after picking
  asks first, too (D180).
- **Unstick:** Back to the reasons, the last one marked; another reason
  asks again. **Day Mode:** Back to the three modes. **Grounding:** Back
  to the previous sense. **Bridge:** "Skip this switch" closes without
  recording one, and the parking note is kept as it's typed.
- **Strategy runner:** "× Cancel" (and Escape) at the top left.
  - In the first 15 seconds nothing is saved.
  - After that, a use marked `cancelled` is saved, with no re-check and
    no "you didn't finish", then a quiet "Okay, stopped." and back to where
    Maya came from.
  - The pattern engine drops cancelled uses.
  - Back in the Bridge, the Shift step says "Try something else?" with the
    other choices open.
  - The brain dump asks first if lines were typed, offering "Save as
    tasks".
  - Timed tools already had "I'm done" / "Stop" leading to the re-check;
    that's "End early" (D178).
- **Focus:** End asks "End the focus block?" after the first minute and
  keeps the time without the outcome question; "I'm done early" is as
  before (D179).
- **Task and event forms:** they ask before closing with changes.
- **Static check:** `data-nav="back"` / `"cancel"` markers on every flow
  in the spec's table, with a test that checks them.

**What broke, and what I found.**
- My first back-to-close removed an overlay's history entry as it closed.
  In the real browser that undid navigations that follow a close
  (Unstick → Focus), and both tours lost their focus steps. A 400 ms
  delay fixed the tours but still stalled one of four pitch runs. The
  final version never steps back through history by itself; a closed
  overlay leaves its marker, and the next Back carries on (D176). After
  that, both tours ran twice in a row, clean.
- Testing Back by hand showed the round Check in button ignored every
  tap after the first: its ripple span is replaced on each press, and a
  press whose element disappears never becomes a click. That bug came
  from v2. Tests and the demo use programmatic clicks and couldn't see
  it. Fixed with `pointer-events-none` (D181).
- In the audit, the nudge state's Playwright clock stayed on the page it
  shared with later states and slowed them, so the event-edit state
  timed out. States that install the clock now get a page of their own.
- The event-edit state also failed in a long audit run because the
  wrap-up state had moved the shared page's demo clock to 9 pm, when
  every event is folded under "Earlier today". The event states now set
  3:40 pm themselves, and a fresh page waits for the demo seed before
  looking for a task.

**How I checked it.**
- Flow tests:
  - check-in: Back keeps words and picks, no second AI call, and Close
    asks first;
  - browser back closes the check-in;
  - Unstick Back with another reason;
  - box breathing cancelled at 5 s (nothing saved) and at 20 s (a
    cancelled use, no re-check);
  - the pattern input never contains a cancelled use.
- Two back-to-close tests (closes and reopens; stays open when the flow
  asks, and asks again).
- The static `data-nav` check covers 14 Backs and 4 Cancels.
- Real-browser checks of Back on the production build, as listed above.
- Both tours twice in a row: Pitch cut 28/28 in 79 s, Full tour 45/45 in
  133–134 s, no AI.
- Layout audit:
  - check-in steps 2 and 4, Day Mode, Unstick, Bridge, the task form,
    the event sheets, Focus with its nudge and hint, box breathing,
    wrap-up and onboarding: 360 state runs, 1 failure, which was the
    audit harness's seed race, since fixed and re-run with 0 failures
    (`docs/audits/2026-11-02-f08.json`, `…-f08-nudge.json`,
    `…-f08-events.json`).
- `/` is 299.2 KB.
- Lint, typecheck, 540 tests and the v1 suite (164) are green.

**Left open.** Android's back gesture in an installed app needs a phone
(TEAM_TODO).

## F-10 — Monthly calendar, day view and repeating events (before and after)
2026-11-02

**Before.** Tide only showed today. Students need the month ahead (exams,
recurring classes) and a way to plan or look back at any day. Plan:
- plain date math and repeats with tests;
- month and day loaders through the repo helpers;
- an accessible month grid with a list for large text;
- a day view for days ahead and past;
- "Repeat every week" in the Add Event form;
- a way in from Today without a sixth tab.

Constraint: `/` was at 299.2 KB.

**After.**
- **Ways in:** Today's date is now a link, with a "Calendar" button
  (icon and label) beside it. The `M` key opens the calendar too (it's
  in the shortcuts list).
- **`/calendar`:**
  - "November 2026", Previous month, Next month, Today, Grid or List,
    and Day;
  - a weekday row following the new "Weeks start on" setting;
  - six weeks of days, each a button labeled like "Tuesday, November 3:
    3 events, 1 task due, day closed";
  - up to three events (time and title when the day is wide enough, dots
    when not, "+n" for more), tasks due, optional check-in dots, and a
    moon for a closed day;
  - the arrow keys, Home, End, Page Up and Page Down;
  - swipe on touch.

  At 130% text and up it's a list unless the person picks Grid (D184).
  It uses the laptop width like Tasks (D185).
- **`/calendar/[date]`:**
  - **A day ahead:** its events (tap for F-04's details), tasks due and
    tasks back that day, "Add event" (one-off or weekly) and "Add task
    due this day".
  - **A past day:** a read-only look back: events, check-ins with times,
    tasks finished, what washed up, strategies tried, and "Day closed".
  - **Navigation:** previous and next day, Go to Today, back to the month,
    and swipe.
  - **Today itself:** goes to Today's Tide Line (D182).
- **Repeat:** "Doesn't repeat / Every week on…" with weekday chips and
  "Until" (8 weeks by default, 26 at most). Saving writes the series and
  every instance in one transaction (`addWeeklyEvent`, at most 182).
  Instances are ordinary events, so the Bridge, the Tide Line and the
  wrap-up work unchanged.
- Today's Tide Line is untouched; the day view has its own small lists
  (D183).

**What broke and how I fixed it.**
- My first grid lost keyboard focus on a month change: the grid remounts
  per month and forgot the keyboard was in use. The flow test caught
  it, and the screen now keeps that state.
- The audit found the event chips cut off with an ellipsis at 768px and
  up, because the calendar sat in the phone column. Now it uses the wide
  layout, each day picks chips or dots by its own width, and long titles
  wrap.
- One full test run had two tests stall for nine minutes and fail.
  Alone, and in two full re-runs, everything passed in normal time. The
  machine was busy (the browser and three audit processes); I note it
  rather than hide it.

**How I checked it.**
- Unit tests: grids for every month of 2026 (all seven starting weekdays)
  with both week starts; leap years; month shifts; weekly repeats (days,
  until, the 26-week and 182 caps).
- Flow tests on the demo afternoon:
  - the month adds up events, tasks due and closed days;
  - Today links to the calendar;
  - the keyboard moves through the grid and across months;
  - a day opens on Enter or click;
  - large text shows the list;
  - a past day shows its history;
  - a weekly "Study group" added from Tuesday the 10th makes eight
    Tuesdays in one series;
  - "This and future" from the 17th leaves only the 10th.
- Performance on the production build: a month change draws in 14–17 ms,
  and with that month's events in 13–22 ms (target: 100 ms).
- Layout audit for the month (grid and list), a past and a future day,
  and Today: 144 state runs, 0 failures (`docs/audits/2026-11-02-f10.json`).
- `/` is 299.5 KB; `/calendar` is 291.4 KB.
- Both tours ran clean (28/28, 45/45).
- Lint, typecheck, 550 tests and the v1 suite (33 files, 164 tests) are
  green.

**Left open.** No long-press or "+" on a day cell to add an event: the day
view's "Add event" covers it (D186). The full tour's calendar step comes
in R7.

## F-11 — "Try a look" variations (before and after)
2026-11-02

**Before.** v2's "Try the new look" applied one combination. The team
wanted a few curated looks to try, compare and undo. Plan:
- eight looks as data (appearance and motion only);
- snapshot rules so "Back to my look" is exact;
- a day-seeded "Surprise me" order;
- a carousel and a trying bar.

**After.**
- `src/data/looks.ts`: Lagoon, Sunset, Coral, Midnight, Kelp, Lavender,
  Sandbar and Deep Sea, as the spec lists them. Each turns off "follow my
  device", and Motion Off also sets v1's `reduceMotion`.
- `src/lib/looks.ts`: the snapshot covers every key any look sets. The
  first try saves the person's own values in `appearance.lookSnapshot`
  (an internal setting); later tries keep that snapshot. "Surprise me"
  shuffles by the date, and never picks the look on screen.
- Settings → Appearance opens with "Try a look":
  - eight cards, each a small live preview in its own colors (sky and
    sea, text lines, a raised button in its roundness), with its name,
    one-liner and "Try it";
  - the cards scroll sideways and snap, and stack at large text;
  - the arrow keys move between cards, and "Surprise me" picks one.
- While trying, a bar says "Trying: Sunset" with Keep it, Back to my look
  and Next look. Leaving the page keeps the look, with one Undo toast.
- What's new's look page keeps v2's button (now the Lagoon look, with
  "Back to my look") and shows the carousel under it (D188).

**How I checked it.**
- Rule tests: the snapshot holds exactly the look keys (never the
  companion); the shuffle is stable within a day and different the next
  day; seven taps of "Surprise me" give seven different looks, never the
  current one.
- Flow tests:
  - try Sunset, Next look to Coral, then Back to my look restores
    Ink + system font + square corners + auto motion + follow device,
    exactly;
  - try and keep Kelp;
  - Surprise me picks something else;
  - leaving while trying Midnight keeps it.
- What's new's v2 test passes unchanged.
- Layout audit for Appearance, before and while trying: 48 state runs, 0
  failures. Pressing the second card by scrolling it into view put it
  under Settings' sticky Live Preview in the test browser, so that audit
  step presses the button directly.
- `/` is 299.5 KB. Lint, typecheck, 556 tests and the v1 suite (164) are
  green.

## F-12 — Shore time of day, chosen by hand (before and after)
2026-11-02

**Before.** The shore's sky followed the clock. Some people want to pick
the scene that feels best: a night shore can calm at noon, and a bright
day can lift a heavy evening. Plan:
- a `shore.timeOfDay` setting (v2's `shore.sky` keeps working on Auto);
- a real sunset scene apart from golden hour;
- a picker on the Shore and in Settings;
- a crossfade, a matching companion pose, and Today's strip following
  the choice.

**After.**
- Auto follows the clock as before. v2's golden hour stays (late
  afternoon), and "sunset" is new: the 30 minutes around sunset, with the
  sun on the horizon and a warm reflection on the water. Dusk starts
  after it.
- "Time of day" in the Shore header (sun or moon icon with a label) opens
  a menu: Auto, Dawn, Day, Sunset, Dusk, Night, each with a swatch of
  its sky. The same choice is in Settings → Shore.
- A chosen scene sets the sky, the sun or moon's place (stars at night)
  and the companion's pose: asleep at night, sleepy at dawn, calm at
  sunset and dusk.
- A new sky fades in over the last one in a second (opacity only; at
  motion Off it simply appears). The image export draws the same scene,
  because it copies the scene itself.
- Today's shore strip takes the chosen sky. Its colors live in a tiny
  `skyTone.ts`, so the sunrise tables stay off Today.

**How I checked it.**
- Unit tests:
  - golden hour, then sunset, then dusk (v2's own tests unchanged);
  - a reflection only at sunset;
  - five different skies;
  - stars at night;
  - a dark theme keeps its own night sky;
  - the sun or moon placement and the pose for each scene.
- Screenshots (390px): night (moon, stars, the companion asleep in its
  cap) and sunset (the sun on the horizon, the reflection, the menu with
  swatches).
- Layout audit: the shore on Auto, at night and at sunset with the menu
  open, Today and Settings → Shore, 168 state runs, 0 failures. The
  chosen scenes in Midnight Tide and Ink at 320/390/1280 and 100/130%
  also had 0 failures.
- `/` is 299.5 KB. Lint, typecheck, 558 tests and the v1 suite (164) are
  green.

## F-13 — Count back by 7, 6, 5, 4, 3 or 2 (before and after)
2026-11-02

**Before.** "Count back by 7" was a plain steps timer. The team wanted an
interactive tool with a choice of step: 7 pulls attention away from
racing thoughts, 2 suits a tired moment. Plan:
- keep the id `t-count-7` and v1's text and test;
- plain sequence and feedback rules;
- a `CountBack` tool with reveal and type modes;
- the choices remembered in Settings.

**After.**
- `src/lib/countBack.ts`: the numbers from the start by the step, ten
  times or until zero; a typed answer is either right or "close".
- The tool:
  - chips "By 7 … By 2" ("Smaller steps are easier") and "From 100 …
    From 20", and "Think, then reveal" or "Type it";
  - the instruction in the person's mode (literal: "Start at 100. Subtract
    7. Say or type the result. Repeat 10 times.");
  - a big number that turns over at Lively, fades at Calm and just
    changes at Off;
  - "{k} of 10" and read-aloud on demand;
  - typing: "Yes, 86." or "Close. It's 93. Keep going from there." (never
    "wrong", never red); "Show me" just reveals;
  - the end: "Done. Notice your breathing for a moment.", then the usual
    re-check;
  - "I'm done" stays for v1's test (D195);
  - the companion thinks beside it and hops at each step at Lively.
- The title follows the step ("Count back by 3"); with the default it's
  v1's "Count back by 7".
- Settings → Toolkit is a new section with the step, the start and the
  mode (D194).

**How I checked it.**
- Rule tests: 100 by 7 is v2's sequence; every start and step stays at
  zero or above, with at most ten steps; the feedback kinds.
- Flow tests:
  - 93 after 100;
  - typing 92 gives the gentle "Close", then 86 gives "Yes";
  - by 3 from 20, six Nexts reach the breathing line, and Continue shows
    the re-check;
  - the title follows the step.
- v1's Toolkit test passes unchanged.
- `/` is 299.5 KB. Lint, typecheck, 565 tests and the v1 suite (164) are
  green.
- Layout audit for the tool (type mode with a reply showing), Settings →
  Toolkit and Appearance while trying a look: 72 state runs, 0 failures
  (`docs/audits/2026-11-02-f13.json`). Two earlier audit runs crawled for
  over 20 minutes. Every state took 2–4 seconds alone, and the same run
  took 56 seconds once the machine was quiet (no leftover headless
  browsers). I also gave the tool's audit step explicit timeouts, so a
  missing field can't hang an audit again.

## F-14 — Axolotl's external details on the Shore (30-minute timebox)
2026-11-02

**Before.** The team noticed Lolo looked bare on the Shore and wrote
"escamas externas". Axolotls have no scales; what makes one recognizable
is its external gills. The timebox was a hard 30 minutes.

**What I found.** On the Shore, Lolo had no gills at all. It's the same
drawing as everywhere else (no simplified variant, nothing removed by
size, nothing hidden). The gills are the only parts drawn with a fixed
`transform` attribute (`translate` plus `rotate`). The Shore places the
companion inside the scene's `foreignObject`, and there Chrome resolved
that transform's origin against the wrong viewport. The gills swung out
past the edge and were clipped.

**After (about 25 minutes).**
- Each gill's points are now placed in code, at their position and
  angle, with no `transform`. They draw the same everywhere, the Shore
  included.
- At 64px and up, each gill has three thin frond lines in its darker tip
  color, and the head and body have a few soft speckles (the "texture"
  reading of the team's note).
- On the Shore only, the gills get a 1.5px outline in their tip color
  (CSS on the existing placement attribute; zero width elsewhere), so
  they read against the sand.
- Nothing else in the design changed.

**How I checked it.** Screenshots at 3× on the production build: on the
Shore, six gills with outlines (none before); in the Studio, the same
Lolo as before with fronds and speckles. Companion tests (28), the full
suite (565) and v1 (164) are green; `/` is 299.5 KB.

**Left open.** During the rare "special" idle, the gill wiggle is still a
CSS rotation around a point in pixels, which may misplace the gills for
that second on the Shore only. I didn't chase it inside the timebox
(TEAM_TODO).

**Correction (found in F-15).** The Chrome quirk above was the wrong
diagnosis. The real cause was our own CSS: `shore.css` gives every shape
in the scene `transform-box: fill-box; transform-origin: center`, so the
items can tilt in place. That rule reached into the companion too, and
turned each gill around its own middle instead of the drawing's origin.
The gill fix still stands (it can't be caught by a rule like that again),
and the rule now skips the companion. That also settles the open item:
the gill wiggle's pixel origin works on the Shore the same as elsewhere.

## F-15 — Sand dollar redesign (30-minute timebox)
2026-11-02

**Before.** The sand dollar (the item for a win you add yourself) was a
plain disc with a faint star and didn't read as a sand dollar. Spec 19
gives the design; the timebox was a hard 30 minutes.

**What I built.**
- A new drawing in `ItemArt.tsx`, from the spec's colors (now in
  `lib/shore/palette.ts`): a cream disc with its outline, a darker rim
  ring, a light shade on the lower half, nine small specks, five petal
  outlines at 72 degrees (from the top) with three dots inside each, a
  center dot, and five short slits near the edge between the petals.
- The same drawing serves the Shore (about 28px) and the Collection card
  (96px). The item's id, name and description didn't change.

**What broke.** In the Collection it looked right at once; on the Shore
all five petals piled up at the top. The petals were turned with
`rotate()`, and the scene's `fill-box` rule (above) spun each one around
its own middle instead of the disc's center. That was also the real cause
of F-14's missing gills. Two changes: the petal, dot and slit points are
now turned in code (no `transform` attributes), and the scene rule is
scoped to skip the companion (`:not(.cmp, .cmp *)`). Items keep the rule,
since their tilt and bob depend on it.

**How I checked it.** Screenshots at 3x on the production build: the
Shore shows three sand dollars with five centered petals each, and Lolo
still has all six gills; the Collection card matches. A new test checks
that the sand dollar draws five petals that fan out with no `transform`
attributes, and that the scene rule still skips the companion. Layout
audit for the Shore states: 96 runs, 0 failures (the same small-target
warnings as in F-12, from the items on the sand, which have a list view).
Full suite 567, v1 164, lint, typecheck and build are green; `/` is
unchanged at 299.5 KB (shore code isn't in its first load).

**Timebox.** The drawing itself fit in the 30 minutes; finding the
`fill-box` rule ran over it. The fix was one selector and it also
corrected F-14, so I kept it rather than revert.

**Small differences from the spec (D197).** The petals run a little
longer than 38% of the radius and the strokes are a touch thinner than
2px and 1.5px, because at 28px the spec's proportions merged into one
blob. The center is a dot rather than a star, which the spec allows.

## Before R7 — Demo, docs, final audit, merge, roadmap branch
2026-11-02

Every item from F-01 to F-15 is in. R7 (spec 23) is the wrap-up: the
full tour's new steps (21.4), both tours twice each at 1× and 2×, the
final audit across the whole matrix, the docs (21.5), the acceptance
table and the definition of done (24), the merge and tag (3.4), and the
F-16 roadmap note on its own branch. Re-read: sections 3.4, 7.7, 14.7,
20, 21.4, 21.5, 23 and 24.

## R7, part 1 — The full tour's new steps
2026-11-02

**What I built.** Five short additions to the full tour only, from spec
21.4: the calendar after the gentle plan; renaming one task and deleting
another before Stuck; the Sounds panel and one "Earth to Maya!" check-in
during focus (the end glow was already there); Sunset and back on the
Shore; and trying the Sunset look in Settings, then "Back to my look".
The pitch cut reuses the shared step lists, which I didn't touch; the
new steps are spliced in for the full tour only.

**What it needed.**
- Demo ids on the month's day cells, the day view's back link, the task
  title field, the sheets' Close, the check-in's "Yes" and the
  time-of-day items.
- A `triggerNudge` director action: a window event the nudge hook answers
  with one card, whatever the setting (D200).
- The demo's classes now run to Nov 30, or Thursday the 12th would have
  been empty (D198).
- A step can put the captions at the top (`hud: 'top'`), because the
  Undo toast and the check-in card appeared under them (D199). I found
  that from screenshots of the run, not from the step list, which said
  "ok" for both.
- The script-targets test now also sees ids written as
  `{editing ? 'task-edit-save' : undefined}`; the tour runner takes
  `--speed=2`.

**How I checked it.** In headless Chrome on the production build, twice
each: pitch cut 28 of 28 steps in 80 s at 1× and 42 s at 2×; full tour 68
of 68 in 180 s at 1× and 95 s at 2× (under the 5-minute limit; it was
134 s). No AI requests in any run. A run with screenshots at the new steps
and a look at the demo database afterwards: the task renamed, Laundry
deleted with its history kept, the Shore back on "auto", the theme back
to Lagoon. A new test covers the nudge cue. Lint, typecheck, 568 tests
and v1 (33 files, 164 tests, including the v1 pitch path) are green; `/`
is still 299.5 KB.

## After R7 — Acceptance, definition of done, and where Tide stands
2026-11-02

**Final audit.** Every screen and open state on the production build, in
headless Chrome, with an empty allow list (nothing excused):
- the full matrix, 6 widths (320 to 1280px) × 4 text sizes (100 to 150%):
  1,848 state runs, **0 failures** (`docs/audits/2026-11-02-final.json`,
  21 minutes);
- 200% zoom (640px at 130%): 77 runs, 0 failures;
- Hyperlegible + bold text at 360 and 390px, 130 and 150%: 308 runs, 0
  failures.

The audit also warns (not fails) about controls under 44px: 1,415 in the
matrix. I listed them at 390px and 100%: 78 warnings, all at least 24×24
px, so they meet WCAG 2.2 AA's target size. Most are the settings
switches (52×34) and the checkboxes in Completed and Privacy (26×26),
which sit in labeled rows like the rest of v1 and v2; two are inline text
links ("See your proof log", "Open the demo workspace without the
tour", 27px tall), and one is the checkbox that adds a name to the
shore image. Our own rule asks for 48px targets. The pattern predates
v2.1 (the new switches and checkboxes follow it), so making those rows
fully tappable is an open polish item for v2.2, not a v2.1 regression.

**Acceptance table (spec 23, step 23).**

| Item | Acceptance (spec 2) | How I verified it | Status |
|---|---|---|---|
| F-01 | The bubble always shows its full text, never clipped or covered, at any text size, in any placement | Tests: the bubble portals out of clipping and transformed boxes, stays inside sheets, one at a time, Close and Escape. Bubble audit states and every full audit since: 0 failures | Done |
| F-02 | Every screen works at 115%, 130% and 150% text, 320–1280px, with no overlap, clipping or sideways scroll | Full audit matrix (6 widths × 4 text sizes): 0 failures on Nov 1 and in the final run; Hyperlegible + bold, Lexend + spacing + dark, 200% zoom and WCAG text-spacing runs: 0 | Done; real phones in TEAM_TODO |
| F-03 | Edit and delete tasks everywhere, with Undo and an option to remove history | Repo tests (edit, soft delete, Undo, purge only that task's records, pending purges at start-up); flow tests (edit from the board, delete with Undo, delete with history gone after 10 s, a running focus block ends); the tour step | Done; phone check in TEAM_TODO |
| F-04 | Edit and delete events, with "this one / this and future / all" for repeating ones; the Bridge reflects it | 8 repo tests; flow tests; the v3 upgrade groups old weekly events into series (`dbUpgradeV3.test.ts`); a deleted class never brings up the Bridge | Done; phone check in TEAM_TODO |
| F-05 | Done leaves the board after 24 h (adjustable), plus Completed and "Clear done now" | Window tests (every edge, "forever"); Clear, Undo and moving back with wins intact; the 30-day cleanup; the demo board shows only the last day | Done |
| F-06 | A reliable end alert (sound, visual, optional notification), also in a background tab | Engine tests on a fake AudioContext (audio-clock timing, pause and resume, repeat at most three times, a suspended context woken); flow tests (ending while hidden sets the tab title and icon, plays once and notifies once; the 1-minute warning; an early end plays nothing) | Done; hearing it on real devices in TEAM_TODO |
| F-07 | Optional "Earth to {name}" during focus and on returning, with caps and kind copy | Rule tests (edges, spacing, cap of 6); flow tests (10 and 20 min, "I drifted", the break, "Welcome back", off by default); the tour's cue | Done |
| F-08 | Back and Cancel in every flow; browser back closes sheets; data kept | Flow tests (check-in Back keeps words and picks with no second AI call; browser back closes the check-in; Unstick Back; box breathing cancelled at 5 s and 20 s; cancelled uses never reach patterns); two back-to-close tests; a static check of 14 Backs and 4 Cancels; real-browser checks; both tours twice | Done; Android Back in TEAM_TODO |
| F-09 | An ambience player in Focus and Toolkit, 9 generated sounds, volume and timer | Player tests on a fake AudioContext (all nine build, binaural pitches and panning, the volume cap, the fade on Stop, silence before the block ends, the crisis hold); a flow test from Focus to Today's mini player; audit states for the sheet and mini player | Done; listening check in TEAM_TODO |
| F-10 | Month view, any-day view, add and edit on any date, weekly repeats | Grid tests for every month of 2026, both week starts, leap years; repeat caps; flow tests on the demo afternoon; the tour step | Done |
| F-11 | Curated looks with previews, "Surprise me" and "Back to my look" | Rule tests (the snapshot holds only look keys; a stable daily shuffle; seven different surprises); flow tests (try, next, Back restores exactly; keep; Surprise me; leaving keeps the look); the tour step. Eight looks, as in spec 15.2 | Done |
| F-12 | A time-of-day picker on the Shore | Sky tests (five skies, a reflection only at sunset, stars at night, the sun and pose per scene; v2's own unchanged); screenshots at night and sunset; audit at night and sunset with the menu open; the tour step | Done |
| F-13 | An interactive, configurable count back | Rule tests (v2's sequence for 7 from 100, every start and step); flow tests (93 after 100, a near miss shows "Close"); v1's "I'm done" test unchanged | Done |
| F-14 | The axolotl's details show on the Shore as elsewhere | Screenshots at 3× (six gills on the Shore); companion tests; the real cause found and fixed in F-15 | Done; the meaning of "escamas externas" to confirm (TEAM_TODO) |
| F-15 | A recognizable sand dollar | Screenshots on the Shore and in the Collection; `ItemArt.test.tsx`; Shore audit 0 failures | Done; over the 30 minutes while fixing the shared cause (logged) |
| F-16 | A roadmap note on its own branch, no 3D code | `explore/3d-companions` holds only `docs/roadmap/3d-companions.md`, never merged | Done (after the merge) |

**Definition of done (spec 24).**
- [x] P0: bubble readable; zero audit failures across the matrix; tasks
  and events edited and deleted with Undo; Done after 24 hours with an
  archive and "Clear done now".
- [x] P1: the end alert with default settings, in background tabs, with
  optional notification and heads-up; nudges off by default with caps;
  Back and Cancel everywhere; nine sounds with a player and mini player.
- [x] P2: calendar, eight looks, the Shore's time of day, count back 2–7
  with two ways to answer.
- [x] P3: the axolotl's gills on the Shore; the sand dollar.
- [x] F-16: the roadmap note on its own branch.
- [x] Nothing broke: lint, typecheck, 568 tests (99 files, the dictation freeze
  test among them), v1 (33 files, 164 tests, the v1 pitch path among
  them), the demo reference and seed tests (seed patterns unchanged), and
  both tours twice in a row at 1× and 2×. `/` is 299.5 KB of 300.
- [x] Data: Dexie version 3, additive, with the upgrade tested
  (`dbUpgradeV3.test.ts`); export and import read every table, so the new
  `eventSeries` table is included (round-trip test).
- [x] Docs and logs (21.5); TEAM_TODO lists the manual checks and the
  Tuesday prep; progress reports for Nov 1 and Nov 2.
- [x] Merged into `main` and tagged `v2.1.0` (below). Not pushed: the team
  asked to be asked first.

## Where Tide stands after v2.1

v2.1 took the list from the Challenge Partner meeting and worked through
it in the spec's order. The urgent fixes are in: the companion's bubble
is always readable, every screen holds up at large text sizes, and tasks
and events can be edited and deleted with Undo. Focus got the most new
things: an end alert you notice, optional check-ins, and nine background
sounds. Every flow has Back and Cancel, and the phone's Back button
closes the open sheet. There's a month calendar, eight looks to try, a
time-of-day picker on the Shore, and an adjustable count back. Lolo has
its gills on the Shore again, and the sand dollar looks like one.

What I'm least sure of is what only people can check: the end alert and
the sounds on real phones and laptops, Android's Back gesture, large text
on a real iPhone and Android phone, and whether "escamas externas" meant
the gills. Those are in TEAM_TODO with dates. The 3D question goes to the
partner on Tuesday with a roadmap note, and nothing 3D was built.

The first load for Today is 299.5 KB of the 300 KB budget. Anything new
on Today will need a split like D144 or a cut elsewhere first. Two code
items are open for v2.2: switch and checkbox rows that are tappable
across their whole 48px height, and the long tail of small-target
warnings the audit lists.

## Before v2.2 sweep
2026-11-03

The team showed v2.1 to their Challenge Partner and came back with five
bugs, all in screenshots: phone fields that take letters, companion bubbles
outside the phone frame and over the focus timer, words split letter by
letter at larger text ("Toolki t"), a crushed four-column Tasks board, and
the Check-in button covering content. They also asked for one feature: an
AI that breaks a task into steps. The spec is
`docs/TIDE_V2_2_BUG_SWEEP_PROMPT.md`: fix what's broken, change nothing
else, and prove it.

A note on the kickoff message: it was the v2 template (Phases V0–V12 on
`v2-experience`). I'm following the sweep spec's own plan instead, Phases
S0–S6 on a new `v2.2-bug-sweep` branch, since `v2-experience` is the
finished v2 branch. Commits alternate between the team's two Git
identities, as they asked, with no AI trailer (their rule wins over the
spec's).

**Baseline (tag `v2.1-baseline`).** Lint and typecheck clean; 568 tests in
99 files; v1 suite 164 tests in 33 files; build clean. Nothing red, so
there's no S-00.

**What I set up before touching app code.**
- `docs/FEATURE_INVENTORY.md`: every feature by screen and how it's
  verified, to tick again at the end.
- `scripts/visual-baseline.ts`: screenshots of 80-odd screens and open
  states at 390 and 1280px, default settings, with Date frozen at the
  demo's Thursday 3:40 pm and `Math.random` seeded, taken twice so I know
  which shots wobble on their own. `scripts/visual-compare.ts` compares two
  runs with pixelmatch.
- The audit's blind spots (spec 6.1), in `scripts/audit/sweepChecks.ts`
  and the runner: words split mid-word, anything outside the app frame,
  the frame growing with text size, content stuck under floating controls
  at the end of a scroll, bubbles over `data-bubble-avoid` elements, the
  page painting over an open sheet, sheets taller than the screen, inputs
  under 16px, phone inputs without a phone keyboard, console errors,
  failed requests, and axe (serious and critical fail, moderate warns).

**After S0.** The visual baseline is 158 screenshots; 148 came out
pixel-identical on a second run and the other ten are listed as noise.
The upgraded "before" audit found 1,386 failures in 1,896 runs (mid-word
breaks 794, axe contrast 262, outside the frame 212, axe hidden-but-
focusable 53, axe label mismatch 28, phone input 24, covered at the end
13), mapped to B-01…B-05 and three sweep findings in `docs/BUG_SWEEP.md`.
My first run of the new checks was half wrong (D203 lists what I had to
correct), and the spec's own mid-word rule hid "Toolki t" (D202). No app
code changed in S0. Lint, typecheck, 568 tests and v1's 164 still pass.

## B-03 — Words split letter by letter (before and after)
2026-11-03

**Before.** The team's screenshots showed "Toolki t", "Patter ns" and a
task card reading "Rea / d / VSS / S / docu / me / nt". The before audit
counted 794 mid-word breaks, almost all at 130–150% text.

**What I found.** Two causes, and only one of them was the `anywhere` rule
the spec suspected. The tab labels and the speech bubble did use
`overflow-wrap: anywhere` (the bubble also hyphenated). But "Toolki t" came
from layout: the TopBar title may shrink, while the companion head beside
it only hid when the *window* was under 480px, which a laptop never is,
even though Tide sits in a 430px frame there. Toolkit's two columns, two
text columns with a zero flex basis (Count back, Completed rows) and the
"Demo data" badge had the same problem: a box allowed to get narrower than
one word, so even plain `break-word` had to split it.

**After.** Tab labels never break and grow at most 1.2× (D205); the TopBar
gives up the head and the word "Menu" (icon kept, name kept) based on its
own width; the bubble uses `break-words`; Toolkit's columns need 22em of
list width too; Count back and Completed rows got an em basis so their
neighbors wrap. A static guard test fails if `anywhere`, `break-all` or
automatic hyphenation comes back. The audit at 320–1280px × 115–150% shows
no mid-word breaks outside the Tasks board, which B-04 / v2.3 Item 4 owns.
Lint, typecheck, 569 tests and v1's 164 pass. Two visual captures at 100%
show no change from the fix; the one real diff (the sounds timer control
at 1280, stacked before and side by side now, labels all visible) is
logged as S-04 because I couldn't prove its cause.

## Before v2.3 — Focused fixes
2026-11-03

The team sent a second spec, `docs/TIDE_V2_3_FOCUSED_FIXES_PROMPT.md`, while
the v2.2 sweep was partway: S0 and B-03 committed. v2.3 asks for four things
done properly: a dynamic check-in button, digits-only phone numbers,
companion speech that never leaves the phone area, and a Tasks screen that
stays inside the phone frame. Its kickoff message was again the v2
template; I'm following the spec's own order (Item 4, 3, 1, 2) on a new
branch, `v2.3-focused-fixes`, from the tag `v2.2-baseline` (the sweep's
state after B-03).

How the two specs fit: v2.3's items replace v2.2's B-01 (phones), B-02
(speech), B-04 (Tasks board) and B-05's check-in button part. What v2.2
still has that v2.3 doesn't is the AI task breakdown and the wider
area-by-area sweep; those are on hold, listed in `docs/BUG_SWEEP.md`, to
come back to after v2.3. v2.3's "Has steps" filter depends on that
breakdown, so it waits too (D207).

**Baseline.** Lint and typecheck clean, 569 tests (100 files), v1 164
(33 files), build clean, `/` 299.5 KB. The visual baseline is the two
captures of this exact build I took for B-03 (160 screenshots each; their
differences are the known greeting-bubble noise).

## Item 4 — Tasks stays inside the phone frame (before and after)
2026-11-03

**Before.** On a laptop the frame was 430px everywhere except Tasks and
Calendar, which `AppShell` widened to 1100px (v1 for the board, v2.1 F-10
for the calendar). The board then showed four columns, which large text
crushed (v2.2's B-04, and the mid-word breaks left after B-03).

**What I built.**
- `PhoneFrame` has one width (430px, in px) on every route and is marked
  `data-app-frame`; `AppShell` no longer widens it, nor the bottom bar.
  The calendar already picked its layout with container queries, so it
  simply uses its narrow layout now (D206).
- The board has two views, chosen in Settings → Day & planning or from a
  switch on the Tasks screen (`tasks.boardView`): "Swipe between columns"
  (default) puts the columns side by side in a sideways scroller, each
  85% wide with snapping, the status pills kept in sync by an
  IntersectionObserver, arrow keys on the pills and four position dots;
  "One list" stacks them as groups whose headings fold, remembered in
  `tasks.collapsedGroups`.
- Quick filters: Due today, Light energy, Today's one thing, combined with
  AND, for this visit only, with "Clear filters" and "No tasks match these
  filters."
- An empty Not started column offers "Add task". Each column is a region
  named "In progress, 1 task".
- Cards, the "Move to…" menu, drag and drop with its announcements, Clear
  done, the Completed link and Someday are unchanged in both views.
- The audit now also fails a route whose frame differs in width from the
  others at the same window and text size.

**What broke on the way.** Two things the audit caught. The swipe view made
the whole Tasks page scroll sideways (1052px wide at 390): screen-reader-only
text in the far columns is positioned against the frame, not the scroller,
so the scroller didn't clip it; `relative` on the scroller fixed it. And at
150% on a 320px phone, card titles still split, because 85% of the
*content* width left the title 35px beside the drag handle; I made the
columns 85% of the *frame* (as the spec says) and let a card's title wrap
under its handle when it must (an 8em basis, so 100% is unchanged).

**How I checked it.** New tests (`tasks/BoardViews.test.tsx`): the same
frame on `/`, `/tasks`, `/tasks/completed` and `/calendar`; the pills
following a swipe (a stand-in IntersectionObserver); a folded group
remembered and a task moved with the menu in the list view; filters
combining and clearing; the empty column's "Add task" and the header
switch. 577 tests and v1's 164 pass. Audit: Tasks, Completed, the task
sheets, Unstick and Calendar across 6 widths × 4 text sizes, 240 runs, 0
failures (frame width the same on every route, no mid-word breaks, no
sideways scroll). Both tours unchanged (pitch 28/28 in 79 s, full 68/68 in
180 s, no AI). `/` is 299.6 KB. The visual comparison against the v2.3
baseline changes only Tasks, Completed, Calendar and the task sheets at
1280 (the frame), Tasks at 390 (the swipe view), Settings → Day (the new
row), plus the known greeting noise.

## Item 3 — Companion speech stays inside the phone area (before and after)
2026-11-04

**Before (what I found when I checked v2.2's state).** None of v2.2's
B-02 fix existed yet; the sweep paused before it. Bubbles were portaled
to `#tide-overlays` at the end of `<body>`, outside the phone frame, and
Floating UI kept them inside the *window*, so on a laptop a line like
"That's okay. We can start over." hung past the frame's right edge (x 920
vs 855 at 1280 × 130%). On Focus the bubble floated over the timer, and the
Shore's "Time of day" menu opened left of the frame. Bridge and Wrap
already used inline lines.

**What I built.**
- The overlay layer is now the frame's last child (`PhoneFrame`),
  absolutely positioned over it with `overflow: clip`; bubbles in it are
  placed with Floating UI inside the frame (boundary = frame ∩ window, 12px
  padding, at most 280px wide). Sheets keep their own layers.
- `avoidElements` (`lib/overlay/avoidElements.ts`): after placement, if a
  bubble would cover the timer, the breathing square, the bridge countdown,
  inputs, the mood map, candidate cards, a primary button or an open sheet
  (`data-bubble-avoid`), it tries the other sides; if every side collides,
  the line goes to the caption bar.
- Focus and Box breathing put the companion's words in a reserved slot in
  the layout (`bubble="slot"`), so they can't float over the timer or the
  square.
- A page bubble steps aside when a sheet or dialog opens (`backToClose`
  now tells listeners when one is open).
- Menus and tooltips use the frame as their collision boundary; the
  "Earth to Maya!" card fits the frame.
- New setting `companion.speechStyle` (Settings → Companion, and the
  Studio's Personality tab with a live preview): speech bubbles (default),
  a caption bar under the top bar that pushes content down instead of
  covering it, or no speech.
- Every line shown is remembered (`lib/companion/speech.ts`); tapping the
  top bar's companion head shows the last one from the last ten minutes,
  and with "No speech" tapping the companion does the same. The head no
  longer opens the Studio (the menu's "My companion" still does) (D208).


## Item 1 — A dynamic check-in button and Quick check-in (before and after)
2026-11-04

**Before.** The floating "Check in" button sat on every screen inside the
shell, always, with its word under it; at big text the word covered even
more. The team asked to remove it or make it dynamic.

**What I built.**
- `checkin.buttonMode` in Settings → Check-in: "Floating, smart" (default,
  D209), "In the tab bar", "Hidden"; plus "Button position" (left, center,
  right) and "Let me move the button" (a long press and drag that snaps to
  a side).
- Smart mode (`CheckInFab.tsx`, `useFabPlacement.ts`, rules in
  `lib/checkin/fabRules.ts`): shows on the main tabs and the calendar only;
  hides while a sheet or dialog is open or a field has focus; hides after
  24px of scrolling down and returns after 12px up or at either end (never
  while it has keyboard focus); shrinks to its circle at text 130%+, in a
  frame under 360px, while scrolling, or when something to press is right
  under it (then also slides 12px aside); its word stays its name and
  becomes a tooltip. A 3px ring in the last check-in's color (six hours)
  with the shape marker, and "Last check-in: Ebb, 3:40 pm" as its
  description. Long press, right-click, Shift+Enter or the menu key open
  Quick check-in; a tap opens the full check-in.
- Quick check-in (`checkin/QuickCheckInSheet.tsx`, loaded on first open):
  the four states in a 2×2 grid with arrow keys, then the four simple words
  or "Skip" (the state's middle, ±3). It saves an ordinary check-in with
  `quick: true`, so everything that reacts to check-ins still does; the
  toast offers "Add more?". Also from the `q` key and Today's state card.
  After the third full check-in, once, a tip about press and hold.
- Tab bar mode: a sixth item in the middle; icons only at 130%+ or in a
  frame under 360px, names kept and shown as tooltips.
- `--bottom-insets`: the bars at the bottom are measured, and the page's
  bottom padding is at least that plus 1rem (never less than the old
  12rem), so the end of a page is always reachable.
- The demo director's `openCheckIn` action uses the button, the tab item
  or Today's quick action, whichever exists, and the demo seeds `smart`.
- Not built: the "gentle invitation" halo (D210).

**A note on how I committed Items 3 and 1.** I built them side by side and
several files held both, so I staged Item-3-only versions of those files
for its commit, checked that snapshot on its own (typecheck, lint, 582
tests, with the Item 1 work stashed), and then put the Item 1 parts back.

**What broke on the way.** Today's first load went to 305.6 KB; D211 is how
it came back to 299.7 KB. A v1 check-in test failed twice under heavy load:
my tip check awaited a count before the "saved" toast; it no longer waits.
The audit then found Today's greeting over a primary button at 150%: the
button arrived after the bubble was placed, and Floating UI only watches the
companion, so a bubble now re-checks its spot every 300ms while it shows
(an Item 3 fix found here). And the button shrank on Today's first screen
because the "Next" card sits under it; the spec wants it full size there.

**How I checked it.** `shell/CheckInButton.test.tsx`: the rules (routes,
scroll thresholds, when it shrinks, the six-hour ring), Quick check-in
saving `{ quadrant: 'ebb', emotions: ['drained'], quick: true }` and "Skip"
saving the state's middle, the tab bar's sixth item, hidden mode's quick
action and `c` key, and the demo director opening the check-in in tab bar
and hidden modes (the tour itself always starts in smart mode). 592 tests
and v1's 164 pass. Audit at 390/1280 × 100/150%: 8 failures, 4 of them the
campus phone (Item 2) and 4 the greeting fixed above. Both tours unchanged
(pitch 28/28 in 80 s, full 68/68 in 180 s, no AI). The visual comparison
with Item 3 changes the bottom band (the button gone where it no longer
shows, compact over day cells on Calendar), the state card's new link,
Settings → Shortcuts (Q) and pages behind sheets that now sit at a slightly
different scroll (the measured bottom padding); a Wrap step's companion
line arriving in time for the capture is timing, like the greeting.

## Item 2 — Phone numbers are digits only (before and after)
2026-11-04

**Before.** The contact value and the campus phone were plain text fields.
"call mom 811" saved fine, and Support stripped non-digits only when it
built the `tel:` link, so the Call button dialed nothing or the wrong thing.
There was no country code.

**What I built.**
- `lib/phone.ts`: the country list, `sanitizeDigits`, `parsePhone` ("+52…",
  "0052…", "+1 (555)…", plain digits), the length rules (10 digits for +52
  and +1, 6–14 elsewhere), `toDialable`, a readable format, link builders
  and the one-time migration.
- `PhoneInput` (Settings): a country select plus a digits-only number field
  (`type="tel"`, `inputMode="numeric"`, `autoComplete="tel-national"`,
  17px, so iOS doesn't zoom). Letters vanish as you type or paste with a
  polite note the first time, the caret stays put, a pasted "+52 81…" sets
  the country, a "Will call: +52 81 1234 5678" line previews it, and an
  invalid number shows a neutral error linked to the field and blocks only
  that save. A phone contact can be marked "This number has WhatsApp".
- The migration (`lib/contacts/migrate.ts`, loaded lazily at start-up, once
  per workspace) splits clean numbers and flags unclear ones; a banner in
  People & support leads to fixing them, showing "Saved as: …".
- Support and the crisis screen: Call and Message (and WhatsApp when chosen)
  are built from the clean number; a number that can't work turns them off
  with "Fix the number to call or text."; each phone can be read aloud
  digit by digit.
- Onboarding keeps "Number or handle" (D212), now parsing and validating a
  number before saving it.

**What broke on the way.** The audit kept finding Today's greeting on a
primary button at big text. The real size of the bubble wasn't the cause;
the avoid rule and Floating UI's `flip` were fighting, so I simplified it:
if the best spot still covers something important, the line goes to the
caption bar (D213). That made the caption bar show up in the audit, which
flagged it as content overlapping what scrolled under it; it's sticky
chrome like the top bar, so it's marked that way now. Two audit checks
were also measuring the new in-page lines (Focus, Box breathing) as if
they floated; they now leave in-page lines alone when an overlay covers
them or they sit below the fold. The audit's phone check accepts the
digits keyboard v2.3 asks for (`inputmode="numeric"`).

**How I checked it.** `lib/phone.test.ts` (cleaning, the paste formats,
the rules per country, links, the migration's four cases and the campus
phone) and `settings/Contacts.test.tsx` (letters dropped with the note, the
country deciding the rule and the preview, an invalid save blocked, a
handle keeping its letters, Support's `tel:`, `sms:` and `wa.me` links, and
a flagged number's banner, disabled buttons and "Saved as"). The frozen v1
onboarding test still adds "+52 81 0000 0000" as a phone. 605 tests and
v1's 164 pass. Audit for Settings → People, onboarding, Support and Today
across the whole matrix: 0 failures after the fixes above. Both tours
unchanged. The visual comparison with Item 1 changes Settings → People
and Support (the new form and rows) and Today's button, now full size at
the top.


## Final verification and where Tide stands after v2.3
2026-11-04

**Final checks, on the production build.**
- Lint and typecheck clean; 605 tests in 105 files; v1's 164 tests in 33
  files (the v1 pitch path among them); the dictation freeze test, the demo
  reference test and the seed test pass.
- Layout audit, every state at 6 widths × 4 text sizes with the sweep's
  checks (mid-word breaks, outside the frame, frame width per route and per
  text size, end-of-scroll coverage, bubbles over important things, sheets,
  inputs, phone fields, console, network): 1,896 runs, **0 failures**
  (`docs/audits/2026-11-04-v23-final.json`). axe ran in the v2.2 "before"
  audit; its findings (S-01 to S-03) are still open (TEAM_TODO).
- Tours, twice each: pitch cut 28/28 in 79 s at 1× and 42 s at 2×; full
  tour 68/68 in 180 s at 1× and 95 s at 2×; no AI requests.
- `/` first load: 299.8 KB of 300.
- Visual comparison with the v2.3 baseline (160 screenshots): 115 changed,
  all from the four items: the check-in button (gone where it no longer
  shows, compact over buttons, the state card's Quick check-in link);
  Tasks, Completed, Calendar and the task sheets inside the frame and the
  swipe board; the companion's line in a slot on Focus and Box breathing,
  and bubbles kept inside the frame; the new settings rows; the contact
  form and rows. Two things that aren't items: the companion's line on a
  Wrap step arriving in time for one capture and not another (timing, like
  the greeting), and the tab icons' anti-aliasing, which shifted by a
  sub-pixel after Item 1 rebuilt the tab bar's markup (no visible change).

**Where Tide stands.** The four things the team asked for in v2.3 are
done: Tasks stays the size of the phone, the companion's words stay inside
it and off the timer (with bubbles, captions or none), the check-in button
shows where it helps and offers a two-tap check-in, and phone numbers take
digits only with the country chosen apart. The v2.2 sweep's S0 and B-03
are in too. What's not done: v2.2's AI task breakdown and its area-by-area
sweep (a team decision, TEAM_TODO), the "gentle invitation" halo (D210),
and the checks only a person on a real phone can do (TEAM_TODO, by Nov 5).
I'm least sure about how swiping the board and the button's hide-on-scroll
feel on a real phone; the tests and the audit can't feel.

**Definition of done (v2.3 spec 11).**
- [x] The check-in button is dynamic, with smart, tab bar and hidden
  modes, a chosen side, and Quick check-in (the halo isn't built: D210).
- [x] Phone fields take digits only with a separate country code; old
  contacts kept and unclear ones flagged; Call, Message and WhatsApp links
  valid; the review banner.
- [x] Companion text never leaves the phone area or covers key content;
  the speech style setting and "What did {name} say?".
- [x] Tasks stays inside the frame at every size; swipe and list views;
  quick filters (without "Has steps": D207); the frame width check on
  every route.
- [x] Nothing else changed: all suites green, the freeze test green, the
  visual diffs limited to the items (plus the two notes above), both
  tours and the v1 pitch path working.
- [x] Docs, logs, changelog, TEAM_TODO and progress reports updated.


## Before demo fixes
2026-11-04

The team rehearsed the demo and sent five problems
(`docs/TIDE_DEMO_FIX_PROMPT.md`): a `dayWraps.bulkAdd()` BulkError when the
demo starts, narration that reads some captions and not others, things on
top of each other and steps that go too fast, too many themes flashing by,
and a play/pause button that misses presses and starts again by itself.
The rule this time is to fix how the tour plays, not what it shows: the
same chapters, steps and captions, and nothing outside the demo changes.

The kickoff message was our older template again (Phases V0–V12 on
`v2-experience`); I followed the fix pack's own order (Section 11) on a new
branch, `demo-fixes`, from tag `pre-demo-fix` (= `main`, 33d642a).

**Baseline.** Lint and typecheck clean, build fine, `/` at 299.8 KB. The
suites were not quite green: every test passed (605 and 164), but vitest
exited 1 because of 14 "unhandled errors". The v2.3 check-in button checks
what sits under it on a timer and calls `document.elementsFromPoint`,
which the test DOM doesn't have, so the timer threw after some flow tests
had already finished. I guarded the call (browsers all have it). One run
after that, a Count back test failed once and passed three times alone:
it read "0 of 10" before the count had rendered under load, so it waits
for it now. Both runs are green after that.

**The script, before.** `scripts/demo-script-snapshot.ts` writes every
chapter, step id, caption, action and target, in order, to
`docs/audits/demo-script-before.json` (full tour 68 steps, pitch cut 28).
A test will hold the captions to it at the end.

**Reproduced on the production build** (headless Chrome, :3100), before
changing anything:
- Two tabs starting the tour at once: one throws `BulkError`. The seed
  clears and fills in one transaction and adds the day wraps in a second,
  so two seeds that overlap collide on the dates. In `npm run dev`, React
  Strict Mode runs the start effect twice, which is the same race in one
  tab: that's the error the team saw.
- Pause at two moments in the full tour: 8 seconds later the tour had moved
  two and three steps on, and the second time the button showed Pause
  again by itself.
- Narration on, the pitch cut: in 40 seconds only two captions were sent to
  the voice (only steps marked `narrate` are read), and both failed with
  `not-allowed`. The tour starts after a full page reload into the demo
  workspace, and a browser won't speak on a page nobody has tapped yet.
  The team heard narration "sometimes" because tapping the bar gave the
  page that first tap.

One more thing I found while reading, outside the five: the seed only
checks the workspace flag in `localStorage`, which every tab shares, and
`DemoHost` re-reads it on every settings change. A tab still showing
someone's own data, after another tab entered the demo, could mount the
demo runtime and seed Maya's data over theirs. The spec's guard (seed only
into the demo database, by its name) closes that, and I'll make `DemoHost`
check the open database too.

### D-1: the dayWraps BulkError
**Cause.** Two seeds overlapping. Of the six causes the spec lists, three
applied: the start effect runs twice under React Strict Mode in development
(the team's error), two tabs can start the demo at once (my reproduction),
and the "already seeded?" check (check-ins and day wraps counted) ran
outside the transaction that wrote. The seed also ran in two transactions,
so the second seed's clearing landed between the first one's two writes,
and both then added the same eleven dates. Not causes: the clearing list
already had every v2 table, and the generator never makes two wraps for
one date (a test now checks every table's keys).

**Fix.** One seed function, one transaction, `bulkPut`, the marker last
(D214), single-flight across callers and tabs, a once-only start in the
runtime even under Strict Mode, and a calm "The demo data couldn't be
prepared. Try again." if it ever fails. The seed refuses the main database
by name, and the runtime mounts only on the demo database (D215); that
closes the cross-tab hole I described above.

**Checked.** Eight new tests (twice in a row, three at once with a single
write, forced over a changed workspace equal to a fresh seed, a failure
on the day wraps or the bottle rolling back with no marker, the main
database refused and left empty, the planted patterns, unique keys in
every table). The v1 and v2 seed tests pass unchanged. On the production
build, the two-tab start three times: no BulkError. The pitch cut: 28 of
28 in 80 s.

### D-5: play/pause
**Causes, confirmed.** Four of the spec's list and one it didn't have:
- Pause was a flag read between steps, and the end of every step set it
  back to false, so a pause mid-step lasted until that step ended (my
  reproduction: two and three steps further after 8 seconds, and the
  button back on "Pause").
- Space with focus on the button toggled twice (the window shortcut, then
  the button's own click), so nothing seemed to happen.
- The bar measured its target on every redraw and could jump between the
  bottom and the top mid-step, under a finger.
- The demo clock kept running while paused.
- New: while any sheet is open, Radix sets `pointer-events: none` on
  everything outside it, the bar included. Pause couldn't be pressed at
  all during the check-in, Day Mode, Unstick or Bridge sheets.
Not causes: no button toggled on pointerdown, the button wasn't re-created
on redraws, and the bar's z-index was already above sheets and
celebrations.

**Fix.** The engine is a state machine (D216) with an AbortController per
step and resumable progress; every wait, the target search, typing and the
custom actions stop on abort. Pause freezes the demo clock. The bar's
position is decided once per step. The controls are one memoized component
with a single play/pause button (named "Pause demo" / "Play demo", with
`aria-pressed`) that reacts to click only, a 300 ms guard against double
toggles, a "Paused" label, and keys that leave Space to a focused button.
A hidden tab pauses; media keys go through the same guard. Sheets and
dialogs no longer treat a press on the bar as a press outside (D217). The
demo clock now keeps a speed change across settings redraws; without
that, a paused clock jumped back to the moment it was last saved.

**Checked.** Fourteen new tests: every move of the state machine; the full
tour paused at 30 random moments with a minute of fake time after each
(step, caption, typed text and demo clock unchanged, speed 0), finishing
with all 68 steps done; typing continuing from its character; only the
rest of a hold after a pause; a tap never repeated; the clock frozen at
60× and restored; Space on the focused button, two clicks in 300 ms, a
press across a redraw (same button element); a voice finishing during a
pause; a hidden tab; Next and Previous while paused. On the build: two
pauses held for 8 s each with nothing moving, and Pause pressed during the
check-in sheet works and leaves the sheet open. 627 tests, v1's 164,
build fine; `/` is 299.9 KB (the sheet's keep-open check added 0.1 KB).

### D-2: narration
**Causes, confirmed.** Of the nine on the spec's list: only steps marked
`narrate` were sent (7 of the full tour's captions), the director moved on
after a fixed 9 s whatever the voice was doing, and, the big one, audio
wasn't unlocked: the tour starts on a page that was just reloaded into the
demo workspace, and Chrome refused every utterance with `not-allowed` until
someone tapped the page. That's why the team heard it "sometimes": a tap
on the bar unlocked it for whatever came after. I also built in the
fixes for Chrome's cancel-then-speak drop and garbage-collected
utterances, late voices and the 15-second cut-off (the voice engine's
chunks), though my reproduction didn't reach them. Pause now aborts
speech and play reads the caption again, never using
`speechSynthesis.pause()`.

**Fix.** The narrator queue (D218), every caption read, the step waiting
for both its hold and the voice, the tap gate when the page hasn't been
tapped, warm-up on that tap (priming, voices loaded and one chosen for the
run, the sound context resumed, the first natural-voice clips fetched if a
natural voice is set up, then each next one in the background), and a
one-time "Narration isn't available on this device" line when there's no
voice at all.

**Checked.** Eleven new tests (every caption of both tours read once and in
order, the tour waiting on the voice, silence with narration off, the gate
and the priming order, the no-voice line, the retry then skip, the end
timeout, the abort, and, on the real voice engine with a fake
`speechSynthesis`, the utterance held until it ends and 120 ms between a
cancel and the next speak). On the build in Chrome: the tour waited for
Play with nothing spoken, then all 15 captions of the pitch cut were
spoken, each with a start and an end, none overlapping, no errors, 28 of
28 steps in 82 s.

A testing note for whoever repeats this: Playwright's locators and
`evaluate` run with a user gesture, so polling the page before the tour
decides counts as the tap and the gate never shows. The check waits five
seconds before touching the page.

### D-3: overlaps and steps that went too fast
**What I found.** The pitch cut capped every hold at 0.9 s and the old
rule divided reading time by the speed, so captions could go by in under
two seconds. The spotlight was placed 250 ms after its target appeared and
then eased 300 ms behind it, so it framed where a sliding button had been.
The pointer stayed on screen through typing and holds. The bar sat over
the floating check-in button, and toasts appeared under the bar. While a
celebration played, the caption stayed up.

**Fix.** The pacing and the step order in D219: `pacing.ts`, `stable.ts`,
a rewritten step runner, a spotlight that follows its target every frame
and is clipped to the phone frame, a pointer shown only for the glide and
the tap's ripple, the bar placed once per step above the bottom bars and
reserving its space, one toast at a time above it, companion bubbles kept
to the companion's steps, and no caption over a celebration.

**What broke on the way, and how I found it.** Two things, both in the
browser and not in the tests. The CSS rules didn't reach the build at
first: Turbopack's build cache served an older `globals.css`, so the
rebuild now clears `.next/cache/turbopack` first. And the full tour
skipped `focus.nudgeYes`: with the longer caption, the focus block at 60×
ended before the nudge was answered, so that fast-forward is 20× now.

**Checked.** Ten new tests (the reading-time formula and speeds, the
caption and its hold only after the target stops moving, never two
spotlights and a gap between them, the spotlight ending on its target,
the bar's place fixed for the step, its space reserved and the toast
rules present, no caption during a celebration, companion steps, motion
Off with no pointer and full holds). On the build, sampling every 150 ms:
full tour 68 of 68 in 254 s, pitch cut 28 of 28 in 113 s, the bar never
moving within a step, never two spotlights, no toast under the bar, no
caption during a celebration, no page errors. 648 tests and v1's 164.

### D-4: three themes
The full tour cycled Coral Reef, Midnight Tide, Kelp Forest and Lagoon at
0.7 s each, divided by the speed, so at 2× each was on screen for a third
of a second. Now it's Ink, Pearl and the seeded theme, each a full second
after its crossfade (D220). Five new tests (the sequence, a second each
at 1× and 2×, one caption read once for all three, and through the whole
tour the only later theme change is the comfort chapter's restore to the
same theme). On the build, sampling the page's theme every 20 ms: Ink
1000 ms and Pearl 1027 ms after their 320 ms fades at 1×, 1031 ms and
1036 ms at 2×, then Lagoon, still on 20 s later. 653 tests and v1's 164.

### The debug panel
With `?demoDebug=1`, the panel keeps its list of steps (the tour check
reads it) and adds the demo clock's time and speed and a timed log of
what the director did: every state change with what caused it (start,
click, key, media, next, hidden tab), the toggles the 300 ms guard
ignored, each step's start and end, waits for the screen over 200 ms and
any that timed out, narration (voices found, speaking, retries, skips,
stops) and theme changes, with "Copy log" to paste it into a message.
The engine keeps the log from the tour's first moment. One new test;
654 tests and v1's 164; the pitch cut 28 of 28 with the new panel.
