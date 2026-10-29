# Decisions

Decisions I made where the spec was silent, ambiguous, or assumed an older
version of a library. Each entry has the date, the decision, why, and what I
rejected. — Claude Code

**D1 — 2026-10-28 — Cache Components stays off.**
The Next.js 16.4 scaffold turns on `cacheComponents`, which forbids the
`runtime` and `dynamic` exports the spec asks for on the AI routes (10.3).
Tide keeps all data in the browser, so server caching adds nothing.
Rejected: keeping it on and dropping those exports, which would make the
routes behave differently from the spec and harder to explain.

**D2 — 2026-10-28 — `npm run lint` runs `eslint .`, not `next lint`.**
Next.js 16 removed `next lint` (bundled docs, version-16 upgrade guide). The
flat ESLint config from the scaffold (`eslint-config-next`) is unchanged.
Rejected: pinning an older Next just to keep the old command.

**D3 — 2026-10-28 — Tailwind 4 tokens live in `globals.css`, not a config file.**
Tailwind 4 is configured in CSS with `@theme`. The spec's "map tokens in
tailwind.config" is done there instead: `--color-surface`, `--color-ebb-tint`
and friends become `bg-surface`, `bg-ebb-tint` and so on. shadcn/ui's own
variable names (`--background`, `--popover`…) point at Tide's tokens, so the
generated components follow light and dark mode without raw colors.

**D4 — 2026-10-28 — The demo start time is built from local time parts.**
The spec writes `new Date('2026-11-05T15:40:00-06:00')`. That is 3:40 pm only
on a device set to Monterrey time; a laptop on Arizona time would show 2:40 pm
while the seeded classes sit at their local hours. I use
`new Date(2026, 10, 5, 15, 40)` so the demo reads "Thursday, November 5,
3:40 pm" on any device. In Monterrey the two are identical.

**D5 — 2026-10-28 — Averages round half away from zero.**
When Maya picks Drained (-3, -3) and Frustrated (2, -3), the average energy is
-0.5. `Math.round(-0.5)` is `-0`, which counts as "high energy" and would file
the check-in under Surge. The demo script expects Ebb, and the feelings lean
low, so `clampCoord` rounds -0.5 to -1. A unit test covers it.

**D6 — 2026-10-28 — No shadcn "destructive" (red) style.**
The generated Button had a red `destructive` variant. The spec bans red error
states, so I replaced it with a neutral `notice` variant and pointed shadcn's
`--destructive` variable at `--notice`. Close buttons on sheets and dialogs
show the word "Close" next to the X, since icons must carry text.

**D7 — 2026-10-28 — `next-themes` removed.**
shadcn's toast component pulled in `next-themes`. Tide already has its own
theme setting in Dexie (with a localStorage mirror for the first paint), so a
second theme system would disagree with it. The toaster reads Tide's setting.

**D8 — 2026-10-28 — Trusted contacts carry a method.**
The spec stores `{ name, method, value }` without listing methods. I use
`phone` (Call and Message buttons, via `tel:` and `sms:`), `email` (Message
via `mailto:`) and `handle` (shown as text, since there is no standard link).
Each contact also gets an `id` so editing and removing are reliable.

**D9 — 2026-10-28 — Extra settings keys.**
Beyond Section 7.2, settings also store `name` (Settings → Profile),
`demoClock` (`{ base, startedAt }`, so "Restart demo" and "Jump to bridge
moment" can pick any demo time) and `dayModeBannerDismissedFor` (the check-in
id the banner was dismissed for, so "Not now" lasts until the next check-in).

**D10 — 2026-10-28 — Win text is built in `lib/wins.ts`, written in `lib/repo/wins.ts`.**
The spec lists both files. The pure sentence builders live in `lib/wins.ts`
(easy to test and to change wording); the repo functions that change task,
focus, strategy and transition records call `addWin` inside the same
transaction, so a win can't be saved without its cause or vice versa.

**D11 — 2026-10-28 — No temperature; thinking off and low effort for the two default models.**
The spec's `callJson` defaults to `temperature: 0.3`. As of October 21, 2026
the Messages API rejects `temperature`, `top_p` and `top_k` with a 400 on
every model, and the installed SDK (1.3.0) no longer even types them, so I
send none. Haiku 5.5 and Sonnet 5.5 also think before answering by default,
and thinking tokens count against `max_tokens`; with budgets of 350–600 that
could cut the JSON off mid-object. For these short structured answers I turn
thinking off (`disabled` on Haiku 5.5, `between_tools` on Sonnet 5.5, which
is how that model spells "off") with `effort: "low"`. Any other model named
in the env vars gets the API defaults. Rejected: raising `max_tokens`, which
adds latency to a feature that has an 8-second (4 in demo) budget.

**D12 — 2026-10-28 — A refusal becomes a normal fallback.**
If the model declines (`stop_reason: "refusal"`), `callJson` throws
`provider_error` and the browser shows the built-in suggestion. I did not add
the API's server-side model fallback (a beta parameter): Tide already has a
deterministic fallback for every route, and one fewer beta feature is one
fewer thing to break on stage.

**D13 — 2026-10-28 — Semantic checks also get the one retry.**
Spec 10.4 says the extra checks "reject → fallback". I run them inside
`callJson` alongside zod, so an invented emotion id gets the same single
retry with the reason ("ids not in vocabulary: melancholic") before falling
back. It costs nothing when the first answer is fine and rescues a common
mistake. The narrate number check is the exception: it never rejects, it
swaps the one card for its template, exactly as the spec describes.

**D14 — 2026-10-28 — Demo cache: a 900 ms race, cache wins ties.**
Sections 10.1 and 14.4 describe the demo cache slightly differently (a race
against a 900 ms cache, versus "use live if it returns within the demo
timeout"). I implemented the 10.1 race: the live answer is used only if it
arrives valid within 900 ms; otherwise the saved answer is shown. On stage,
the same words every rehearsal matter more than showing a live call, and the
demo never waits 4 seconds. Anything off-script goes live as normal.

**D15 — 2026-10-28 — Day Mode fallback: started work first, and skip what doesn't fit.**
Spec 10.6 sorts by due date then energy cost and "keeps while the total fits".
Two refinements: on the same due date, a task already in progress or stuck
sorts before one not started (moving the lab report Maya is halfway through
would throw away her context), and a task that doesn't fit is skipped rather
than ending the loop, so a light task later in the list can still be kept.
On the demo board this keeps "Email TA about lab data" (due today) and
"Chemistry lab report" (4 of 4 points).

**D16 — 2026-10-28 — The Unstick fallback still changes with state.**
13.6 requires the step to differ between Ebb and Swell, including with AI
off. The 36-entry table is per reason and type, so I add a short state tail:
Ebb gets "You can stop after that." (permission to do only the tiny step),
Swell gets "Then keep going for the whole block." Focus length follows the
quadrant (5/10/15/25, 10 with no check-in) and is 5 for "I don't have
energy". "Different step" walks down to a smaller step for the same task type.

**D17 — 2026-10-28 — Safety phrases match whole words, and idioms are excluded.**
"This deadline is killing me", "dying to" and "dead tired" do not trigger the
crisis screen; "kill myself" does even when it may be a joke. Sending someone
to a crisis screen for venting about homework would teach them to stop
writing honestly, while a false alarm on "kill myself" is the safer mistake.
I added a few unambiguous phrases to the spec's list ("end it all", "take my
own life", "no quiero estar vivo/viva", "acabar con mi vida"); the team
reviews the list with their partner.

**D18 — 2026-10-28 — HTTP status codes for the envelope.**
The spec defines the envelope but only the 429 status. I use 400 for invalid
input, 503 for a missing key, 504 for a timeout and 502 for invalid output or
a provider error. The browser treats every `ok: false` the same way.

**D19 — 2026-10-29 — A configured `cn`, so Tide's type scale survives class merging.**
shadcn 4 ships its own `cn` (a tailwind-merge replacement). It didn't know
`text-h2` is a font size and dropped it whenever a text color followed,
which shrank every sheet title to body text. `src/lib/utils.ts` now builds
`cn` with `createCn` and lists Tide's sizes and radii; every component
imports it from there.

**D20 — 2026-10-29 — Body cues are place × feeling pairs plus one energy cue.**
Spec 9.2 stores cues like `chest:tight`. When Maya picks places and feelings
I send each pair (`chest:tight`, `stomach:tight`…), up to seven, plus one
`energy:low|medium|high` cue from the slider, so the label route always gets
at least one cue even if she only moved the sliders. The comfort slider is
sent as `pleasantnessHint`.

**D21 — 2026-10-29 — The mood-map dot follows picks until Maya moves it.**
13.4 says the dot sits at the average of the selected words and that moving
it doesn't change the words. I also stop picks from moving the dot once she
has moved it herself, so her own placement is never overwritten. Before any
pick, the dot rests on the first suggestion; that is a position, not a choice,
and "Next" stays disabled until she picks a word or moves the dot.

**D22 — 2026-10-29 — The mood map is one focusable slider with arrow keys.**
A 2-D control has no native role. The dot is `role="slider"` with arrow keys
(up/down energy, left/right pleasantness) and an `aria-valuetext` like
"Energy 2, pleasantness minus 3, Surge". A polite live region speaks only
after a drag or tap, so keyboard changes aren't announced twice. "Use sliders
instead" swaps in two standard sliders.

**D23 — 2026-10-29 — "Regulate first" opens the toolkit as it is.**
The spec says to open `/toolkit` "filtered to the current quadrant". The
toolkit already filters by the latest check-in within six hours, and the
check-in was just saved, so no query parameter is needed.

**D24 — 2026-10-29 — The strategy-before-task rule is written once, in Phase 3.**
Unstick's "helped you 4 of 5 times" line and the Patterns card must agree, so
I wrote `src/lib/patterns/rules/strategyBeforeTask.ts` now (spec 12.4 A,
including the 20-minute link and the no-strategy baseline). Unstick reads
`helpfulStrategiesFor()`; Phase 7 reuses the same groups for the card.

**D25 — 2026-10-29 — "State" for suggestions means a check-in from the last six hours.**
Unstick, Focus and (later) Bridge send Maya's state only if she checked in
within six hours (`src/lib/latestState.ts`), the same window the toolkit
header uses (13.9). Without a recent check-in they behave as "no state".

**D26 — 2026-10-29 — Moving to Stuck opens Unstick; the reason is stored only for stuck tasks.**
"Break it down for me" opens Unstick with `too_big` for a task that isn't
stuck; its reason is sent to the AI but not saved as `stuckReason`, because
that field is what earns the "Got unstuck" win and shows "Stuck because…".

**D27 — 2026-10-29 — Unstick is mounted once, above the tab layout.**
It opens from the board, Today and the focus page (which has no tab bar), so
the sheet lives in `src/app/providers.tsx`. Each opening mounts a fresh body
keyed by the request, so one task's step can never flash on another task.
Returning from "Do it first" goes to `/tasks?unstick=<id>`, which reopens the
sheet on the step Maya was given (kept in memory for the visit).

**D28 — 2026-10-29 — Drag and drop commits on drop.**
dnd-kit with a pointer sensor (6px threshold so taps on buttons still work)
and the keyboard sensor, a drag handle per card, and spoken announcements.
A card moves to its new column when dropped rather than previewing the move
while dragging; it keeps the code small, and "Move to…" is the main path.

**D29 — 2026-10-29 — The focus timer only redraws on an interval.**
Remaining time is `minutes − (now − start − paused)`, computed from `now()`
on every draw; the 250 ms interval only asks React to redraw. A test jumps
the system clock five minutes ahead (as if the phone slept) and the block
ends on the next draw. Ending a block that never started saves nothing.

**D30 — 2026-10-29 — The win card only claims "felt like this too" when it's true.**
13.3 says to pick the most recent win from a day with an Ebb check-in, else
the most recent win. For the second case the sentence "Last Tuesday felt like
this too" would be invented, so it reads "You have done hard things before.
Recently you {win}." Only wins from earlier days are used.

**D31 — 2026-10-29 — What counts as "today's tasks".**
Due today, kept in today's plan, carried over to today (`movedTo` = today),
or in progress; never tasks moved off today or done ones. "Bring back" clears
the move and adds the task to the plan's kept list, so it really returns to
today even when it isn't due today.

**D32 — 2026-10-29 — Day Mode plans every open task, up to 25.**
Every task that isn't done is offered to the plan (soonest due first, capped
at the schema's 25). Moving a task due next week "to tomorrow" is harmless:
it keeps its due date and just leaves today's list. Maya's toggles can push
the kept total over budget; the total is shown, but she's in charge.

**D33 — 2026-10-29 — Live queries read open-ended ranges.**
Dexie re-runs a live query only for changes inside the key range it read.
A query for "check-ins from midnight until now" therefore missed a check-in
saved a minute later. Queries that end at "now" read an open-ended range and
filter by time in code (`useTodayData`, `recentCheckIn`). A flow test caught
this.

**D34 — 2026-10-29 — Every strategy run is recorded, even when Maya skips the re-check.**
A use with no result still matters: the strategy-before-task rule links any
strategy to a focus block that starts within 20 minutes, re-checked or not
(the demo's walks are not re-checked on purpose, spec 14.2). Skipping the
re-check saves the use without a result and goes straight back.

**D35 — 2026-10-29 — The toolkit opens on the family of the best match.**
13.9 lists family tabs without saying which one opens first. The tab that
opens is the family of the top-ranked strategy for Maya's current state, so
the first thing she sees is the best suggestion. With a state, the list is
filtered to strategies that suit it; "Show all" lifts the filter.

**D36 — 2026-10-29 — Sudoku "Check" compares to a unique solution.**
Each of the five puzzles has exactly one solution (a brute-force test
proves it), so comparing against the stored solution can never call a
correct alternative "off". When nothing is off but the grid isn't full, it
says "So far, every number you placed fits." Puzzles rotate per opening.

**D37 — 2026-10-29 — Grounding cards have one optional box per item.**
"Name 5 things you can see" shows five small optional inputs, "Name 1 thing
you can taste" shows one. Nothing typed is saved; "Next" works with every
box empty.

**D38 — 2026-10-29 — "From" includes an event that ended in the last 15 minutes.**
13.8 says "from" is the current event if one is ongoing. At 4:41 pm the lab
(2:00–4:40) has just ended, but Maya is still walking out of it; a strict
rule would show "Chemistry lab report → Calculus" instead of the switch the
demo is about. An event that ended up to 15 minutes ago (the same window as
the Bridge itself) still counts as where she's coming from.

**D39 — 2026-10-29 — A Bridge draft lives in memory until "Done, I'm going".**
The Transition record is only written when Maya leaves, so the card stays
visible until then. While the sheet is open, a draft (id, typed note, ticked
prep items) is kept per event in `bridgeDrafts.ts`; the strategy runner
records the use against the draft id and returns to `/?bridge=<id>`, which
reopens the same switch. If the page is reloaded mid-bridge, the draft is
lost but the card is still there and starts a fresh one.

**D40 — 2026-10-29 — The hard-transition rule is written once, in Phase 6.**
Like D24: the Bridge's "has felt hard 3 of the last 4 times" line reads
`hardSwitchFor()` from `src/lib/patterns/rules/hardTransition.ts`, the same
rule the Patterns card uses, with the same bar (n ≥ 3, rate ≥ 0.5). The
"with strategy" comparison includes both sides' counts, and the template
only says a strategy made the switch easier when the numbers show that.

**D41 — 2026-10-29 — Prep steps include the place.**
The fallback (and the cached demo answer) lists the event's prep items and
then "Go to {place}", so the demo's checklist reads Calculator, Notes from
Tuesday, Go to Room 4-203, as 14.3 expects.

**D42 — 2026-10-29 — Pattern results carry readable evidence rows.**
12.2 lists `evidenceIds`; the Why panel also needs dates, labels and
outcomes, so each rule also returns `evidence` rows already in words ("Tue,
Oct 27, 3:12 pm · 3-minute walk → writing · Got going"). The ids stay for
anyone who wants to trace the raw records.

**D43 — 2026-10-29 — Sorting and baselines where the spec is silent.**
Patterns without a baseline (hard transitions, strategy effect) sort as "no
difference from usual" on the second key. For the state-before-task rule,
the baseline is that task type's rate across all focus blocks that had a
check-in in the three hours before (the same population as the groups).

**D44 — 2026-10-29 — The card's numbers never come from the AI.**
The meta line ("4 of 5 times · Last 4 weeks") and the confidence dots read
the engine result directly. The AI writes only the title, body and the
"why" sentence, and the server swaps any card whose text contains a number
not in its facts. While the words load, the card shows the numbers and a
"Putting this into words…" line.

**D45 — 2026-10-29 — "Hardest switch" uses rated switches of any rate.**
13.10 shows the hardest switch "if any rated transitions"; it uses the pair
with the highest hard rate (ties: more ratings first), even when that pair
isn't hard often enough to be a pattern card.

**D46 — 2026-10-29 — Commit messages carry no AI trailers.**
The spec's convention (1.6) ends each commit with `AI-Generated: Claude
Code`. The team asked that commits use only their own Git identity with no
AI markers. The competition's attribution requirement is met by
`AI_ATTRIBUTION.md`, `docs/AI_DEV_LOG.md` and the progress reports, which
say plainly that the code is AI-generated. CLAUDE.md now says the same.

**D47 — 2026-10-29 — Sheets and forms load when first opened; Today is 267 KB, not under 250.**
15 asks for under 250 KB of gzipped first-load JavaScript on Today. The
first production measure was 330 KB (not counting Next's legacy polyfills,
which modern browsers skip). Three changes brought it to 267 KB: the check-in,
Day Mode, Bridge and Unstick sheets and the add-task/add-event forms load on
first open (`WhenOpened` + `next/dynamic`), which also keeps zod and the AI
runner off the first load; framer-motion is only loaded on Patterns (a small
`matchMedia` hook replaces its reduced-motion hook); and the unused Tooltip
provider is gone. About 125 KB of what remains is React and the Next runtime,
32 KB is Dexie (the on-device database), and 16 KB is Radix's dropdown menu
(top bar menu and "Move to…"). Replacing those menus with a lighter custom
disclosure would close most of the gap; I didn't, because the Radix menu's
keyboard and screen-reader behavior is worth more to Tide's users than 17 KB.
Rejected: `optimizePackageImports` for `radix-ui` (measured, no effect;
Radix was already tree-shaken).

**D48 — 2026-10-29 — No Playwright; the scripted demo is tested in jsdom and walked in the browser.**
16.3 makes Playwright optional. `src/test/demoScript.test.tsx` runs the whole
14.3 script against the real seed (twice with the network down, once with
live AI mocked), and Phase 10 walks it in the in-app browser. Installing a
second browser just for this would add setup the team has to maintain.

**D49 — 2026-10-29 — Two demo start times.**
"Restart demo" starts at 3:40 pm as the spec says. "Restart demo at bridge
time" starts at 4:36 pm rather than the spec's 4:31 pm: at 4:31 the Bridge
card would only appear four minutes later (it shows 15 minutes before
Calculus at 4:50), long after the demo has moved on. At 4:36 it is on Today
from the start, and the lab (until 4:40) is still where Maya is. "Jump to
bridge moment" sets 4:41 pm, nine minutes before Calculus, as in 14.3.

**D50 — 2026-10-29 — Saved demo answers are built from the live input.**
The cached Day Mode plan keeps whichever task ids are titled "Chemistry lab
report" and "Email TA about lab data" and moves the rest, so it still passes
the "every task placed once" check if someone adds a task on stage. The
bridge answer picks Box breathing only if it is among the candidates sent.
Saved narration is written for Gentle mode (the persona's) and only used
when the numbers are exactly the planted ones.

**D51 — 2026-10-29 — Turning demo mode off clears the persona too.**
13.12 says turning demo off "clears demo data". The name, the fake contact
and the campus placeholder were part of the persona, so they go too; text
size, theme and other comfort settings stay.

**D52 — 2026-10-29 — Darker notice color, and accessible names that start with the visible words.**
Lighthouse measured the light-theme notice color (#8a6d1f, used by "Delete
everything") at 4.49:1 on the page background, just under AA. It is now
#80651c, which passes and still reads as the same amber. The "Move to…"
buttons were named "Move {title} to another column", and the Day Mode
toggles "Move {title} to tomorrow" and "Keep {title} today", so the visible
words were not at the start of the name and voice-control users could not
say what they saw. The names are now "Move to… {title}", "Move to tomorrow:
{title}" and "Keep today: {title}".
Rejected: hiding the visible text from the accessibility tree and keeping the
old names (that fixes the audit, not the problem).

**D53 — 2026-10-29 — Buttons may shrink, and the demo badge wraps under the title.**
At 150% text on a 390px screen, the top bar (title, "Demo data" badge and
Menu) and two long buttons ("Remove campus support", "Add reward") pushed the
page wider than the screen. The shadcn button had `shrink-0`; it is gone, so
a button in a tight row wraps its label instead of overflowing (labels
already wrapped). In the top bar, the title and badge share a wrapping
group, so the badge drops under the title and Menu stays on screen.
Rejected: hiding the badge or the word "Menu" at large sizes (the badge is a
promise to judges, and icons always keep their labels).

**D54 — 2026-10-29 — A focus block counts once per strategy in "k of n".**
Rule A linked each strategy use to the first focus block within 20 minutes.
Doing the same walk twice before one block counted that block twice, so
"4 of 5" became "6 of 7" after one real session. Now each block is claimed
once per strategy, by the use closest before it. The planted demo numbers
are unchanged. Rejected: dropping repeated uses entirely (a walk on a
different day before a different block is a real second occasion).

**D55 — 2026-10-29 — Coming back from "Do it first" skips questions already answered.**
After the walk, the Unstick sheet reopens on the same first step without
offering the walk again. If the page was reloaded in between (so the
in-memory step is gone), it asks the AI or fallback again with the reason
saved on the task instead of asking "What's making it hard?" twice.

**D56 — 2026-10-29 — "Read aloud" picks the clearest English voice itself.**
Tide set the language to English but left the voice to the browser, which
uses the system default. On a Mac set to Spanish that is Paulina, so English
steps came out in a Spanish accent and were hard to follow. `speech.ts` now
scores the English voices: downloaded high-quality ones first ("Premium",
"Enhanced", "mejorada", "Natural"), then voices known to read clearly
(Samantha, Ava, Daniel…), US English, then on-device voices. The Mac's
novelty and robotic voices (Bubbles, Zarvox, Fred, Eddy…) are never chosen.
If no English voice qualifies, the browser decides as before.
Rejected: a voice picker in Settings for now. It would add a choice most
people never need; the automatic pick fixes the actual problem, and a
better voice installed on the device is picked up automatically. (Revisited
the same day in D57, once the team asked for a gentler voice.)

**D57 — 2026-10-29 — A gentler read-aloud: calm pace, soft voices first, a voice picker, and numbers in words.**
The team asked for a gentler voice, and heard "Breathe in for cuatro": on a
device set to Spanish the speech engine reads digits in Spanish even with an
English voice. Now every read-aloud text has its numbers written out in
English first ("four", "five, four, three, two, one", "four fifty pm");
speech runs at 0.9 of the chosen speed; soft voices (Ava, Zoe, Samantha,
Moira…) rank above brisker ones (Daniel, Karen…); and Settings → Comfort
has "Read-aloud voice" with "Try this voice", because which voice sounds
gentle is personal and differs by device. A saved voice that isn't on the
current device falls back to the automatic pick. The button also gives
itself back after 3 seconds if speech never starts.
Rejected: changing the pitch for a softer sound (the built-in voices get
muffled), and asking the AI to avoid digits (the strategy steps aren't
AI-written, and any voice still needs the fix).
