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
