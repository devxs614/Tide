# TIDE v2.3 — Focused Fixes: Check-in Button, Phone Numbers, Companion Speech, Tasks Width

> **Cómo usar este archivo (para el equipo, en español)**
>
> Este prompt corrige cuatro cosas y agrega funciones pequeñas alineadas con cada una, **sin dañar nada de lo que ya funciona**:
>
> 1. **Botón "Check in" flotante:** se vuelve dinámico. Se esconde al bajar, aparece al subir, se encoge cuando estorba, no aparece donde no sirve y muestra el color de tu último estado. Al dejarlo presionado abre un check-in rápido de dos toques. En Settings se puede elegir entre botón flotante inteligente, botón en la barra de pestañas u oculto.
> 2. **Teléfono de contactos:** el campo solo admite números. El código de país va en un selector aparte (+52, +1…). Los contactos ya guardados se limpian sin perder nada, y se agregan botones de Llamar, Mensaje y WhatsApp.
> 3. **Textos de los compañeros:** nunca se salen del área del celular. Además hay una opción de "barra de subtítulos" en lugar de burbujas.
> 4. **Tasks:** la pantalla ya no se agranda más allá del celular en computadora. Las columnas se deslizan de lado dentro del marco.
>
> **Pasos:** guarden el archivo como `docs/TIDE_V2_3_FOCUSED_FIXES_PROMPT.md`, abran Claude Code en el repo y peguen el mensaje del final (Sección 12).

---

## 0. Mission (for Claude Code)

Tide is feature-complete (v1, v2, v2.1 and the v2.2 sweep). The team tested it again and wants four things fixed properly, plus small features that go naturally with those fixes. Earlier fixes for items 2–4 may have been partial, so **verify the current state in the code first**: don't assume the v2.2 sweep solved them.

**The prime directive:** fix and add **without breaking or changing anything else.** The same screens, words, colors, flows, data and features, except exactly what this document describes. The voice dictation code stays frozen. All test suites, both demo tours (full and pitch) and the v1 pitch path must keep working.

Work autonomously, in the order of Section 10, without asking the team to confirm. For each item: understand → reproduce → fix or build → verify → log → commit → continue. Stop only if the environment can't run Node, or if a change would delete work the team made by hand.

Read first: `CLAUDE.md`, the end of `docs/AI_DEV_LOG.md`, `docs/BUG_SWEEP.md` (if it exists), `docs/CODE_WALKTHROUGH.md`, and the code for the FAB, the companion speech (`CompanionSay`, overlay roots, Floating UI usage), the trusted contacts and campus support forms, the Support and crisis screens' contact links, the Tasks board, and the app frame (`PhoneFrame`).

---

## 1. Rules

### 1.1 Safety net

1. Run `git status`. Commit any uncommitted team changes as `chore: save team changes before v2.3` (never discard them).
2. Run every suite and the build. Record the baseline in the log. Fix anything red first.
3. Tag `v2.2-baseline` (add `-2` if it exists) and work on the branch `v2.3-focused-fixes`.
4. If Playwright can run: capture **visual baseline screenshots** of every main route and open sheet at 390×844 and 1280×800 (demo workspace, motion off, text scale 1), as in the v2.2 prompt. At the end, compare them. The only allowed differences are the ones this document intends:
   - the check-in button's look and states;
   - the Tasks page at 1280px (it now stays inside the frame);
   - contact forms and contact rows;
   - companion speech position where it used to overflow.

   Any other difference is a regression: fix it.

### 1.2 What must not change

- Any feature, screen or text that isn't part of the four items.
- Data meanings. Additive optional fields are allowed. Never delete user data.
- AI prompts, the pattern engine, seed patterns, demo captions.
- The dictation code (the freeze test must pass).
- The crisis screen: it never shows the check-in button, the companion or captions.

### 1.3 Comments and logs

- Comments are natural and explain **why**. At each fix site, add one or two lines on what used to go wrong.
- `docs/AI_DEV_LOG.md`: "Before" and "After" entries per item, in the first person, honest that the code is AI-generated.
- Update `AI_ATTRIBUTION.md`, `docs/DECISIONS.md`, `docs/CODE_WALKTHROUGH.md`, `CHANGELOG.md` ("v2.3"), `docs/TEAM_TODO.md` (manual checks on real phones) and today's progress report draft (in the team's voice).

### 1.4 Commits

One commit per item (or more, for big items): `fix(<scope>)` or `feat(<scope>)`, a short natural body, and the `AI-Generated: Claude Code` trailer. Scopes: `checkin-button`, `contacts`, `speech`, `tasks-layout`.

---

## 2. Item 1: A dynamic check-in button

### 2.1 The problem

The floating "Check in" button sits on every screen, all the time. It covers content (cards, text, list items), it appears where it makes no sense, and with large text its label covers even more. The team asked to remove it or make it more dynamic. We make it **dynamic, and optional**: it appears when useful, gets out of the way when not, and the person can choose a different placement or hide it.

### 2.2 New setting: where the check-in button lives

Add `checkin.buttonMode` to Settings → Check-in, with a live preview:

| Value | Label | Behavior |
|---|---|---|
| `smart` (default) | "Floating, smart" | The dynamic floating button described in 2.3 |
| `tabbar` | "In the tab bar" | No floating button. A center "Check in" item appears in the tab bar, between Tasks and Toolkit (6 items). The tab bar's layout adapts: at frame widths below 360px, or at text scale ≥ 1.3, it shows icons only, with accessible names and tooltips |
| `hidden` | "Hidden" | No floating button and no tab bar item. Check-in stays available from the Today "Check in" quick action, the state card's "Check in again", the `c` keyboard shortcut and the TopBar menu ("Check in") |

- Existing users and new users get `smart`. That's a visible change from the always-on button, and it's the requested fix; log it.
- Add the setting to the settings search index (synonyms: "floating button", "check in button", "fab", "plus button").
- The **Low sensory** preset sets `smart` too (it isn't a sensory setting; don't change it).

### 2.3 Smart floating behavior (`smart` mode)

Implement in the existing FAB component (keep its look at rest: same size, color, ledge and icon at text scale 1). Add these behaviors:

1. **Where it shows.** It shows only on Today, Tasks, Toolkit (list), Patterns, Shore and Calendar. It is **hidden** on:
   - Focus, Wrap-up, Onboarding, Companion Studio, Settings pages, the Completed archive, the Shore collection, the Support and crisis screens, and the demo launcher;
   - while any sheet, dialog or celebration overlay is open;
   - while the on-screen keyboard is likely open (an input or textarea has focus).

   Showing and hiding uses a scale and fade of 200ms (instant at motion Off).
2. **Scroll-aware.** Scrolling down more than 24px hides the button (it slides down behind the tab bar). Scrolling up by 12px or more, or reaching the top or bottom of the content, shows it again. Use a passive scroll listener on the main scroll container, throttled with `requestAnimationFrame`. Never hide it while it has keyboard focus.
3. **Compact when it would cover content.**
   - At rest, it's the circle with the visible "Check in" label (the current design).
   - It switches to **compact** (just the circle; the label becomes its accessible name and a tooltip on hover or focus) when:
     - the text scale is ≥ 1.3, or the frame is narrower than 360px;
     - the person is scrolling;
     - the content directly under it is interactive: check with `elementFromPoint` at its center, after layout, debounced 150ms. If the element under it is a button, link, input or card, go compact and shift 12px to the side away from the element's center if that frees it.
4. **Never blocks the end of content.** The main scroll container gets bottom padding equal to the tab bar height + the button's protrusion + 16px, measured live (reuse or create `--bottom-insets` from the v2.2 sweep). So the last item can always scroll fully above the button.
5. **State ring.** A 3px ring around the button in the color of the latest check-in's quadrant (from the last 6 hours), with a tiny shape marker in the color-blind palette. No ring if there's no recent check-in. The button's accessible description says "Last check-in: Ebb, 3:40 pm" when a ring shows. Use theme tokens only.
6. **Gentle invitation (respects settings).** If `checkin.nudgeTimes` (v2) has a time that just passed and there's no check-in since, the button shows a soft halo for 6 seconds (two slow pulses at Lively, a static halo at Calm, nothing at Off), once per nudge time. No sound, no badge counts, no repeated pulsing. Respect "Low sensory": no halo.
7. **Long-press or right-click opens Quick check-in** (2.4). A normal tap opens the full check-in as today. On keyboard: Enter opens the full check-in; Shift+Enter (or the context menu key) opens Quick check-in. A one-time hint after the third full check-in: "Tip: press and hold for a quick check-in." Dismissible, never shown again.
8. **Drag to move (optional placement).** Long-press and drag only when "Let me move the button" is on (`checkin.buttonMovable`, default off). It snaps to bottom-left, bottom-center or bottom-right (`checkin.buttonSide`, default center). This exists for left-handed people and for screens where the center covers content. Provide the same choice as a select in Settings, so moving never requires dragging.
9. **Demo safety.** The demo director clicks `[data-demo-id="fab-checkin"]` on Today. In `smart` mode on Today at the top of the page, the button must be visible and expanded. In `tabbar` and `hidden` modes, the director must still work:
   - add a custom action `openCheckIn` that uses the button if present, else the tab bar item (`data-demo-id="tab-checkin"`), else the Today quick action (`data-demo-id="qa-checkin"`);
   - update the scripts to use it;
   - keep the old id on the FAB;
   - seed the demo workspace with `checkin.buttonMode = 'smart'`.

### 2.4 New aligned feature: Quick check-in

A two-tap check-in for moments when typing feels like too much.

- A small popover (anchored to the button, inside the app frame, using the overlay rules from Item 3) or a compact bottom sheet on narrow frames.
- **Content:** "How's the water?" (literal mode: "Choose how you feel right now.") and the four quadrant buttons in a 2×2 grid. Each shows its color, name and literal subtitle (Surge: "High energy, unpleasant", and so on).
- **Tap one:** step 2 shows the 4 simple-vocabulary words for that quadrant (from v2's simple list) as chips, plus "Skip".
  - Tapping a word saves.
  - "Skip" saves with no emotion word, with energy and pleasantness set to the quadrant's center (±3).
- Saves a normal `CheckIn` (with a new optional `quick: true` field), so every v1/v2 consumer (Today state card, Day Mode banner, celebrations, patterns, shore, companion reactions) works unchanged. No AI call, no free text, so the safety layer isn't needed.
- After saving: the usual toast and companion reaction, plus a link in the toast: "Add more?" (opens the full check-in prefilled with the quadrant).
- Also reachable from the Today state card ("Quick check-in" link) and with the keyboard shortcut `q` (add it to the shortcuts sheet).
- Back and Cancel follow v2.1's navigation contract.

### 2.5 Tests and acceptance

- **Unit:**
  - visibility rules per route and state (sheet open, input focused, crisis);
  - scroll-direction logic with thresholds;
  - compact rules (text scale, frame width, interactive element under it);
  - bottom insets;
  - the quadrant ring color mapping;
  - the nudge halo once per time.
- **Flow:**
  - Quick check-in saves a CheckIn with the right quadrant and word, and the Today state card updates;
  - `tabbar` mode renders the sixth tab and it opens the check-in;
  - `hidden` mode keeps the quick action and the shortcut working.
- **Audit:** on every route at all text scales, the button never covers content at the end of the scroll, and it's absent where specified.
- **Demo:** the full tour and the pitch cut run in all three modes (switch the setting in the demo workspace between runs).

**Acceptance:** the button no longer sits over content all the time; it appears where it helps; the person can choose floating, tab bar or hidden; Quick check-in works in two taps.

---

## 3. Item 2: Phone numbers accept only numbers

### 3.1 The problem

In contacts ("People you trust", and the campus support phone), the phone field accepts letters, so a contact can be saved with a value that no phone can dial, and the Call/Text buttons silently fail. The team wants the field to accept **only numbers**.

### 3.2 New contact phone input (`PhoneInput` component)

Replace the phone text field (wherever a phone-type value is entered) with a two-part control:

1. **Country code selector.** A compact select showing the flag-free label "+52 Mexico". Don't use flag emojis: screen readers read them inconsistently, and some don't render.
   - Options, in this order: +52 Mexico, +1 United States / Canada, then an alphabetical list of common codes (+34 Spain, +57 Colombia, +54 Argentina, +56 Chile, +51 Peru, +593 Ecuador, +502 Guatemala, +503 El Salvador, +504 Honduras, +505 Nicaragua, +506 Costa Rica, +507 Panama, +58 Venezuela, +591 Bolivia, +595 Paraguay, +598 Uruguay, +44 United Kingdom, +49 Germany, +33 France, +39 Italy, +81 Japan, +82 South Korea, +86 China, +91 India).
   - Plus "Other", which shows a small digits-only field for a custom code (1–3 digits).
   - The default is the device's region if it's easy to infer from `navigator.language` (es-MX → +52, en-US → +1); otherwise +52.
2. **Number field: digits only.**
   - `type="tel"`, `inputMode="numeric"`, `pattern="[0-9]*"`, `autoComplete="tel-national"`, font-size ≥ 16px (prevents iOS zoom).
   - On every change (typing, paste, autofill, dictation if any), strip everything that isn't 0–9. Use a controlled value, and keep the caret position after stripping.
   - If characters were removed, show a polite inline hint once per editing session: "Only numbers here. The country code is set on the left." (`aria-live="polite"`).
   - **Paste:** if the pasted text starts with "+" followed by a known code (e.g. "+52 81 1234 5678"), set the country selector and keep the rest as digits. If it starts with "00" + code, treat it the same way.
   - **Display formatting:** show the digits grouped for readability (+52: `81 1234 5678`; +1: `(555) 123-4567` in the read-only display only). The input field itself shows plain digits with spaces added visually via a separate formatted preview line under it ("Will call: +52 81 1234 5678"). The stored value is digits only.
3. **Validation** (on blur and on save):
   - **+52:** exactly 10 digits.
   - **+1:** exactly 10 digits.
   - **Others:** 6–14 digits.
   - Error text (neutral, linked with `aria-describedby`, `aria-invalid` on the field): "This number needs {n} digits." or "That looks too short for a phone number."
   - Save is blocked for that field only, and focus moves to it.

### 3.3 Data and migration (never lose data)

- **Contact model:** keep v1's `{ name, method, value }` and add the optional fields `countryCode?: string` (digits, e.g. "52") and `national?: string` (digits). For phone-type methods, new saves write `countryCode` + `national`, and also write `value` as the full dialable string ("+528112345678") for backward compatibility with every existing reader.
- **Campus support:** add `phoneCountryCode` and `phoneNational` the same way, and keep `phone`.
- **One-time migration** at boot (in each workspace), for existing phone-type values:
  - Parse `value`: if it starts with "+" or "00", detect the country code with the list above; otherwise assume the default code.
  - Keep the digits as `national`.
  - **If the original contained letters or fails validation:** keep the original `value` untouched and set `needsReview: true`.
  - **Never delete** a contact or rewrite a non-phone method's value.
- **Non-phone methods** (if the model has any, such as a messaging handle): unchanged; letters stay allowed there. Don't break them.

### 3.4 New aligned features for contacts

1. **Quick contact actions.** Each trusted contact on Support (and in the crisis screen's "People you trust" section) shows the buttons that fit its data:
   - "Call" (`tel:+<code><national>`);
   - "Text" (`sms:+<code><national>`);
   - "WhatsApp" (`https://wa.me/<code><national>`, opened in a new tab with `rel="noopener noreferrer"`). WhatsApp is shown only if `contact.whatsapp` is true: a new optional checkbox "This number has WhatsApp" in the contact form, default off.
   - Buttons are disabled with an explanation when `needsReview` is true.
   - Tide never sends anything automatically. These links only open the person's own apps (the existing rule).
2. **Review banner.** If any contact has `needsReview`, Settings → People & support shows a calm banner: "One contact's number may not work. Review it." It links to the contact, which opens with the original value shown above the new fields ("Saved as: call mom 811…") so the person can re-enter it.
3. **Read the number aloud.** A small "Read aloud" button on each contact reads the number digit by digit in groups ("plus five two, eight one, one two three four…"), through the voice engine, for people who prefer hearing it.

### 3.5 Tests and acceptance

- **Unit:**
  - `sanitizeDigits`;
  - paste parsing with "+52…", "0052…", "+1 (555)…" and plain digits;
  - validation per code;
  - `toDialable`;
  - the migration cases (clean number, formatted number, number with letters, non-phone method untouched);
  - link builders.
- **Component:**
  - typing "abc123" leaves "123" and shows the hint;
  - the country selector changes the validation and the preview;
  - save is blocked when invalid;
  - the WhatsApp checkbox shows the button;
  - `needsReview` disables the actions and shows the banner.
- **Flow:** add a contact in onboarding step 12 and in Settings, and see it with working actions on Support (assert the `href` values).

**Acceptance:** phone fields accept only numbers; the country code is chosen separately; old data is preserved and flagged when unclear; call, text and WhatsApp links always use valid numbers.

---

## 4. Item 3: Companion text never leaves the phone area

### 4.1 The problem

Companion speech bubbles still render partly outside the phone-shaped app area, especially on desktop, where Tide sits in a centered frame inside a wide window. They also cover important content on tight screens.

### 4.2 Verify the current state first

Check whether the v2.2 fixes exist and work:

- an overlay root **inside** the `[data-app-frame]` element;
- Floating UI with `boundary` set to the frame;
- the `avoidElements` middleware;
- inline speech slots on Focus, Box breathing, Bridge and Wrap-up.

Reproduce with:

- every companion and Literal mode (the longest lines);
- text scales 1 and 1.5;
- viewports 1280×800 (frame on desktop), 390×844 and 320×640;
- every placement (TopBar head, Today header, Shore near both edges, Companion Studio, check-in sheet header, Unstick, Focus, Bridge, Box breathing, Wrap-up, empty states).

Record what fails in the log.

### 4.3 Required behavior (complete any missing parts)

1. **One overlay root inside the frame:** `#tide-overlays` is a child of the frame, `position: absolute; inset: 0; pointer-events: none` (its children re-enable pointer events), with `overflow: clip`, so nothing in it can ever paint outside the frame. Sheets keep their own overlay roots inside the frame too. If the frame on mobile is the full viewport, this is automatically correct.
2. **Floating UI boundary = the frame,** with 12px padding, for bubbles, tooltips, coach marks, menus, item popovers, Quick check-in and toasts. Also use `size()` to cap the bubble's `maxWidth` at `min(280px, frameWidth − 24px)` and its `maxHeight` at the frame's available height minus 24px.
3. **Text box:** `overflow-wrap: break-word` (never `anywhere`), no fixed height, padding 12px 16px, font size following the text scale. If the content is still taller than the space, the bubble becomes scrollable internally, with no cut-off text.
4. **Avoid important content:** `data-bubble-avoid` on the timer, breathing square, countdowns, inputs, candidate cards, the mood map, primary buttons and open sheets. If every placement collides, use the inline slot or the caption bar (4.4).
5. **Inline slots by default** on Focus, Box breathing, Bridge and the Wrap-up steps. These are part of the layout flow, with a reserved minimum height, so the companion's words sit next to it and never float over content.
6. **Sheets dismiss page bubbles** and always paint above page companions. Check the z-index scale; no stray stacking contexts.
7. **Never on the crisis screen.**

### 4.4 New aligned feature: speech style setting

Add `companion.speechStyle` to Settings → Companion (with a preview in Companion Studio):

| Value | Label | Behavior |
|---|---|---|
| `bubbles` (default) | "Speech bubbles" | The current behavior, with the fixes above |
| `captions` | "Caption bar" | Companion lines appear in a slim caption bar at the **top of the app frame**, under the TopBar: a small companion head + the line. It never overlaps content, because it pushes content down by its height while visible (animated at Calm/Lively, instant at Off) and disappears after the read time. Good for people who find floating bubbles distracting, and for large text |
| `off` | "No speech" | The companion animates but doesn't show lines. Lines are still available through the companion's tap (a small "What did {name} say?" popover inside the frame showing the last line) and are still read aloud if "Read my companion's words" is on |

Also add **"Last thing {name} said"**: tapping the companion head in the TopBar shows its most recent line (from any screen, in the last 10 minutes) in the current speech style, so nothing important is missed if a bubble disappeared.

### 4.5 Tests and acceptance

- **Unit and component:**
  - the frame boundary computation (a frame of 390 inside a 1280 viewport, with an anchor at the frame's right edge: the bubble stays inside);
  - the overlay root is a child of the frame;
  - the avoid fallback leads to the inline slot or captions;
  - captions push content and don't overlap it;
  - the speech style `off` shows nothing automatically, and the last-line popover works.
- **Audit** (if Playwright is available): the frame-boundary and overlay-coverage checks for every placement × companion × width × text scale. Zero elements outside the frame.

**Acceptance:** no companion text ever appears outside the phone area or over key content, in any placement, size or mode; the person can choose bubbles, captions or no speech.

---

## 5. Item 4: The Tasks screen no longer grows beyond the phone

### 5.1 The problem

On desktop, the Tasks page expands wider than the phone-shaped frame. v1 allowed the board to expand up to about 1100px for four columns, so moving between tabs makes the "phone" suddenly get bigger, and with large text the columns get crushed. The team wants Tasks to stay inside the same phone frame as every other screen.

### 5.2 Required behavior

1. **One width for every route.** Remove the Tasks-specific expansion: search for wider `max-width` values, layout overrides or route-specific frame classes on `/tasks`, and remove them. Do the same for `/tasks/completed`. The frame's `max-width` stays in `px` (not `rem` or `em`), so text scale can never widen it.
2. **Add a global guard:** a test (Playwright or a DOM-level layout test) that reads the frame's width on every route at 1280×800 and at text scales 1 and 1.5. All widths must be identical.
3. **Board layout inside the frame** (`tasks.boardView`, a new setting in Settings → Day & planning, also switchable from a small control in the Tasks header):
   - `swipe` (default): the four status columns sit side by side in a horizontal scroll container **inside** the frame, each column 85% of the frame's width, with `scroll-snap-type: x mandatory`. The next column peeks at the edge, so it's clear you can swipe.
     - A segmented control above (Not started · In progress · Stuck · Done, with counts) stays in sync: tapping a segment scrolls to that column, and swiping updates the active segment (`IntersectionObserver`).
     - Keyboard: the segmented control is the primary navigation; arrow keys in it move between columns.
     - At motion Off, the scroll jumps instead of animating.
   - `list`: one vertical list grouped by status with collapsible group headers ("In progress (1)"). Collapsed states persist in `tasks.collapsedGroups`.
   - Both views reuse the existing TaskCard and the existing "Move to…" menu. Drag-and-drop between columns keeps working in `swipe` view: dragging a card near the container's edge auto-scrolls to the next column, using dnd-kit's auto-scroll options. In `list` view, drag-and-drop works between groups. The "Move to…" menu is always available as the accessible path.
4. **Large text:** columns keep 85% of the frame's width, and cards wrap at spaces (never mid-word). Nothing widens the frame; the audit guards this.
5. **Someday group, snoozed labels, the "Completed earlier" link, "Clear done now" and the subtasks progress** (from v2/v2.1/v2.2) appear in both views, in the same places relative to their column or group.

### 5.3 New aligned features for Tasks

1. **Quick filters** (chips under the header, horizontally scrollable inside the frame):
   - "Due today";
   - "Light energy" (energy 1);
   - "Has steps" (subtasks);
   - "Today's one thing" (anchor).
   Filters combine with AND; "Clear filters" resets them. They're stored in `tasks.filters` (per session; not persisted between sessions, to avoid confusion).
2. **"Where am I?" position indicator** in swipe view: under the segmented control, four small dots show which column is visible (decorative; the segmented control carries the information).
3. **Column empty states** keep the existing copy, with a small "Add task" button in Not started's empty state.

### 5.4 Tests and acceptance

- **Unit:**
  - the view setting and the filter logic;
  - segmented control ↔ scroll sync (mock `IntersectionObserver`);
  - collapsed groups persistence.
- **Flow:**
  - move a task between columns with the menu in both views;
  - drag between columns in swipe view (with dnd-kit's keyboard sensor);
  - filters narrow the list correctly;
  - Done visibility and the archive still work.
- **Layout guard:** the frame width is equal on all routes; no horizontal page scroll; no mid-word breaks on Tasks at any text scale.
- **Demo:** the full tour's Tasks steps work (the director may need to tap the "Stuck" segment before acting on a card; update the step if needed and keep its timing).

**Acceptance:** Tasks stays exactly as wide as every other screen, on any device and text size; columns are easy to move between; nothing about tasks' behavior changes.

---

## 6. Data changes (all additive)

| Where | New optional fields or keys |
|---|---|
| `CheckIn` | `quick?: boolean` |
| Trusted contact | `countryCode?`, `national?`, `whatsapp?`, `needsReview?` |
| Campus support | `phoneCountryCode?`, `phoneNational?`, `needsReview?` |
| Settings | `checkin.buttonMode` (`smart`), `checkin.buttonMovable` (false), `checkin.buttonSide` (`center`), `checkin.quickHintSeen` (false), `companion.speechStyle` (`bubbles`), `tasks.boardView` (`swipe`), `tasks.collapsedGroups` ([]), `contacts.migratedV23` (internal) |

None of these needs a Dexie schema version, because none of them is indexed. Confirm this with the installed Dexie's documentation. Add them to `SettingsSchema` with defaults, and to the export/import validation (lenient with old backups).

---

## 7. Copy (additions to `src/copy/en.ts`)

**Check-in button**
- `checkinButtonMode`: "Check-in button"
- `checkinButtonModes`: "Floating, smart" · "In the tab bar" · "Hidden"
- `checkinButtonHiddenHelp`: "You can still check in from Today, the menu, or by pressing C."
- `checkinButtonMovable`: "Let me move the button"
- `checkinButtonSide`: "Button position"
- `checkinButtonSides`: "Left" · "Center" · "Right"
- `checkinLastState`: "Last check-in: {quadrant}, {time}"
- `quickCheckinTip`: "Tip: press and hold for a quick check-in."

**Quick check-in**
- `quickCheckin`: "Quick check-in"
- `quickCheckinTitle` (G/D/L): "How's the water?" / "How are you?" / "Choose how you feel right now."
- `quickCheckinWords`: "Pick a word, or skip."
- `quickCheckinAddMore`: "Add more?"

**Contacts**
- `phoneCountry`: "Country code"
- `phoneOtherCode`: "Other code"
- `phoneNumber`: "Phone number"
- `phoneOnlyNumbers`: "Only numbers here. The country code is set on the left."
- `phoneWillCall`: "Will call: {formatted}"
- `phoneNeedsDigits`: "This number needs {n} digits."
- `phoneTooShort`: "That looks too short for a phone number."
- `phoneHasWhatsApp`: "This number has WhatsApp"
- `contactCall`: "Call"
- `contactText`: "Text"
- `contactWhatsApp`: "WhatsApp"
- `contactReview`: "One contact's number may not work. Review it."
- `contactSavedAs`: "Saved as: {value}"
- `contactActionsDisabled`: "Fix the number to call or text."
- `readNumber`: "Read the number aloud"

**Speech**
- `speechStyle`: "How {name} talks"
- `speechStyles`: "Speech bubbles" · "Caption bar" · "No speech"
- `lastLine`: "What did {name} say?"
- `lastLineNone`: "{name} hasn't said anything yet."

**Tasks**
- `boardView`: "Board view"
- `boardViews`: "Swipe between columns" · "One list"
- `filterDueToday`: "Due today"
- `filterLight`: "Light energy"
- `filterHasSteps`: "Has steps"
- `filterOneThing`: "Today's one thing"
- `clearFilters`: "Clear filters"
- `noTasksMatch`: "No tasks match these filters."

Keep every existing key. Don't change existing strings.

---

## 8. Accessibility requirements for everything above

- **The check-in button:** always reachable by keyboard when visible. Hiding it never steals focus. When it hides while focused, it stays visible until focus leaves. Its accessible name is "Check in" in every state. The compact state has a tooltip.
- **Quick check-in:** a radio-group-like grid with arrow-key navigation, Escape to close, and focus returns to the trigger.
- **PhoneInput:** two labeled controls ("Country code", "Phone number"), errors announced, no info conveyed only by formatting.
- **Captions:** announced politely. They don't move focus. Content shifts are announced (nothing to announce for decorative motion).
- **Swipe board:** the segmented control is the primary navigation. Columns are regions with labels ("In progress, 1 task"). Horizontal scrolling is never required to reach any action.
- **Everything** works at text scale 1.5, at a 320px width, at motion Off, and in high-contrast themes.

---

## 9. Testing and verification summary

After each item, and again at the end:

1. lint, typecheck, `npm run test` (all suites), `npm run test:v1`, the dictation freeze test, the demo reference test, the seed test, the build.
2. The layout audit, if available (frame boundary, frame width stability, mid-word breaks, scroll-to-end coverage, overlay coverage) on all routes at all text scales.
3. The visual baseline comparison: only the intended differences (Section 1.1).
4. Both demo tours and the pitch cut, twice each, in the demo workspace (and once more with `checkin.buttonMode` set to `tabbar` and once with `hidden`).
5. The v1 pitch path.

**Manual checks for the team** (write them into `docs/TEAM_TODO.md`):

- Scroll Today, Toolkit and Tasks on a real phone and confirm the button hides and shows smoothly and never covers the last items.
- Try Quick check-in with press-and-hold.
- Type letters into a contact's phone field on a real phone keyboard.
- Tap Call, Text and WhatsApp on a test contact.
- On a laptop, tap the companion everywhere and confirm nothing goes outside the phone area.
- Open Tasks on a laptop and confirm the phone frame keeps the same size as on other screens.

---

## 10. Order of work

1. **Baseline:** Section 1.1 (tag, branch, suites, visual baseline).
2. **Item 4, Tasks width** (the global frame guard first, then the board views and filters). Commit.
3. **Item 3, companion speech** (verify, complete the frame-bound overlays and slots, then speech styles and "last line"). Commit.
4. **Item 1, the check-in button** (modes, smart behavior, bottom insets, then Quick check-in, then the demo director update). Commit.
5. **Item 2, phone numbers** (PhoneInput, migration, contact actions, review banner). Commit.
6. **Final verification:** Section 9. Fix anything that regressed.
7. **Docs and logs:** Section 1.3.
8. **Merge** `v2.3-focused-fixes` into `main` only if everything is green, tag `v2.3.0`, and push if possible. Otherwise, explain what's missing in the log and in `docs/TEAM_TODO.md`.
9. **A short final message to the team, in plain words:** what changed for each of the four items, the new options and where to find them in Settings, and the manual checks to do on real phones.

Items 3 and 4 come first because they touch the overlay and layout foundations that Item 1 (the button's popover and insets) builds on.

---

## 11. Definition of done

- [ ] The check-in button is dynamic (shows only where useful, hides on scroll, compact when it would cover content, state ring, gentle invitation), with `smart`/`tabbar`/`hidden` modes, an optional position, and Quick check-in.
- [ ] Phone fields accept only digits, with a separate country code; old contacts migrated without data loss, unclear ones flagged; Call/Text/WhatsApp links valid; the review banner.
- [ ] Companion text never leaves the phone area or covers key content; the speech style setting (bubbles, captions, off) and "last thing {name} said".
- [ ] Tasks stays inside the phone frame at every size; swipe and list views; quick filters; the frame width guard on all routes.
- [ ] Nothing else changed: all suites green, the dictation freeze test green, the visual diffs limited to intended changes, both demos and the v1 pitch path working.
- [ ] Docs, logs, changelog, TEAM_TODO and the progress report updated.

---

## 12. Message to paste into Claude Code

```
Read docs/TIDE_V2_3_FOCUSED_FIXES_PROMPT.md completely, then CLAUDE.md, the
end of docs/AI_DEV_LOG.md, docs/BUG_SWEEP.md, and the code for the check-in
button, companion speech, contact forms, and the Tasks board.

Fix the four items exactly as described (the check-in button, phone numbers
digits-only, companion text inside the phone area, and the Tasks width) and
add the aligned features in the document, without breaking or changing
anything else. Dictation stays frozen.

Start with the baseline and the visual screenshots, then follow the order in
Section 10. For each item: reproduce, fix the root cause, add tests, run every
suite (including test:v1 and the dictation freeze test), write the before and
after log entries in the first person, and commit. Don't ask us to confirm
between items.

At the end, verify that only the intended screens changed, run both demos
and the v1 pitch path, update the docs, merge to main only if everything is
green, and tell us in plain words what changed and what to check on real
phones.
```

*End of document.*
