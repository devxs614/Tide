# TIDE v2.1 — "Partner-Ready" Fix and Polish Pack — Master Prompt for Claude Code

> **Cómo usar este archivo (para el equipo, en español)**
>
> Este documento le pide a Claude Code corregir y mejorar la versión 2 de Tide con la lista que redactó el equipo, **en orden de prioridad**, para tener la app impecable en la junta del martes con el Challenge Partner y en la entrega del jueves 5.
>
> **Orden de trabajo:**
> 1. **Críticos (P0):**
>    - la burbuja del compañero se corta o se tapa;
>    - la interfaz se rompe con texto al 130% y Settings se empalma;
>    - no se pueden editar ni borrar tareas;
>    - no se pueden editar ni borrar eventos de la Tide Line;
>    - las tareas Done se amontonan.
> 2. **Alto impacto (P1):**
>    - sonido al terminar el timer de enfoque;
>    - aviso de re-enfoque "Earth to {nombre}", activable y desactivable;
>    - botones de Back y Cancel en todos los flujos;
>    - sonidos de enfoque: ruido blanco, rosa y café, lluvia, olas y binaurales.
> 3. **Deseables (P2):**
>    - calendario mensual con vista por día y eventos que se repiten;
>    - variaciones de "Try a new look";
>    - cambiar a mano la hora del día en la Shore (Dawn, Day, Sunset, Dusk, Night);
>    - "Count back" configurable de 7 a 2.
> 4. **Detalles con tiempo límite (P3):** detalles externos del axolote en la Shore y rediseño del sand dollar, máximo 20–30 minutos cada uno.
> 5. **No se construye:** avatares 3D. Solo se escribe un documento de roadmap en una rama aparte para comentarlo en la junta.
>
> **Pasos:**
> 1. Guarden este archivo en el repo como `docs/TIDE_V2_1_FIXES_PROMPT.md`.
> 2. Abran Claude Code en la carpeta del repo y peguen el **mensaje de arranque** del Apéndice E.
> 3. Claude trabaja solo, en orden, sin pedirles confirmación. Hace commit después de **cada arreglo**, así que si el tiempo se acaba, todo lo urgente ya queda guardado.
> 4. El dictado por voz sigue congelado. Las pruebas de v1 y v2, el recorrido Demo y el pitch de 100 segundos deben seguir funcionando.
> 5. Claude escribe las bitácoras en primera persona y con voz natural, y deja en `docs/TEAM_TODO.md` lo que solo ustedes pueden hacer: probar en un celular real, dar permisos de notificación y revisar con su socio.
>
> **Nota sobre las tareas Done:** el documento pide **ocultarlas** del tablero después de 24 horas (con un archivo de "completadas"), no borrarlas para siempre. Si se borraran, también desaparecerían sus conchas de la Shore y los datos de los patrones. Hay una opción aparte, apagada por defecto, para borrarlas definitivamente después de 30 días.

---

## 0. How to read this document (for Claude Code)

Tide v1 was built from `docs/TIDE_BUILD_PROMPT.md`. Tide v2 was built from `docs/TIDE_V2_UPGRADE_PROMPT.md`. The team has now used v2, shown it to their Challenge Partner (who loved the current companion designs), and written a prioritized list of bugs and improvements. This document turns that list into a precise, ordered work plan called **v2.1 "Partner-Ready"**.

Dates that matter:

- **Today:** Sunday, November 1, 2026.
- **Tuesday, November 3:** meeting with the Challenge Partner. Everything in P0 and P1 must be done before then.
- **Thursday, November 5, 11:59 p.m.:** final code submission.
- **Saturday, November 7:** Launchpad Monterrey.

**The prime directive is the same as v2: fix and add without breaking anything.** Every v1 and v2 feature must still work with the same behavior and data. The v1 and v2 test suites must still pass. The voice dictation code stays frozen (the freeze test must keep passing). The Demo tour (full, pitch cut and presenter mode) must still run start to finish.

Source-of-truth order:

1. **The code in the repository** is the truth about what exists today. Read it before changing anything; it may differ from the earlier specs.
2. **This document** is the truth for the v2.1 changes.
3. **The v2 and v1 specs** are the truth for everything this document does not change.

When they disagree, follow that order and record the decision in `docs/DECISIONS.md`.

Work **autonomously**, in the order of Section 23, with the same phase cycle as before: **understand → reproduce → fix or build → verify → log → commit → continue.** Do not ask the team to confirm between items. Stop only for the true blockers in Section 1.6.

Section map:

1. Working protocol for v2.1
2. The item list, priorities and order
3. Safety net (branch, baseline, suites, freezes)
4. How to investigate and fix UI bugs (method and the layout audit tool)
5. F-01 Companion speech bubble cut off or covered (P0)
6. F-02 Large text and responsive layout, Settings overlap (P0)
7. F-03 Edit and delete tasks (P0)
8. F-04 Edit and delete events in the Tide Line, including repeating events (P0)
9. F-05 Done tasks clear themselves from the board after 24 hours (P0)
10. F-06 Focus timer end alert: sound, visual, notification (P1)
11. F-07 Refocus nudge "Earth to {name}" (P1)
12. F-08 Back and Cancel everywhere (P1)
13. F-09 Focus sounds: noise, rain, waves, binaural (P1)
14. F-10 Monthly calendar, day view and repeating events (P2)
15. F-11 "Try a new look" variations (P2)
16. F-12 Shore time of day, chosen by hand (P2)
17. F-13 Count back by 7, 6, 5, 4, 3 or 2 (P2)
18. F-14 Axolotl's external details on the Shore (P3, timeboxed)
19. F-15 Sand dollar redesign (P3, timeboxed)
20. F-16 3D companions: roadmap note only, separate branch (do not build)
21. Cross-cutting changes: data model v3, settings, copy, demo tour, docs
22. Testing plan
23. The ordered work plan (Phases R0–R7)
24. Definition of done
25. Appendices: copy strings, layout audit script, sound recipes, messages to paste, notes for Tuesday's meeting

---

## 1. Working protocol for v2.1

### 1.1 Your role

You are the senior engineer responsible for making Tide feel solid in front of the Challenge Partner and the judges. These items came from real use. Treat each one as a real person's frustration: a student who taps the companion and sees half a sentence, someone who needs 130% text and watches Settings overlap, someone who cannot delete a task they added by mistake. Fix the cause, not the symptom, and make sure it stays fixed.

### 1.2 Priorities rule the order

Work strictly in priority order: P0 → P1 → P2 → P3, and within each priority in the order of Section 2. Do not start P1 until every P0 item is done, verified and committed. If time or context runs short, a finished P0 is worth more than ten half-finished P2s.

### 1.3 The item cycle (repeat for every item)

1. **Understand.** Re-read the item's section and the code you will touch. Write a short "Before F-nn" entry in `docs/AI_DEV_LOG.md`: what the person experiences today, why it matters for neurodivergent users, what "fixed" means, and what could break.
2. **Reproduce.** For bugs, reproduce them before fixing: with a failing test, the layout audit (Section 4.3), or a browser tool. Record the exact reproduction in the log (route, viewport, settings, steps). If you cannot reproduce a reported bug, check every variant listed in the item's section before concluding it's fixed, and say so honestly.
3. **Root cause.** Find the actual cause and write it down in one or two sentences ("The bubble is rendered inside the card, which has `overflow: hidden`, so anything outside the card is clipped").
4. **Fix or build.** Implement the change as specified. Keep files small, write natural comments (Section 1.5), and keep every v1 and v2 API intact.
5. **Verify.**
   - Run lint, typecheck, all tests, `npm run test:v1`, the v2 suites, the freeze test and the build.
   - Run the layout audit for the affected routes.
   - Exercise the flow, with a browser tool if you have one.
   - Check the item's acceptance criteria one by one.
6. **Log.** Write "After F-nn": root cause, fix, how you verified it, anything left open. Update `AI_ATTRIBUTION.md` (new or changed files), `docs/DECISIONS.md`, `docs/CODE_WALKTHROUGH.md` (new modules or behavior), `CHANGELOG.md` (a v2.1 entry per item) and `docs/TEAM_TODO.md` (anything only humans can check).
7. **Commit**, one commit per item (or more for big items), on the `v2.1-partner-ready` branch: `fix(<scope>): <summary>` or `feat(<scope>): <summary>`, with a short natural body and the `AI-Generated: Claude Code` trailer. New scopes: `bubble`, `layout`, `tasks`, `events`, `calendar`, `focus`, `nudge`, `nav`, `ambience`, `looks`, `shore`, `countback`, `art`.
8. **Continue** to the next item without waiting.

Also draft a progress report for each calendar day you work (`docs/progress/YYYY-MM-DD.md`, in the team's voice, stating that Claude Code generated the code).

### 1.4 Timeboxes

Every item has a timebox (Section 2). The timebox is a guide, not a reason to ship something broken. If an item runs far over (about 2× its timebox), stop. Make sure what exists is safe and working (behind its setting, or reverted to the previous behavior), commit that, log the reason, and move on. Return to the item after all other items of the same priority are done. P3 items have **hard** timeboxes: when time is up, keep the best working state or revert, and move on.

### 1.5 Comments and logs: voice rules (unchanged)

- Every new file starts with a 2–5 line header comment that explains what the file is for and how it fits into Tide, like a thoughtful teammate would.
- Comment the **why** and the user-facing reason, not the obvious what. No boilerplate ("This function handles…", "Helper for…", "TODO: implement"), no emojis.
- When you fix a bug, leave a short comment at the fix site explaining what used to go wrong, so nobody reintroduces it. For example:

```ts
// The bubble used to live inside the card, and the card clips anything that
// sticks out (overflow: hidden). We now portal it to the nearest overlay
// root, so long lines and big text sizes never get cut off.
```

```ts
// Done tasks stay in the database (their shells live on the shore and the
// patterns still learn from them). We only hide them from the board after a
// day, so the Done column doesn't turn into a wall.
```

- Logs are first person ("I found…", "I changed…"), plain, specific and honest, and they state that the code is AI-generated. Progress reports are in the team's voice ("we") and say the same.

### 1.6 When you may stop

Only if: the environment can't install or run Node; a change would delete or overwrite work the team made by hand; or this document contradicts itself in a way that changes the product and Sections 1–3 don't resolve it. Missing browser tools, missing notification permission or missing devices are **not** blockers. Use tests and the layout audit, and put manual checks in `docs/TEAM_TODO.md`.

### 1.7 Quality bar (same as v2, plus these)

- No fixed heights on anything that contains text. Use `min-height`.
- No `white-space: nowrap` on user-facing text unless the line is guaranteed short (a single number or a one-word label), and even then allow it to shrink.
- Every flex child that contains text has `min-width: 0`.
- Every overlay (bubble, toast, popover, tooltip, sheet, celebration, HUD) uses the z-index scale in Section 5.4.
- Every multi-step flow has Back and Cancel (Section 12).
- Every destructive action has an undo window or a confirmation (Sections 7–9).
- All new strings go in `src/copy/en.ts`, all new times use `now()`, all new colors use tokens, all new database writes go through `src/lib/repo/*`.

---

## 2. The item list, priorities and order

| ID | Priority | Item (team's words → what we build) | Timebox | Section |
|---|---|---|---|---|
| F-01 | P0 | "Bad code in the companion's speech bubble (text covered)" → the bubble always shows its full text, never clipped or covered, at any text size, in any placement | 2–3 h | 5 |
| F-02 | P0 | "Accessibility / responsive problem with 130% text and overlap in Settings" → every screen works at 115%, 130% and 150% text, at 320–1280px, with no overlap, clipping or horizontal scroll | 4–6 h | 6 |
| F-03 | P0 | "Be able to delete tasks" (and edit them) → edit and delete tasks everywhere they appear, with undo and an option to remove history | 2–3 h | 7 |
| F-04 | P0 | "Delete/remove events from the Tide Line" (and edit them) → edit and delete events, including "this one / this and future / all" for repeating events | 2–3 h | 8 |
| F-05 | P0 | "Remove Done tasks after 24 hours (or clear completed)" → Done tasks leave the board after 24 hours (configurable), plus a completed archive and a "Clear done now" button | 1–2 h | 9 |
| F-06 | P1 | "Sound when the focus timer ends" → a reliable end alert (sound, visual, optional notification) that works even when the tab is in the background | 2–3 h | 10 |
| F-07 | P1 | "Sound/nudge to refocus ('Earth calling…')" → an optional, gentle "Earth to {name}" check-in during focus and on returning to the tab | 2 h | 11 |
| F-08 | P1 | "Cancel button in toolkit activities and Back button in check-in" → Back and Cancel in every flow, consistent, keyboard and browser-back aware | 2–3 h | 12 |
| F-09 | P1 | "Focus sounds (white noise, rain, binaural)" → an ambience player in Focus and Toolkit with 9 generated sounds, volume and timer | 2–3 h | 13 |
| F-10 | P2 | "Monthly calendar (today it's only daily)" → month view, any-day view, add/edit events on any date, weekly repeating events | 4–6 h | 14 |
| F-11 | P2 | "Variations of 'Try a new look'" → 7 curated looks with previews, "Surprise me" and "Back to my look" | 1–2 h | 15 |
| F-12 | P2 | "Manually change the time/view on the Shore (Dusk, Dawn, Night, Day, Sunset)" → a time-of-day picker on the Shore | 1 h | 16 |
| F-13 | P2 | "Count back by 7, 6, 5, 4, 3 or 2" → an interactive, configurable count-back tool | 1–1.5 h | 17 |
| F-14 | P3 | "Axolotl's external scales on the Shore" → make sure the axolotl's external details (gills and texture) show on the Shore as they do elsewhere | **hard 30 min** | 18 |
| F-15 | P3 | "Redesign the sand dollar so it looks like one" → a recognizable sand dollar item | **hard 30 min** | 19 |
| F-16 | Skip | "Make the avatars 3D (new branch)" → do not build; write a roadmap note in a separate branch | 20 min (writing only) | 20 |

Cross-cutting work (Section 21: data model v3, settings, copy, demo tour updates, docs) is done inside the items that need it, not as a separate big bang.

---

## 3. Safety net

### 3.1 Before any change (Phase R0)

1. Read `CLAUDE.md`, both earlier specs (skim; you know them), the end of `docs/AI_DEV_LOG.md`, `docs/V1_INVENTORY.md`, `docs/CODE_WALKTHROUGH.md`, `docs/DECISIONS.md` and `docs/TEAM_TODO.md`.
2. `git status`. If there are uncommitted team changes, commit them as `chore: save team changes before v2.1` (never discard them).
3. Make sure you are on `main` (or whatever branch v2 was merged into; if v2 still lives only on `v2-experience`, start from there and note it).
4. Run all checks and record the baseline in the log: test counts per suite, failures, build result, bundle size of `/`.
5. If anything is red at baseline, fix it first in a `fix(base)` commit, because you need green to detect regressions.
6. Tag the baseline: `git tag v2.0-baseline` (if the tag exists, use `v2.0-baseline-2`).
7. Create the work branch: `git checkout -b v2.1-partner-ready`.

### 3.2 Suites that must stay green after every item

- `npm run test` (everything), `npm run test:v1`, and the v2 suites.
- `src/test/frozen-dictation.test.ts` (dictation untouched).
- The demo reference test (every `data-demo-id` used by the demo scripts exists).
- The seed/planted-patterns test (exact keys, unchanged by v2.1).
- If Playwright is available: `e2e/v1-pitch.spec.ts`, `e2e/demo-pitch.spec.ts`, and the new `e2e/layout-audit.spec.ts` (Section 4.3).

### 3.3 Things v2.1 must not change

- The meaning or shape of existing data. All data changes are additive (Dexie version 3, Section 21.1).
- Existing settings keys, copy keys and routes.
- Planted pattern numbers in the seed.
- The dictation code.
- The crisis screen behavior (no companion, no sounds, no nudges, no celebrations there, ever).
- Any companion art except the two timeboxed P3 items, and those only on the Shore and in the item catalog. The partner loves the current designs, so keep them recognizably the same.

### 3.4 Merge at the end

When every item you completed is green and the Definition of Done (Section 24) is checked, merge `v2.1-partner-ready` into `main`, tag `v2.1.0`, and push if a remote is configured and pushing works without prompts. If anything is red, don't merge. Explain exactly what's missing in the final log entry and in `docs/TEAM_TODO.md`.

---

## 4. How to investigate and fix UI bugs

### 4.1 Method

1. **Reproduce in the exact conditions.** Route, viewport width, text scale (1, 1.15, 1.3, 1.5), font setting, bold text, extra spacing, theme, motion level, companion species and size, and data (empty vs seeded demo data).
2. **Measure, don't guess.** Use the layout audit (4.3) and `getBoundingClientRect`, `scrollWidth`/`clientWidth` and `document.elementFromPoint` to prove what's clipped, overflowing or covered.
3. **Find the structural cause.** The usual causes:
   - an ancestor with `overflow: hidden`;
   - a fixed height on a text container;
   - `white-space: nowrap`;
   - flex children without `min-width: 0`;
   - absolute positioning relative to the wrong ancestor;
   - a z-index fighting a sticky element or a portal;
   - viewport units (`vh`) on mobile;
   - sticky panels taking too much height at large text.
4. **Fix the structure, then add a guard:** a unit or component test, an audit rule, or a code comment at the fix site.
5. **Re-run the audit across the whole matrix,** not just the case that was reported.

### 4.2 The test matrix for layout

| Dimension | Values |
|---|---|
| Viewport width | 320, 360, 390, 768, 1024, 1280 (height 800; plus 390×664 for small phones) |
| Text scale | 1, 1.15, 1.3, 1.5 |
| Font | playful, hyperlegible, lexend |
| Bold text | off, on (only at 1.3 and 1.5) |
| Extra spacing | off, on (only at 1.3 and 1.5) |
| Theme | lagoon (light) and midnightTide (dark); ink (high contrast) once |
| Motion | off (for stable screenshots) |
| Data | empty workspace and the demo workspace |

You don't need every combination. Run the full width × text-scale grid with the playful font and Lagoon, then spot-check the other fonts, bold and spacing at 360px and 390px with 1.3 and 1.5.

### 4.3 The layout audit tool

Build `scripts/layout-audit.ts` (a Playwright script) and `e2e/layout-audit.spec.ts` (the same checks as a test), if Playwright and its Chromium can be installed. The full script skeleton is in Appendix B.

**Routes and states to audit:**

- `/`, `/tasks`, `/toolkit`, `/patterns`, `/shore`, `/shore/collection`, `/calendar`, `/companion`, `/wrap` (steps 1, 3, 8, 9, 11)
- `/settings` and every `/settings/[section]`
- `/onboarding` (steps 1, 3, 6, 7, 10)
- `/focus/[taskId]`, `/support`, `/demo`
- **Open sheets** (opened through `data-demo-id` clicks): check-in steps 1–4 and the body path, Unstick steps 1–2, Day Mode, the Bridge sheet, TaskForm, EventForm, the delete confirmation, the ambience panel
- **Companion bubble:** tap the companion in each placement
- **Celebration overlay:** trigger one in the demo workspace with a custom action

**Checks on each state:**

1. **Horizontal page overflow:** `document.documentElement.scrollWidth > window.innerWidth + 1` is a failure.
2. **Clipped text:** for every element with visible text whose computed `overflow-x` or `overflow-y` is `hidden` or `clip`, or which has `text-overflow: ellipsis`: `scrollWidth > clientWidth + 1` or `scrollHeight > clientHeight + 1` is a failure, unless the element has `data-allow-clip` (use that attribute only for decorative cases, and log every use).
3. **Overlap:** collect visible "content boxes" (elements with direct text nodes, plus interactive elements: buttons, links, inputs, `[role=switch]`, `[role=tab]`). For every pair where neither contains the other, if their rectangles intersect by more than 4×4 px, it is a failure, unless one of them (or an ancestor) has `data-overlay` (intended overlays: sheets, bubbles, toasts, badges positioned on icons) and is above the other in stacking order.
4. **Covered text:** for every content box, sample 5 points (center and 4 inset corners). `document.elementFromPoint(x, y)` must return the element itself or a descendant, unless the element is legitimately under an open overlay (in that case, audit the overlay instead).
5. **Offscreen interactive elements:** any interactive element whose rectangle extends beyond the viewport horizontally (after scrolling it into view) is a failure.
6. **Touch targets:** interactive elements smaller than 44×44 CSS px are a warning (not a failure) unless they have `data-small-target-ok` (inline text links, for example).
7. **Text spacing (WCAG 1.4.12):** inject CSS (`* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`) and rerun checks 2–4 on key screens (Today, Check-in steps, Settings sections). Failures here are fixed only if they lose content; minor overlaps of decorative elements can be logged.

**Output:**

- A JSON report: route, state, viewport, settings, check, element selector path, rectangles.
- A screenshot per failing state in `e2e/__audit__/`.
- A summary table in the console.

The test fails if there are any failures not listed in `e2e/layout-audit.allow.json`. That file starts empty; any entry needs a reason, and you must log it.

If Playwright cannot run in this environment, implement the same checks as an in-app dev tool: `/dev/audit` (excluded from production) runs the checks in the current page via a "Run audit" button and prints the report. Use it with a browser tool if you have one. Otherwise, list the manual audit steps for the team in `docs/TEAM_TODO.md`.

---
## 5. F-01 — Companion speech bubble cut off or covered (P0)

### 5.1 What the person experiences

They tap the companion (or the companion speaks after a check-in), and the speech bubble's text is cut off at an edge, hidden behind the top bar, a card, the tab bar or a sheet, or squeezed so that words are missing. It makes the app feel broken, and for someone who relies on the companion's words (especially in Literal mode) it removes information.

### 5.2 Likely causes to check (check all of them)

1. **Clipping ancestors:** the bubble is rendered inside the companion's container, and an ancestor (a card, the TopBar, a sheet header, the shore SVG wrapper, the Today header) has `overflow: hidden` or `overflow: clip`, or the bubble sits inside an SVG `foreignObject`, or inside the SVG itself with a limited `viewBox`.
2. **Stacking:** the bubble's `z-index` is lower than the sticky TopBar, the tab bar, the FAB, the toast layer or a sheet. Or it's in a different stacking context: a parent with `transform`, `filter`, `opacity < 1` or `will-change` creates one, so a high z-index inside it can't escape.
3. **Position:** the bubble is always placed above the companion, but the companion is near the top of the screen (Today header, TopBar head), so the bubble goes off-screen upward. Or it's placed to the right when the companion is at the right edge.
4. **Sizing:** a fixed width or height; `white-space: nowrap`; a `max-height` with `overflow: hidden`; `line-clamp`; or font-size scaling with `textScale` while the bubble's width does not.
5. **Modal focus traps:** inside a Radix Dialog or Sheet, an element portaled to `document.body` sits outside the dialog. Radix makes outside content `pointer-events: none` and may render it behind the overlay. So a "fix" that simply portals to `body` breaks bubbles inside sheets.
6. **Timing:** the bubble auto-hides before longer text can be read, especially at large text sizes or with slow readers ("covered" may also mean "gone too fast").
7. **Tail:** the tail is drawn outside the bubble box and clipped, or the tail points at the wrong place after repositioning.

Reproduce in at least these placements: the TopBar head, the Today header, the check-in sheet header, the Unstick sheet, the Focus page, the Bridge sheet, the Box breathing tool, the Shore (companion near the left edge and near the right edge), wrap-up steps 1 and 13, Companion Studio, toast heads, and empty states. Use widths 320, 390 and 1280, and text scales 1 and 1.5. Use the longest lines: Shelby's "New shells feel strange at first. Then they fit." and the literal-mode lines (for example "Choose why the task is hard. Then I will suggest one first step.").

### 5.3 The fix (implement all of it)

1. **Overlay roots.**
   - Add a top-level overlay container `<div id="tide-overlays" data-overlay-root>` in the app shell, after the main content.
   - Mark every Radix Dialog/Sheet content element with `data-overlay-root` as well.
   - Add a hook `useOverlayRoot(ref)` that returns the closest ancestor with `data-overlay-root` (when the companion is inside a sheet, that's the sheet content), or `#tide-overlays`.
2. **Portal and float.** Render `CompanionSay` through a portal into that overlay root, positioned with **Floating UI** (`@floating-ui/react`, MIT; record it in `AI_ATTRIBUTION.md`):
   - `placement`: preferred `top` for companions in the lower half of the viewport and `bottom` for companions in the upper half; computed from the companion's rectangle at open time.
   - Middleware: `offset(10)`, `flip({ padding: 12 })`, `shift({ padding: 12 })`, `size({ apply({ availableWidth, availableHeight, elements }) { … } })` to cap the width at `min(320px, availableWidth)` and the height at `availableHeight − 12`, and `arrow({ element: tailRef })` for the tail.
   - `whileElementsMounted: autoUpdate`, so the bubble follows scroll, resize, text-scale changes and companion animation (use `ancestorScroll`, `ancestorResize`, `elementResize` and `layoutShift`; animation frame updates are not needed, because the companion's idle bob is small).
   - Use the companion's **body group** bounding box as the reference element, not the whole SVG (the SVG box includes empty space). Expose a `ref` on the body group.
3. **Text box rules:**
   - `white-space: normal`, `overflow-wrap: anywhere`, `hyphens: auto` (with `lang="en"`), no line clamp, no fixed height.
   - Padding 12px 16px, `font-size: calc(var(--fs-body) * 0.95)`, which scales with `textScale`.
   - `max-width` as above, `min-width: 120px`.
   - If the content would be taller than the available height (very rare), the bubble becomes scrollable inside (`overflow-y: auto`, with visible scroll affordance and keyboard focusable). Its text is still complete; nothing is cut.
4. **Layering** (Section 5.4): bubbles use `--z-bubble`, which is above the sticky TopBar, tab bar, FAB and toasts, below sheets' own overlay when the bubble belongs to the page behind, and inside the sheet's layer when it belongs to the sheet (the overlay root handles that).
5. **Stacking contexts:** because the bubble is portaled, transforms on the companion no longer trap it. Remove any `z-index` hacks added earlier for the bubble. Leave a comment at the old site.
6. **Timing:**
   - Visible time = `max(3.5s, words × 0.45s × textScale + 1.5s)`.
   - Hovering, focusing or touching the bubble pauses the timer.
   - Tapping the bubble pins it until it's dismissed.
   - A small close button ("×", `aria-label="Close message"`, 32px visual with a 44px target) appears on pinned bubbles and whenever the user tapped the companion to make it speak.
   - Escape closes. With motion Off, the bubble appears and disappears without animation.
7. **Tail:** the tail is a 12×8 SVG positioned by the arrow middleware, with the bubble's fill and border. It never overlaps the text, because the text padding accounts for it.
8. **One bubble at a time.** A new line replaces the current one (with a 120ms crossfade at Calm/Lively). The queue keeps at most 1 pending line; older pending lines are dropped.
9. **Accessibility:**
   - The bubble has `role="status"` and `aria-live="polite"` while it's auto-shown.
   - When the user taps the companion, focus stays on the companion button and the bubble is linked via `aria-describedby`.
   - Read-aloud (if enabled) still reads the line.
   - In High-contrast themes, the bubble gets a 2px `line` border.
10. **Speech bubble on the Shore:** the shore scene is an SVG. Never render the bubble inside it. Use the same portal approach, with the companion's DOM element (the `<g>` body inside the SVG) as the reference; Floating UI can use SVG elements as references.
11. **Toast heads:** the mini head in toasts never speaks in a bubble (the toast already carries the text). If any code path does that, remove it.

### 5.4 Z-index scale (add to tokens and use everywhere)

```css
--z-base: 0;
--z-raised: 5;      /* cards lifted on press */
--z-sticky: 10;     /* TopBar, sticky headers */
--z-tabbar: 20;
--z-fab: 25;
--z-toast: 30;
--z-bubble: 35;     /* companion speech, coach marks, tooltips */
--z-popover: 40;    /* menus, item detail popovers */
--z-sheet: 50;      /* sheets and dialogs (their own internal overlays stack inside) */
--z-celebration: 60;
--z-demo: 70;       /* demo spotlight, cursor, HUD */
--z-crisis: 90;     /* crisis screen always on top */
```

Search the code for every numeric `z-index` and Tailwind `z-*` class and map each one to this scale. Log the mapping table in `docs/DECISIONS.md`.

### 5.5 Tests and acceptance

- **Component test:** render `CompanionSay` with a long literal line inside a container with `overflow: hidden` and a `transform`. Assert that the bubble is portaled to the overlay root (not a descendant of the container).
- **Component test:** inside a Sheet, the bubble's portal target is the sheet content.
- **Layout audit:** for each placement listed in 5.2, at 320/390/1280 × text scale 1 and 1.5, tap the companion and assert:
  - the bubble's rectangle is fully inside the viewport;
  - `elementFromPoint` at the bubble's text center and 4 inset corners returns the bubble;
  - the bubble text's `scrollHeight` ≤ `clientHeight` + 1 (or the bubble is the scrollable fallback and has focusable scrolling).
- **Manual check (TEAM_TODO):** tap the companion on a real phone at 130% text, in Today and on the Shore.

**Acceptance:** in every placement, at every tested width and text scale, the full line is readable, never covered, and stays long enough to read.

---

## 6. F-02 — Large text and responsive layout; Settings overlap (P0)

### 6.1 What the person experiences

With text at 130% (and likely at 150%, with bold text, extra spacing, Lexend, or on narrow phones), parts of the interface overlap. Settings rows run into each other, labels collide with switches, text is cut off, and some screens scroll sideways. For an app built for accessibility and neurodiversity, this is a serious contradiction. WCAG 1.4.4 (Resize text) and 1.4.10 (Reflow) expect content to remain usable when text is enlarged and at narrow widths.

### 6.2 Structural rules (apply across the whole app)

1. **Units:**
   - All font sizes come from the type scale variables, which multiply by `--text-scale`.
   - Spacing that sits next to text (padding inside buttons, chips and rows) uses `em` or `rem`, so it grows with the text.
   - Structural gaps (screen gutters, gaps between cards) stay in `px`.
2. **No fixed heights on text containers:**
   - Replace `h-*` with `min-h-*` on buttons, rows, chips, tabs, cards, list items, inputs, the TopBar, the tab bar, toasts and bubbles.
   - Fixed sizes remain only for icons, avatars, the companion SVG box, progress bars and decorative shapes.
3. **Wrapping:**
   - Remove `whitespace-nowrap` and `truncate` from user-facing text, except numbers, single-word labels and dates in dense tables (and there, allow shrink with `min-width: 0`).
   - Wherever truncation is truly needed (long task titles in a compact list), use 2-line clamp with full text available on focus/hover (`title`) and in the detail view, and mark it `data-allow-clip`.
4. **Flex hygiene:** every flex child with text gets `min-w-0`. Rows that hold a label and a control get `flex-wrap: wrap` and `gap`, so the control drops under the label when space runs out.
5. **Container queries for adaptive layout.**
   - Use CSS container queries (`container-type: inline-size` on cards, rows, sheets and settings sections) with **em-based** breakpoints, so layouts adapt to the text size, not only to the screen width. For example, a setting row stacks when `@container (max-width: 26em)`.
   - Because the container's `em` grows with the text scale, the row stacks earlier at 130%.
   - Use Tailwind's container query support if the installed version has it (`@container` variants); otherwise write plain CSS in a module.
6. **Viewport units:** use `dvh` and `svh` instead of `vh` for full-height layouts and sheets, so mobile browser bars don't hide content.
7. **Sheets:**
   - `max-height: 92dvh`, with an internal scroll area (`overflow-y: auto`, `overscroll-behavior: contain`).
   - Sticky footer buttons sit inside the sheet, and the scroll area has `padding-bottom` equal to the footer's height plus 16px, so the last item is never hidden behind the footer.
   - The drag handle area stays fixed.
8. **Sticky elements:** at text scales ≥ 1.3, or when the viewport height is below 700px, any sticky panel that is not the TopBar or tab bar becomes non-sticky. This includes Settings' Live Preview, the Demo HUD's expanded mode and sticky sheet headers. Sticky panels took a big share of the screen and were a likely cause of the Settings overlap.
9. **Grids:** use `grid-template-columns: repeat(auto-fill, minmax(min(100%, 14em), 1fr))` for tile grids (quick actions, settings sections, theme cards, strategy cards, collection), so tiles wrap to fewer columns as the text grows.
10. **Icons beside text:** icons have `flex-shrink: 0` and a size in `em` (1.25em), so they scale with the text but never squeeze it.

### 6.3 Component-by-component fixes (check each one)

| Component | What to change |
|---|---|
| Button (3D) | `min-height` instead of `height`; padding in em; the label wraps to 2 lines centered; the ledge stays attached (`box-shadow` doesn't depend on height); full-width buttons in narrow containers |
| SegmentedControl | Measure with a `ResizeObserver`. If any label overflows its segment, switch to a vertical radio list with the same semantics (`role="radiogroup"`). Never squeeze labels |
| Switch rows (Settings) | Label + help text on the left, switch on the right; at narrow container widths (`@container (max-width: 26em)`) the switch moves under the label, aligned left; the whole row is clickable through the `label` element |
| Slider rows | Label above the slider at any size; the value text sits after the label, not at the slider's end |
| Chips | Wrap; `min-height` 2.5em; labels can wrap to 2 lines |
| Tab bar | `min-height` instead of height; labels can wrap to 2 lines and stay centered; icons shrink from 24px to 20px at text scale ≥ 1.3; bottom safe-area padding kept; the content area's bottom padding equals the tab bar's measured height (with a `ResizeObserver` writing `--tabbar-h`), so nothing hides behind it |
| FAB | The label moves inside a pill above the tab bar at text scale ≥ 1.3, instead of under the circle where it collided with tab labels |
| TopBar | The title can wrap to 2 lines; the companion head and menu stay fixed size; at ≥ 1.3 the companion head hides when the title would wrap to 3 lines |
| Settings index | Presets row scrolls horizontally with visible snap points and arrow buttons (on desktop), and shows a "See all" link at large text; the sections grid uses the auto-fill rule; the search field is full width |
| Settings section | Live Preview collapses by default at ≥ 1.3 and is never sticky then; rows follow the switch, slider and segmented rules; "Reset this section" at the bottom with spacing |
| Theme cards | Auto-fill grid; card text wraps; previews keep their aspect ratio |
| Cards with titles + badges | Titles wrap; badges move under the title in narrow containers |
| Task cards | Title wraps to 3 lines max in lists (clamp with full text in the edit sheet); meta row (type, energy, due) wraps |
| Tide Line | The time column has a fixed width in em (5em); event titles wrap; the "Now" marker label never overlaps items (it gets its own row) |
| Check-in candidates | The definition text wraps; the check circle stays top-right; the card grows |
| Mood map | Size is `min(100%, 20em)`; quadrant labels shrink to the caption size and move outside the map at narrow widths; a "Use sliders instead" link is always visible |
| Focus page | Timer digits use `clamp()` so they never overflow; companion size steps down at ≥ 1.3 on narrow screens; controls stack |
| Bridge sheet | The three steps stack; the countdown sits on its own line at ≥ 1.3 |
| Patterns | Pattern cards and the evidence list wrap; the period dots grid scrolls horizontally inside its own container if needed (never the page) |
| Shore | The scene keeps its aspect; range chips wrap; buttons below stack |
| Wrap-up | Option cards wrap; tide chart labels shrink to the caption size; the "Show as list" link is always present |
| Toasts | `max-width: min(36em, 100vw − 32px)`; wrap; position above the tab bar using `--tabbar-h` |
| Bubbles | F-01 |
| Dialogs | Button rows wrap and stack, primary last in DOM order but first visually on mobile |
| Demo HUD | Captions wrap to 3 lines max with the full text available to screen readers; controls collapse into "⋯" at ≥ 1.3 |

### 6.4 Text scale and browser zoom together

Some people use the browser's zoom or the OS text size in addition to Tide's text size. Test the 1280px layout at 200% browser zoom (equivalent to a 640px CSS viewport at device scale 2 in Playwright) and at Tide 1.3. Nothing may overlap, and there may be no horizontal page scroll.

### 6.5 A "Text size" preview helper in Settings

Next to the text size control, show a small live sample (a task card and a switch row) that updates instantly. Add a note: "Tide adjusts its layout as text gets bigger. If something looks wrong, tell us." That line can link to a "Report a layout problem" action, which copies a short diagnostic (route, viewport, text scale, font) to the clipboard for the team. No network call.

### 6.6 Tests and acceptance

- Layout audit (Section 4.3) over the matrix in 4.2: **zero failures**.
- Component tests:
  - SegmentedControl switches to the vertical list when labels overflow (mock `ResizeObserver` measurements);
  - the setting row stacks under a narrow container (assert the class or data attribute set by the container-query fallback, if one is used).
- Manual (TEAM_TODO): check Settings, Check-in and Today on a real iPhone and a real Android phone at the OS's largest standard text size plus Tide 1.3.

**Acceptance:** at text scale 1.3 and 1.5, on 320–1280px widths, no overlapping, clipped or covered text anywhere, no horizontal page scroll, and Settings is fully usable.

---

## 7. F-03 — Edit and delete tasks (P0)

### 7.1 What the person experiences

They can't remove a task they added by mistake, a task that no longer matters, or a duplicate, and they can't fix a typo. The board fills with things that make them anxious. For ADHD and autistic users, visual clutter and "stuck" items are a common source of overwhelm.

### 7.2 Where editing and deleting must be available

- **Task card "⋯" menu** (Tasks board, all columns, including Someday and the Completed archive): "Edit", "Move to…" (existing), "Delete".
- **Tide Line task items** on Today and on calendar day views: tapping the task opens the **Task detail sheet**.
- **Task detail sheet** (new; also opens when tapping a task card's title): title, type, energy, due date, status, first step, parking note, and buttons "Edit", "Focus", "Delete".
- **Keyboard:**
  - with a task card focused, `E` edits and `Delete`/`Backspace` opens delete (only when shortcuts are on and focus isn't in a text field);
  - the "⋯" menu is always keyboard reachable.
- **Swipe (optional, mobile only):** swipe left on a task card reveals "Delete" and "Edit" buttons. This is a nice-to-have **inside** F-03. The menu remains the accessible path; skip the swipe if it causes any gesture conflicts with drag-and-drop.

### 7.3 Edit

Reuse `TaskForm` in edit mode (title "Edit task"), prefilled:

- Fields: title, type, energy, due date (with a "No due date" option), and an optional "First step" text field.
- The status can be changed from the detail sheet's "Move to…".
- "Save" updates the task in place (`updatedAt`). Changing the type or energy doesn't touch past focus blocks or wins.
- Validation: title 1–120 characters (trimmed). Inline errors are written in neutral language ("Add a few words so you can recognize it").
- Cancel and Back follow Section 12 (confirm only if something changed).

### 7.4 Delete

- Choosing "Delete" opens a small confirm dialog:
  - Title: "Delete "{title}"?"
  - Body: "It will disappear from your board and your day."
  - Checkbox, unchecked by default: "Also remove what washed up on my shore and its history in my patterns".
  - Buttons: "Delete" (primary uses the `notice` style, never red) and "Keep it".
- **Default delete (box unchecked)** is a **soft delete**:
  - set `deletedAt = now()`;
  - the task disappears everywhere (board, Today, Tide Line, Day Mode, wrap-up loose ends, the anchor/morning card, the Focus picker, search);
  - its past focus blocks, strategy uses and wins stay, so the shore keeps its shells and patterns keep learning. A win's text already contains the title, so nothing shows as "missing".
- **Delete with history (box checked)** is a soft delete first, with `purgeRequested = true`. After the undo window ends, it runs `purgeTaskCascade(id)` in one Dexie transaction:
  - delete the task;
  - delete focus blocks with that `taskId`;
  - for strategy uses with that `taskId`: clear `taskId` (keep the strategy history itself, since it's about the strategy, not the task);
  - for transitions with `fromTaskId` = id: clear the field;
  - delete wins whose `refId` = id (their shore items disappear);
  - remove the id from DayPlans' `keptTaskIds`/`movedTaskIds`, DayWraps' `carryover` and `anchorTaskId`.
- **Undo:** a toast "Task deleted" with "Undo" for 10 seconds. Undo clears `deletedAt` and `purgeRequested`. If the app closes before the window ends, the purge runs at next boot (`runPendingPurges()` in the app shell, after the database opens) for tasks with `purgeRequested` and `deletedAt` older than 10 seconds.
- **Deleting a task that's currently in a running focus block:** the confirmation adds the line "This will also end the focus timer." On confirm, end the block without an outcome prompt.
- **Deleting today's anchor task:** the morning card disappears for today, and the anchor is cleared.
- **Bulk delete** in the Completed archive (Section 9): "Select" mode with checkboxes, then "Delete selected" (same dialog, plural).

### 7.5 Reads must exclude deleted tasks

- Create `src/lib/repo/taskQueries.ts` with `activeTasks()`, `tasksByStatus(status)`, `tasksDueOn(date)`, `getTask(id, { includeDeleted })` and so on. All filter out `deletedAt`.
- Search the code for every read of `db.tasks` (including inside `useLiveQuery`) and route it through these helpers.
- The **pattern engine** receives all tasks, including soft-deleted ones (to look up the types of past focus blocks), but never shows a deleted task's title in new UI. Evidence rows show the title saved in the focus block or win if available; otherwise "a deleted task".
- Add a guard test that fails if `db.tasks` is read outside `src/lib/repo/`. A static search is fine; allow the test file itself.

### 7.6 Data

`Task` gets optional `deletedAt?: number`, `purgeRequested?: boolean` and `updatedAt?: number` (Dexie version 3, Section 21.1). Exported data includes deleted tasks with their flag, so a backup is complete. Settings → Privacy & data gets "Permanently remove deleted tasks" (purges every soft-deleted task, with history kept or removed per a checkbox, after confirmation).

### 7.7 Demo tour

Add a small step to the full tour's Chapter 4 (before Stuck): open the "⋯" menu on "Reply to group project chat" → Edit → change the title to "Reply to group chat about slides" → Save. Then open the menu on "Laundry" → Delete → keep the box unchecked → Delete → the Undo toast appears. Caption: "Tasks can be edited or deleted anytime, with an undo." Add the needed `data-demo-id`s and keep the tour's total time within +15 seconds. Do not change the pitch cut.

### 7.8 Tests and acceptance

- **Repo tests:** soft delete hides the task from every query; undo restores it; purge cascade removes the right records and nothing else; pending purges run at boot; deleting a task in a running focus block ends the block.
- **Flow tests:** edit a task from the board menu, the change appears on Today; delete with undo; delete with history, after the window the shore item is gone.
- **Guard test:** no direct `db.tasks` reads outside repo.
- **Layout audit:** the TaskForm (edit mode), the detail sheet and the delete dialog at 1.3 and 1.5.

**Acceptance:** any task can be edited or deleted from the board, Today and calendar views, with undo, without breaking patterns, the shore or the demo.

---
## 8. F-04 — Edit and delete events in the Tide Line, including repeating events (P0)

### 8.1 What the person experiences

They added an event with the wrong time, or a class was cancelled, and they can't change or remove it. It sits in the Tide Line and keeps triggering a Bridge card for a switch that won't happen, which is confusing and stressful.

### 8.2 Event detail sheet

Tapping an event block in the Tide Line (Today and calendar day views), the "Next" transition card, or a calendar event chip opens the **Event detail sheet**:

- Title (H2), kind (icon + label), date, time range ("4:50–6:20 pm"), place, and prep items.
- If the event belongs to a series: "Repeats every Tue and Thu until Dec 11".
- Buttons: "Edit", "Delete", "Get ready" (only if it starts within the transition lead time), and "Close".

### 8.3 Edit

`EventForm` (v1's Add Event sheet, extended) in edit mode:

- Title, kind, date, start, end, place, prep items (up to 5).
- For new events only (and for "This and future" edits): **Repeat**: "Doesn't repeat" / "Every week on…" (weekday chips, multi-select, defaulting to the event's weekday) with "Until" (a date, default 8 weeks later, maximum 26 weeks). Repetition is part of F-10, but the form fields live here so editing works with series from the start. If F-10 isn't reached, hide the Repeat field and keep series editing for existing series only.
- Validation:
  - end after start; title 1–80 characters;
  - start and end on the same day (an overnight event shows "Events can't cross midnight yet. Split it into two." This is a known limitation, logged).
- **Editing an event in a series** asks: "Change only this event" / "This and future events" / "All events in the series".
  - **Only this:** sets `detached = true` on that instance and applies the changes.
  - **This and future:** applies the changes to every non-detached instance with the same `seriesId` and `start ≥ this.start`. If the time of day changes, shift each instance's time on its own date. If the weekdays change, regenerate the future instances: delete the old future non-detached ones (soft) and create new ones under a **new** `seriesId` from this date.
  - **All:** applies to every non-detached instance, past ones included. Past instances' times are only changed if the user confirms "Also change past events?" (default no, because past transitions refer to them).
- Saving updates the Tide Line and the Bridge immediately. If the edited event is the upcoming transition target and a Bridge card is showing, it updates (or disappears if the event moved outside the lead time).

### 8.4 Delete

- **Single event:** a confirm dialog, "Delete "{title}" on {date}?", with "Delete" / "Keep it". Soft delete (`deletedAt`) with a 10-second Undo toast "Event deleted".
- **Series instance:** "Delete only this event" / "This and future events" / "All events in the series" / "Keep it". Each option soft-deletes the matching non-detached instances (detached instances are only included with "All"). One Undo restores the whole batch.
- **Effects:**
  - a deleted event never triggers a Bridge, never appears in the Tide Line, the calendar, wrap-up "Tomorrow", or the morning card's first switch;
  - past Transitions that referenced it keep their record (patterns use the event kind, which stays in the soft-deleted event);
  - if a Bridge sheet is open for an event that gets deleted, close it with the toast "That event was deleted.";
  - if the event was already rated, its sea glass stays on the shore.
- "Permanently remove deleted events" lives in Settings → Privacy & data (purges soft-deleted events not referenced by any Transition; referenced ones are kept as anonymized stubs: title "Deleted event", kind kept).

### 8.5 Series for existing data

The seed (and any events the team created) are separate weekly instances without a series. The Dexie version 3 upgrade (Section 21.1) groups existing events into series:

- Events with the same `title`, `kind`, weekday, start time and duration, recurring at weekly intervals, form one series.
- `seriesId` = a stable hash of `title|kind|HH:MM|duration`, plus a weekday-set suffix when the same title appears on several weekdays at the same time. For example, Physics on Mon/Wed/Fri at 9:00 is one series, with `repeat.days = [1,3,5]`.
- The series metadata goes in a new `eventSeries` table: `{ id, title, kind, days, startHHMM, endHHMM, place, prep, until }`.
- With this, "delete all Physics events" works on the demo data. Test the grouping on the seed: Physics, Programming, Part-time job, Chemistry lab, Calculus and Groceries each become one series with the right days.

### 8.6 Data

`CalendarEvent` gets optional `deletedAt`, `seriesId`, `detached` and `updatedAt`. New table `eventSeries`. Repo helpers in `src/lib/repo/eventQueries.ts`: `activeEvents(range)`, `eventsOn(date)`, `getEvent(id, { includeDeleted })`. Add a guard test: no direct `db.events` reads outside repo.

### 8.7 Tests and acceptance

- **Repo tests:**
  - single edit and delete with undo;
  - series operations (only this / this and future / all) for both edit and delete;
  - weekday change creates a new series;
  - detached instances are respected;
  - deleted events never reach `getUpcomingTransition`;
  - the seed grouping produces the expected series.
- **Flow tests:**
  - tap an event in the Tide Line, edit its time, and the Tide Line updates;
  - delete "Calculus" on demo day ("only this"), and no Bridge card appears at 4:41 pm;
  - Undo restores it, and the card appears again.
- **Demo:** the full tour and the pitch cut still work. They never delete Calculus, but run them to be sure.

**Acceptance:** any event, single or repeating, can be edited or deleted (one, future, or all) from the Tide Line and the event detail sheet, with undo, and the Bridge always reflects reality.

---

## 9. F-05 — Done tasks clear themselves from the board after 24 hours (P0)

### 9.1 What the person experiences

Finished tasks pile up in Done, especially with demo data, so the board looks chaotic, and judges trying the app on their review day will see a wall of old tasks.

### 9.2 Behavior

- **New setting** `tasks.doneVisibleFor`: `24h` (default), `3d`, `7d` or `forever` (Settings → Day & planning → "Show finished tasks on the board for").
- The **Done column** shows only tasks whose `doneAt ≥ now() − window`.
  - At the bottom of the column, a link: "Completed earlier ({n})". It opens the **Completed archive** (`/tasks/completed`).
  - When the column is empty but the archive isn't: "Nothing finished in the last day. See everything you've finished →".
- **Today's Tide Line** shows tasks done **today** only. Tasks finished on earlier days never appear on Today.
- **"Clear done now"** button in the Done column header ("Clear" with a broom icon and a visible label). It hides every task in Done from the board right away by setting `clearedAt = now()` on them, with a 10-second Undo. Cleared tasks go to the archive. This doesn't delete anything.
- **Completed archive** (`/tasks/completed`):
  - a list grouped by day ("Today", "Yesterday", "Mon, Nov 2", …) with each task's title, type icon and time finished;
  - a small shell icon linking to its shore item if it exists;
  - actions per task: "Move back to In progress", "Delete" (F-03);
  - a "Select" mode for bulk delete;
  - a search field;
  - an empty state with the companion: "Finished tasks will rest here.";
  - Back button to Tasks.
- **Optional permanent cleanup:** `tasks.autoDeleteCompletedAfter`: `never` (default) or `30d`. When `30d`, at boot and once a day, soft-delete (then purge, keeping history and wins) tasks with `doneAt` older than 30 days. The settings text explains: "Their shells stay on your shore. Only the task entries are removed."
- **Moving a task back** out of Done clears `doneAt` and `clearedAt`, as v1 does for `doneAt`. Never remove the win that was created when it was done; v1 never removed wins.

### 9.3 Consistency rules

- Counts in the segmented control ("Done (n)") count only the visible tasks.
- The Day Mode, wrap-up, Focus picker and calendar never list done tasks, except in the calendar day view's "Finished that day" section.
- Patterns and the shore are unaffected (they read focus blocks and wins).
- Demo workspace: with the demo clock on Thu Nov 5 at 3:40 pm, only tasks done since Wed Nov 4 at 3:40 pm show in Done. The tour stays clean.

### 9.4 Data

`Task` gets optional `clearedAt` (version 3). The visibility rule lives in one function, `isVisibleInDone(task, now, setting)`, in `taskQueries.ts`, with unit tests for each window and for `clearedAt`.

### 9.5 Acceptance

With seed data, the Done column shows only recent tasks; the archive lists the rest; "Clear done now" and Undo work; Today never shows old done tasks; all tests pass.

---

## 10. F-06 — Focus timer end alert (P1)

### 10.1 What the person experiences

When the focus block ends, nothing tells them, especially if their eyes are on paper, another app or another tab. Auditory and visual end signals are central to time-timer and Pomodoro-style techniques for ADHD. In v2, the end sound only plays if global sound is enabled, which is off by default, so most people get silence.

### 10.2 Design

A focus end alert is an **alarm the person opted into by starting a timer**. It is separate from decorative UI sounds. New settings (Settings → Focus → "When the timer ends"):

| Key | Values | Default | Notes |
|---|---|---|---|
| `focus.endAlert` | `sound_visual`, `visual`, `off` | `sound_visual` (Low sensory preset: `visual`) | Plays even if `sound.enabled` is false; the settings text explains why |
| `focus.endSound` | `chime`, `bell`, `marimba`, `waves`, `rise` | `chime` | Recipes in Appendix C. `rise` starts very quietly and grows over 6 seconds, the gentlest option |
| `focus.alertVolume` | 0.1–1 | 0.6 | With a "Test sound" button |
| `focus.alertRepeat` | `once`, `gentle_repeat` | `once` | `gentle_repeat` plays up to 3 times, 20 seconds apart, until acknowledged |
| `focus.vibrateAtEnd` | boolean | true where supported | Pattern [200, 100, 200] |
| `focus.notifyAtEnd` | boolean | false | Requests notification permission when turned on |
| `focus.titleCountdown` | boolean | true | Shows "9:41 · Lab report · Tide" in the browser tab while running |

The Low sensory preset sets `focus.endAlert = 'visual'` and the sound to `rise` (in case they enable sound later). The Playful preset sets `marimba`. Update the preset definitions; presets still only change their listed keys.

### 10.3 Making it reliable

Browsers throttle timers in background tabs. A `setTimeout` firing at the end time can be late by up to a minute after a tab has been hidden for a while, and mobile browsers may suspend pages. So:

1. **Unlock audio on Start.** The "Start" button press is a user gesture. In that handler, create or resume the sound engine's `AudioContext`, so audio is allowed later.
2. **Schedule the sound on the audio clock.** At start (and on every resume), schedule the end sound with Web Audio at `ctx.currentTime + remainingSeconds`, using oscillators or buffer sources with a `start(when)` time. The audio rendering thread plays scheduled sounds on time even when JavaScript timers are throttled. On pause, cancel the scheduled nodes (`stop()` them and disconnect); on resume, schedule again.
3. **Also keep the JavaScript path.** When the end is detected (timestamp check via `now()`, on a 1-second interval and on `visibilitychange`), show the visual alert and the outcome sheet. If the scheduled sound didn't play (because the context was suspended), play it now.
4. **Visual alert:**
   - The water fill completes, and a soft full-screen glow pulses twice (opacity 0 → 0.35 → 0 over 1.2 seconds per pulse, `primary` color; never flashing or strobing, and never faster than 1 Hz).
   - The companion looks `proud` (or `soft` if the latest check-in was Ebb).
   - The heading "Time's up" appears. At motion Off, there's no pulse, just the heading and a static highlight border.
   - When the page is hidden, the document title becomes "Time's up · Tide", alternating with the task title every 2 seconds at most (stop alternating at motion Off), and the favicon switches to a "done" variant (a simple SVG favicon with a dot). Both revert when the page is visible again.
5. **Notification (opt-in):**
   - When `focus.notifyAtEnd` is on and permission is granted, schedule a check at the end time.
   - At the end, if the page is hidden, show a notification: title "Time's up", body "{task title}: how did it go?", tag `tide-focus`.
   - Use `ServiceWorkerRegistration.showNotification` if a service worker is registered (required on Android Chrome), otherwise `new Notification`.
   - Clicking it focuses the app and opens the outcome sheet.
   - The notification may arrive late in deeply throttled tabs (up to about a minute). The settings help text says so honestly.
   - On iOS, notifications work only when Tide is installed to the home screen. Show that note under the toggle.
6. **Screen wake lock** (from v2) stays on during focus when enabled, which also keeps audio alive on phones.
7. **Acknowledgment:** the alert stops (and `gentle_repeat` stops) when the user taps anything on the outcome sheet, presses a key, or returns to the tab and interacts. `gentle_repeat` never runs more than 3 times.
8. **Never during crisis/support screens**, and never if the person ended the block early ("I'm done early" and "End" don't play the alert).

### 10.4 Pre-end warning (small addition)

Add the optional `focus.warnBeforeEnd`: `off` (default) / `1 min` / `2 min`. It gives a very soft single tone (or a visual-only cue at `visual`) before the end: "One minute left." Many people with ADHD like a heads-up before a transition.

### 10.5 Tests and acceptance

- **Unit:**
  - scheduling math (remaining time after pause and resume);
  - the alert plays when global sound is off but `focus.endAlert = 'sound_visual'`;
  - no alert on early end;
  - `gentle_repeat` caps at 3;
  - the title and favicon revert.
- **Mock AudioContext:** the scheduled `start(when)` is called with the right time at start and after resume; scheduled nodes are stopped on pause.
- **Flow:** a 5-minute block with the fake clock, hide the page (mock `visibilityState`), advance time, return; the outcome sheet shows, and the alert was triggered once.
- **Manual (TEAM_TODO):**
  - start a 5-minute block, switch to another app or tab, and confirm you hear it on a laptop (Chrome and Edge) and on a phone with Tide in front;
  - test the notification with permission on a laptop and on an installed PWA on Android.

**Acceptance:** with default settings, the end of a focus block is always signaled audibly and visually when the app is in front, audibly on desktop when it's in a background tab, and optionally by notification.

---

## 11. F-07 — Refocus nudge "Earth to {name}" (P1)

### 11.1 What the person experiences

During a focus block, their attention drifts (to the phone, another tab, a daydream), and nothing gently brings them back. The team calls it "Tierra llamando a…" ("Earth to…"). It must be **optional and easy to switch off**, because unexpected sounds can be overwhelming for people with auditory hypersensitivity, which is common in autism.

### 11.2 Settings (Settings → Focus → "Refocus nudges")

| Key | Values | Default |
|---|---|---|
| `focus.refocusNudge` | `off`, `visual`, `visual_sound` | `off` |
| `focus.nudgeEvery` | 5, 10, 15, 20 minutes | 10 |
| `focus.nudgeOnReturn` | boolean | true (only matters when nudges aren't off) |
| `focus.nudgeHiddenAfter` | `off`, 1, 2, 5 minutes | 2 |

The Focus page also has a quick toggle in its "⋯" menu: "Nudges: Off / Visual / Visual + sound". Changing it there updates the setting. The first time someone starts a focus block of 15 minutes or longer, show a one-time coach mark next to the menu: "Want a gentle 'Earth to {name}' check-in now and then? You can turn it on here." It is dismissible and never shown again.

### 11.3 Three kinds of nudge

1. **Interval check-in** (every `nudgeEvery` minutes during a running block, not in the first or last 2 minutes):
   - A small card slides up from the bottom of the Focus page (no full-screen interruption), with the companion peeking in.
   - Copy (Gentle): "Earth to {name}! Still on {task}?" Direct: "Still on {task}?" Literal: "Are you still working on {task}?" Without a name: "Earth to you! Still on {task}?"
   - Buttons:
     - "Yes, still on it": dismisses, with a tiny `happy` reaction;
     - "I drifted": shows the first step again with "Pick up from here" and, if a parking note exists, "You were at: {note}";
     - "Take a 2-minute break": pauses the timer, shows a 2-minute break countdown with a suggested Move strategy, then "Back to it";
     - "Stop nudges for this block".
   - With `visual_sound`, it plays the `nudge` sound (Appendix C): two soft rising notes, quiet, never repeated.
   - If not answered within 60 seconds, the card shrinks to a small pill "Still on it?" and stays until tapped. No sound repeats.
2. **Hidden-tab nudge:** if the page is hidden for `nudgeHiddenAfter` minutes during a running block, and `visual_sound` is on, play the nudge sound once (scheduled on the audio clock at the moment the page became hidden plus that delay, then cancelled if the page becomes visible first). If notification permission is granted and `focus.notifyAtEnd` is on, also send a notification: "Earth to {name}: your focus block on {task} is still running." At most once per block.
3. **Return nudge:** when the page becomes visible again after being hidden for 30 seconds or more during a block (and `nudgeOnReturn` is on), show the same small card with "Welcome back! Still on {task}?" and the same buttons. No sound on return; they're already here.

### 11.4 Tone and limits

- Never shame and never count drifts in a visible way. No "you got distracted 4 times". Drifting is normal.
- At most one nudge per 5 minutes of any kind; at most 6 per block.
- Nudges never appear during the first 2 minutes or the last 2 minutes, or while the outcome sheet or any other sheet is open.
- No nudges in the demo workspace autoplay, unless the director's custom action triggers one on purpose (Section 21.4).
- At motion Off, the card appears without sliding, and the companion is static.

### 11.5 Data (for patterns later; additive)

`FocusBlock` gets optional `nudgesShown`, `driftsReported` (the number of "I drifted" taps), `hiddenMs` (total hidden time) and `breaks` (number of 2-minute breaks). The pattern engine does **not** use these in v2.1. Note the idea in `docs/DECISIONS.md` as possible future work ("blocks with a 10-minute nudge more often end with 'Got going'"), and don't build it now.

### 11.6 Tests and acceptance

- **Unit:**
  - the scheduler respects the interval, the edges (first/last 2 minutes), the caps and the 5-minute spacing;
  - the hidden-tab schedule is cancelled on return;
  - "Stop nudges for this block" works;
  - settings `off` produces nothing.
- **Flow:** a 25-minute block with the fake clock and `nudgeEvery = 10`. A nudge appears at 10:00 and 20:00, not at 0–2 or 23–25 minutes. "I drifted" shows the first step; "Take a 2-minute break" pauses and resumes.
- **Copy test:** literal and direct variants exist; no forbidden words ("distracted", "lost focus", "failed", "again?").

**Acceptance:** with nudges on, the person gets gentle, optional, well-timed "Earth to {name}" check-ins and a welcome-back prompt; with nudges off (the default), nothing changes from v2.

---
## 12. F-08 — Back and Cancel everywhere (P1)

### 12.1 What the person experiences

In a toolkit activity there's no way out except finishing it. In the check-in, they can't go back a step to change what they picked. Feeling trapped in a flow is especially uncomfortable during emotional regulation, and it raises cognitive load and anxiety.

### 12.2 The navigation contract (applies to every flow)

1. **Every multi-step flow has a Back control** on every step after the first. Back returns to the previous step **with all entered data preserved** (text, selections, map position).
2. **Every flow and activity has a Cancel/Close control** (top-left "×" with a visible label "Cancel" on wide screens, and `aria-label="Cancel"` always) that leaves the flow.
3. **Confirmation only when meaningful input would be lost.** Leaving after typing text or making selections asks "Leave without saving?" with "Keep going" and "Leave". Leaving with nothing entered never asks.
4. **Escape** does the same as Cancel (with the same confirmation rule). **Browser or Android back** closes the top-most sheet or overlay instead of leaving the page (12.4).
5. **Cancel never punishes.** Cancelling a toolkit activity doesn't ask for a re-check, and never shows a "you didn't finish" message.
6. **Consistent placement:** Back at the bottom left (secondary button) next to the primary Next at the bottom right, and Cancel "×" at the top left. Sheets also keep their drag-to-dismiss, which follows the same confirmation rule.

### 12.3 Flow-by-flow requirements (audit and fix each)

| Flow | Back | Cancel | Notes |
|---|---|---|---|
| Check-in (steps 1–4) | Steps 2, 3, 4 → previous step, data kept. Body path → Step 1 (text kept) | "×" top-left on all steps | Back from step 2 to step 1 keeps the AI candidates cached for the same text, so going forward again doesn't re-call the AI unless the text changed |
| Check-in "None of these" list | Back to the candidates | Same | |
| Unstick (2 steps) | Step 2 → Step 1 (keeps the reason, so the person can pick another) | "×" | Choosing a new reason calls unstick again |
| Day Mode sheet | Proposal → mode choice | "×" ("Keep my day as it is" stays) | |
| Bridge sheet | — (single page) | "×" plus a "Skip this switch" link that closes without saving a Transition | Parking note text is kept if they reopen the bridge within the same event window |
| Focus page | — | "End" (existing) asks "End the focus block?" only if more than 1 minute has passed; the outcome sheet appears only for "I'm done early", not for "End" | v1/v2 behavior preserved for "I'm done early" |
| Toolkit runner (all tools) | — | **New:** "×" Cancel top-left and an "End early" secondary button for timed tools | See 12.5 |
| Grounding 5-4-3-2-1 | Previous sense card | "×" | |
| Sudoku | — | "×" (progress discarded, no confirmation; it's a calm puzzle) | |
| Brain dump | — | "×" asks only if lines were typed; offers "Save as tasks" in the confirmation | |
| Message template | — | "×" | |
| Re-check prompt | — | "Skip" (existing) | |
| Wrap-up | Back on every step (existing; verify that data is kept) | "×" (existing) saves progress for resume | Verify |
| Onboarding | Back (existing; verify) | "Skip setup" (existing) | Verify |
| Companion Studio | — | "×" Close (saved changes stay) | |
| Settings section | Header back arrow to the Settings index (also browser back) | — | |
| Calendar day view, Completed archive, Shore collection | Header back arrow | — | |
| TaskForm / EventForm | — | "Cancel" (confirm if changed) | |
| Delete dialogs | — | "Keep it" | |
| Demo | Previous (←) | Exit (Esc) | Existing |

### 12.4 Browser and Android back

- Implement `useBackToClose(open: boolean, onClose: () => void, id: string)`:
  - when a sheet or overlay opens, push a history entry (`window.history.pushState({ tideOverlay: id }, '')`, same URL);
  - on `popstate`, if the top overlay's id matches, call `onClose` (with the confirmation rule; if the user then chooses "Keep going", push the state again);
  - when the overlay closes by other means, remove its entry with `history.back()` only if the current state is that overlay's entry.
- Apply it to the check-in sheet, Unstick, Day Mode, Bridge, TaskForm, EventForm, the task and event detail sheets, the delete dialogs, the item details popover on the Shore, the bottle sheet and the ambience panel.
- **Test carefully with the Next.js App Router.** Pushing same-URL states must not trigger route changes. If the router reacts badly in any case, use the router's own navigation-safe approach for that overlay (a `?sheet=` search parameter via `router.push(…, { scroll: false })`) or leave that overlay without back-to-close, and log which approach each overlay uses.

### 12.5 Toolkit runner cancel

- **Cancel within 15 seconds** of starting: nothing is saved.
- **Cancel later:** save a `StrategyUse` with `cancelled: true`, no result, the context and references, so the history is honest. The pattern engine **ignores** cancelled uses in every rule (add this filter; the seed has none, so the planted patterns don't change).
- **After cancel:** return to where the person came from (Bridge, Unstick, Toolkit) with a quiet toast "Okay, stopped." In the Bridge context, the Shift step shows "Try something else?" with the other candidates.
- Ambience playing from the tool (if any) stops with a fade.
- "End early" on timed tools (walk, steps timer, breathing): stops and goes to the normal re-check (that's finishing, not cancelling).

### 12.6 Tests and acceptance

- **Flow tests:**
  - Check-in: type → Next → pick 2 → Back → text intact → Next → the same candidates without a new AI call → Back twice → Cancel with confirmation;
  - Unstick: Back to change the reason;
  - Toolkit: Box breathing → Cancel after 5s (nothing saved) and after 20s (a cancelled use, with no re-check);
  - browser back closes the check-in sheet;
  - Escape in each sheet.
- **Pattern test:** cancelled uses are ignored by every rule.
- **Audit:** the controls are present and labeled in every flow in the 12.3 table (a static test listing the components and checking that they render `data-nav="back"` and `data-nav="cancel"` where required).

**Acceptance:** nobody is ever trapped in a flow; Back keeps data; Cancel is calm and immediate.

---

## 13. F-09 — Focus sounds: noise, rain, waves, binaural (P1)

### 13.1 What the person gets

A simple ambience player with sounds that many neurodivergent people use to focus or calm down, available inside Focus and from the Toolkit. All sounds are **generated** with Web Audio: no files, no licenses, nothing to download, and they work offline.

### 13.2 Sounds

| Id | Name | Description shown | Recipe (Appendix C) |
|---|---|---|---|
| `white` | White noise | "Even hiss across all pitches." | White noise buffer, gentle low-pass at 9 kHz so it's not harsh |
| `pink` | Pink noise | "Softer than white noise. Like steady rain on a window." | Paul Kellet's pink-noise filter on white noise |
| `brown` | Brown noise | "Deep and rumbly, like a distant waterfall." | Integrated white noise (leaky), low-pass 500 Hz |
| `rain` | Rain | "Light rain with soft drops." | Pink noise band-passed + randomized droplet clicks |
| `waves` | Ocean waves | "Slow waves on a beach." | Brown/pink mix with a 0.08–0.12 Hz amplitude swell and a filter sweep |
| `fan` | Fan | "A steady fan hum." | Brown noise + a soft 120 Hz hum at very low level + slight band-pass |
| `stream` | Stream | "A small stream over stones." | Band-passed white noise with fast random amplitude modulation |
| `binaural_focus` | Binaural · Focus | "Needs headphones. Two close tones (about 14 Hz apart)." | Left 200 Hz, right 214 Hz, under a quiet pink-noise bed |
| `binaural_calm` | Binaural · Calm | "Needs headphones. Two close tones (about 6 Hz apart)." | Left 180 Hz, right 186 Hz, under a quiet brown-noise bed |

**Binaural rules:**

- Show a headphones icon and the note "Use headphones at a low volume."
- The help text is factual and makes no health claims: "Some people like binaural beats for focus or calm. Research results are mixed, so try it and see if it helps you."
- Never call it treatment or therapy.

### 13.3 Player UI

**Ambience panel** (a bottom sheet; also an inline card in Toolkit):

- A grid of sound tiles with an icon and name; tap to play or switch.
- The playing tile shows animated bars (static at motion Off) and a "Playing" label.
- Volume slider (default 0.4), with a soft maximum gain so it's never loud.
- "Play for": "Until I stop" / "Until focus ends" (only in Focus) / 15 / 30 / 60 minutes. It fades out over 5 seconds at the end.
- Stop button.
- The note "Sounds keep playing while you use other parts of Tide. They may stop if your phone locks the screen."
- Read-aloud for descriptions.

**Where it appears:**

- **Focus page:** a "Sounds" button (headphones icon) in the controls. If a sound is playing, the button shows its name. Starting a focus block with a sound already chosen keeps it playing. With "Until focus ends", it stops (fades) at the end, **before** the end alert plays, so the alert is clearly heard.
- **Toolkit page:** a new top section "Background sounds" with the tiles inline (not a strategy, and nothing is saved as a StrategyUse).
- **Wind-down in Close the day:** the existing ambience options use this player.
- **Global mini-player:** while a sound is playing and the person is on another screen, a small pill above the tab bar shows "Rain · playing" with pause/stop. It's dismissible (the sound keeps playing) and reachable by keyboard.

### 13.4 Rules

- **Playing ambience is an explicit choice,** so it plays even when `sound.enabled` (UI sounds) is off.
- **No playing on the crisis screen.** If the person reaches the crisis screen, ambience fades out immediately.
- **One ambience at a time,** crossfading over 1.5 seconds when switching.
- **Media Session (where supported):** set metadata ("Rain", "Tide") and play/pause handlers, so headphone buttons and lock-screen controls work on supporting browsers. Background playback on phones isn't guaranteed; say so in the panel note.
- **Persist** the last sound and volume (`ambience.lastSound`, `ambience.volume`, `ambience.playFor`), but never auto-play on app open.
- **Reuse v2's ambience code** if it exists (`waves`, `rain`, `brown` in `src/lib/sound/`), and extend it. Don't duplicate. Keep the v2 `sound.ambience` setting working: it now means "Default sound for focus", preselected in the panel.

### 13.5 Tests and acceptance

- **Unit (mocked AudioContext):**
  - each recipe builds a graph without errors;
  - binaural uses two oscillators panned hard left and right with the right frequencies;
  - volume caps;
  - fade-out on stop;
  - "Until focus ends" stops before the end alert;
  - the crisis route stops ambience.
- **Flow:** open the Sounds panel in Focus, pick Rain, start the block; the mini player appears on Today; stop from the pill.

**Acceptance:** nine generated sounds, easy to start and stop from Focus and Toolkit, never loud, never on the crisis screen, compatible with the end alert.

---

## 14. F-10 — Monthly calendar, day view and repeating events (P2)

### 14.1 What the person gets

Today, Tide only shows today's Tide Line. People also need to see the month ahead (exams, deadlines, recurring classes) and to plan or review any day. The daily Tide Line stays the heart of the app; the calendar adds a wider view around it.

### 14.2 Entry points

- A calendar icon button with the label "Calendar" next to the date in the Today header.
- The `m` keyboard shortcut (add it to the shortcuts sheet).
- The date text in the Today header is also a link to the calendar.
- No new tab (the five tabs stay).

### 14.3 Month view (`/calendar`)

- **Header:** month and year in H1 ("November 2026"), previous/next month buttons (with labels), a "Today" button, and a view switch "Month / Day".
- **Weekday row** respecting `language.weekStart`.
- **Grid** of 6 weeks × 7 days. Each day cell:
  - the date number in a circle (today's circle filled with `primary`);
  - up to 3 event chips (a time plus a short title on desktop; colored dots on mobile, with a "+n" for more);
  - a small tasks-due indicator (a check-square icon with a count);
  - optional check-in quadrant dots (if `calendar.showCheckins` is on, default off; at most 3 dots);
  - a tiny driftwood icon if the day was closed (wrap complete).
- Days outside the month are dimmed (but still readable: `inkSoft` at full opacity, never lower contrast).
- **Accessible grid:**
  - `role="grid"`, rows `role="row"`, cells `role="gridcell"` containing a button;
  - each button's `aria-label` reads like "Tuesday, November 3: 3 events, 1 task due, day closed";
  - arrow keys move by day, up/down by week, Home/End to the week's start/end, PageUp/PageDown by month;
  - Enter opens the day.
- **Swipe** left/right changes the month on touch (with the buttons as the accessible path). The month change animates with a horizontal slide (Lively), a fade (Calm) or nothing (Off).
- **Tapping a day** opens the day view. A long-press or the "+" in a day cell (on hover or focus, desktop) opens "Add event" prefilled with that date.
- **Large text:** at text scale ≥ 1.3, or with containers narrower than 30em, the month grid switches to an **agenda list** (one row per day with its items), because 7 columns can't fit large text. Provide a "Grid / List" toggle in the header so anyone can choose.

### 14.4 Day view (`/calendar/[date]`)

- The **Tide Line component, refactored to accept a `date` prop.** Today's page passes today and keeps all v1/v2 behavior: the Now marker, the Bridge and the moved group. Other dates show:
  - **Future dates:** events, tasks due that day, tasks snoozed until that day, "Add event", "Add task due this day". No Now marker, no Bridge.
  - **Past dates:** a read-only history: events, check-ins (StateChips with times), tasks finished that day ("Finished that day" section), wins (mini shore items), strategies used, and the wrap summary if the day was closed ("Day closed: {highlight}" with "Open summary").
  - **Today** (`/calendar/<today>`): redirects to `/`, or shows the same as Today with a "Go to Today" link. Pick one, and log it.
- **Header:** the date in long form, previous/next day arrows, and the "Today" button. Swipe left/right between days on touch.
- Tapping events opens the event detail sheet (F-04); tapping tasks opens the task detail sheet (F-03).

### 14.5 Repeating events (creation)

In `EventForm`: "Repeat: Doesn't repeat / Every week on…" with weekday chips and "Until" (default 8 weeks, maximum 26 weeks). Saving creates an `eventSeries` row and the instances (one per matching day up to "until", maximum 26 × 7 = 182 instances) in one transaction. Editing and deleting follow F-04. Instances are real rows, so every v1/v2 consumer (Bridge, Tide Line, wrap-up "Tomorrow", morning card) works unchanged.

### 14.6 Data and performance

- Query events by range with the `start` index. Query tasks due in the month with the `due` index.
- Count check-ins and wins per day by fetching the month's records once and grouping in JavaScript.
- Memoize per month.
- The month view must render in under 100ms with the seed data (measure and log it).

### 14.7 Demo tour

Add a 10-second step to the full tour after Chapter 3:

1. Tap "Calendar" → the month view.
2. Tap Thursday the 12th → the day view with Chemistry lab and Calculus.
3. Back.

Caption: "A month view for what's coming. The day view is still the heart." Don't change the pitch cut.

### 14.8 Tests and acceptance

- **Unit:**
  - grid generation for months starting on each weekday, with both week-start settings;
  - leap years;
  - day aggregation;
  - repeat instance generation (weekday sets, the until date, the 182 cap);
  - agenda switch at large text.
- **Flow tests:**
  - open the calendar from Today, navigate months with the keyboard, open a past day with history, add a weekly event from a future day, and confirm the instances appear in the following weeks;
  - delete "this and future" (F-04) from a calendar day.
- **Layout audit:** `/calendar` and `/calendar/[date]` across the matrix.

**Acceptance:** a usable, accessible month view and any-day view, with repeating events, that leave Today's Tide Line exactly as it was.

---

## 15. F-11 — "Try a new look" variations (P2)

### 15.1 What the person gets

In v2, "Try the new look" applied one combination (Lagoon + Playful font). The team wants variations: several curated looks to try, compare and undo easily.

### 15.2 Curated looks (`src/data/looks.ts`)

A look sets only appearance and motion keys, never data or companion choices (except the accessory, and only if the user opts in).

| Id | Name | Sets | One-liner |
|---|---|---|---|
| `lagoon_playful` | Lagoon | theme `lagoon`, font `playful`, roundness `round`, density `comfortable`, motion `calm` | "Fresh teal water, friendly and calm." |
| `sunset_lively` | Sunset | theme `sunsetShore`, font `playful`, roundness `round`, motion `lively`, celebrations `full` | "Warm, bright and bouncy." |
| `coral_bright` | Coral | theme `coralReef`, font `playful`, roundness `round`, motion `lively` | "Coral pink with turquoise." |
| `midnight_calm` | Midnight | theme `midnightTide`, font `playful`, roundness `soft`, motion `calm` | "A quiet night sea." |
| `kelp_cozy` | Kelp | theme `kelpForest`, font `hyperlegible`, roundness `soft`, density `comfortable`, motion `calm` | "Leafy greens, cozy and steady." |
| `lavender_soft` | Lavender | theme `lavenderMist`, font `lexend`, roundness `round`, motion `calm` | "Soft lilac, easy on the eyes." |
| `sandbar_quiet` | Sandbar | theme `sandbar`, font `hyperlegible`, roundness `soft`, motion `off`, celebrations `gentle` | "Muted and quiet. Low stimulation." |
| `deepsea_glow` | Deep Sea | theme `deepSea`, font `playful`, motion `lively` | "Deep blue with a glow." |

### 15.3 UI

- **"Try a look" carousel** in Settings → Appearance (at the top) and in What's new ("A fresh look" page), replacing the single button:
  - horizontal snap cards, each a live mini preview built from that look's tokens (sky strip, a 3D button, text lines and a mini companion in that theme);
  - name and one-liner;
  - "Try it" applies the look instantly with the theme crossfade.
- After trying, a sticky bar shows: "Trying: Sunset" with "Keep it", "Back to my look" and "Next look →".
  - "Back to my look" restores the exact previous values (saved in `appearance.lookSnapshot` before the first try);
  - "Keep it" clears the snapshot;
  - leaving the page while trying keeps the look and shows the Undo toast once.
- **"Surprise me"** button: picks a random look different from the current one (deterministic order shuffle per day, so repeated taps cycle through all looks before repeating). Same trying bar.
- **Keyboard:** arrow keys move between cards; Enter tries.
- **Large text:** the carousel becomes a vertical list at ≥ 1.3.

### 15.4 Acceptance

Eight looks with accurate previews; trying, keeping and restoring work exactly; tests cover the snapshot logic and the "Surprise me" cycle.

---

## 16. F-12 — Shore time of day, chosen by hand (P2)

### 16.1 What the person gets

The Shore's sky already follows the clock (dawn, day, sunset, dusk, night). Some people want to choose the scene that feels best: a night shore can be calming at noon, and a bright day can lift a heavy evening. It's a small, meaningful sensory choice.

### 16.2 Behavior

- **Setting** `shore.timeOfDay`: `auto` (default; follows the clock as in v2), `dawn`, `day`, `sunset`, `dusk` or `night`. It replaces v2's `shore.sky` values gracefully:
  - keep `shore.sky` for compatibility;
  - `auto` with `shore.sky = 'theme'` or `'static'` behaves as before;
  - the migration maps nothing (the new key defaults to `auto`).
- **Control on the Shore:** a "Time of day" button (sun/moon icon + label) in the Shore header opens a small popover with a segmented control: Auto · Dawn · Day · Sunset · Dusk · Night. Each option has a tiny sky swatch and its name. At large text it becomes a vertical radio list.
- **Changing it** crossfades the sky, sea and light over 1 second (Lively/Calm; instant at Off). The sun or moon moves to the matching position. At night, stars appear and the companion sleeps; at dawn, the companion stretches; at sunset and dusk, it sits.
- **Palettes:** dawn (blend toward `#FFD1B3` + soft pink), day (theme colors), sunset (blend toward `#FFB070` with a warm sea reflection band), dusk (blend toward `#9C7BD1`), night (theme sky darkened toward `#0E1A2E`, with stars). These are the same palette functions v2 uses. Make `sunset` distinct from v2's "golden hour" if v2 merged them: golden = late afternoon, sunset = sun touching the horizon with a reflection. Implement both inside `auto` and expose `sunset` in the picker.
- **Also in Settings → Shore,** and respected by the "Save as image" export.
- The Today shore preview strip follows the same choice.

### 16.3 Acceptance

All five scenes plus Auto render correctly in light, dark and high-contrast themes; the choice persists; the companion's pose matches; there's a unit test for the palette per scene and a visual check (screenshots in the log, if a browser is available).

---

## 17. F-13 — Count back by 7, 6, 5, 4, 3 or 2 (P2)

### 17.1 What the person gets

The "Count back by 7" grounding strategy becomes an interactive tool where the person chooses the step: 7 is hardest, 2 is easiest. Easier steps suit tired or overwhelmed moments; harder ones pull attention away from racing thoughts.

### 17.2 Strategy and data

- Keep the strategy id `t-count-7` for data compatibility. Its display name becomes dynamic: "Count back by {n}" (default n = 7, so existing text and tests stay the same when the step is 7).
- Add the `tool: 'count_back'` mapping if v2 used `steps_timer` for it, and update the "every strategy maps to a tool" test.
- **Settings** (Settings → Toolkit, and inside the tool):
  - `toolkit.countBackStep`: 2, 3, 4, 5, 6, 7 (default 7);
  - `toolkit.countBackStart`: 100, 50, 30, 20 (default 100);
  - `toolkit.countBackMode`: `reveal` (default) or `type`.

### 17.3 Tool UI (`CountBack.tsx`)

- **Top:** step chips "By 7 · 6 · 5 · 4 · 3 · 2" (with a hint: "Smaller steps are easier") and start chips "From 100 · 50 · 30 · 20".
- **Center:** a big number card showing the current number (display font, scaled), with "Next" under it.
  - **Reveal mode:** the person thinks of the next number, then taps "Next" (or presses Space or Enter) to see it. The card flips (Lively), crossfades (Calm) or swaps (Off).
  - **Type mode:** an input field. The person types the next number and presses Enter.
    - If correct: a soft check and the card advances.
    - If not: neutral feedback, "Close. It's {n}. Keep going from there.", never "wrong", never red, and the card advances to the correct number.
    - "Show me" reveals the answer without typing.
- **Progress:** "{k} of 10" (the exercise is 10 steps, or until the number would go below 0).
- **Companion:** small, `thinking` while waiting and `happy` on each step (at Lively).
- **End:** "Done. Notice your breathing for a moment." Then the normal re-check (Better / Same / Worse).
- **Read-aloud:** reads the current number and instructions on demand. With `voice.breathingCues`-style auto speech off by default, it never auto-speaks.
- **Back and Cancel** per F-08.
- **Literal mode instruction:** "Start at {start}. Subtract {step}. Say or type the result. Repeat 10 times." Gentle: "Count back from {start} by {step}. No rush."

### 17.4 Acceptance

Steps 2–7 and all starts work in both modes; the default (7 from 100) behaves exactly like v2 for existing tests; the re-check and cancel flows work; unit tests cover the sequence generation and the feedback text.

---

## 18. F-14 — Axolotl's external details on the Shore (P3, hard timebox 30 minutes)

### 18.1 What the team noticed

On the Shore, the axolotl (Lolo) is missing its external details. The team wrote "escamas externas" (external scales); axolotls don't have scales, so the details that make an axolotl recognizable are its **external gills**: the feathery fronds on each side of the head, with their texture. These probably don't show properly at Shore size.

### 18.2 What to do (stop at 30 minutes)

1. Compare the axolotl as drawn in Companion Studio (size L/XL) and on the Shore (size M, inside the scene SVG). Check:
   - Is the Shore using a simplified variant?
   - Are the gills clipped by a `viewBox`, `clipPath` or `overflow`?
   - Are the gill fronds removed below a size threshold?
   - Are their colors too close to the sand?
2. Fix the cause:
   - render the same gills on the Shore (three on each side);
   - add 2–3 small frond lines per gill (thin rounded strokes in the gill's darker tip color) at sizes ≥ 64px;
   - add a 1.5px darker outline on the gills when they sit over sand, so they read clearly.
   - If the team meant texture rather than gills, also add a subtle speckle pattern (4–6 tiny dots in the shade color) on the head and body at sizes ≥ 64px. That's an easy, optional extra inside the timebox.
3. Don't change the design elsewhere beyond the same details showing consistently. The partner loves the current look.
4. If 30 minutes pass, keep whatever is clean and working (or revert), log it, and move on. Add a TEAM_TODO note asking the team to confirm what "escamas externas" meant, with a screenshot or description of what you changed.

---

## 19. F-15 — Sand dollar redesign (P3, hard timebox 30 minutes)

### 19.1 What the team noticed

The sand dollar item (manual wins) doesn't look like a sand dollar.

### 19.2 The design (stop at 30 minutes)

A sand dollar is a flat, round disc with a five-petal flower pattern in the center. Draw it in the flat Tide style at about 40px:

- **Disc:** a circle in a warm cream (`#EFE1C2`) with a slightly darker rim ring (`#D9C49B`, 2px), and a very subtle inner shade on the lower half (`#E5D3AE`).
- **Petals:** five elongated teardrop "petals" radiating from the center at 72° intervals (starting at the top), each about 38% of the radius long, drawn as **outlines with a dotted inner line**: a 1.5px stroke in `#C9AF80`, plus a row of 3–4 tiny dots inside each petal.
- **Center:** a tiny 5-point star mark or a small dot cluster at the center (`#C9AF80`).
- **Lunules (optional):** five tiny slits near the edge between the petals (short rounded lines), the "keyholes" many sand dollars have.
- **Texture:** 8–10 very small dots scattered on the disc in `#E0CDA4`.
- Make it readable at 28px (on the Shore) and pretty at 96px (in the Collection).

Update the Collection card art and the Shore item. Keep the item id, name and description. If 30 minutes pass, keep the best clean version (or revert), log it, and move on.

---

## 20. F-16 — 3D companions: roadmap note only, separate branch (do not build)

The partner already loves the current 2D designs. Moving to 3D would mean modeling, asset optimization, heavier downloads, rendering bugs and accessibility risks, all right before the demo. **Do not implement any 3D work.**

Instead, after everything else is merged (or at the end of the run, if merging is blocked):

1. Create the branch `explore/3d-companions` from the final v2.1 commit.
2. Add only `docs/roadmap/3d-companions.md` (about 600–900 words, natural first person). It covers:
   - why 3D might help (depth, personality) and why the team is waiting (the partner likes the 2D look; performance on low-end phones; motion sensitivity; bundle size; time);
   - options compared in a table: Rive (2D with state machines, closest to the current pipeline), Spline (3D scenes for the web), three.js/React Three Fiber with GLB models, pre-rendered sprite sheets, and Lottie;
   - for each option: art workflow, runtime size, performance, accessibility (reduced motion, static fallbacks), offline use and effort;
   - a suggested path: keep 2D for launch; prototype one companion in Rive for richer 2D animation first; consider 3D only after user testing;
   - questions to ask the partner on Tuesday.
3. Commit only that file on that branch: `docs(roadmap): note on 3D companions for the partner meeting`. Switch back to `main` (or to `v2.1-partner-ready` if not merged). Never merge this branch.
4. Mention it in `docs/TEAM_TODO.md` and in the Tuesday meeting notes (Appendix F).

---
## 21. Cross-cutting changes

### 21.1 Data model: Dexie version 3 (additive)

Add `version(3)` after v2's version 2. Restate the full index lists only for the tables whose indexes change. Copy the existing index strings from the code exactly and append the new ones. Check the installed Dexie's documentation on how later versions inherit tables.

```ts
this.version(3).stores({
  tasks: '<v2 index list>, deletedAt, clearedAt',
  events: '<v2 index list>, seriesId, deletedAt',
  eventSeries: 'id, title',
}).upgrade(async (tx) => {
  // Group existing weekly events into series (Section 8.5), so
  // "delete all Physics events" works on data created before v2.1.
  await groupExistingEventsIntoSeries(tx);
});
```

New optional fields (no index unless listed above):

- `Task`: `deletedAt`, `purgeRequested`, `updatedAt`, `clearedAt`
- `CalendarEvent`: `deletedAt`, `seriesId`, `detached`, `updatedAt`
- `StrategyUse`: `cancelled`
- `FocusBlock`: `nudgesShown`, `driftsReported`, `hiddenMs`, `breaks`, `endedBy` (`timer` | `early` | `end` | `deleted`)

New table `eventSeries`: `{ id, title, kind, days: number[], startHHMM, endHHMM, place?, prep?, until }`.

**Upgrade test:** build a v2-shaped database with fake-indexeddb (the v2 schema and the seeded demo data), open it with the v3 class, and assert:

- all data is intact;
- series are grouped correctly;
- no planted pattern changes;
- the v2 → v3 upgrade runs once.

Export and import (v2 Settings → Privacy & data) include the new fields and the `eventSeries` table. Validate them with zod, staying lenient with older backups: missing fields are fine.

### 21.2 Repository helpers and guards

- `taskQueries.ts` and `eventQueries.ts` (Sections 7.5, 8.6) become the only way to read tasks and events in UI code.
- Guard tests fail on direct `db.tasks` or `db.events` reads outside `src/lib/repo/`.
- `runPendingPurges()` runs at boot.
- `runDoneCleanup()` runs at boot and once per day for the optional 30-day permanent cleanup.

### 21.3 New settings keys

All new keys (summarized in Appendix D) are added to `SettingsSchema` with defaults and search-index entries (with synonyms: "alarm", "timer sound", "bell" → focus end alert; "distracted", "refocus", "earth to" → nudges; "white noise", "rain", "binaural" → ambience; "month", "calendar" → calendar; "night", "sunset" → shore time of day; "count" → count back; "completed", "done", "clear" → done visibility). Presets update as described in F-06 and F-07. Settings sections:

- **Focus** gets: "When the timer ends", "Warning before the end", "Refocus nudges", "Default sound".
- **Day & planning** gets: "Show finished tasks on the board for" and "Permanently remove finished tasks after".
- **Toolkit** gets: "Count back".
- **Shore** gets: "Time of day".
- **Appearance** gets: "Try a look".
- **Privacy & data** gets: "Permanently remove deleted tasks" and "Permanently remove deleted events".
- **New "Calendar" section:** "Show check-ins on the calendar", "Calendar layout (Grid / List / Automatic)".

### 21.4 Demo tour updates

Keep the tour's structure and the pitch cut unchanged, except for these small additions (full tour only):

- **Chapter 3 (after the Gentle plan):** the Calendar step (Section 14.7), about 10 seconds.
- **Chapter 4 (before Stuck):** the edit and delete task step (Section 7.7), about 12 seconds.
- **Chapter 4 (focus):**
  - open the Sounds panel, pick Rain (if the launcher's sound option is on; otherwise show the panel and close it). Caption: "Background sounds, made right in the app.";
  - with the director's custom action `triggerNudge`, show one "Earth to Maya!" card at the 60× sped-up timer and tap "Yes, still on it". Caption: "Optional, gentle check-ins if attention drifts.";
  - at the end, the visual end alert shows (and plays if sound is on).
- **Chapter 5 (bridge):** cancel and back are present; no change in steps.
- **Chapter 7 (Shore):** use the new time-of-day control to switch to Sunset for 2 seconds and back to Auto. Caption: "Choose the light that feels right."
- **Chapter 9 (settings):** show the "Try a look" carousel: try Sunset → "Back to my look".

Update the captions file, `data-demo-id`s and the reference test. Keep the total full-tour time under 5 minutes. Re-run both demos twice each (autoplay at 1× and 2×, offline with forced cache) and the v1 pitch path.

### 21.5 Docs and logs

- `CHANGELOG.md`: a "v2.1 — Partner-Ready" section with one plain line per item (what changed for the person).
- `docs/AI_DEV_LOG.md`: "Before F-nn" and "After F-nn" for every item; a "Where Tide stands after v2.1" closing entry.
- `AI_ATTRIBUTION.md`: every new or substantially changed file; new libraries (`@floating-ui/react`, MIT); nothing generated from external code without citation.
- `docs/DECISIONS.md`: the z-index mapping, series grouping rules, delete semantics, done visibility, nudge limits, and any timebox stops.
- `docs/CODE_WALKTHROUGH.md`: new modules (overlay roots and bubbles, layout rules and container queries, task/event queries and purges, series, done visibility, focus alerts and nudges, ambience, calendar, looks, count back), each with "likely reviewer questions".
- `docs/TEAM_TODO.md`: the manual checks listed in each item, Tuesday meeting prep, and confirming "escamas externas".
- `docs/demo-script.md`: the updated tour steps.
- `docs/research-to-design.md`: add a "Partner feedback, Nov 1 list" section with placeholders. The team will fill in which items came from the partner versus their own testing; don't invent attributions.
- `/prompts-doc`: no AI prompt changes in v2.1. Leave it as is, unless copy for AI-related notes changed.
- Progress report drafts for each day worked.

---

## 22. Testing plan

### 22.1 Always-green suites (after every item)

`npm run lint`, `npm run typecheck`, `npm run test` (all), `npm run test:v1`, the v2 suites, the dictation freeze test, the demo reference test, the seed test and `npm run build`.

### 22.2 New tests by item

| Item | Unit / component | Flow | Audit / e2e |
|---|---|---|---|
| F-01 | Portal target (page vs sheet), timing formula, one-bubble rule | Tap companion → bubble readable | Bubble checks in every placement × widths × text scales |
| F-02 | SegmentedControl fallback, setting row stacking, `--tabbar-h` padding | Settings at 1.3: change several settings without overlap | Full layout matrix, 200% zoom case, text-spacing injection |
| F-03 | Soft delete, undo, purge cascade, boot purges, guard | Edit and delete from board and Today | Forms and dialogs at 1.3/1.5 |
| F-04 | Series ops, detached, grouping on seed, bridge ignores deleted, guard | Edit time from Tide Line; delete Calculus → no bridge; undo | Event sheets at 1.3/1.5 |
| F-05 | `isVisibleInDone` windows, `clearedAt`, 30-day cleanup | Seed board clean; clear done + undo; archive actions | Archive page |
| F-06 | Audio scheduling (mock), visual alert, title/favicon, repeat cap, no alert on early end | Hidden-tab end flow | — |
| F-07 | Nudge scheduler limits, hidden/return logic, copy variants | 25-minute block with nudges | Nudge card at 1.5 |
| F-08 | Nav contract static check, cancelled uses ignored by patterns | Check-in back/forward without a re-call; toolkit cancel; browser back closes sheet | — |
| F-09 | Recipe graphs, binaural panning, caps, fades, crisis stop | Sounds in Focus + mini player | Panel at 1.5 |
| F-10 | Grid generation, aggregation, repeats, agenda switch | Calendar navigation, add weekly event, past day history | Calendar routes across matrix |
| F-11 | Snapshot/restore, surprise cycle | Try → back → try → keep | Carousel/list at 1.5 |
| F-12 | Scene palettes, persistence | Change time of day on Shore | Screenshots (if browser) |
| F-13 | Sequence generation, feedback text, default parity | Count back by 3 in type mode | Tool at 1.5 |
| F-14/F-15 | Snapshot-free: assert the new SVG groups exist | — | Visual check (if browser) |

### 22.3 End-to-end (if Playwright is available)

- `e2e/layout-audit.spec.ts` (Section 4.3), run in R1 and again in R7.
- `e2e/demo-full.spec.ts` and `e2e/demo-pitch.spec.ts` (updated).
- `e2e/v1-pitch.spec.ts`.
- **New:** `e2e/focus-alert.spec.ts`. Start a 1-minute focus block (the demo workspace speed custom action, or a dev-only short duration), switch the page's visibility via `page.evaluate` overrides where possible, and assert the outcome sheet and the alert state after the end.

### 22.4 Manual checks for the team (written into TEAM_TODO)

- A real phone at the largest OS text size + Tide 1.3: Today, Check-in, Settings, Calendar.
- Tap the companion everywhere on a real phone.
- The focus end sound with the app in front and in a background tab (laptop), and with the screen on (phone).
- Notification permission flow on a laptop and on an installed Android PWA.
- Binaural sounds with headphones at low volume.
- Screen reader pass on the new screens (calendar grid, archive, event sheets).

---

## 23. The ordered work plan (Phases R0–R7)

Work through these without stopping for confirmation. One commit per item at minimum.

### Phase R0: Baseline (30 minutes)

Section 3.1 in full: read, save team changes, baseline checks, tag `v2.0-baseline`, branch `v2.1-partner-ready`. Write "Before R0"/"After R0" entries in the log.

### Phase R1: Tools and P0 layout bugs

1. **Layout audit tool** (Section 4.3): the Playwright script and spec, or the `/dev/audit` fallback. Run it once on the current app and save the **"before" report** in `docs/audits/2026-11-01-before.json`, plus a short summary in the log. This is your map of every overlap and clip.
2. **F-01, the speech bubble:** overlay roots, Floating UI, text box rules, z-index scale (map every z-index in the app), timing, tests. Commit.
3. **F-02, large text and responsive:** the structural rules (6.2), then component by component (6.3), then the browser zoom case, the text size helper, and tests. Re-run the audit until there are zero failures. Save the **"after" report** in `docs/audits/2026-11-0X-after.json`. Commit in logical chunks (for example "layout: buttons, chips and segmented controls", "layout: settings rows and preview", "layout: tab bar, FAB and sheets", "layout: remaining screens").

### Phase R2: P0 data items

4. **Dexie version 3** (Section 21.1) with the upgrade test. Commit.
5. **F-03, edit and delete tasks.** Commit.
6. **F-04, edit and delete events and series.** Commit.
7. **F-05, done visibility, archive and clear.** Commit.
8. Re-run the full suite, the demo tours and the v1 pitch path. Write a short "P0 complete" log entry and today's progress report draft.

**Checkpoint:** P0 must be complete before Tuesday's meeting. If anything is still red here, keep fixing it before moving to P1.

### Phase R3: P1 focus experience

9. **F-06, the focus end alert.** Commit.
10. **F-07, refocus nudges.** Commit.
11. **F-09, focus sounds** (do it before F-08, because F-08's cancel rules touch the ambience panel). Commit.

### Phase R4: P1 navigation

12. **F-08, Back and Cancel everywhere,** including back-to-close and toolkit cancel semantics. Commit.
13. Re-run everything. Write a "P1 complete" log entry. Update `docs/TEAM_TODO.md` with the manual checks for P0 and P1, so the team can test on Monday evening.

### Phase R5: P2 improvements

14. **F-10, the calendar** (month, day view, repeats). Commit, in two commits if large.
15. **F-11, looks.** Commit.
16. **F-12, Shore time of day.** Commit.
17. **F-13, count back.** Commit.

### Phase R6: P3 timeboxed art

18. **F-14, axolotl details** (hard 30 minutes). Commit or revert.
19. **F-15, sand dollar** (hard 30 minutes). Commit or revert.

### Phase R7: Demo, docs, final audit, merge, roadmap branch

20. Demo tour additions (Section 21.4); re-run both demos and the v1 pitch path.
21. Final layout audit across the full matrix: zero failures.
22. Docs and logs (Section 21.5).
23. **Final acceptance table** in the log: every item → acceptance criteria → how verified → status.
24. Definition of Done (Section 24).
25. Merge to `main` and tag `v2.1.0` (Section 3.4), or explain why not.
26. F-16 roadmap branch (Section 20).
27. Final message to the team, in plain words: what's fixed, what's new, what to check by hand before Tuesday, and anything that didn't make it.

---

## 24. Definition of done for v2.1

- [ ] P0: the companion bubble is always fully readable; zero layout-audit failures across the matrix (including 1.3 and 1.5 text, 320px and 200% zoom); tasks can be edited and deleted with undo and an optional history removal; events (single and series) can be edited and deleted with undo, and the Bridge reflects it; Done shows only the last 24 hours by default, with an archive and "Clear done now".
- [ ] P1: a focus end alert works with default settings (sound + visual), in background tabs on desktop, with optional notification and pre-end warning; optional "Earth to {name}" nudges (off by default) with caps and kind copy; Back and Cancel in every flow, with data kept and browser back closing sheets; nine generated focus sounds with a player, a mini player and safe rules.
- [ ] P2 (if reached): month and day calendar views with repeating events; eight "Try a look" variations with Surprise me and restore; the Shore time-of-day picker; Count back by 2–7 with two modes.
- [ ] P3 (if reached): the axolotl's details visible on the Shore; the sand dollar recognizable.
- [ ] F-16: a roadmap note on its own branch, no 3D code.
- [ ] Nothing broke: all suites green, the dictation freeze test green, both demos and the v1 pitch path working twice in a row, seed patterns unchanged.
- [ ] Data: Dexie version 3 additive, the upgrade tested, export/import updated.
- [ ] Docs and logs updated (Section 21.5); TEAM_TODO lists the manual checks; progress report drafts written.
- [ ] Merged and tagged `v2.1.0`, or the reason is clearly documented.

---

## Appendix A: Copy strings (`src/copy/en.ts` additions)

Keep every existing key. Gentle/Direct/Literal variants are marked (G/D/L).

**Bubble and companion**
- `bubbleClose`: "Close message"

**Text size helper**
- `textSizeNote`: "Tide adjusts its layout as text gets bigger. If something looks wrong, tell us."
- `reportLayout`: "Copy layout details for the team"
- `reportLayoutCopied`: "Copied. Paste it in a message to the team."

**Tasks**
- `taskEdit`: "Edit"
- `taskDelete`: "Delete"
- `taskEditTitle`: "Edit task"
- `taskTitleError`: "Add a few words so you can recognize it."
- `taskFirstStepLabel`: "First step (optional)"
- `taskDeleteTitle`: "Delete \"{title}\"?"
- `taskDeleteBody`: "It will disappear from your board and your day."
- `taskDeleteHistory`: "Also remove what washed up on my shore and its history in my patterns"
- `taskDeleteRunningFocus`: "This will also end the focus timer."
- `taskDeleted`: "Task deleted"
- `keepIt`: "Keep it"
- `undo`: "Undo"
- `deletedTask`: "a deleted task"
- `taskDetailFocus`: "Focus"
- `selectMode`: "Select"
- `deleteSelected`: "Delete selected"
- `deleteSelectedTitle`: "Delete {n} tasks?"

**Events**
- `eventEditTitle`: "Edit event"
- `eventRepeat`: "Repeat"
- `eventNoRepeat`: "Doesn't repeat"
- `eventWeekly`: "Every week on…"
- `eventUntil`: "Until"
- `eventRepeatsSummary`: "Repeats every {days} until {date}"
- `eventEndAfterStart`: "The end time needs to be after the start."
- `eventNoOvernight`: "Events can't cross midnight yet. Split it into two."
- `eventChangeScope`: "Which events should change?"
- `eventOnlyThis`: "Only this event"
- `eventThisAndFuture`: "This and future events"
- `eventAll`: "All events in the series"
- `eventAlsoPast`: "Also change past events?"
- `eventDeleteTitle`: "Delete \"{title}\" on {date}?"
- `eventDeleted`: "Event deleted"
- `eventsDeleted`: "{n} events deleted"
- `eventDeletedWhileOpen`: "That event was deleted."
- `deletedEvent`: "Deleted event"

**Done visibility**
- `doneVisibleFor`: "Show finished tasks on the board for"
- `doneVisibleOptions`: "1 day" · "3 days" · "7 days" · "Always"
- `completedEarlier`: "Completed earlier ({n})"
- `doneEmptyRecent`: "Nothing finished in the last day. See everything you've finished →"
- `clearDone`: "Clear"
- `clearDoneLabel`: "Clear finished tasks from the board"
- `doneCleared`: "Cleared from the board. They're in Completed."
- `completedTitle`: "Completed"
- `completedEmpty`: "Finished tasks will rest here."
- `moveBackInProgress`: "Move back to In progress"
- `autoDeleteCompleted`: "Permanently remove finished tasks after"
- `autoDeleteOptions`: "Never" · "30 days"
- `autoDeleteHelp`: "Their shells stay on your shore. Only the task entries are removed."

**Focus alert**
- `focusTimesUp`: "Time's up"
- `focusTimesUpTitle`: "Time's up · Tide"
- `focusNotifyBody`: "{title}: how did it go?"
- `focusEndAlertLabel`: "When the timer ends"
- `focusEndAlertOptions`: "Sound and visual" · "Visual only" · "Off"
- `focusEndAlertHelp`: "The end-of-timer sound plays even when other sounds are off, because you started the timer."
- `focusEndSoundLabel`: "Sound"
- `focusEndSounds`: "Chime" · "Bell" · "Marimba" · "Waves" · "Gentle rise"
- `testSound`: "Test sound"
- `focusRepeatLabel`: "Repeat"
- `focusRepeatOptions`: "Once" · "Up to 3 times until I respond"
- `focusNotifyLabel`: "Notify me if Tide is in the background"
- `focusNotifyHelp`: "Notifications can arrive up to a minute late if the tab has been in the background a long time."
- `focusNotifyIos`: "On iPhone, notifications only work after adding Tide to your Home Screen."
- `focusWarnLabel`: "Warning before the end"
- `focusWarnOptions`: "Off" · "1 minute" · "2 minutes"
- `focusOneMinuteLeft`: "One minute left."
- `focusTwoMinutesLeft`: "Two minutes left."

**Nudges**
- `nudgeLabel`: "Refocus nudges"
- `nudgeOptions`: "Off" · "Visual" · "Visual and sound"
- `nudgeEvery`: "Check in every"
- `nudgeOnReturn`: "Welcome me back when I return to Tide"
- `nudgeHiddenAfter`: "Nudge me if I leave Tide for"
- `nudgeCoach`: "Want a gentle \"Earth to {name}\" check-in now and then? You can turn it on here."
- `nudgeTitle` (G/D/L): "Earth to {name}! Still on {task}?" / "Still on {task}?" / "Are you still working on {task}?"
- `nudgeTitleNoName`: "Earth to you! Still on {task}?"
- `nudgeReturn` (G/D/L): "Welcome back! Still on {task}?" / "Back. Still on {task}?" / "You returned to Tide. Are you still working on {task}?"
- `nudgeYes`: "Yes, still on it"
- `nudgeDrifted`: "I drifted"
- `nudgePickUp`: "Pick up from here"
- `nudgeYouWereAt`: "You were at: {note}"
- `nudgeBreak`: "Take a 2-minute break"
- `nudgeBackToIt`: "Back to it"
- `nudgeStop`: "Stop nudges for this block"
- `nudgePill`: "Still on it?"
- `nudgeNotify`: "Earth to {name}: your focus block on {task} is still running."

**Navigation**
- `back`: "Back"
- `cancel`: "Cancel"
- `leaveTitle`: "Leave without saving?"
- `leaveKeep`: "Keep going"
- `leaveConfirm`: "Leave"
- `endFocusTitle`: "End the focus block?"
- `stopped`: "Okay, stopped."
- `trySomethingElse`: "Try something else?"
- `skipSwitch`: "Skip this switch"
- `endEarly`: "End early"
- `brainDumpSaveAsTasks`: "Save as tasks"

**Ambience**
- `sounds`: "Sounds"
- `backgroundSounds`: "Background sounds"
- `soundNames`: White noise · Pink noise · Brown noise · Rain · Ocean waves · Fan · Stream · Binaural · Focus · Binaural · Calm
- `soundDescriptions`: (as in Section 13.2)
- `playing`: "Playing"
- `playFor`: "Play for"
- `playForOptions`: "Until I stop" · "Until focus ends" · "15 minutes" · "30 minutes" · "60 minutes"
- `ambienceNote`: "Sounds keep playing while you use other parts of Tide. They may stop if your phone locks the screen."
- `headphonesNote`: "Use headphones at a low volume."
- `binauralHelp`: "Some people like binaural beats for focus or calm. Research results are mixed, so try it and see if it helps you."
- `miniPlayer`: "{sound} · playing"
- `stop`: "Stop"
- `pause`: "Pause"

**Calendar**
- `calendar`: "Calendar"
- `calendarToday`: "Today"
- `calendarMonth`: "Month"
- `calendarDay`: "Day"
- `calendarGrid`: "Grid"
- `calendarList`: "List"
- `calendarPrevMonth`: "Previous month"
- `calendarNextMonth`: "Next month"
- `calendarPrevDay`: "Previous day"
- `calendarNextDay`: "Next day"
- `calendarDayLabel`: "{weekday}, {month} {day}: {summary}"
- `calendarSummaryParts`: "{n} events" · "{n} tasks due" · "day closed" · "no plans"
- `calendarAddEvent`: "Add event"
- `calendarAddTask`: "Add task due this day"
- `calendarFinishedThatDay`: "Finished that day"
- `calendarDayClosed`: "Day closed: {highlight}"
- `calendarOpenSummary`: "Open summary"
- `calendarShowCheckins`: "Show check-ins on the calendar"
- `calendarLayout`: "Calendar layout"
- `calendarLayoutOptions`: "Automatic" · "Grid" · "List"

**Looks**
- `tryALook`: "Try a look"
- `tryIt`: "Try it"
- `surpriseMe`: "Surprise me"
- `trying`: "Trying: {look}"
- `keepLook`: "Keep it"
- `backToMyLook`: "Back to my look"
- `nextLook`: "Next look"

**Shore time of day**
- `shoreTimeOfDay`: "Time of day"
- `shoreTimes`: "Auto" · "Dawn" · "Day" · "Sunset" · "Dusk" · "Night"

**Count back**
- `countBackName`: "Count back by {n}"
- `countBackStepHint`: "Smaller steps are easier."
- `countBackFrom`: "From {n}"
- `countBackBy`: "By {n}"
- `countBackInstruction` (G/D/L): "Count back from {start} by {step}. No rush." / "Count back from {start} by {step}." / "Start at {start}. Subtract {step}. Say or type the result. Repeat 10 times."
- `countBackNext`: "Next"
- `countBackShowMe`: "Show me"
- `countBackClose`: "Close. It's {n}. Keep going from there."
- `countBackProgress`: "{k} of 10"
- `countBackDone`: "Done. Notice your breathing for a moment."
- `countBackModeReveal`: "Think it, then reveal"
- `countBackModeType`: "Type it"

**Data**
- `purgeDeletedTasks`: "Permanently remove deleted tasks"
- `purgeDeletedEvents`: "Permanently remove deleted events"

---

## Appendix B: Layout audit script (skeleton)

Adapt it to the project's Playwright setup. The checks run inside the page via `page.evaluate`.

```ts
// scripts/layout-audit.ts
// Walks Tide's main routes and open states at several widths and text sizes,
// and reports anything that overlaps, gets clipped, gets covered, or makes
// the page scroll sideways. We built this because "it looked fine on my
// laptop" kept hiding problems people with big text run into every day.

import { chromium, type Page } from 'playwright';

type Finding = { route: string; state: string; width: number; scale: number;
  check: string; selector: string; detail: string };

const WIDTHS = [320, 360, 390, 768, 1024, 1280];
const SCALES = [1, 1.15, 1.3, 1.5];

async function setPrefs(page: Page, scale: number) {
  // Settings live in IndexedDB; the app exposes a dev-only hook in non-production
  // builds so audits can set preferences without clicking through Settings.
  await page.evaluate((s) => (window as any).__tideDev?.setSettings({
    textScale: s, 'motion.level': 'off', 'appearance.theme': 'lagoon', 'appearance.font': 'playful',
  }), scale);
}

async function runChecks(page: Page) {
  return page.evaluate(() => {
    const out: { check: string; selector: string; detail: string }[] = [];
    const vw = window.innerWidth;
    const path = (el: Element) => {
      const parts: string[] = [];
      for (let e: Element | null = el; e && parts.length < 5; e = e.parentElement) {
        const id = e.getAttribute('data-demo-id') || e.id;
        parts.unshift(e.tagName.toLowerCase() + (id ? `[${id}]` : ''));
      }
      return parts.join(' > ');
    };
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
    };
    // 1. Horizontal page overflow
    if (document.documentElement.scrollWidth > vw + 1)
      out.push({ check: 'page-overflow-x', selector: 'html', detail: `${document.documentElement.scrollWidth} > ${vw}` });
    // Collect content boxes
    const all = Array.from(document.querySelectorAll('body *')).filter(visible);
    const hasText = (el: Element) => Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent!.trim().length > 0);
    const interactive = 'button, a[href], input, select, textarea, [role="switch"], [role="tab"], [role="radio"], [role="checkbox"]';
    const boxes = all.filter(el => hasText(el) || el.matches(interactive));
    // 2. Clipped text
    for (const el of boxes) {
      if (el.closest('[data-allow-clip]')) continue;
      const cs = getComputedStyle(el);
      const clipsX = ['hidden', 'clip'].includes(cs.overflowX) || cs.textOverflow === 'ellipsis';
      const clipsY = ['hidden', 'clip'].includes(cs.overflowY);
      if ((clipsX && el.scrollWidth > el.clientWidth + 1) || (clipsY && el.scrollHeight > el.clientHeight + 1))
        out.push({ check: 'clipped', selector: path(el), detail: `${el.scrollWidth}x${el.scrollHeight} in ${el.clientWidth}x${el.clientHeight}` });
    }
    // 3. Overlap between unrelated boxes
    const inOverlay = (el: Element) => !!el.closest('[data-overlay]');
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.contains(b) || b.contains(a) || inOverlay(a) !== inOverlay(b)) continue;
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w > 4 && h > 4) out.push({ check: 'overlap', selector: `${path(a)} <> ${path(b)}`, detail: `${Math.round(w)}x${Math.round(h)}` });
    }
    // 4. Covered text (sample center and inset corners)
    for (const el of boxes) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue; // offscreen vertically: scrolled checks happen per state
      const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 3, r.top + 3], [r.right - 3, r.top + 3], [r.left + 3, r.bottom - 3], [r.right - 3, r.bottom - 3]];
      const covered = pts.filter(([x, y]) => { const hit = document.elementFromPoint(x, y); return hit && hit !== el && !el.contains(hit) && !hit.contains(el); });
      if (covered.length >= 2 && !el.closest('[data-overlay]')) out.push({ check: 'covered', selector: path(el), detail: `${covered.length}/5 points` });
    }
    // 5. Offscreen interactive
    for (const el of all.filter(e => e.matches(interactive))) {
      const r = el.getBoundingClientRect();
      if (r.left < -1 || r.right > vw + 1) out.push({ check: 'offscreen-x', selector: path(el), detail: `${Math.round(r.left)}..${Math.round(r.right)}` });
    }
    // 6. Small targets (warning)
    for (const el of all.filter(e => e.matches(interactive) && !e.closest('[data-small-target-ok]'))) {
      const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) out.push({ check: 'small-target(warn)', selector: path(el), detail: `${Math.round(r.width)}x${Math.round(r.height)}` });
    }
    return out;
  });
}

// For each width × scale × route × state: set viewport, set prefs, navigate,
// open the state (click data-demo-ids), wait for fonts and layout to settle,
// run checks, scroll in steps of 80% viewport height re-running checks 3–4,
// screenshot on failures, collect findings, compare with the allowlist, exit
// non-zero when there are new failures. Write the JSON report to docs/audits/.
```

Notes:

- The "covered" check skips elements under an open overlay, because the overlay itself is audited in its own state.
- Mark intended overlaps with `data-overlay` (sheets, bubbles, toasts, celebration, demo HUD, badges sitting on icons) and decorative clips with `data-allow-clip`. Every use of `data-allow-clip` must be listed in the log with a reason.
- The dev hook `window.__tideDev` exists only in development and test builds. Guard it with `process.env.NODE_ENV !== 'production'`, and add a test that the production bundle doesn't contain `__tideDev`.

---

## Appendix C: Sound recipes (Web Audio)

All gains are capped by a limiter (`DynamicsCompressorNode` with threshold −12 dB, ratio 12, attack 0.003, release 0.25) before the master gain. Volumes below are relative to 1.0 = the user's volume setting.

**End alerts**
- `chime`: two triangle-wave notes, E5 (659 Hz) then B5 (988 Hz), 0.12s apart. Each has a 5 ms attack and a 1.4s exponential decay, peak 0.35. A soft convolver reverb (a 1.2s generated decaying-noise impulse) at 20% wet.
- `bell`: a sine fundamental at 523 Hz plus inharmonic partials at 2.0×, 2.76× and 5.4× (gains 1, 0.4, 0.25, 0.1), each with its own decay (2.5s, 1.6s, 1.0s, 0.6s), peak 0.3.
- `marimba`: sine at 440, 554 and 659 Hz (a three-note rising arpeggio, 0.11s apart). Each note: attack 2 ms, decay 0.5s, plus a brief 4× partial at 0.08 for the "wood" click.
- `waves`: pink noise through a low-pass whose cutoff rises from 300 to 1600 Hz and back over 3s, with gain shaped like a swell (0 → 0.3 → 0). Then a soft `chime` single note at 2.6s.
- `rise`: a sine pad (A4 + E5 at 0.5 gain) starting at 0.01 and rising exponentially to 0.3 over 6s, then a 1.5s release. The gentlest alert.
- `nudge`: two soft sine notes, G4 (392 Hz) then C5 (523 Hz), 0.15s apart, attack 10 ms, decay 0.6s, peak 0.18.
- `warning` (pre-end): a single sine at 494 Hz, decay 0.8s, peak 0.15.

**Ambience** (continuous; generate 10s noise buffers once, loop them with `loop = true` and a 50 ms crossfade baked into the buffer ends, or use an `AudioWorkletProcessor`)
- `white`: white noise → low-pass 9 kHz → gain 0.25.
- `pink`: Paul Kellet's filter on white noise (b0..b6 coefficients) → gain 0.3.
- `brown`: `last = (last + 0.02 * white) / 1.02; out = last * 3.5` → low-pass 500 Hz → gain 0.4.
- `rain`: pink → band-pass 2.5 kHz (Q 0.7) → gain 0.25, plus droplets: every 30–120 ms (random), a short 3–8 ms burst of white noise through a high-pass at 3–6 kHz with random gain 0.02–0.08.
- `waves`: (brown 0.6 + pink 0.4) → low-pass whose cutoff is modulated by an LFO at a random 0.08–0.12 Hz between 350 and 1200 Hz → gain modulated by the same LFO (0.12–0.4).
- `fan`: brown noise → band-pass 220 Hz (Q 0.5) → gain 0.35, plus a sine at 120 Hz at gain 0.015 with ±0.5 Hz slow vibrato.
- `stream`: white → band-pass 1.8 kHz (Q 1.2) → gain modulated by a random-step signal (new target every 40–90 ms, smoothed with a 30 ms time constant) between 0.08 and 0.3.
- `binaural_focus`: left sine at 200 Hz and right sine at 214 Hz (each through a `StereoPannerNode` with pan −1 and +1, or a `ChannelMergerNode`), each at gain 0.08, plus a pink bed at 0.08.
- `binaural_calm`: left 180 Hz, right 186 Hz, each at gain 0.08, plus a brown bed at 0.1.

Fade in over 1.5s and fade out over 1.5s (5s for "play for" endings). Switching sounds crossfades over 1.5s. Never exceed a peak of about −10 dBFS after the limiter.

---

## Appendix D: Settings keys added in v2.1 (summary)

| Key | Default |
|---|---|
| `tasks.doneVisibleFor` | `24h` |
| `tasks.autoDeleteCompletedAfter` | `never` |
| `focus.endAlert` | `sound_visual` |
| `focus.endSound` | `chime` |
| `focus.alertVolume` | 0.6 |
| `focus.alertRepeat` | `once` |
| `focus.vibrateAtEnd` | true (if supported) |
| `focus.notifyAtEnd` | false |
| `focus.titleCountdown` | true |
| `focus.warnBeforeEnd` | `off` |
| `focus.refocusNudge` | `off` |
| `focus.nudgeEvery` | 10 |
| `focus.nudgeOnReturn` | true |
| `focus.nudgeHiddenAfter` | 2 |
| `focus.nudgeCoachSeen` | false |
| `ambience.lastSound` | null |
| `ambience.volume` | 0.4 |
| `ambience.playFor` | `until_stop` |
| `calendar.showCheckins` | false |
| `calendar.layout` | `auto` |
| `appearance.lookSnapshot` | null (internal) |
| `shore.timeOfDay` | `auto` |
| `toolkit.countBackStep` | 7 |
| `toolkit.countBackStart` | 100 |
| `toolkit.countBackMode` | `reveal` |

Preset updates:

- **Low sensory:** `focus.endAlert = 'visual'`, `focus.endSound = 'rise'`, `focus.refocusNudge = 'off'`.
- **Focused:** `focus.warnBeforeEnd = '1'`, `focus.refocusNudge = 'visual'`.
- **Playful:** `focus.endSound = 'marimba'`.
- **Calm:** `focus.endSound = 'chime'`.

---

## Appendix E: Messages to paste into Claude Code

### E.1 Kickoff

```
We're doing the v2.1 "Partner-Ready" fix pack for Tide. Read
docs/TIDE_V2_1_FIXES_PROMPT.md completely, then CLAUDE.md and the end of
docs/AI_DEV_LOG.md, and look at the code you'll touch before changing it.

Work in priority order (P0, then P1, then P2, then P3) following the
phases R0 to R7, without asking us to confirm between items. For each
item: re-read its section, reproduce the problem, find the root cause,
fix it, run every suite (including test:v1, the v2 suites, the dictation
freeze test and the build), run the layout audit when the item touches UI,
write the before/after log entries, update the docs, and commit. Then go
straight to the next item.

Don't break anything that works. Dictation stays frozen. Both demos and
the v1 pitch path must keep working. Don't build any 3D companions; only
write the roadmap note on its own branch at the end.

Comments must sound natural and explain why. Logs are first person and
honest that the code is AI-generated.

P0 and P1 must be done before our partner meeting on Tuesday. Only stop
for true blockers. When you finish, merge to main only if everything is
green, and tell us in plain words what's fixed, what's new, and what we
should check by hand.
```

### E.2 Resume

```
We're resuming the Tide v2.1 fix pack. Read CLAUDE.md, then
docs/TIDE_V2_1_FIXES_PROMPT.md, then the end of docs/AI_DEV_LOG.md, and run
git status and git log --oneline on v2.1-partner-ready. Run all checks,
finish or fix any half-done item, write a short "Resumed" log entry, and
continue in priority order without asking us to confirm.
```

### E.3 After the Tuesday meeting

```
Here's what our Challenge Partner said on Tuesday:
1. ...
2. ...

Update docs/TIDE_V2_1_FIXES_PROMPT.md (or add a short addendum section at
the end) so the spec matches, then implement in priority order without
breaking anything. Add the notes to docs/research-to-design.md (only what
we told you), log the changes, update CHANGELOG.md and today's progress
report, and commit.
```

### E.4 A new layout bug

```
Layout bug: <route>, <device/width>, text size <x>, font <y>, theme <z>.
What we see: <description>.

Reproduce it with the layout audit (add the state if it isn't covered),
fix the root cause, add the case to the audit, re-run the whole matrix,
log it and commit.
```

---

## Appendix F: Notes for Tuesday's partner meeting (for the team)

**What we fixed since you saw it:**
- The companion's speech bubble is always readable.
- The app works at large text sizes.
- Tasks and events can be edited and deleted, with undo.
- Finished tasks clear from the board after a day.

**What's new:**
- A focus timer that clearly tells you when time's up.
- Optional "Earth to {name}" check-ins.
- Back and Cancel everywhere.
- Background sounds (noise, rain, waves, binaural).
- A month calendar.
- More looks.
- A Shore time-of-day picker.
- An adjustable count-back exercise.

**Questions to ask:**
1. Do the "Earth to…" nudges feel supportive or intrusive? Should they be off by default (as now)?
2. Is the focus end sound the right kind of signal? Which sound feels best: Chime, Bell, Marimba, Waves or Gentle rise?
3. Do students want the month view, or is the day view enough day-to-day?
4. Are the companions right for 18–24-year-olds? Would 3D add anything for them, or would it be distracting? (Show `docs/roadmap/3d-companions.md` on the `explore/3d-companions` branch.)
5. What should happen to finished tasks: hide after a day (now), or something else?
6. Anything in the app that still feels overwhelming?

**Roadmap mentions:**
- 3D or richer animated companions (after user testing).
- Calendar import from school systems.
- Accounts and sync for universities (with consent).
- Gentle reminders designed by the student.

*End of document.*
