# TIDE v2.2 — "Bug Sweep" — Master Prompt for Claude Code

> **Cómo usar este archivo (para el equipo, en español)**
>
> Este documento le pide a Claude Code **revisar toda la app y arreglar bugs sin cambiar nada más**: ni el diseño, ni los textos, ni el orden de las pantallas, ni las funciones.
>
> **Bugs que reportó el equipo:**
> 1. Los campos de número de teléfono aceptan letras.
> 2. Los textos de los compañeros (burbujas) se salen del área del celular, tapan el timer y el compañero se dibuja encima de la hoja de "Close" en Focus.
> 3. Con la apariencia ampliada (texto grande), las palabras se parten letra por letra ("Toolki t", "Rea d VSS S docu me nt") y la pantalla se ensancha.
> 4. En Tasks, con texto grande, las cuatro columnas quedan aplastadas.
> 5. El botón "Check in" tapa contenido.
>
> **La única función nueva:** la IA para desglosar tareas en pasos, porque el equipo la pidió. Todo lo demás es solo revisar y arreglar.
>
> **Cómo protege lo que ya funciona:**
> - Antes de tocar nada, toma capturas de referencia de todas las pantallas a tamaño normal.
> - Al final las compara píxel por píxel. Cualquier diferencia que no corresponda a un bug registrado se revierte.
> - Corre todas las pruebas de v1, v2 y v2.1, el recorrido Demo y el pitch.
> - El dictado sigue congelado.
>
> **Pasos:**
> 1. Guarden este archivo como `docs/TIDE_V2_2_BUG_SWEEP_PROMPT.md`.
> 2. Abran Claude Code en el repo y peguen el mensaje del Apéndice E.
> 3. Claude trabaja solo y hace commit después de cada arreglo. Los bugs reportados por ustedes van primero.
> 4. Al final, `docs/BUG_SWEEP.md` lista cada bug encontrado: dónde estaba, por qué pasaba, cómo se arregló y cómo se verificó.
>
> **Fecha:** hoy es martes 3 de noviembre en la noche y la entrega es el jueves 5 a las 11:59 p.m. Si el tiempo apremia, lo reportado por ustedes ya estará arreglado y guardado primero.

---

## 0. Mission (for Claude Code)

Tide (v1 + v2 + v2.1) is feature-complete. The team showed it to their Challenge Partner and found a set of bugs, shown in screenshots and described in Section 4. Your mission has two parts:

1. **Fix the reported bugs at their root cause** (Section 4), and build the one feature the team explicitly asked for: an AI task breakdown (Section 5).
2. **Sweep the whole app for any other bugs and fix them** (Sections 6–7), **without changing anything that isn't broken.**

This is a repair job, not a redesign. The person using Tide tomorrow must see the same app, with the same look, words, screens, flows, settings and behavior, except that broken things now work. The judges review the code on November 7–9 and see the live demo on November 7. Stability is everything.

Today is Tuesday, November 3, 2026 (evening). The code is due Thursday, November 5, at 11:59 p.m.

Work **autonomously** in the order of Section 10, without asking the team to confirm. Use the bug cycle in Section 2. Stop only for the true blockers in Section 2.6.

Read this whole document first. Then read `CLAUDE.md`, the end of `docs/AI_DEV_LOG.md`, `docs/CODE_WALKTHROUGH.md`, `docs/DECISIONS.md`, `docs/V1_INVENTORY.md` and the three earlier specs (`docs/TIDE_BUILD_PROMPT.md`, `docs/TIDE_V2_UPGRADE_PROMPT.md`, `docs/TIDE_V2_1_FIXES_PROMPT.md`). Skim the specs, and read the sections that describe whatever you're about to touch. The code is the source of truth for what exists; the specs tell you what was intended.

---

## 1. The no-change contract

### 1.1 What counts as a bug

Something is a bug if **any** of these is true:

- It doesn't do what the specs (or the obvious intent of the UI) say it should.
- It crashes, throws, logs an error or warning in the console, or leaves the app in a broken state.
- It loses, corrupts or wrongly displays data.
- Text is clipped, covered, overlapping, broken in the middle of a word, or outside the app frame or the screen.
- The page scrolls sideways, or content is unreachable.
- It's inaccessible: not keyboard operable, missing a label, failing contrast, trapping focus, missing announcements, or breaking at larger text sizes.
- An input accepts values it can't use (letters in a phone number, an end time before a start time) or rejects valid values.
- Behavior differs between devices or browsers in a way that breaks the experience (iOS Safari, Android Chrome, desktop Chrome, Edge, Firefox).
- It's noticeably slow or janky, or it leaks timers, listeners or audio nodes.
- It breaks a rule from the specs' non-negotiables (privacy, safety, no guilt, crisis screen rules).

### 1.2 What you may change

- The **minimum code** needed to make the broken thing work as intended.
- **CSS and layout** that restore the intended design under conditions where it broke (large text, narrow widths, inside the desktop frame, dark themes and so on). At default settings (text scale 1, default theme, standard widths), the result must look **identical** to before, unless the bug was visible at default settings too.
- **Accessibility fixes** that don't change the look: labels, roles, ARIA attributes, focus handling, announcements, keyboard handlers. Contrast fixes are allowed only for tokens that fail WCAG AA, and they must be logged.
- **Input validation and sanitizing,** where values are invalid.
- **Error handling and fallbacks** where something throws or hangs.
- **Performance and cleanup fixes,** with no visible change.
- **Tests,** the audit tooling, and the docs and logs.
- **The one new feature in Section 5** (AI task breakdown), exactly as specified.

### 1.3 What you must not change

- Visual design at default settings: colors, fonts, sizes, spacing, radius, shadows, icons, illustrations, companion art, animations and their timings.
- Copy: any user-facing text. The only exceptions are: (a) typos; (b) text that is factually wrong about what the app does; (c) the new strings needed for validation messages and the Section 5 feature. Log every copy change.
- Screen structure, navigation, the order of elements, routes, tab bar, menus.
- Features: don't remove, merge, rename, add (except Section 5) or "improve" them.
- Defaults of settings, presets, looks, themes.
- Data shapes and meanings. Additive optional fields are allowed only where a fix needs them, plus the subtasks field in Section 5.
- AI prompts (except the new breakdown prompt), the pattern engine rules and thresholds, seed data and planted patterns, demo scripts and captions. Only fix them if they are broken, and then minimally.
- The dictation code (frozen; the freeze test must pass).
- The crisis and support screens' behavior and content (fix only real bugs, and keep their rules: no companion, no sounds, no celebrations).

### 1.4 When a fix seems to require a change

If the only way to fix a bug is a visible change at default settings (for example, an element simply can't fit), choose the **smallest** change that keeps the design intent. Log it in `docs/BUG_SWEEP.md` with before and after screenshots (if a browser is available), and in `docs/DECISIONS.md`, with the reason. Never use "while I'm here" improvements.

### 1.5 The judgment test

Before each change, ask: "If a team member compares the app before and after at normal settings, would they notice anything other than the bug being gone?" If yes, and it isn't required by the bug or by Section 5, don't do it.

---

## 2. Working protocol

### 2.1 The bug cycle (repeat for every bug)

1. **Record** it in `docs/BUG_SWEEP.md` with an id (`B-01`, `B-02`, … for reported bugs; `S-01`, `S-02`, … for bugs you find in the sweep). Include the title, where it happens, how to reproduce it (route, viewport, settings, steps, data), its severity (Critical / High / Medium / Low) and its status (Found).
2. **Reproduce** it with a failing test, the audit, or a browser tool. If you can't reproduce a reported bug, test every variant listed in its section before concluding anything, and write down what you tried.
3. **Root cause** in one or two plain sentences.
4. **Fix** with the minimum change, and leave a short natural comment at the fix site explaining what used to go wrong.
5. **Verify:**
   - lint, typecheck, all tests (`npm run test`, `npm run test:v1`, the v2 and v2.1 suites, the dictation freeze test, the demo reference test, the seed test), and the build;
   - the audit for the affected routes;
   - the new test that reproduces the bug, which now passes;
   - the visual baseline check for affected routes at default settings (Section 3.3).
6. **Ledger:** update the bug's entry with the root cause, fix, files, test and status (Fixed).
7. **Commit** per bug (or per small group of bugs with the same root cause): `fix(<scope>): <summary>`, with a short natural body that names the bug id, and the `AI-Generated: Claude Code` trailer.
8. **Continue.**

### 2.2 Severity and order

- Fix the reported bugs (Section 4) first, in order.
- Then the Section 5 feature.
- Then sweep findings by severity: Critical → High → Medium → Low.
- Low-severity cosmetic findings that would require visible changes at default settings are **recorded, not fixed**, unless the fix is invisible at default settings.

### 2.3 Comments and logs (same voice as always)

- Comments explain **why**, naturally, like a thoughtful teammate. No boilerplate, no emojis.
- At every fix site, a 1–3 line comment says what used to break. For example:

```css
/* We used `overflow-wrap: anywhere` here, which also lets the browser shrink
   the column to a single letter's width. With big text that turned
   "Toolkit" into "Toolki t". `break-word` only splits a word when it truly
   can't fit on a line by itself. */
```

```ts
// Phone fields used to accept any text, so a contact like "call mom" made
// the Call button dial nothing. We keep only characters a phone can dial.
```

- `docs/AI_DEV_LOG.md`: a "Before v2.2 sweep" entry, then short entries per batch of fixes, then a closing "Where Tide stands after the sweep" entry. First person, honest that the code is AI-generated.
- `docs/progress/2026-11-03.md` and `2026-11-04.md` (and `2026-11-05.md` if needed): progress report drafts in the team's voice.

### 2.4 Branch and merge

- Tag the current state `v2.1-baseline` (or `v2.1-baseline-2` if the tag exists).
- Work on the branch `v2.2-bug-sweep`.
- Merge into `main` at the end only if every suite is green and the visual check passes. Tag `v2.2.0`, and push if a remote is configured and pushing works without prompts.

### 2.5 Timebox

The whole sweep should fit into roughly one long working session. If you're running out of context or time:

- finish and commit the current bug;
- write the ledger and the log;
- make sure `main` (or the branch) is green;
- note what's left in `docs/TEAM_TODO.md`.

Never leave a half-applied fix uncommitted.

### 2.6 When you may stop

Only if the environment can't install or run Node; a change would delete or overwrite work the team made by hand; or a fix truly requires a product decision that changes behavior (log it as "Needs team decision" in the ledger and move on, rather than stopping the whole run). Missing devices or browser tools are not blockers: use tests and the audit, and put manual checks in `docs/TEAM_TODO.md`.

---

## 3. Safety net

### 3.1 Baseline

1. Run `git status`. If there are uncommitted team changes, commit them as `chore: save team changes before v2.2 sweep`.
2. Run every suite and the build. Record the counts and results in the log.
3. Fix anything red first: that's bug `S-00`, and you need a green baseline.
4. Tag `v2.1-baseline` and create the branch `v2.2-bug-sweep`.

### 3.2 Feature inventory walk

Before changing code, write `docs/FEATURE_INVENTORY.md`: a checklist of every user-visible feature and flow, grouped by screen. Build it from the specs, `docs/V1_INVENTORY.md` and the code. Include the onboarding steps, check-in paths, tasks, unstick, focus (alerts, nudges, sounds), Today cards, Day Mode, bridge, toolkit tools, patterns, shore (items, bottles, collection, time of day, image export), wrap-up steps, calendar, settings sections and presets, looks, Companion Studio, demo modes, support and crisis, shortcuts, offline, install and export/import.

You will tick this inventory again at the end (Phase S6) to prove nothing disappeared or stopped working. For each item, record **how** it's verified: an existing test, a new test, the demo tour, or a manual step for the team.

### 3.3 Visual baseline (proves "nothing else changed")

If Playwright and Chromium can run here, capture **baseline screenshots before any fix**.

**Script:** `scripts/visual-baseline.ts`.

**Settings for the baseline:**
- demo workspace, seeded;
- demo clock fixed at Thu Nov 5, 2026, 3:40 pm;
- motion `off` (so frames are stable);
- sound off;
- text scale 1;
- the default font and theme for new users (Lagoon, Playful font);
- companion Lolo, as seeded.

**Viewports:** 390×844 and 1280×800.

**States to capture:**
- **Routes:** Today, Tasks, Toolkit, Patterns, Shore, Shore collection, Calendar month, a calendar day, Companion Studio, Settings index, every settings section, Support, the Demo launcher, the Completed archive.
- **Open states:**
  - Check-in steps 1–4 and the body path;
  - Unstick steps 1–2;
  - Day Mode proposal;
  - Bridge sheet (with the clock set to 4:41 pm);
  - Focus page running (clock frozen);
  - the Focus outcome sheet;
  - Box breathing (first frame);
  - wrap-up steps 1, 3, 8, 11;
  - onboarding steps 1, 3, 7 (in a fresh, non-demo, empty workspace);
  - the TaskForm;
  - the EventForm;
  - the delete dialog;
  - the ambience panel.

Save the screenshots to `e2e/__visual__/baseline/` (git-ignored if they're large; keep a manifest JSON with the hashes committed).

After all fixes (Phase S6), capture the same set into `e2e/__visual__/after/` and compare with `pixelmatch` (ISC) and `pngjs` (MIT) at threshold 0.1:

- **Allowed diffs:** only on states where a ledgered bug was visible at default settings, or where the Section 5 feature adds its intended UI (task cards with subtasks, the breakdown entry points). For each allowed diff, the ledger entry names the screenshot.
- **Any other diff is a regression:** find the cause and revert or fix it.

Write a summary (state, diff %, allowed by which bug) into `docs/BUG_SWEEP.md`.

If Playwright can't run, do the same review with a browser tool if available. Otherwise, write the visual check as a manual list for the team in `docs/TEAM_TODO.md`, and be extra conservative with CSS changes, scoping them to the conditions that break (large text, container size) wherever possible.

### 3.4 Suites that must stay green after every fix

All tests (v1, v2, v2.1 suites), the dictation freeze test, the demo reference test, the seed test (planted keys unchanged), the build, and (if available) the e2e demo, pitch, v1-pitch and layout-audit specs.

---

## 4. Reported bugs (fix these first, in order)

The team sent screenshots. Here is what they show, the likely causes and the required fixes. Investigate before fixing: the likely causes are hypotheses, not facts.

### B-01: Phone number fields accept letters (High)

**What the team saw:** "Los números de teléfono admiten letras": the phone fields accept letters.

**Where to look:**
- trusted contacts (onboarding step 12 and Settings → People & support);
- campus support phone;
- anything else with a phone-like field (search for `phone`, `tel`, `trustedContacts`, `campusSupport`, `method`, `value`).

**Required behavior:**

1. **Know when a field is a phone.**
   - Trusted contacts have a `method`. If the method is a phone method (call, text/SMS, WhatsApp, or whatever the code calls them), the value is a phone number.
   - If the method allows a handle or other contact type, letters remain allowed there. Don't break that.
   - The campus support `phone` field is always a phone.
2. **Input attributes:** `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`, and a font-size of at least 16px (iOS zooms the page when focusing inputs under 16px, which looks like "the screen enlarges"; check every input in the app for this, Section 6.4).
3. **Sanitize as the person types:**
   - Keep only digits, spaces, `+`, `-`, `(`, `)` and `.`. A `+` is allowed only as the first character.
   - Remove other characters immediately, and show a short polite hint under the field the first time it happens: "Phone numbers can only use numbers, spaces, + - ( )."
   - Handle paste the same way (strip, don't reject).
   - Keep the caret position sensible after stripping.
4. **Validate on blur and on save:** 7–15 digits (ignoring formatting).
   - Error text, neutral and next to the field: "That doesn't look like a full phone number yet. Example: +52 81 1234 5678."
   - The error is linked with `aria-describedby` and announced politely. The field gets `aria-invalid="true"`.
   - Save is blocked only for that field (other fields keep their values).
5. **Existing saved data:** don't delete or rewrite anything automatically. If a saved phone-type value contains letters or fails validation:
   - show it as is, with a small notice on that contact: "This number may not work. Edit it?";
   - the Call/Text buttons are disabled for it, with the explanation as their description.
6. **`tel:` and `sms:` links** use the digits-only form (keeping a leading `+`) everywhere they're built, including the crisis screen's contacts section and the Support page.
7. **Crisis resource numbers** are constants. Don't change them; only make sure their links are built the same safe way.

**Tests:**
- unit tests for `sanitizePhone`, `isValidPhone` and `toDialable`;
- component tests: typing letters is stripped and the hint appears; paste is stripped; blur validation; save blocked; a handle method still accepts letters; old invalid data shows the notice and disabled buttons.

**Acceptance:** no phone field can hold letters anymore, existing data is respected, and the call/text links always dial valid numbers.

### B-02: Companion speech bubbles leave the phone area, cover the timer, and the companion is drawn over sheets (High)

**What the team saw:**
- "Los textos de los avatars se salen del área del celular": the companions' texts go outside the phone area.
- A Focus page screenshot. The timer reads "4:52". The bubble "Okay! Let's make the step tinier." sits over the timer circle. The companion (with glasses) is drawn on top of the bottom sheet's border, and that sheet's "Close" button is cut off at the bottom.

**Context:** v2.1 portaled bubbles to an overlay root and positioned them with Floating UI, using the **viewport** as the boundary. On desktop, Tide renders inside a centered phone-sized frame (`PhoneFrame`, max-width about 430px). The viewport is much wider than the frame, so bubbles can extend outside the frame. On mobile the frame is the viewport, so the bug mainly shows on desktop (that's what judges use).

**Required fixes:**

1. **Frame boundary.** Every floating element that belongs to the app must stay inside the app frame's rectangle, not just the viewport. This includes companion bubbles, coach marks, tooltips, item popovers, menus and toasts.
   - Mark the frame element with `data-app-frame`.
   - Pass it as `boundary` to `flip`, `shift` and `size`, and pass `rootBoundary: 'viewport'` as well, so the effective boundary is the intersection of the two. Use `padding: 12`.
   - The `size` middleware caps `maxWidth` at the available width inside the frame.
   - Exception: the demo HUD, which is designed to span the viewport.
2. **Portal inside the frame.** The `#tide-overlays` root must be **inside** the app frame (positioned so it covers the frame and nothing else), so overlays inherit the frame's stacking context and never paint outside it. Sheets' own overlay roots stay as they are.
3. **Don't cover important content.**
   - Add `data-bubble-avoid` to elements that must never be covered: the focus timer digits and circle, the Box breathing square, the bridge countdown, the check-in text field and candidate cards, the mood map, primary action buttons, and the bottom sheet when one is open.
   - Write a small custom Floating UI middleware, `avoidElements`. After the normal placement, if the bubble's rectangle intersects any visible `[data-bubble-avoid]` element in the same overlay root, it tries the other placements (top, bottom, left, right, and their -start/-end variants).
   - If every placement collides, it falls back to the **inline speech slot**.
4. **Inline speech slot on fixed-layout screens.**
   - On screens whose layout is tight by design (the Focus page, Box breathing, the Bridge sheet, wrap-up steps), the companion's line is shown in a reserved **inline slot** next to or under the companion, inside the normal layout flow, with a reserved `min-height`.
   - These screens use the slot by default; floating is only for free placements (Today header, Shore, Companion Studio, empty states, TopBar head).
   - The slot reuses the bubble's visual style (same colors, radius, tail pointing at the companion), so the look stays the same. Only the position is guaranteed not to overlap.
5. **Sheets cover page companions.** When any sheet or dialog opens:
   - **Dismiss** any page-level bubble immediately.
   - Make sure the page's companion is **below** the sheet. The screenshot shows it painting over the sheet's edge, which means the companion (or a wrapper with a transform or z-index) sits in a higher stacking layer than the sheet, or the sheet isn't using `--z-sheet`. Check the companion's wrappers for `z-index`, `position: fixed/sticky`, `transform` and `isolation`, and map them to the scale (page content is `--z-base`; the companion is never above `--z-fab`).
   - The sheet's backdrop must cover the full frame.
6. **The Focus outcome sheet ("didn't start" path):**
   - its content must be fully visible: the "Close" button can't be cut off;
   - apply the sheet rules from v2.1 F-02: `max-height: 92dvh` (within the frame), internal scrolling, a sticky footer inside the sheet, and bottom padding equal to the footer's height;
   - on desktop, the sheet's height is limited by the frame's height, not the viewport's;
   - the timer behind it is covered by the backdrop as intended.
7. **Text never leaves the frame at any text size.** Test at text scales 1, 1.15, 1.3 and 1.5, at frame widths of 320 (mobile) and the desktop frame, with the longest lines (Shelby's longest Gentle line and the Literal mode lines).

**Tests:**
- Component: with a frame element of width 390 inside a 1280 viewport, a bubble anchored near the frame's right edge stays inside the frame (assert the computed position via Floating UI's `computePosition` with mocked rects).
- Component: an `avoidElements` collision on every side triggers the inline slot fallback.
- Component: opening a sheet dismisses page bubbles.
- Audit (upgraded in Section 6.1): a frame-boundary check and the bubble coverage check in every placement, at every width and text scale.

**Acceptance:** no companion text ever extends beyond the app frame or the screen; it never covers the timer, breathing square, inputs or primary buttons; the companion never paints over a sheet; the Focus outcome sheet is fully visible.

### B-03: Words break in the middle, letter by letter, with larger appearance (Critical)

**What the team saw:**
- In Toolkit, the TopBar title shows "Toolki t", and the bottom tab label shows "Patter ns".
- In Tasks, a card in the In progress column shows its title as "Rea / d / VSS / S / docu / me / nt", one fragment per line.

**Likely root cause (confirm it):**
- v2.1 applied `overflow-wrap: anywhere` (or `word-break: break-all` or `break-word` in Tailwind's `break-all`) broadly.
- `anywhere` changes how the browser computes an element's **minimum content width**: it allows a line break between any two letters. So in a flex or grid layout where items can shrink (`min-width: 0`, `minmax(0, 1fr)`), columns and titles shrink to almost one letter wide and then wrap letter by letter.
- Large text makes it far more visible, because there's less space.

**Required fixes:**

1. **Global text rule:** use `overflow-wrap: break-word` (in Tailwind, `break-words`), not `anywhere` and never `break-all`, for user-facing text. `break-word` only breaks a word that can't fit on a line by itself, and it **doesn't** reduce the minimum content width. Search the code and CSS for `anywhere`, `break-all`, `word-break` and `hyphens`, and fix every user-facing occurrence. Keep `anywhere` only inside the speech bubble text **if** the bubble has a fixed `min-width` (from v2.1; verify it doesn't recreate the problem). Better: use `break-word` there too.
2. **Hyphenation:** `hyphens: auto` is fine for long paragraphs in English, but not for titles, labels or buttons. Remove it from those.
3. **Titles and labels never split a normal word.**
   - The TopBar title: `overflow-wrap: break-word; word-break: normal; hyphens: manual`. If the title doesn't fit at large text, it may wrap at spaces (allowed), and its font size scales down a step with `clamp()`, but never below the H3 size.
   - If a single long word still can't fit (very narrow frames at 1.5), the TopBar's secondary items (the companion head, the "Menu" text label) yield space first. At text scale ≥ 1.3, the menu button shows its icon only, with its accessible name "Menu"; the visible label returns at smaller scales. That's a layout fix at large text only; nothing changes at 1×.
4. **Tab bar labels:** never split mid-word.
   - At large text, labels may wrap at spaces (none of the five labels has spaces, so in practice they stay on one line) and shrink via `clamp(11px, …, 14px)` multiplied by a damped text scale (`min(var(--text-scale), 1.2)`), so "Patterns" always fits in a fifth of a 320px frame.
   - This is the one place where text grows less than the scale. Note it in `docs/DECISIONS.md` as an accessibility trade-off, aligned with how native tab bars behave.
   - If a label still can't fit, show the icon with its label in a tooltip and accessible name. **Never** a broken word.
5. **Minimum widths for columns and cards:** grid and flex items that contain text get a sensible `min-width` in `em` (for example, task columns `min-width: 14em` in the column layout), so they can't collapse.
6. **Add the mid-word break detector** to the audit (Section 6.1) and run it on every route and state at every text scale. Zero failures.

**Tests:**
- The audit's mid-word detector at text scales 1.3 and 1.5 on Toolkit, Tasks (all layouts), the Tab bar, Settings, Today, Patterns, Shore and Calendar.
- A static test that fails if `overflow-wrap: anywhere`, `break-all` or the Tailwind `break-all` class appears in `src/` outside an allowlist.

**Acceptance:** no normal word is ever split across lines anywhere in the app, at any text size, width or font.

### B-04: Tasks board columns are crushed with larger text (High)

**What the team saw:** a wide window, but a narrow app area, at larger text. The board shows four columns (Not started, In progress, Stuck, Done) side by side, each far too narrow, so card text breaks letter by letter (partly B-03) and the "Check in" button covers the card.

**Likely cause:** the board switches to the four-column layout with a **viewport** media query (for example ≥ 1024px), but the available width is the board's **container** (the app frame, or the expanded desktop area). With large text, four columns no longer fit, even on a wide screen.

**Required fixes:**

1. Choose the board layout by **container width in em**, with container queries, not by viewport:
   - **four columns** when the board container is at least 60em wide;
   - **two by two** when it's at least 30em;
   - otherwise, the **single-column segmented view** (the mobile layout that already exists).
   - Because `em` grows with text scale, larger text automatically moves to fewer columns.
   - At default settings, the layouts at the standard widths (390, 1280) must be the same as today. Verify this with the visual baseline. If today's 1280 layout is four columns at 1×, the 60em threshold must keep it four columns at 1× (adjust the threshold to match the current behavior exactly, and document the number).
2. If the desktop board area is wider than the phone frame by design (v1 allowed the board up to 1100px on desktop), keep that, and simply apply the container rule inside it.
3. Card titles wrap at spaces (B-03 rule), clamp to 3 lines in columns (with full text in the detail sheet), and never break mid-word.
4. Column headers ("In progress (1)") wrap at spaces if needed; counts never detach onto their own line (`white-space: nowrap` only on the "(1)" span).
5. The "Stuck is information, not failure." subtitle wraps normally.
6. Drag-and-drop still works in every layout. The "Move to…" menu remains the accessible path.

**Tests:**
- Component: given container widths (mock the container size or test the CSS class switch via a `ResizeObserver` fallback), the right layout renders.
- Audit: Tasks at all widths × text scales, with zero mid-word breaks, overlaps or clips.
- Visual baseline: Tasks at 390 and 1280 at 1× is unchanged.

**Acceptance:** the board always picks a layout that fits its content; no crushed columns.

### B-05: The screen widens and content gets covered with larger appearance (High)

**What the team saw:**
- "Se amplía la pantalla con appearance ampliada": with larger appearance settings, the screen gets bigger or wider.
- In Toolkit, the floating "Check in" button covers the "Pink noise" card text.

**Investigate all of these (it may be several bugs):**

1. **Horizontal overflow:** with text scale 1.3 or 1.5, some element is wider than the frame or viewport, so the page scrolls sideways or the frame stretches. Find every overflowing element with the audit's page-overflow and element-overflow checks. Typical sources:
   - long words (B-03);
   - fixed-width elements in `px`;
   - `min-width` larger than the frame;
   - horizontal carousels without `overflow-x: auto` inside their own container;
   - negative margins;
   - `100vw` used inside the frame (it includes the scrollbar and ignores the frame);
   - absolute elements positioned beyond the edge.
   - Fix each one. The frame itself must never grow beyond its max-width because of content: set `overflow-x: clip` on the frame **only after** fixing the real overflow sources, as a last safety net, and log it.
2. **The PhoneFrame width:** the frame's `max-width` must stay in `px` (it represents a phone's width), not in `em` or `rem`. If it was written in `rem`, then text scale (applied to the root font size) makes the whole frame wider: that's exactly "the screen widens". Check this first. If v2.1 changed it, restore the `px` value.
3. **iOS input zoom:** iOS Safari zooms the whole page when an input with a font-size below 16px gets focus, and the page stays zoomed. Make sure every `input`, `textarea` and `select` has a computed font-size ≥ 16px at every text scale (it only grows with scale, so check the 1× size). Don't use `maximum-scale=1` in the viewport meta: it blocks user zoom, which is an accessibility failure.
4. **The FAB covering content:**
   - The floating Check-in button may overlap content while scrolling. That's normal for a floating button, but the content's **end** must be reachable above it, and at large text the FAB's label pill is wide enough to hide whole lines.
   - The scroll container's bottom padding must equal the tab bar height + the FAB's protrusion + 16px (use the measured `--tabbar-h` and `--fab-h` variables).
   - At text scale ≥ 1.3, the FAB becomes its compact form: the round button only, the "Check in" label hidden visually but kept as its accessible name, plus a tooltip on hover or focus. That's a large-text-only fix; nothing changes at 1×. If v2.1 moved the label into a pill above the tab bar at large text, that pill is what's covering content, so replace it with the compact form.
   - Mark the FAB `data-overlay="fab"` so the audit can run the scroll-to-end coverage check (Section 6.1).
5. **Other fixed bottom elements** (the ambience mini player, the trying-a-look bar, the bridge banner, toasts): the same reachability rule. Content's end is reachable above all of them. When several stack, their heights add up into the bottom padding (a small `useBottomInsets()` hook that sums the measured heights of the visible fixed bottom elements and writes `--bottom-insets`).

**Tests:**
- Audit: page-overflow, frame-overflow, scroll-to-end coverage and input font-size checks, on every route and state at all text scales and widths.
- Unit: `useBottomInsets` sums correctly as elements appear and disappear.

**Acceptance:** larger appearance never makes the page or frame wider, never zooms the page on input focus, and never makes content unreachable behind floating controls.

### B-06: Anything else visible in the screenshots

Look again at both screenshots for smaller issues and fix them if they're bugs:

- The pink frame background on desktop looks right.
- The "Check In" label's capitalization is inconsistent with "Check in" elsewhere. Check the copy key: if two different strings exist for the same action, use the existing catalog string consistently. That's a copy bug, so log it.
- The TopBar's "Menu" label crowds the title.
- The "Rea d VSSS document" card's "›" chevron sits in a narrow strip.

Ledger whatever you fix.

---
## 5. The one requested feature: AI task breakdown

### 5.1 What the team asked for

"Desglosar tareas, ¿se puede que agregue una IA dentro?": break tasks down, can it use AI inside? Today, "Break it down for me" in the TaskForm opens Unstick with the reason "It feels too big", which gives **one** first step. The team wants the AI to break a task into a short list of concrete steps.

Build it as a **contained addition** that reuses existing patterns: an AI route with zod schemas, a fallback, a safety pre-check, cached demo responses and natural copy. Don't change any other flow.

### 5.2 Where it appears

1. **TaskForm:** the existing "Break it down for me" checkbox. After saving the task, open the **Breakdown sheet** instead of Unstick. This is the one intentional behavior change; log it.
2. **Task detail sheet:** a new "Break into steps" button. If steps already exist, it reads "Edit steps".
3. **Unstick, step 1:** when the person picks "It feels too big", the result screen shows the usual first step **plus** a secondary button: "Break the whole task into steps". It opens the Breakdown sheet. Unstick's existing behavior is otherwise unchanged.
4. **Task card "⋯" menu:** "Break into steps".

### 5.3 Breakdown sheet

- **Header:** "Break it into steps" and the task title.
- **Loading:** the companion `thinking`, with "Breaking it into small steps…". Skeleton rows.
- **Result:** an editable list of 3–7 steps. Each row has:
  - a drag handle (with keyboard alternatives "Move up" and "Move down" in a row menu);
  - an editable text field (1–80 characters);
  - an optional time badge ("~5 min"), editable with a small select (2, 5, 10, 15, 25 minutes, or none);
  - a remove button ("Remove step", with an aria-label that includes the step text).
- **Below the list:**
  - "Add a step" (adds an empty row with focus);
  - "Try again" (calls the AI again, passing the current steps so it proposes a different breakdown; a maximum of 5 regenerations per task per day, after which the button explains "That's plenty of tries. Edit the steps by hand.");
  - a small note: "Suggestions, not rules. Change anything."
- **Footer:**
  - "Save steps" (primary). It stores the steps on the task as `subtasks`, sets the task's `firstStep` to the first unfinished step's text, and closes.
  - "Cancel" (it follows the F-08 confirmation rules from v2.1).
- **Read-aloud** reads the list.
- **Literal mode** affects the AI wording (via `mode`) and the static copy.
- **Large text:** rows wrap, the time badge drops under the text, and the remove button stays visible.

### 5.4 Using the steps

- **Task card:** when a task has subtasks, it shows a small progress line under the title: "2 of 5 steps" with a thin progress bar (using existing tokens and the ProgressBar component in a compact size). Nothing else on the card changes.
- **Task detail sheet:** a checklist of steps. Checking a step:
  - marks it done (strikethrough + check animation using the existing checkbox micro-interaction);
  - triggers a **micro** celebration (the existing `taskStarted`-tier style, not a new event);
  - updates `firstStep` to the next unfinished step.
  - When all steps are checked, a gentle prompt: "All steps done. Mark the task as done?" with "Mark done" and "Not yet". Never automatic.
  - Steps can be unchecked.
- **Focus page:** if the task has unfinished steps, the "first step" card shows the next unfinished step (this replaces nothing; it's the same `firstStep` field, kept in sync). A small "Next step ✓" button checks the current step and shows the next one, without leaving focus.
- **Unstick:** if the task has unfinished steps and the person picks a reason, the AI unstick call still runs as before. The result additionally shows "Your next saved step: {step}" as an alternative.
- **Wrap-up "Tomorrow"** and the **morning card:** if the anchor task has steps, the first step shown is the next unfinished step (the same `firstStep` sync).
- **Patterns, shore, wins:** no changes. Checking steps creates no wins and no shore items, to avoid noise. Only finishing the task does, as today.

### 5.5 Data

Add the optional field `subtasks?: Array<{ id: string; text: string; done: boolean; minutes?: 2|5|10|15|25; doneAt?: number }>` to `Task`. It isn't indexed, so it needs no Dexie schema version: confirm that with the installed Dexie documentation; non-indexed properties don't need a schema change. Repo functions:

- `setSubtasks(taskId, subtasks)`
- `toggleSubtask(taskId, subtaskId)`
- `nextSubtask(task)`
- `syncFirstStep(task)`

Export and import include `subtasks` (lenient: older backups simply don't have them). Deleting a task (v2.1 F-03) removes its subtasks with it, since they live on the task.

### 5.6 AI route `/api/ai/breakdown`

Same structure as the other routes: rate limit → zod input → `callJson` → zod output → semantic checks → envelope. Use the FAST model, `max_tokens` 500, the normal timeout.

```ts
export const BreakdownInput = z.object({
  mode: ModeZ,
  readingLevel: z.enum(['standard', 'simple']).optional(),
  task: z.object({
    title: z.string().max(120),
    type: z.enum(['writing','studying','admin','social','chores','other']),
    energyCost: z.number().int().min(1).max(3),
    due: z.string().nullable(),
  }),
  state: z.object({ quadrant: QuadrantZ, energy: Coord, pleasantness: Coord }).optional(),
  targetSteps: z.number().int().min(3).max(7),     // computed by code (5.7)
  previousSteps: z.array(z.string().max(80)).max(7).optional(), // for "Try again"
});

export const BreakdownOutput = z.object({
  steps: z.array(z.object({
    text: z.string().min(2).max(80),               // ≤ 12 words, starts with a verb
    minutes: z.union([z.literal(2), z.literal(5), z.literal(10), z.literal(15), z.literal(25)]).nullable(),
  })).min(3).max(7),
  note: z.string().max(120),                       // one short, kind line
});
```

**Semantic checks** (on failure, use the fallback):

- The number of steps is within `targetSteps ± 1` and between 3 and 7.
- No duplicate steps (case-insensitive, after trimming punctuation).
- Each step has at most 12 words.
- No forbidden words ("just", "simply", "easy", "should", "must", "lazy", "productive", "diagnos", "therapy"). In this route, "just" and "simply" count as forbidden because they minimize difficulty.
- If `previousSteps` exist, at least half of the new steps differ from them.
- Any digit in the output must come from the input (the title, due date or minutes values).

**Safety:** run the existing client safety pre-check on the task title before calling the route. If it triggers, follow the existing crisis flow and don't call the AI.

**Prompt:** `prompts/07-breakdown.md` (text in Appendix B), composed with the shared preamble like the others. Add it to `/prompts-doc` with an example.

### 5.7 Target step count (computed by code)

- Base by energy cost: light (1) → 3, medium (2) → 4, heavy (3) → 5.
- Ebb (low energy, unpleasant) state: −1, with a minimum of 3. ("Smaller lists on low days.")
- Swell (high energy, pleasant) state: +1, with a maximum of 7.
- With no recent check-in (none within 6 hours): base only.

### 5.8 Fallback (`breakdownFallback`)

Deterministic templates per task type, filled with the title where it reads naturally. Write all six:

- **writing:** "Open a blank document and add the title" (2) · "Write three rough bullet points" (5) · "Turn one bullet into a paragraph" (15) · "Read it once and fix what jumps out" (10) · "Save and name the file" (2).
- **studying:** "Gather the notes or book you need" (2) · "Read the first section only" (10) · "Write down three key ideas" (5) · "Try one practice question" (10) · "Mark what to review next time" (2).
- **admin:** "Find the form, email or site" (2) · "Collect the information it asks for" (5) · "Fill in the first part" (5) · "Check it once" (2) · "Send or submit it" (2).
- **social:** "Decide who you're writing to" (2) · "Write one opening sentence" (2) · "Add the main thing you want to say" (5) · "Read it once" (2) · "Send it" (2).
- **chores:** "Pick the smallest part to start with" (2) · "Gather what you need" (2) · "Do the first part for five minutes" (5) · "Put things back" (5) · "Check what's left" (2).
- **other:** "Write down what 'done' looks like" (2) · "List what you need to start" (2) · "Do the first small part" (10) · "Take a short break" (5) · "Do the next part" (10).

Trim the list to `targetSteps` (keep the first and last steps, and drop from the middle). The note: "Here's a simple way in. Change anything."

### 5.9 Demo

Add cached responses for the demo tasks ("Chemistry lab report", "Calculus problem set 7", "Read Physics chapter 4"). **Don't** add the feature to the demo tour or the pitch cut: the tour and pitch must not change. Mention it in `docs/demo-script.md` as an "If someone asks" live extra: Tasks → "Chemistry lab report" ⋯ → Break into steps.

### 5.10 Tests

- **Schema tests;** semantic check tests (duplicates, word count, forbidden words, digits, regeneration difference).
- **Fallback for each type and each target count** (3–7).
- **Target count rules.**
- **Repo tests** for subtasks and the `firstStep` sync.
- **Flow tests:**
  - TaskForm with "Break it down" → the sheet with mocked AI → edit a step, remove one, add one → save → the card shows "0 of 4 steps" → check a step in the detail sheet → "1 of 4" and `firstStep` updated → check all → the prompt to mark done;
  - the Focus "Next step ✓" button;
  - a safety phrase in the title → crisis, with no AI call.
- **Layout audit** of the Breakdown sheet and cards with steps, at all text scales.
- **Visual baseline:** cards **without** subtasks are pixel-identical to before.

---

## 6. Audit upgrades (close the gaps that let these bugs through)

v2.1's layout audit reported zero failures, but the team still found these bugs. The audit had blind spots. Upgrade `scripts/layout-audit.ts` and `e2e/layout-audit.spec.ts` (or the `/dev/audit` fallback) with these checks, then run the full matrix. Code snippets are in Appendix C.

### 6.1 New checks

1. **Mid-word break detector (catches B-03):**
   - For every visible text node, find each word (`/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu`). Create a DOM `Range` around the word and read `getClientRects()`.
   - If the word has more than one rectangle with different `top` values (more than 2px apart), it's broken across lines.
   - If the word's natural width (measure with an offscreen span in the same font) is narrower than its container's content width, it's a **failure**: a break that shouldn't happen.
   - If the word is wider than the container (a very long URL or code), it's a **warning**.
   - Skip `[data-allow-clip]` and code blocks.
2. **Frame boundary (catches B-02):** on desktop viewports, find `[data-app-frame]`. Every visible element inside the app (including portaled overlays, but excluding `[data-frame-exempt]`, such as the demo HUD) must be inside the frame's rectangle (with 1px tolerance). Overlays portaled outside the frame are failures.
3. **Frame width stability (catches B-05):** the frame's width at text scale 1.5 must equal its width at 1 (for the same viewport). Any growth is a failure.
4. **Scroll-to-end coverage (catches B-05's FAB problem):** for each scroll container (the main content area, sheets' scroll areas), scroll to the very end. Then check that the last content element (and every content box in the bottom 30% of the container) isn't covered by fixed or sticky elements (the FAB, tab bar, mini player, toasts, sticky footers), using `elementFromPoint` sampling.
5. **Overlay over content-it-shouldn't-cover (catches B-02's timer case):**
   - For each visible bubble or popover, check that it doesn't intersect any `[data-bubble-avoid]` element.
   - With a sheet open, check that no element outside the sheet paints above the sheet: sample points along the sheet's top edge and inside it; `elementFromPoint` must return the sheet or its descendants.
6. **Sheet content visibility (catches the cut-off "Close"):** for each open sheet, every interactive element inside it must be reachable. Scroll the sheet's scroll area to the end; each button's rectangle must be inside the sheet's visible rectangle and not covered.
7. **Input font size (catches iOS zoom):** every visible `input`, `textarea` and `select` has a computed `font-size` ≥ 16px.
8. **Phone input attributes (catches B-01):** inputs for phone-type values have `type="tel"` and `inputmode="tel"`. Typing "abc" into them (in the audit's interaction step) leaves the value without letters.
9. **Console:** capture every `console.error` and `console.warn`, uncaught exception and unhandled rejection during each route and state. Any of these is a failure, except an explicitly allowlisted, documented third-party warning.
10. **Accessibility:** run `@axe-core/playwright` (MPL-2.0; record it in `AI_ATTRIBUTION.md` as a dev dependency) on each route and open state. Violations of impact "serious" or "critical" are failures; "moderate" is a warning (fix it if the fix is invisible).
11. **Network:** during the audit (demo workspace with forced cache), no failed requests (4xx/5xx) except the intentional `missing_key` responses in the no-key test configuration.

### 6.2 Matrix

The same as v2.1 (widths 320, 360, 390, 768, 1024, 1280; text scales 1, 1.15, 1.3, 1.5; spot-checks with Lexend, Hyperlegible, bold text and extra spacing), plus:

- **the desktop frame case explicitly:** a 1280×800 viewport with the frame present, at every text scale;
- **dark and high-contrast themes** for the overlay and contrast checks;
- **all six companions plus "none"** for the bubble checks (the art sizes differ);
- **Literal mode** for the bubble checks (literal lines are the longest).

### 6.3 Reports

Save `docs/audits/2026-11-03-sweep-before.json` (run the upgraded audit **before** fixing, as a map of bugs; every failure becomes a ledger entry or is grouped under one) and `docs/audits/2026-11-0X-sweep-after.json` (zero failures). Summarize both in `docs/BUG_SWEEP.md`.

---

## 7. The systematic sweep: what to check

After the reported bugs and Section 5, go through the whole app area by area. For each area, check everything listed, **using tests, the audit, the demo workspace and a browser tool if you have one.** Every problem you find becomes an `S-nn` ledger entry, and is fixed under the no-change contract.

### 7.1 App shell and navigation

- Every route loads directly by URL and on refresh, with no hydration warnings. Unknown routes show the friendly 404.
- Tabs: the active state is correct on every route, including nested routes (`/settings/appearance` shows no tab active, or the right one, consistently with v2's intent).
- The TopBar menu items all work. Keyboard shortcuts (if on) work, and never fire while typing.
- Browser back and forward behave sensibly with sheets (v2.1 F-08) and never leave a sheet half-open.
- The onboarding redirect only happens for new users. Existing users never get bounced into onboarding.
- Splash: never blocks interaction, never shows twice per session, skipped at motion Off.
- The offline pill appears and disappears correctly.
- The error boundary catches errors per route, and "Try again" works.

### 7.2 Check-in

- **Words path:** typing, dictation (only verify; don't change it), Next enabled at ≥ 3 characters, the AI or fallback candidates, the max-two rule, "None of these" and the custom word, the map drag and keyboard movement, sliders mode, the causes step, all four needs and their routing, the toast, and the companion reaction.
- **Body path** with every combination; the slider hints passed to AI.
- **Simple vocabulary** setting: only 16 words offered.
- **Back and Cancel** behavior (v2.1): data kept; no AI re-call for unchanged text.
- **Safety path** in English and Spanish: no AI call, no text saved, crisis screen shown.
- Saved CheckIn has the correct quadrant at the boundaries (energy 0, pleasantness 0, negatives).

### 7.3 Tasks, Unstick, Focus

- **Create:** validation, every type and energy, due date pickers, "Break it down" (Section 5).
- **Move between all statuses** with drag (mouse and keyboard sensors) and with the "Move to…" menu; counts and order persist after reload.
- **Edit and delete** (v2.1): undo, history purge, boot purges, a running focus block.
- **Done visibility:** 24 hours, other windows, `clearedAt`, the archive and its actions.
- **Someday and snoozed** behavior (v2), the anchor badge.
- **Unstick:** each reason, "Different step", the strategy-first suggestion and its numbers, the parking note display.
- **Focus:**
  - the duration rule; start, pause, resume; end early; End; the outcome sheet;
  - the end alert in each setting, warn-before-end, notifications (permission flow), title countdown and favicon restore, wake lock acquire/release;
  - nudges in each setting with the caps; ambience "until focus ends" stopping before the alert;
  - the timer's accuracy after backgrounding;
  - no intervals left running after leaving the page (check with a spy in tests).

### 7.4 Today, Day Mode, Bridge, Calendar

- **Today:** the greeting by time, the state card, win card, bottle card, morning card (only with yesterday's wrap and anchor), evening card (time window), quick actions, the shore preview "New" pill, the Tide Line "Now" marker updating, moved and snoozed groups, empty states.
- **Day Mode:** the recommendation rules, budgets from settings, toggles, the energy total, Undo restores exactly, no task ever deleted.
- **Bridge:** appears at the lead time from settings (5, 10, 15), never for deleted events, the parking note propagation, the strategy pick within the bridge maximum seconds, the after-event rating prompt timing, wins.
- **Calendar:** month grids for 4+ months (including months starting on Sunday and Monday with both week-start settings), today highlighting, day views (past, future, today), repeating events creation, edit and delete scopes, keyboard grid navigation, the agenda list at large text, aggregation counts correct.

### 7.5 Toolkit and sounds

- Every strategy opens its tool. Every tool works with mouse, touch and keyboard. Cancel and End early behave as in v2.1. Re-check saves correctly. Cancelled uses are ignored by patterns.
- Box breathing is synced with the companion, reduced motion respected, and the speech cues timing (if on).
- Count back: every step and start, both modes, feedback text.
- Sudoku puzzles are valid and solvable (test all five).
- Message templates and clipboard.
- Brain dump: safety check; "Turn lines into tasks".
- **Ambience:**
  - every sound starts and stops, with no clicks at loop points (check that buffer loop crossfades are applied);
  - volume caps; switching crossfades;
  - the mini player;
  - Media Session handlers;
  - stops on the crisis screen;
  - no AudioContext created before a user gesture;
  - no audio nodes leaked after stop (count connected nodes in tests with a mock).

### 7.6 Patterns

- Numbers on cards always equal the engine output. "Why am I seeing this?" evidence rows are complete and correctly dated. "Not true for me" persists, and "Show dismissed again" works.
- `wrap_helped` card thresholds; "What's been hard" summary.
- The period toggle; the PeriodDots accessible text.
- Deleted tasks show as "a deleted task" in evidence (v2.1).
- With the seed: exactly the planted keys.

### 7.7 Shore and bottles

- Item mapping for every win kind; deterministic placement after reload; no overlaps; 48+ items overflow chip; arrivals only for new items; `lastSeenAt` updated.
- Time of day: auto by clock and all manual choices; the companion's pose per time.
- Item details popover inside the frame (B-02's frame rule); keyboard navigation between items.
- Collection counts and the "Not found yet" info; released notes.
- Bottles: write (safety check), eligibility rules (≥ 24 hours, Ebb/Surge, one per day), open, keep, release.
- Save as image: colors resolved (no black or transparent shapes from unresolved CSS variables), the name option, the file name.

### 7.8 Close the day

- All 13 steps, Back keeps data, Close saves for resume, resume at the right step.
- The day boundary before `day.start`.
- The tide chart with 0, 1, 2 and many check-ins; the accessible list.
- Loose ends decisions and their effects; Undo before finishing.
- Tomorrow's pattern hint numbers; the anchor and first step (AI/fallback).
- The wrap-up AI checks and fallback.
- The goodnight scene; the driftwood win; the morning card next day.
- Reopening a completed wrap (read-only and the editable parts).

### 7.9 Companions, celebrations, themes, motion, voice

- Each companion renders every expression with no missing parts, in every variant and accessory, at every size. Luma with no face.
- Talkativeness levels. Placements toggles respected. Never on the crisis screen.
- Celebrations: the matrix by quadrant, caps, the overlay focus return, no celebrations on the crisis or support screens or during breathing.
- **Themes:** all 15 apply fully. No hardcoded colors left (the guard test). Dark themes have no invisible elements (check SVG strokes and companion eyes rims). Contrast tests pass.
- **Motion levels** respected everywhere (search for animations that ignore the level).
- **Voice:** voice ranking picks sensibly; read-aloud stops when a new one starts; there's no read-aloud on hidden elements; cloud voice fallback when no key; the cache LRU.
- **Dictation:** verify only; don't change. Run the freeze test.

### 7.10 Settings, presets, looks, onboarding

- Every setting in the Settings table does something visible or functional. A setting that does nothing is a bug: wire it, or, if wiring it would add a feature, log it as "Needs team decision".
- **Presets:** each changes exactly its listed keys; diff confirmation; Undo.
- **Looks:** try, keep, back to my look, surprise me.
- **Search:** synonyms; highlight; deep links.
- **Import and export** round trip for settings and data, including v2.1 fields and `subtasks`; old backups import without errors; invalid files fail safely with no partial writes.
- **Onboarding:** every step, resume, skip, "Skip setup" defaults, the first check-in coach marks, the welcome shell.
- **What's new** appears once for existing users.

### 7.11 Demo

- The full tour, pitch cut and presenter mode, at 1× and 2×, offline with forced cache, twice each. No skipped steps. Captions never cover targets. The spotlight is inside the frame where appropriate.
- The demo workspace never touches the main database (compare counts).
- "Leave demo" works from every screen.
- `/demo?autostart=…` works after the Start tap.
- The crisis preview only in the demo workspace.

### 7.12 Data, time and storage edge cases

- **Midnight rollover** while the app is open: Today updates, the Done window updates, the evening and morning cards switch.
- **Timezone:** the app uses the device's local time consistently. Check date helpers for UTC/local mixing, especially `toISOString().slice(0, 10)` used as a "local date" (a classic bug: after 6 pm in Mexico City it returns tomorrow's date). Fix every such use with a local date formatter. This is likely to exist; check carefully.
- **Daylight saving changes** (US users): durations computed from timestamps, never from clock-time differences.
- **Storage failures:** private browsing, a full quota, blocked IndexedDB. The app shows a calm message instead of crashing, and `localStorage` access is always wrapped in try/catch.
- **Large data:** with 1,000 check-ins and 500 tasks (generate them in a test), Today, Patterns, Shore and Calendar stay responsive (measure and log the render times).
- **Long text everywhere:** 120-character task titles, 80-character event titles, long names, long companion names (16), long contact names. Nothing breaks layout (the audit with a "long text" fixture).
- **Special characters:** emojis, accents (á, ñ), quotes and `<script>` in user text render as text (no HTML injection; React escapes by default; check any `dangerouslySetInnerHTML` use).
- **Unicode in names:** the shore image export and read-aloud handle accents.

### 7.13 AI layer

- Every route with valid, invalid, timeout and missing-key responses; fallbacks always render.
- The rate limiter resets.
- No user text is logged on the server: grep the server code for `console.log` and `console.error` of request bodies.
- `readingLevel` and `mode` are passed everywhere.
- Demo cache matches inputs exactly (normalized).
- `/prompts-doc` renders all prompts, including breakdown.

### 7.14 Performance and memory

- No intervals, timeouts, listeners, observers or audio nodes left after unmount. Search for `setInterval`, `addEventListener`, `ResizeObserver`, `IntersectionObserver` and `MutationObserver` without cleanup.
- Animations pause when the tab is hidden and when offscreen.
- Bundle size of `/` within the v2 budget. No accidental imports of heavy modules (the confetti, Shore and director modules stay lazy).
- No layout thrashing in loops (reads and writes interleaved).

### 7.15 Security and privacy

- No secrets in the repository or its history (scan again).
- `.env.example` is up to date.
- The API key and the TTS key never reach the client bundle (grep `.next/static`).
- No analytics or third-party scripts.
- `__tideDev` hooks are absent in production builds (test).
- Notifications never include sensitive text beyond the task title (and include none if the setting to hide titles exists; don't add that setting).

---
## 8. Fix patterns (use these so fixes stay small and consistent)

| Problem | Preferred fix | Avoid |
|---|---|---|
| Word broken mid-word | `overflow-wrap: break-word; word-break: normal`; give the flex/grid item a sensible `min-width` in em | `anywhere`, `break-all`, shrinking the font everywhere |
| Text clipped in a fixed-height box | `min-height` instead of `height` | Raising the fixed height |
| Element wider than the frame | Find the fixed width or `100vw`; use `max-width: 100%` or container-relative units | `overflow: hidden` on parents as the first fix |
| Layout too crowded at large text | Container query in em that switches to the existing narrower layout | New layouts or redesigns |
| Overlay outside the frame | Portal into the frame's overlay root; Floating UI `boundary` = frame | Hardcoded offsets |
| Overlay covering key content | `data-bubble-avoid` + the avoid middleware, or an inline slot on fixed-layout screens | Moving the key content |
| Element painting above a sheet | Map z-index to the scale; remove stray stacking contexts | Raising the sheet's z-index endlessly |
| Content hidden behind fixed bottom elements | `--bottom-insets` padding from measured heights | Fixed padding numbers |
| Input zooms on iOS | Font-size ≥ 16px on inputs | `maximum-scale=1` |
| Invalid input accepted | Sanitize on change + validate on blur/save + an accessible error | Silently rejecting keystrokes with no explanation |
| Console warning (React keys, act, hydration) | Fix the cause (stable keys, deterministic render, client-only code in effects) | Suppressing warnings |
| Leaked timer or listener | Cleanup in the effect's return | Global flags |
| UTC date used as a local date | `toLocalDateString(date)` helper (local Y-M-D) | String slicing of ISO strings |
| Missing label | `aria-label` or a visible label linked with `htmlFor` | Changing the visible design |
| Contrast failure | Adjust only the failing token minimally, per theme, logged | Global palette changes |

---

## 9. Testing summary

- **Always green after every fix:** lint, typecheck, `npm run test` (all suites), `npm run test:v1`, the dictation freeze test, the demo reference test, the seed test, and the build. If available: the e2e suites (`demo-full`, `demo-pitch`, `v1-pitch`, `layout-audit`, `focus-alert`).
- **New tests per bug:** each B-/S- entry has at least one test that fails before the fix and passes after. The exception is a pure visual check that only the audit can catch; then the audit case is the test.
- **New static guards:**
  - no `overflow-wrap: anywhere` or `break-all` outside the allowlist;
  - no `maximum-scale` in the viewport meta;
  - no `toISOString().slice(0, 10)` (or `split('T')[0]`) outside the date helper;
  - every `setInterval` file also contains `clearInterval` (a heuristic; review the hits);
  - phone inputs use `type="tel"`.
- **Visual regression** before and after (Section 3.3).
- **The feature inventory** ticked (Section 3.2).
- **Manual checks for the team** (written into `docs/TEAM_TODO.md`):
  - a real iPhone and a real Android phone at 130% Tide text plus a large OS text size: Toolkit, Tasks, Focus, Settings;
  - tap the companion on the Focus page and on the Shore on desktop (inside the frame) and on a phone;
  - phone fields with letters on a real phone keyboard;
  - Break into steps on a real task;
  - the full demo once on the presentation laptop.

---

## 10. The ordered work plan (Phases S0–S6)

### Phase S0: Baseline and maps

1. Section 3.1 (baseline, tag, branch).
2. Feature inventory (3.2).
3. Visual baseline screenshots (3.3), **before any code change.**
4. Audit upgrades (Section 6) and the "before" audit run. Create `docs/BUG_SWEEP.md` with the reported bugs B-01…B-06 and every audit finding grouped into S- entries.
5. Commit: `chore(sweep): baseline, inventory, visual baseline and audit upgrades`.

### Phase S1: Reported layout bugs (Critical/High)

In this order, each with its own commit:

1. **B-03:** mid-word breaks (the global text rule, titles, tab labels, min widths). It's the root of several visible problems, so do it first.
2. **B-05:** frame width stability and horizontal overflow, the iOS input font size, the FAB compact form, `--bottom-insets`.
3. **B-04:** the Tasks board container-based layout.
4. **B-02:** the frame boundary for overlays, the overlay root inside the frame, avoid-elements, inline speech slots, sheets covering companions, the Focus outcome sheet.
5. **B-06:** remaining screenshot details.

Re-run the full audit and the visual baseline after S1. Fix regressions immediately.

### Phase S2: Reported data and input bug

6. **B-01:** phone fields (sanitize, validate, existing data notice, safe `tel:` links).

### Phase S3: The requested feature

7. **Section 5,** AI task breakdown: route, prompt, fallback, sheet, subtasks, card progress, detail checklist, focus "Next step", unstick link, tests, `/prompts-doc`, cached demo responses, `demo-script.md` note.

### Phase S4: Sweep (Critical and High findings)

8. Go through Section 7, area by area. Record every finding. Fix the Critical and High ones, one commit per root cause.
9. **Check the likely ones first:**
   - UTC/local date bugs (7.12);
   - leaked timers (7.14);
   - console warnings (6.1 #9);
   - settings that do nothing (7.10);
   - axe serious violations (6.1 #10).

### Phase S5: Sweep (Medium and Low findings)

10. Fix Medium findings. Fix Low findings only if the fix is invisible at default settings; otherwise record them as "Not fixed: would change the design" with a note for the team.

### Phase S6: Prove nothing else changed, then finish

11. The "after" audit across the full matrix: zero failures.
12. Visual regression comparison: every diff is explained by a ledger entry or by Section 5; revert anything else.
13. Feature inventory: tick every item with how it was verified.
14. All suites green; both demos and the v1 pitch path run twice each.
15. Docs:
    - `docs/BUG_SWEEP.md` (complete ledger + audit summaries + visual diff summary);
    - `CHANGELOG.md` ("v2.2 — Bug sweep": one plain line per fix, grouped);
    - `docs/AI_DEV_LOG.md` (entries + "Where Tide stands after the sweep");
    - `AI_ATTRIBUTION.md` (changed and new files; `@axe-core/playwright`, `pixelmatch`, `pngjs` as dev dependencies; the new prompt);
    - `docs/DECISIONS.md` (the tab label damping, the FAB compact form at large text, the inline speech slots, the frame boundary, any token adjustments);
    - `docs/CODE_WALKTHROUGH.md` (the breakdown module, the overlay boundary and avoid middleware, bottom insets, the phone utils, the new audit checks);
    - `docs/TEAM_TODO.md` (the manual checks; "Needs team decision" items);
    - progress report drafts.
16. Merge into `main`, tag `v2.2.0`, push if possible (Section 2.4), or document why not.
17. Final message to the team, in plain words: what was broken and is now fixed (the reported bugs first), what else the sweep found and fixed, what's waiting for a decision, and the manual checks to do on real phones before Thursday.

---

## 11. Definition of done

- [ ] B-01 to B-06 fixed, each with a test and a ledger entry.
- [ ] AI task breakdown works end to end, with fallback and safety, and changes nothing else.
- [ ] The upgraded audit (mid-word breaks, frame boundary, frame width stability, scroll-to-end coverage, avoid-elements, sheet visibility, input font size, phone inputs, console, axe, network) reports zero failures across the matrix.
- [ ] The sweep is complete: every area in Section 7 checked; Critical, High and Medium findings fixed; Low findings fixed or recorded.
- [ ] The visual regression at default settings shows no unexplained differences.
- [ ] The feature inventory is fully ticked; nothing disappeared or stopped working.
- [ ] All test suites green, the dictation freeze test green, both demos and the v1 pitch path working twice each, the seed's planted keys unchanged.
- [ ] Docs and logs updated; TEAM_TODO lists the manual phone checks and any decisions.
- [ ] Merged and tagged `v2.2.0`, or the reason is documented.

---

## Appendix A: New copy strings (`src/copy/en.ts` additions only)

**Phone fields**
- `phoneHintChars`: "Phone numbers can only use numbers, spaces, + - ( )."
- `phoneInvalid`: "That doesn't look like a full phone number yet. Example: +52 81 1234 5678."
- `phoneMayNotWork`: "This number may not work. Edit it?"
- `phoneCallDisabled`: "Add a valid number to call or text."

**AI breakdown**
- `breakdownTitle`: "Break it into steps"
- `breakdownLoading`: "Breaking it into small steps…"
- `breakdownNote`: "Suggestions, not rules. Change anything."
- `breakdownFallbackNote`: "Here's a simple way in. Change anything."
- `breakdownAddStep`: "Add a step"
- `breakdownTryAgain`: "Try again"
- `breakdownTooManyTries`: "That's plenty of tries. Edit the steps by hand."
- `breakdownSave`: "Save steps"
- `breakdownRemoveStep`: "Remove step: {text}"
- `breakdownMoveUp`: "Move up"
- `breakdownMoveDown`: "Move down"
- `breakdownMinutes`: "~{n} min"
- `breakdownNoTime`: "No time"
- `breakIntoSteps`: "Break into steps"
- `editSteps`: "Edit steps"
- `breakWholeTask`: "Break the whole task into steps"
- `stepsProgress`: "{k} of {n} steps"
- `allStepsDone`: "All steps done. Mark the task as done?"
- `markDone`: "Mark done"
- `notYet`: "Not yet"
- `nextStepDone`: "Next step ✓"
- `nextSavedStep`: "Your next saved step: {step}"
- `stepTextError`: "Add a few words for this step."

**Large text**
- `menuIconLabel`: "Menu" (accessible name when the label is hidden)
- `checkInIconLabel`: use the existing "Check in" string; don't create a new one

---

## Appendix B: Prompt `prompts/07-breakdown.md`

```
TASK: Break the user's task into a short list of concrete steps.

Write exactly INPUT.targetSteps steps (one more or one fewer is fine if it
reads much better). Each step:
- starts with a verb ("Open", "Write", "Find", "Read", "Send", "Put"),
- describes one physical, visible action, not a feeling or a plan
  ("Write three rough bullet points", not "Think about the essay"),
- has 12 words or fewer,
- can be done in 25 minutes or less; give "minutes" as 2, 5, 10, 15 or 25,
  or null if you can't tell.

Order the steps so the first one is the easiest way in. If INPUT.state
shows low energy and an unpleasant feeling (quadrant "ebb"), make the first
two steps especially small. Use the task title's own words where they help.
Do not invent details that are not in INPUT (names, page counts, dates,
tools). Never use the words "just", "simply", "easy", "should" or "must":
they make hard things sound small.

If INPUT.previousSteps exists, the user wants a different breakdown:
change at least half of the steps (a different first step, a different way
to split the work).

note: one short, kind line (12 words or fewer) about using the list
flexibly. Respect INPUT.mode and INPUT.readingLevel.

OUTPUT SCHEMA:
{ "steps": [ { "text": string, "minutes": 2|5|10|15|25|null } ],
  "note": string }
```

**Example** (for tests and `/prompts-doc`):

- INPUT: `{"mode":"gentle","task":{"title":"Chemistry lab report","type":"writing","energyCost":3,"due":"2026-11-06"},"state":{"quadrant":"ebb","energy":-3,"pleasantness":-3},"targetSteps":4}`
- OUTPUT:

```json
{"steps":[{"text":"Open the report and type the title and date","minutes":2},{"text":"Paste your data table into the results section","minutes":5},{"text":"Write three rough bullets for the methods","minutes":10},{"text":"Turn one bullet into a full paragraph","minutes":15}],"note":"Start with the first one. The rest can wait."}
```

---

## Appendix C: Audit snippets

**Mid-word break detector** (runs in the page):

```ts
// Finds words the browser split across two lines even though they would fit
// on one. That's the "Toolki t" bug: it only happens when a container is
// allowed to shrink narrower than a single word.
function findMidWordBreaks(): { selector: string; word: string }[] {
  const out: { selector: string; word: string }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const wordRe = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0';
  document.body.appendChild(probe);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent.closest('[data-allow-clip], code, pre, [aria-hidden="true"]')) continue;
    const cs = getComputedStyle(parent);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const text = node.textContent ?? '';
    for (const m of text.matchAll(wordRe)) {
      if (m[0].length < 2) continue;
      const range = document.createRange();
      range.setStart(node, m.index!);
      range.setEnd(node, m.index! + m[0].length);
      const tops = new Set(Array.from(range.getClientRects()).map(r => Math.round(r.top / 3)));
      if (tops.size <= 1) continue;
      probe.style.font = cs.font;
      probe.style.letterSpacing = cs.letterSpacing;
      probe.textContent = m[0];
      const contentWidth = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (probe.getBoundingClientRect().width <= contentWidth + 0.5) {
        out.push({ selector: describe(parent), word: m[0] });
      }
    }
  }
  probe.remove();
  return out;
}
```

**Frame boundary and width stability:**

```ts
// On desktop Tide lives in a phone-sized frame. Anything that belongs to the
// app but paints outside it looks broken, even if it's still on screen.
function findOutsideFrame(): { selector: string; overflow: string }[] {
  const frame = document.querySelector('[data-app-frame]')?.getBoundingClientRect();
  if (!frame) return [];
  const out: { selector: string; overflow: string }[] = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[data-frame-exempt]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) continue;
    if (r.left < frame.left - 1 || r.right > frame.right + 1)
      out.push({ selector: describe(el), overflow: `${Math.round(r.left)}..${Math.round(r.right)} vs ${Math.round(frame.left)}..${Math.round(frame.right)}` });
  }
  return out;
}
// Width stability: read frame.width at textScale 1 and at 1.5 for the same viewport; they must match.
```

**Scroll-to-end coverage:**

```ts
// Floating buttons can sit over content while you scroll; that's fine. What
// isn't fine is content you can never get out from under. So we scroll each
// container to the end and check its last stretch is uncovered.
async function scrollEndCoverage(page: Page) {
  return page.evaluate(() => {
    const issues: { selector: string }[] = [];
    const scrollers = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-root], main'))
      .filter(el => el.scrollHeight > el.clientHeight + 1);
    for (const sc of scrollers) {
      sc.scrollTop = sc.scrollHeight;
      const box = sc.getBoundingClientRect();
      const tail = Array.from(sc.querySelectorAll('*')).filter(el => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.top >= box.top + box.height * 0.7 && r.bottom <= box.bottom + 1 &&
          (Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent!.trim()) || el.matches('button, a, input'));
      });
      for (const el of tail) {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (hit && hit !== el && !el.contains(hit) && hit.closest('[data-overlay]'))
          issues.push({ selector: describe(el) });
      }
    }
    return issues;
  });
}
```

(`describe(el)` is the short selector helper from the v2.1 audit: tag names plus `data-demo-id` or `id`, up to 5 levels.)

---

## Appendix D: Ledger template (`docs/BUG_SWEEP.md`)

```markdown
# Tide v2.2 bug sweep

I'm Claude Code. The team asked me to fix the bugs they found and sweep the
rest of the app without changing anything that works. This file is the
record of every bug: where it was, why it happened, how I fixed it, and how
I checked it.

## Summary
- Reported bugs fixed: n of 6
- Sweep findings: n (Critical n, High n, Medium n, Low n); fixed n; recorded n
- Audit before: n failures · after: 0
- Visual diffs at default settings: n, all explained below

## Reported bugs
### B-01 — Phone number fields accept letters
- Severity: High · Status: Fixed
- Where: Settings → People & support; Onboarding step 12; Support page links
- Reproduce: type "abc" in a contact's phone field → it's saved
- Root cause: …
- Fix: … (files)
- Test: … (file and test name)
- Visual diff: none at default settings

## Sweep findings
### S-01 — <title>
- Severity · Status
- Where · Reproduce · Root cause · Fix · Test

## Not fixed (would change the design) or needs a team decision
- …

## Audit summaries
- Before: …
- After: …

## Visual regression summary
| State | Viewport | Diff % | Explained by |
|---|---|---|---|
```

---

## Appendix E: Messages to paste into Claude Code

### E.1 Kickoff

```
We need a careful bug sweep of Tide before Thursday's submission. Read
docs/TIDE_V2_2_BUG_SWEEP_PROMPT.md completely, then CLAUDE.md, the end of
docs/AI_DEV_LOG.md, and the code you'll touch.

The rule: fix what's broken and change nothing else. Same look, same text,
same screens, same features at normal settings. The only new thing is the
AI task breakdown in Section 5, because we asked for it.

Start by taking the visual baseline screenshots and the feature inventory
before changing any code. Then fix our reported bugs (B-01 to B-06), build
the breakdown, and sweep the whole app following Section 7. For every bug:
record it in docs/BUG_SWEEP.md, reproduce it, find the root cause, make the
smallest fix, add a test, run every suite (including test:v1 and the
dictation freeze test), and commit. Don't ask us to confirm between bugs.

At the end, prove nothing else changed (the visual comparison, the feature
inventory, both demos and the v1 pitch path), update the docs and logs in
the first person, and merge to main only if everything is green. Then tell
us in plain words what was fixed and what we should check on real phones.
```

### E.2 Resume

```
We're resuming the Tide v2.2 bug sweep. Read CLAUDE.md, then
docs/TIDE_V2_2_BUG_SWEEP_PROMPT.md, then docs/BUG_SWEEP.md and the end of
docs/AI_DEV_LOG.md, and run git status and git log --oneline on
v2.2-bug-sweep. Run all checks, finish any half-done fix, and continue in
the plan's order without asking us to confirm. Don't change anything that
isn't broken.
```

### E.3 A new bug from testing

```
New bug from testing on <device/browser>:
- Where: <screen>
- Settings: text size <x>, theme <y>, font <z>, companion <w>
- What we did: <steps>
- What happened: <result>
- What we expected: <expected>

Add it to docs/BUG_SWEEP.md, reproduce it (add an audit case or a test),
fix the root cause with the smallest change, check that the visual baseline
at default settings is unchanged, run every suite, and commit.
```

*End of document.*
