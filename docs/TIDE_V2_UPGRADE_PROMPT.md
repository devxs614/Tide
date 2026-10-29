# TIDE v2 — "The Experience Upgrade" — Master Prompt for Claude Code

> **Cómo usar este archivo (para el equipo, en español)**
>
> Este documento le pide a Claude Code que convierta la versión actual de Tide (la que ya construyó con `docs/TIDE_BUILD_PROMPT.md`, fases 0 a 10) en la **versión 2**, sin romper nada de lo que ya funciona.
>
> **Qué agrega la versión 2:**
> - Seis compañeros animados a elegir (nutria, axolote, capibara, geco, medusa y cangrejo ermitaño) o ninguno, personalizables y con un estudio propio.
> - Estética tipo Duolingo: botones con volumen, tarjetas gruesas, tipografía redonda, colores vivos y animaciones muy fluidas, con niveles de movimiento (Off, Calm, Lively).
> - 15 temas visuales (azules, rosas, verdes, cálidos, lavanda, oscuros y de alto contraste), no solo claro y oscuro.
> - Celebraciones que se adaptan a cómo te sientes.
> - Voces de lectura que suenan naturales.
> - **Your Shore:** una playa donde cada logro deja una concha, vidrio de mar o estrella.
> - **Close the day:** un cierre del día completo, con repaso del día, reflexión, pendientes, plan para mañana, resumen con IA y mensaje en una botella.
> - Onboarding tipo registro, 100% local y sin login.
> - Settings completo, con perfiles rápidos, buscador y vista previa.
> - **Botón Demo:** corre un recorrido automático que muestra todas las funciones, en un espacio de demo aparte que no toca sus datos. Tiene modo presentador para el pitch.
>
> **Pasos:**
> 1. Guarden este archivo en el repo como `docs/TIDE_V2_UPGRADE_PROMPT.md`. Dejen `docs/TIDE_BUILD_PROMPT.md` donde está: sigue siendo la especificación base.
> 2. (Opcional, recomendado para voces realmente naturales) Agreguen a `.env.local` una clave de voz: `TIDE_TTS_PROVIDER=openai` y `OPENAI_API_KEY=...`, o `TIDE_TTS_PROVIDER=elevenlabs` y `ELEVENLABS_API_KEY=...`. Sin clave, Tide elige automáticamente la mejor voz instalada en el dispositivo y arregla cómo lee. Para la demo, Microsoft Edge tiene voces "Natural" muy buenas.
> 3. Abran Claude Code en la carpeta del repo y peguen el **mensaje de arranque** del Apéndice D. Claude trabajará solo, en orden, de V0 a V12, sin pedirles confirmación entre fases.
> 4. **El dictado por voz no se toca.** El documento lo congela y agrega una prueba que falla si alguien lo modifica.
> 5. Claude trabaja en una rama `v2-experience`. Al final, si todas las pruebas pasan, la integra a `main`. La versión anterior queda marcada con la etiqueta `v1-baseline` por si necesitan regresar.
> 6. Claude escribe todas las bitácoras (desarrollo con IA, atribución, decisiones, guía del código, reportes diarios y `TEAM_TODO.md`) en primera persona y con voz natural.
> 7. Pregunta importante para su Challenge Partner: **¿los compañeros se sienten infantiles para jóvenes de 18 a 24 años?** Por eso existe la opción "sin compañero" y el estilo sobrio. Pruébenlo con usuarios.

---

## 0. How to read this document (for Claude Code)

You already built Tide v1 from `docs/TIDE_BUILD_PROMPT.md` (Phases 0–10), and the team has fixed some issues since. This document describes **Tide v2**, a large upgrade to the experience: companions, a Duolingo-quality visual and motion system, many themes, natural voices, a shore that collects wins, an evening wrap-up, a complete settings area, a registration-style onboarding, and a Demo button that runs a guided tour of every feature.

**The prime directive of v2: add without breaking.** Everything that works in v1 must still work at the end of v2, with the same behavior, the same data and the same tests passing, except where this document deliberately changes something and says so. The voice dictation feature is frozen and must not change at all.

How this document relates to v1:

- `docs/TIDE_BUILD_PROMPT.md` (v1 spec) is still the source of truth for everything this document does not change: the core loop, check-in, tasks, unstick, focus, day modes, bridge, toolkit, patterns, proof log, safety, AI routes, pattern engine and v1 demo script.
- **The code in the repository is the source of truth for how v1 was actually built.** The team fixed bugs after Phase 10, so the code may differ from the v1 spec in places. When the code and the v1 spec disagree, trust the code, and record the difference in `docs/DECISIONS.md`.
- Where this document and the v1 spec disagree, this document wins for v2 features. It always says when it is changing v1 behavior.

You will work **autonomously** through Phases V0–V12 (Section 22), in order, without asking the team to confirm each phase, using the same cycle you used in v1: **understand → plan → build → verify → fix → log → commit → continue.** Stop only for the true blockers in Section 1.5.

Read this whole document once before touching code. Then, before each phase, re-read the sections that phase lists, and re-read the v1 code you are about to change. Never edit a file you have not read in this session.

Section map:

1. Working protocol for v2 (autonomy, regression safety, comments, logs)
2. What v2 adds, and the principles behind it ("delight without guilt")
3. The regression safety net (baseline, branch, freezes, compatibility rules)
4. Design system 2.0 (Duolingo-style aesthetic, typography, components, 15 themes)
5. Motion system (levels, tokens, micro-interactions, transitions, performance)
6. Sound and haptics
7. Voice upgrade (natural read-aloud; dictation untouched)
8. Companions (six species and "none": art, expressions, animation, personality, customization, studio)
9. Companions across the app (screen by screen)
10. Celebrations (state-aware)
11. Onboarding 2.0 (local "registration") and "What's new" for existing users
12. Today 2.0 (header, quick actions, morning card, evening card, shore preview)
13. Your Shore
14. Close the day (evening wrap-up), including the new AI route
15. Settings 2.0
16. Demo workspace and the Demo director (the Demo button)
17. Quality features (shortcuts, offline, install, splash, errors, wake lock)
18. Data model v2 and migrations
19. AI layer changes
20. Pattern engine additions
21. Testing strategy for v2
22. The ordered build plan (Phases V0–V12)
23. Definition of done for v2
24. Appendices: copy catalog additions, companion lines, demo captions, messages to paste, pitch notes

---

## 1. Working protocol for v2

### 1.1 Your role

You are the senior engineer, motion designer and accessibility lead for Tide v2. The team wants the app to feel **alive, warm and polished**, at the level of a top consumer app like Duolingo, while staying calm, kind and accessible for neurodivergent students. You own the implementation, and you own not breaking what exists.

### 1.2 Mindset

- **Add, don't replace.** Wrap, extend and compose v1 pieces. Rewrite a v1 file only when extending it would be messier than rewriting it, and then keep its exported API and behavior identical, prove it with the existing tests, and log why.
- **Polish is a feature.** Spacing, timing, easing, sound, copy and empty states matter here as much as logic. A screen is not done until it looks and feels finished at 390px and 1280px, in at least three themes, at every motion level.
- **Calm by default, lively by choice.** Every delightful thing can be turned down or off, and the defaults are gentle.
- **Complete over partial.** Do not leave stubs, "coming soon" labels or TODOs in the app. If something truly cannot be built, put the most reliable alternative in its place and log it honestly.
- **Understand before you build.** Before each phase, write the "Before Phase V-n" log entry (Appendix B of the v1 spec, same format) explaining what the part is for from Maya's point of view, what it touches in v1, and how you will avoid breaking it.

### 1.3 The phase cycle (unchanged from v1, with a regression step)

For each phase in Section 22, in order:

1. **Understand.** Re-read the listed sections of this document, the relevant v1 spec sections, and the existing code you will touch. Write "Before Phase V-n" in `docs/AI_DEV_LOG.md`.
2. **Plan.** Update your task list with the phase's build steps, split further if useful.
3. **Build.** Implement the steps in order. Write natural comments as you go (Section 1.6).
4. **Verify.** Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`. Run the **v1 regression suite** (Section 3.4). Exercise the new feature with flow tests, and with a browser tool if you have one, at 390px and 1280px, in light, dark and one colorful theme, at motion levels Off and Lively.
5. **Fix.** Nothing moves forward with red checks or a failing v1 test. If a v1 test fails because v2 intentionally changed something, update the test **only** if Section 3.5 lists the change as intentional, and log it.
6. **Log.** "After Phase V-n" in `docs/AI_DEV_LOG.md`; rows in `AI_ATTRIBUTION.md`; decisions in `docs/DECISIONS.md`; new modules in `docs/CODE_WALKTHROUGH.md`; human tasks in `docs/TEAM_TODO.md`; an entry in `CHANGELOG.md`.
7. **Commit** on the `v2-experience` branch, using the v1 commit convention (`<type>(<scope>): <summary>`, a short natural body, and the `AI-Generated: Claude Code` trailer). New scopes: `theme`, `motion`, `sound`, `voice`, `companion`, `celebrate`, `onboarding`, `shore`, `wrap`, `settings`, `demo`, `quality`.
8. **Continue** to the next phase without waiting.

Also draft one daily progress report per calendar day you work (v1 spec Section 17.5).

### 1.4 Order matters

The phases build on each other: V0 sets up the safety net; V1 builds the design system everything else uses; V2 (voice) and V3 (companions) build engines; V4–V5 apply them across the app; V6–V9 add new experiences; V10 builds the demo tour, which needs every feature to exist; V11 polishes; V12 documents, audits and merges. Never jump ahead.

### 1.5 When you may stop

Same as v1: stop only if the environment cannot install or run Node; if a step would delete or overwrite work the team made by hand; or if this document contradicts itself in a way that changes the product and Sections 2–3 do not resolve it. Missing TTS keys, missing browser tools or missing deployment access are **not** blockers: build the fallback path, test with mocks, and leave clear steps in `docs/TEAM_TODO.md`.

### 1.6 Comments and logs: voice rules (same as v1, restated because they matter)

- Every new file starts with a 2–5 line header comment, written like a thoughtful teammate explaining what the file is for and how it fits into Tide.
- Comment the **why**, the trade-off or the user-facing reason, never the obvious what. Mention the person when it helps ("someone who finds faces hard to read", "Maya on a low-battery day").
- Never write boilerplate like "This component renders…", "Helper function for…", "Handles the logic of…", "TODO: implement". No emojis.
- Logs are in the first person ("I built…", "I chose…"), plain, specific and honest, and they always state that the code is AI-generated. Progress reports are in the team's voice ("we"), and they also say plainly that Claude Code generated the code.

Good examples for v2:

```ts
// Celebrations scale with how Maya said she feels, not just with what she did.
// Throwing confetti at someone who just checked in as "drained" reads as
// tone-deaf, so in Ebb we glow softly and say "That counted." instead.
```

```ts
// Chrome quietly stops speaking after about 15 seconds of a single utterance.
// Splitting the text into sentence-sized chunks and queueing them avoids
// the cut-off without the user ever noticing.
```

```ts
// Item positions come from a hash of the win's id, so Maya's shore looks
// the same every time she opens it. A shore that reshuffled itself would
// feel like her things were being moved around.
```

### 1.7 Code quality bar (v1 rules plus v2 additions)

- TypeScript strict, small files, plain names, one component per file, no clever abstractions.
- All strings in `src/copy/en.ts` (extend it; never rename or delete existing keys).
- All times from `now()` (the clock module), all colors from theme tokens, all database writes through `src/lib/repo/*`.
- **New for v2:** all animation timings from motion tokens (`src/lib/motion/tokens.ts`); all sounds through the sound engine (`src/lib/sound/`); all read-aloud through the voice engine (`src/lib/voice/`); all companion lines through the companion copy (`src/copy/companions.ts`).
- Animations use only `transform` and `opacity` (and SVG attributes on small elements). No layout-thrashing animations.
- Every animated element respects the motion level (Section 5.2).

---

## 2. What v2 adds, and the principles behind it

### 2.1 The feature list

| # | Feature | Short description | Section |
|---|---------|-------------------|---------|
| F1 | Design system 2.0 | Duolingo-style chunky, rounded, colorful UI; new display font; 3D buttons; thick cards | 4 |
| F2 | 15 themes | Lagoon, Ocean Blue, Coral Reef, Bubblegum, Kelp Forest, Sunset Shore, Lavender Mist, Sandbar, Classic, Midnight Tide, Deep Sea, Aurora, Classic Dark, Pearl (high contrast light), Ink (high contrast dark) | 4.6 |
| F3 | Motion system | Three motion levels, shared tokens, page transitions, micro-interactions everywhere | 5 |
| F4 | Sound and haptics | Procedurally generated soft sounds, focus ambience, optional vibration | 6 |
| F5 | Natural voices | Smart device-voice selection, speech-friendly text, optional cloud neural voices, voice picker | 7 |
| F6 | Companions | Otter, axolotl, capybara, gecko, jellyfish, hermit crab, or none; expressions; customization; Companion Studio | 8 |
| F7 | Companions across the app | Co-regulation in check-in, focus (body doubling), breathing, bridge, wrap-up | 9 |
| F8 | Celebrations | State-aware celebrations with frequency caps | 10 |
| F9 | Onboarding 2.0 | Local "registration": name, companion, look, senses, voice, day, privacy, first check-in | 11 |
| F10 | Today 2.0 | Companion header, quick actions, morning card, evening card, shore preview | 12 |
| F11 | Your Shore | A living beach where wins wash up as collectible items; bottles; collection; image export | 13 |
| F12 | Close the day | Multi-step evening wrap-up with day replay, reflection, loose ends, tomorrow plan, AI summary, bottle, wind-down | 14 |
| F13 | Settings 2.0 | Everything customizable, presets, search, live preview, import/export | 15 |
| F14 | Demo button | Separate demo workspace and a director that runs a guided tour of every feature (autoplay, presenter mode, pitch cut) | 16 |
| F15 | Quality features | Keyboard shortcuts, offline pill, install prompt, splash, friendly errors, wake lock, "What's new" | 17 |

### 2.2 Principle: delight without guilt

The team's direction is "Duolingo-style". That means borrowing Duolingo's craft (personality, motion, celebration, chunky friendly UI, a character who keeps you company) and **refusing its pressure mechanics**. These rules are non-negotiable:

- **No streaks**, no streak counters, no "days in a row", no streak freezes.
- **No lives, hearts or energy that runs out.**
- **No leagues, leaderboards, XP totals or any number that can go down.**
- **No guilt.** The companion never looks sad, sick, hungry, lonely or disappointed because the user did not open the app or did not finish something. It never says "I missed you", "Where were you?" or anything similar.
- **No variable-reward tricks.** There are no random loot drops or rare items designed to make people check compulsively. Shore items are deterministic: the same action always gives the same kind of item.
- **No push notifications** in v2. In-app prompts only. (Section 17.7 explains why.)
- **Celebrations never block the user** and never shout at someone who said they feel low.
- **Everything can be turned down or off**, and the defaults are calm.

In the pitch, the team will say: *"Duolingo's delight, without Duolingo's guilt."* Every design choice should make that sentence true.

### 2.3 Principle: inclusion first

- The companions are optional. "No companion" is a first-class choice with its own delightful abstract animations (waves and light).
- The jellyfish companion, Luma, can be shown with no face at all, for people who find facial expressions confusing or overwhelming.
- Companion lines follow the communication mode: in Literal mode they are literal, in Direct mode they are brief.
- Motion has three levels and a hard Off. The OS reduced-motion setting maps to Off unless the user picks another level on purpose.
- Sound is off by default.
- Every visual-only element (shore, tide chart, celebrations, companions) has a text equivalent for screen readers.
- The high-contrast themes and the color-blind-safe quadrant palette are real options, not afterthoughts.
- The crisis screen never shows a companion, a celebration or any playful element.

### 2.4 Principle: the companion supports, it doesn't judge

The companion is a co-regulation partner and a body double, not a pet to keep alive. Its mood never depends on the user's productivity. It reacts to what the user tells it (softly, never mirroring distress), it breathes with the user, it works quietly next to them, it gets ready with them for transitions, and it goes to sleep with them at the end of the day.

---

## 3. The regression safety net

### 3.1 Phase V0 baseline (do this first, before any change)

1. Read `CLAUDE.md`, `docs/TIDE_BUILD_PROMPT.md`, the whole `docs/AI_DEV_LOG.md`, `docs/CODE_WALKTHROUGH.md`, `docs/DECISIONS.md` and `docs/TEAM_TODO.md`.
2. Run `git status`. If there are uncommitted changes, **do not discard them**: commit them as `chore(base): save team changes before v2` and note it in the log.
3. Run all checks and record the baseline in the log: the number of test files and tests, any failures, the build result, and the first-load JS size of `/` from the build output.
4. If any v1 test fails at baseline, fix it first (in a `fix(...)` commit on `main`), because you need a green baseline to detect regressions.
5. Tag the baseline: `git tag v1-baseline`.
6. Create and switch to the branch: `git checkout -b v2-experience`.
7. Write `docs/V1_INVENTORY.md`: a short map of the existing routes, components, repo functions, settings keys, copy keys, Dexie tables and versions, AI routes, tests and `data-*` attributes. You will use it to check that nothing disappears.

### 3.2 Frozen: voice dictation

The team says dictation works very well. **Do not change it.**

- Find every piece of code that does speech recognition (look for `SpeechRecognition`, `webkitSpeechRecognition`, `onresult`, `Dictate`, `listening` in `src/`). List the files and functions in `docs/V1_INVENTORY.md` under "Frozen: dictation".
- Do not edit those functions: no behavior changes, no "cleanups", no renames, no moves.
- If the read-aloud code lives in the same file as dictation (for example `src/lib/speech.ts`), leave that file as it is. Build the new voice engine in `src/lib/voice/`, and switch the **callers** of read-aloud (such as `ReadAloudButton`) to the new engine. The old read-aloud function can stay in place, unused or used as the last fallback.
- Add `src/test/frozen-dictation.test.ts`. It reads each frozen file, extracts the dictation functions' source text (or hashes the whole file when the file only contains dictation), and compares it with a SHA-256 recorded in V0. If anyone changes dictation, the test fails with a message that explains the freeze.
- Dictation UI (the mic button, "Listening… tap to stop") may get **visual** restyling through the design system: colors, radius, a subtle pulse while listening. It may not change events, timing, permissions or state logic. If restyling would require touching frozen code, don't restyle it.

### 3.3 Compatibility rules

1. **Routes:** every v1 route keeps working at the same URL. New routes are added (`/companion`, `/shore`, `/shore/collection`, `/wrap`, `/demo`, `/settings/[section]`, `/whats-new`, and the dev-only `/dev/companions`).
2. **Data:** Dexie changes are additive. Add `version(2)` with new tables and indexes and an `upgrade()` that fills defaults. Never change or remove existing tables, fields or index names. Existing records stay readable and valid.
3. **Settings:** existing keys keep their names, types and meanings. New keys get defaults. Existing users keep their v1 look until they choose otherwise (Section 18.4).
4. **Copy:** add keys; don't rename or delete existing ones. You may improve the wording of existing strings only where this document says so.
5. **AI routes and schemas:** additive only. New optional input fields are fine. Output shapes for v1 routes do not change.
6. **Pattern engine:** new rules are added. Existing rules, thresholds and keys stay the same. `computePatterns` gets new optional inputs with defaults, so v1 callers compile unchanged.
7. **Repo functions:** keep existing signatures. Add new functions alongside.
8. **Tests:** every v1 test keeps passing. Only the intentional changes in Section 3.5 may update a v1 test, and each update is logged.
9. **v1 demo script** (v1 spec Section 14.3, the 100-second path) must still work, both through the old Settings → Demo controls (now inside the demo workspace) and as the "Pitch cut" of the new Demo director.
10. **Safety layer:** no changes to detection or crisis behavior, except adding a "preview" mode for the demo (Section 16.8) that can never save data or be reached from user text.
11. **Accessibility:** no regressions. Lighthouse accessibility scores stay ≥ 95 where measured.

### 3.4 The v1 regression suite

Create `npm run test:v1`, which runs the v1 test files listed in `docs/V1_INVENTORY.md`. It must pass at the end of every v2 phase. Also keep the v1 demo flow test (seed → planted pattern keys) green. If the environment supports Playwright, add `e2e/v1-pitch.spec.ts`, which runs the v1 100-second script, and run it at the end of V5, V10 and V12.

### 3.5 Intentional changes to v1 behavior (the only ones allowed)

| Change | Why | v1 tests affected |
|---|---|---|
| Tab bar gains a fifth tab, **Shore** | Your Shore is a main experience | Tests that count exactly four tabs |
| Settings page becomes an index plus section pages (`/settings/[section]`) | The settings area is far bigger | Settings tests that find controls on `/settings`: update them to navigate to the right section, with the same behavior assertions |
| Demo mode runs in a **separate demo workspace** (its own IndexedDB database) instead of replacing the user's data | Running the tour must never wipe real data | Demo-mode tests: assert the main database is untouched, and the demo DB receives the seed |
| Onboarding has more steps (still all skippable) | Registration-style setup | Onboarding tests: update step navigation; "Skip" still works from any step |
| Read-aloud uses the new voice engine | Voices sounded robotic | Tests that mock `speechSynthesis` directly: switch to mocking the voice engine |
| Wins get an optional `kind` field (inferred for old wins) | Shore item mapping | None should break; the field is optional |
| Seed data gains v2 data (companion, day wraps, a bottle, a wrap-based pattern) | The tour shows every feature | The "exactly the planted keys" test now expects one more key, `wrapHelped:c-box` |

Anything else that breaks a v1 test is a bug. Fix the code, not the test.

---
## 4. Design system 2.0

### 4.1 The look in one paragraph

Tide v2 should feel like a friendly, well-crafted game that happens to be about your day: big rounded shapes, chunky buttons that physically press down, thick soft borders, bold rounded headings, clear bright colors that are never neon, generous spacing, illustrated empty states, and a companion who appears in the right moments. Think of the confidence and clarity of Duolingo's UI, placed in a calm seaside world. Everything stays readable: body text stays in a hyperlegible font, contrast meets WCAG AA in every theme, and nothing important is communicated by color alone.

### 4.2 Typography

Load three font families with `next/font/google` (all SIL Open Font License; record them in `AI_ATTRIBUTION.md`):

- **Nunito** (weights 600, 700, 800, 900): the display font for headings, buttons, numbers, tabs, chips and companion speech bubbles. It is rounded and friendly.
- **Atkinson Hyperlegible** (400, 700), already in v1: the body font for paragraphs, definitions, inputs and long text.
- **Lexend** (400, 600, 700): an alternative readability font.

Expose them as CSS variables `--font-display` and `--font-body`. The `appearance.font` setting chooses the pairing:

| Setting value | Display (headings, buttons) | Body | Notes |
|---|---|---|---|
| `playful` (new-user default) | Nunito | Atkinson Hyperlegible | The v2 look |
| `hyperlegible` | Atkinson Hyperlegible | Atkinson Hyperlegible | The v1 look; default for existing users |
| `lexend` | Lexend | Lexend | Some dyslexic readers prefer it |
| `system` | system-ui | system-ui | Matches the device |

Type scale for v2 (root 17px, multiplied by `textScale`):

| Role | Size | Weight (display) | Line-height |
|---|---|---|---|
| Display (timer, big numbers) | 40px | 900 | 1.1 |
| H1 | 30px | 800 | 1.2 |
| H2 | 24px | 800 | 1.25 |
| H3 | 20px | 800 | 1.3 |
| Button large | 18px | 800, letter-spacing 0.02em | 1 |
| Button | 16px | 800 | 1 |
| Chip / tab label | 14px | 700 | 1.2 |
| Body | 17px | 400 (body font) | 1.6 |
| Small | 15px | 400 | 1.5 |
| Caption | 13px | 600 (display) | 1.4 |

Buttons and tab labels are **not** all-caps. Duolingo uses uppercase on many buttons, but uppercase is harder to read for many dyslexic readers, so Tide keeps sentence case. Add `appearance.boldText`: it raises body text to weight 700 and display text one step.

### 4.3 Shape, depth and spacing

- **Radius tokens:** `--radius-sm` 12px, `--radius-md` 16px, `--radius-lg` 20px, `--radius-xl` 28px, `--radius-pill` 999px. The `appearance.roundness` setting scales them: `round` ×1 (default), `soft` ×0.7, `square` ×0.35 (pill stays pill).
- **Depth:** Duolingo-style depth comes from a solid "ledge" under the element, not from blurry shadows. Buttons and raised cards use `box-shadow: 0 var(--ledge) 0 var(--ledge-color)`, where `--ledge` is 4px for buttons and cards and 6px for large hero buttons. Pressed state: `transform: translateY(var(--ledge)); box-shadow: 0 0 0 var(--ledge-color)`, in 70ms.
- **Borders:** cards have a 2px border in `--line`. Selected or active elements have a 2px border in `--primary` with a `--primary-shadow` ledge.
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Screen gutter 20px (16px in `compact` density). Gap between cards 16px (12px compact).
- **Touch targets:** at least 48×48px, with at least 8px between targets.
- **Density setting:** `comfortable` (default) or `compact`, which reduces vertical padding by 25%, but never below the touch-target minimum.

### 4.4 Core components (restyle v1, add new ones)

Build these in `src/components/ui/` and restyle v1 usages to use them. Keep v1 component names and props working: for example, if v1 used shadcn `Button` directly, give it new variants instead of replacing it everywhere by hand.

**Button (3D)**
- Variants:
  - `primary`: `--primary` fill, `--on-primary` text, `--primary-shadow` ledge.
  - `secondary`: `--surface` fill, `--ink` text, 2px `--line` border, `--line` ledge.
  - `accent`: `--accent` fill, `--accent-shadow` ledge, `--on-accent` text.
  - `ghost`: no fill, `--primary` text, no ledge.
  - `quadrant`: quadrant tint fill, quadrant base ledge, `--ink` text.
- Sizes: `lg` 56px tall (hero actions, full width), `md` 48px, `sm` 40px visual with a 48px hit area.
- Icon slot (Lucide, stroke 2.5) on the left. The label is always visible.
- States:
  - hover: brightness 1.05 (no movement);
  - pressed: the ledge collapses;
  - focus-visible: a 3px `--focus` ring with 3px offset;
  - disabled: `--surface-2` fill, `--ink-soft` text, no ledge, `aria-disabled`.
- Loading state: the label is replaced by three dots that wave (static dots at motion level Off), and the width stays fixed so the layout doesn't jump.
- Press sound `tap` and haptic `light`, if those are enabled.

**Card**
- `--surface` fill, 2px `--line` border, `--radius-lg`, 4px `--line` ledge, 16–20px padding.
- `interactive` cards press down like buttons.
- `selectable` cards show a check badge in the top-right corner that pops in (scale 0 → 1.15 → 1) when selected, and the border becomes `--primary`.

**ProgressBar**
- 16px tall pill. Track `--surface-2`. Fill `--primary` with a 4px lighter highlight stripe along the top (`rgba(255,255,255,0.35)`, inset 4px from the edges).
- The fill width animates with a spring.
- It always has a label (visible or `aria-label`) and `role="progressbar"` with the right values.

**Chip**
- 40px pill with a 2px border. Selected: tint fill, `--primary` border, and a check icon that slides in.

**SegmentedControl**
- Pill track with a sliding selected "thumb", animated with `layoutId`.

**Toggle (Switch)**
- 52×32 track with a knob that springs across.

**Sheet**
- Bottom sheet with a drag handle and drag-to-dismiss (with a velocity threshold). It snaps open with a spring. Focus trap; Escape closes.

**Toast**
- Rounded pill above the tab bar, with an optional mini companion head on the left. It slides up and fades. It is announced via `aria-live`.

**Tooltip / Coach mark**
- Speech-bubble style. Used by onboarding hints and the demo director.

**EmptyState**
- Companion illustration (or abstract waves if there's no companion), a title, one line of text and one action.

**IconTile**
- A square 3D tile with a large icon and a label, used for quick actions and settings sections.

**Tab bar (restyled)**
- 72px tall plus the safe area. Five tabs: **Today**, **Tasks**, **Toolkit**, **Patterns**, **Shore**.
- Icon above the label. The active icon switches to its filled style with a small bounce (scale 1 → 1.15 → 1, 300ms) and turns `--primary`. A 4px pill indicator slides under the active tab (`layoutId`).
- At widths below 360px, labels drop to 12px; they never disappear.

**Check-in FAB (restyled)**
- 68px circle, `--primary` with a 5px ledge, a wave icon and the visible label "Check in" under it (or inside it as a pill on wider screens).
- Gentle idle "breath" (scale 1 → 1.03, 4s) at Lively level only. When pressed, a ripple and a wave sweep.

**TopBar (restyled)**
- Screen title in H2 display font. On the right: the companion head (tap opens Companion Studio) and the profile/menu button.
- In the demo workspace, a "Demo" pill sits on the left.

### 4.5 Icons and illustration

- Lucide icons at stroke width 2.5 and size 24 (28 in tiles) for a chunkier look. Use filled variants for active tabs: draw them as Lucide icons with `fill="currentColor"` where the shape allows, or as simple custom SVGs.
- Illustrations are original inline SVG in the flat, rounded style of the companions (Section 8.3): flat fills, one shade tone, one highlight, no outlines or 2px rounded outlines, no gradients except sky and water.

### 4.6 Themes

#### 4.6.1 Theme architecture

- `src/lib/theme/themes.ts` exports `THEMES: Record<ThemeId, Theme>`. Each theme has an `id`, `name`, `group` (`light`, `dark` or `contrast`), a one-line `description`, `tokens` (below) and `quadrants` (which quadrant palette to use).
- `ThemeProvider` writes the tokens as CSS variables on `<html>` and sets `data-theme` and `color-scheme`.
- Tailwind maps every token (for example `bg-bg`, `text-ink`, `border-line`, `bg-primary`, `shadow-ledge`). Components never use raw hex values; the v1 guard test keeps enforcing this.
- Theme changes crossfade: a full-screen overlay in the old background color fades out over 250ms (instant at motion level Off). Use the View Transitions API when the browser supports it (`document.startViewTransition`); otherwise use the overlay.
- `appearance.followSystem`: if true, use `appearance.lightTheme` when the OS is light and `appearance.darkTheme` when it is dark.

Token list (every theme defines all of them):

`bg`, `surface`, `surface2`, `ink`, `inkSoft`, `primary`, `primaryShadow`, `onPrimary`, `line`, `focus`, `notice`, `accent`, `accentShadow`, `onAccent`, `skyTop`, `skyBottom`, `sea`, `seaDeep`, `foam`, `sand`, `sandShadow`.

#### 4.6.2 The 15 themes

Implement exactly these values. Then run the contrast test (4.6.4). If any pair fails, adjust the lightness of the failing token in the smallest step that passes, keep the hue, and log the change in `docs/DECISIONS.md`.

```ts
// Light themes
lagoon: { // default for new users: soft teal water and warm sand
  bg:'#F4F8F7', surface:'#FFFFFF', surface2:'#E6F0EE', ink:'#17313A', inkSoft:'#4E6670',
  primary:'#1F7A80', primaryShadow:'#155A5E', onPrimary:'#FFFFFF', line:'#D3E2DF',
  focus:'#1F7A80', notice:'#7A5E12', accent:'#F2A65A', accentShadow:'#C98236', onAccent:'#2B1A08',
  skyTop:'#BDE7F0', skyBottom:'#F4F8F7', sea:'#5FB8C2', seaDeep:'#2E8A96', foam:'#FFFFFF',
  sand:'#F2DFB8', sandShadow:'#DFC79A' },
oceanBlue: { // crisp blue, clear and focused
  bg:'#F2F7FD', surface:'#FFFFFF', surface2:'#E2EDFA', ink:'#13263D', inkSoft:'#4A5F78',
  primary:'#1F5FBF', primaryShadow:'#164890', onPrimary:'#FFFFFF', line:'#D2E0F2',
  focus:'#1F5FBF', notice:'#7A5A12', accent:'#FF9F5A', accentShadow:'#D97A36', onAccent:'#2B1405',
  skyTop:'#A9D4FF', skyBottom:'#EAF4FF', sea:'#3D8BEA', seaDeep:'#1F5FBF', foam:'#FFFFFF',
  sand:'#F4E2C0', sandShadow:'#E0CA9F' },
coralReef: { // warm coral pink with turquoise
  bg:'#FFF5F2', surface:'#FFFFFF', surface2:'#FFE6DF', ink:'#3A1F24', inkSoft:'#75545A',
  primary:'#B8405A', primaryShadow:'#8E2E44', onPrimary:'#FFFFFF', line:'#F5D5CD',
  focus:'#B8405A', notice:'#7E5A10', accent:'#2FA39A', accentShadow:'#1F7A73', onAccent:'#FFFFFF',
  skyTop:'#FFD3C7', skyBottom:'#FFF5F2', sea:'#6CC4C9', seaDeep:'#3C9AA3', foam:'#FFFFFF',
  sand:'#F7DDB8', sandShadow:'#E8C796' },
bubblegum: { // playful pink with periwinkle
  bg:'#FFF4FA', surface:'#FFFFFF', surface2:'#FCE3F1', ink:'#3B1D33', inkSoft:'#6E4F65',
  primary:'#B83C8A', primaryShadow:'#8A2C67', onPrimary:'#FFFFFF', line:'#F3D3E6',
  focus:'#B83C8A', notice:'#7A5512', accent:'#6C8CFF', accentShadow:'#4A66D6', onAccent:'#0E1640',
  skyTop:'#FFD6EC', skyBottom:'#FFF4FA', sea:'#8FC9F2', seaDeep:'#5A9FD6', foam:'#FFFFFF',
  sand:'#FBE3C8', sandShadow:'#EBC9A6' },
kelpForest: { // leafy green and golden light
  bg:'#F3F7F0', surface:'#FFFFFF', surface2:'#E3EEDC', ink:'#1E2E1E', inkSoft:'#526552',
  primary:'#3C7A3A', primaryShadow:'#2A5A28', onPrimary:'#FFFFFF', line:'#D3E2CB',
  focus:'#3C7A3A', notice:'#7A5E12', accent:'#E9B949', accentShadow:'#BF922A', onAccent:'#2A1F05',
  skyTop:'#CFEBD6', skyBottom:'#F3F7F0', sea:'#4FA59A', seaDeep:'#2D7A70', foam:'#F7FFFB',
  sand:'#E9DDB7', sandShadow:'#D4C493' },
sunsetShore: { // peach and burnt orange with dusk blue
  bg:'#FFF7EE', surface:'#FFFFFF', surface2:'#FDE8D2', ink:'#3A2617', inkSoft:'#6E5643',
  primary:'#B4531F', primaryShadow:'#87401A', onPrimary:'#FFFFFF', line:'#F2DCC4',
  focus:'#B4531F', notice:'#6F5A12', accent:'#5B7FD6', accentShadow:'#3F5EAF', onAccent:'#FFFFFF',
  skyTop:'#FFB98F', skyBottom:'#FFE6CF', sea:'#6A9FD6', seaDeep:'#3F6FAF', foam:'#FFF8F0',
  sand:'#F6D7A8', sandShadow:'#E4BD83' },
lavenderMist: { // soft lilac and rose
  bg:'#F7F5FC', surface:'#FFFFFF', surface2:'#ECE7F8', ink:'#2A2440', inkSoft:'#615A7A',
  primary:'#6A4FB8', primaryShadow:'#4E3A8C', onPrimary:'#FFFFFF', line:'#DDD5F0',
  focus:'#6A4FB8', notice:'#725A14', accent:'#E58FB0', accentShadow:'#BF6A8B', onAccent:'#3A1426',
  skyTop:'#DCD3F7', skyBottom:'#F7F5FC', sea:'#8EA6E8', seaDeep:'#6177C4', foam:'#FFFFFF',
  sand:'#EFE0CC', sandShadow:'#DCC8AE' },
sandbar: { // low-stimulation: muted sage, paper and sand
  bg:'#F5F1EA', surface:'#FBF9F5', surface2:'#ECE5D9', ink:'#2E2A24', inkSoft:'#625B50',
  primary:'#5E6B5A', primaryShadow:'#454F42', onPrimary:'#FFFFFF', line:'#DDD4C5',
  focus:'#4B5648', notice:'#6B5A2E', accent:'#B08D57', accentShadow:'#8A6C3E', onAccent:'#231A0C',
  skyTop:'#E6E1D6', skyBottom:'#F5F1EA', sea:'#9DB2AE', seaDeep:'#7A918C', foam:'#FBF9F5',
  sand:'#E8DCC6', sandShadow:'#D6C8AE' },
classic: { // exactly the v1 light look, kept for existing users
  bg:'#F7F5F0', surface:'#FFFFFF', surface2:'#F0EDE6', ink:'#1F2A33', inkSoft:'#5B6770',
  primary:'#1F5C63', primaryShadow:'#143E43', onPrimary:'#FFFFFF', line:'#E2DED6',
  focus:'#1F5C63', notice:'#8A6D1F', accent:'#E8836A', accentShadow:'#B9614B', onAccent:'#2B140D',
  skyTop:'#C9E4EA', skyBottom:'#F7F5F0', sea:'#6FA8B0', seaDeep:'#3F7A83', foam:'#FFFFFF',
  sand:'#EBDDC3', sandShadow:'#D6C5A5' },

// Dark themes
midnightTide: { // deep navy night sea
  bg:'#0E1A24', surface:'#152532', surface2:'#1C3141', ink:'#E6F1F5', inkSoft:'#9DB4BF',
  primary:'#4FC3C9', primaryShadow:'#2B8E94', onPrimary:'#08222A', line:'#24394A',
  focus:'#8FE3E7', notice:'#E8C46A', accent:'#F5B971', accentShadow:'#C48D4A', onAccent:'#2A1A06',
  skyTop:'#0B1530', skyBottom:'#1B2F4A', sea:'#1F4E6B', seaDeep:'#12324A', foam:'#9FD9E6',
  sand:'#8C7A5A', sandShadow:'#6F5F44' },
deepSea: { // indigo depths with bioluminescent mint
  bg:'#0F1030', surface:'#181A42', surface2:'#22255A', ink:'#ECEBFF', inkSoft:'#A9A8D6',
  primary:'#8C8CFF', primaryShadow:'#5A5AD1', onPrimary:'#0F1030', line:'#2C2F66',
  focus:'#C2C2FF', notice:'#E8C46A', accent:'#5EE0C8', accentShadow:'#36B39C', onAccent:'#06231D',
  skyTop:'#080926', skyBottom:'#1E2160', sea:'#26307A', seaDeep:'#161C52', foam:'#9AA4FF',
  sand:'#6E6690', sandShadow:'#575073' },
aurora: { // charcoal with green and violet light
  bg:'#10141A', surface:'#171D25', surface2:'#1F2731', ink:'#EAF2F0', inkSoft:'#A3B3B0',
  primary:'#5EE0B0', primaryShadow:'#2FA97E', onPrimary:'#0B1F17', line:'#283240',
  focus:'#9CF2D2', notice:'#E8C46A', accent:'#B58CFF', accentShadow:'#8A62D6', onAccent:'#170A33',
  skyTop:'#0A1A1F', skyBottom:'#1C2A3A', sea:'#1E4A4F', seaDeep:'#12302F', foam:'#8FF0D0',
  sand:'#7A7466', sandShadow:'#5E594E' },
classicDark: { // exactly the v1 dark look, kept for existing users
  bg:'#12181C', surface:'#1B2328', surface2:'#222B31', ink:'#E8ECEF', inkSoft:'#A3AEB6',
  primary:'#6FB8BF', primaryShadow:'#4A8A90', onPrimary:'#12181C', line:'#2A343A',
  focus:'#9AD6DC', notice:'#E5C46B', accent:'#E8836A', accentShadow:'#B9614B', onAccent:'#2B140D',
  skyTop:'#0F1A20', skyBottom:'#1B2A33', sea:'#2D5560', seaDeep:'#1C3A42', foam:'#A8D8DE',
  sand:'#7D735F', sandShadow:'#605847' },

// High-contrast themes
pearl: { // high-contrast light
  bg:'#FFFFFF', surface:'#FFFFFF', surface2:'#F2F2F2', ink:'#000000', inkSoft:'#2B2B2B',
  primary:'#003F8C', primaryShadow:'#00265A', onPrimary:'#FFFFFF', line:'#000000',
  focus:'#000000', notice:'#5C4300', accent:'#8C3A00', accentShadow:'#5E2700', onAccent:'#FFFFFF',
  skyTop:'#D9ECFF', skyBottom:'#FFFFFF', sea:'#0050B3', seaDeep:'#003F8C', foam:'#FFFFFF',
  sand:'#F2E2C2', sandShadow:'#8C7A57' },
ink: { // high-contrast dark
  bg:'#000000', surface:'#0A0A0A', surface2:'#1A1A1A', ink:'#FFFFFF', inkSoft:'#E6E6E6',
  primary:'#FFD84D', primaryShadow:'#C9A100', onPrimary:'#000000', line:'#FFFFFF',
  focus:'#FFFFFF', notice:'#FFD84D', accent:'#7FE7FF', accentShadow:'#3FB6CC', onAccent:'#000000',
  skyTop:'#000000', skyBottom:'#0A1A2A', sea:'#0A3A66', seaDeep:'#062645', foam:'#FFFFFF',
  sand:'#5A4E36', sandShadow:'#3D3524' },
```

In the high-contrast themes, also use a 4px focus ring with a 2px inner ring in `bg`, make all borders 2px solid `line`, and use the color-blind-safe quadrant palette.

#### 4.6.3 Quadrant palettes

Quadrant colors must stay meaningful across themes and always come with their names in text.

| Palette | Surge | Swell | Ebb | Still | Used by |
|---|---|---|---|---|---|
| `standard` (v1) | `#E8836A` | `#F0B64C` | `#6E8DAF` | `#7DB59F` | Light themes, unless overridden |
| `night` | `#F09A82` | `#F5C66A` | `#8FAACB` | `#95C9B3` | Dark themes |
| `muted` | `#C99383` | `#CDB27A` | `#8C9DAE` | `#93AE9F` | Sandbar |
| `colorblind` (Okabe–Ito) | `#D55E00` | `#E69F00` | `#0072B2` | `#009E73` | Pearl, Ink, and anyone with `appearance.quadrantPalette = 'colorblind'` |

Tints: base color at 16–18% opacity on light surfaces and 24% on dark surfaces. Text on tints is always `ink`. In the color-blind palette, also add a small shape marker next to quadrant chips (Surge ▲, Swell ●, Ebb ▼, Still ■), drawn as inline SVG with `aria-hidden`; the text name remains.

#### 4.6.4 Theme tests (required)

`src/lib/theme/__tests__/contrast.test.ts` computes WCAG contrast for every theme:

- `ink` on `bg`, `surface`, `surface2` ≥ 4.5
- `inkSoft` on `bg` and `surface` ≥ 4.5
- `onPrimary` on `primary` ≥ 4.5
- `onAccent` on `accent` ≥ 4.5
- `primary` on `surface` ≥ 4.5 (it is used for link text)
- `focus` on `bg` ≥ 3
- `ink` on each quadrant tint (composited over `surface`) ≥ 4.5

Also test that every theme defines every token, and that `classic` and `classicDark` match the v1 values exactly.

#### 4.6.5 Theme picker UI

A grid of theme cards, 2 columns on mobile and 4 on desktop. Each card is a mini preview drawn with that theme's tokens: a tiny sky-and-sea strip on top, a 3D primary button, two lines of text and a quadrant dot row. It shows the theme name and a one-line description. The selected card has the check badge. Tapping a card applies the theme immediately, with the crossfade. Group headings: "Light", "Dark", "High contrast". A "Follow my device" toggle reveals two pickers ("When my device is light" and "When my device is dark").

---

## 5. Motion system

### 5.1 Goals

Motion should make Tide feel responsive and alive, explain what changed (where something came from and where it went), and celebrate gently. It should never distract, loop forever in someone's peripheral vision, or make anyone feel rushed. Fluid means: 60fps, physically plausible springs, consistent timing, and nothing janky on a mid-range Android phone.

### 5.2 Motion levels

`motion.level`: `off` | `calm` | `lively`.

| Level | What happens |
|---|---|
| `off` | No movement. State changes use instant swaps or opacity fades of 150ms or less. No loops, no parallax, no confetti, no idle companion animation (static expression only), static shore, no animated water fill (a progress bar instead), no animated tide chart drawing. |
| `calm` (default) | Short, small, soft movement. Entrances 200–300ms, translate ≤ 12px, springs with high damping. Companion: breathing and blinking only, with a "special idle" every 30–45 seconds. Celebrations: gentle tier only (no confetti burst; sparkle ring). Shore waves slow and low. |
| `lively` | Everything in this document: bouncier springs, staggered lists, confetti for big moments in pleasant states, companion special idles every 12–20 seconds, parallax on the shore, the animated tab icons and the FAB breath. |

Resolution logic (`useMotionLevel()` in `src/lib/motion/useMotionLevel.ts`):

1. If the user explicitly set a level in settings, use it.
2. Otherwise, if the OS prefers reduced motion, use `off`.
3. Otherwise, use `calm`.
4. v1's `reduceMotion: true` maps to `off` during migration.

Replace v1's `useReducedMotionPref()` internals so it returns `level === 'off'`. Keep the v1 function exported so v1 code keeps working.

In tests, set framer-motion's global skip-animations flag (`MotionGlobalConfig.skipAnimations = true`, if the installed version supports it), so flow tests don't wait for animations.

### 5.3 Motion tokens (`src/lib/motion/tokens.ts`)

```ts
export const duration = { instant: 0.08, fast: 0.15, base: 0.25, slow: 0.4, slower: 0.6, scenic: 1.2 }; // seconds
export const ease = { out: [0.22, 1, 0.36, 1], inOut: [0.65, 0, 0.35, 1], in: [0.55, 0, 1, 0.45] };
export const spring = {
  snappy:  { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 }, // buttons, toggles, chips
  bouncy:  { type: 'spring', stiffness: 380, damping: 18, mass: 0.9 }, // badges, celebrations (lively)
  gentle:  { type: 'spring', stiffness: 220, damping: 30, mass: 1 },   // sheets, cards, page enter
  floaty:  { type: 'spring', stiffness: 90,  damping: 14, mass: 1.2 }, // companion hops, shore items
};
export const stagger = { list: 0.035, grid: 0.025, max: 0.3 }; // never stagger longer than 0.3s total
```

A helper `motionFor(level, preset)` returns the right transition for the level: at `off` it returns `{ duration: 0 }`; at `calm` it swaps `bouncy` for `gentle` and halves distances; at `lively` it returns the preset unchanged. Components never hardcode durations.

### 5.4 Page and navigation transitions

- Use `src/app/(app)/template.tsx` (it re-mounts on every navigation) to animate page **enter**: opacity 0 → 1 and y 12 → 0 with the `gentle` spring (a fade only at `calm`; nothing at `off`).
- Do not try to animate page exit in the App Router. Where continuity matters, use shared-element transitions within a page (`layoutId`).
- Tab switches: the active pill indicator slides (`layoutId="tab-indicator"`).
- Full-screen flows (focus, wrap-up, companion studio, demo) enter with a slide-up and scale 0.98 → 1.
- Optional: if the View Transitions API is supported and the level is `lively`, use it for the Shore ↔ Today transition of the shore preview strip. Treat it as progressive enhancement only.

### 5.5 Micro-interaction catalog (implement all)

| Element | Interaction | Lively | Calm | Off |
|---|---|---|---|---|
| Button | Press | Ledge collapse 70ms, release spring | Same | Ledge collapse, no spring |
| Selectable card | Select | Border color tween, check badge pop (bouncy) | Badge fade + scale 0.9 → 1 | Badge appears |
| Chip | Toggle | Check icon slides in from the left, tint fades in | Fade | Instant |
| Switch | Toggle | Knob springs across (snappy), track color tween | Same | Instant |
| Checkbox in lists | Check | Box fills, check stroke draws (pathLength 0 → 1, 250ms) | Fill + check fade | Instant |
| Task card | Move between columns | `layout` animation so it glides to its new place; old spot collapses | Fade out and in | Instant |
| Task card | Marked done | A water ripple sweeps left to right across the card, the title gets a soft strike, then the card slides to Done | Strike + fade | Instant |
| Emotion candidates | Appear | Stagger in (y 16 → 0, 35ms apart), slight scale 0.96 → 1 | Fade, 35ms stagger | Appear |
| Mood map dot | Drag | Squash in the drag direction (scale 1.15 × 0.9) and settle with bouncy on release; the quadrant tint under the dot brightens | No squash | Instant |
| AI loading | Waiting | Companion "thinking" expression + three dots in a wave; skeleton shimmer | Dots pulse in opacity; no shimmer | Static "Loading…" text |
| Sheets | Open/close | Spring up, drag to dismiss, backdrop fade | Same, smaller overshoot | Instant |
| Toasts | Show | Slide up 16px + fade, auto-dismiss after 4s (pausable on hover/focus) | Fade | Appear |
| Numbers | Change | Count up/down over 400ms (e.g. "Kept energy: 3 → 4") | Instant change with a fade | Instant |
| ProgressBar | Advance | Spring fill + highlight shimmer once | Spring fill | Jump |
| Tab icons | Activate | Bounce + filled icon | Color change | Color change |
| FAB | Idle/press | Breath (scale 1.03, 4s); press ripple + wave sweep | Press ripple only | Nothing |
| Focus water fill | Progress | Rising water with a slow surface wave | Rising water, flat surface | Progress bar |
| Lists | Enter | Stagger 35ms (max 0.3s total) | 20ms stagger | Appear |
| Empty states | Enter | Companion pops in, waves once | Fade | Appear |
| Errors / notices | Show | Gentle horizontal nudge? **No.** Never shake. Fade + icon pulse once | Fade | Appear |

Never use shake, flash, strobe or rapid color cycling anywhere, including for errors.

### 5.6 Performance rules

- Animate only `transform` and `opacity` on HTML elements. On SVG, animate transforms and opacity on groups; use `pathLength` and small `d` morphs only on small paths.
- Use `will-change` sparingly, only during an animation.
- Pause loops when the tab is hidden (`document.visibilityState`) and when the element is offscreen (`IntersectionObserver`). The companion, shore waves, FAB breath and stars all obey this.
- Only one looping companion animation runs at a time. If two companions are visible (for example a toast head and a header companion), only the larger one loops.
- Lazy-load heavy pieces with `next/dynamic`: the companion art of the selected species only, the Shore scene, confetti, the demo director, the tide chart, and the toolkit tools.
- Budgets: first-load JS for `/` ≤ 300 KB gzipped (record the v1 baseline in V0; v2 may add at most 60 KB to it). Measure frame rate in Chrome DevTools with 4× CPU throttling: Today, Check-in and Shore must stay above 50fps during their animations. Log the results.

---

## 6. Sound and haptics

### 6.1 Principles

Sound is **off by default** and turned on by choice (in onboarding, or by the Playful preset). All sounds are soft, short, low-pitched rather than shrill, and never startling. There are no audio files to license: every sound is generated with the Web Audio API.

### 6.2 Sound engine (`src/lib/sound/`)

- `engine.ts` holds a lazily created `AudioContext`, created and resumed only after a user gesture. It has a master gain and category gains (`ui`, `celebration`, `companion`, `ambience`), and exports `play(name, opts?)`.
- `useSound()` is a hook returning `play` that respects `sound.enabled`, the category toggles and the volume. It does nothing while the demo director is muted.
- Each sound is a small synthesis function in `src/lib/sound/sounds/*.ts`:

| Name | Character | Recipe (starting point; tune by ear) |
|---|---|---|
| `tap` | Soft wooden tick | Sine 520Hz, 35ms, fast attack, exponential decay; very quiet |
| `toggle` | Two-step click | Two sine blips 440 → 660Hz, 30ms each |
| `select` | Bubble pop | Sine with pitch drop 900 → 500Hz over 60ms |
| `success` | Warm two-note chime | Triangle waves C5 then E5 (major third), 120ms each, soft reverb (convolver from generated noise impulse) |
| `celebrate-small` | Rising three-note arpeggio | C5–E5–G5, 90ms apart, triangle + sine blend |
| `celebrate-big` | Arpeggio + shimmer | C5–E5–G5–C6 + high filtered noise sparkle 400ms |
| `water-drop` | Shore item lands | Sine 1200 → 300Hz over 120ms + tiny noise click |
| `wave` | Shore whoosh | Band-passed noise with a 1.2s swell envelope |
| `bottle` | Cork pop + glassy ring | Short noise burst + sine 1800Hz, 300ms decay |
| `chirp-<species>` | Companion voice sound (not speech) | Otter: two quick squeaks; axolotl: soft "bloop"; capybara: low hum; gecko: tiny chirp; jellyfish: glassy shimmer; hermit crab: double click |
| `breath-in` / `breath-out` | Optional breathing cue | Very soft filtered noise rising and falling over 4s |
| `focus-end` | Gentle bell | Sine 660Hz with long 2s decay, low volume |

- **Ambience** (`sound.ambience`) for focus and wind-down: `waves` (noise through a low-pass filter with a slow amplitude LFO at about 0.1Hz), `rain` (pink-ish noise plus random high-passed droplets), `brown` (brown noise via integrated white noise, low-passed). Loop seamlessly by generating continuously in an `AudioWorklet` or a looping 10s buffer with crossfade. Fade in and out over 1.5s.
- Cap simultaneous sounds at 3. Each sound's max gain is fixed so nothing is loud even at 100% volume.

### 6.3 Haptics

`src/lib/haptics.ts` exports `haptic('light' | 'medium' | 'success')`, mapped to `navigator.vibrate` patterns of 10ms, 20ms and [12, 40, 18]. Feature-detect: the Vibration API is not available in iOS Safari, so the setting shows "Not supported on this device" there and is disabled. Off by default.

### 6.4 Where sounds play

Buttons (`tap`, only for primary buttons and the FAB), toggles (`toggle`), chips and cards (`select`), check-in saved (`success`), celebrations (by tier), shore item landing (`water-drop` + `wave`), bottle open (`bottle`), companion tap (`chirp-…`), focus end (`focus-end`), breathing cues (optional setting). Never play sound on the crisis screen or the support page.

---
## 7. Voice upgrade (natural read-aloud; dictation untouched)

### 7.1 The problem

The team reports that read-aloud voices "sound weird, not real". In v1, read-aloud most likely uses `speechSynthesis` with the browser's default voice and raw UI text. That produces robotic results for four reasons:

1. **The default voice is often the worst one.** Examples: legacy desktop voices on Windows, compact voices on Android, and the first voice in the list on macOS, which can be a novelty voice.
2. **Voices load asynchronously.** If you speak before the `voiceschanged` event, you get the default voice.
3. **The text isn't written for speech.** Symbols like "·", "→", "≥", "4/5", "min", abbreviations and missing punctuation make voices stumble or read symbols aloud.
4. **Browser bugs.** Chrome cuts off utterances after about 15 seconds; Safari needs a user gesture before the first speech; pitch or rate tweaks make voices sound synthetic.

### 7.2 Architecture (`src/lib/voice/`)

```
voice/
  engine.ts          // speak(text, opts) / stop() / isSpeaking / onState — picks an engine
  browserEngine.ts   // Web Speech synthesis with the fixes below
  cloudEngine.ts     // fetches /api/tts audio, plays via <audio>, caches
  clipsEngine.ts     // plays pre-generated clips from /public/voice when available
  voiceRanking.ts    // scores device voices
  speechText.ts      // turns UI text into speech-friendly text
  useVoice.ts        // React hook for components
  VoicePicker.tsx    // settings UI with previews
```

The engine choice depends on `voice.engine`:

- `auto` (default): pre-generated clip if one exists for this exact text and voice → cloud voice if configured, online and allowed → best device voice → silent fallback with a notice.
- `natural`: cloud, then device.
- `device`: device voice only.
- `off`: read-aloud buttons are hidden.

All existing read-aloud callers (`ReadAloudButton` and any `speak` usage outside the frozen dictation code) switch to `useVoice()`. Only one utterance plays at a time: starting a new one stops the old one. The read-aloud button shows a "speaking" state (animated sound bars at Lively, a static icon at Off) and becomes a stop button while speaking.

### 7.3 Device voice ranking (`voiceRanking.ts`)

Wait for voices: call `speechSynthesis.getVoices()`; if it's empty, wait for `voiceschanged` (with a 1.5s timeout), then rank. Filter by language: keep voices whose `lang` starts with `en`. If `voice.accent` is set (`en-US`, `en-GB`, `en-AU`, `en-CA`, `en-IN`, `en-IE`, `en-ZA`), prefer that exact locale.

Score each voice (higher is better):

| Signal (case-insensitive, in `name`) | Score |
|---|---|
| contains "Natural" (Edge neural voices such as "Microsoft Aria Online (Natural)") | +60 |
| contains "Neural" | +50 |
| contains "Premium" | +45 |
| contains "Enhanced" | +40 |
| contains "Online" | +15 |
| starts with "Google" (Chrome's network voices) | +25 |
| known good names: Ava, Samantha, Allison, Susan, Zoe, Evan, Nathan, Tom, Serena, Daniel, Karen, Moira, Tessa, Aria, Jenny, Guy, Sonia, Libby, Natasha, Emma, Brian, Andrew | +15 |
| `localService === false` (network voice; usually higher quality) | +8 |
| exact preferred locale match | +10 |
| contains "Compact" | −30 |
| legacy desktop voices: "Microsoft David Desktop", "Microsoft Zira Desktop", "Microsoft Mark" | −25 |
| eSpeak or "espeak" | −100 |
| macOS novelty voices: Albert, Bad News, Bahh, Bells, Boing, Bubbles, Cellos, Good News, Jester, Organ, Superstar, Trinoids, Whisper, Wobble, Zarvox, Fred, Junior, Ralph, Kathy, Princess, Deranged, Hysterical | −200 (never auto-pick) |

Pick the highest score, unless the user picked a specific voice (`voice.deviceVoiceURI`). If the chosen voice is a network voice and the device is offline, use the best local voice. Unit-test the ranking with fixture voice lists for Windows Edge, Windows Chrome, macOS Safari, macOS Chrome, Android Chrome and iOS Safari.

### 7.4 Speech-friendly text (`speechText.ts`)

Before speaking, transform the text:

- "·" and "•" → ", "; "→" → " to "; "≥" → " at least "; "≤" → " at most "; "&" → " and "; "/" between numbers ("4/5") → " out of ".
- "k of n" stays as words ("4 of 5" is fine).
- Number + "min" → "minutes" ("1 minute" when singular); "sec" → "seconds"; "hr" → "hours".
- Times: "3:40 pm" stays (voices read it well); "15:40" in 24h mode → "15 40" is bad, so convert to "3 40 PM" for speech only.
- Dates "Tue, Oct 27" → "Tuesday, October 27".
- Remove emojis, markdown, quotation marks around single words, and any `{placeholders}` that failed to fill.
- Quadrant names in literal mode: "Ebb (low energy, unpleasant)" → "Ebb. Low energy, unpleasant."
- Make sure every sentence ends with punctuation, so voices pause naturally; join list items with ". ".
- Split into chunks of at most about 180 characters at sentence boundaries (then at commas).

Unit-test every rule with input → output pairs.

### 7.5 Browser engine fixes (`browserEngine.ts`)

- Call `speechSynthesis.cancel()` before starting a new utterance.
- Queue chunks one after another (speak the next one on the `end` event), so Chrome's 15-second cut-off never triggers.
- Keep-alive workaround for long text on Chrome: every 10 seconds while speaking, call `pause()` then `resume()` (only on Chromium, detected by user agent).
- Rate: user setting (`voice.rate`, default 1.0; v1 `readAloudRate` maps over). **Pitch is always 1.0.** Changing pitch makes voices sound synthetic.
- Volume 1.0.
- If speaking fails (an `error` event, or no `start` within 2 seconds), fall back to the next engine or show a quiet toast: "Couldn't play the voice on this device."
- iOS Safari: the first speech must come from a user gesture. The read-aloud button is a gesture, so that's fine; auto-read features wait until after the first tap.

### 7.6 Cloud neural voices (optional, `/api/tts`)

For voices that sound truly human on every device, add an optional server route. The provider is chosen by environment variables:

```
TIDE_TTS_PROVIDER=none            # none | openai | elevenlabs
OPENAI_API_KEY=                   # if openai
TIDE_TTS_OPENAI_MODEL=gpt-4o-mini-tts
ELEVENLABS_API_KEY=               # if elevenlabs
TIDE_TTS_ELEVEN_MODEL=eleven_multilingual_v2
TIDE_TTS_MAX_CHARS=600
```

Add these to `.env.example` with empty values and comments.

- `POST /api/tts` with body `{ text: string (≤ TIDE_TTS_MAX_CHARS), voice: string, speed?: number }`. Validate with zod and rate-limit with the existing limiter. Return `audio/mpeg`.
- **OpenAI:** `POST https://api.openai.com/v1/audio/speech` with `model`, `voice`, `input`, `response_format: "mp3"`, and, for `gpt-4o-mini-tts`, an `instructions` string such as "Speak warmly, calmly and naturally, like a kind friend. Relaxed pace. No dramatic emphasis." Voices to offer: `coral`, `sage`, `shimmer`, `nova`, `alloy`, `ash`, `ballad`, `verse`.
- **ElevenLabs:** `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` with header `xi-api-key` and body `{ text, model_id }`. Offer 4–6 voice IDs, configured in `src/data/voices.ts` (the team can change them).
- **Verify the current API shapes in each provider's documentation** before writing the code. If something differs from this description, follow the documentation and log the difference.
- The server never logs the text. It logs only provider, status, latency and character count.
- `GET /api/tts/status` returns `{ available: boolean, provider: 'openai' | 'elevenlabs' | 'none', voices: [...] }`, without secrets.
- Client caching: store audio blobs in the Cache Storage API (`caches.open('tide-voice-v1')`), keyed by SHA-256 of `provider|voice|speed|text`. Static texts (strategy steps, companion lines, captions) therefore only download once. Cap the cache at 200 entries (LRU by a small index in `localStorage`, wrapped in try/catch).
- Privacy: the Settings → Voice section explains: "Natural voices send the text being read to <provider> to turn it into audio. Tide only sends the text on screen that you asked to hear, never your history." A toggle `privacy.naturalVoiceAllowed` controls it.
- Companion voices: when a cloud provider is active, each companion species has a default voice that suits its personality (defined in `src/data/voices.ts`; for OpenAI, for example: otter → `coral`, axolotl → `shimmer`, capybara → `sage`, gecko → `nova`, jellyfish → `ballad`, hermit crab → `verse`). These voices are used only for companion lines (`voice.readCompanion`). Instructions and AI cards use the user's chosen voice.

### 7.7 Pre-generated clips (optional, for an offline-proof demo)

Add `scripts/generate-voice-clips.ts`, a Node script the team runs manually with a cloud key. It collects static texts (all strategy steps, all companion lines for the demo companion, demo captions marked `narrate: true`, breathing cues), synthesizes them with the configured provider and voice, and writes `public/voice/<voiceId>/<sha>.mp3` plus `public/voice/manifest.json` (mapping text hashes to files). `clipsEngine.ts` checks the manifest first. If the folder doesn't exist, everything still works. Add `npm run voice:clips` and document it in `docs/TEAM_TODO.md`. Do not commit generated audio unless the team chooses to (the script prints its total size first).

### 7.8 Voice picker UI (Settings → Voice, and onboarding step)

- An engine segmented control: Auto / Natural (disabled with an explanation if not configured) / Device / Off.
- A list of the top 8 device voices (by score), each with its name cleaned up (for example "Aria (Natural)", "Samantha"), its accent label and a "Play sample" button. The sample sentence: "Hi, I'm here to help you start small. Take your time."
- For cloud: voice cards with names and samples.
- Rate slider: 0.8, 0.9, 1.0, 1.1, 1.2.
- Accent preference.
- Toggles: "Read AI suggestions automatically", "Read my companion's words", "Speak breathing cues".
- A note when the device has only robotic voices: "Your device's voices are limited. For a more natural voice, try Microsoft Edge, or turn on Natural voices if your team set them up."

### 7.9 Breathing narration

When "Speak breathing cues" is on, Box breathing speaks "Breathe in", "Hold", "Breathe out", "Hold" at the start of each phase. Use pre-generated clips or cached cloud audio when available, so the timing is tight. With device voices, start speaking 150ms before the phase starts, to account for latency.

---

## 8. Companions

### 8.1 The six companions and "none"

All companions are **original designs** for Tide. They must not resemble existing characters (for example: no Duolingo owl look, no Pokémon-like designs, no blocky game-style axolotl, no existing brand mascots). They live in Tide's seaside world. Default names can be changed by the user.

| Species id | Default name | Personality | Why it's in Tide | Signature idle | Focus activity (body doubling) | Bridge action |
|---|---|---|---|---|---|---|
| `otter` | **Pebble** | Warm, social, playful | Connection and comfort; holds a pebble out to you like a gift | Floats, turns its pebble in its paws, occasional happy spin | Sorts a little pile of pebbles | Tucks its pebble into a pouch |
| `axolotl` | **Lolo** | Curious, gentle, optimistic | Axolotls are native to Xochimilco, Mexico (a nice local touch for Monterrey), and famous for regrowing what they lose: "starting over is okay" | Gills wiggle softly, slow smile, curious head tilt | Reads a tiny book, turning pages | Puts on a little backpack |
| `capybara` | **Capi** | Calm, unbothered, steady | The calm companion for overwhelming days | Sits in warm water; ear twitch; slow yawn; a small citrus sometimes balanced on its head | Sips tea, steam curling up | Slowly stands, stretches |
| `gecko` | **Zip** | Upbeat, practical, "one small step" | Sticky feet = sticking with small steps; good for getting unstuck | Tail curl, quick blink, licks its own eye (a real gecko habit), little climb | Writes with a tiny pencil | Hops onto a little suitcase |
| `jellyfish` | **Luma** | Quiet, soft, few words | Low-stimulation option; the face can be hidden completely | Gentle pulse, tentacles sway, soft glow | Drifts slowly beside you, glow dimmed | Glow brightens briefly, drifts upward |
| `hermit_crab` | **Shelby** | Shy, thoughtful, careful | Changes shells, which is literally a transition: "new shells feel strange at first, then they fit" | Peeks out of its shell and back in | Polishes its shell | Swaps into a new shell (signature bridge animation) |
| `none` | — | — | For anyone who prefers no character | Abstract wave and light animations replace the companion | A slow wave line beside the timer | Wave folds into a new shape |

### 8.2 Hard rules for every companion

1. It never shows sadness, sickness, hunger, tears, anger or disappointment. The "soft" expression (gentle eyes, small smile, leaning closer) is used for unpleasant states. Unpleasant feelings are met with warmth, not mirrored.
2. Its state never depends on how much the user does, how often they open the app, or whether they finish tasks.
3. It never says "I missed you", "Where were you?", "You haven't…", "Don't forget…", or anything that creates obligation.
4. It never comments on the user's body, weight, eating or appearance.
5. It is never shown on the crisis screen.
6. In Literal and Direct modes, it uses the shared literal/direct lines (Appendix B), not its personality lines.
7. It can always be hidden (per placement) or turned off entirely, and changed at any time with no loss of anything.

### 8.3 Art direction

- **Style:** flat vector, rounded, chunky proportions (big head, small body), large expressive eyes with a white highlight, soft blush on the cheeks, no outlines (or 2px rounded outlines in a darker shade of the body color), no gradients except Luma's glow and water. Think "friendly sticker". Silhouettes must be readable at 48px.
- **Canvas:** each companion is an SVG with `viewBox="0 0 200 200"`, drawn as separate groups: `body`, `head`, `eyes`, `mouth`, `cheeks`, `limbs`, `tail` or species extras, `accessory-head`, `accessory-face`, `accessory-neck`, `accessory-back`, `prop`. Each group has a transform origin set for animation.
- **Colors:** each species has 4 color variants. Each variant defines `main`, `shade` (about 12% darker), `light` (belly or muzzle), `accent` (gills, spots, shell) and `blush`. Eyes are `#1D1A1F` with a `#FFFFFF` highlight in every theme; in dark themes, add a 1.5px light rim around dark parts so they don't disappear.
- **Attachment points:** each species exports coordinates for `head`, `face`, `neck` and `back`, so accessories sit correctly on every species.

Species drawing notes (starting points; make them charming):

- **Otter (Pebble).** Sitting pose. Bean-shaped body; round head (radius about 46) with small round ears; a lighter muzzle oval with a rounded triangular nose; three whiskers each side (thin rounded strokes); small paws holding a grey pebble in front of the belly; a flat tail curling at the side.
  - Variants: Chestnut (`#8B5E3C`/`#E9D2B4`), Sea grey (`#6B7F8C`/`#DDE5EA`), Cocoa (`#5E4033`/`#D9C2AA`), Honey (`#B07A3E`/`#F2DEC1`).
- **Axolotl (Lolo).** A wide, soft head (ellipse about 140×100), a small body below, three feathery gills on each side (rounded teardrops with darker tips), a wide gentle smile, widely spaced dot eyes with highlights, tiny four-fingered hands, and a tail fin curving behind.
  - Variants: Pink (`#F6B3C8`, gills `#E9799E`), Wild olive (`#7C8C63`, gills `#566343`), Gold (`#F2C66B`, gills `#E09A3A`), Lavender (`#C9B6EE`, gills `#9D84D6`).
- **Capybara (Capi).** A rounded-rectangle body; a head with a flat top and a long, gentle muzzle; small round ears on top; a wide rounded nose with two nostril dots; half-closed calm eyes as the default; short legs. An optional "warm water" base (a teal half-ellipse with two steam curls), shown on Today and the Shore.
  - Variants: Classic (`#A8774D`), Sandy (`#C49A6C`), Dark (`#7A5638`), Cream (`#D8BC94`).
- **Gecko (Zip).** A leopard-gecko-inspired friendly lizard: a teardrop body with soft round spots, a big round head, large round eyes with big pupils (friendly, not slit-eyed), a wide smile, round toe pads, and a thick curled tail with bands.
  - Variants: Sunny (`#F2C35B`, spots `#8A6A3A`), Mint (`#9ADBB5`, spots `#4E9A73`), Sky (`#9CC8F0`, spots `#4F7FB8`), Coral (`#F29A6B`, spots `#B85A35`).
- **Jellyfish (Luma).** A rounded bell (dome path) with a lighter inner dome, `fillOpacity` about 0.9, 5–7 wavy tentacles (paths that sway), and a soft glow made with a pre-blurred radial gradient circle behind the bell. Do **not** use live `feGaussianBlur` filters, which are expensive. The face is optional (`companion.faceStyle`: `dots` = two small dot eyes and a tiny smile, `none` = no face).
  - Variants: Moon (`#CFE3FF`), Rose (`#FFC9E3`), Mint (`#C6F5E3`), Violet (`#DCCBFF`).
  - If `companion.mirrorState` is on, the glow color softly tints toward the latest check-in's quadrant color.
- **Hermit crab (Shelby).** A spiral shell (a circle with a spiral path and 2–3 ridges) as the main mass; the crab peeks out in front with two eye stalks topped by round eyes, one bigger claw and one smaller, and four little legs. The body is `#E9775A` in every variant.
  - Variants change the shell: Coral (`#F29E86`), Sea glass (`#8FD3C8`), Sand (`#E8C99A`), Plum (`#B38BC9`).
  - Its signature bridge animation: it steps out of one shell and into another (cross-fade the shells and slide the crab between them).

If the team later supplies professional SVG art (for example exported from Figma with the same group ids), the component must accept it with minimal changes. Document the expected group ids in `docs/CODE_WALKTHROUGH.md` under "Replacing companion art".

### 8.4 Expressions

Every species implements every expression. Expressions are built by swapping eye shapes, mouth shapes and extras, plus a small body pose.

| Expression | Eyes | Mouth | Extras / pose | Used when |
|---|---|---|---|---|
| `idle` | Open, highlight | Small smile | — | Default |
| `happy` | Happy arcs (^ ^) | Open smile | Blush brighter; small hop | Positive moments, Swell check-in |
| `curious` | Wide open, pupils up-left | Small "o" | Head tilt 8° | Listening, new shore item |
| `listening` | Open, slow blinks | Closed soft smile | Leans toward the input | Typing in check-in |
| `thinking` | Looking up | Small flat mouth | Three dots above the head (animated) | AI loading |
| `soft` | Gentle (lower lids raised slightly) | Small closed smile | Leans closer; blush soft | Ebb or Surge check-in, "Didn't start", hard moments |
| `calm` | Half-closed, relaxed | Soft smile | Slow breathing | Still check-in, wind-down |
| `proud` | Happy arcs | Big smile | Sparkles around; wiggle | Celebrations |
| `focused` | Looking down at its activity | Neutral | Prop visible (book, tea, pencil…) | Focus block |
| `breathing` | Closed during the in-breath, open during the out-breath | Neutral | Body scales with the breath phase | Box breathing and other breathing |
| `packing` | Open | Determined small smile | Backpack or bridge prop | Bridge |
| `sleepy` / `sleeping` | Half-closed / closed | Tiny "o" / soft | Zzz drifting (Lively); nightcap accessory overlay | Wrap-up end, night shore |
| `waving` | Happy arcs | Smile | One limb waves | Greetings, goodbyes |

For **Luma** without a face, expressions are carried by glow intensity, pulse speed, tentacle motion and color:

- happy: brighter and faster pulse;
- soft: dimmer and closer;
- thinking: glow travels around the rim;
- sleeping: very dim and still.

### 8.5 Animation

Use framer-motion variants on the SVG groups. All of it respects motion levels:

- **Breathing (always at Calm and Lively):** body scale 1 → 1.025 → 1 over 4s, ease in-out, origin at the bottom center.
- **Blink:** eyes `scaleY` 1 → 0.1 → 1 over 140ms, every 3–6s (random interval). Paused at Off.
- **Bob (Lively):** y ±3px over 3.2s.
- **Special idle:** the species' signature idle (Section 8.1), every 12–20s at Lively and every 30–45s at Calm. It never plays while the user is typing or during breathing exercises.
- **Reactions (one-shot):**
  - `hop`: y −14 with the `floaty` spring, then settle;
  - `wiggle`: rotate −6 → 6 → 0, two cycles;
  - `lean`: rotate −4 and x +6;
  - `wave`: limb rotate 0 → 25 → −10 → 25 → 0;
  - `spin` (otter only, Lively);
  - `shellSwap` (hermit crab);
  - `pulseBurst` (jellyfish).
- **Expression changes:** cross-fade the eye and mouth shapes over 120ms (or morph the paths when they have the same number of points).
- **Breath sync:** `breathPhase` (`in`, `hold-in`, `out`, `hold-out`) drives the body scale (in: 1 → 1.08 over the phase duration; hold: steady; out: back to 1). The companion also closes its eyes on the in-breath. This is exact, so the companion can lead the breathing.
- **Walking (Shore and walk timer):** a 2-frame waddle (alternate limb rotation ±10° every 250ms) plus x translation.
- Performance (Section 5.6): pause offscreen or when the tab is hidden; only one looping companion at a time.

### 8.6 Speech bubbles and personality

- `CompanionSay`: a rounded bubble (display font 600, 16px, max width 260px) with a tail pointing at the companion. It appears with a pop (Lively), a fade (Calm) or instantly (Off).
- Visible time: `max(2.5s, words × 0.35s + 1.5s)`. A tap pins it. It is announced with `aria-live="polite"`. Only one bubble at a time; new lines replace old ones. A tiny companion chirp sound plays if enabled.
- If `voice.readCompanion` is on, the line is also spoken (with the companion's cloud voice if available, else the user's device voice).
- **Talkativeness** (`companion.talkativeness`):
  - `quiet`: speaks only when tapped, and during breathing guidance.
  - `some` (default): key moments only (greeting once per day part, after check-in, unstick, focus start/end, bridge start, celebrations, shore item, wrap-up).
  - `chatty`: also one idle tip per session (from the `idle_tip` lines) and reactions to settings changes in Companion Studio.
- Lines come from `src/copy/companions.ts`: `lines[species][context]` for Gentle mode, plus `shared.direct[context]` and `shared.literal[context]`. All lines are in Appendix B; implement all of them. Placeholders like `{name}`, `{quadrant}` and `{m}` are filled by code.
- A line is chosen deterministically per day (a hash of date + context), so the same moment doesn't flip lines on every render but varies across days. Where a context has more than one line, add them as arrays.

### 8.7 Customization

- **Species:** any of the six, or none. Switching species shows a short swap animation: the old companion waves and slides out, the new one hops in.
- **Name:** text field, 1–16 characters, letters, spaces, hyphens and apostrophes; trimmed. A "Use default name" button restores it.
- **Color variant:** 4 swatches per species, each previewed live.
- **Accessory** (all unlocked from day one; there is nothing to earn): None, Scarf, Beanie, Round glasses, Headphones, Backpack, Flower crown, Bow tie, Star clip, Rain hat, Bandana, Tiny sun hat. Each is an SVG drawn for a generic attachment point, scaled and offset per species; the colors follow the theme accent unless the accessory has its own colors.
- **Size:** S (56px), M (88px, default), L (128px) for in-page placements.
- **Placements** (each on or off): Today header, Check-in, Unstick, Focus, Bridge, Toolkit exercises, Patterns, Shore, Wrap-up, Celebrations, Toasts, Empty states, Support page (never the crisis screen).
- **Talkativeness:** quiet, some, chatty.
- **Luma only:** face (dots/none) and "Glow follows my check-in" (`mirrorState`).
- **Voice** (when cloud is available): pick from the provider voices, with a sample.

### 8.8 Companion Studio (`/companion`)

A full-screen page, reached by tapping the companion in the TopBar, from Settings → Companion, and from onboarding.

- **Hero stage:** a mini shore scene, themed, with the companion at size XL (180px), idle-animating. Tap the companion to cycle through reactions (wave, hop, wiggle, signature) and play its chirp.
- **Name row:** the name in H1, with an edit pencil button.
- **Tabs:**
  - **Look:** species picker (horizontal carousel of 7 cards, including None, each with the mini companion idling, its default name and a one-line personality), color variants, accessories grid, size.
  - **Personality:** talkativeness with example lines; "Hear a line" button.
  - **Where it appears:** placement toggles with tiny icons.
  - **Voice:** cloud voice picker if available; the "Read my companion's words" toggle.
- **"Try a breath together":** a 1-cycle box-breathing preview with the companion leading.
- **About:** a short, kind paragraph about the species (for the axolotl: its home in the canals of Xochimilco and its famous regrowing; for the capybara: the calm, social reputation; and so on). Two or three sentences, factual and gentle. No claims about mental health.
- Changes save immediately (with an Undo toast for species and name changes).

### 8.9 Companion state and events

- **Profile:** read from settings (Section 15). Expose `useCompanion()` returning `{ species, name, variant, accessory, size, talkativeness, placements, faceStyle, mirrorState, voice, isNone }`.
- **Event bus** (`src/lib/companion/bus.ts`): a tiny typed emitter. Events:
  - `checkinSaved { quadrant }`
  - `aiLoading { route }` and `aiDone`
  - `taskDone { taskType, wasStuck }`
  - `focusStarted` and `focusEnded { outcome }`
  - `bridgeOpened`
  - `breathPhase { phase }`
  - `celebrate { tier, quadrant }`
  - `shoreItem { kind }`
  - `wrapStarted` and `wrapEnded`
  - `typing { active }`
  - `say { context, vars }`
- The `CompanionHost` component (one per placement) subscribes and maps events to expressions, reactions and lines, using the context table in Section 9.
- The companion's expression decays back to `idle` (or the placement's base expression) after 4 seconds.

---

## 9. Companions across the app

For every placement, the companion renders only if `placements.<x>` is true and the species is not `none`. With `none`, the placement shows the abstract alternative described below, or nothing.

| Screen | Placement and size | Behavior | Lines (context) | "None" alternative |
|---|---|---|---|---|
| **Today header** | Right of the greeting, M | `waving` on first view of the day part, then `idle`; tap → Studio | `greeting_morning/afternoon/evening` (once per day part) | Small animated wave glyph |
| **Check-in, step 1** | Sheet header, S | `listening` while typing (via the `typing` event, debounced 400ms); `thinking` while the AI loads | `checkin_listening` on open | Three dots wave |
| **Check-in, step 2** | Sheet header, S | `curious` as candidates appear | — | — |
| **Check-in saved** | Toast head + Today header | Expression by quadrant: Surge → `soft` + lean; Swell → `happy` + hop; Ebb → `soft` + lean; Still → `calm` | `after_checkin_<quadrant>` | Toast only |
| **Unstick** | Sheet header, S | `soft` on open; `happy` when a step is chosen | `unstick_offer` | — |
| **Focus** | Beside the water fill, L | `focused` with its activity prop, slow loop; `proud` on "Got going"; `soft` on "Didn't start" | `focus_start`, `focus_end_got_going`, `focus_end_didnt_start` | A slow wave line |
| **Bridge** | Sheet header, M | `packing` + species bridge action; during Shift, if the strategy is breathing, it leads the breath | `bridge_start`, `breathing_invite` | Wave folds |
| **Toolkit: Box breathing** | Center of the breathing square, L | `breathing`, driven by the exact `breathPhase` | `breathing_invite` at the start | The square's dot as in v1 |
| **Toolkit: Grounding 5-4-3-2-1** | Corner, S | `curious` on each new sense | — | — |
| **Toolkit: Walk timer** | Walks across the top in a loop (Lively) or stands (Calm) | `happy` at the end | — | — |
| **Toolkit: Sudoku** | Corner, S | `thinking`; `happy` when solved | — | — |
| **Toolkit: Message template** | Corner, S | `waving` | — | — |
| **Re-check** | Toast head | Better → `happy`; Same → `calm`; Worse → `soft` | — | — |
| **Patterns** | Top, S | `curious`; never reacts to specific patterns (to avoid seeming judgmental) | none by default | — |
| **Shore** | Lives on the sand, M | Walks to new items, sits, sleeps at night | `shore_new_item` | — |
| **Wrap-up** | Every step, M–L | Guides; `calm` → `sleepy` → `sleeping` at the end | `wrap_start`, `wrap_end` | Sunset scene only |
| **Celebrations** | Overlay, L | Section 10 | `celebration` | Sparkle ring |
| **Empty states** | Centered, M | `waving` or `curious` | Empty-state copy | Wave illustration |
| **Error boundary / 404** | Centered, M | `soft` | Fixed copy (Appendix A) | Wave illustration |
| **Splash** | Center, L | `waving` once (≤ 900ms; skipped at Off) | — | Logo wave |
| **Onboarding** | Throughout | Guides | Onboarding copy | — |
| **Support** | — | **No companion** on the crisis screen; on the regular support page an optional small `soft` companion at the top (placement `support`, default on) | — | — |

---
## 10. Celebrations (state-aware)

### 10.1 Idea

Celebrations reward real progress and make it feel good, the way Duolingo does. But they adapt to how the person said they feel. Confetti for someone who just said they feel drained is tone-deaf, so the emotional quadrant of the latest check-in (within the last 6 hours) changes the style. With no recent check-in, use the "neutral" column.

### 10.2 Events and base tiers

| Event | Base tier | Trigger |
|---|---|---|
| `checkinSaved` | micro | A check-in is saved |
| `taskStarted` | micro | A task moves to In progress |
| `taskDone` | small (big if the task was Stuck at any point today, or has energy cost 3) | A task moves to Done |
| `unstuck` | big | A focus block ends "Got going" on a task that was Stuck |
| `focusDone` | small | A focus block ends with "Got going" or "A little" |
| `bridgeDone` | small | "Done, I'm going" in the Bridge |
| `transitionRated` | small | Rated Easy or Okay |
| `recheckBetter` | small | A strategy re-check says Better |
| `wrapDone` | big | Close the day finished |
| `firstTime` | small | First time using a feature (first check-in, unstick, focus, bridge, strategy, wrap, bottle) |
| `bottleOpened` | micro | A message in a bottle is opened |

### 10.3 Celebration matrix (tier × quadrant → style)

| Tier | Swell (high, pleasant) | Still (low, pleasant) | Neutral (no check-in) | Surge (high, unpleasant) | Ebb (low, unpleasant) |
|---|---|---|---|---|---|
| micro | Check pop + `select` sound | Check pop | Check pop | Check pop | Soft glow on the element |
| small | Sparkle burst around the element, companion `happy` + hop, `celebrate-small` | Sparkle ring, companion `calm` smile, `success` | Sparkle burst, companion `happy`, `success` | Steady ripple (one slow ring), companion nod, `success` at low volume; copy "Done. One less thing." | Soft glow, companion `soft` smile, no sound; copy "That counted." |
| big | Full-screen overlay: confetti (Lively), companion `proud` + wiggle, title + message, `celebrate-big`, "Continue" button | Overlay with floating light bubbles rising slowly, companion `calm` → `happy`, `success` | Overlay with confetti (Lively) or sparkles (Calm), `celebrate-small` | **No overlay.** Card-level ripple + toast "You did a hard thing while a lot was going on.", companion nod | **No overlay.** Toast with soft glow: "You did that on a low day. It counts.", companion `soft` |

Motion-level modulation:

- **Lively:** as in the table.
- **Calm:** confetti is replaced by sparkles; overlays use fade + scale 0.96 → 1; no screen-wide particles.
- **Off:** no particles and no overlay animation. Overlays become a simple dialog (big tier, pleasant states only), and other tiers become a toast with an icon. Never skip the text: people should still know it worked.

Settings: `motion.celebrations` = `full` (as above), `gentle` (big becomes small; no confetti) or `off` (micro only, plus a toast for big events); `motion.confetti` on/off.

### 10.4 Rules

- **Frequency cap:** at most one big overlay per 10 minutes; extra big events are downgraded to small. At most 3 small celebrations per minute; extras are downgraded to micro.
- Overlays never block for more than 2.5 seconds without a "Continue" button. Tapping anywhere or pressing Escape dismisses. Focus moves to the "Continue" button; when the overlay closes, focus returns to where it was.
- Celebrations never appear on the crisis screen or support page, during Box breathing, or in the middle of typing.
- Confetti: use `canvas-confetti` (MIT, lazy-loaded) with theme colors (`primary`, `accent`, the quadrant base colors and `foam`), particle count 80, gravity 0.9 and `disableForReducedMotion: true`, on a pointer-events-none canvas. Or write a small canvas particle system with the same properties if bundle size is a concern. Log the choice.
- Each celebration has a screen-reader announcement with its text.
- `src/lib/celebrate/` exports `celebrate(event, context)`. It decides the final style from the matrix, the settings and the caps, then emits on the companion bus and renders through `CelebrationHost` (mounted once in the app shell).

### 10.5 Celebration copy

Copy varies by mode. Gentle-mode titles and messages for big overlays:

| Event | Title | Message |
|---|---|---|
| `unstuck` | "You got unstuck!" | "That was the hardest part. {companion} saw it." |
| `taskDone` (big) | "Big one, done." | "{title} is finished. It's on your shore now." |
| `wrapDone` | "Day closed." | "Rest well. Tomorrow's first step is ready." |
| `firstTime` | "First {feature}!" | "A pearl just washed up on your shore." |

Direct mode drops the second sentence. Literal mode: "Task finished: {title}. A shell was added to your shore." When the companion is `none`, replace companion mentions with neutral wording ("That was the hardest part.").

---

## 11. Onboarding 2.0 (a local "registration")

### 11.1 Why there is no login

Tide stores everything on the device. Accounts would mean sending emotional data to a server, adding password and security work, and adding friction before the first moment of help. So onboarding **feels** like signing up (you create your profile, your companion and your space) but nothing leaves the device. Never build a fake login screen. If the README or pitch mentions accounts, they are a roadmap item for institutions (university sign-in and sync).

### 11.2 Flow (route `/onboarding`, replacing the v1 three steps)

A Duolingo-style progress bar at the top (ProgressBar, with "Step n of 12" text for screen readers), a Back button and a Skip button on every step. Progress saves after each step (`settings.onboarding.step`), so closing the app and coming back resumes where the person left off. Each step enters with the gentle spring, and the companion (once chosen) appears on every later step.

1. **Welcome.**
   - Animated hero: the six companions pop in one by one on a little beach, waving (just the shore and waves at Off).
   - Title: "Welcome to Tide." Subtitle: "A calm place to plan around how you actually feel."
   - Buttons: "Let's set up your space" (primary), "Watch the demo" (secondary, starts the Demo director, Section 16), and "I've used Tide before" (ghost; goes to Settings → Your data → Import backup).
2. **Your name** (optional). "What should we call you?" Text field, with "Skip" if they'd rather not. Live preview: the greeting card "Good afternoon, {name}".
3. **Choose a companion.**
   - A horizontal snap carousel of 7 big cards (6 companions + "No companion"). Each card shows the companion idling at size L, its name, a one-line personality and a "Say hi" button (plays its chirp and a greeting line, read aloud if voice is on). Swiping or arrow keys move between cards; the dots below show position.
   - "Choose {name}" button. "No companion" says: "Just me and the waves. You can add a companion anytime in Settings."
4. **Name your companion.** Field prefilled with the default name; "Keep {default}" and "Rename". The companion reacts with `happy` + hop when confirmed.
5. **Make it yours.** Color variant swatches and an accessory grid, with the companion previewing live. "Looks good" button.
6. **How do you like your senses?** Sensory profile cards (the presets from Section 15.3: Calm, Low sensory, Focused, Playful, High contrast, and "I'll customize later"). Each card shows a short list of what it sets ("Soft motion · No sounds · Muted colors"). Picking one applies it immediately, so the person sees the change happen. Below: a "Sounds" toggle (shows "Sounds are off by default" unless the preset enables them) with a "Play a sample" button.
7. **Pick your colors.** The theme picker grid (Section 4.6.5), with the 15 themes grouped and live preview. The preset may have pre-selected one.
8. **How should Tide talk to you?** Communication mode cards (Gentle, Direct, Literal) as in v1, now with the companion saying the example line in each style. Reading level: Standard or Simple.
9. **Voice.** "Want Tide to read things aloud?" The voice picker (Section 7.8) in a compact form: 3 best voices with samples, rate, and "No thanks".
10. **Your day.** Time fields: "My day usually starts around" (default 7:00) and "I like to close the day around" (default 8:30 pm). "Warn me before switching activities": 5, 10 or 15 minutes (default 15, matching v1). 12-hour or 24-hour clock.
11. **Your privacy.** As in v1 step 3 (local storage, AI suggestions toggle, "Tide is not a medical or mental health service"), plus a short bullet list: "No account. No ads. No tracking." and "Natural voices" consent if the cloud voice is configured.
12. **Someone you trust** (optional, v1 content), then **your first check-in**:
    - "Let's try it once. It takes about 30 seconds."
    - Opens the real check-in sheet with coach marks (tooltips) on the text field, the candidates and the "What do you need" step. The companion encourages.
    - After saving: a first-time celebration, and the **welcome shell** washes up on a mini shore: "Your shore starts here. Every win leaves something on it."
    - Button: "Go to my day" → Today. Sets `onboarded = true`.

Skip behavior: "Skip" on any step applies that step's defaults and moves on. "Skip setup" (in a menu at the top right) applies all defaults (Lagoon, Playful font, Calm motion, sound off, companion = Lolo with the Pink variant) and goes to Today. Record the choice in the decision log.

### 11.3 Existing users ("What's new")

Users who finished v1 onboarding (`onboarded === true` and no `companion.species` key) must **not** be pushed through onboarding again. Instead:

- On their first v2 launch, show a full-screen **What's new** sheet (also reachable at `/whats-new`):
  - Pages: "Meet the companions" (carousel), "A fresh look" (theme previews + "Try the new look", which applies Lagoon + Playful font), "Your Shore", "Close the day", "Settings for everything", "Run the demo".
  - Each page has a "Set it up" button (opens Companion Studio, the theme picker, etc.) and "Maybe later".
- They keep the Classic theme, the Hyperlegible font and no companion until they choose otherwise.
- A Today card "Choose a companion?" appears until they pick one or tap "No thanks" (once).

---

## 12. Today 2.0

Keep every v1 element and behavior (state card, win card, Day Mode banner, next transition, Tide Line, moved tasks, add event, bridge card, rating prompt). Restyle them with the new components, and add:

1. **Header:** the greeting in H1 display font, the date below, and the companion (M) on the right. The greeting line from the companion appears once per day part in a speech bubble.
2. **Quick actions row:** four 3D IconTiles in a 2×2 grid on mobile and 1×4 on desktop:
   - "Check in" (opens the check-in sheet);
   - "Regulate" (Toolkit, filtered to the current quadrant);
   - "Focus" (opens a picker of In progress / Not started tasks, then the Focus page);
   - "Close the day" (enabled after `day.wrapTime − 2h`; before that it shows "Close the day · later").
3. **Morning card** (`day.morningCard`, shown from `day.start` until 12:00 if yesterday has a completed DayWrap with an anchor task):
   - Title "Good morning" with the companion waving.
   - "Your one thing today: {anchor task title}" and "First step: {anchorFirstStep}".
   - Buttons "Start with this" (Focus with that first step) and "Not now".
   - Below: yesterday's `tomorrowTip` in small text, and today's first transition ("First switch: Physics → Programming at 10:30").
4. **Bottle card:** if a bottle is eligible to surface (Section 13.7), "A bottle washed up" with a bobbing bottle illustration and "Open it".
5. **Evening card** (`day.wrapCard`, shown from `day.wrapTime − 30 min` if today has no completed wrap):
   - The companion yawns (`sleepy`); "Ready to close the day? About 3 minutes."
   - Buttons "Close the day" and "Not tonight" (hides it for today).
   - After a wrap is done: "Day closed. Sleep well." with "Reopen" (opens the summary) in place of the card.
6. **Shore preview strip:** a 96px-tall miniature of the shore (sky, sea and sand) showing today's items. Tapping it opens `/shore`. If items arrived since the last shore visit, a small "New" pill (never a number count).
7. **Order on the page:** header → state card (+ win card / bottle card) → morning card (morning only) → Day Mode banner → quick actions → next transition / bridge → evening card (evening only) → Tide Line → shore preview → moved tasks.

---

## 13. Your Shore

### 13.1 Concept

Your Shore turns the Proof log into a living place. Every win washes up as an item: a shell, a smooth pebble, sea glass, a starfish, driftwood, a sand dollar, a bottle or a pearl. The shore only ever grows; nothing is lost and nothing expires. It is a visual memory of "proof I can", designed for the days that feel heavy. It is not a score: there are no totals on the main view, no comparisons and no goals.

### 13.2 Route and layout (`/shore`, fifth tab)

- **TopBar:** title "Your Shore", and buttons "Collection" and "List".
- **Range chips:** Today / This week / All (default: This week).
- **Scene:** full width, height `min(62vh, 560px)`, an SVG scene (Section 13.3) with the items for the selected range.
- **Below the scene:**
  - "Write a note to future you" (bottle) button;
  - "Save as image" button;
  - a short line: "Every win leaves something here. Tap anything to remember it."
- **Empty state** (no wins yet): an empty beach with the companion sitting. "Your shore is quiet for now. Finish a task, get through a switch, or try a strategy, and something will wash up."

### 13.3 The scene (`src/components/shore/ShoreScene.tsx`)

Layers, back to front, in one SVG (viewBox `0 0 390 560`, scaled to fit, `preserveAspectRatio="xMidYMax slice"`):

1. **Sky:** a vertical gradient from `skyTop` to `skyBottom`, blended with the time-of-day palette when `shore.sky = 'time'` (default):
   - dawn (`day.start` ± 1h): blend toward `#FFD1B3`;
   - day: theme colors as they are;
   - golden hour (sunset − 1.5h): blend toward `#FFC27A`;
   - dusk: blend toward `#9C7BD1`;
   - night: theme dark (for light themes, darken the sky 70% toward `#0E1A2E`).
   - Sunset time is approximated from the date (a simple table for Monterrey latitude is fine; no network).
   - `shore.sky = 'theme'` always uses the theme colors; `static` uses the theme colors with no time changes.
2. **Sun or moon:** a disc that moves along an arc by time of day (static at Off).
3. **Clouds:** 2–3 soft rounded clouds drifting slowly (one cycle per 90–140s; Lively only; static at Calm).
4. **Far sea band:** `seaDeep`.
5. **Waves:** three layered sine-wave paths in `sea` at different opacities (0.9, 0.7, 0.5), each translating horizontally in a seamless loop (8s, 11s, 14s at Lively; double those at Calm; static at Off). The front wave meets the sand with a foam line (`foam`, dashed stroke whose offset animates at Lively).
6. **Sand:** a path with a wavy top edge filling the bottom 48% of the scene in `sand`, with a `sandShadow` band near the waterline and a few speckle dots.
7. **Dune grass:** 2–3 small tufts at the edges, swaying slightly at Lively.
8. **Items:** placed on the sand (Section 13.5).
9. **Bottles:** bobbing in the shallow water near the shoreline (unopened), or on the sand (kept).
10. **Companion:** on the sand at a home spot (bottom left third). It idles, walks to newly arrived items, sits, and sleeps at night (with a nightcap overlay and Zzz at Lively).
11. **Stars** (night only): 20–30 small dots that twinkle (opacity) at Lively.

If `shore.mirrorCheckins` is on (default off): the wave amplitude follows the latest check-in's energy (higher energy, taller waves). It never changes color based on mood, to avoid feeling judged.

Performance: one SVG, CSS transforms for loops, at most 48 items rendered, loops paused when offscreen or the tab is hidden. At Off, everything is static.

### 13.4 Item catalog (`src/data/shoreItems.ts`)

Each win has a `kind` (Section 18). The kind and the win's data determine the item deterministically. There is no randomness in **what** you get.

| Item | Comes from | Variants | Description shown on tap |
|---|---|---|---|
| Spiral shell | Task done, type `writing` | Color from task energy (1 light, 2 medium, 3 deep) | "A spiral shell. You finished something you wrote." |
| Scallop | Task done, `studying` | Same | "A scallop. You finished something you studied." |
| Cowrie | Task done, `admin` | Same | "A cowrie. You got a piece of admin done." |
| Conch | Task done, `social` | Same | "A conch. You reached out to someone." |
| Clam | Task done, `chores` | Same | "A clam. You took care of a chore." |
| Moon snail | Task done, `other` | Same | "A moon snail. You finished something." |
| Smooth pebble | Unstuck (focus "Got going" on a task that was Stuck) | Grey, slate, warm | "A smooth pebble. You got unstuck." |
| Sea glass | Transition rated Easy or Okay | Blue (Easy), green (Okay) | "Sea glass. You made it through a switch." |
| Starfish | Strategy re-check Better | Color by family: move orange, calm blue, connect pink, create yellow, think purple | "A starfish. {strategy} helped." |
| Sand dollar | Manual win | — | "A sand dollar. Something you chose to remember." |
| Driftwood | Day wrap completed | — | "Driftwood. You closed the day." |
| Bottle | Bottle note written (kept bottles) | Green, blue, clear glass | "A message you wrote to yourself." |
| Pearl | First time using a feature (check-in, unstick, focus, bridge, strategy, wrap, bottle): at most 7 pearls ever | — | "A pearl. Your first {feature}." |
| Welcome shell | Onboarding first check-in | — | "Your shore started here." |

Draw each item as a small SVG component (about 28–44px) in the flat style, with item-specific shapes. Colors come from a fixed item palette that works on every theme's sand (test contrast against `sand`: item outline or shade ≥ 3:1).

### 13.5 Placement (`src/lib/shore/placement.ts`)

- The sand area is a grid of 8 columns × 6 rows (48 slots) inside the sand polygon, avoiding the companion's home spot and the bottle zone.
- Sort the range's items by win timestamp ascending. For each item, compute `h = hash(win.id)`. The preferred slot is `h % 48`; if it's taken, probe linearly to the next free slot. Jitter: x ± 10px and y ± 6px from `hash(id + 'j')`. Rotation −25° to 25° from `hash(id + 'r')`. Scale 0.88–1.12 from `hash(id + 's')`.
- Deterministic: the same set of items always produces the same layout. Adding a new item never moves existing items (sorting by timestamp guarantees new items are placed last).
- If there are more than 48 items in the range, show the most recent 48 and a "+{n} more in your collection" chip.
- Unit-test determinism, no overlap (minimum center distance 30px), stability when appending, and the overflow behavior.

### 13.6 Arrival animation

Items created since `shore.lastSeenAt` are "new". On opening the shore (or when a win happens while the shore is visible), the new items arrive one by one, at most 6 animated; the rest just appear:

- **Lively:**
  1. The item appears in the water at its column's x and bobs for 600ms.
  2. The front wave swells (amplitude +40% for 800ms) and carries the item along a curved path to its slot over 900ms, with the `floaty` spring.
  3. It lands with a squash (scaleY 0.85 → 1) and a small sparkle; `water-drop` + `wave` sounds play.
  4. The companion turns, walks a few steps toward it, looks `curious`, then `happy`, and says `shore_new_item`.
- **Calm:** the item fades in at its slot with a 12px drop and a single sparkle; the companion looks `curious`.
- **Off:** the item appears; a polite live-region announcement says: "New on your shore: a starfish. 3-minute walk helped."

Then update `shore.lastSeenAt`.

### 13.7 Messages in a bottle

- **Write:** from the Shore ("Write a note to future you"), from the wrap-up, or from the Proof log.
  - A sheet: "Write something kind to yourself, for a hard day." Up to 280 characters, with the frozen dictation mic available.
  - Examples shown as placeholder rotation: "You've done hard weeks before.", "Breathe first. Then just the title."
  - The safety pre-check runs before saving (if it triggers, the crisis flow runs and nothing is saved, exactly like the check-in).
  - On save, a bottle appears bobbing in the shore's shallow water.
- **Surface:** a bottle becomes eligible when it's at least 24 hours old, not yet opened, and the latest check-in today is Ebb or Surge. At most one bottle surfaces per day (the oldest eligible one). It appears as the Today bottle card and glows on the shore.
- **Open:** a cork pop and a paper scroll unrolls (Lively; a fade at Calm/Off) showing the note, the date it was written ("You wrote this on Thursday, October 29"), and "Read aloud". Buttons:
  - "Keep it on my shore": the bottle moves to the sand as an opened bottle, and a Win of kind `bottle` is created.
  - "Let it drift": the bottle floats away; the note stays readable in the Collection under "Released notes".
- Bottles are never deleted automatically.

### 13.8 Item details, list and collection

- **Tap an item:** a popover card (or a bottom sheet on mobile) with the item illustration large, its name, the description, the win text, the date and time ("Tuesday, October 27 · 3:12 pm"), "Read aloud", and "See in list". Keyboard: items are focusable in a logical order (left to right, top to bottom); Enter opens the card; arrow keys move between items.
- **List view:** the "List" button opens `/proof` (the v1 Proof log, restyled) with items shown next to each win. Screen-reader users get a "Skip to list view" link at the top of the shore.
- **Collection** (`/shore/collection`): a grid of item types, each card showing the item illustration, its name, how many you've found ("You've found 7"), when you first found one, and the description. Items you haven't found yet are shown as soft outlines with "Not found yet" and how they arrive ("Finish a studying task"). This is a field guide, not a checklist to complete: no progress bar, no percentage. Also includes "Released notes" and "Pearls".

### 13.9 Save as image

"Save as image" renders the current scene to PNG:

1. Clone the SVG and inline the computed values of all CSS variables (read with `getComputedStyle`), so the exported image has real colors.
2. Remove speech bubbles and any text.
3. Serialize it, draw it on a canvas at 2× scale, and download `my-tide-shore-YYYY-MM-DD.png`.

The image contains no personal text by default. Add a checkbox "Include my name" (adds "{name}'s shore" at the bottom).

---
## 14. Close the day (evening wrap-up)

### 14.1 Purpose

Executive function doesn't end at the last class. Ending a day well makes the next morning easier: you see what you did, notice what helped and what was hard, decide what to do with loose ends, choose one thing to start tomorrow, and prepare its first step while you still remember the context. Close the day is that ritual, guided by the companion, in about 3 minutes. It feeds the patterns, the Shore and tomorrow's morning card. It is never required, never nagged about and never scored.

### 14.2 Entry points and timing

- Today evening card (from `day.wrapTime − 30 min`), the Close the day quick action (enabled from `day.wrapTime − 2h`), the profile menu (any time), and the Demo director.
- **Day boundary:** a wrap started between midnight and `day.start` belongs to the previous date.
- A wrap in progress is saved after every step. Reopening resumes at the last step. A completed wrap can be reopened read-only from the Today card ("Reopen"), and you can edit the reflection steps and the anchor.

### 14.3 Route and frame

`/wrap`, a full-screen flow (no tab bar):

- At the top: a slim ProgressBar with step dots, "Close" (X) and "Skip this step".
- The background is a scene that moves from sunset to night across the steps (it reuses the Shore sky renderer with a fixed path: golden → dusk → night).
- The companion is present on every step (size M; L on the first and last steps).
- Footer buttons: "Back" (secondary) and "Next" (primary).

### 14.4 Steps

**Step 1: Arrive**
- Title: "Let's close the day." Subtitle: "About 3 minutes. Skip anything you want."
- The companion yawns and waves; line `wrap_start`.
- Buttons: "Start" and "Not tonight" (exits; no consequences).

**Step 2: Evening check-in** (optional)
- "How are you arriving at the end of the day?"
- Shows the mood map (or sliders, per settings) and the simple-vocabulary chips (16 words, Section 15.2) as quick picks.
- "Save" creates a regular CheckIn (with the same safety rules, if the person types words). "Skip" moves on.
- The companion reacts by quadrant, as in Section 9.

**Step 3: Your day as a tide**
- A **Day tide chart** (`DayTideChart.tsx`):
  - **x-axis:** `day.start` → `day.end`, with hour ticks every 3 hours.
  - **Energy line:** the y-value is the check-in energy (−5 to 5). The line is drawn through the day's check-ins with monotone cubic interpolation (Fritsch–Carlson, so it never overshoots). Each segment is colored by the quadrant of its nearest check-in.
  - **Check-in markers:** each check-in is a dot with its emotion word on focus or tap.
  - **Event row:** under the line, small icons at their times: shell (task done), sea glass (transition), starfish (strategy), water drop (focus block), bottle (bottle written).
  - **Animation:** the line draws itself from left to right over 1.2s (Lively), fades in (Calm), or appears (Off).
  - **With fewer than 2 check-ins:** draw a calm flat line at the single value (or at 0), and say "Only one check-in today. That's fine."
- Under the chart, a factual sentence built by code, e.g. "You checked in 3 times, finished 2 tasks, got through 1 switch and tried 1 strategy." Use the numbers, but never comparisons ("more than yesterday") and never judgments.
- Accessibility: the chart has `role="img"` with a full text description, plus a "Show as list" toggle with a table (time, what happened).

**Step 4: Wins wash up**
- A mini shore strip shows today's wins arriving (the same arrival animation as Section 13.6, compressed).
- Each item can be tapped to read it.
- With zero wins: "Some days are about getting through. That counts too." and a button "Add something you did" (creates a manual win → sand dollar).

**Step 5: What helped?**
- Chips (multi-select):
  - first, the strategies actually used today (by name, with the starfish icon);
  - then the general options: "Sleep", "Food", "A person", "Music", "Moving", "Being outside", "Quiet", "A break", "Nothing in particular".
- "Something else" opens a short text field (the safety pre-check runs).
- Stored in `DayWrap.helped` (strategy ids prefixed `strategy:`, general ids prefixed `general:`, free text in `helpedNote`).

**Step 6: What was hard?**
- Chips: "Starting things", "Switching between things", "People", "Noise or place", "My body", "My mood", "Too much to do", "Nothing in particular", and "Something else" (text, with the safety pre-check).
- Stored in `DayWrap.hard` and `hardNote`.
- The companion is `soft` here.

**Step 7: Overall**
- "If today were water, it was…" Five big option cards, each with an illustration and a literal label:
  - Stormy: "Very hard"
  - Choppy: "Hard"
  - Mixed: "Mixed"
  - Calm: "Okay"
  - Glassy: "Good"
- In Literal mode, show only the literal labels.
- Optional. Stored as `overall`: `very_hard`, `hard`, `mixed`, `okay` or `good`.

**Step 8: Loose ends**
- List today's unfinished tasks (status ≠ done, and any of: due today or earlier, kept in today's DayPlan, in progress, stuck).
- For each task, a segmented choice:
  - **Tomorrow:** sets `movedFrom` = today and `movedTo` = tomorrow (the same semantics as Day Mode).
  - **Later this week:** sets `snoozedUntil` to the next weekday that is at least 2 days away.
  - **Let it go:** sets `someday = true`. Explain: "It moves to Someday. You can bring it back anytime."
  - **Keep as is:** the default; changes nothing.
- Nothing is ever deleted. A count line at the bottom: "3 tasks moved, 1 let go." Undo is available until the wrap is finished.
- If there are no loose ends: "No loose ends today."

**Step 9: Tomorrow**
- Preview of tomorrow's events (from the events table) as a compact list.
- If tomorrow has a transition whose pair has a hard_transition pattern, show it with the best strategy from the engine: "Tomorrow: Chemistry lab → Calculus at 4:50 pm. Last time, box breathing helped." Numbers come from the engine.
- **"Pick one thing to start tomorrow":** task cards (not done, not someday), sorted by due date then energy. Choosing one sets `anchorTaskId`. Skippable.
- After choosing: **"Want a first step ready for the morning?"**
  - "Yes" calls the existing `/api/ai/unstick` route with reason `dont_know_start`, the task, and the evening check-in state if any. The companion is `thinking` while it loads.
  - The step appears in an editable text field. Saving stores it as `anchorFirstStep` and on the task's `firstStep`, and sets the task's `anchorDate` to tomorrow.
  - Fallback: the v1 unstick fallback table.

**Step 10: A note for later** (optional)
- "Want to leave a message in a bottle for a harder day?" The bottle sheet inline (Section 13.7).

**Step 11: Your summary**
- Call `/api/ai/wrapup` (Section 14.6). While it loads: the companion is `thinking`, plus "Putting your day together…".
- Show a card with:
  - `summary` (2–3 sentences);
  - `highlight` (one thing that went okay, with a small star icon);
  - `tomorrowTip`;
  - the companion's `companionLine` in a speech bubble;
  - "Read aloud" (auto-read if that setting is on);
  - a small note: "A suggestion, not a judgment."
- Fallback: a deterministic template (Section 14.6).

**Step 12: Wind down** (optional)
- "Want help winding down?" Three cards:
  - "1-minute breathing": a slow box breathing with the companion in `sleepy`, Calm motion, dim colors, optional ambience `waves`.
  - "Empty your head": the BrainDump tool, with "Turn lines into tasks for tomorrow" (tasks get `movedTo` = tomorrow).
  - "Just rest": skip.

**Step 13: Goodnight**
- The scene moves to night: stars appear, the moon rises (Lively), and the companion falls asleep (`sleeping`, nightcap, Zzz).
- A piece of driftwood floats to the shore (`wrapDone` celebration, styled by the evening quadrant).
- Text: "Day closed. Sleep well, {name}." Line `wrap_end`.
- Button "Done" returns to Today, which now shows the "Day closed" card.

### 14.5 Data written

When the wrap completes:

- the `DayWrap` record (Section 18.2) with `completedAt`;
- a Win of kind `wrap` ("Closed the day"), which becomes driftwood;
- any task changes from steps 8 and 9;
- the optional bottle and the optional evening CheckIn;
- first-time pearl if this is the first wrap.

### 14.6 New AI route: `/api/ai/wrapup`

Model: SMART (`TIDE_MODEL_SMART`), `max_tokens` 600, timeout as for the other routes. It follows the v1 pattern: zod in, zod out, one retry, semantic checks, fallback.

**Input schema:**

```ts
export const WrapupInput = z.object({
  mode: ModeZ,
  readingLevel: z.enum(['standard', 'simple']).optional(),
  date: z.string(),                         // 'YYYY-MM-DD'
  facts: z.object({
    checkins: z.array(z.object({ time: z.string(), quadrant: QuadrantZ, emotions: z.array(z.string()).max(2) })).max(8),
    tasksDone: z.array(z.string().max(120)).max(12),         // titles
    focusBlocks: z.object({ total: z.number().int(), gotGoing: z.number().int() }),
    transitions: z.array(z.object({ label: z.string().max(80), rating: z.enum(['easy','okay','hard']).nullable() })).max(8),
    strategies: z.array(z.object({ name: z.string(), result: z.enum(['better','same','worse']).nullable() })).max(8),
  }),
  reflection: z.object({
    helped: z.array(z.string()).max(10),     // human-readable labels, not ids
    hard: z.array(z.string()).max(10),
    overall: z.enum(['very_hard','hard','mixed','okay','good']).nullable(),
  }),
  tomorrow: z.object({
    anchorTaskTitle: z.string().max(120).nullable(),
    firstEventTitle: z.string().max(80).nullable(),
    patternHint: z.object({ text: z.string().max(140) }).nullable(), // built by code from engine facts
  }),
  companionName: z.string().max(16).nullable(),
});
```

Free-text notes (`helpedNote`, `hardNote`) are **not** sent. They stay on the device.

**Output schema:**

```ts
export const WrapupOutput = z.object({
  summary: z.string().max(320),      // 2–3 sentences, ≤ 50 words
  highlight: z.string().max(110),    // one thing that went okay, ≤ 15 words
  tomorrowTip: z.string().max(140),  // ≤ 20 words
  companionLine: z.string().max(80), // ≤ 12 words, in the companion's gentle voice; neutral if companionName is null
});
```

**Semantic checks** (on failure, use the fallback):

- Any digit in the output must appear in the input facts.
- Any quoted or capitalized task-like phrase must match a title in `tasksDone` or `anchorTaskTitle` (a simple check: if the output contains a word sequence of 3 or more words in quotes, it must be a substring of an input title).
- **Forbidden words** (case-insensitive): "productive", "unproductive", "lazy", "should have", "failed", "failure", "only managed", "not enough", "disappointing", "must", "diagnos", "disorder", "therapy". If any appears, fall back.
- Lengths are enforced by zod.

**Prompt `prompts/06-wrapup.md`** (added to the shared preamble, like the others):

```
TASK: Write a short, kind end-of-day summary for the user, using only the
facts and reflections in INPUT.

Write:
- summary: 2 or 3 short sentences (50 words max) that describe the day
  as it was: what happened, what helped, and what was hard if the user
  said so. Acknowledge hard parts without trying to fix them. Do not judge
  the day or the user. Do not compare with other days. Do not count things
  as achievements or shortfalls.
- highlight: one thing from INPUT that went okay or helped, in 15 words or
  fewer. If nothing clearly went okay, highlight that the user closed the
  day.
- tomorrowTip: one practical, gentle idea for tomorrow in 20 words or
  fewer. If INPUT.tomorrow.patternHint exists, base the tip on it. If
  INPUT.tomorrow.anchorTaskTitle exists, mention starting with its first
  step. Otherwise suggest something small and general.
- companionLine: 12 words or fewer, warm and calm, as if said by a gentle
  companion named INPUT.companionName. If companionName is null, write a
  neutral closing line instead.

Never use these words: productive, unproductive, lazy, should have, failed,
not enough, must. Never mention diagnoses or therapy. Use only numbers that
appear in INPUT. Respect INPUT.mode and INPUT.readingLevel ("simple" means
very common words and sentences under 10 words).

OUTPUT SCHEMA:
{ "summary": string, "highlight": string, "tomorrowTip": string,
  "companionLine": string }
```

The schema has exactly four fields. Add a test that checks that the field names in the prompt file match the zod schema exactly.

**Example** (for tests and the Prompts PDF):

- INPUT (abridged): two check-ins (3:40 pm Ebb drained/frustrated; 8:35 pm Still calm), `tasksDone: ["Email TA about lab data"]`, focus `{ total: 1, gotGoing: 1 }`, transitions `[{ label: "Chemistry lab → Calculus", rating: "okay" }]`, strategies `[{ name: "Box breathing", result: "better" }]`, helped `["Box breathing", "A person"]`, hard `["Starting things"]`, overall `"mixed"`, tomorrow `{ anchorTaskTitle: "Chemistry lab report", firstEventTitle: "Physics", patternHint: { text: "Before writing tasks, a 3-minute walk helped 4 of 5 times." } }`, companionName "Lolo".
- OUTPUT:
  - summary: "Today started heavy, and starting things was hard. You still emailed your TA, and the switch from lab to calculus went okay. Box breathing and a person helped."
  - highlight: "Box breathing helped before calculus."
  - tomorrowTip: "Try a 3-minute walk, then just open the lab report and type the title."
  - companionLine: "You closed the day. Rest now, I've got the shore."

**Fallback template** (`wrapupFallback` in `fallbacks.ts`):

- summary: built from the facts with simple sentences. Examples: "You checked in {n} times today.", "You finished {k} task(s).", "{strategy} helped." (only for strategies with result "better"), "{hard[0]} was hard today." (only if the user picked it).
- highlight: the first "better" strategy, or else the first finished task, or else "You closed the day."
- tomorrowTip: the `patternHint` text, or "Start with the first step of {anchor}.", or "Start small. One step is enough."
- companionLine: the companion's `wrap_end` line (Appendix B), or "Day closed." if there is no companion.

Add a cached demo response for the demo-day input (Section 16), and add route tests mirroring the v1 route tests.

### 14.7 Using the wrap data elsewhere

- **Morning card** (Section 12).
- **Patterns:** the new rule `wrap_helped` and the "What's been hard" summary (Section 20).
- **Shore:** driftwood, and bottles written in the wrap.
- **Tasks board:** "Someday" list and snoozed labels (Section 18).
- **Export data:** includes `dayWraps` and `bottles`.

---

## 15. Settings 2.0

### 15.1 Structure

- `/settings` is the **index**:
  - a search field at the top;
  - a **Quick presets** row (Section 15.3);
  - a **Your companion** card (mini companion, name, "Open Companion Studio");
  - the section list as 3D IconTiles or rows with icons.
- `/settings/[section]` has one page per section, each with:
  - a sticky **Live preview** panel at the top (collapsible): a mini Today card, a 3D button, a chip, a quadrant chip, body text and the companion, which update instantly as settings change;
  - grouped controls with clear labels and one-line help text;
  - "Reset this section" at the bottom.
- All controls apply immediately (no Save button). Changes that would surprise someone (theme, font, motion level, companion species, communication mode, presets) show an Undo toast for 6 seconds.

### 15.2 Every setting

Store everything in the settings table (key/value) with defaults in `src/lib/settings/defaults.ts`. Validate it with a zod schema (`SettingsSchema`) used for reading, writing and import. Existing v1 keys keep their names; the table marks them.

| Section | Key | Values | Default (new users) | Notes |
|---|---|---|---|---|
| **Profile** | `userName` (v1 `name` if that's what v1 used; keep v1's key) | string ≤ 30 | `''` | Used in greetings |
| | `pronouns` | `''` or free text ≤ 20 | `''` | Optional, used nowhere automatically; for the person's own profile card |
| **Companion** | `companion.species` | `otter`, `axolotl`, `capybara`, `gecko`, `jellyfish`, `hermit_crab`, `none` | set in onboarding (`axolotl` if skipped) | |
| | `companion.name` | string 1–16 | species default | |
| | `companion.variant` | variant id | first variant | |
| | `companion.accessory` | accessory id or `none` | `none` | |
| | `companion.size` | `sm`, `md`, `lg` | `md` | |
| | `companion.talkativeness` | `quiet`, `some`, `chatty` | `some` | |
| | `companion.placements` | record of booleans (today, checkin, unstick, focus, bridge, toolkit, patterns, shore, wrap, celebrations, toasts, empty, support) | all true | |
| | `companion.faceStyle` | `dots`, `none` | `dots` | Luma only |
| | `companion.mirrorState` | boolean | false | Luma only |
| | `companion.voice` | provider voice id or null | species default | Cloud only |
| **Appearance** | `appearance.theme` | ThemeId | `lagoon` | v1 `theme` is migrated (18.4) |
| | `appearance.followSystem` | boolean | false | |
| | `appearance.lightTheme` / `appearance.darkTheme` | ThemeId | `lagoon` / `midnightTide` | |
| | `appearance.font` | `playful`, `hyperlegible`, `lexend`, `system` | `playful` | |
| | `textScale` (v1) | 1, 1.15, 1.3, 1.5 | 1 | |
| | `extraSpacing` (v1) | boolean | false | |
| | `appearance.boldText` | boolean | false | |
| | `appearance.density` | `comfortable`, `compact` | `comfortable` | |
| | `appearance.roundness` | `round`, `soft`, `square` | `round` | |
| | `appearance.quadrantPalette` | `theme`, `colorblind` | `theme` | |
| | `appearance.showQuadrantShapes` | boolean | false (true with colorblind) | |
| **Motion** | `motion.level` | `off`, `calm`, `lively`, or unset (auto) | unset → resolution rules (5.2) | v1 `reduceMotion` migrates |
| | `motion.celebrations` | `full`, `gentle`, `off` | `full` | |
| | `motion.confetti` | boolean | true | |
| | `motion.pageTransitions` | boolean | true | |
| | `motion.companionIdle` | boolean | true | |
| | `motion.shoreWaves` | boolean | true | |
| **Sound & haptics** | `sound.enabled` | boolean | false | |
| | `sound.volume` | 0–1 (step 0.1) | 0.5 | |
| | `sound.ui` / `sound.celebrations` / `sound.companion` | boolean | true | Only matter when sound is enabled |
| | `sound.ambience` | `none`, `waves`, `rain`, `brown` | `none` | Focus and wind-down |
| | `sound.ambienceVolume` | 0–1 | 0.3 | |
| | `haptics.enabled` (v1 `vibration` migrates) | boolean | false | Disabled where unsupported |
| **Voice** | `voice.engine` | `auto`, `natural`, `device`, `off` | `auto` | |
| | `voice.deviceVoiceURI` | string or null | null (auto best) | |
| | `voice.naturalVoice` | provider voice id | provider default | |
| | `voice.rate` (v1 `readAloudRate` migrates) | 0.8–1.2 | 1 | |
| | `voice.accent` | `auto`, `en-US`, `en-GB`, `en-AU`, `en-CA`, `en-IN`, `en-IE`, `en-ZA` | `auto` | |
| | `voice.autoReadAi` | boolean | false | |
| | `voice.readCompanion` | boolean | false | |
| | `voice.breathingCues` | boolean | false | |
| **Language & tone** | `communicationMode` (v1) | `gentle`, `direct`, `literal` | `gentle` | |
| | `language.readingLevel` | `standard`, `simple` | `standard` | Passed to AI routes |
| | `language.timeFormat` | `12h`, `24h` | `12h` | |
| | `language.weekStart` | `monday`, `sunday` | `monday` | |
| | `language.dateStyle` | `long`, `short` | `long` | |
| **Check-in** | `checkin.defaultPath` | `words`, `body`, `map` | `words` | Which step 1 shows first |
| | `checkin.vocabulary` | `simple` (16 words), `full` (48) | `full` | Simple: surge anxious, frustrated, overwhelmed, angry; swell excited, motivated, happy, proud; ebb sad, drained, bored, lonely; still calm, content, relaxed, safe |
| | `checkin.showCauses` | boolean | true | Step 3 |
| | `checkin.showFollowUp` | boolean | true | AI follow-up question |
| | `checkin.mapStyle` | `map`, `sliders` | `map` | |
| | `checkin.nudgeTimes` | array of `HH:MM` (0–4) | `[]` | In-app banner on Today: "Want to check in?" |
| **Day & planning** | `day.start` | `HH:MM` | `07:00` | |
| | `day.end` | `HH:MM` | `23:00` | |
| | `day.wrapTime` | `HH:MM` | `20:30` | |
| | `day.transitionLead` | 5, 10, 15 | 15 | Bridge card lead time (v1 used 15) |
| | `day.gentleBudget` / `day.minimumBudget` | 2–8 / 1–4 | 4 / 2 | Day Mode |
| | `day.dayModeSuggestions` | boolean | true | Banner on/off |
| | `day.showMoved` | boolean | true | |
| | `day.morningCard` / `day.wrapCard` | boolean | true | |
| **Focus** | `focus.defaultMinutes` | `auto`, 5, 10, 15, 25 | `auto` (v1 rule) | |
| | `focus.companionActivity` | boolean | true | |
| | `focus.endSound` | boolean | true | Only with sound enabled |
| | `focus.keepAwake` | boolean | true | Screen Wake Lock where supported |
| **Toolkit** | `toolkit.favorites` | strategy ids | `[]` | Shown first |
| | `toolkit.hidden` | strategy ids | `[]` | Never suggested |
| | `toolkit.filters` | `{ quiet, noMovement, noScreen }` booleans | all false | |
| | `toolkit.bridgeMaxSeconds` | 60, 120, 180 | 180 | |
| | `toolkit.breathingPattern` | `box` (4-4-4-4), `longExhale` (4-6) | `box` | Box breathing tool and wind-down |
| **Patterns** | `patterns.enabled` | boolean | true | Hides the tab content with an explanation when off |
| | `patterns.minEvidence` | 3, 5 | 3 | Engine threshold (never below 3) |
| | `patterns.defaultPeriod` | 7, 28 | 28 | |
| | (action) "Show dismissed patterns again" | button | — | Clears dismissed keys after confirmation |
| **Shore** | `shore.sky` | `time`, `theme`, `static` | `time` | |
| | `shore.mirrorCheckins` | boolean | false | |
| | `shore.showLabels` | boolean | false | Small labels under items |
| | `shore.lastSeenAt` | number | internal | |
| **Privacy & data** | `aiEnabled` (v1) | boolean | true | |
| | `privacy.naturalVoiceAllowed` | boolean | true when the cloud voice is set up | |
| | (actions) Export data, Import backup, Export settings, Import settings, Clear voice cache, Delete everything | buttons | — | Export/import validated by zod; import shows a summary and asks to Replace or Cancel |
| **People & support** | `trustedContacts` (v1), `campusSupport` (v1) | v1 types | v1 defaults | |
| **Shortcuts** | `shortcuts.enabled` | boolean | true | Desktop keyboard shortcuts (Section 17.1) |
| **Demo** | (actions) Run full demo, Run pitch cut (100s), Presenter mode, Open demo workspace, Leave demo workspace, Restart demo clock, Jump to bridge moment, Jump to evening | buttons | — | Section 16 |
| **About** | (info) Version, What's new, Credits, Not medical notice, AI attribution link, Repository link | — | — | |

### 15.3 Quick presets

Presets change only the keys listed, show a confirmation listing what will change ("This will change: theme → Sandbar, motion → Off, sounds → Off…"), and offer Undo.

| Preset | Changes |
|---|---|
| **Calm** | theme `lagoon`, font `playful`, motion `calm`, celebrations `gentle`, confetti off, sound off, companion talkativeness `some`, shore sky `time` |
| **Low sensory** | theme `sandbar`, font `hyperlegible`, motion `off`, celebrations `off`, confetti off, sound off, haptics off, companion talkativeness `quiet`, companionIdle off, shoreWaves off, density `comfortable`, roundness `soft` |
| **Focused** | theme `oceanBlue`, font `hyperlegible`, motion `calm`, celebrations `gentle`, companion talkativeness `quiet`, `sound.ambience` `brown` (only plays if sound is enabled), `focus.keepAwake` on |
| **Playful** | theme `bubblegum`, font `playful`, motion `lively`, celebrations `full`, confetti on, sound on (volume 0.5), haptics on (if supported), companion talkativeness `chatty` |
| **High contrast** | `followSystem` on with `pearl`/`ink`, font `hyperlegible`, boldText on, quadrantPalette `colorblind`, showQuadrantShapes on, motion `calm` |

### 15.4 Settings search

- Build a static index in `src/lib/settings/searchIndex.ts`: for every setting, its label, help text, section, keywords (synonyms, e.g. "dark mode" → theme, "animation" → motion, "mascot"/"pet" → companion, "voice"/"speak"/"read" → voice, "font"/"dyslexia" → font, "vibrate" → haptics), and its anchor id.
- Search is fuzzy and case-insensitive, matching on tokens and prefixes (write a small scorer; no library needed).
- Results show the setting label and its section; choosing one navigates to `/settings/[section]#<anchor>`, scrolls to the control, and highlights it with a 1.2s pulse ring (a static ring at Off).
- Empty result: "No settings match "{q}". Try "colors", "sound" or "companion"."

### 15.5 Import and export

- **Export settings:** JSON `{ app: 'tide', kind: 'settings', version: 2, exportedAt, settings }`.
- **Import settings:** validate with `SettingsSchema`; unknown keys are ignored; invalid values fall back to defaults with a summary of what changed.
- **Export data:** the v1 export, extended with the v2 tables.
- **Import backup:** validate each table with zod (lenient for unknown fields, strict for required ones). Show a summary ("212 check-ins, 87 tasks, …") and ask Replace / Cancel (no merge in v2). Write in a single Dexie transaction. On any error, roll back and show a calm message. Create a backup of the current data in memory first and restore it on failure.

---
## 16. Demo workspace and the Demo director (the Demo button)

### 16.1 What the team wants

A **Demo button** that runs a demo showing every feature of Tide, so judges, the Challenge Partner or anyone can see the whole product in a few minutes. It must:

- run without touching the person's real data;
- work offline;
- look smooth and intentional, not like a robot clicking randomly;
- support a hands-free autoplay mode and a presenter mode for the live pitch;
- include the 100-second pitch cut.

### 16.2 Where the Demo button lives

- **Onboarding welcome:** "Watch the demo".
- **TopBar menu:** "Run the demo".
- **Settings → Demo:** Run full demo, Run pitch cut, Presenter mode, Open demo workspace, Leave demo workspace, Restart demo clock, Jump to bridge moment, Jump to evening.
- **URL `/demo`:** opens a small launcher page with three big cards (Full tour, about 4 minutes; Pitch cut, 100 seconds; Presenter mode), plus options (narration voice on or off, captions on or off, speed). Presenters can open `tide-app.vercel.app/demo` directly. `/demo?autostart=full|pitch|presenter` starts immediately after one tap on "Start" (a user gesture is needed for audio).
- **Keyboard shortcut:** Shift+D opens the launcher (when shortcuts are enabled).

### 16.3 Demo workspace (separate database)

v1 demo mode replaced the user's data with seed data. v2 changes this (an intentional change, Section 3.5):

- `src/lib/db.ts`: the Dexie database name becomes `tide` (main) or `tide-demo` (demo), chosen at module load from `localStorage['tide.workspace']` (`main` or `demo`, default `main`; wrap the read in try/catch and default to `main`). Keep the exported `db` name and type so every v1 import keeps working.
- **Entering the demo workspace:** set the flag, reload the page with `?demo=start&mode=<mode>`, and on boot, if `tide-demo` is empty or its seed version is outdated, run the seed (Section 16.9). Settings in the demo DB are seeded too (theme, companion and so on), so the demo always looks the same.
- **Leaving:** set the flag to `main` and reload. The main database was never opened during the demo, so the user's data is untouched.
- The TopBar shows a "Demo" pill, and Settings shows "You're in the demo workspace. Your own data is safe." with a "Leave demo" button.
- **v1 compatibility:** if the main DB has `demoMode = true` from v1 (seeded data in the main DB), leave it alone and show in Settings → Demo: "Your main workspace has example data from an older version. Clear it and start fresh?" (with confirmation).
- The demo clock (v1 `clock.ts`) works only in the demo workspace. Extend it without changing v1 behavior:
  - `setDemoTime(isoString)` jumps the clock;
  - `setDemoSpeed(multiplier)` makes time run faster, for example 60× during a focus block;
  - `now()` becomes `demoBase + (Date.now() − demoStartedAt) × speed + offset`.
  - Keep v1's `DEMO_START` and the restart functions working.
- AI in the demo workspace: v1 cached responses plus the v2 additions (wrap-up). In **autoplay**, force the cache (`demoForceCache`) so the tour is deterministic and works offline. In **presenter** mode, a toggle "Use live AI" (default off).

### 16.4 The director (`src/demo/director/`)

```
director/
  types.ts        // Step, Chapter, Script, DirectorState
  engine.ts       // runs steps: play/pause/next/prev/seek/exit; timing; error handling
  actions.ts      // navigate, click, type, select, waitFor, setClock, setSpeed, scrollTo, say, spotlight, custom
  customActions.ts// named helpers for things hard to do through the DOM
  scripts/full.ts // full tour (~4 min)
  scripts/pitch.ts// 100-second cut
  DirectorHUD.tsx // bottom controls + captions + progress
  Spotlight.tsx   // dimmed overlay with a cutout around the target
  DemoCursor.tsx  // a soft animated pointer that moves to targets before clicks
  useDirector.ts  // context/provider mounted in the app shell when a demo is running
```

**Step type:**

```ts
type Step = {
  id: string;                 // unique, e.g. 'checkin.type-text'
  chapter: ChapterId;
  caption?: string;           // shown in the HUD; English
  narrate?: boolean;          // read the caption aloud (voice engine) if narration is on
  target?: string;            // data-demo-id of the element to spotlight/act on
  action:
    | { kind: 'navigate'; path: string }
    | { kind: 'click' }                         // on target
    | { kind: 'type'; text: string; cps?: number } // simulated typing into target
    | { kind: 'select'; value: string }         // chip/option inside target by data-demo-value
    | { kind: 'drag'; to: { x: number; y: number } } // mood map dot (relative 0–1)
    | { kind: 'waitFor'; timeoutMs?: number }
    | { kind: 'wait'; ms: number }
    | { kind: 'setClock'; iso: string }
    | { kind: 'setSpeed'; multiplier: number }
    | { kind: 'scrollTo' }
    | { kind: 'custom'; name: CustomActionName; args?: Record<string, unknown> };
  holdMs?: number;            // pause after the action so viewers can see the result
  presenterPause?: boolean;   // in presenter mode, wait for Next after this step
};
```

**Engine behavior:**

- Executes steps in order. Before acting on a target, it waits for the element `[data-demo-id="…"]` to exist and be visible (polling every 50ms plus a `MutationObserver`; default timeout 4000ms). Then it scrolls the element into view (smooth at Lively, instant otherwise), moves the DemoCursor to it (400ms ease), shows the spotlight, and performs the action.
- **click:** dispatches `pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click` (with `bubbles: true`, `button: 0`, `pointerType: 'mouse'`), because Radix primitives (dropdown menu, select) open on `pointerdown`. If a control still doesn't respond, use a `custom` action for it.
- **type:** focuses the element and types character by character at `cps` (default 22 characters per second, with ±30% jitter for a human feel), using the native value setter plus an `input` event so React state updates. At speed 2×, it types twice as fast.
- **select:** clicks the descendant `[data-demo-value="…"]`.
- **drag:** for the mood map, uses the component's demo hook `window.__tideDemo?.moodMap?.setPoint(x, y)` (registered only in the demo workspace), animated over 600ms, so the dot visibly glides.
- **say:** sets the caption and, if narration is on, speaks it through the voice engine (waiting for speech to finish before continuing, with a timeout).
- **Failure:** if a step fails (target not found, timeout), the engine logs it to the demo debug panel (`?demoDebug=1` shows a side panel listing each step's status), shows the caption "…" briefly, skips to the next step and never crashes. At the end, the summary screen notes skipped steps in debug mode only.
- **Controls:** play/pause (Space), next (→), previous (←; restores the previous chapter's start state by re-running its `setup` custom action), exit (Esc), speed 1×/1.5×/2× (S), captions on/off (C), narration on/off (N). Every control is a real button in the HUD with an `aria-label`. Keyboard shortcuts work only while the director runs.
- **Modes:**
  - **Autoplay:** runs continuously; respects `holdMs`.
  - **Presenter:** pauses at every step with `presenterPause: true` (chapter starts and key moments) until Next is pressed. Clickers send → or PageDown, so map PageDown to Next and PageUp to Previous.
  - **Pitch cut:** runs `scripts/pitch.ts` in autoplay or presenter mode.
- **Chapter setup:** each chapter starts with a `custom: setupChapter` action that puts the app in the right state (route, clock time, open/closed sheets, data preconditions). Jumping to any chapter therefore works, and a failure in one chapter doesn't break the next.
- **Sound:** pressing a Start button counts as the user gesture that unlocks audio (sound engine and voice). If narration is on, captions are read in the user's chosen voice (or pre-generated clips, Section 7.7).

### 16.5 HUD design

- A floating bar at the bottom, above the tab bar, 16px from the edges, with `--radius-xl`, `surface` background, a 2px `line` border and a ledge.
  - Left: the chapter title and a ProgressBar for the whole tour (segmented by chapter, Duolingo-style).
  - Center: the caption text (17px, max 2 lines).
  - Right: the controls.
- On mobile, the HUD collapses to the caption + progress, with a "⋯" for controls.
- The HUD never covers the spotlighted element: if the target is in the bottom 35% of the viewport, the HUD moves to the top.
- **Spotlight:** a full-screen overlay with `box-shadow: 0 0 0 200vmax rgba(0,0,0,0.45)` around a rounded cutout matching the target's bounding box plus 8px. It transitions between targets with a 300ms ease (instant at Off), and is pointer-events none, so viewers can't accidentally break the tour.
- **DemoCursor:** a soft circle (28px, `primary` at 70% opacity, white 2px ring) with a ripple on clicks. Hidden at motion level Off (the spotlight is enough).
- **End screen:**
  - Title: "That's Tide."
  - A grid of feature tiles with check icons for everything the tour showed (the Section 16.7 list).
  - Buttons:
    - "Explore on your own": stay in the demo workspace, HUD closed;
    - "Run the pitch cut";
    - "Leave demo": back to the main workspace.

### 16.6 `data-demo-id` attributes

Add `data-demo-id` to every element the scripts touch, with stable names like `fab-checkin`, `checkin-text`, `checkin-next`, `checkin-candidate-drained`, `moodmap-dot`, `need-adjust`, `daymode-gentle`, `daymode-apply`, `task-<slug>-menu`, `move-to-stuck`, `unstick-reason-dont_know_start`, `unstick-start`, `focus-start`, `focus-outcome-got_going`, `celebration-continue`, `bridge-card`, `bridge-get-ready`, `bridge-parking`, `bridge-shift-start`, `recheck-better`, `bridge-done`, `tab-patterns`, `pattern-why-<key>`, `tab-shore`, `shore-item-<winId>`, `shore-collection`, `wrap-start`, `wrap-next`, …, `settings-preset-low-sensory`, `theme-card-<id>`, and so on. Add a test that reads both scripts and asserts that every referenced `data-demo-id` appears somewhere in `src/` (a static string search). Missing ids fail the test. These attributes are harmless outside the demo.

### 16.7 The full tour script (about 4 minutes)

Write `scripts/full.ts` with these chapters and steps. Captions are final copy; times are targets at 1× speed.

**Chapter 0. Hello (0:00–0:08)**
- Setup: route `/`, demo clock Thu Nov 5, 3:38 pm. Companion Lolo (axolotl, Pink, scarf). Theme Lagoon. Motion Lively. Sound on (low), if the user enabled sound in the launcher.
- Steps:
  - Splash: the six companions pop in on a mini beach, then the scene settles on Today with Lolo waving. Caption: "This is Tide: a calm place to plan around how you actually feel." (narrate)

**Chapter 1. Make it yours (0:08–0:30)**
- Navigate to `/companion`. Caption: "Everyone picks a companion, or none at all."
- Custom action `cycleSpecies`: show Pebble, Lolo, Capi, Zip, Luma, Shelby (600ms each, idling), then back to Lolo. Caption: "An otter, an axolotl, a capybara, a gecko, a jellyfish and a hermit crab."
- Tap Lolo to show a reaction (hop, chirp). Caption: "Lolo is an axolotl, from the canals of Xochimilco."
- Navigate to `/settings/appearance`; spotlight the theme grid. Custom action `cycleThemes`: Coral Reef → Midnight Tide → Kelp Forest → back to Lagoon, about 700ms each, with the crossfade. Caption: "Fifteen themes, from bright to high contrast."

**Chapter 2. Name it (0:30–1:00)**
- Navigate to `/`. Click `fab-checkin`. Caption: "Maya checks in in her own words." (narrate)
- Type into `checkin-text`: "Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself." Lolo is `listening`.
- Click `checkin-next`. Lolo is `thinking`. Caption: "Tide suggests words. It never decides for her."
- Select `drained` and `frustrated`. Spotlight the mood map; drag the dot slightly. Caption: "She picks what fits and places it on the map."
- Next → step 3: select `the task` → Next → step 4 → spotlight `need-adjust`. Click it.
- Lolo `soft` + lean; toast "Checked in · Ebb". Caption: "Low energy and unpleasant: Ebb. Lolo stays close."

**Chapter 3. A lighter day (1:00–1:12)**
- The DayModeSheet opens. Click `daymode-gentle`. The proposal appears (cached). Caption: "Her plan shrinks to fit her energy, but only with her yes."
- Click `daymode-apply`. The Undo toast shows briefly.

**Chapter 4. Unstick and focus (1:12–1:45)**
- Navigate to `/tasks`. Open the menu on "Chemistry lab report" → Move to Stuck. Caption: "Stuck is information, not failure."
- Click `unstick-reason-dont_know_start`. The first step appears: "Open the report and type only the title and date." The walk suggestion shows "4 of 5 times". Caption: "Same task, different state, different first step."
- Click `unstick-start` (5 minutes). The Focus page shows with Lolo reading next to the water fill. Caption: "Lolo works next to her, like a study buddy." (narrate)
- Custom `setSpeed(60)` for about 5 seconds so the timer visibly runs, then `setSpeed(1)` and finish.
- Click `focus-outcome-got_going`. The unstuck celebration is styled for Ebb: a soft glow and toast "You did that on a low day. It counts." Caption: "Celebrations match how she feels. No confetti on a low day."
- A smooth pebble arrival is queued for the Shore.

**Chapter 5. The switch (1:45–2:15)**
- Custom `setClock` to 4:41 pm. The Bridge card appears on Today. Caption: "Ten minutes before class, Tide helps her switch."
- Click `bridge-get-ready`. Lolo is `packing` (backpack). The pattern line shows "felt hard 3 of the last 4 times".
- Type into `bridge-parking`: "methods, paragraph 2". Caption: "She parks where she left off, so coming back is easy."
- Click `bridge-shift-start` (Box breathing). Lolo breathes in the center of the square. Custom `breathingCycles(1)`: one 16-second cycle, shortened to 8 seconds at demo speed. Caption: "Lolo breathes with her." (narrate)
- Click `recheck-better`. Starfish celebration (small). Back in the Bridge, the prep list shows Calculator and Room 4-203. Click `bridge-done`.

**Chapter 6. What works for her (2:15–2:35)**
- Click `tab-patterns`. Caption: "Over time, Tide learns what actually works for her."
- Spotlight the walk card; click its "Why am I seeing this?" The evidence list opens. Caption: "Every pattern shows its evidence. She can say: not true for me."

**Chapter 7. Your Shore (2:35–2:58)**
- Click `tab-shore`. Today's items wash up one by one: the smooth pebble, the starfish, and more. Lolo walks to the starfish. Caption: "Every win washes up on her shore. Nothing is ever lost." (narrate)
- Click the starfish: card "A starfish. Box breathing helped." Then click `shore-collection` briefly. Caption: "A collection, not a score. No streaks. No points."
- Spotlight the bottle bobbing; custom `openBottle` (a bottle written Oct 29 surfaces because she checked in Ebb): "You've done hard weeks before. Breathe first, then just the title." Caption: "A note from her past self, on a hard day."

**Chapter 8. Close the day (2:58–3:35)**
- Setup (custom `setupChapter`): mark "Email TA about lab data" as done at 6:30 pm, as if Maya did it after class (a cowrie washes up), and rate the lab → calculus transition Okay (sea glass). Then `setClock` to 8:35 pm and navigate to `/`. The evening card shows; Lolo yawns. Click `wrap-start`. Caption: "At night, Tide helps her close the day."
- Quick evening check-in: select `calm` (Still).
- The Day tide chart draws itself from low to calm. Caption: "Her day as a tide: heavy at first, calmer by night."
- Wins wash up; "What helped" → select Box breathing and A person; "What was hard" → Starting things; Overall → Mixed.
- Loose ends: "Calculus problem set 7" → Tomorrow; "Chemistry lab report" → Keep as is (it becomes tomorrow's one thing). The tasks the Gentle plan already moved don't appear here. Caption: "Loose ends get a place. Nothing is deleted."
- Tomorrow: the hint about tomorrow's lab → calculus switch and box breathing; pick "Chemistry lab report" as the one thing; first step ready (cached). Caption: "Tomorrow's first step is ready before she sleeps."
- Summary card (cached wrap-up response); Lolo says her line. Skip wind-down. Goodnight: night falls, Lolo sleeps, driftwood washes up. Caption: "Day closed." (narrate)

**Chapter 9. Comfortable for every brain (3:35–3:55)**
- Navigate to `/settings`. Spotlight the presets. Click `settings-preset-low-sensory` → confirm. The theme becomes Sandbar, motion turns off, sounds go off, and Lolo goes quiet. Caption: "One tap for a low-sensory version."
- Navigate to `/settings/language`; select Literal. Custom `showLiteralExample`: open the check-in step-2 title preview in the live preview panel, showing "These words might fit. Choose up to two." Caption: "Literal mode: no metaphors, exact instructions."
- Custom `restorePreset('calm')` and theme Lagoon.

**Chapter 10. Safety (3:55–4:05)**
- Navigate to `/support?crisis=1&preview=1`. A **Preview banner** shows at the top: "Preview: this is what Tide shows if someone writes about being in danger. Nothing was saved." There is no companion, and the crisis lines are shown. Caption: "If someone writes about being in danger, coaching stops and real people come first."
- Navigate back to `/`.

**Chapter 11. That's Tide (4:05–4:15)**
- End screen with the feature grid: Companions, Check-in with AI words, Mood map, Day Modes, Unstick, Focus with a body double, Bridge, Co-regulated breathing, State-aware celebrations, Patterns with evidence, Your Shore, Messages in a bottle, Close the day, Themes, Low-sensory and Literal modes, Natural voices, Safety first, Private by design.
- Caption: "Tide plans for the brain you have right now." (narrate)

### 16.8 Crisis preview mode

`/support?crisis=1&preview=1` renders the CrisisScreen with the preview banner. It is available **only** in the demo workspace; in the main workspace, `preview=1` is ignored. It never creates a check-in, never logs anything, and is never reachable from user text. Add a test for both conditions.

### 16.9 The pitch cut (100 seconds)

`scripts/pitch.ts` reuses the chapter setups. Steps, with shortened holds:

| Time | Chapter | Contents |
|---|---|---|
| 0:00–0:20 | 2 | Check-in: typing at 35 characters per second, pick 2 words, need Adjust |
| 0:20–0:28 | 3 | Gentle plan apply |
| 0:28–0:48 | 4 | Stuck → first step → focus (60× speed) → Got going with the Ebb celebration |
| 0:48–1:10 | 5 | Bridge with parking note, 1 breathing cycle with Lolo, re-check Better |
| 1:10–1:25 | 6 | Pattern + Why |
| 1:25–1:35 | 7 | Shore arrivals (pebble, starfish) |
| 1:35–1:40 | — | Close: "Tide plans for the brain you have right now." |

This must also work in presenter mode with about 8 presenter pauses. The v1 100-second script (v1 spec Section 14.3) keeps working manually inside the demo workspace.

### 16.10 Demo seed v2 (extends the v1 seed; same PRNG and seed value)

Keep everything in the v1 seed exactly as is (persona, schedule, check-ins, tasks, planted patterns, wins, rewards). Add:

- **Settings:** `companion.species = 'axolotl'`, name "Lolo", variant Pink, accessory Scarf, talkativeness `some`; theme `lagoon`; font `playful`; motion `lively`; sound off by default (the launcher can enable it); `voice.engine = 'auto'`; `onboarded = true`; `day.wrapTime = '20:30'`; `shore.lastSeenAt` = Thu Nov 5 at 12:00 pm, so the demo-day wins arrive as new.
- **DayWraps** for 12 of the 21 past days (spread across weeks, more often on Tue/Thu). They have varied `helped`/`hard`/`overall` values, and they plant exactly one wrap pattern:
  - `wrapHelped:c-box`: of 6 days with box breathing used, 4 ended `okay` or `good`;
  - of 6 days without it, 1 ended `okay` or `good`;
  - so rate A = 0.67, rate B = 0.17, and the difference ≥ 0.3.
  - Reuse the existing box-breathing StrategyUses from the v1 seed. If they fall on fewer than 6 distinct wrap days, add StrategyUses of `c-box` with **no re-check result**, not linked to any transition, and not followed by a focus block within 20 minutes, until exactly 6 wrap days have one. This keeps every v1 pattern's numbers identical (`strategyEffect:c-box` still 4 of 5; the hard-transition comparison still 2 vs 2).
  - Make sure no other wrap pattern passes the thresholds. The demo-day wrap (overall Mixed, with box breathing) still leaves the difference above 0.3.
- **Nov 4 wrap:** anchor task "Chemistry lab report" with `anchorFirstStep` "Open the report and type the title." and `aiSummary.tomorrowTip` "Try a 3-minute walk, then open the report.". The morning card on demo day therefore shows it if the clock is set to the morning.
- **Bottle:** written Thu Oct 29 at 9:10 pm: "You've done hard weeks before. Breathe first, then just the title." Unopened.
- **Wins:** every seeded win gets its `kind`. Add pearls for first uses (dated on the first relevant record) and the welcome shell (dated on the first check-in).
- **Cached AI responses** for the demo inputs of every route, including `wrapup` (the example in Section 14.6, adjusted to the seeded facts) and the anchor first-step unstick call.
- **Test:** seed into a fresh fake-indexeddb database named `tide-demo`. Run the engine and assert exactly the planted keys (v1's keys plus `wrapHelped:c-box`). Assert the bottle is eligible after an Ebb check-in on Nov 5. Assert the shore has new items after the demo-day actions.

---

## 17. Quality features

### 17.1 Keyboard shortcuts (desktop)

When `shortcuts.enabled` is on, and never while focus is in a text input or text area:

| Key | Action |
|---|---|
| `c` | Open check-in |
| `n` | New task |
| `1`–`5` | Switch tabs (Today, Tasks, Toolkit, Patterns, Shore) |
| `w` | Close the day |
| `/` | Settings search |
| `?` | Shortcuts help sheet |
| `Shift+D` | Demo launcher |

The help sheet lists all shortcuts and says how to turn them off.

### 17.2 Offline indicator

When `navigator.onLine` is false, show a small pill under the TopBar: "Offline · using built-in suggestions". It fades in and out and is announced politely.

### 17.3 Install prompt

In Settings → About and in What's new: an "Install Tide" button that uses `beforeinstallprompt` where available (Chromium). On iOS Safari, show instructions instead ("Tap Share, then Add to Home Screen"). Never auto-prompt.

### 17.4 Splash

On first load of a session: the companion (or the wave mark) waves on the theme background for at most 900ms while settings load, then hands off to Today. Skipped at motion level Off (a static logo for as long as loading takes). Never delay interaction just to show the splash.

### 17.5 Friendly errors

- `src/app/error.tsx` and `not-found.tsx` use EmptyState with the companion in `soft`.
- Error copy: "Something went wrong on our side. Your data is safe on this device." Buttons "Try again" and "Go to Today".
- 404 copy: "This page drifted away." with "Go to Today".
- Never blame the user, and never show stack traces in production.

### 17.6 Screen Wake Lock in focus

If `focus.keepAwake` is on and `navigator.wakeLock` exists, request a screen wake lock while a focus block runs. Release it on end, pause or page hide, and re-acquire it on visibility return. Do nothing silently where unsupported.

### 17.7 Why no push notifications

Web push requires the app to be installed on iOS, a permission prompt and a push server. Done badly, reminders become exactly the guilt mechanics Tide avoids. v2 uses in-app prompts only: check-in nudges, the bridge card and the evening card. Mention push in the roadmap ("optional, gentle reminders the student designs themselves").

### 17.8 Tooltips and help

- Icon-only controls on desktop show tooltips (Radix Tooltip) after 500ms.
- Every screen has a small "?" in the TopBar menu ("How this screen works") that opens a short, friendly explanation sheet, read-aloud enabled.

### 17.9 Consistent loading and empty states

Every list and screen has a designed empty state (companion + one line + one action) and a designed loading state (skeletons that match the final layout). Audit them in V11.

---

## 18. Data model v2 and migrations

### 18.1 Type additions (`src/lib/types.ts`, additive)

```ts
export type WinKind =
  | 'task_done' | 'transition' | 'strategy_better' | 'unstuck'
  | 'manual' | 'wrap' | 'bottle' | 'first_time' | 'welcome';

// Win: add optional fields (existing fields unchanged)
//   kind?: WinKind;
//   meta?: { taskType?: TaskType; energyCost?: 1|2|3; rating?: 'easy'|'okay';
//            strategyId?: string; family?: StrategyFamily; feature?: string };

// Task: add optional fields
//   someday?: boolean;
//   letGoAt?: number;
//   snoozedUntil?: string;     // 'YYYY-MM-DD'
//   anchorDate?: string;       // 'YYYY-MM-DD' this task is the "one thing" for

export type Overall = 'very_hard' | 'hard' | 'mixed' | 'okay' | 'good';

export interface DayWrap {
  date: string;              // 'YYYY-MM-DD' (primary key)
  startedAt: number;
  completedAt?: number;
  step: number;              // last step reached, for resuming
  eveningCheckInId?: string;
  helped: string[];          // 'strategy:<id>' | 'general:<id>'
  helpedNote?: string;       // stays on device; never sent to AI
  hard: string[];            // ids from the chip list
  hardNote?: string;         // stays on device; never sent to AI
  overall?: Overall;
  carryover: Array<{ taskId: string; decision: 'tomorrow' | 'this_week' | 'let_go' | 'keep' }>;
  anchorTaskId?: string;
  anchorFirstStep?: string;
  aiSummary?: { summary: string; highlight: string; tomorrowTip: string; companionLine: string; source: 'ai' | 'fallback' | 'demo-cache' };
  bottleId?: string;
  windDown?: 'breathing' | 'brain_dump' | 'rest';
}

export interface Bottle {
  id: string;
  ts: number;
  text: string;
  fromWrapDate?: string;
  surfacedAt?: number;
  openedAt?: number;
  kept?: boolean;
  releasedAt?: number;
}
```

### 18.2 Dexie version 2

```ts
this.version(2).stores({
  dayWraps: 'date, completedAt',
  bottles: 'id, ts, openedAt',
  wins: 'id, ts, kind',           // adds an index on kind (existing data stays valid)
  tasks: 'id, status, type, due, order, someday, snoozedUntil, anchorDate',
}).upgrade(async (tx) => {
  // Infer kinds for existing wins so they appear on the Shore correctly.
  await tx.table('wins').toCollection().modify((w) => {
    if (w.kind) return;
    if (w.source === 'task' && typeof w.text === 'string' && w.text.startsWith('Got unstuck')) w.kind = 'unstuck';
    else if (w.source === 'task') w.kind = 'task_done';
    else if (w.source === 'transition') w.kind = 'transition';
    else if (w.source === 'strategy') w.kind = 'strategy_better';
    else w.kind = 'manual';
  });
});
```

- **Check the actual v1 schema in the code** and keep every existing table and index exactly. Only the tables listed here change. In Dexie, a later version must restate a table's full index list when it changes that table, so copy v1's index strings for `wins` and `tasks` and append the new indexes. Verify against the Dexie docs for the installed version.
- Fill `meta` for old task wins when possible, by looking up the task by `refId`.
- **Test:** create a v1 database with fake-indexeddb using the v1 schema and sample data, open it with the v2 class, and assert that all data is intact, kinds are inferred, and new tables exist.

### 18.3 Repo functions (new files in `src/lib/repo/`)

- `dayWraps.ts`: `getWrap(date)`, `startWrap(date)`, `saveWrapStep(date, patch)`, `completeWrap(date)`, `listWraps(range)`.
- `bottles.ts`: `writeBottle(text, fromWrapDate?)`, `getEligibleBottle(now)`, `markSurfaced(id)`, `openBottle(id)`, `keepBottle(id)`, `releaseBottle(id)`.
- `tasks.ts` (add, don't change existing ones): `snoozeTask(id, date)`, `letGo(id)`, `bringBack(id)`, `setAnchor(id, date, firstStep)`.
- `wins.ts`: extend v1 win creation to also set `kind` and `meta`, and add `createFirstTimeWin(feature)` (once per feature, checked against `settings.firsts`) and `createWelcomeWin()`.
- `settings.ts`: `getSetting`, `setSetting`, `setMany`, `applyPreset`, `exportSettings`, `importSettings`, with zod.

### 18.4 Settings migration (runs once, on first v2 boot, per database)

- If v1's `theme` is `light` → `appearance.theme = 'classic'`; `dark` → `classicDark`; `system` → `followSystem = true`, light `classic`, dark `classicDark`.
- If the user is an existing user (`onboarded === true`): `appearance.font = 'hyperlegible'`, `companion.species` unset (show the What's new flow).
- v1 `reduceMotion === true` → `motion.level = 'off'`.
- v1 `vibration` → `haptics.enabled`.
- v1 `readAloudRate` → `voice.rate`.
- Set `settings.schemaVersion = 2`.
- Record the migration in the log, and test each mapping.

### 18.5 Tasks board changes

- **Someday:** a collapsible "Someday ({n})" group under the Not started column (mobile: a chip filter). Tasks there show "Bring back" (clears `someday`). They are excluded from Today, Day Mode and the wrap-up loose ends.
- **Snoozed:** tasks with `snoozedUntil` in the future show the label "Later · Mon" and are excluded from Today until that date. They are not hidden from the board.
- **Anchor:** the anchor task for today shows a small "Today's one thing" badge.
- None of this changes v1 statuses.

---

## 19. AI layer changes

1. **New route** `/api/ai/wrapup` (Section 14.6), with prompt `prompts/06-wrapup.md`, schemas, semantic checks, fallback, cached demo response and tests.
2. **Optional `readingLevel`** on all v1 route inputs (additive). Add one line to the shared preamble: "If INPUT.readingLevel is 'simple', use very common words and keep sentences under 10 words." Pass it from settings.
3. **Simple vocabulary:** when `checkin.vocabulary = 'simple'`, the label route receives the 16 ids as `vocabulary` (the v1 route already accepts a vocabulary list; no schema change).
4. **`/prompts-doc`:** add the wrap-up section and a short "Voice" section (if cloud TTS is configured, show the `instructions` text sent to the provider and the voices used; otherwise explain that device voices are used).
5. **`useAi`** gets `wrapup` support. The `demoForceCache` option skips live calls in autoplay demos.
6. **Server logging rules** (no bodies) apply to `/api/tts` and `/api/ai/wrapup` too.

---

## 20. Pattern engine additions

1. **New rule `wrap_helped`** (`rules/wrapHelped.ts`):
   - For each strategy S with at least one use in the window: day group A = days with a completed wrap and at least one StrategyUse of S; day group B = days with a completed wrap and no use of S.
   - `kA` = days in A whose `overall` is `okay` or `good`; same for B.
   - Show if `nA ≥ minEvidence`, `nB ≥ minEvidence`, and `kA/nA − kB/nB ≥ 0.3`.
   - key `wrapHelped:<strategyId>`; facts `{ strategyName, kA, nA, kB, nB }`.
   - Narrate it with non-causal language (the v1 narrate prompt already forbids causation). Add a narrate fallback template: title "Days with {strategy} tended to end okay"; body "In your data, days when you used {strategy} more often ended okay or good."; whyText "From {nA} closed days with {strategy} ({kA} okay or good) and {nB} without it ({kB} okay or good)."
2. **"What's been hard" summary** (not a pattern card): on the Patterns screen, a small section listing the top 2 `hard` chips across closed days in the period, e.g. "Starting things — 5 of 9 closed days". Hidden with fewer than 3 closed days.
3. `computePatterns` gains optional inputs `dayWraps = []` and `minEvidence = 3`. v1 calls are unchanged and produce identical results (test this).
4. `patterns.minEvidence = 5` raises the threshold for all rules; it never goes below 3.

---
## 21. Testing strategy for v2

### 21.1 Regression first

- `npm run test:v1` (Section 3.4) at the end of every phase.
- `frozen-dictation.test.ts` always passes.
- The v1 seed/planted-patterns test passes, updated only to add `wrapHelped:c-box`.
- If Playwright is available, `e2e/v1-pitch.spec.ts` runs the v1 100-second script in the demo workspace.

### 21.2 New unit tests

| Area | What to test |
|---|---|
| Themes | Contrast pairs for all 15 themes; every token present; classic themes equal v1 values |
| Motion | `useMotionLevel` resolution (explicit setting, OS reduced motion, default); `motionFor` per level |
| Sound | Engine does nothing when disabled; category toggles respected; no AudioContext before a gesture (mock) |
| Voice | Ranking with fixture voice lists per platform; novelty voices never chosen; `speechText` rules; chunking ≤ 180 characters at sentence boundaries; engine fallback order; cache key determinism |
| TTS route | Validation; provider switch; missing key → 503 with `{ available: false }`; no logging of text (spy on the logger) |
| Companions | Registry completeness: every species has every expression, 4 variants, attachment points; every species and context has a line in Appendix B; literal/direct shared lines exist for every context; placeholders filled |
| Companion rules | A static scan of `src/copy/companions.ts` for forbidden phrases ("missed you", "where were you", "haven't", "don't forget", "should") |
| Celebrations | Matrix outcomes for every tier × quadrant × level; caps; no celebration on crisis/support routes |
| Shore | Item mapping from every win kind; placement determinism, no overlap, append stability, overflow; time-of-day palette function; bottle eligibility rules |
| Wrap-up | Step persistence and resume; day boundary before `day.start`; carryover effects (tomorrow, this week, let go, keep); anchor and first step stored; wrapup schemas; semantic checks (digits, forbidden words); fallback; prompt fields match the schema |
| Patterns | `wrap_helped` thresholds; minEvidence; v1 parity when `dayWraps` is empty |
| Settings | zod schema accepts defaults and rejects garbage; migration mappings; presets change only listed keys; search index finds synonyms; import/export round trip |
| Data | Dexie v1 → v2 upgrade with data; kind inference; demo DB isolation (main untouched) |
| Demo | Engine step execution with fake elements; failure skipping; presenter pauses; all `data-demo-id` references exist; crisis preview only in the demo workspace |

### 21.3 New flow tests (Testing Library + fake-indexeddb, AI and TTS mocked)

1. Onboarding: complete all 12 steps with keyboard → settings saved → welcome shell win exists → Today shows the companion.
2. Onboarding: "Skip setup" applies defaults.
3. Existing user: the What's new sheet appears once; "Try the new look" applies Lagoon + Playful.
4. Companion Studio: change species, name, variant and accessory → persisted → Undo restores.
5. Theme change from Settings → `data-theme` updates; the Undo toast works.
6. Preset Low sensory → listed keys changed → Undo restores all.
7. Check-in with companion: typing triggers `listening`, saving triggers the quadrant reaction (assert expression state via `data-expression` on the companion root).
8. Task done in Swell → small celebration; in Ebb → toast "That counted." and no overlay.
9. Shore: after a task is done, visiting `/shore` shows the new item with the right type; tapping it opens the details card.
10. Bottle: write → Ebb check-in a day later (clock) → Today bottle card → open → keep → bottle win.
11. Wrap-up: full flow with mocked AI → DayWrap complete, driftwood win, carryover applied, anchor set; next morning (clock) the morning card shows the anchor and first step.
12. Wrap-up resume: close at step 6 → reopen → resumes at 6.
13. Settings search: "dark mode" → navigates to appearance and highlights the theme control.
14. Demo workspace: start the demo → the main DB is unchanged (compare row counts before/after) → leave the demo.
15. Read-aloud: clicking ReadAloud calls the voice engine with speech-friendly text (mock engine).

### 21.4 End-to-end (if Playwright can be installed)

- `e2e/demo-full.spec.ts`: launch `/demo?autostart=full` (simulate the Start click), run at 2× speed with forced cache, and assert every chapter's key element appeared. Allow up to 4 skipped steps, but fail if any chapter fully fails.
- `e2e/demo-pitch.spec.ts`: the pitch cut in under 120s at 1×.
- `e2e/themes.spec.ts`: screenshot Today in 5 themes (Lagoon, Coral Reef, Midnight Tide, Sandbar, Ink) at 390px and 1280px. Store screenshots under `e2e/__screenshots__/` for the team; do not fail on pixel diffs.
- `e2e/v1-pitch.spec.ts` (Section 3.4).

### 21.5 Visual review (with a browser tool if available)

For each major screen (Today, Check-in, Tasks, Unstick, Focus, Bridge, Toolkit + Box breathing, Patterns, Shore, Collection, Wrap-up steps, Settings index and two sections, Companion Studio, Onboarding steps, Demo HUD), check:

- at 390×844 and 1280×800;
- in Lagoon, Midnight Tide, Coral Reef and Ink;
- at motion levels Off and Lively;
- at text scale 150%.

Fix misalignment, clipping, low contrast, cramped spacing and anything that looks unfinished. Record what you checked in the log.

---

## 22. The ordered build plan (Phases V0–V12)

Apply the phase cycle (Section 1.3) to every phase, without waiting for approval between phases.

### Phase V0: Baseline and safety net

**Read first:** Sections 0–3, 18.4, 21.1; the whole v1 log and walkthrough.

**Steps:**
1. Everything in Section 3.1 (baseline checks, tag `v1-baseline`, branch `v2-experience`, `docs/V1_INVENTORY.md`).
2. Dictation freeze: identify the files, record the hashes, add `frozen-dictation.test.ts` (Section 3.2).
3. Add `npm run test:v1`.
4. Add `CHANGELOG.md` with a "v2 (in progress)" section.
5. Update `CLAUDE.md` with the v2 rules (prime directive, frozen dictation, motion levels, companions rules, where the v2 spec lives).
6. Write "Before V0"/"After V0" log entries.

**Acceptance:** green baseline recorded; tag and branch exist; freeze test passes.

### Phase V1: Design system 2.0 and themes

**Read first:** Sections 4, 5.3, 6 (to know the hooks), 18.4.

**Steps:**
1. Fonts (Nunito, Lexend) and the `appearance.font` pairing.
2. Theme architecture, all 15 themes, quadrant palettes, the ThemeProvider with crossfade, `followSystem`, and the contrast tests.
3. Settings keys for appearance (defaults + migration from v1 `theme`).
4. Motion tokens, `useMotionLevel`, and `motionFor` (Section 5); re-point v1's `useReducedMotionPref`.
5. UI components (Section 4.4): Button (3D), Card, ProgressBar, Chip, SegmentedControl, Switch, Sheet, Toast, Tooltip/Coach mark, EmptyState, IconTile.
6. Restyle the shell: TabBar (5 tabs; the Shore tab links to `/shore`, a placeholder page until V7, with a real empty state, not "coming soon"), FAB, TopBar.
7. Restyle every v1 screen to the new components **without changing behavior**. Go screen by screen: Today, Check-in sheet, Tasks, Unstick, Focus, Bridge, Toolkit + tools, Patterns, Proof log, Settings (temporary, until V9), Support, Onboarding (temporary, until V6).
8. Theme picker component (used in V6 and V9).

**Verify:** all checks; `test:v1`; a visual pass in 4 themes.

**Acceptance:** every v1 flow works, the app looks v2, contrast tests pass, and existing users still see Classic + Hyperlegible.

### Phase V2: Sound, haptics and voice

**Read first:** Sections 6, 7, 3.2.

**Steps:**
1. Sound engine, all sounds, ambience, `useSound`, settings keys.
2. Haptics helper.
3. Voice module: ranking, speech text, browser engine with fixes, cloud engine, `/api/tts` + `/api/tts/status`, clips engine, `useVoice`, VoicePicker.
4. Switch read-aloud callers to `useVoice` (not the frozen dictation).
5. `scripts/generate-voice-clips.ts` and `npm run voice:clips`.
6. `.env.example` additions; TEAM_TODO entries (choose a provider, add the key, test voices on the demo laptop with Edge).

**Acceptance:** read-aloud picks a good voice; text is speech-friendly; the cloud voice works when configured and falls back when not; the dictation freeze test passes.

### Phase V3: Companions (engine and art)

**Read first:** Sections 8, 2.2–2.4, Appendix B.

**Steps:**
1. Companion registry: species metadata, variants, attachment points, default names, About text.
2. Art: one component per species with all expressions and grouped parts (`src/components/companion/species/*.tsx`), lazy-loaded per species. Accessories (12) as components.
3. Animation: idle loops, blink, special idles, reactions, breath sync, walking, and the hard pause rules.
4. Speech bubble component and the companion copy (`src/copy/companions.ts`) with every line in Appendix B.
5. `useCompanion`, the event bus and `CompanionHost`.
6. Companion Studio page (`/companion`).
7. The "none" alternative visuals.
8. Registry and forbidden-phrase tests.

**Verify:** look at every species, in every expression, at sizes S, M, L and XL, in light and dark themes, at Off/Calm/Lively. Write a dev-only gallery page `/dev/companions` (not linked, excluded from production builds or guarded by `NODE_ENV`) to help review.

**Acceptance:** six charming, original, consistent companions plus none; all expressions; smooth animation; Studio works.

### Phase V4: Companions across the app

**Read first:** Section 9; v1 Sections 13.3–13.10.

**Steps:**
1. Place `CompanionHost` in each placement from Section 9's table, with the right expressions, reactions and lines.
2. Emit bus events from the v1 flows (check-in typing/saved, AI loading, task done, focus start/end, bridge, breath phases, re-check).
3. Box breathing: the companion in the center, driven by the exact phases; the companion also leads breathing in the Bridge Shift step.
4. Focus page: body doubling activity and outcome reactions.
5. Empty states, error and 404 pages, splash.
6. Placement toggles respected; "none" alternatives.

**Acceptance:** flow test 7 (Section 21.3); the companion never appears on the crisis screen; v1 flows unchanged.

### Phase V5: Celebrations and micro-interactions

**Read first:** Sections 5.4–5.6, 10.

**Steps:**
1. `celebrate()`, CelebrationHost, the matrix, caps, copy, confetti (lazy).
2. Wire every event in Section 10.2.
3. The micro-interaction catalog (Section 5.5) across all screens.
4. Page enter transitions (`template.tsx`), tab indicator, shared layout for task moves.
5. Performance pass (Section 5.6) with measurements logged.

**Acceptance:** flow test 8; frame-rate targets met or the issues logged with mitigations; `test:v1` green; the v1 pitch e2e (if available) passes.

### Phase V6: Onboarding 2.0 and What's new

**Read first:** Section 11; Appendix A (onboarding copy).

**Steps:**
1. The 12-step onboarding with progress, resume and skip; coach marks for the first check-in; the welcome shell (the win is created now; the Shore renders it in V7).
2. Skip-setup defaults.
3. The What's new sheet for existing users, the `/whats-new` route and the "Choose a companion?" Today card.
4. Settings migration (Section 18.4) if not already done in V1.

**Acceptance:** flow tests 1–3.

### Phase V7: Your Shore

**Read first:** Section 13, Section 18 (win kinds, Dexie v2 for bottles).

**Steps:**
1. Dexie v2 (bottles, win kinds, task fields) with the upgrade function and the upgrade test, if not yet done.
2. Win creation sets `kind` and `meta`; first-time pearls.
3. Shore scene layers, time-of-day sky, waves, the companion on the sand.
4. Item catalog art (14 item types) and mapping.
5. Placement algorithm and tests.
6. Arrival animations and `lastSeenAt`.
7. Item details card, keyboard navigation, list view link, Collection page.
8. Bottles: write, surface, open, keep/release; Today bottle card.
9. Save as image.
10. Shore preview strip on Today.

**Acceptance:** flow tests 9–10; the shore renders 48 items smoothly; Off mode is fully static and accessible.

### Phase V8: Close the day

**Read first:** Section 14, Section 20, Section 18.

**Steps:**
1. DayWrap repo and resume logic.
2. The `/wrap` flow, all 13 steps, with the evolving sky.
3. DayTideChart with monotone cubic interpolation and the accessible list.
4. Loose ends (snooze, let go, tomorrow) and the board's Someday/snoozed UI.
5. Tomorrow step with the pattern hint, anchor and first step (unstick route).
6. `/api/ai/wrapup` route, prompt, schemas, checks, fallback, cached demo response; `/prompts-doc` update.
7. The bottle step, wind-down options (breathing, brain dump to tomorrow, rest), and the goodnight scene with the driftwood win.
8. Morning card and evening card on Today.
9. Pattern rule `wrap_helped` and the "What's been hard" summary.

**Acceptance:** flow tests 11–12; wrap-up schema and semantic tests; patterns tests.

### Phase V9: Settings 2.0

**Read first:** Section 15, Section 18.4.

**Steps:**
1. `SettingsSchema`, defaults, and the migration (complete it).
2. Settings index with search, presets and the companion card; section pages with live preview and reset.
3. Every control in the Section 15.2 table, wired to real behavior (verify each one changes something visible or functional; a setting that does nothing is a bug).
4. Presets with diff confirmation and Undo.
5. Search index with synonyms and highlight.
6. Import/export settings and data; import backup with validation and rollback.
7. Update the v1 settings tests to the new structure (Section 3.5) with the same behavior assertions.

**Acceptance:** flow tests 5, 6, 13; every setting is verified in a checklist in the log ("key → what it changes → verified how").

### Phase V10: Demo workspace and Demo director

**Read first:** Section 16, Section 14 (v1 demo), v1 spec Section 14.

**Steps:**
1. Workspace switching in `db.ts`, the boot handling of `?demo=start`, the Demo pill, Leave demo, and v1 compatibility.
2. Clock extensions (`setDemoTime`, `setDemoSpeed`), keeping v1 behavior.
3. Seed v2 (Section 16.10) and the seed tests.
4. Cached responses for every demo input, `demoForceCache`.
5. Director engine, actions, custom actions, chapter setups.
6. HUD, Spotlight, DemoCursor, the end screen, the debug panel.
7. `data-demo-id` attributes and the reference test.
8. Full script, pitch script, presenter mode, the `/demo` launcher, the Shift+D shortcut, the onboarding "Watch the demo" button, menu and settings entries.
9. Crisis preview mode with tests.
10. Update `docs/demo-script.md`: how to run both demos, presenter keys, how to recover if something goes wrong (Exit → `/demo` → chapter jump), and the backup video plan.

**Verify:** run the full tour and the pitch cut in jsdom unit-level tests, and end to end with Playwright if possible; with a browser tool, watch the whole tour at 1× in Lagoon and fix every rough moment (timing, spotlight placement, captions covering targets, jumps).

**Acceptance:** flow test 14; the tour runs start to finish, offline, twice in a row, without touching the main data.

### Phase V11: Quality features, accessibility and performance

**Read first:** Sections 17, 5.6, 2.3; v1 Section 7.

**Steps:**
1. Keyboard shortcuts + help sheet; offline pill; install prompt; wake lock; tooltips; "How this screen works" sheets.
2. Empty/loading state audit on every screen.
3. Accessibility audit: keyboard paths for every new flow (onboarding, studio, shore, collection, wrap-up, settings search, demo HUD), focus management in overlays, live regions, labels, contrast in all themes, text at 150%, motion Off everywhere. Run Lighthouse if available (≥ 95 on Today, Check-in, Shore, Wrap-up, Settings).
4. Performance measurements and fixes (Section 5.6 budgets).
5. Copy pass on all new strings: kind, clear, sentence case, literal variants present, no guilt, no emojis.

**Acceptance:** audit tables in the log, all issues fixed or explained.

### Phase V12: Documentation, final audit and merge

**Read first:** Section 23; v1 Section 17.

**Steps:**
1. Update `README.md`: v2 features, screenshots placeholders, how to run the demo, voice setup, themes, companions, "Delight without guilt".
2. Update `docs/architecture.md` (Mermaid): add voice, sound, companion bus, celebrations, demo workspace and director, wrap-up route, TTS route.
3. Update `docs/CODE_WALKTHROUGH.md` with every new module (what it does, files, data flow, decisions worth defending, likely reviewer questions), plus "Replacing companion art".
4. Update `AI_ATTRIBUTION.md`: every new file; new libraries with licenses (`canvas-confetti` if used, fonts OFL, TTS provider terms if configured); the new prompt.
5. Update `/prompts-doc` (wrap-up and voice).
6. `docs/TEAM_TODO.md`:
   - set up the TTS key and generate clips (optional);
   - test voices on the demo laptop;
   - ask the partner whether companions feel childish for 18–24-year-olds;
   - verify crisis numbers;
   - rehearse with presenter mode;
   - record the backup video of the full tour and the pitch cut;
   - take screenshots in 3 themes;
   - deploy and test `/demo` on the deployed URL.
7. `CHANGELOG.md`: final v2 entry, written plainly.
8. Final audit: every acceptance criterion in this document → where → how verified → status (table in the log). Fix gaps.
9. Definition of Done (Section 23) ticked in the log.
10. Today's progress report draft.
11. Merge: if every check, `test:v1`, the freeze test and the e2e suites (if available) are green, merge `v2-experience` into `main` (fast-forward or merge commit), tag `v2.0.0` and push if a remote is configured and push works without prompting. If anything is red, do **not** merge. Leave the branch, and explain exactly what's missing in the final log entry and TEAM_TODO.
12. Final message to the team: what's new, how to run the demo, what's in TEAM_TODO, anything that didn't make it.

---

## 23. Definition of done for v2

- [ ] Every v1 feature works exactly as before; `test:v1` passes; the v1 pitch path works in the demo workspace.
- [ ] Dictation is byte-for-byte unchanged (freeze test passes).
- [ ] 15 themes implemented, all passing contrast tests; Classic themes match v1; theme picker with live preview.
- [ ] Duolingo-style design system applied to every screen; no screen looks unfinished at 390px or 1280px.
- [ ] Motion levels Off/Calm/Lively respected everywhere; OS reduced-motion honored; performance budgets met or explained.
- [ ] Sound engine with all sounds and ambience, off by default; haptics where supported.
- [ ] Read-aloud uses the best available voice, speech-friendly text and chunking; the cloud voice works when configured; voice picker with samples.
- [ ] Six original companions + none, all expressions, all variants, 12 accessories, Companion Studio, lines in every mode, placements and talkativeness respected, never on the crisis screen, never guilt.
- [ ] Companions integrated across the app, including breath-synced breathing and focus body doubling.
- [ ] State-aware celebrations with caps.
- [ ] 12-step local onboarding with resume and skip; What's new for existing users; no login.
- [ ] Today 2.0: header, quick actions, morning card, bottle card, evening card, shore preview.
- [ ] Your Shore: scene, 14 item types, deterministic placement, arrivals, details, collection, bottles, save as image, list view.
- [ ] Close the day: 13 steps, tide chart, loose ends, anchor and first step, AI summary with checks and fallback, bottle, wind-down, goodnight; morning card next day; `wrap_helped` pattern.
- [ ] Settings 2.0: every setting in Section 15.2 works; presets; search; live preview; import/export; backup restore.
- [ ] Demo: separate workspace; Demo button in the launcher, onboarding, menu and settings; full tour, pitch cut and presenter mode; works offline; never touches the main data; crisis preview only in demo.
- [ ] Quality features (Section 17) done.
- [ ] Accessibility: keyboard-only for all new flows, screen-reader text for all visuals, Lighthouse ≥ 95 where measured.
- [ ] All tests green; build clean; no secrets; `.env.example` updated.
- [ ] Docs and logs updated: README, CHANGELOG, AI_DEV_LOG (before/after every V-phase), AI_ATTRIBUTION, DECISIONS, CODE_WALKTHROUGH, TEAM_TODO, demo-script, architecture, prompts-doc, progress report drafts.
- [ ] Merged to `main` and tagged `v2.0.0`, or the reason it wasn't is clearly documented.

---
## Appendix A: Copy catalog additions (`src/copy/en.ts`)

Add these keys (grouped). Keep every v1 key. Where (G/D/L) appears, provide gentle/direct/literal variants; the literal one is listed when it differs.

**Tabs and navigation**
- `tabShore`: "Shore"
- `menuCloseDay`: "Close the day"
- `menuRunDemo`: "Run the demo"
- `menuCompanion`: "My companion"
- `menuWhatsNew`: "What's new"
- `menuHelpScreen`: "How this screen works"
- `demoPill`: "Demo"
- `offline`: "Offline · using built-in suggestions"

**Onboarding**
- `obWelcomeTitle`: "Welcome to Tide."
- `obWelcomeSub`: "A calm place to plan around how you actually feel."
- `obSetup`: "Let's set up your space"
- `obWatchDemo`: "Watch the demo"
- `obUsedBefore`: "I've used Tide before"
- `obNameTitle`: "What should we call you?"
- `obNameHint`: "Only shown to you. You can skip this."
- `obCompanionTitle`: "Choose a companion"
- `obCompanionSub`: "They keep you company. They never judge."
- `obNoCompanion`: "No companion"
- `obNoCompanionSub`: "Just me and the waves. You can add a companion anytime in Settings."
- `obChoose`: "Choose {name}"
- `obSayHi`: "Say hi"
- `obNameCompanionTitle`: "What's your companion's name?"
- `obKeepName`: "Keep {name}"
- `obMakeItYours`: "Make it yours"
- `obLooksGood`: "Looks good"
- `obSensesTitle`: "How do you like your senses?"
- `obSensesSub`: "Pick a starting point. You can change anything later."
- `obCustomizeLater`: "I'll customize later"
- `obColorsTitle`: "Pick your colors"
- `obTalkTitle`: "How should Tide talk to you?"
- `obReadingLevel`: "Reading level"
- `obVoiceTitle`: "Want Tide to read things aloud?"
- `obNoThanks`: "No thanks"
- `obDayTitle`: "Your day"
- `obDayStart`: "My day usually starts around"
- `obWrapTime`: "I like to close the day around"
- `obTransitionLead`: "Warn me before switching activities"
- `obPrivacyBullets`: "No account. No ads. No tracking."
- `obFirstCheckinTitle`: "Let's try it once"
- `obFirstCheckinSub`: "It takes about 30 seconds."
- `obShoreStarts`: "Your shore starts here. Every win leaves something on it."
- `obGoToDay`: "Go to my day"
- `obSkipSetup`: "Skip setup"
- `obStepOf`: "Step {n} of {total}"

**What's new**
- `wnTitle`: "What's new in Tide"
- `wnCompanions`: "Meet the companions"
- `wnLook`: "A fresh look"
- `wnTryLook`: "Try the new look"
- `wnShore`: "Your Shore"
- `wnWrap`: "Close the day"
- `wnSettings`: "Settings for everything"
- `wnDemo`: "Run the demo"
- `wnSetUp`: "Set it up"
- `wnLater`: "Maybe later"
- `todayChooseCompanion`: "Choose a companion?"
- `todayChooseCompanionSub`: "Someone to breathe with and keep you company."

**Today 2.0**
- `qaCheckIn`: "Check in"
- `qaRegulate`: "Regulate"
- `qaFocus`: "Focus"
- `qaCloseDay`: "Close the day"
- `qaCloseDayLater`: "Close the day · later"
- `morningTitle`: "Good morning"
- `morningOneThing`: "Your one thing today: {title}"
- `morningFirstStep`: "First step: {step}"
- `morningStart`: "Start with this"
- `morningFirstSwitch`: "First switch: {from} → {to} at {time}"
- `bottleCardTitle`: "A bottle washed up"
- `bottleOpen`: "Open it"
- `eveningCardTitle` (G/D/L): "Ready to close the day?" / "Close the day?" / "You can close the day now."
- `eveningCardSub`: "About 3 minutes."
- `eveningNotTonight`: "Not tonight"
- `dayClosed`: "Day closed. Sleep well."
- `reopen`: "Reopen"
- `shoreNew`: "New"
- `nudgeCheckin`: "Want to check in?"

**Celebrations** (by quadrant, for small/big where no overlay)
- `celebrateEbb`: "That counted."
- `celebrateEbbBig`: "You did that on a low day. It counts."
- `celebrateSurge`: "Done. One less thing."
- `celebrateSurgeBig`: "You did a hard thing while a lot was going on."
- `celebrateUnstuckTitle`: "You got unstuck!"
- `celebrateUnstuckMsg`: "That was the hardest part. {companion} saw it."
- `celebrateBigTaskTitle`: "Big one, done."
- `celebrateBigTaskMsg`: "{title} is finished. It's on your shore now."
- `celebrateWrapTitle`: "Day closed."
- `celebrateWrapMsg`: "Rest well. Tomorrow's first step is ready."
- `celebrateFirstTitle`: "First {feature}!"
- `celebrateFirstMsg`: "A pearl just washed up on your shore."
- `celebrateLiteralTask`: "Task finished: {title}. A shell was added to your shore."
- `continue`: "Continue"

**Shore**
- `shoreTitle`: "Your Shore"
- `shoreRangeToday`: "Today"
- `shoreRangeWeek`: "This week"
- `shoreRangeAll`: "All"
- `shoreCollection`: "Collection"
- `shoreList`: "List"
- `shoreHint`: "Every win leaves something here. Tap anything to remember it."
- `shoreEmpty`: "Your shore is quiet for now. Finish a task, get through a switch, or try a strategy, and something will wash up."
- `shoreMore`: "+{n} more in your collection"
- `shoreSaveImage`: "Save as image"
- `shoreIncludeName`: "Include my name"
- `shoreSkipToList`: "Skip to list view"
- `shoreNewAnnounce`: "New on your shore: {item}. {text}"
- `collectionTitle`: "Your collection"
- `collectionFound`: "You've found {n}"
- `collectionFirst`: "First found {date}"
- `collectionNotYet`: "Not found yet"
- `collectionReleased`: "Released notes"
- `collectionPearls`: "Pearls"
- `bottleWriteTitle`: "Write a note to future you"
- `bottleWriteSub`: "Write something kind to yourself, for a hard day."
- `bottlePlaceholders`: ["You've done hard weeks before.", "Breathe first. Then just the title.", "You don't have to do it all today."]
- `bottleWrittenOn`: "You wrote this on {date}"
- `bottleKeep`: "Keep it on my shore"
- `bottleDrift`: "Let it drift"

**Item names and how they arrive** (for the collection; descriptions are in Section 13.4)
- Spiral shell: "Finish a writing task"
- Scallop: "Finish a studying task"
- Cowrie: "Finish an admin task"
- Conch: "Finish a social task"
- Clam: "Finish a chore"
- Moon snail: "Finish any other task"
- Smooth pebble: "Get unstuck on a task"
- Sea glass: "Get through a switch"
- Starfish: "Feel better after a strategy"
- Sand dollar: "Add a win yourself"
- Driftwood: "Close the day"
- Bottle: "Keep a note you wrote"
- Pearl: "Try a part of Tide for the first time"

**Close the day**
- `wrapArriveTitle`: "Let's close the day."
- `wrapArriveSub`: "About 3 minutes. Skip anything you want."
- `wrapStart`: "Start"
- `wrapEveningCheckin`: "How are you arriving at the end of the day?"
- `wrapTideTitle`: "Your day as a tide"
- `wrapOneCheckin`: "Only one check-in today. That's fine."
- `wrapShowList`: "Show as list"
- `wrapWinsTitle`: "What you did"
- `wrapNoWins`: "Some days are about getting through. That counts too."
- `wrapAddWin`: "Add something you did"
- `wrapHelpedTitle`: "What helped?"
- `wrapHelpedChips`: ["Sleep", "Food", "A person", "Music", "Moving", "Being outside", "Quiet", "A break", "Nothing in particular"]
- `wrapHardTitle`: "What was hard?"
- `wrapHardChips`: ["Starting things", "Switching between things", "People", "Noise or place", "My body", "My mood", "Too much to do", "Nothing in particular"]
- `wrapSomethingElse`: "Something else"
- `wrapOverallTitle` (G/D/L): "If today were water, it was…" / "How was today overall?" / "Choose how today was overall."
- `wrapOverall`: Stormy "Very hard" · Choppy "Hard" · Mixed "Mixed" · Calm "Okay" · Glassy "Good"
- `wrapLooseTitle`: "Loose ends"
- `wrapLooseOptions`: "Tomorrow" · "Later this week" · "Let it go" · "Keep as is"
- `wrapLetGoHelp`: "It moves to Someday. You can bring it back anytime."
- `wrapNoLoose`: "No loose ends today."
- `wrapLooseSummary`: "{moved} moved, {letgo} let go."
- `wrapTomorrowTitle`: "Tomorrow"
- `wrapPickOne`: "Pick one thing to start tomorrow"
- `wrapFirstStepAsk`: "Want a first step ready for the morning?"
- `wrapNoteTitle`: "A note for later"
- `wrapSummaryLoading`: "Putting your day together…"
- `wrapSummaryNote`: "A suggestion, not a judgment."
- `wrapWindDownTitle`: "Want help winding down?"
- `wrapWindDownOptions`: "1-minute breathing" · "Empty your head" · "Just rest"
- `wrapGoodnight`: "Day closed. Sleep well, {name}."
- `wrapGoodnightNoName`: "Day closed. Sleep well."
- `wrapDone`: "Done"

**Settings 2.0**
- `settingsSearch`: "Search settings"
- `settingsPresets`: "Quick presets"
- `settingsPresetConfirm`: "This will change:"
- `settingsReset`: "Reset this section"
- `settingsResetAll`: "Reset all settings"
- `settingsPreview`: "Preview"
- `settingsNoMatch`: "No settings match \"{q}\". Try \"colors\", \"sound\" or \"companion\"."
- Section names: "Profile", "Companion", "Appearance", "Motion", "Sound & haptics", "Voice", "Language & tone", "Check-in", "Day & planning", "Focus", "Toolkit", "Patterns", "Shore", "Privacy & data", "People & support", "Shortcuts", "Demo", "About"
- Preset names and descriptions:
  - Calm: "Soft motion · Gentle celebrations · No sounds"
  - Low sensory: "No motion · Muted colors · Quiet companion"
  - Focused: "Clear blue · Fewer interruptions · Optional brown noise"
  - Playful: "Bright colors · Lively motion · Sounds on"
  - High contrast: "Maximum contrast · Bold text · Color-blind safe"
- `voiceNatural`: "Natural voices"
- `voiceDevice`: "Device voices"
- `voiceSample`: "Hi, I'm here to help you start small. Take your time."
- `voiceLimited`: "Your device's voices are limited. For a more natural voice, try Microsoft Edge, or turn on Natural voices if your team set them up."
- `voicePrivacy`: "Natural voices send the text being read to {provider} to turn it into audio. Tide only sends the text on screen that you asked to hear, never your history."
- `hapticsUnsupported`: "Not supported on this device"
- `importSummary`: "This backup has {summary}. Replace what's on this device?"
- `importReplace`: "Replace"
- `importFailed`: "That file couldn't be imported. Nothing on this device was changed."

**Errors, empty states, misc**
- `errorTitle`: "Something went wrong on our side."
- `errorSub`: "Your data is safe on this device."
- `tryAgain`: "Try again"
- `goToday`: "Go to Today"
- `notFound`: "This page drifted away."
- `shortcutsTitle`: "Keyboard shortcuts"
- `installApp`: "Install Tide"
- `installIos`: "Tap Share, then Add to Home Screen."
- `couldntPlayVoice`: "Couldn't play the voice on this device."

**Demo**
- `demoLauncherTitle`: "See Tide in action"
- `demoFull`: "Full tour · about 4 minutes"
- `demoPitch`: "Pitch cut · 100 seconds"
- `demoPresenter`: "Presenter mode · you press Next"
- `demoStart`: "Start"
- `demoNarration`: "Narration voice"
- `demoCaptions`: "Captions"
- `demoSpeed`: "Speed"
- `demoWorkspaceNote`: "You're in the demo workspace. Your own data is safe."
- `demoLeave`: "Leave demo"
- `demoEndTitle`: "That's Tide."
- `demoExplore`: "Explore on your own"
- `demoRunPitch`: "Run the pitch cut"
- `crisisPreviewBanner`: "Preview: this is what Tide shows if someone writes about being in danger. Nothing was saved."
- `oldDemoData`: "Your main workspace has example data from an older version. Clear it and start fresh?"

---

## Appendix B: Companion lines (`src/copy/companions.ts`)

Implement every line. Gentle mode uses the species lines. Direct and Literal modes use the shared lines at the end. Keep lines at 12 words or fewer. Placeholders: `{name}` (user's name, omitted gracefully if empty), `{quadrant}`, `{m}` (minutes).

### Pebble (otter): warm, social, playful
- `greeting_morning`: "Morning! I saved you a smooth pebble."
- `greeting_afternoon`: "Hey, you're here. Want to check in?"
- `greeting_evening`: "Evening. The water's calm now."
- `checkin_listening`: "I'm listening. Take your time."
- `after_checkin_surge`: "That's a lot at once. Let's float for a sec."
- `after_checkin_swell`: "Ooh, good energy. Let's use it."
- `after_checkin_ebb`: "Low tide day. I'll stay close."
- `after_checkin_still`: "Nice and calm. I like this."
- `unstick_offer`: "Let's find a tiny way in."
- `focus_start`: "I'll sort my pebbles while you work."
- `focus_end_got_going`: "You got going! I knew you could."
- `focus_end_didnt_start`: "You showed up. Want a smaller step?"
- `bridge_start`: "Switch coming up. Let's pack together."
- `breathing_invite`: "Float with me. In… and out."
- `celebration`: "Look at you go!"
- `wrap_start`: "Let's close the day together."
- `wrap_end`: "Rest well. I'll keep the shore safe."
- `shore_new_item`: "Something washed up for you!"
- `idle_tip`: "Tap me anytime you need a breather."

### Lolo (axolotl): curious, gentle, optimistic
- `greeting_morning`: "Good morning! New day, fresh water."
- `greeting_afternoon`: "Hi again! How's the water today?"
- `greeting_evening`: "Evening already. Let's slow down."
- `checkin_listening`: "Mm-hm. Say it however it comes."
- `after_checkin_surge`: "Big waves. We can ride this one slowly."
- `after_checkin_swell`: "You're glowing today!"
- `after_checkin_ebb`: "Heavy day? Starting small is still starting."
- `after_checkin_still`: "Calm water. That's a good place."
- `unstick_offer`: "Stuck happens. Let's try a smaller way in."
- `focus_start`: "I'll read next to you. No rush."
- `focus_end_got_going`: "You did it. I'm proud of you."
- `focus_end_didnt_start`: "That's okay. We can start over."
- `bridge_start`: "New place soon. Let's get ready."
- `breathing_invite`: "Breathe with my gills. In… out."
- `celebration`: "Yay! That's a real one."
- `wrap_start`: "Want to look back at today with me?"
- `wrap_end`: "Sleep well. Tomorrow is new water."
- `shore_new_item`: "Ooh, a new treasure on your shore!"
- `idle_tip`: "I can regrow what I lose. Plans can too."

### Capi (capybara): calm, unbothered, steady
- `greeting_morning`: "Morning. No hurry. We go slow."
- `greeting_afternoon`: "Hey. Sit with me a minute?"
- `greeting_evening`: "Warm water, quiet evening."
- `checkin_listening`: "I'm here. Nothing to fix yet."
- `after_checkin_surge`: "Lots going on. Let's just sit first."
- `after_checkin_swell`: "Good energy. Use it, but pace it."
- `after_checkin_ebb`: "Low battery. That's allowed."
- `after_checkin_still`: "This is my favorite kind of day."
- `unstick_offer`: "One small thing. That's all."
- `focus_start`: "I'll sip my tea. Take your time."
- `focus_end_got_going`: "Steady. That's how it's done."
- `focus_end_didnt_start`: "No worries. The tea's still warm."
- `bridge_start`: "Time to move soon. Slowly is fine."
- `breathing_invite`: "Slow breath, like warm water."
- `celebration`: "Nice. Very nice."
- `wrap_start`: "Let's sit and look at the day."
- `wrap_end`: "Goodnight. Everything can wait till morning."
- `shore_new_item`: "Something nice drifted in."
- `idle_tip`: "Resting is part of the plan."

### Zip (gecko): upbeat, practical, one small step
- `greeting_morning`: "Morning! One step, then the next."
- `greeting_afternoon`: "Hey! What's the next small step?"
- `greeting_evening`: "Evening! Let's wrap things up."
- `checkin_listening`: "Got it. Keep going, I'm with you."
- `after_checkin_surge`: "Lots of energy. Let's point it somewhere."
- `after_checkin_swell`: "Let's climb something!"
- `after_checkin_ebb`: "Tiny steps still stick."
- `after_checkin_still`: "Calm and ready. Nice."
- `unstick_offer`: "Let's find the first sticky step."
- `focus_start`: "I'll take notes. You do the thing."
- `focus_end_got_going`: "You stuck with it!"
- `focus_end_didnt_start`: "Okay! Let's make the step tinier."
- `bridge_start`: "Next stop coming. Quick check?"
- `breathing_invite`: "Feet still. Breathe in with me…"
- `celebration`: "Woo! Another one!"
- `wrap_start`: "Quick look back at today?"
- `wrap_end`: "Night! Tomorrow's first step is ready."
- `shore_new_item`: "New find on the shore!"
- `idle_tip`: "Small steps add up. Even tiny ones."

### Luma (jellyfish): quiet, soft, few words
- `greeting_morning`: "Good morning."
- `greeting_afternoon`: "Hello. I'm here."
- `greeting_evening`: "Evening. Soft light now."
- `checkin_listening`: "Listening."
- `after_checkin_surge`: "Strong current. Slow down with me."
- `after_checkin_swell`: "Bright today."
- `after_checkin_ebb`: "Dim is okay. I'll glow for both of us."
- `after_checkin_still`: "Calm."
- `unstick_offer`: "One small step."
- `focus_start`: "Drifting beside you."
- `focus_end_got_going`: "You started."
- `focus_end_didnt_start`: "Okay. Smaller step?"
- `bridge_start`: "Change coming. Get ready."
- `breathing_invite`: "Pulse with me."
- `celebration`: "Done. Glowing."
- `wrap_start`: "Close the day?"
- `wrap_end`: "Goodnight."
- `shore_new_item`: "Something new."
- `idle_tip`: "Tap me to breathe."

### Shelby (hermit crab): shy, thoughtful, careful
- `greeting_morning`: "Oh, morning. I was just peeking out."
- `greeting_afternoon`: "Hi. Is now a good time to check in?"
- `greeting_evening`: "Evening. Time to tuck in soon."
- `checkin_listening`: "I'm listening. Quietly."
- `after_checkin_surge`: "Lots at once. Want a quiet minute first?"
- `after_checkin_swell`: "You seem bright today. I like it."
- `after_checkin_ebb`: "Heavy day. We can go slowly."
- `after_checkin_still`: "Quiet water. Cozy."
- `unstick_offer`: "Let's look for a small opening."
- `focus_start`: "I'll polish my shell nearby."
- `focus_end_got_going`: "You got started. That's brave."
- `focus_end_didnt_start`: "That's okay. Want a smaller step?"
- `bridge_start`: "Changing shells is hard. Let's do it together."
- `breathing_invite`: "Tuck in with me. Breathe in…"
- `celebration`: "Oh! That's wonderful."
- `wrap_start`: "Shall we tuck the day away?"
- `wrap_end`: "Goodnight. Your shore is safe."
- `shore_new_item`: "Something washed up. For you."
- `idle_tip`: "New shells feel strange at first. Then they fit."

### Shared: Direct mode (any species)
- `greeting_*`: "Hi{, name}."
- `checkin_listening`: "Go ahead."
- `after_checkin_*`: "Checked in: {quadrant}."
- `unstick_offer`: "Pick a reason. I'll suggest a step."
- `focus_start`: "Timer running."
- `focus_end_got_going`: "Done."
- `focus_end_didnt_start`: "Done. Try a smaller step?"
- `bridge_start`: "Next event in {m} min."
- `breathing_invite`: "Breathe with the square."
- `celebration`: "Done."
- `wrap_start`: "Close the day: about 3 minutes."
- `wrap_end`: "Day closed."
- `shore_new_item`: "New item on your shore."
- `idle_tip`: "Tap me for a breathing exercise."

### Shared: Literal mode (any species)
- `greeting_*`: "Hello{, name}."
- `checkin_listening`: "Type what is happening. I will wait."
- `after_checkin_*`: "Your check-in is saved. State: {quadrant}."
- `unstick_offer`: "Choose why the task is hard. Then I will suggest one first step."
- `focus_start`: "The timer is running. I will stay on the screen."
- `focus_end_got_going`: "The focus block is finished."
- `focus_end_didnt_start`: "The focus block is finished. You can try a smaller step."
- `bridge_start`: "Your next event starts in {m} minutes."
- `breathing_invite`: "Breathe in for 4 seconds. Hold for 4 seconds. Breathe out for 4 seconds."
- `celebration`: "This was saved to your shore."
- `wrap_start`: "You can close the day now. It takes about 3 minutes."
- `wrap_end`: "The day is closed."
- `shore_new_item`: "A new item is on your shore."
- `idle_tip`: "Tap me to start a breathing exercise."

### Companion "About" text (Studio)
- **Pebble (otter):** "Sea otters often float together and hold onto each other so they don't drift apart. Pebble likes company, and keeps a favorite pebble close."
- **Lolo (axolotl):** "Axolotls come from the canals of Xochimilco in Mexico. They're famous for regrowing what they lose. Lolo thinks starting over is always allowed."
- **Capi (capybara):** "Capybaras are known for being calm and getting along with almost everyone. Capi never hurries, and thinks rest counts."
- **Zip (gecko):** "Geckos can climb walls thanks to the tiny pads on their toes. Zip believes in small, sticky steps."
- **Luma (jellyfish):** "Jellyfish drift with the current and some even glow. Luma speaks softly and doesn't need many words."
- **Shelby (hermit crab):** "Hermit crabs move into new shells as they grow. It's a big change every time. Shelby knows switching is hard, and does it anyway."

---

## Appendix C: Demo captions (exact strings)

Use exactly the captions written in Section 16.7 (full tour) and Section 16.9 (pitch). Store them in `src/demo/director/captions.ts` so they can be pre-generated as voice clips (`narrate: true` ones) and reviewed by the team. Keep each caption at 120 characters or fewer.

---

## Appendix D: Messages to paste into Claude Code

### D.1 Kickoff (paste once)

```
We're upgrading Tide to version 2. Read docs/TIDE_V2_UPGRADE_PROMPT.md
completely, then CLAUDE.md, docs/TIDE_BUILD_PROMPT.md, docs/AI_DEV_LOG.md
and docs/CODE_WALKTHROUGH.md, and look through the code before changing
anything.

The prime directive: add the new features without breaking anything that
works today. Voice dictation is frozen: do not change it at all.

Work through Phases V0 to V12 in order, without asking us to confirm
between phases. For every phase: re-read the listed sections and the code
you'll touch, write the "Before Phase V-n" log entry, build in order, run
lint, typecheck, all tests, the v1 regression suite and the build, exercise
the new features, fix everything that fails, write the "After Phase V-n"
entry, update AI_ATTRIBUTION.md, DECISIONS.md, CODE_WALKTHROUGH.md,
TEAM_TODO.md and CHANGELOG.md, commit on the v2-experience branch, and
continue.

Write code comments naturally, explaining why, never robotic or generic.
Write every log in the first person, in a natural voice, and keep it
honest that the code is AI-generated.

Only stop for the true blockers in Section 1.5. When V12 is done, merge to
main only if everything is green, then give us a short summary: what's
new, how to run the demo, and what's waiting for us in TEAM_TODO.md.
```

### D.2 Resume (if the session was interrupted)

```
We're resuming the Tide v2 upgrade. Read CLAUDE.md, then
docs/TIDE_V2_UPGRADE_PROMPT.md, then the end of docs/AI_DEV_LOG.md, and run
git status and git log --oneline on the v2-experience branch to see where
you stopped. Run all checks (including npm run test:v1 and the dictation
freeze test), finish or fix any half-done step, write a short "Resumed"
log entry, and continue through V12 without asking us to confirm phases.
```

### D.3 Feedback after user tests or partner research

```
We tested v2 with our Challenge Partner / users. Here's what we found:
1. ...
2. ...

Update the relevant sections of docs/TIDE_V2_UPGRADE_PROMPT.md first, so
the spec matches. Then implement the changes without breaking anything
(run test:v1 and the freeze test), add the before/after to
docs/research-to-design.md (only what we told you), write a "Changes from
research" log entry, update CHANGELOG.md and today's progress report, and
commit. Don't ask us to confirm; stop only for true blockers.
```

### D.4 Demo rehearsal bugs

```
During demo rehearsal we found:
1. Chapter <n>, step <id>: <what happened> → <what we expected>
2. ...

Reproduce each with a test or the demo debug panel (?demoDebug=1), fix
it, run the full tour and the pitch cut twice each, log the fixes, and
commit.
```

### D.5 Polish request

```
Do a polish pass on <screen or feature>. Look at it at 390px and 1280px,
in Lagoon, Midnight Tide, Coral Reef and Ink, at motion Off and Lively,
and at text size 150%. Fix spacing, alignment, timing and anything that
feels unfinished, without changing behavior. Log what you changed and
commit.
```

---

## Appendix E: Pitch notes for v2 (for the team)

- **One line:** "Tide plans for the brain you have right now, not the one your calendar assumes."
- **The design stance:** "Duolingo's delight, without Duolingo's guilt. No streaks, no lives, no leaderboards. The companion never gets sad when you don't open the app."
- **Why companions:** "They're co-regulation partners. Lolo breathes with you, works next to you like a study buddy, and gets ready with you before a transition. And if you prefer, there's no companion at all, or Luma, a jellyfish with no face, for people who find faces overwhelming."
- **Why the shore:** "Proof, not points. Every win becomes something you can see on a hard day, and nothing is ever taken away."
- **Why close the day:** "Ending the day well makes starting tomorrow easier. You leave yourself one thing and its first step, while you still remember the context."
- **Why no login:** "Your emotional data never leaves your device. Accounts and sync are on the roadmap for universities, with consent."
- **Inclusion highlights:** 15 themes including high contrast and low-sensory; motion Off/Calm/Lively; Literal mode, including for the companion; color-blind-safe states; natural voices; full keyboard and screen-reader support.
- **Demo tip:** open `/demo`, choose Presenter mode, and use a clicker (→ for next). Keep the backup video ready.
- **Likely questions:**
  - "Isn't a mascot childish for university students?" → "We tested it with our partner (fill in the result). That's why there's a sober option and a no-companion option, and why companions never use baby talk."
  - "How is this different from Finch?" → "Finch's pet grows when you complete goals, and it uses streaks. Tide's companion never depends on your productivity. It helps you regulate in the moment you're stuck or switching, and it's built around executive function, not habit tracking."
  - "Does the AI judge my day?" → "No. The summary uses only facts, has a list of forbidden judgment words, and falls back to a template if anything slips."

*End of document.*
