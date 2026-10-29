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
One test fails in the full parallel run and was not investigated before the
session stopped:


**Still to do:** finish Phase 8 (fix that test, `docs/demo-script.md`, PWA
manifest and icons via `sharp`, performance pass, After Phase 8 entry),
then Phase 9 (prompts-doc page, README, architecture, research template,
attribution audit, deploy steps, secret scan) and Phase 10 (full audit).
Resume with the message in Appendix C.2 of the build prompt.
