# Decisions

The technical and design decisions we'd defend, with why we made them and what we turned down. Dates are when the decision landed in the code.

**1. Local-first: everything lives in the browser (2026-10-28).**
Check-ins, tasks, patterns and settings live in IndexedDB through Dexie, with no accounts and no server copy. These are sensitive records, and keeping them on the student's device also means Tide works without a network. *Rejected:* a hosted database with sign-in, which would have made us responsible for that data and added a login to an app meant to lower friction.

**2. Every write goes through `src/lib/repo/*` (2026-10-28).**
Screens read with live queries and never write directly. The rules ("finishing a task adds a win", "a crisis check-in is saved without its words") live in one tested place. *Rejected:* writing from components, which would repeat those rules in many files.

**3. One clock (2026-10-28).**
`now()` in `src/lib/clock.ts` is the only code that reads the time, and a test fails if `Date.now(` appears anywhere else. That's what lets the demo land on the same Thursday afternoon on any laptop, and lets it run faster or stand still. *Rejected:* faking time only in tests.

**4. The code calculates; the AI only phrases (2026-10-29).**
Patterns, Day Mode budgets and rankings are computed by code. The AI writes sentences around them, and the server swaps any pattern card whose text has a number that isn't in its facts. *Rejected:* letting the model summarize raw history, which could invent statistics about someone's life.

**5. AI answers are validated on both sides, with one retry and a fallback (2026-10-28).**
zod and semantic checks run on the server and again in the browser; an invalid answer (including a made-up emotion word or a task left out of a plan) gets one retry with the reason, then a deterministic fallback. A refusal is a normal fallback too. *Rejected:* trusting the model's JSON, or showing an error when it fails.

**6. Short, structured AI calls (2026-10-28).**
No sampling settings (the current API rejects them), thinking off and low effort for the default models, because these are small JSON answers with an 8-second budget and thinking tokens could cut the JSON off. *Rejected:* raising the token limit, which adds latency.

**7. Safety runs before any AI call, by whole phrases (2026-10-28).**
A keyword check in English and Spanish runs in the browser before free text could reach a route. "This deadline is killing me" doesn't trigger the crisis screen; "kill myself" always does, even as a joke, because that false alarm is the safer mistake. *Rejected:* letting the model decide alone.

**8. No red, no guilt, no streaks (2026-10-28).**
We removed shadcn's red "destructive" style for a neutral one, and Tide has no streaks, points to lose or "you failed" anywhere; a test scans every line of copy for guilt phrases and emojis. A celebration fits the person's state: a quiet "That counted." on a low day. *Rejected:* gamified streaks, which punish exactly the bad days our users have.

**9. Accessible controls first (2026-10-29).**
The mood map is one focusable slider with arrow keys and spoken values, with two plain sliders as an alternative; the task board's drag and drop has a keyboard sensor and a "Move to…" menu; every target is at least 48 px. *Rejected:* a drag-only board and a pointer-only mood map.

**10. A first-load budget for Today (2026-10-29, kept through 2026-11-05).**
Today's first-load JavaScript stays under 300 KB gzipped. Sheets load when first opened, words for screens Today never shows live in their own copy files, and companion animation is CSS rather than framer-motion. *Rejected:* loading everything up front, which made the first visit slow on a student's phone.

**11. Our own particles, no confetti library (2026-10-29).**
An 80-line canvas system does confetti, sparkles and bubbles in the theme's colors and loads only with the big celebration. *Rejected:* canvas-confetti, one more dependency for one effect.

**12. Settings come from one catalog (2026-10-30).**
`src/lib/settings/catalog.ts` lists every section's controls as data; the pages, search, presets and export all read it, so they can't drift apart. *Rejected:* one hand-written file per settings page.

**13. The demo runs in its own database, chosen at load (2026-10-30, guarded 2026-11-04).**
The demo uses `tide-demo`; switching reloads the page, so no code path holds someone's own data while the tour runs. The seed refuses the main database by name, because the workspace flag is shared by every tab. *Rejected:* swapping data in place, as v1's demo mode did.

**14. Autoplay never goes to the network (2026-10-30).**
The guided tour uses saved answers for its scripted inputs, so it plays the same way every time and works with Wi-Fi off; presenter mode can still go live. *Rejected:* live AI in autoplay, which made rehearsals unpredictable.

**15. One z-index scale (2026-11-01).**
Every layer (sticky bars, tab bar, toasts, bubbles, menus, sheets, celebrations, the demo, the crisis screen) has one token in `globals.css`. *Rejected:* local z-index values, which put toasts over sheets and bubbles under them.

**16. Layouts change at 130% text (2026-11-01).**
A `big-text` variant from `html[data-text-size="large"]` stacks rows, unsticks tall panels and folds secondary controls, and an audit checks every screen at six widths and four text sizes. *Rejected:* only scaling fonts, which broke words letter by letter at 150%.

**17. Everything stays inside the phone frame (2026-11-03).**
One frame width on every route; companion bubbles, Tasks and the calendar live inside it, and a bubble that would cover a timer, a field or a main button moves to a caption bar instead. *Rejected:* wide desktop layouts for some screens, which let text float outside the frame.

**18. A smart check-in button (2026-11-04).**
By default the floating button shows only where checking in makes sense, steps aside for sheets and typing, hides while scrolling and shrinks at big text; "in the tab bar" and "hidden" are one setting away, and a long press opens a two-tap Quick check-in. *Rejected:* removing it, since checking in is the first step of everything in Tide.

**19. Phone numbers take digits only, with a separate country code (2026-11-04).**
Letters are dropped as you type, the country decides the rule and a preview shows what will be dialed; old contacts are kept and flagged if unreadable. *Rejected:* free text, which let a "call mom" contact dial nothing.

**20. The demo seed is one atomic, single-flight transaction (2026-11-04).**
It builds every row first, writes them with `bulkPut` and its version marker last, in one transaction, one caller at a time. Two overlapping seeds (React Strict Mode, two tabs) used to collide on the closed days. *Rejected:* clearing settings on every seed, which would reset the presenter's text size and voice.

**21. The tour is a state machine, and only a person resumes it (2026-11-04).**
Each step runs with an abort signal and keeps its progress, so pause stops everything at once (typing, holds, the voice, the demo clock) and play continues without repeating a tap. Sheets no longer treat a press on the tour bar as "outside". *Rejected:* a pause flag checked between steps, which let the tour carry on by itself.

**22. Narration reads every caption after one tap (2026-11-04).**
A narrator queue on the voice engine reads each caption to the end, with fixes for the browser's speech quirks; with narration on, the tour waits for Play, because browsers won't speak before a tap on the page. *Rejected:* speaking unprompted after the page reload, which failed silently.

**23. Captions get their reading time, from a settled screen (2026-11-05).**
Each caption stays up for at least 1.8 s plus 55 ms a character (2.5 to 9 s), counted after the screen stops moving; the theme step shows black, white and color, one second each. *Rejected:* fixed short holds, which made steps fly by at 2×.
