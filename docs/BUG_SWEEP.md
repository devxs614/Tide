# Tide v2.2 bug sweep

I'm Claude Code. The team asked me to fix the bugs they found and sweep the
rest of the app without changing anything that works. This file is the
record of every bug: where it was, why it happened, how I fixed it, and how
I checked it. The spec is `docs/TIDE_V2_2_BUG_SWEEP_PROMPT.md`.

## Summary
- Reported bugs fixed: B-03 here; B-01, B-02 and B-04 through v2.3 Items 2,
  3 and 4; B-05's check-in button part through v2.3 Item 1. B-05's other
  parts and B-06 are still open (see "On hold while v2.3 runs").
- Sweep findings: to come
- Audit before: 1,386 failures in 1,896 state runs (`docs/audits/2026-11-03-sweep-before.json`) · after v2.3: 0 failures in 1,896 runs without axe (`docs/audits/2026-11-04-v23-final.json`); axe's S-01 to S-03 still open
- Visual diffs at default settings: to come

## Reported bugs

### B-01 — Phone number fields accept letters
- Severity: High · Status: Fixed by v2.3 Item 2 (D212)
- Where: trusted contacts (onboarding and Settings → People & support), the
  campus support phone, the call and text links built from them
- Reproduce: type "abc" in a contact's phone field; it's kept and saved
- Audit before: the campus support phone is a plain text field with no
  phone keyboard (`phone-input`, 24 runs in Settings → People)

### B-02 — Companion bubbles leave the phone frame, cover the timer, and the companion paints over sheets
- Severity: High · Status: Found
- Where: desktop (the phone frame inside a wide window), Focus, the Focus
  outcome sheet
- Reproduce: on a 1280px window, start a focus block and choose "Make the
  step smaller"; the bubble sits over the timer and the companion over the
  outcome sheet's edge, whose Close button is cut off
- Reproduced: on Focus, "I'm done early" → "Didn't start". At 390px the
  line "That's okay. We can start over." sits on the timer circle; at
  1280px × 130% it also hangs past the frame's right edge (x 920 vs 855).
- Audit before (`outside-frame`, 212 runs on desktop widths): companion
  bubbles in Day Mode and on the Shore, the Shore's "Time of day" menu
  (left of the frame), the "Change which events?" dialog (wider than the
  frame), and the "Earth to Maya!" card (4px wider than the frame on each
  side). The greeting bubble also landed on the TopBar in one baseline run.

### B-03 — Words break letter by letter with larger appearance
- Severity: Critical · Status: Fixed (Tasks board cards go with B-04)
- Where: the TopBar title ("Toolki t"), tab labels ("Patter ns"), task
  card titles ("Rea / d / VSS / S / docu / me / nt")
- Reproduce: Settings → Appearance → text size 130% or 150%, then Toolkit
  and Tasks
- Audit before (`mid-word-break`, 794 runs, mostly at 130–150%): tab
  labels ("Patter ns" 314, "Toolki t" 41), TopBar titles ("Settings" 140,
  "Calendar" 24, "Toolkit" 15, "Patterns", "Today", "Tasks", "Shore"), the
  "Demo data" badge (41), speech bubbles ("how-ever", hyphenated), Toolkit
  cards ("somewhere"), the Count back instructions (22) and the Completed
  list (14). Six already at 100% (narrow phones).
- Root cause: two kinds. (1) `overflow-wrap: anywhere` on the tab labels
  and the bubble (plus automatic hyphenation there), which lets a word
  split anywhere. (2) Boxes allowed to shrink below one word (`min-w-0`)
  while their neighbors never yield: the TopBar title next to a companion
  head that only hid when the *window* was narrow (so never on a laptop,
  inside the 430px frame), Toolkit's two columns switched on by the
  window's width, and two text columns with a zero flex basis (Count back,
  Completed rows). Ordinary `break-word` then had to split the word.
- Fix:
  - tab labels: no breaking; they grow with text only up to 1.2× and never
    past 4% of the bar's width (D205) — `shell/TabBar.tsx`;
  - TopBar: the head hides by the bar's own width (at big text, and below
    17.5em), and at big text "Menu" keeps only its icon, still named
    "Menu" — `shell/TopBar.tsx`;
  - the bubble: `break-words`, no hyphenation — `companion/CompanionSay.tsx`;
  - Toolkit: two columns need the window *and* 22em of list width —
    `toolkit/ToolkitScreen.tsx`;
  - Count back and Completed rows: a 7em / 8em basis so neighbors wrap
    instead — `toolkit/tools/CountBack.tsx`, `tasks/CompletedArchive.tsx`.
- Test: `src/test/sweepGuards.test.ts` ("never lets ordinary words split
  mid-word") fails on the baseline code and passes now; the audit's
  mid-word check at 320/360/390/1280 × 115–150% on Toolkit, Settings,
  Count back, Completed, Today, Patterns, Shore and Calendar: 0.
- Visual diff at default settings: none from the fix itself. Two full
  captures after the fix differ from the baseline only in the companion's
  greeting/line areas (timing noise, below) and in `toolkit-1280`, which is
  S-04.

### B-04 — Tasks board columns crushed with larger text
- Severity: High · Status: Found
- Where: Tasks on a wide window with larger text
- Reproduce: 1280px window, text 130–150%: four narrow columns, card text
  breaking letter by letter, the Check-in button over a card
- Audit before: task card titles split mid-word on the board at 1024 and
  1280px from 115% up ("Programming", "Chemistry", "Calculus"…)

### B-05 — The screen widens and content gets covered with larger appearance
- Severity: High · Status: Found
- Where: Toolkit (the Check-in button over the "Pink noise" card), any
  screen at large text
- Reproduce: text 130–150%, scroll Toolkit to the end
- Audit before (`covered-at-end`, 13 runs): in Settings → Companion at
  130–150%, the last items of the live preview stay under the Check-in
  button and the tab bar even scrolled to the end. The frame's width never
  grew with text size (`frame-width`: 0), so the "wider screen" the team saw
  is the horizontal stretch from B-03's squeezed words and iOS input zoom,
  still to confirm.

### B-06 — Smaller things visible in the team's screenshots
- Severity: Low · Status: Found
- Where: the "Check In" label's capitalization, the TopBar's "Menu" label
  crowding the title, a task card's chevron squeezed into a thin strip

## Sweep findings

### S-01 — Primary buttons and some links fail axe's contrast check
- Severity: to be confirmed · Status: Found
- Where: 262 runs; primary buttons (`data-variant="default"`) and the
  Today link to the lab report, across many screens
- Note: the v2 contrast tests on the theme tokens pass, so this needs a
  look at what axe actually measures (a ledge shadow, a dimmed backdrop)
  before deciding it's real

### S-02 — Hidden previews still hold focusable controls
- Severity: to be confirmed · Status: Found
- Where: every Settings section (53 runs, `aria-hidden-focus`); a card
  marked `aria-hidden` contains buttons a keyboard can still reach

### S-04 — The sounds timer control can stay stacked when its labels fit
- Severity: Low · Status: Found (needs a fix that re-measures once the
  layout settles)
- Where: Toolkit → Background sounds → "Until I stop / 15 / 30 / 60
  minutes", at 1280px and 100%
- What I saw: in both baseline captures the four options were stacked; in
  both captures after B-03 they sit side by side with every label fully
  visible, which is the control's intended look ("side by side until a
  label doesn't fit"). `segmented-control.tsx` stacks after a single
  measurement where a label overflows and only un-stacks if the track gets
  wider, so one passing layout during load is enough to latch it. I
  couldn't pin down which passing layout did it in the baseline (it isn't
  late web fonts: I tested with fonts delayed 1.5 s and it stayed side by
  side). This is the only default-settings diff after B-03 that isn't
  noise, so I'm recording it rather than calling it noise.

### S-03 — Calendar day buttons' names don't include their visible text
- Severity: to be confirmed · Status: Found
- Where: the month grid and the agenda list (28 runs,
  `label-content-name-mismatch`)

## On hold while v2.3 runs

The team's v2.3 spec arrived after B-03. Its four items replace B-01
(phones), B-02 (speech), B-04 (Tasks board) and the check-in-button part
of B-05; their fixes and tests are recorded in `docs/AI_DEV_LOG.md` under
v2.3. Still to do from v2.2 afterwards: B-05's other parts (the "wider
screen", bottom insets for other fixed bars), B-06, the AI task breakdown
(Section 5), and the area-by-area sweep with S-01 to S-04.

## Not fixed (would change the design) or needs a team decision

(None yet.)

## Audit summaries

**Before** (`docs/audits/2026-11-03-sweep-before.json`, run on the
`v2.1-baseline` build before any app change): 1,896 state runs (79 states ×
6 widths × 4 text sizes), axe at 390px (100% and 150%) and 1280px (100%).
1,386 failures:

| Check | Failures | Ledger |
|---|---|---|
| mid-word-break | 794 | B-03, B-04 |
| axe:color-contrast | 262 | S-01 |
| outside-frame | 212 | B-02 |
| axe:aria-hidden-focus | 53 | S-02 |
| axe:label-content-name-mismatch | 28 | S-03 |
| phone-input | 24 | B-01 |
| covered-at-end | 13 | B-05 |
| frame-width, over-sheet, sheet-cut, input-font-size, bubble-over-avoid, console, network | 0 | — |

How I got there honestly: the first "before" run reported 1,809 failures,
and about half were my new checks being wrong, not the app: cards inside a
sideways carousel counted as "outside the frame", a sheet's content
counted as covered before the sheet was scrolled down, a confirm dialog's
backdrop counted as painting over its sheet, and the AI routes' intended
503 (no key) and 429 (rate limit) answers counted as failed requests. The
mid-word check also had the opposite problem: following the spec's first
rule, it called "Toolki t" a warning, because the bug squeezes the box
narrower than the word. I fixed the checks and ran it again; the numbers
above are the second run. `input-font-size` found nothing: every field is
already 16px or more at 100%.

## Visual regression summary

The baseline was captured before any app code changed (158 screenshots:
79 screens and open states at 390 and 1280px, default settings, Date frozen
at Thu Nov 5, 3:40 pm, `Math.random` seeded), then captured again the same
way. 148 came out pixel-identical. These 10 moved on their own between two
identical runs, so a small diff there at the end is noise, not a change:

| Screenshot | Noise between two baseline runs | What moves |
|---|---|---|
| bubble_checkin-390 | 0.29% | the companion's line in the check-in, arriving a moment earlier or later |
| bubble_today-1280 | 0.05% | the greeting in Today's header, arriving a moment earlier or later |
| dialog_eventdelete-390 | 0.28% | the same greeting, behind the dialog |
| dialog_eventscope-1280 | 0.08% | the same greeting, behind the dialog |
| mini_ambience-1280 | 0.07% | the same greeting |
| sheet_eventedit-1280, -390 | 0.08%, 0.28% | the same greeting, behind the sheet |
| sheet_eventform-1280, -390 | 0.08%, 0.28% | the same greeting, behind the sheet |
| sheet_unstick2-390 | 0.02% | the sheet's Close button focus ring |

Later captures showed the same greeting timing on a few more shots (Today
and the mini player at 390, check-in steps 1, 2 and 4, the event sheets
and dialogs at both sizes), always inside the greeting's or the
companion line's box, plus a 9×10px speck on `wrap_step3-1280` (under
0.01%). I count a diff as noise only when it stays inside those boxes.

In one of those runs the greeting bubble sat on top of the TopBar's "Demo
data" badge and "Menu" label, and at 1280px it reached x = 910, past the
frame's right edge (about 855): both part of B-02.

Comparison at the end:

| State | Viewport | Diff % | Explained by |
|---|---|---|---|
