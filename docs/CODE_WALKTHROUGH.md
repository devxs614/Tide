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
*(Phase 1)*

## Safety
*(Phase 1)*

## Check-in
*(Phase 2)*

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
*(Written once the AI layer exists, Phase 1, and finalized in Phase 9.)*
