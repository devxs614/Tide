# TIDE — Demo Fix Pack — Prompt for Claude Code

> **Cómo usar este archivo (para el equipo, en español)**
>
> Este prompt arregla **solo** los bugs de la Demo, sin cambiar sus capítulos, textos, orden ni las funciones que muestra:
>
> 1. **El error `dayWraps.bulkAdd(): 11 of 11 operations failed … Key already exists`.** La demo intenta sembrar los datos dos veces. Se vuelve a prueba de repeticiones.
> 2. **La lectura de captions es inconsistente.** La voz leerá **todas** las captions, una por una, y la demo esperará a que termine cada una antes de avanzar.
> 3. **Cosas encimadas y pasos demasiado rápidos.** Cada paso espera a que la pantalla se acomode, y cada caption tiene un tiempo mínimo de lectura. El spotlight, el cursor, las burbujas, los toasts y la barra de la demo dejan de taparse entre sí.
> 4. **Cambio de temas.** En lugar de muchos temas rápidos, se muestran solo tres: uno negro, uno blanco y uno de color (con el que sigue el resto de la demo), cada uno visible 1 segundo.
> 5. **El botón de play/pause.** Funcionará siempre al primer toque, y la demo nunca volverá a arrancar sola estando en pausa.
>
> **Pasos:** guarden el archivo como `docs/TIDE_DEMO_FIX_PROMPT.md`, abran Claude Code en el repo y peguen el mensaje de la Sección 13.

---

## 0. Mission (for Claude Code)

The team rehearsed the Demo (the director built in v2: the full tour, the pitch cut and presenter mode, with later additions in v2.1–v2.3) and found five bugs. Fix those bugs at their root cause. **Do not redesign or alter the demo.**

- The same chapters, the same steps in the same order, the same captions (word for word), the same features shown, the same HUD look and controls.
- The only intended changes are the ones the team asked for: the theme sequence (Section 5) and the pacing rules (Section 4), which make steps slower and readable.
- Nothing outside the demo changes either. The app's screens, data, settings and behavior stay exactly the same for normal use.

The dictation code stays frozen. Every existing test suite must keep passing (v1, v2, v2.1, v2.2, v2.3, the dictation freeze test, the demo reference test, the seed test). The v1 100-second pitch path must still work.

Work autonomously in the order of Section 11, without asking the team to confirm. For each bug: understand → reproduce → root cause → fix → test → log → commit. Stop only if the environment can't run Node, or if a change would delete work the team made by hand.

Read first:

- `CLAUDE.md` and the end of `docs/AI_DEV_LOG.md`;
- `docs/demo-script.md`;
- the demo sections of the v2 spec (Section 16) and the later prompts' demo notes;
- all code under `src/demo/` (the director engine, actions, custom actions, scripts, HUD, Spotlight, DemoCursor, captions);
- the seed (`src/data/demo/seed*.ts` or wherever it lives), the workspace switching in `src/lib/db.ts`;
- the voice engine (`src/lib/voice/`);
- the demo clock in `src/lib/clock.ts`.

The code is the source of truth for what exists.

---

## 1. Rules for this fix pack

### 1.1 Safety net

1. Run `git status`. Commit any uncommitted team changes as `chore: save team changes before demo fixes`.
2. Run every suite and the build, and record the baseline. Fix anything red first.
3. Tag `pre-demo-fix` and work on the branch `demo-fixes`.
4. **Record the demo's current script as a snapshot** before touching it:
   - every chapter id, step id, caption text, action kind and target, in order;
   - save it as `docs/audits/demo-script-before.json` (generate it from the script modules with a small Node script).
   - At the end, generate `demo-script-after.json` and compare them. The only allowed differences:
     - Chapter 1's theme steps (Section 5);
     - added internal "wait for stable" or "narrate" metadata;
     - timing fields.
   - Captions must be identical (a test enforces this, Section 10).

### 1.2 What must not change

- Captions (text), chapter order, step order, which features are shown, the HUD's visual design (colors, layout, icons, labels), the launcher's options.
- App behavior outside the demo workspace.
- Seed **content**: the same data, the same planted patterns. Only how it's written to the database changes (Section 2).
- The pitch cut's content. Its duration may grow slightly because of the minimum reading times and narration. Measure and log it (Section 4.6).

### 1.3 Comments and logs

- Natural comments that explain **why**, with a short note at each fix site about what used to go wrong.
- First-person entries in `docs/AI_DEV_LOG.md` ("Before demo fixes", one entry per bug, "After demo fixes").
- Also update:
  - `docs/DECISIONS.md` (the state machine design, pacing formula, theme sequence, narration strategy);
  - `docs/demo-script.md` (the new theme step and pacing notes for presenters);
  - `CHANGELOG.md` ("Demo fixes");
  - `AI_ATTRIBUTION.md`;
  - `docs/TEAM_TODO.md` (manual rehearsal checks);
  - today's progress report draft.

### 1.4 Commits

One commit per bug: `fix(demo): …`, with a short natural body naming the bug, and the `AI-Generated: Claude Code` trailer.

---

## 2. Bug D-1: `dayWraps.bulkAdd(): 11 of 11 operations failed … ConstraintError: Key already exists`

### 2.1 What happens

Starting or restarting the demo throws a runtime `BulkError`: all 11 inserts into `dayWraps` fail because records with the same keys already exist. `dayWraps` uses the date (`'YYYY-MM-DD'`) as its primary key, so seeding twice into the same database collides on every row. The demo then shows an error, or runs with half-seeded data.

### 2.2 Likely causes (check all, and confirm which ones apply)

1. **Seeding runs twice concurrently.**
   - React Strict Mode in development runs mount effects twice.
   - The demo boot handler (`?demo=start`) and the launcher may both trigger the seed.
   - Two tabs may open the demo at once.
   - A "Restart demo" click can happen while a seed is still running.
2. **Re-seeding doesn't clear `dayWraps` (or other v2+ tables) first.** The v1 seed cleared the v1 tables. The v2 additions (`dayWraps`, `bottles`, `eventSeries` and any later tables) may not have been added to the clearing step, so a restart keeps old rows, and `bulkAdd` collides.
3. **The "is the demo seeded?" check is not atomic.** It reads a marker (for example a `seedVersion` setting) outside the transaction that writes the seed, so two callers both see "not seeded" and both write.
4. **The seed version marker is written before the data,** or in a separate transaction. If seeding fails halfway, the next run thinks it's seeded, or the opposite.
5. **Duplicate keys inside one seed run:** the generator could produce two wraps for the same date. Unlikely with "11 of 11", but check.
6. **Other natural-key tables** have the same latent problem: `dayPlans` (key `date`), `settings` (key `key`), `dismissedPatterns` (key `key`), `eventSeries` (deterministic ids). The same fix must cover them.

### 2.3 Required fix

1. **One seed function, one transaction, idempotent.** Rewrite the seed entry point (keep the data generation code as is) as `seedDemoWorkspace({ force }: { force: boolean })`:
   - Open **one** `rw` Dexie transaction over **every** table in the demo database. Build the table list from `db.tables`, so new tables are never forgotten again.
   - Inside it:
     1. read the marker `settings['demo.seedVersion']`;
     2. if it equals the current `DEMO_SEED_VERSION` and `force` is false, do nothing and return;
     3. otherwise, **clear every table**, then write all seed data using `bulkPut` (not `bulkAdd`) for every table. `bulkPut` overwrites any leftovers safely;
     4. write the marker **last**, inside the same transaction.
   - If anything throws, Dexie rolls back the whole transaction, so the database is never half-seeded.
   - Bump `DEMO_SEED_VERSION` (for example to `v2.4-demofix`), so every existing demo database reseeds once cleanly.
2. **Single-flight guard.** Wrap the call in a module-level promise singleton: if a seed is in progress, every other caller awaits the same promise instead of starting another. Across tabs, use the Web Locks API when available (`navigator.locks.request('tide-demo-seed', …)`); without it, the transaction and marker logic is still safe, because the second run sees the marker and does nothing.
3. **One trigger.** Find every place that seeds (the boot handler, the launcher, Settings → Demo "Restart", the director's chapter setup, tests). They must all call `seedDemoWorkspace`. "Restart demo" calls it with `force: true`; entering the demo calls it with `force: false`. Remove any direct `bulkAdd` calls in seed paths.
4. **Strict Mode safety:** the boot effect that seeds must be safe when run twice. The single-flight guard makes it so; also use an effect-scoped "already started" ref.
5. **Never touch the main workspace.** Assert in code that the active database name is the demo database before seeding, and throw a clear error otherwise. A test covers it.
6. **Duplicate keys inside the generator:** add a dev assertion that every natural-key table's seed rows have unique keys. A unit test checks the generated arrays before any database write.
7. **Error surfacing:** if seeding fails anyway, the demo launcher shows a calm message, "The demo data couldn't be prepared. Try again." with a "Try again" button that calls `seedDemoWorkspace({ force: true })`. Log the error to the console in development only.

### 2.4 Tests

- Seed twice in a row (`force: false`): the second call is a no-op, with no errors.
- Seed twice concurrently (`Promise.all`): one write happens, no errors, and the data is identical to a single seed.
- Seed with `force: true` on an already-seeded database: no errors, and the data equals a fresh seed (compare counts and a hash of every table's rows).
- Simulate a failure mid-seed (mock one table's `bulkPut` to throw): the database is unchanged (still the old data, or still empty), the marker is not written, and the next call succeeds.
- Seeding while the active workspace is main throws and writes nothing.
- The planted pattern keys after seeding are exactly as before (the existing seed test).
- Every natural-key array in the seed has unique keys.

**Acceptance:** starting, restarting, double-clicking Start, refreshing mid-seed or opening two tabs never produces a `BulkError`, and the demo data is always complete and identical.

---

## 3. Bug D-2: narration doesn't read every caption

### 3.1 What happens

With narration on, the voice sometimes reads a caption and sometimes doesn't, and it never reads all of them in one run. The team wants the voice to read **every** caption, reliably.

### 3.2 Likely causes (check all)

1. **Only some steps are marked `narrate: true`.** The v2 spec marked only a few captions for narration. The team now wants all of them read when narration is on.
2. **The director doesn't wait for speech.** It advances after `holdMs` while the voice is still speaking. The next step calls `speechSynthesis.cancel()`, cutting the current caption off, or the next caption replaces it before it starts.
3. **Chrome's cancel-then-speak bug:** calling `speak()` immediately after `cancel()` sometimes drops the new utterance silently.
4. **Garbage-collected utterances:** in Chrome, if the `SpeechSynthesisUtterance` object isn't referenced anywhere, its `end` event may never fire. The director then waits forever, or a timeout skips it.
5. **Voices not loaded yet:** the first captions are spoken before `voiceschanged`, so they fail or use a bad voice.
6. **Audio not unlocked:** narration is triggered by the autoplay loop, not directly by the Start gesture. Some browsers (especially Safari) refuse speech or audio that isn't tied to a gesture, until the first successful one.
7. **Cloud voice latency or failure:** if the cloud TTS (v2) is configured, fetching audio takes time; if it fails, there's no fallback to the device voice in the director path.
8. **The 15-second cut-off** (Chrome) on long captions, if the director bypasses the voice engine's chunking.
9. **Pause interaction:** `speechSynthesis.pause()`/`resume()` is unreliable on several platforms. After a pause, narration may never resume, or may resume in the wrong place.

### 3.3 Required fix

1. **Narrate every caption when narration is on.** In the director, treat every step with a `caption` as narratable when `narration` is enabled. Ignore the per-step `narrate` flag for that purpose, but keep the field in the data, unchanged, so the script snapshot only differs in this documented way. With narration off, nothing is spoken.
2. **A dedicated narration queue** (`src/demo/director/narrator.ts`) built on the existing voice engine (`useVoice`'s underlying `engine.speak`), not on raw `speechSynthesis` calls in the director:
   - `narrator.say(text, { signal }): Promise<'done' | 'skipped' | 'aborted'>` speaks the whole caption through the voice engine (so it gets speech-friendly text and chunking) and resolves when the **last chunk** finishes.
   - It keeps a strong reference to the current utterance(s) until they end (the fix for garbage-collected utterances).
   - After any `cancel()`, wait 120ms before the next `speak()` (the Chrome fix).
   - **Watchdog:** if no `start` event arrives within 1.5 seconds, retry once through the next engine (cloud → device, or device with a different voice). If it still fails, resolve `'skipped'`, log it in the debug panel, and continue: the caption stays on screen for its reading time (Section 4.2).
   - **End timeout:** if `end` doesn't arrive by the estimated duration × 2 + 2 seconds, resolve `'done'` anyway, so the tour can never hang.
   - The `signal` (an `AbortSignal`) cancels speech immediately (pause, previous, exit).
3. **Warm up on Start.** The Start button handler (a real user gesture):
   - unlocks audio (resumes the sound engine's `AudioContext`);
   - waits for device voices to load (`voiceschanged` or 1.5 seconds), then picks and caches the voice for the whole run;
   - speaks a silent or near-silent priming utterance (a single space at volume 0, or the first caption itself if that works more reliably; test which is better on Chrome, Edge and Safari, and log the result);
   - if cloud voices are configured, prefetches audio for the first 5 captions, and prefetches the following ones in the background as the tour progresses (the v2 voice cache). Pre-generated clips, if present, are used first.
4. **The director waits for narration.** Each step's visible hold time becomes `max(readingTime, narrationTime)` (Section 4.2). The next step never starts while the current caption is being spoken.
5. **Pause and resume:** pause aborts the current speech (`signal`). Resume re-speaks the **current caption from the beginning** (short captions make this natural), then continues. Never rely on `speechSynthesis.pause()`/`resume()`.
6. **Speed setting (1×, 1.5×, 2×):** narration rate stays at the user's voice rate (natural speech), and the director still waits for it. At 1.5× and 2×, only non-speech holds shorten (Section 4.4).
7. **Captions-only fallback:** if the device has no usable voice at all, show a one-time HUD notice, "Narration isn't available on this device. Captions will stay on screen longer.", and continue with reading times.

### 3.4 Tests

With a mocked voice engine and a mocked `speechSynthesis`:

- With narration on, every caption in the full tour and the pitch cut is passed to `narrator.say`, exactly once per step, in order.
- The director doesn't advance until `say` resolves.
- A dropped utterance (no `start`) is retried once, then skipped without hanging.
- An utterance that never fires `end` resolves after the timeout.
- Pause during speech aborts it; resume re-speaks the same caption.
- With narration off, `say` is never called.
- The utterance reference is held until `end` (assert the narrator keeps it in a field).

**Acceptance:** with narration on, the voice reads every caption completely, in order, in a single run, on Chrome, Edge and Safari (manual check in TEAM_TODO), and the tour never hangs waiting for speech.

---

## 4. Bug D-3: overlapping elements and steps that go too fast

### 4.1 What happens

During the tour, some elements overlap and some steps fly by:

- The spotlight, cursor, captions, HUD, companion bubbles, caption bar (v2.3 speech style), toasts and celebration overlays stack on top of each other.
- The spotlight sometimes points at where an element *was* before an animation moved it.
- Captions change before they can be read.

### 4.2 Pacing: minimum reading time

Every step with a caption stays on screen at least its **reading time**:

```
readingTime(caption) = clamp(1800 + 55 × characters, 2500, 9000) ms   // at 1×
holdFor(step) = max(step.holdMs ?? 0, readingTime(caption), narrationTime)
```

- `narrationTime` is the actual time the narrator took (0 when narration is off).
- Steps without a caption keep their own `holdMs` (or a 600ms floor).
- After any action that changes the screen (navigate, click that opens a sheet, select, type), wait for the screen to settle (4.3) **before** starting the hold, so the viewer sees the result for the whole hold.
- Typing speed: keep the existing characters per second, but never faster than 18 cps at 1×. Wait for typing to finish before the caption's hold starts.

### 4.3 Wait until the screen is stable

Add an engine helper, `waitForStable(target?, { timeout = 2500 })`:

1. Wait for the next two animation frames.
2. If a target exists: poll its bounding rectangle every frame until it hasn't changed (position and size within 1px) for 3 consecutive frames.
3. Wait for running animations on the target and its overlay ancestors: `element.getAnimations({ subtree: true })` resolved with `Promise.allSettled(animations.map(a => a.finished))`, where supported. For framer-motion, rely on the rectangle stability check.
4. Never wait longer than the timeout (log a debug note if it was hit).

Use it:

- before showing the spotlight or moving the cursor to a target;
- after navigation;
- after opening a sheet;
- after a celebration starts (wait for it to finish or be dismissed);
- after theme changes.

### 4.4 Speed setting

- 1×: exactly as above.
- 1.5× and 2×: divide **non-reading** holds and typing time by the speed. Reading time is divided by `min(speed, 1.25)`. Narration is never sped up, and the director waits for it.

### 4.5 Overlap rules during the demo (layering and sequencing)

1. **One step at a time.** Before a step starts, the previous step's spotlight, cursor ripple and any director-created highlight are removed (with their exit transition finished, or immediately at motion Off). Never two spotlights.
2. **The spotlight follows its target.** While a step holds, track the target's rectangle with a `ResizeObserver` plus a `requestAnimationFrame` loop (only while the spotlight is visible) and update the cutout. If the target disappears, fade the spotlight out.
3. **The HUD avoids the action.** Keep the existing rule (the HUD moves to the top when the target is in the bottom 35%), and make it work by measuring after `waitForStable`. Never move the HUD during a step. Decide its position once per step, before showing the caption, so it doesn't jump around.
4. **The HUD's space is reserved.** While the director runs, add the HUD's measured height to `--bottom-insets` (from v2.2/v2.3), or to a `--top-insets` equivalent when the HUD is at the top, so the app's own toasts, the floating check-in button and the content never sit under it.
5. **Companion speech vs HUD:** mark the HUD with `data-bubble-avoid`, so companion bubbles never cover it.
   - In the caption-bar speech style (v2.3), the caption bar sits under the TopBar and the HUD at the bottom. If the HUD must go to the top for a step, the companion caption bar is hidden for that step. Its line is still in "last thing {name} said".
   - During the demo, page-level companion bubbles are allowed only when the script's step is about the companion. Otherwise, the director sets a temporary demo-only flag that routes companion lines to "last line" silently.
   - Implement this as a runtime flag in the demo context. Don't change companion settings.
6. **Toasts during the demo:** keep them (they're part of what the tour shows), but stack them above the HUD using the insets, and never show more than one at a time (newer replaces older) while the director runs.
7. **Celebrations:** when a step triggers a celebration overlay, the director hides the HUD caption area during the overlay (it keeps the progress bar and the pause button visible above the overlay; the HUD is on `--z-demo`, above `--z-celebration`), waits for the overlay to finish or presses its "Continue" via the existing step, then shows the next caption. No caption is shown behind or on top of a celebration.
8. **Cursor:** hide the demo cursor during typing (the caret is enough) and during holds. Show it only while moving to a click target and for the click ripple.
9. **Sheets:** spotlights on elements inside sheets are computed relative to the sheet's overlay root, which sits inside the app frame (v2.2/v2.3). Spotlights never extend outside the frame on desktop; clip the cutout to the frame's rectangle.
10. **The theme crossfade overlay** (v2 theme switching) must finish before the next step. `waitForStable` includes it.

### 4.6 Duration report

After the fixes, measure the full tour and the pitch cut at 1× with narration off and on (device voice, jsdom-mocked timings in tests; real timings if a browser is available), and write the numbers in `docs/demo-script.md`. Expect the full tour to grow by about 30–60%, which is fine. For the pitch cut, report the real duration and note for presenters that **presenter mode** is recommended for the live pitch (the presenter controls the pace).

Don't cut any steps or captions to shorten it. That's the team's call; put the numbers in `docs/TEAM_TODO.md`.

### 4.7 Tests

- `readingTime` formula values (short, long, clamps).
- The engine starts a step's hold only after `waitForStable` resolves (fake timers + mocked rects).
- Two consecutive spotlight steps never coexist (assert the DOM has at most one spotlight element at every tick).
- With a target that moves during a sheet animation, the spotlight's final rectangle matches the target's final rectangle.
- The HUD position is decided once per step.
- Only one toast is visible during the demo.
- No caption is shown while a celebration overlay is open.
- At motion Off, every transition is instant, and holds still apply.

**Acceptance:** nothing overlaps confusingly at any point in the tour, the spotlight always frames the right thing, and every caption stays up long enough to read (or to be fully narrated).

---

## 5. Requested change D-4: only three themes in the demo, one second each

### 5.1 What the team wants

The theme showcase (Chapter 1, "Make it yours", in the full tour) cycles through many themes quickly, which is unpleasant to watch. Show exactly **three** themes instead: one black, one white and one colorful, with each fully visible for **1 second**. The colorful one stays for the rest of the demo.

### 5.2 The new sequence

In `src/demo/director/` (the `cycleThemes` custom action, or wherever the theme cycle lives), replace the cycle with a constant:

```ts
// Three looks, one second each: dark, light, then the demo's own color theme,
// which we keep for the rest of the tour. Fewer, slower changes are easier
// on the eyes than a fast slideshow of every theme.
export const DEMO_THEME_SEQUENCE = [
  { id: 'ink',    label: 'Black' },     // true black (high-contrast dark)
  { id: 'pearl',  label: 'White' },     // true white (high-contrast light)
  { id: 'lagoon', label: 'Color' },     // the demo's default; stays on
] as const;
export const DEMO_THEME_VISIBLE_MS = 1000;
```

**Behavior:**

1. For each theme in order:
   - apply it through the normal theme API (with its crossfade);
   - `waitForStable` (the crossfade finishes);
   - hold for `DEMO_THEME_VISIBLE_MS` **after** the crossfade completes. At 1.5× and 2×, keep 1 second, because the team asked for exactly 1 second each.
2. **The last theme is the demo workspace's own theme** (Lagoon in the seed). If the team changes the demo's base theme later, the third item must follow it. Read it from the seeded settings instead of hardcoding `lagoon`, falling back to `lagoon`.
3. **The existing caption for this step** ("Fifteen themes, from bright to high contrast.") stays exactly the same, and it's shown and narrated **once**, for the whole three-theme sequence, not per theme. The step's total hold is `max(3 × (crossfade + 1000ms), readingTime, narrationTime)`. If narration is longer than the three themes, the last theme simply stays while the caption finishes.
4. **The step leaves the app on the colorful theme.** Make sure no later step or chapter setup changes the theme, except the Chapter 9 preset demonstration (Low sensory → Sandbar) and its restore, which must restore exactly the colorful theme from this step.
5. **The "Try a look" demonstration (v2.1, Chapter 9)** shows a single look and returns. Keep it, but apply the same 1-second minimum visible time and the `waitForStable` rule, so it isn't a flash either.
6. **The theme crossfade itself is unchanged** (250ms at Calm/Lively; instant at Off).
7. At motion level Off, themes switch instantly, and each still stays 1 second.

**If** the team's existing script uses a different theme cycle elsewhere (for example in the pitch cut), apply the same three-theme sequence there too, and record it in the script diff. Don't add a theme cycle where none existed.

### 5.3 Tests

- The theme step applies exactly `ink → pearl → <base>` in order.
- Each theme is the active theme for ≥ 1000ms after its crossfade (fake timers).
- After the step, the active theme is the base theme, and it remains so through Chapter 8.
- The caption for the step is shown and narrated once.
- The Chapter 9 restore returns to the base theme.

**Acceptance:** viewers see black, white, then color, one second each, and the tour continues in color.

---

## 6. Bug D-5: the play/pause button is unreliable

### 6.1 What happens

The play/pause button is sometimes hard to press. When the press does register, the demo sometimes resumes by itself and keeps playing. Presenters need to pause at any moment, reliably.

### 6.2 Likely causes (check all)

1. **Double toggling.** The button toggles on `click`, and a global keyboard handler toggles on Space. When the button has focus and someone presses Space, both fire, so the state flips twice and nothing seems to happen. Also check whether the button toggles on both `pointerdown` and `click`.
2. **Re-rendering mid-press.** The HUD re-renders on every caption or progress tick. If the button element is re-created (a changing `key`, or a conditional render switching between a Play button and a Pause button as two different elements), a press that starts on one element and ends on another is lost.
3. **The engine ignores pause mid-step.** Pause only sets a flag checked **between** steps. Any pending `await wait(ms)`, a typing loop, a narration `end` callback, a `waitFor` poll or a speed-up timer resolves later and calls `next()`, so the tour continues.
4. **Callbacks resume the tour:** the narration `end`, the end of a celebration, `visibilitychange` handlers or the "Continue" press inside a step call `play()` or `next()` unconditionally.
5. **The demo clock keeps running while paused.** Steps that depend on time (the focus timer at 60× speed, the bridge countdown) advance during the pause and trigger app events (the focus end alert, the outcome sheet). It looks like the demo resumed.
6. **Hit area and layering:** the button is small on mobile (collapsed "⋯" menu), or something sits above it at times (the spotlight overlay, the celebration overlay, a sheet's backdrop, the toast layer), so taps miss.
7. **The director's own simulated pointer events** bubble to document-level listeners that the HUD also uses.

### 6.3 Required fix: a real state machine with cancellation

1. **One source of truth.** Implement the director state as an explicit state machine in `engine.ts`:
   - states: `idle → starting → running ⇄ paused → finished`, plus `exiting`;
   - one store, read by the HUD through `useSyncExternalStore`;
   - transitions are the only way to change state; invalid transitions are ignored and logged in debug mode.
2. **Every awaited operation is cancellable.** Each step runs with an `AbortController`. Pausing aborts it. Every helper takes the `signal` and stops immediately when it's aborted:
   - `wait`, `waitFor`, `waitForStable`;
   - typing, the cursor movement, the spotlight transition;
   - `narrator.say`;
   - custom actions such as the speed-up loop or the breathing cycles.

   No callback may call `next()` or `play()` directly. They only resolve or reject their promise, and the run loop checks the state before doing anything.
3. **Resumable steps.** On pause, record where the current step was:
   - **for typing:** the number of characters already typed;
   - **for holds:** the remaining hold time;
   - **for narration:** "re-speak this caption";
   - **for custom actions:** they declare whether they're resumable (`resume()` continues) or restartable (start the step again from the beginning).

   On resume, continue from there. Actions that are not safe to repeat (a click that toggles something) are never repeated: the step records "action done", and only its remaining hold runs after resume.
4. **Freeze the demo clock while paused.** On pause, set the demo clock speed to 0 (`setDemoSpeed(0)`), remembering the previous speed. On resume, restore it. While paused, timers in the app that depend on `now()` stay frozen: the focus block doesn't end, and the bridge countdown doesn't move. Use the existing clock API. Don't change how the clock works outside the demo.
5. **Pause also pauses ambience and voice:** narration is aborted (re-spoken on resume). Any demo-started ambience sound and app sounds triggered by the step are paused with the sound engine's suspend (`AudioContext.suspend()` only if it's the demo that owns the context at that moment; otherwise fade out and remember to restart on resume). Animations already running in the app may finish; that's fine.
6. **Toggle handling:**
   - The play/pause button handles **only** `onClick`. No `onPointerDown` toggles.
   - The global keyboard shortcut handler (Space, K, P) ignores events whose `target` is inside the HUD or any `button`, `input`, `textarea`, `select` or `[contenteditable]`, and calls `preventDefault()` only when it acts.
   - A toggle guard ignores a second toggle within 300ms (it stops double-firing from any source).
   - Media keys (Media Session `play`/`pause` handlers) call the same `toggle()` and respect the same guard.
7. **Stable button element:** render one `<button>` that never unmounts while the director runs:
   - its icon and `aria-label` switch between "Pause demo" and "Play demo", and it carries `aria-pressed`;
   - give it a stable `key`;
   - memoize the HUD controls, so caption and progress updates don't re-render them (split the HUD into a memoized `Controls` component and a `Caption` component that subscribes separately).
8. **Hit area and layering:**
   - the button's visual size stays the same, with a hit area of at least 48×48px (padding or an invisible extension);
   - the HUD sits on `--z-demo` (above celebrations, sheets, toasts and the spotlight), with `pointer-events: auto` on the HUD and `pointer-events: none` on the spotlight overlay;
   - on mobile, play/pause is **always visible**, even in the collapsed HUD. Only the secondary controls (speed, captions, narration, previous) go into the "⋯" menu. That's a layout fix to the collapsed state only; it keeps the same button design.
9. **No auto-resume, ever.** Nothing resumes a paused demo except an explicit user action: the play button, Space/K/P, a media key or Next/Previous. That excludes visibility changes, the narration ending, celebrations ending, route changes and window focus. If the tab is hidden while running, **auto-pause** (a safe default for presenters who switch windows). On return, stay paused with the HUD showing "Paused".
10. **Next and Previous while paused** move to the next or previous step and stay paused (presenter mode behavior). In autoplay mode, Next while paused also stays paused, so the presenter decides when to continue. Show the new step's caption, narrated if narration is on, and then wait.
11. **Clear feedback:** when paused, the HUD shows a "Paused" label next to the caption (using the existing HUD text style, and announced via `aria-live="polite"`), and the progress bar stops.

### 6.4 Tests

- **State machine:** every valid and invalid transition.
- **Pause at 30 random points** across the full tour (seeded random, fake timers): after pausing, advance fake time by 60 seconds. The step index, the caption, the typed text length and the demo clock (`now()`) are unchanged, and nothing called `next()`.
- **Resume after each of those pauses:** the tour continues from the right place; typing continues where it stopped; the remaining hold is respected; narration re-speaks the caption.
- **Space on the focused button** toggles exactly once.
- **Two clicks within 300ms** toggle once.
- **A pointerdown on the button followed by a HUD re-render, then pointerup and click,** still toggles: the button element is stable.
- **A narration end event during a pause** doesn't resume.
- **A celebration end during a pause** doesn't resume.
- **Tab hidden while running** pauses; returning stays paused.
- **The demo clock** speed is 0 while paused and restored on resume (including during the 60× focus speed-up).
- **On a 390px HUD,** the play/pause button is visible and its hit area is ≥ 48×48.

**Acceptance:** pause works on the first press, every time, at any moment, and the demo stays paused until someone presses play.

---

## 7. Regression checks specific to the demo

After all fixes:

1. **Script snapshot comparison** (Section 1.1): identical except the documented theme step and timing/metadata fields. Captions identical (a test asserts each caption string equals the "before" snapshot).
2. **Full tour, pitch cut and presenter mode,** at 1× and 2×, with narration on and off, with forced cache (offline), twice each:
   - no skipped steps in the debug panel;
   - no console errors;
   - no `BulkError`;
   - every caption shown, and narrated when narration is on.
3. **The demo workspace isolation:** the main database's row counts are unchanged before and after running the demo.
4. **`/demo?autostart=…`** works after the Start tap.
5. **"Leave demo"** works from every chapter, including while paused and during narration.
6. **Check-in button modes (v2.3)** `smart`, `tabbar` and `hidden`: the tour runs in each (the `openCheckIn` custom action).
7. **Speech styles (v2.3)** `bubbles`, `captions` and `off`: no overlap with the HUD in any of them.
8. **The v1 100-second pitch path** still works manually in the demo workspace.
9. **All suites** (v1 to v2.3, the dictation freeze test, the demo reference test, the seed test) and the build are green.

---

## 8. Debug panel improvements (developer-only, `?demoDebug=1`)

To make these bugs easy to diagnose in rehearsals, extend the existing debug panel. It must never appear without the query parameter, and the visible tour stays the same:

- a live log with timestamps of: state transitions, step start/end, `waitForStable` durations (and timeouts), narration (start, end, retry, skip, abort), theme changes, toggles (with their source: click, key, media) and ignored toggles (the guard);
- the current demo clock time and speed;
- a "Copy log" button that copies the log as text to the clipboard, so the team can paste it in a message.

---

## 9. Manual rehearsal checklist (write it into `docs/TEAM_TODO.md`)

- Run the full tour on the presentation laptop in Chrome **and** Edge, with narration on, and confirm every caption is read.
- Press pause at 5 random moments (including during typing, narration, the focus speed-up and a celebration). It must stop immediately, stay stopped for 30 seconds, and resume correctly.
- Use Space and a presentation clicker (→ for next) in presenter mode.
- Restart the demo three times in a row quickly. There must be no error.
- Watch the theme step: black, white, color, one second each.
- Check that nothing overlaps (HUD, captions, toasts, bubbles) at 1× in Lagoon, with text scale 1 and 1.3.
- Note the real durations of the full tour and the pitch cut, and decide whether to present with presenter mode.

---

## 10. Test summary (new tests to add)

| Area | Tests |
|---|---|
| Seed (D-1) | Idempotent; concurrent; forced reseed; rollback on failure; main-workspace guard; unique natural keys; planted keys unchanged |
| Narration (D-2) | Every caption narrated in order; waits for speech; retry and skip; end timeout; abort on pause; re-speak on resume; off means silent; utterance reference held |
| Pacing and overlap (D-3) | `readingTime`; hold after `waitForStable`; one spotlight; spotlight follows target; HUD position fixed per step; insets reserved; single toast; no caption during celebrations; motion Off |
| Themes (D-4) | Sequence; 1-second visibility; base theme persists; caption once; Chapter 9 restore |
| Play/pause (D-5) | State machine; random pauses with frozen time and clock; resume continuity; Space/click/guard; stable button; no auto-resume from callbacks; hidden-tab auto-pause; mobile hit area |
| Regression | Caption snapshot equality; script diff limited to the allowed changes; demo reference ids; all earlier suites |

---

## 11. Order of work

1. Baseline, tag, branch, script snapshot (Section 1.1).
2. **D-1, the seed** (blocking: nothing else can be tested reliably while seeding can fail). Commit.
3. **D-5, the state machine, cancellation and play/pause** (the run loop changes; D-2 and D-3 build on it). Commit.
4. **D-2, the narrator queue and narrating every caption.** Commit.
5. **D-3, pacing, `waitForStable` and the overlap rules.** Commit.
6. **D-4, the three-theme sequence.** Commit.
7. Debug panel improvements (Section 8). Commit.
8. Regression checks (Section 7), the duration report (4.6), the script snapshot comparison.
9. Docs and logs (Section 1.3), the TEAM_TODO rehearsal checklist (Section 9).
10. Merge `demo-fixes` into `main` only if everything is green, tag `demo-fix-1`, and push if possible. Otherwise document what's missing.
11. A short final message to the team, in plain words:
    - what was wrong with each of the five issues and how it's fixed;
    - the new durations;
    - the rehearsal checklist.

---

## 12. Definition of done

- [ ] No `BulkError` or any seed error in any start or restart scenario; the seed is atomic and idempotent.
- [ ] With narration on, every caption is read fully, in order, in one run; the tour never hangs on speech.
- [ ] Every caption stays up for at least its reading time; steps wait until the screen settles; nothing overlaps (spotlight, cursor, HUD, captions, bubbles, toasts, celebrations).
- [ ] Theme step: black → white → color, 1 second each; the color theme stays for the rest of the tour.
- [ ] Play/pause works on the first press, at any moment; the demo never resumes by itself; the demo clock freezes while paused.
- [ ] Captions, chapters and steps are unchanged except the documented theme step; the demo's look is unchanged.
- [ ] All suites green, the dictation freeze test green, both demos, presenter mode and the v1 pitch path verified twice.
- [ ] Docs, logs, changelog, TEAM_TODO and the progress report updated.

---

## 13. Message to paste into Claude Code

```
Read docs/TIDE_DEMO_FIX_PROMPT.md completely, then CLAUDE.md, the end of
docs/AI_DEV_LOG.md, docs/demo-script.md, and all the code under src/demo/,
the seed, the voice engine and the demo clock.

Fix only the demo bugs described there: the dayWraps BulkError when
seeding, narration that doesn't read every caption, overlapping elements
and steps that go too fast, the theme step (black, white, color, one second
each), and the play/pause button that misses presses or resumes by itself.
Don't change the demo's chapters, steps, captions or look, and don't change
anything outside the demo. Dictation stays frozen.

Follow the order in Section 11. For each bug: reproduce it, find the root
cause, fix it, add the tests listed, run every suite (including test:v1
and the dictation freeze test), write a first-person log entry, and commit.
Don't ask us to confirm between bugs.

At the end, compare the script snapshot (captions must be identical), run
the full tour, the pitch cut and presenter mode twice each with narration
on and off, report the durations, update the docs and the rehearsal
checklist, merge to main only if everything is green, and tell us in plain
words what was fixed.
```

*End of document.*
