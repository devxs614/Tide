# TIDE — Master Build Prompt for Claude Code

> **Cómo usar este archivo (para el equipo, en español)**
>
> 1. Creen un repositorio público vacío en GitHub llamado `tide` y clónenlo en su computadora.
> 2. Guarden este archivo dentro del repo como `docs/TIDE_BUILD_PROMPT.md`.
> 3. (Recomendado) Creen el archivo `.env.local` en la raíz del repo con su clave: `ANTHROPIC_API_KEY=...`. Si no la ponen, la app se construye igual y funciona con las sugerencias de respaldo sin IA; la pueden agregar después.
> 4. Abran Claude Code en la carpeta del repo y peguen el **mensaje de arranque** del Apéndice C. Es un solo mensaje.
> 5. Claude Code construirá **toda la aplicación de principio a fin, en orden y sin pedirles confirmación entre fases**. Antes de cada parte relee la sección correspondiente, escribe qué entendió en la bitácora, construye, prueba, corrige, registra y hace commit. Luego sigue con la siguiente parte.
> 6. Claude Code escribe todas las bitácoras que piden las reglas: la bitácora de desarrollo con IA, `AI_ATTRIBUTION.md`, los borradores de reportes de avance diarios, la página para el PDF de prompts y una guía del código para que ustedes puedan explicarlo en la revisión y en el Q&A. Todo en primera persona, con voz natural, y siempre honesto sobre qué hizo la IA.
> 7. Hay cosas que solo ustedes pueden hacer: entrevistas y pruebas con el Challenge Partner, verificar los números de las líneas de crisis, poner la clave en Vercel, grabar el video de respaldo y ensayar el pitch. Claude Code las deja listadas en `docs/TEAM_TODO.md`.
> 8. Si la sesión se interrumpe (límite de uso, cierre de la terminal), abran Claude Code otra vez y peguen el **mensaje de reanudación** del Apéndice C. Claude retomará desde la bitácora sin repetir trabajo.
> 9. Los prompts de IA (sección 10), la biblioteca de estrategias (sección 9) y la lista de palabras de seguridad (sección 11) son borradores razonables. Revísenlos con su socio cuando puedan; si cambian algo, díganselo a Claude Code con el mensaje de iteración del Apéndice C.
> 10. Si algo de este documento contradice lo que encuentren con su Challenge Partner, gana la investigación.

---

## 0. How to read this document (for Claude Code)

You are reading the complete specification for **Tide**, a web application built for a team of 4–5 university students competing in the **North American AI Challenge for Neurodiverse Learning 2026** (Spark Center for Innovation in Learning, in collaboration with Enterprise Technology at Arizona State University). The team presents at the **Launchpad Monterrey** at Tecnológico de Monterrey on **Saturday, November 7, 2026**. All code and deliverables are due **Thursday, November 5, 2026 at 11:59 p.m.** Today is **Wednesday, October 28, 2026**.

**Your assignment is to build the entire application, end to end, in one continuous, orderly run.** The organizers have confirmed that the code may be fully AI-generated. Every other rule still applies, including honest AI attribution, AI usage logs, a public repository without secrets, English materials and an AI Prompts PDF. You will produce those logs yourself, as you go.

The team will not confirm each phase. Do not stop to ask "should I continue?". Work through the phases in Section 18 in the exact order given, and inside each phase follow the cycle in Section 1.3: **understand → plan → build → verify → fix → log → commit → continue**. Stop only when the final audit (Phase 10) is complete and every item in the Definition of Done (Section 19) is checked, or when you hit one of the rare true blockers listed in Section 1.5.

This document is long on purpose. It is meant to remove guesswork. Read all of it once before writing any code. Then, before each phase, re-read the sections that phase lists. Do not rely on your memory of a section you read an hour ago; re-read it. Every section is normative unless it says "optional" or "nice to have". When this document is silent, choose the simplest option that respects the principles in Sections 1–3, and record the decision in the decision log (Section 17.4).

Section map:

1. Your role, the autonomous working protocol, and how to write comments
2. Non-negotiable rules (competition, ethics, safety, privacy)
3. Product context: problem, thesis, user, differentiation
4. Tech stack
5. Repository structure
6. Design system
7. Accessibility requirements
8. Data model and persistence
9. Domain content: emotion vocabulary, task types, strategy library
10. AI layer: routes, schemas, prompts, fallbacks
11. Safety layer
12. Pattern engine
13. Screens and flows (full specification)
14. Demo mode, clock, seed data, cached responses
15. PWA and performance
16. Testing and QA
17. Documentation and logs (AI attribution, AI development log, progress reports, code walkthrough, team to-do)
18. The ordered build plan (Phases 0–10), with steps and acceptance criteria
19. Definition of done
20. Appendices: copy catalog, log templates, kickoff and resume messages, pitch Q&A notes

---

## 1. Your role and the working protocol

### 1.1 Your role

You are the senior full-stack engineer and accessibility-minded product designer on this team. You are responsible for building a **complete, working, demo-ready** version of Tide that:

- runs reliably in a browser on a phone and on a laptop connected to a projector,
- demonstrates the core loop in about 100 seconds (Section 14.3),
- implements every module, screen and behavior in this document, not a subset,
- is clean, readable and well commented, so the students can explain it to judges and code reviewers,
- documents every AI-generated part honestly, in the logs described in Section 17.

The students own the product, the research and the pitch. You own the implementation. Build it the way a careful senior engineer would if they were told: "We need all of it, it has to work on stage, and the team has to be able to explain it."

### 1.2 Mindset

- **Complete over clever.** A plain implementation of every feature beats a brilliant implementation of half of them. Never leave a feature as a stub, a TODO or a "coming soon" placeholder and call it done.
- **Reliable over impressive.** The judges score a live demo. Every AI feature needs a fallback. Every flow must survive a bad network.
- **Understand before you build.** For each part, make sure you can explain in two sentences what it is for, how it connects to the core loop (Section 3.7), and what "done" looks like, before you write code. Write that down in the AI development log (Section 17.3). If you cannot explain it, re-read the spec sections until you can.
- **Verify, don't assume.** A feature is done when its acceptance criteria pass, the checks are green, and you have exercised it, not when the code compiles.
- **Honest records.** The logs are part of the submission. They must be accurate: what you built, what you decided, what is missing, what broke and how you fixed it.

### 1.3 The phase cycle (repeat for every phase, without waiting for anyone)

For each phase in Section 18, in order:

1. **Understand.** Re-read the sections listed under "Read first" for that phase. Answer, in a short log entry titled "Before Phase N", these questions in your own words:
   - What is this part for, from Maya's point of view?
   - Where does it sit in the core loop, and what does it read from or write to?
   - Which earlier pieces does it depend on, and are they really done?
   - What are the acceptance criteria I must meet?
   - What could go wrong (edge cases, accessibility, offline, AI failure)?
2. **Plan.** Create or update your task list with the concrete steps of the phase (the "Build steps" in Section 18 are the starting point; split them further if helpful).
3. **Build.** Implement the steps in the given order. Keep files small. Write natural comments (Section 1.7) as you go, not afterwards.
4. **Verify.** Run `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build`. Then exercise the feature: run the dev server and, if a browser tool is available to you, click through the flow; if not, write a component or integration test that walks the flow. Check every acceptance criterion for the phase one by one.
5. **Fix.** If anything fails, fix it now. Do not move on with red checks. If something cannot be fixed after a real effort, record it honestly in the log as a known issue, choose the most reliable fallback behavior, and continue.
6. **Log.** Append the "After Phase N" entry to `docs/AI_DEV_LOG.md` (template in Appendix B), add or update rows in `AI_ATTRIBUTION.md`, add any decisions to `docs/DECISIONS.md`, add anything only humans can do to `docs/TEAM_TODO.md`, and update the code walkthrough (`docs/CODE_WALKTHROUGH.md`) for the files you created.
7. **Commit.** Commit the phase with the message convention in Section 1.6. If a remote named `origin` exists and pushing works without asking for credentials, push. If pushing fails, keep committing locally and note it in `docs/TEAM_TODO.md`.
8. **Continue.** Go straight to the next phase. Do not wait for approval.

Also write one **daily progress report draft** per calendar day on which you work (Section 17.5), and one before the final audit.

### 1.4 Order and dependencies

The phases are ordered so that each one only depends on finished work:

- Phase 0 builds the foundation (tooling, tokens, shell, data layer, content, docs scaffolding).
- Phase 1 builds the AI plumbing and the safety layer, because every later feature uses them.
- Phases 2–7 build the product features in the order of the core loop.
- Phase 8 builds demo mode and seed data, which need every feature to exist.
- Phase 9 builds the submission documents.
- Phase 10 is a full audit against every acceptance criterion and the Definition of Done, fixing whatever is missing.

Never jump ahead. If a later phase needs a small helper early, build the helper in the current phase and note it in the log.

### 1.5 When you may stop (rare true blockers)

Stop and write a clear message to the team only if:

- the environment cannot install packages or run Node at all, or
- a decision would delete or overwrite work the team created by hand (for example, existing files in the repo that are not yours), or
- the spec is internally contradictory in a way that changes the product and you cannot resolve it from Sections 1–3.

Everything else is not a blocker:

- **No API key in `.env.local`:** build everything; the AI routes return `missing_key` and the app uses the deterministic fallbacks. Test the AI path with mocked responses. Note in `docs/TEAM_TODO.md` that the key must be added locally and in Vercel.
- **No browser tool:** verify with tests and `next build`; describe manual checks for the team in `docs/TEAM_TODO.md`.
- **Deployment needs a team account:** prepare everything (Section 18, Phase 9) and leave exact deployment steps in `docs/TEAM_TODO.md`.
- **Unclear small detail:** decide, log the decision, continue.

### 1.6 Commit message convention

Commit at the end of every phase (and more often for large phases, e.g. after each screen). Format:

```
<type>(<scope>): <summary in plain English, present tense>

<1–3 lines on what changed and why, in natural language>

AI-Generated: Claude Code
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`. Scopes: `base`, `checkin`, `tasks`, `unstick`, `focus`, `today`, `daymode`, `bridge`, `toolkit`, `patterns`, `proof`, `settings`, `safety`, `ai`, `demo`, `pwa`, `docs`, `audit`.

Example:

```
feat(checkin): add the mood map with drag and keyboard support

The dot can be dragged or moved with arrow keys, and there's a slider
fallback for anyone who finds dragging awkward.

AI-Generated: Claude Code
```

### 1.7 How to write code comments (important)

The judges and code reviewers will read this code. The students will use the comments to understand it. Comments must sound like a thoughtful teammate wrote them: natural, specific, plain, and focused on *why*. Never robotic, never generic, never filler.

**Rules:**

- Every file starts with a short header comment (2–5 lines) that says what the file is for and how it fits into Tide, in natural sentences.
- Comment the *why*, the trade-off, or the user-facing reason. Do not narrate what the next line obviously does.
- Mention the user when it matters ("Maya", "someone who freezes at a blank page", "a screen reader user") so the reason is concrete.
- Keep comments short. If a comment needs more than ~6 lines, the explanation belongs in `docs/CODE_WALKTHROUGH.md`.
- No boilerplate phrases: never write "This function handles…", "Utility function for…", "Helper to…", "This component renders…", "TODO: implement", "Initialize variables", "Import dependencies", "Main logic here".
- No emojis, no ASCII art, no shouting in caps.
- Comments are in English.
- Don't comment every line. Many small, well-named functions need no comment at all.

**Bad (do not write like this):**

```ts
// This function handles the quadrant calculation.
// It takes energy and pleasantness and returns a quadrant.
export function toQuadrant(energy: number, pleasantness: number): Quadrant {
  // Check if energy is high
  const high = energy >= 0;
```

**Good:**

```ts
// Turns the two mood-map numbers into one of Tide's four states.
// Zero counts as "high" and "pleasant" on purpose: a neutral check-in
// shouldn't land someone in Ebb and trigger a lighter-day suggestion.
export function toQuadrant(energy: number, pleasantness: number): Quadrant {
  const high = energy >= 0;
```

**Bad:**

```ts
// Timer component
// Uses useEffect to update the time
```

**Good:**

```ts
// We compute remaining time from timestamps instead of counting ticks.
// Phones throttle background tabs, so a tick counter drifts; the clock doesn't.
```

**Bad:**

```ts
// Validate the output
const parsed = LabelOutput.safeParse(json);
```

**Good:**

```ts
// The model sometimes adds a fourth emotion or invents one that isn't in
// our list. Zod catches the shape; the check below catches made-up words.
const parsed = LabelOutput.safeParse(json);
```

**Header example (good):**

```ts
// The "Unstick" sheet: what Maya sees after she moves a task to Stuck.
// It asks why the task feels hard, then offers one small first step that
// fits how she feels right now. If the AI is slow or off, the built-in
// step table in lib/ai/fallbacks.ts answers instead, so this never blocks.
```

The same voice applies to test names (`it('keeps a pattern hidden until we have seen it at least three times')`) and to commit messages.

### 1.8 Quality bar for code

- TypeScript `strict`, no `any` except at untyped library boundaries (and then explain why in a comment).
- Small files (aim under ~200 lines), one component per file, plain names.
- No clever abstractions, metaprogramming or deep generic types. A second-year student should be able to follow every file.
- All user-facing strings come from `src/copy/en.ts`.
- All times come from `now()` in `src/lib/clock.ts`.
- All colors come from tokens; no raw hex in components.
- All writes to the database go through `src/lib/repo/*`.
- No `console.log` left in committed code, except deliberate server logs described in Section 10.1.

### 1.9 Other working rules

1. **Never invent facts in UI copy.** No fake statistics, testimonials or institutional endorsements. Synthetic demo data is labeled as such in the app.
2. **Keep the app in English.** All UI copy is English (official competition language). Keep all copy in the central catalog so a Spanish version can be added later.
3. **Verify library APIs.** Before using an API you are unsure about (Next.js, Dexie, shadcn/ui, the Anthropic SDK, dnd-kit), check the installed version's types or docs. Do not rely on memory for APIs that change often.
4. **Manage your context.** This is a long build. Keep `docs/AI_DEV_LOG.md` and your task list current so that, if the session is interrupted, you (or a new session) can resume from the log. Re-read spec sections instead of relying on memory.
5. **Do not ask the team to confirm phases.** Only the blockers in 1.5 justify stopping.

---

## 2. Non-negotiable rules

These come from the official challenge handbook and from basic ethics. Breaking any of them can disqualify the team or harm users.

### 2.1 Competition rules that affect code

- **AI-generated code is allowed.** The organizers have confirmed that the whole codebase may be generated with AI. That is why you are building everything. The code review (November 7–9) still checks **structure, readability, documentation and attribution**, and the team must still be able to explain the system in Q&A. So: keep code simple, comment it naturally (Section 1.7), and write `docs/CODE_WALKTHROUGH.md` so the students can explain any file.
- **Attribution.** The repository must explicitly cite external libraries, code snippets from other sources, and AI-generated code. Maintain `AI_ATTRIBUTION.md` (Section 17.2) as you go: every file you create gets a row. Be accurate: if you generated it, say so.
- **AI usage logs.** Keep `docs/AI_DEV_LOG.md` (Section 17.3) current at every phase, and draft the daily progress reports (Section 17.5). Write them in the first person, in a natural voice, and keep them truthful.
- **Daily progress reports.** The handbook requires daily progress reports until November 5. You draft them in `docs/progress/`; the team submits them.
- **Originality.** All work must be original for this event. Do not copy code from existing open-source apps of the same kind. Standard library usage and documented examples are fine and must be cited when non-trivial.
- **Public repository, no secrets.** The repository is public. Never put API keys, tokens or private data in code, commits, comments, test fixtures or logs. Use `.env.local` (git-ignored) and provide `.env.example` with placeholders.
- **No private partner data.** Never hardcode real names, quotes or data from the Challenge Partner or interview participants. The demo persona "Maya" is fictional.
- **English.** All submitted materials and the app UI are in English.
- **Working MVP.** The judges score a live demo. Reliability beats feature count.

### 2.2 Product ethics (Responsible AI checklist from the handbook)

- **Purpose.** AI is used only where it does something a fixed rule cannot: interpreting free language, adapting a next step to a specific task and state, and explaining patterns in plain words.
- **Autonomy.** The user always chooses. AI never tells the user what they feel; it offers options. AI never changes the plan, tasks or settings without explicit confirmation. Every suggestion can be dismissed, corrected or turned off.
- **Privacy.** Data is stored locally on the device (IndexedDB). The server only relays minimal text to the AI provider and does not store or log user text. No accounts, no analytics, no third-party trackers, no diagnosis fields.
- **Bias and limits.** Patterns are shown only with enough evidence (n ≥ 3), always with "k of n" and a confidence indicator, and can be marked "Not true for me". AI outputs are framed as suggestions.
- **Accessibility.** See Section 7. It is not optional.
- **Human support.** The safety layer (Section 11) stops all AI coaching when crisis language appears and routes to human resources. "Talk to a person" is always reachable.
- **Not a medical product.** Tide does not diagnose, treat or replace professionals. Say this in onboarding and settings. Never use clinical labels about the user.

### 2.3 Things you must NOT build

- No login, accounts, passwords or user database on a server.
- No analytics, telemetry, session recording or third-party scripts.
- No streaks, points, leaderboards, badges that can be lost, or "you failed" messages.
- No red error states for tasks or overdue items. No alarming colors or sounds.
- No automatic sending of messages, emails or calendar invites. Templates can be copied; the user sends them.
- No storage of check-in text on the server, and no server-side logging of request bodies.
- No dark patterns: no guilt-based nudges, no fake urgency, no hidden opt-outs.
- No emojis in UI copy (they are inconsistently read by screen readers and can be ambiguous for some users). Icons always carry a text label.

---

## 3. Product context

### 3.1 One-liner

**Tide plans for the brain you have right now, not the one your calendar assumes.**

### 3.2 The problem

Neurodivergent college students (ADHD, autism, dyslexia and related differences) rarely fail at *planning*. They get stuck at two specific moments:

1. **Starting** a task (task initiation), and
2. **Switching** between activities (transitions).

At those moments, their emotional state decides whether they can act. Existing tools separate the two worlds: mood apps help you name feelings but do not touch your tasks; planners organize tasks but ignore how you feel right now. No tool connects *how I feel* to *what I can realistically do next*, and none learns which regulation strategies work for *this* person before *this kind* of task.

### 3.3 Thesis

**Emotional regulation is the hidden executive function.** The challenge handbook defines executive function as the skills used to plan, focus, remember steps, switch tasks, regulate effort and manage daily transitions. Tide works exactly where emotion and executive function collide.

Two research anchors used in the pitch (do not put statistics in the UI):

- Alexithymia (difficulty identifying and naming one's own emotions) was found in roughly half of autistic participants in a 2019 meta-analysis (Kinnaird, Stewart & Tchanturia), versus under 5% of controls. A fixed "how do you feel?" quiz does not serve these users; free language plus body-based prompts do.
- Leading clinical models of executive function in ADHD include managing frustration and modulating emotion as part of executive function.

### 3.4 Users

- **Primary user:** university students aged 18–24, first or second year, neurodivergent, living the high-school-to-university transition (less external structure, variable schedules).
- **Paying customer (business model):** university inclusion, accessibility and wellbeing offices; executive-function coaches; transition programs like the team's Challenge Partner.

### 3.5 Demo persona (fictional)

**Maya, 19**, first-year engineering student, ADHD, under evaluation for autism. She struggles to name feelings until she "explodes". Tue/Thu she has chemistry lab followed by calculus, and the switch out of lab often goes badly. Writing tasks are her hardest to start. She has abandoned Notion, paper planners and phone reminders after about two weeks each.

### 3.6 Differentiation

- **How We Feel** (Yale Center for Emotional Intelligence): precise emotion words and mood patterns, but no connection to tasks or transitions.
- **Tiimo**: AI co-planner, visual schedule, focus timer, mood tracking, but plans are not conditioned on the current emotional state and it does not learn which regulation works before which task.
- **Goblin Tools (Magic ToDo)**: AI task breakdown, the same regardless of how you feel.
- **Tide**: a closed loop — state → adapted next step → regulation at the transition → outcome → personal learning.

Pitch sentence: *Other apps track your mood or plan your day. Tide connects the two, at the exact moment you get stuck, and learns what actually works for you.*

### 3.7 The core loop (the product in one picture)

```
1 NAME IT (check-in)  →  2 ADAPT (Day Mode, Unstick)  →  3 BRIDGE (Close · Shift · Start)
        ↑                         ↑                                   ↓
        |                         └──── 6 LEARN (patterns) ←── 5 RE-CHECK ←── 4 REGULATE (toolkit)
```

Every feature must serve this loop. If a feature does not feed or use the loop, it is out of scope for the MVP.

### 3.8 Modules

| ID | Module | Purpose |
|----|--------|---------|
| M1 | Check-in "Name it" | Free text or voice → AI proposes emotions → user chooses; wordless body path |
| M2 | Tasks + Unstick + Focus block | 4-state board incl. "Stuck"; state-aware first step; adaptive focus timer |
| M3 | Today + Tide Line + Day Modes | Day timeline; Full / Gentle / Minimum plan with user confirmation |
| M4 | Bridge | Transition coach: parking note, short regulation, next-step prep, after-rating |
| M5 | Toolkit | Strategy library by family and quadrant, interactive mini-tools, re-check |
| M6 | Patterns | Deterministic pattern engine + AI narration + "Why am I seeing this?" + "Not true for me" |
| M7 | Proof log | Wins without points or streaks; surfaced when the user feels low |
| — | Safety, Settings, Onboarding, Support | Crisis routing, preferences, privacy, human help |

---

## 4. Tech stack

Use the latest stable versions at install time unless a version is stated. Check the installed version's documentation for APIs.

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** with **TypeScript** (`strict: true`) | `src/` directory, `@/*` import alias |
| Styling | **Tailwind CSS** | Map design tokens to CSS variables (Section 6) |
| UI primitives | **shadcn/ui** (Radix-based) | Only the components we need: Button, Dialog/Sheet, Tabs, Switch, Slider, Toast, Tooltip, RadioGroup, Checkbox, DropdownMenu |
| Icons | **lucide-react** | Always paired with visible text |
| Animation | **framer-motion** | Must respect reduced motion (Section 6.6) |
| Local data | **Dexie** + **dexie-react-hooks** | IndexedDB, local-first |
| Validation | **zod** | All AI I/O and all API route inputs |
| AI provider | **@anthropic-ai/sdk** | Server-side only, in route handlers |
| IDs | `crypto.randomUUID()` | No extra dependency |
| Dates | Native `Date` + small helpers in `src/lib/time.ts` | Avoid heavy date libraries; if needed, `date-fns` only |
| Tests | **Vitest** (+ `@testing-library/react` for a few components, `fake-indexeddb` for DB tests) | Pattern engine must be well tested |
| Lint/format | ESLint (Next config) + Prettier | Add `typecheck` script: `tsc --noEmit` |
| Fonts | **Atkinson Hyperlegible** via `next/font/google` | Self-hosted by Next at build |
| Deploy | **Vercel** | Environment variables set in the Vercel dashboard |

### 4.1 Environment variables

`.env.example` (commit this file):

```
# Server-side only. Never expose to the client. Never commit real values.
ANTHROPIC_API_KEY=your-key-here

# Model identifiers (keep configurable)
TIDE_MODEL_FAST=claude-haiku-5-5
TIDE_MODEL_SMART=claude-sonnet-5-5

# Request timeouts in milliseconds
TIDE_AI_TIMEOUT_MS=8000
TIDE_AI_DEMO_TIMEOUT_MS=4000

# Simple per-IP rate limit for the public deployment
TIDE_RATE_LIMIT_MAX=40
TIDE_RATE_LIMIT_WINDOW_MS=600000
```

Rules:

- Never prefix the API key with `NEXT_PUBLIC_`.
- `src/lib/ai/client.ts` must throw a clear server-side error if `ANTHROPIC_API_KEY` is missing, and the client must then fall back gracefully (Section 10.6).
- `.gitignore` must include `.env*.local`, `.env`, `.vercel`, `node_modules`, `.next`, `coverage`.

### 4.2 npm scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "format": "prettier --write ."
}
```

---

## 5. Repository structure

Create this structure progressively (only what each phase needs), but keep these names:

```
tide/
├── CLAUDE.md                      # Project rules for Claude Code (short version of this doc)
├── AI_ATTRIBUTION.md              # Every AI-generated file, external libraries and sources
├── LICENSE                        # MIT
├── README.md                      # What Tide is, how to run it, architecture, team roles
├── .env.example
├── docs/
│   ├── TIDE_BUILD_PROMPT.md       # This document
│   ├── AI_DEV_LOG.md              # AI development log, first person, every phase (Section 17.3)
│   ├── DECISIONS.md               # Decisions taken where the spec was silent (Section 17.4)
│   ├── CODE_WALKTHROUGH.md        # File-by-file guide so the team can explain the code (Section 17.6)
│   ├── TEAM_TODO.md               # Things only humans can do (Section 17.7)
│   ├── architecture.md            # Short architecture overview with a diagram (Phase 9)
│   ├── demo-script.md             # The 100-second demo, step by step, with fallback plan (Phase 8)
│   ├── research-to-design.md      # Template the team fills with partner findings (Phase 9)
│   └── progress/                  # Daily progress report drafts, one file per day (Section 17.5)
│       └── 2026-10-28.md
├── prompts/                       # Source of truth for the AI Prompts PDF
│   ├── 00-shared-preamble.md
│   ├── 01-label.md
│   ├── 02-unstick.md
│   ├── 03-daymode.md
│   ├── 04-bridge.md
│   └── 05-narrate.md
├── public/
│   ├── manifest.webmanifest
│   └── icons/                     # App icons (simple original wave mark)
└── src/
    ├── app/
    │   ├── layout.tsx             # Fonts, providers, theme, app shell
    │   ├── globals.css            # Tokens as CSS variables
    │   ├── (app)/                 # Routes with bottom tab bar
    │   │   ├── layout.tsx
    │   │   ├── page.tsx           # Today
    │   │   ├── tasks/page.tsx
    │   │   ├── toolkit/page.tsx
    │   │   ├── toolkit/[id]/page.tsx
    │   │   ├── patterns/page.tsx
    │   │   ├── proof/page.tsx
    │   │   ├── settings/page.tsx
    │   │   └── support/page.tsx
    │   ├── focus/[taskId]/page.tsx    # Full-screen focus block (no tab bar)
    │   ├── onboarding/page.tsx
    │   ├── prompts-doc/page.tsx       # Print-friendly page to export the AI Prompts PDF
    │   └── api/ai/
    │       ├── label/route.ts
    │       ├── unstick/route.ts
    │       ├── daymode/route.ts
    │       ├── bridge/route.ts
    │       └── narrate/route.ts
    ├── components/
    │   ├── shell/                 # TabBar, CheckInFab, TopBar, PhoneFrame
    │   ├── checkin/               # CheckInSheet, StepWhat, StepHearing, StepBehind, StepNeed, BodyPath, MoodMap, EmotionCandidateCard
    │   ├── tasks/                 # TaskBoard, TaskCard, TaskForm, UnstickSheet, StateColumn
    │   ├── focus/                 # FocusTimer, WaterFill, FocusOutcome
    │   ├── today/                 # TodayHeader, StateCard, DayModeBanner, DayModeSheet, TideLine, NextTransitionCard
    │   ├── bridge/                # BridgeCard, BridgeSheet, ParkingNote, TransitionRating
    │   ├── toolkit/               # StrategyCard, StrategyRunner, ReCheck, tools/ (BoxBreathing, Grounding54321, Sudoku4x4, DoodleCanvas, WalkTimer, BrainDump, MessageTemplate, StepsTimer)
    │   ├── patterns/              # PatternCard, WhyPanel, PeriodDots, TopStrategies, TransitionsSummary
    │   ├── proof/                 # WinItem, WinCard, RewardsList
    │   ├── safety/                # CrisisScreen, TalkToAPersonButton
    │   └── ui/                    # shadcn/ui generated primitives + StateChip, ConfidenceDots, EnergyDots, ReadAloudButton
    ├── copy/
    │   └── en.ts                  # ALL user-facing strings
    ├── data/
    │   ├── emotions.ts            # 48-word vocabulary with coordinates and definitions
    │   ├── strategies.ts          # Strategy library
    │   ├── taskTypes.ts
    │   ├── resources.ts           # Crisis lines and support resources
    │   └── demo/
    │       ├── seed.ts            # Deterministic 3-week synthetic history
    │       └── cachedResponses.ts # AI responses for the scripted demo
    ├── lib/
    │   ├── db.ts                  # Dexie database
    │   ├── types.ts               # Domain types
    │   ├── clock.ts               # now() with demo clock support
    │   ├── time.ts                # Date helpers
    │   ├── quadrant.ts            # Energy/pleasantness → quadrant
    │   ├── settings.tsx           # Settings provider + hook
    │   ├── speech.ts              # Web Speech API helpers (dictation, read aloud)
    │   ├── ai/
    │   │   ├── client.ts          # Server-only Anthropic client + callJson()
    │   │   ├── schemas.ts         # zod schemas for every route
    │   │   ├── prompts.ts         # Loads prompt text (mirrors /prompts)
    │   │   ├── fallbacks.ts       # Deterministic fallbacks per route
    │   │   ├── rateLimit.ts
    │   │   └── useAi.ts           # Client hook: call route, timeout, fallback, demo cache
    │   ├── safety/
    │   │   ├── keywords.ts
    │   │   └── detect.ts
    │   ├── patterns/
    │   │   ├── engine.ts
    │   │   ├── rules/strategyBeforeTask.ts
    │   │   ├── rules/hardTransition.ts
    │   │   ├── rules/stateTaskStart.ts
    │   │   ├── rules/strategyEffect.ts
    │   │   ├── confidence.ts
    │   │   └── __tests__/
    │   ├── daymode.ts             # Deterministic recommendation + fallback plan
    │   ├── bridge.ts              # Find upcoming transitions
    │   └── wins.ts                # Create wins from events
    └── test/
        └── setup.ts
```

---
## 6. Design system

### 6.1 Visual principles

Tide should feel like **calm water**: generous white space, soft color, no alarms, one decision per screen. The tide metaphor (energy rises and falls, and that is okay) guides names, color and motion. **Instructions are always literal**, even when names are metaphorical. Never rely on color alone to convey meaning: every colored element also has text or an icon with a label.

### 6.2 Color tokens

Define all tokens as CSS variables in `globals.css` and map them in `tailwind.config` (e.g. `bg-bg`, `text-ink`, `bg-surface`, `border-line`, `bg-primary`). Never use raw hex values in components.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F7F5F0` | `#12181C` | App background (warm off-white, less glare than pure white) |
| `--surface` | `#FFFFFF` | `#1B2328` | Cards, sheets |
| `--surface-2` | `#F0EDE6` | `#222B31` | Subtle sections, inputs |
| `--ink` | `#1F2A33` | `#E8ECEF` | Primary text |
| `--ink-soft` | `#5B6770` | `#A3AEB6` | Secondary text |
| `--primary` | `#1F5C63` | `#6FB8BF` | Primary buttons, links, focus |
| `--on-primary` | `#FFFFFF` | `#12181C` | Text on primary |
| `--line` | `#E2DED6` | `#2A343A` | Borders, dividers |
| `--focus` | `#1F5C63` | `#9AD6DC` | Focus ring (3px) |
| `--notice` | `#8A6D1F` | `#E5C46B` | Neutral notices (never red) |

### 6.3 Quadrant tokens (Tide's own vocabulary)

Tide uses its own state names and colors. They are inspired by the circumplex model of emotion (energy × pleasantness) and Yale's RULER framework, but **must not copy the Mood Meter's names or visual design**. In code comments and the README, credit: "Inspired by the circumplex model of emotion and Yale's RULER framework. Tide is not affiliated with Yale."

| Quadrant key | Display name | Energy / pleasantness | Base color | Tint (backgrounds) | Text on tint |
|---|---|---|---|---|---|
| `surge` | Surge | High / unpleasant | `#E8836A` | base at 16% opacity | `--ink` |
| `swell` | Swell | High / pleasant | `#F0B64C` | base at 18% opacity | `--ink` |
| `ebb` | Ebb | Low / unpleasant | `#6E8DAF` | base at 16% opacity | `--ink` |
| `still` | Still | Low / pleasant | `#7DB59F` | base at 18% opacity | `--ink` |

Rules:

- Never put white text on quadrant colors (amber fails contrast). Use `--ink` on tints.
- Quadrant color appears as a dot, a left border, or a tint, always with the quadrant name or emotion word in text.
- In dark mode, keep the base colors but use tints at 22–26% opacity on `--surface`.

Quadrant computation (`src/lib/quadrant.ts`): energy and pleasantness are integers from −5 to 5.

```ts
export function toQuadrant(energy: number, pleasantness: number): Quadrant {
  const high = energy >= 0;          // 0 counts as "high" energy by convention
  const pleasant = pleasantness >= 0; // 0 counts as "pleasant" by convention
  if (high && !pleasant) return 'surge';
  if (high && pleasant) return 'swell';
  if (!high && !pleasant) return 'ebb';
  return 'still';
}
```

### 6.4 Typography

- Font: **Atkinson Hyperlegible** (400 and 700) via `next/font/google`, as the only font family. Fallback: system-ui.
- Base size **17px** (`html { font-size: 106.25%; }` or set root to 17px), line-height **1.6**, left aligned, never justified.
- Scale: caption 14px, body 17px, lead 19px, h3 20px, h2 22px, h1 28px, display 34px (timer numbers only).
- Max line length: **60ch** for paragraphs.
- Text scale setting multiplies the root size: 100%, 115%, 130%, 150%.
- Letter-spacing setting: normal or `0.04em` extra; word-spacing `0.08em` extra when enabled.
- Never use all-caps for more than two words. Never use italics for long text.

### 6.5 Spacing, shape, elevation

- Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 40, 48. Default screen gutter: 20px. Gap between cards: 12px.
- Radius: cards and sheets **16px**; inputs **12px**; chips and pill buttons **999px**.
- Elevation: flat. Cards use a 1px `--line` border; sheets use a very soft shadow `0 -4px 24px rgb(0 0 0 / 0.06)`. No gradients except the water fill in the focus timer.
- Touch targets: minimum **48 × 48px**, with at least 8px between adjacent targets.
- App container: mobile-first, `max-width: 430px`, centered on larger screens, with the area outside the container in `--surface-2`. On screens ≥ 1024px, the Tasks board may expand to a 4-column layout up to 1100px (Section 13.5).

### 6.6 Motion

- Durations 200–600ms, easing `easeOut` or gentle springs (`stiffness ≤ 200`, `damping ≥ 25`). No bounces, no shakes, no flashing.
- **Reduced motion:** if the OS prefers reduced motion or the user enables "Reduce motion" in Settings, disable all non-essential animation: transitions become instant opacity changes, the water fill becomes a static progress bar, the breathing square becomes a text countdown. Implement one helper `useReducedMotionPref()` that combines both signals and use it everywhere.
- No auto-playing sound. Vibration (`navigator.vibrate`) only when the user enables "Gentle vibration" and only at the end of timers.

### 6.7 Components (visual spec)

**StateChip** — pill, height 32px, padding 0 12px, tint background of the quadrant, 10px dot in base color, text: `"{Quadrant} · {Emotion1}, {Emotion2}"` (e.g. "Ebb · Drained, Frustrated"). Optional time suffix in `--ink-soft`: "· 3:40 pm". Accessible name: "Current state: Ebb. Feelings: drained, frustrated. Checked in at 3:40 pm."

**MoodMap** — square, width 100% up to 320px. Four quadrants as faint tints with their names in the corners (Swell top-right, Surge top-left, Ebb bottom-left, Still bottom-right). Axis labels in `--ink-soft`: top "More energy", bottom "Less energy", left "Unpleasant", right "Pleasant". A 28px draggable dot in `--ink` with a 3px `--surface` outline. Keyboard: arrow keys move the dot by 1 unit; the dot has `role="slider"`-like semantics implemented as two linked sliders (energy, pleasantness) visually merged; announce "Energy 2, pleasantness minus 3, Surge". Provide a "Use sliders instead" toggle that shows two standard sliders.

**EmotionCandidateCard** — card, left border 6px in quadrant color, emotion word at 22px bold, one-line definition at 15px `--ink-soft`, a circular checkbox on the right (48px target). Selected state: tint background + check icon + "Selected" in accessible name. Max two selected; trying a third shows a neutral toast "You can pick up to two."

**TaskCard** — card with title (17px bold, wraps to 2 lines), type label with icon (e.g. "Writing"), energy dots `●●○` with accessible text "Energy cost 2 of 3", due text ("Due tomorrow", "Due Fri"), and a "⋯" menu with "Move to…". In "In progress" column it shows a secondary button "I'm stuck". Cards in "Stuck" show the stuck reason if known.

**BridgeCard** — tall card, header row "Lab → Calculus" + countdown "leave in 8 min" (live-updating every 30s), optional pattern line, then three numbered blocks: 1 Close, 2 Shift, 3 Start (Section 13.8).

**StrategyCard** — card with family icon, name (17px bold), duration ("2 min"), sensory badges ("Quiet", "Moves body", "Screen"), and when available "Worked for you 3 of 4 times".

**PatternCard** — card with statement (19px), meta line "4 of 5 times · last 4 weeks", ConfidenceDots (●●●○ with text "Confidence 3 of 4"), and two text buttons: "Why am I seeing this?" (expands WhyPanel) and "Not true for me".

**CheckInFab** — 64px round button centered above the tab bar, `--primary` background, wave icon + label "Check in" below or inside (label must be visible, not only an icon).

**TabBar** — four tabs: Today, Tasks, Toolkit, Patterns. Icon + label, 64px tall, safe-area inset padding at the bottom. Active tab: `--primary` text and a 3px top indicator.

**ReadAloudButton** — small text button "Read aloud" with speaker icon; reads the associated text via `speechSynthesis`. Present on every AI-generated card.

---

## 7. Accessibility requirements

Target **WCAG 2.2 AA** throughout. Lighthouse accessibility score must be ≥ 95 on Today, Tasks, Check-in and Patterns.

### 7.1 Global

- Semantic HTML first: `button` for actions, `a` for navigation, headings in order, `main`, `nav`, landmarks.
- Visible focus ring on every interactive element: 3px `--focus` outline with 2px offset. Never remove outlines.
- All functionality available by keyboard. Drag-and-drop always has a non-drag alternative ("Move to…" menu, sliders for the mood map).
- Screen reader labels for all icons, dots, charts and color-coded elements.
- Live regions (`aria-live="polite"`) for AI results arriving, timers finishing and toasts.
- Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI boundaries.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Forms: visible labels, not placeholder-only. Errors described in text near the field, in neutral color with an icon.
- No timeouts that close content without user action. Timers never auto-advance into a new task.
- Language attribute `lang="en"`.

### 7.2 Settings that must exist (stored in Dexie `settings` table)

| Key | Values | Default | Effect |
|---|---|---|---|
| `theme` | `system` · `light` · `dark` | `system` | Color scheme |
| `textScale` | `1` · `1.15` · `1.3` · `1.5` | `1` | Root font size multiplier |
| `extraSpacing` | boolean | `false` | Letter and word spacing |
| `reduceMotion` | boolean | `false` | Combined with OS preference |
| `vibration` | boolean | `false` | Timer end vibration |
| `communicationMode` | `gentle` · `direct` · `literal` | `gentle` | Passed to every AI call; also selects static copy variants where provided |
| `aiEnabled` | boolean | `true` | If false, all AI routes are skipped and deterministic fallbacks are used, with a note "AI suggestions are off" |
| `readAloudRate` | `0.8` · `1` · `1.2` | `1` | Speech rate |
| `demoMode` | boolean | `false` | Loads seed data and demo clock (Section 14) |
| `onboarded` | boolean | `false` | Show onboarding on first visit |
| `trustedContacts` | array of `{ name, method, value }` | `[]` | Shown in Support; stored locally only |
| `campusSupport` | `{ name, phone?, url? }` or null | `null` | User-entered campus resource |

### 7.3 Communication modes

- **Gentle:** warm, short, encouraging, no pressure. "Want to try a tiny first step?"
- **Direct:** brief, neutral, imperative. "First step: open the doc. Type the title."
- **Literal:** no metaphors, no idioms, no figurative language, no rhetorical questions, one instruction per sentence, explicit times and quantities. "Open the document. Type the title and the date. This takes about 2 minutes."

Static copy in `src/copy/en.ts` may provide variants per mode for key messages (Appendix A marks them). Metaphorical names (Surge, Ebb, Tide Line) always appear with a literal description nearby in literal mode (e.g., "Ebb (low energy, unpleasant)").

### 7.4 Dyslexia and reading support

- Atkinson Hyperlegible, generous spacing option, short sentences, left alignment, no walls of text (max 3 lines per paragraph in UI).
- Read aloud on every AI card and on strategy instructions.
- Voice dictation for every free-text input that matters (check-in, parking note, brain dump), using the Web Speech API where available; hide the mic button gracefully when unsupported, with no error.

---

## 8. Data model and persistence

### 8.1 Types (`src/lib/types.ts`)

```ts
export type Quadrant = 'surge' | 'swell' | 'ebb' | 'still';
export type CommunicationMode = 'gentle' | 'direct' | 'literal';
export type TaskType = 'writing' | 'studying' | 'admin' | 'social' | 'chores' | 'other';
export type TaskStatus = 'not_started' | 'in_progress' | 'stuck' | 'done';
export type StuckReason =
  | 'dont_know_start' | 'too_big' | 'boring' | 'worried_result' | 'place_noise' | 'no_energy';
export type EventKind = 'class' | 'lab' | 'work' | 'social' | 'self_care' | 'other';
export type Need = 'keep' | 'adjust' | 'regulate' | 'talk';
export type StrategyFamily = 'move' | 'calm' | 'connect' | 'create' | 'think';
export type RecheckResult = 'better' | 'same' | 'worse';
export type DayMode = 'full' | 'gentle' | 'minimum';

export interface CheckIn {
  id: string;
  ts: number;                  // epoch ms (from clock.now())
  text?: string;               // user's own words; stored locally only
  bodyCues?: string[];         // wordless path selections, e.g. ['chest:tight','energy:low']
  emotions: string[];          // 0–2 emotion ids chosen by the user (from data/emotions.ts or 'custom:<word>')
  energy: number;              // -5..5
  pleasantness: number;        // -5..5
  quadrant: Quadrant;
  causes?: string[];           // 'sleep' | 'food' | 'people' | 'noise_place' | 'task' | 'body' | 'not_sure'
  need?: Need;
  aiUsed: boolean;             // whether AI candidates were shown
  safetyTriggered?: boolean;   // true if safety layer fired (text is NOT stored in that case)
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  energyCost: 1 | 2 | 3;
  status: TaskStatus;
  due?: string;                // ISO date 'YYYY-MM-DD'
  stuckReason?: StuckReason;
  firstStep?: string;          // latest suggested/accepted first step
  parkingNote?: string;        // "where I left off"
  movedFrom?: string;          // ISO date when Day Mode moved it
  movedTo?: string;            // ISO date it was moved to
  createdAt: number;
  startedAt?: number;
  doneAt?: number;
  order: number;               // ordering within its column
}

export interface CalendarEvent {
  id: string;
  title: string;
  kind: EventKind;
  start: number;               // epoch ms
  end: number;                 // epoch ms
  place?: string;
  prep?: string[];             // optional prep items the user typed
}

export interface FocusBlock {
  id: string;
  taskId: string;
  ts: number;                  // start
  minutes: 5 | 10 | 15 | 25;
  completed: boolean;          // timer reached the end (vs ended early)
  outcome?: 'got_going' | 'a_little' | 'didnt_start';
}

export interface StrategyUse {
  id: string;
  strategyId: string;
  ts: number;
  context: 'unstick' | 'bridge' | 'toolkit';
  checkInId?: string;          // latest check-in at the time
  taskId?: string;
  transitionId?: string;
  result?: RecheckResult;
}

export interface Transition {
  id: string;
  ts: number;                  // when the bridge was shown
  fromTaskId?: string;
  fromEventId?: string;
  toEventId: string;
  parkingNote?: string;
  strategyUseId?: string;
  rating?: 'easy' | 'okay' | 'hard';
  ratedAt?: number;
}

export interface Win {
  id: string;
  ts: number;
  text: string;
  source: 'task' | 'transition' | 'strategy' | 'manual';
  refId?: string;
}

export interface Reward {
  id: string;
  text: string;                // user-defined micro-reward, e.g. "10 minutes of my game"
}

export interface DismissedPattern {
  key: string;                 // stable pattern key, e.g. 'strategyBeforeTask:m-walk-3:writing'
  ts: number;
  reason?: string;
}

export interface DayPlan {
  date: string;                // 'YYYY-MM-DD'
  mode: DayMode;
  keptTaskIds: string[];
  movedTaskIds: string[];
  rationale?: string;
  acceptedAt: number;
}
```

### 8.2 Dexie schema (`src/lib/db.ts`)

```ts
import Dexie, { type Table } from 'dexie';

export class TideDB extends Dexie {
  checkins!: Table<CheckIn, string>;
  tasks!: Table<Task, string>;
  events!: Table<CalendarEvent, string>;
  focusBlocks!: Table<FocusBlock, string>;
  strategyUses!: Table<StrategyUse, string>;
  transitions!: Table<Transition, string>;
  wins!: Table<Win, string>;
  rewards!: Table<Reward, string>;
  dismissedPatterns!: Table<DismissedPattern, string>;
  dayPlans!: Table<DayPlan, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('tide');
    this.version(1).stores({
      checkins: 'id, ts, quadrant',
      tasks: 'id, status, type, due, order',
      events: 'id, start, kind',
      focusBlocks: 'id, ts, taskId',
      strategyUses: 'id, ts, strategyId, context',
      transitions: 'id, ts, toEventId',
      wins: 'id, ts',
      rewards: 'id',
      dismissedPatterns: 'key',
      dayPlans: 'date',
      settings: 'key',
    });
  }
}
export const db = new TideDB();
```

Rules:

- All reads in components use `useLiveQuery` so the UI updates automatically.
- All writes go through small functions in `src/lib/repo/*.ts` (e.g., `createCheckIn`, `moveTask`, `recordStrategyUse`) so logic is testable and not scattered in components.
- Any schema change after Phase 0 must add a new Dexie `version()` with an upgrade function, never edit version 1 in place.
- "Export my data" downloads a JSON file with all tables except `settings.trustedContacts` values unless the user ticks "Include contacts".
- "Delete everything" calls `db.delete()` then reloads, after a confirmation dialog that requires typing nothing (to avoid friction) but has a clear two-button choice: "Delete everything" / "Keep my data".

### 8.3 Win creation rules (`src/lib/wins.ts`)

Create a `Win` automatically when:

- a task moves to `done` → "Finished: {title}";
- a transition is rated `easy` or `okay` → "Got through: {fromLabel} → {toLabel}";
- a strategy use is re-checked `better` → "Felt better after: {strategyName}";
- a focus block ends with `got_going` on a task that had been `stuck` → "Got unstuck: {title}".

Never create negative entries. Never count wins in a way that can go down.

---

## 9. Domain content

These lists are drafts for the team to review. Keep them in `src/data/` as typed constants. Definitions are one line, plain language, second person when natural.

### 9.1 Emotion vocabulary (`src/data/emotions.ts`)

```ts
export interface Emotion {
  id: string;            // lowercase slug
  word: string;          // display word
  quadrant: Quadrant;
  energy: number;        // -5..5
  pleasantness: number;  // -5..5
  definition: string;    // one line
}
```

**Surge (high energy, unpleasant)**

| id | word | energy | pleasantness | definition |
|---|---|---|---|---|
| anxious | Anxious | 3 | -3 | Worried about what might happen, with a busy body or mind |
| frustrated | Frustrated | 2 | -3 | Blocked from something you want to do |
| overwhelmed | Overwhelmed | 3 | -4 | Too much at once to handle right now |
| irritated | Irritated | 2 | -2 | Small things are bothering you more than usual |
| stressed | Stressed | 3 | -3 | Under pressure from demands or deadlines |
| panicked | Panicked | 5 | -5 | Sudden strong fear that makes it hard to think |
| angry | Angry | 4 | -4 | Strong feeling that something is unfair or wrong |
| restless | Restless | 3 | -1 | Unable to sit still or settle |
| worried | Worried | 2 | -3 | Thinking again and again about a possible problem |
| tense | Tense | 2 | -2 | Your body or mind feels tight and on guard |
| embarrassed | Embarrassed | 2 | -3 | Uncomfortable about how others might see you |
| jittery | Jittery | 4 | -2 | Shaky, buzzing energy that is hard to use |

**Swell (high energy, pleasant)**

| id | word | energy | pleasantness | definition |
|---|---|---|---|---|
| excited | Excited | 4 | 4 | Looking forward to something with lots of energy |
| motivated | Motivated | 3 | 3 | Ready and wanting to get things done |
| proud | Proud | 2 | 4 | Good about something you did |
| energized | Energized | 4 | 3 | Full of energy and ready to move |
| curious | Curious | 2 | 2 | Interested and wanting to know more |
| hopeful | Hopeful | 1 | 3 | Believing something good can happen |
| focused | Focused | 2 | 2 | Your attention is where you want it |
| playful | Playful | 3 | 4 | Light, fun and in the mood to joke or explore |
| confident | Confident | 2 | 3 | Sure you can handle what is in front of you |
| inspired | Inspired | 3 | 4 | Full of ideas and wanting to create |
| happy | Happy | 2 | 4 | Feeling good overall |
| determined | Determined | 3 | 2 | Set on finishing something, even if it is hard |

**Ebb (low energy, unpleasant)**

| id | word | energy | pleasantness | definition |
|---|---|---|---|---|
| drained | Drained | -3 | -3 | Low battery; everything feels like effort |
| sad | Sad | -2 | -4 | Down or heavy, maybe about a loss or disappointment |
| bored | Bored | -2 | -2 | Nothing feels interesting right now |
| lonely | Lonely | -2 | -3 | Wanting connection with others |
| disappointed | Disappointed | -2 | -3 | Something did not go the way you hoped |
| discouraged | Discouraged | -2 | -3 | Losing belief that trying will work |
| numb | Numb | -4 | -2 | Hard to feel much of anything |
| exhausted | Exhausted | -5 | -3 | Physically or mentally out of energy |
| ashamed | Ashamed | -2 | -4 | Feeling bad about yourself, not only about what happened |
| defeated | Defeated | -3 | -4 | Feeling like you lost or cannot win this one |
| foggy | Foggy | -3 | -2 | Thoughts feel slow or blurry |
| unmotivated | Unmotivated | -3 | -2 | You know what to do but cannot make yourself start |

**Still (low energy, pleasant)**

| id | word | energy | pleasantness | definition |
|---|---|---|---|---|
| calm | Calm | -2 | 3 | Quiet inside, not in a hurry |
| content | Content | -1 | 3 | Things feel okay as they are |
| relaxed | Relaxed | -3 | 3 | Your body and mind feel loose |
| grateful | Grateful | -1 | 4 | Thankful for something or someone |
| peaceful | Peaceful | -3 | 4 | Settled and at ease |
| safe | Safe | -2 | 3 | Nothing feels threatening right now |
| rested | Rested | -1 | 3 | Recovered and not tired |
| settled | Settled | -2 | 2 | You know where you are and what is next |
| comfortable | Comfortable | -2 | 2 | Physically at ease in your space |
| thoughtful | Thoughtful | -1 | 2 | Quietly thinking things through |
| satisfied | Satisfied | -1 | 3 | Something feels complete or enough |
| cozy | Cozy | -3 | 3 | Warm, snug and comfortable |

"None of these" opens the full list grouped by quadrant (with literal subtitles) and also allows a custom word (stored as `custom:<word>`), placed with the mood map.

### 9.2 Body path options (wordless check-in)

- **Where do you notice it?** Head, Chest, Stomach, Hands and arms, Legs, Whole body, Nowhere in particular.
- **What does it feel like?** Tight, Heavy, Buzzing, Hot, Cold, Empty, Shaky, Nothing special.
- **Energy slider:** "Running on empty" (−5) ↔ "Fully charged" (5).
- **Comfort slider:** "Very uncomfortable" (−5) ↔ "Very comfortable" (5).

Stored as `bodyCues` like `['chest:tight', 'whole:heavy']`. These and the two sliders are sent to the label route instead of text.

### 9.3 Task types (`src/data/taskTypes.ts`)

| id | label | icon (lucide) | literal description |
|---|---|---|---|
| writing | Writing | `PenLine` | Essays, reports, emails longer than a few lines |
| studying | Studying | `BookOpen` | Reading, problem sets, review |
| admin | Admin | `ClipboardList` | Forms, payments, appointments, short emails |
| social | Social | `MessageCircle` | Replies, group work coordination, calls |
| chores | Chores | `Shirt` | Laundry, cleaning, groceries |
| other | Other | `Circle` | Anything else |

### 9.4 Strategy library (`src/data/strategies.ts`)

```ts
export interface Strategy {
  id: string;
  family: StrategyFamily;
  name: string;
  summary: string;                 // one line
  steps: string[];                 // literal steps, max 5, each < 15 words
  durationSec: number;
  sensory: { sound: 'none' | 'optional'; movement: 'none' | 'light' | 'active'; screen: 'none' | 'some' | 'full' };
  suits: Quadrant[];               // quadrants where it is suggested by default
  contexts: Array<'unstick' | 'bridge' | 'toolkit'>;
  tool?: 'box_breathing' | 'grounding_54321' | 'sudoku_4x4' | 'doodle' | 'walk_timer' | 'brain_dump' | 'message_template' | 'steps_timer';
  template?: string;               // for message templates
}
```

| id | family | name | duration | suits | tool | steps (summary) |
|---|---|---|---|---|---|---|
| m-walk-3 | move | 3-minute walk | 180 | ebb, surge | walk_timer | Put your phone in your pocket. Walk anywhere. Come back when it vibrates. |
| m-shake-20 | move | Shake it out | 60 | ebb | steps_timer | Stand up. Shake your hands 10 times. Shake your feet 10 times. Breathe out. |
| m-stairs | move | Stairs once | 120 | ebb | steps_timer | Find stairs. Go up and down one floor. Come back. |
| m-stretch | move | Desk stretch | 90 | ebb, surge | steps_timer | Reach up for 5 seconds. Roll shoulders 5 times. Turn your neck slowly. |
| m-song | move | One-song move | 210 | ebb, swell | steps_timer | Play one song. Move in any way you like. Stop when the song ends. |
| c-box | calm | Box breathing | 120 | surge | box_breathing | In for 4. Hold for 4. Out for 4. Hold for 4. Repeat. |
| c-54321 | calm | 5-4-3-2-1 senses | 150 | surge | grounding_54321 | Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste. |
| c-long-exhale | calm | Longer breath out | 90 | surge | steps_timer | Breathe in for 4. Breathe out for 6. Do it 8 times. |
| c-quiet | calm | Quiet corner | 180 | surge | steps_timer | Find a quieter spot. Lower the light or close your eyes. Stay 3 minutes. |
| c-music | calm | Low music | 180 | surge, ebb | steps_timer | Put on one calm song at low volume. Do nothing else until it ends. |
| s-text-friend | connect | Text a friend | 120 | ebb | message_template | Pick a person. Edit the message. Copy it and send it yourself. |
| s-body-double | connect | Work next to someone | 600 | ebb, still | steps_timer | Ask someone to sit or video-call with you. Say your first step out loud. Start. |
| s-voice-memo | connect | Say it out loud | 60 | surge, ebb | steps_timer | Record a voice memo saying what is going on. You do not need to send it. |
| s-ask-help | connect | Ask for help | 180 | surge, ebb | message_template | Edit the message to your TA, professor or classmate. Copy it and send it yourself. |
| cr-doodle | create | 2-minute doodle | 120 | ebb, surge, still | doodle | Draw anything. Lines, shapes, scribbles. Nothing is saved. |
| cr-three-words | create | Three words | 60 | ebb, still | steps_timer | Write three words about right now. That is all. |
| cr-brain-dump | create | Brain dump | 120 | surge | brain_dump | Type everything in your head. One thing per line. Turn lines into tasks if you want. |
| t-sudoku | think | Mini sudoku | 180 | surge, ebb | sudoku_4x4 | Fill the 4×4 grid with 1 to 4. Each row, column and box has each number once. |
| t-count-7 | think | Count back by 7 | 60 | surge | steps_timer | Start at 100. Subtract 7 each time. Say the numbers in your head. |
| t-spot-blue | think | Spot five blue things | 60 | surge, ebb | steps_timer | Look around. Find five blue things. Name them. |

Templates:

- `s-text-friend`: "Hey, rough afternoon. Can you send me something funny or just say hi?"
- `s-ask-help`: "Hi, I'm working on {task} and I'm stuck on where to start. Could you point me to the first thing I should focus on? Thank you."

Suggestion ranking for a quadrant (deterministic, `src/lib/strategyRank.ts`): personal "better" rate (from StrategyUse with result) with Laplace smoothing `(better + 1) / (n + 2)`, then default suitability (`suits` includes quadrant: +0.2), then shorter duration first for bridges (bridges only show strategies ≤ 180s). Strategies with ≥ 2 "worse" results in the last 4 weeks drop to the bottom and are never auto-suggested.

---
## 10. AI layer

### 10.1 Architecture

```
Client component
  └─ useAi(route, input)                  (src/lib/ai/useAi.ts)
       ├─ if settings.aiEnabled === false → fallback(route, input)
       ├─ safety pre-check on any free text → if triggered: route to CrisisScreen, no AI call
       ├─ if demoMode and cachedResponses has a match → race(cache after 900ms, live call)
       ├─ POST /api/ai/<route> with minimal JSON body
       │     └─ route.ts: rate limit → zod-validate input → callJson(model, system, input)
       │            → zod-validate output (1 retry) → return { ok, data, source }
       └─ on timeout / error / invalid → fallback(route, input) with source: 'fallback'
```

Principles:

- **The code calculates; the AI interprets language and explains.** The AI never computes statistics, never decides what is shown without the user's confirmation, and never receives the full history.
- **Minimal input.** Each route receives only the fields listed in its schema. No names, no emails, no event titles beyond what is needed (event titles and task titles are allowed because the user typed them for this purpose; never send trusted contacts or campus resources).
- **Structured output.** Every route returns JSON validated by zod. Invalid output → one retry with the validation error appended → deterministic fallback.
- **Every AI result is labeled** in the UI as a suggestion, has a "Read aloud" button, and can be dismissed or replaced.
- **No logging of request bodies or outputs** on the server. Log only route name, status, latency and whether a fallback was used.

### 10.2 Server client (`src/lib/ai/client.ts`)

Implement `callJson<T>(opts)`:

```ts
interface CallJsonOptions<T> {
  model: string;                // process.env.TIDE_MODEL_FAST or TIDE_MODEL_SMART
  system: string;               // shared preamble + route prompt
  input: unknown;               // already validated input object
  schema: z.ZodType<T>;
  maxTokens: number;
  timeoutMs: number;
  temperature?: number;         // default 0.3
}
```

Behavior:

1. Create the Anthropic client once per server instance with `process.env.ANTHROPIC_API_KEY`.
2. Send one user message whose content is: `"INPUT (JSON):\n" + JSON.stringify(input)` and the instruction "Respond with only the JSON object that matches the OUTPUT SCHEMA. No prose, no code fences."
3. Use an `AbortController` with `timeoutMs`.
4. Extract the text content, strip accidental code fences, `JSON.parse`, then `schema.safeParse`.
5. If parsing or validation fails, retry once, appending to the messages the assistant's previous output and a user message: "That output was invalid: {short zod error}. Return only valid JSON matching the schema."
6. Return `{ ok: true, data }` or throw a typed `AiError` with a code (`timeout`, `invalid_output`, `provider_error`, `missing_key`).

Check the installed `@anthropic-ai/sdk` version's types for the exact `messages.create` signature and response shape before writing this.

### 10.3 API routes

All routes: `POST`, `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, JSON in/out, rate limited per IP (in-memory sliding window using `TIDE_RATE_LIMIT_MAX` per `TIDE_RATE_LIMIT_WINDOW_MS`; on limit return HTTP 429 `{ ok: false, error: 'rate_limited' }` and the client uses the fallback). Response envelope:

```ts
type AiResponse<T> =
  | { ok: true; data: T; source: 'ai' }
  | { ok: false; error: 'rate_limited' | 'invalid_input' | 'timeout' | 'invalid_output' | 'provider_error' | 'missing_key' };
```

The client converts any `ok: false` into a fallback result with `source: 'fallback'`. The UI shows a small neutral note for fallback results only in Settings → "About suggestions" (not on every card), to avoid noise, except when `aiEnabled` is false (then show "AI suggestions are off" once per screen).

| Route | Model env | max_tokens | Purpose |
|---|---|---|---|
| `/api/ai/label` | FAST | 500 | Emotion candidates from words or body cues |
| `/api/ai/unstick` | FAST | 350 | One state-aware first step + focus length |
| `/api/ai/daymode` | SMART | 600 | Which tasks to keep or move for Gentle/Minimum |
| `/api/ai/bridge` | FAST | 350 | Parking prompt, strategy pick, prep steps |
| `/api/ai/narrate` | SMART | 600 | Plain-language text for computed patterns |

### 10.4 Schemas (`src/lib/ai/schemas.ts`)

```ts
// ---------- shared ----------
export const QuadrantZ = z.enum(['surge', 'swell', 'ebb', 'still']);
export const ModeZ = z.enum(['gentle', 'direct', 'literal']);
const Coord = z.number().int().min(-5).max(5);

// ---------- label ----------
export const LabelInput = z.object({
  mode: ModeZ,
  localTime: z.string(),                         // e.g. "Thu 3:40 pm"
  text: z.string().max(600).optional(),
  bodyCues: z.array(z.string().max(40)).max(8).optional(),
  energyHint: Coord.optional(),                  // from wordless sliders
  pleasantnessHint: Coord.optional(),
  vocabulary: z.array(z.string()).max(60),       // allowed emotion ids
}).refine(v => !!v.text || (v.bodyCues && v.bodyCues.length > 0), 'text or bodyCues required');

export const LabelOutput = z.object({
  candidates: z.array(z.object({
    id: z.string(),                              // must be in vocabulary
    definition: z.string().max(90),              // may lightly tailor the stock definition
    energy: Coord,
    pleasantness: Coord,
  })).length(3),
  followUpQuestion: z.string().max(120),
  safetyFlag: z.boolean(),
});

// ---------- unstick ----------
export const UnstickInput = z.object({
  mode: ModeZ,
  task: z.object({ title: z.string().max(120), type: z.enum(['writing','studying','admin','social','chores','other']), energyCost: z.number().int().min(1).max(3) }),
  reason: z.enum(['dont_know_start','too_big','boring','worried_result','place_noise','no_energy']),
  state: z.object({ quadrant: QuadrantZ, energy: Coord, pleasantness: Coord, emotions: z.array(z.string()).max(2) }).optional(),
  parkingNote: z.string().max(140).optional(),
  helpfulStrategies: z.array(z.object({ id: z.string(), name: z.string(), better: z.number().int(), n: z.number().int() })).max(3),
  previousStep: z.string().max(140).optional(),  // when user asks "Different step"
});
// helpfulStrategies is built by the code from strategy_before_task results for
// this task's type: `better` = times the task got going after that strategy (k),
// `n` = times the strategy came before this task type. Top 3 by k/n, n ≥ 3.

export const UnstickOutput = z.object({
  firstStep: z.string().max(110),                // < 15 words, < 5 minutes
  focusMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(25)]),
  strategyId: z.string().nullable(),             // only from helpfulStrategies ids, or null
  why: z.string().max(140),
});

// ---------- daymode ----------
export const DayModeInput = z.object({
  mode: ModeZ,
  requestedMode: z.enum(['gentle', 'minimum']),
  today: z.string(),                             // 'YYYY-MM-DD'
  state: z.object({ quadrant: QuadrantZ, energy: Coord, pleasantness: Coord }),
  energyBudget: z.number().int(),                // gentle 4, minimum 2 (computed by code)
  tasks: z.array(z.object({
    id: z.string(), title: z.string().max(120), type: z.string(),
    energyCost: z.number().int(), due: z.string().nullable(), status: z.string(),
  })).max(25),
  events: z.array(z.object({ title: z.string().max(80), start: z.string(), end: z.string() })).max(12),
});

export const DayModeOutput = z.object({
  keep: z.array(z.string()),                     // task ids
  move: z.array(z.string()),                     // task ids
  rationale: z.string().max(160),
});

// ---------- bridge ----------
export const BridgeInput = z.object({
  mode: ModeZ,
  minutesUntil: z.number().int(),
  from: z.object({ label: z.string().max(80), taskTitle: z.string().max(120).optional() }),
  to: z.object({ title: z.string().max(80), kind: z.string(), place: z.string().max(60).optional(), prep: z.array(z.string().max(60)).max(5).optional() }),
  state: z.object({ quadrant: QuadrantZ, energy: Coord, pleasantness: Coord }).optional(),
  hardBefore: z.object({ k: z.number().int(), n: z.number().int() }).optional(),
  candidateStrategies: z.array(z.object({ id: z.string(), name: z.string(), durationSec: z.number().int(), better: z.number().int(), n: z.number().int() })).min(1).max(4),
});

export const BridgeOutput = z.object({
  parkingPrompt: z.string().max(90),
  strategyId: z.string(),                        // must be one of candidateStrategies
  prepSteps: z.array(z.string().max(60)).max(3),
});

// ---------- narrate ----------
export const NarrateInput = z.object({
  mode: ModeZ,
  patterns: z.array(z.object({
    key: z.string(),
    kind: z.enum(['strategy_before_task', 'hard_transition', 'state_task_start', 'strategy_effect']),
    facts: z.record(z.union([z.string(), z.number()])), // e.g. { strategyName, taskType, k, n, baselinePct }
  })).max(6),
});

export const NarrateOutput = z.object({
  cards: z.array(z.object({
    key: z.string(),
    title: z.string().max(80),
    body: z.string().max(170),                   // ≤ 25 words
    whyText: z.string().max(200),
  })),
});
```

Additional server-side checks after zod (reject → fallback): label candidate ids must exist in `vocabulary` and be distinct; unstick `strategyId` must be null or in `helpfulStrategies`; daymode `keep ∪ move` must equal the input task ids exactly with no duplicates, and the sum of `energyCost` of kept tasks should not exceed `energyBudget + 1`; bridge `strategyId` must be in `candidateStrategies`; narrate keys must match input keys and any number appearing in text must appear in that pattern's facts (simple regex check for digits; if a digit appears that is not in facts, replace the card with the deterministic template).

### 10.5 Prompts (implement as written; the team may revise them after partner review)

Use these prompts exactly as written unless testing shows a real problem; if you change one, record what and why in `AI_ATTRIBUTION.md` and `docs/DECISIONS.md`. Store each prompt as a Markdown file in `/prompts` (the source of truth for the AI Prompts PDF) and read them on the server with `fs.readFileSync` at module load in `src/lib/ai/prompts.ts`, so there is exactly one copy of each prompt. Make sure the `/prompts` folder is included in the server build output (Next.js file tracing; add `outputFileTracingIncludes` in `next.config` if the files are not picked up, and verify with `next build`).

#### 10.5.0 Shared preamble (`prompts/00-shared-preamble.md`)

```
You are the suggestion engine inside Tide, an app that helps neurodivergent
college students (ADHD, autism, dyslexia and related differences) connect how
they feel with what they can realistically do next.

Rules you always follow:
1. Never tell the user what they feel. Offer options; the user decides.
2. Never diagnose, never use clinical labels about the user, never claim to be
   therapy or medical advice.
3. Never shame, pressure, moralize or use guilt. Being stuck is information,
   not failure.
4. Use only the information in INPUT. Never invent facts, numbers, history,
   names or events.
5. Keep language short and concrete. Sentences under 15 words.
6. Respect the communication mode in INPUT.mode:
   - "gentle": warm, encouraging, low pressure. Questions are fine.
   - "direct": brief and neutral. Use imperatives. No small talk.
   - "literal": no metaphors, no idioms, no figurative language, no rhetorical
     questions. One instruction per sentence. State times and quantities
     explicitly.
7. If any text suggests the user may hurt themselves or is in crisis, do not
   coach. Set safetyFlag to true when the schema has it, and keep other fields
   minimal and neutral.
8. Output only one JSON object that matches the OUTPUT SCHEMA. No prose before
   or after it. No code fences.
```

#### 10.5.1 Label (`prompts/01-label.md`)

```
TASK: Help the user find words for how they feel.

You receive either the user's own words (INPUT.text), or body cues
(INPUT.bodyCues, e.g. "chest:tight") and optional slider hints
(INPUT.energyHint, INPUT.pleasantnessHint from -5 to 5), or both.

Choose exactly 3 candidate emotions from INPUT.vocabulary (use the ids
exactly as given). Pick 3 that are meaningfully different from each other,
so the user has a real choice. Order them from most to least likely.

For each candidate:
- definition: one plain line (max 12 words) explaining the word, optionally
  tailored to the user's situation without assuming facts.
- energy and pleasantness: integers from -5 to 5 for this user right now.
  If slider hints exist, stay within 2 points of them.

followUpQuestion: one short question that helps the user tell the
candidates apart (for example tired versus overwhelmed). In "literal" mode,
make it a direct either-or question.

safetyFlag: true only if the text suggests self-harm, suicide, or being
in danger. Otherwise false.

OUTPUT SCHEMA:
{ "candidates": [ { "id": string, "definition": string, "energy": int,
  "pleasantness": int } x3 ], "followUpQuestion": string,
  "safetyFlag": boolean }
```

Example (for the PDF and tests):

- INPUT: `{"mode":"gentle","localTime":"Thu 3:40 pm","text":"Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.","vocabulary":[...48 ids...]}`
- OUTPUT: `{"candidates":[{"id":"drained","definition":"Low battery; starting anything feels like a lot","energy":-3,"pleasantness":-3},{"id":"frustrated","definition":"Blocked from something you want to get done","energy":1,"pleasantness":-3},{"id":"overwhelmed","definition":"The task feels too big to hold at once","energy":2,"pleasantness":-4}],"followUpQuestion":"Is it more that you're tired, or that the report feels too big?","safetyFlag":false}`

#### 10.5.2 Unstick (`prompts/02-unstick.md`)

```
TASK: Give the user ONE first step for a task they are stuck on.

The step must:
- be doable in under 5 minutes,
- be described in under 15 words,
- be physical and specific (open, type, write, put, read one), not abstract
  (avoid "plan", "think about", "work on"),
- fit the user's current state:
  * ebb (low energy, unpleasant): the smallest possible step. Lower the bar.
  * surge (high energy, unpleasant): a step that reduces uncertainty or
    pressure, like writing rough bullets nobody will read.
  * swell (high energy, pleasant): a meaningful chunk is fine.
  * still (low energy, pleasant): a steady, simple step.
  * no state: a small, neutral step.
- fit the reason (INPUT.reason):
  * dont_know_start: name the exact first action.
  * too_big: shrink scope to one tiny part.
  * boring: pair it with something easy or add a tiny time box.
  * worried_result: make it explicitly a rough draft.
  * place_noise: include changing or preparing the place.
  * no_energy: the smallest action, sitting down is fine.
- if INPUT.parkingNote exists, start from where the user left off.
- if INPUT.previousStep exists, give a different and smaller step.

focusMinutes: 5 for ebb or no_energy, 10 for surge or worried_result,
15 for still, 25 for swell. Use a smaller value when in doubt.

strategyId: if INPUT.helpfulStrategies has a strategy with better/n of at
least 0.6 and n of at least 3, return its id as a suggestion to do first.
Otherwise null. Never invent ids.

why: one short sentence explaining the choice without numbers you were not
given.

OUTPUT SCHEMA:
{ "firstStep": string, "focusMinutes": 5|10|15|25,
  "strategyId": string|null, "why": string }
```

#### 10.5.3 Day Mode (`prompts/03-daymode.md`)

```
TASK: Reshape today's task list to fit the user's capacity.

INPUT.requestedMode is "gentle" or "minimum". INPUT.energyBudget is the
maximum total energyCost to keep today.

Decide for EVERY task id in INPUT.tasks whether to keep it today or move it.
- Prefer keeping tasks that are due today or tomorrow.
- Prefer keeping lower energyCost tasks when they unblock something.
- Keep the total energyCost of kept tasks within energyBudget when possible.
- Never drop tasks: moved tasks still exist, just later.
- Do not keep tasks with status "done".

rationale: one short sentence the user will read, explaining the idea of
the plan (not a list of tasks), with no guilt.

OUTPUT SCHEMA:
{ "keep": [taskId], "move": [taskId], "rationale": string }
Every input task id must appear exactly once in keep or move.
```

#### 10.5.4 Bridge (`prompts/04-bridge.md`)

```
TASK: Help the user switch from one activity to the next.

parkingPrompt: one short question that helps the user write down where
they are leaving off, specific to INPUT.from (for example "Where did you
stop in the lab report?"). In literal mode, ask for the exact thing to
write.

strategyId: choose ONE id from INPUT.candidateStrategies. Prefer higher
better/n with n of at least 3. If INPUT.hardBefore shows this switch is
often hard, prefer calming strategies. Keep it short when minutesUntil is
under 10.

prepSteps: up to 3 short, concrete items for the next activity, using
INPUT.to.place and INPUT.to.prep if given. Do not invent rooms, materials
or times that are not in INPUT. If nothing is known, use generic items
like "Pack what you need" and "Check where you are going".

OUTPUT SCHEMA:
{ "parkingPrompt": string, "strategyId": string, "prepSteps": [string] }
```

#### 10.5.5 Narrate (`prompts/05-narrate.md`)

```
TASK: Turn computed patterns into short, kind, plain-language cards.

Each item in INPUT.patterns has facts that were calculated by the app. Use
ONLY those facts. Never add numbers, dates or causes that are not in facts.
Never claim causation; use language like "tends to", "often", "in your
data".

For each pattern return:
- key: the same key.
- title: max 8 words, a plain statement of the pattern.
- body: max 25 words, what it might mean for the user and one optional
  idea to try, framed as an option.
- whyText: one sentence saying exactly what data this comes from, using the
  facts (for example "From 5 times you walked before a writing task; you
  got going 4 times.").

OUTPUT SCHEMA:
{ "cards": [ { "key": string, "title": string, "body": string,
  "whyText": string } ] }
```

### 10.6 Deterministic fallbacks (`src/lib/ai/fallbacks.ts`)

Fallbacks make the app fully usable with AI off or failing. They must be good enough for the demo if the network dies.

- **Label:** if text exists, keyword match against a small lexicon (e.g. tired/heavy/exhausted → drained, exhausted; stuck/annoyed/blocked → frustrated; too much/everything → overwhelmed; worried/nervous → anxious, worried; sad/down → sad; bored → bored; alone → lonely; good/happy → happy, content; calm/fine → calm). If body cues or sliders exist, take the 3 vocabulary words nearest (Euclidean distance) to the slider point (default point (−2, −2) if no sliders). Ensure 3 distinct ids. `followUpQuestion`: "Which of these feels closest?" `safetyFlag`: result of the client-side safety detector.
- **Unstick:** table `firstStepTemplates[reason][taskType]` with literal templates, for example `dont_know_start.writing`: "Open the document and type only the title.", `too_big.studying`: "Do only the first problem. Nothing else.", `no_energy.chores`: "Put one item where it belongs.", `worried_result.writing`: "Write three rough bullet points. Nobody will read them.", `place_noise.*`: "Put on headphones or move to a quieter spot, then open {task}.", `boring.*`: "Set a 5-minute timer and do only the first part." Write all 36 combinations. `focusMinutes` by quadrant (ebb 5, surge 10, still 15, swell 25, none 10). `strategyId`: best helpful strategy with ratio ≥ 0.6 and n ≥ 3, else null. `why`: "A small start based on how you feel right now."
- **Day Mode:** sort non-done tasks by (due date ascending, nulls last), then energyCost ascending; keep while cumulative cost ≤ budget; always keep tasks due today if any, even if over budget by 1; move the rest. Rationale: gentle "Keeping what's due soon. The rest can wait until tomorrow." minimum "Only what can't wait. Everything else is still here tomorrow."
- **Bridge:** parkingPrompt "Where are you leaving off?" (literal: "Write the last thing you finished."), strategy = top ranked candidate, prepSteps from event prep or ["Pack what you need", "Check where you are going"].
- **Narrate:** templates per kind using facts, e.g. strategy_before_task → title "{Strategy} before {taskType} tasks", body "In your data, {taskType} tasks got going more often after {strategy}. You could try it next time.", whyText "From {n} times you used {strategy} before a {taskType} task; you got going {k} times."

### 10.7 Client hook (`src/lib/ai/useAi.ts`)

```ts
const { run, data, status, source } = useAi('label');
// status: 'idle' | 'loading' | 'done'
// source: 'ai' | 'fallback' | 'demo-cache'
await run(input);
```

- Timeout: `TIDE_AI_TIMEOUT_MS` (8s) normally, 4s in demo mode (value passed to the client via a small `/api/config` route or a `NEXT_PUBLIC_` non-secret variable; never expose the key).
- While loading, show a calm skeleton with the text "Finding some words…" (label), "Finding a small first step…" (unstick), "Looking at your day…" (daymode), "Getting ready for the switch…" (bridge). Announce via `aria-live`.
- Never block the user: every AI step has a "Skip" or manual path.

---

## 11. Safety layer

### 11.1 Detection (`src/lib/safety/`)

Two layers:

1. **Client keyword pre-filter** (runs before any AI call on any free text: check-in text, brain dump, parking note). Case-insensitive, accent-insensitive, matches whole phrases. English and Spanish lists in `keywords.ts`, for example: "kill myself", "killing myself", "suicide", "suicidal", "end my life", "want to die", "wish I was dead", "better off dead", "hurt myself", "harm myself", "self harm", "self-harm", "cut myself", "no reason to live", "can't go on", "matarme", "suicidarme", "suicidio", "quiero morir", "me quiero morir", "no quiero vivir", "quitarme la vida", "hacerme daño", "cortarme", "no tiene sentido vivir". Keep the list in one file so the team can review it with their partner.
2. **Model flag:** the label route returns `safetyFlag`. If true, treat exactly like a keyword hit.

### 11.2 Response

When triggered:

- Do **not** show AI candidates or any coaching.
- Save the check-in **without the text** and with `safetyTriggered: true` (so patterns do not use it and no sensitive text is stored).
- Navigate to `/support?crisis=1`, which renders `CrisisScreen`:
  - Heading: "It sounds like things are really hard right now."
  - Body: "You deserve support from a person. You don't have to handle this alone."
  - Large buttons (tel: links): "Call Línea de la Vida (Mexico) · 800 911 2000", "Call or text 988 (U.S. Suicide & Crisis Lifeline)", "Emergency · 911".
  - Trusted contacts (if any) with "Call" or "Message" buttons (open the native app; Tide never sends anything).
  - Campus support if the user saved it.
  - A quieter button at the bottom: "I'm safe, take me back."
- Do not show the crisis screen with animations; static, calm layout.

Resources live in `src/data/resources.ts` with a comment that the team must verify every number before submission and with their Challenge Partner. Never make claims about confidentiality or what the lines will do.

### 11.3 "Talk to a person" everywhere

`TalkToAPersonButton` is visible on: Check-in step 4 ("Talk to someone" option), every Toolkit strategy screen, the Bridge sheet footer, the Patterns screen footer, and the profile menu. It opens `/support` (non-crisis version: trusted contacts, campus support, and the same crisis lines in a lower section titled "If you are in crisis").

---

## 12. Pattern engine

### 12.1 Principles

- Pure TypeScript functions in `src/lib/patterns/` that take arrays of records and return pattern objects. **No AI inside.** Deterministic, fully unit-tested.
- A pattern is shown only when `n ≥ 3` and it passes the rule's threshold. Every pattern carries `k`, `n`, `confidence`, `evidenceIds` and a stable `key`.
- Patterns the user dismissed (by key) are never shown again unless they clear the data.
- Default window: last 28 days from `clock.now()`. The Patterns screen allows "This week" (7 days) and "Last 4 weeks" (28 days).
- Check-ins with `safetyTriggered` are excluded from all pattern computations.

### 12.2 Types

```ts
export interface PatternResult {
  key: string;
  kind: 'strategy_before_task' | 'hard_transition' | 'state_task_start' | 'strategy_effect';
  k: number;                 // successes (or hard count)
  n: number;                 // total observations
  rate: number;              // k / n
  baselineRate?: number;     // comparison rate when relevant
  confidence: 1 | 2 | 3 | 4;
  evidenceIds: string[];     // ids of records that make up n
  facts: Record<string, string | number>;  // exactly what narrate may use
}
```

### 12.3 Confidence (`confidence.ts`)

`n` 3–4 → 1, 5–7 → 2, 8–11 → 3, ≥ 12 → 4. Render as ConfidenceDots with text "Confidence {c} of 4".

### 12.4 Rules

**A. strategy_before_task** (`rules/strategyBeforeTask.ts`)

- For each `StrategyUse u` in window, find the first `FocusBlock f` with `u.ts < f.ts ≤ u.ts + 20 min`. If none, skip u.
- Group by `(u.strategyId, task(f.taskId).type)`. For each group: `n` = count, `k` = count where `f.outcome === 'got_going'`.
- Baseline for that task type: rate of `got_going` over all focus blocks of that type in window that were **not** preceded by any strategy within 20 minutes. If baseline has fewer than 3 observations, use the overall `got_going` rate across all focus blocks.
- Show if `n ≥ 3` and `rate ≥ 0.6` and `rate − baseline ≥ 0.25`.
- key: `strategyBeforeTask:{strategyId}:{taskType}`. facts: `{ strategyName, taskType, k, n, baselinePct }`.

**B. hard_transition** (`rules/hardTransition.ts`)

- For each `Transition t` with a rating in window: fromLabel = kind of `fromEventId` event if present, else `'task'`; toLabel = kind of `toEventId` event.
- Group by `(fromLabel, toLabel)`. `n` = count, `k` = count with rating `'hard'`.
- Show if `n ≥ 3` and `rate ≥ 0.5`.
- Additionally compute, for those transitions, which strategy (if any) was used, and the hard rate with vs without that strategy; include in facts when both sides have ≥ 2 observations: `{ fromLabel, toLabel, k, n, withStrategyName?, withStrategyHardK?, withStrategyN? }`.
- key: `hardTransition:{fromLabel}:{toLabel}`.

**C. state_task_start** (`rules/stateTaskStart.ts`)

- For each `FocusBlock f`, find the latest `CheckIn c` with `c.ts ≤ f.ts` and `f.ts − c.ts ≤ 3 hours`. If none, skip.
- Group by `(c.quadrant, task.type)`. `rate` = got_going rate. Baseline = got_going rate of that task type across all quadrants.
- Show if `n ≥ 3` and `|rate − baseline| ≥ 0.25`.
- key: `stateTaskStart:{quadrant}:{taskType}`. facts: `{ quadrantName, taskType, k, n, baselinePct, direction: 'higher' | 'lower' }`.

**D. strategy_effect** (`rules/strategyEffect.ts`)

- For each strategy with re-checked uses in window: `n` = count with result, `k` = count `'better'`.
- Shown as a card only if `n ≥ 3` and `rate ≥ 0.6`; all strategies with `n ≥ 1` are listed in "Top strategies" with "k of n" (no card).
- key: `strategyEffect:{strategyId}`. facts: `{ strategyName, k, n }`.

### 12.5 Engine (`engine.ts`)

```ts
export function computePatterns(input: {
  now: number; windowDays: 7 | 28;
  checkins: CheckIn[]; tasks: Task[]; events: CalendarEvent[];
  focusBlocks: FocusBlock[]; strategyUses: StrategyUse[]; transitions: Transition[];
  dismissedKeys: Set<string>;
}): PatternResult[]
```

Sort by (confidence desc, |rate − baseline| desc, n desc). Return at most 6. The Patterns screen calls `computePatterns`, then sends the results' `facts` to `/api/ai/narrate`, and caches narrations in memory keyed by `key + k + n` so it does not re-call on every render.

### 12.6 Tests (required)

Write fixtures in `src/lib/patterns/__tests__/fixtures.ts` and tests that cover at least:

1. A walk-before-writing group with 4 of 5 got_going and a baseline of 1 of 4 → pattern shown, confidence 2.
2. The same group with only 2 observations → not shown.
3. A group with rate 0.6 but baseline 0.5 → not shown (difference < 0.25).
4. Lab → class transitions rated hard 3 of 4 → shown; with box breathing used in 2 of them (both okay) and not in 2 others (both hard) → facts include the "with strategy" comparison.
5. Dismissed key → not shown.
6. Records outside the window → ignored.
7. Check-ins with `safetyTriggered` → ignored.
8. Confidence thresholds at n = 3, 5, 8, 12.
9. Output order and max 6.

---
## 13. Screens and flows

Every screen below lists: route, purpose, layout from top to bottom, states, interactions, copy (English, final unless marked), and acceptance criteria. Design at 390px width first. All copy goes into `src/copy/en.ts`.

### 13.1 App shell

- `src/app/layout.tsx`: loads Atkinson Hyperlegible, sets `lang="en"`, applies theme class and text scale from settings (avoid flash of wrong theme with a tiny inline script that reads a `localStorage` mirror of theme and scale; wrap in try/catch; Dexie remains the source of truth).
- `(app)/layout.tsx`: `PhoneFrame` container (max-width 430px, centered, full height), `TopBar` (screen title left, profile button right that opens a menu: Proof log, Settings, Talk to a person, About Tide), content area with bottom padding for the tab bar, `TabBar`, and `CheckInFab`.
- If `settings.onboarded` is false, redirect to `/onboarding`.
- If `settings.demoMode` is true, show a small, quiet badge in the TopBar: "Demo data" (so judges are never misled).

Acceptance: keyboard tab order is TopBar → content → FAB → TabBar; the FAB and tabs are reachable and labeled; no layout shift when switching tabs; works at 320px width without horizontal scroll.

### 13.2 Onboarding (`/onboarding`)

Three steps with a progress indicator "Step 1 of 3" (text, not only dots). "Skip" is available on every step and sets sensible defaults.

**Step 1 — What Tide is**
- Simple original wave illustration (inline SVG, decorative, `aria-hidden`).
- H1: "Tide helps you plan around how you actually feel."
- Two short lists:
  - "Tide does": "Helps you put feelings into words", "Suggests a small next step", "Helps you switch between activities", "Learns what works for you".
  - "Tide doesn't": "Diagnose or treat anything", "Replace a professional or a person you trust", "Share your data without asking".
- Button: "Continue".

**Step 2 — Make it comfortable**
- Text size control with four options and a live preview sentence.
- Theme: System / Light / Dark.
- Switch: "Reduce motion".
- Communication mode: three selectable cards:
  - Gentle — example: "Want to try a tiny first step?"
  - Direct — example: "First step: open the doc."
  - Literal — example: "Open the document. Type the title. This takes 2 minutes."
- Button: "Continue".

**Step 3 — Your privacy**
- Body: "Your check-ins, tasks and patterns stay on this device. When you use AI suggestions, only the words needed for that suggestion are sent, without your name, and they are not stored by Tide."
- Switch: "Use AI suggestions" (on).
- Optional: "Add someone you trust" (name + phone or handle) — can be skipped.
- Notice: "Tide is not a medical or mental health service."
- Button: "Start my day" → sets `onboarded = true`, goes to Today.

Acceptance: all three steps keyboard and screen-reader operable; preferences apply immediately; skipping works from any step.

### 13.3 Today (`/`)

Layout top to bottom:

1. **Header:** "Good afternoon, Maya" if a name was set in Settings, otherwise "Good afternoon". Date line: "Thursday, November 5". (Greeting by local time: morning < 12:00, afternoon < 18:00, evening otherwise.)
2. **StateCard:**
   - If a check-in exists today: StateChip with time, plus link "Check in again".
   - If none: text "How are you arriving today?" + button "Check in".
   - If the latest check-in is in Ebb and the Proof log has entries, show below it a **WinCard**: "Last {weekday} felt like this too. You still {win text in lowercase}." with link "See your proof log". Choose the most recent win from a day whose check-ins included Ebb; else the most recent win.
3. **DayModeBanner** (only when recommended and today's plan is still `full`): recommendation rules in `src/lib/daymode.ts`:
   - latest check-in today is `ebb`, or
   - latest check-in is `surge` with `energy ≥ 3` and `pleasantness ≤ −3`, or
   - latest check-in `need === 'adjust'`.
   Copy: "Low on energy today? A Gentle plan keeps what matters and moves the rest." (surge variant: "A lot going on? A Gentle plan can make today lighter.") Buttons: "Show me" (opens DayModeSheet) and "Not now" (hides the banner until the next check-in).
4. **NextTransitionCard:** the next event starting within 3 hours: "Next: Calculus · 4:50 pm · in 70 min". When ≤ 15 minutes away, this becomes a **BridgeCard** (Section 13.8).
5. **TideLine:** vertical timeline from now to end of day (23:59), plus a collapsed "Earlier today" section above.
   - Events: block with left border in `--line`, title, time range, place.
   - Tasks for today (due today, or kept in today's DayPlan, or in progress): TaskCard compact version, ordered after the current time marker; tasks have no fixed time unless the user schedules them (MVP: no scheduling of tasks; list them in a "Today's tasks" group under the current time marker).
   - "Now" marker: thin line with a dot in the current quadrant color and text "Now · 3:40 pm".
   - Moved tasks: collapsed group "Moved to tomorrow (3)" at the end; expanding shows them with "Bring back" buttons.
6. Bottom padding for the FAB and TabBar.

Empty states: no events → "No events today." with a link "Add an event"; no tasks → "Nothing on your list for today." with "Add a task".

**Add event** (small sheet from Today): title, kind (6 options), start time, end time, place (optional), prep items (optional, up to 3). Events are local only. (Calendar import is roadmap, not MVP.)

Acceptance: Today renders correctly with zero data, with demo data, and with long titles; the time marker updates every minute using `clock.now()`; the BridgeCard appears automatically when an event is ≤ 15 minutes away.

### 13.4 Check-in sheet (opens from the FAB anywhere)

Implemented as a full-height bottom sheet (`Sheet` from shadcn/ui) with its own step state. Focus is trapped inside; Escape closes with a confirmation only if text was typed ("Leave without saving?" Keep editing / Leave).

**Step 1 — What's going on?**
- H2: "What's going on?"
- Textarea (label visible: "In your own words"), 4 rows, placeholder "Say it however it comes out. Messy is fine." Max 600 characters with a quiet counter after 450.
- Mic button "Dictate" (hidden if unsupported). While listening: "Listening… tap to stop".
- Link button: "I don't have words right now" → Body path (13.4.1).
- Primary button: "Next" (disabled until text has ≥ 3 characters). Secondary: "Skip to the map" → opens Step 2 with the mood map only and no AI.
- On Next: run safety pre-check → if hit, crisis flow (Section 11.2). Else call `useAi('label')`.

**Step 2 — Here's what I'm hearing**
- H2: "Here's what I'm hearing" (literal mode: "These words might fit. Choose up to two.").
- Three EmotionCandidateCards (from AI or fallback). Each shows word, definition, and a ReadAloudButton.
- The AI follow-up question appears below the cards in `--ink-soft` (literal mode shows it as is, since the prompt already makes it literal).
- MoodMap with the dot placed at the average coordinates of the selected candidates (before selection: the first candidate). Moving the dot updates energy and pleasantness but does not change selected words.
- Link: "None of these" → full vocabulary list grouped by quadrant with literal subtitles, plus "Add my own word" input.
- Primary: "Next" (enabled when ≥ 1 emotion selected or the dot was moved).
- Loading state: skeleton cards + "Finding some words…".

**Step 3 — What might be behind it? (optional)**
- Chips (multi-select): Sleep, Food, People, Noise or place, The task, My body, Not sure.
- Buttons: "Next" and "Skip".

**Step 4 — What do you need right now?**
- Four large option buttons with one-line descriptions:
  - "Keep my plan" — "Go back to your day."
  - "Adjust my plan" — "See a lighter version of today."
  - "Regulate first" — "Try something short to feel steadier."
  - "Talk to someone" — "See people and services you can reach."
- On choose: save the CheckIn (Section 8.1), then:
  - keep → close sheet, toast "Checked in · {Quadrant}".
  - adjust → close sheet, open DayModeSheet.
  - regulate → navigate to `/toolkit` filtered to the current quadrant.
  - talk → navigate to `/support`.

#### 13.4.1 Body path

- H2: "That's okay. Let's start with your body."
- "Where do you notice it?" — tappable list (with an optional simple body outline SVG that mirrors the list; the list is the accessible control).
- "What does it feel like?" — chips.
- Sliders: Energy ("Running on empty" ↔ "Fully charged"), Comfort ("Very uncomfortable" ↔ "Very comfortable").
- Button: "Show me some words" → label route with `bodyCues`, `energyHint`, `pleasantnessHint` → Step 2.

Acceptance: complete check-in in under 60 seconds with keyboard only; the AI never auto-selects an emotion; "None of these" and custom word work; with AI disabled, fallback candidates appear instantly; safety path verified with a test phrase; saved CheckIn contains correct quadrant.

### 13.5 Tasks (`/tasks`)

- Segmented control at the top (mobile): "Not started (4) · In progress (1) · Stuck (1) · Done (3)". On ≥ 1024px: four columns side by side.
- Each column: TaskCards ordered by `order`; drag-and-drop to reorder or move (use `@dnd-kit/core` and `@dnd-kit/sortable` if needed; ensure keyboard sensors are enabled) **and** a "Move to…" menu on each card.
- Stuck column subtitle: "Stuck is information, not failure."
- "+ Add task" button (sticky at the top of the list): opens TaskForm sheet: Title (required), Type (6 icon buttons with labels), Energy cost (1–3, labeled "Light", "Medium", "Heavy"), Due date (optional; quick buttons "Today", "Tomorrow", "Pick a date"), and a checkbox "Break it down for me" (if checked, after saving, open Unstick with reason `too_big` to propose the first step; MVP does not generate full subtask lists).
- Moving a task to **In progress** sets `startedAt` (if empty). Moving to **Done** sets `doneAt`, creates a Win, and shows a calm toast "Done. Added to your proof log." Moving to **Stuck** opens the Unstick sheet.
- Each In progress card shows "I'm stuck" (opens Unstick) and "Focus" (opens `/focus/[taskId]` with the last suggested minutes or 10).

Acceptance: all moves possible without drag; counts update live; done tasks can be moved back; long titles wrap without breaking layout.

### 13.6 Unstick sheet

**Step 1 — What's making it hard?**
- H2: "What's making it hard?"
- Six option cards with literal descriptions:
  - "I don't know where to start"
  - "It feels too big"
  - "It's boring"
  - "I'm worried about how it will turn out"
  - "The place or noise"
  - "I don't have energy"
- If the task has a `parkingNote`, show it above: "You left off at: {note}".

**Step 2 — Your first step**
- Card titled "Your first step" with the step at 22px, ReadAloudButton.
- Line: "Try a {n}-minute block."
- If `strategyId` is returned: secondary card "Before {taskType} tasks, {strategy name} helped you {k} of {n} times. Want to do that first?" with buttons "Do it first" (opens the strategy with context `unstick`, then returns to this sheet) and "Skip".
- `why` text in `--ink-soft`.
- Buttons: "Start {n} min" (saves `firstStep`, sets status In progress, opens Focus), "Different step" (calls unstick again with `previousStep`), "Not now" (keeps status Stuck, closes).

Acceptance: the step is visibly different when the current quadrant changes (verify with demo data: ebb vs swell); "Different step" returns a smaller step; works with AI off.

### 13.7 Focus block (`/focus/[taskId]`)

- Full screen, no tab bar. Top: task title and the first step (if any) in a card. Close button "End" (top right).
- Center: WaterFill timer — a circle (220px) whose fill rises from bottom to top over the duration, color `--primary` at 25% opacity, numeric time in the center at 34px ("9:41"). Reduced motion: horizontal progress bar + numbers, no animation.
- Duration selector before starting: 5 / 10 / 15 / 25 minutes, preselected from the Unstick suggestion or the rule (ebb 5, surge 10, still 15, swell 25, no check-in 10).
- Controls: "Start", "Pause"/"Resume", "I'm done early".
- At the end (or "I'm done early" or "End"): outcome sheet "How did it go?" with "Got going", "A little", "Didn't start". "Didn't start" responds: "That's useful to know. Want a smaller step?" with buttons "Smaller step" (opens Unstick with `previousStep`) and "Not now".
- Save a FocusBlock record with `completed` and `outcome`.
- Timer uses timestamps (`clock.now()`), not interval counting, so it stays correct when the tab is in the background; optional vibration at the end if enabled.

Acceptance: timer accurate within 1s after backgrounding for 2 minutes; outcome saved; reduced-motion version works.

### 13.8 Bridge (transition coach)

**Trigger:** `src/lib/bridge.ts` exposes `getUpcomingTransition(now)`: the next event whose start is within 15 minutes and that does not already have a Transition record. The "from" is the current event if one is ongoing, else the task most recently in progress, else "what you're doing".

**BridgeCard on Today** (and as an in-app banner on other tabs): "Lab → Calculus · leave in 8 min" with button "Get ready". Optional browser notification is out of scope for the MVP.

**BridgeSheet** (opens from "Get ready"):
- Header: "{From} → {To}" and live countdown "{m} min until {to.title}".
- Pattern line (if hard_transition pattern exists for this pair): "Switching from lab to class has felt hard {k} of the last {n} times." In gentle mode add: "Let's make it easier."
- **1 · Close** — label: the AI `parkingPrompt` (fallback: "Where are you leaving off?"). Single-line input prefilled with the in-progress task title + ": " so the user only completes it. Mic button. Saving sets `task.parkingNote` and `transition.parkingNote`.
- **2 · Shift** — the suggested StrategyCard (AI pick among top 3 ranked candidates ≤ 180s) with "Start" (opens the strategy runner in context `bridge`) and "Something else" (shows the other candidates).
- **3 · Start** — checklist of `prepSteps` (checkboxes are local to the sheet).
- Footer: "Done, I'm going" (saves Transition) and TalkToAPersonButton.
- **After the event starts + 10 minutes** (or when the user next opens the app after that), show an inline prompt on Today: "How was the switch from {from} to {to}?" with "Easy · Okay · Hard". Save `rating`. If Easy/Okay, create a Win.
- When the user later returns to the parked task (opens Unstick or Focus for it), show "You left off at: {parkingNote}" first.

Acceptance: in demo mode at the scripted time, the BridgeCard appears; parking note is saved and shown on return; rating saved; pattern line uses real computed numbers.

### 13.9 Toolkit (`/toolkit`) and Strategy runner (`/toolkit/[id]`)

**Toolkit list:**
- Header: "For how you feel now: ● {Quadrant}" (from latest check-in within 6 hours; otherwise "Pick what fits right now"). Toggle "Show all".
- "Works for you" section: strategies with personal "better" rate ≥ 0.6 and n ≥ 2, with "Worked for you {k} of {n} times".
- Tabs by family: Move, Calm, Connect, Create, Think (each with icon + label and a one-line literal description).
- Grid (1 column on mobile, 2 on ≥ 640px) of StrategyCards sorted by the ranking in 9.4.
- Footer: TalkToAPersonButton.

**Strategy runner (`/toolkit/[id]?context=toolkit|bridge|unstick&ref=<id>`):**
- Top: name, duration, sensory badges, steps (numbered, each with ReadAloud).
- Body: the interactive tool (13.9.1) or StepsTimer.
- On finish (or "I'm done"): **ReCheck** — "How do you feel now compared to before?" with "Better", "Same", "Worse", and "Skip". Save StrategyUse with `result`. If "Better", create a Win. If "Worse", respond: "Thanks for telling me. Tide will suggest this less." Then return to the context (bridge sheet, unstick sheet, or toolkit).

#### 13.9.1 Interactive tools

- **BoxBreathing:** a 200px square path; a dot travels along the edges, 4 seconds per side; text in the center changes "Breathe in · 4", "Hold · 4", "Breathe out · 4", "Hold · 4" with the count. Default 2 minutes (7–8 cycles), "Stop" anytime. Reduced motion: no moving dot; only the text and count change. Screen reader: announce phase changes politely, not every second.
- **Grounding54321:** five sequential cards ("Name 5 things you can see", 4 feel, 3 hear, 2 smell, 1 taste). Each card has optional small inputs (or just "Next"). Progress "2 of 5".
- **Sudoku4x4:** 4×4 grid with 2×2 boxes, 5 hardcoded valid puzzles with their solutions (pick one at random or rotate). Tap a cell, then a number pad 1–4 and "Erase". No timer, no score. Button "Check" outlines mismatched cells with a dotted `--notice` border and the text "{n} cells to look at again" (never red, never "wrong"). Fully keyboard operable (arrow keys + number keys). "Show solution" available.
- **DoodleCanvas:** `<canvas>` with pointer events, 3 colors (ink, primary, a quadrant color) + "Clear"; soft 2-minute timer at the top; nothing is saved; provide an alternative text: "Drawing area. Draw anything; nothing is saved."
- **WalkTimer:** large countdown (3:00) with steps; "Start", "Pause", "I'm back". Vibration at the end if enabled.
- **BrainDump:** textarea (one item per line), 2-minute soft timer, mic button; safety pre-check on finish; then "Turn lines into tasks" lets the user tick which lines become tasks (type defaults to "other", energy 1); "Keep it here" discards (nothing saved by default).
- **MessageTemplate:** editable textarea prefilled with the template (substituting `{task}` when in unstick context); buttons "Copy" (clipboard) and "Done". Copy text: "Copied. Send it yourself when you're ready."
- **StepsTimer:** generic runner: numbered steps + a countdown of `durationSec` + "I'm done".

Acceptance: every tool works with keyboard and screen reader; reduced motion respected; re-check saved with correct context and references.

### 13.10 Patterns (`/patterns`)

- Header: "What works for you". Period toggle: "This week" / "Last 4 weeks".
- **PeriodDots:** a calendar strip (7 columns × up to 4 rows); each day shows up to 4 small dots colored by quadrant of that day's check-ins, with accessible text per day ("Tuesday, Nov 3: 2 check-ins, Ebb and Still"). Legend below with the four quadrant names and literal descriptions.
- **Pattern cards** (from engine + narrate): title, body, meta "{k} of {n} times · {period}", ConfidenceDots, "Why am I seeing this?" (WhyPanel: `whyText` + a list of the evidence records with date, time and outcome, e.g. "Tue Oct 27, 3:12 pm · 3-minute walk → writing · Got going"), and "Not true for me" (confirm dialog with optional reason chips: "It was a coincidence", "Something else explains it", "I just don't like it"; saves DismissedPattern; card animates out).
- **Top strategies:** list of strategies used in the period with a simple horizontal bar showing the "better" share and the text "{k} of {n} better" (bars are decorative; text carries the data).
- **Transitions:** "Hardest switch: {fromLabel} → {toLabel} ({k} of {n} hard)" if any rated transitions; else hidden.
- **Not enough data:** "Tide needs a few more check-ins and sessions to spot patterns. Nothing to do here yet." Show progress like "Patterns appear after at least 3 similar moments."
- Footer: "Patterns describe your data, not who you are. You decide what fits." + TalkToAPersonButton.

Acceptance: numbers on cards always equal engine output (test with demo seed); dismiss persists across reloads; works with AI off (template narration).

### 13.11 Proof log (`/proof`)

- Header: "Proof I can". Subtitle: "Things you did, kept here for the days that feel heavy."
- List grouped by day ("Today", "Yesterday", "Tue, Oct 27"), each WinItem with an icon by source and the text.
- Button: "+ Add a win" (free text, safety pre-check).
- Section "My rewards": user-defined micro-rewards list with add/remove; on Focus outcome "Got going", show one random reward as a suggestion: "You could take: {reward}." (only if rewards exist).
- No counts, totals, streaks or comparisons anywhere.

### 13.12 Settings (`/settings`)

Sections:

1. **Profile:** "Name (optional, only shown to you)".
2. **Comfort:** text size, extra spacing, theme, reduce motion, gentle vibration, read-aloud speed.
3. **How Tide talks:** communication mode cards (as onboarding).
4. **AI suggestions:** switch "Use AI suggestions"; text "About suggestions": what is sent, what is not, that suggestions can be wrong, and that fallbacks are used when AI is off or unavailable.
5. **People and support:** trusted contacts (add/edit/remove), campus support resource.
6. **Your data:** "Export my data" (JSON), "Delete everything" (confirm dialog).
7. **Demo:** switch "Demo mode (synthetic data)". Turning it on: confirmation dialog "This replaces what's on this device with example data for a fictional student. Your current data will be deleted. Export it first if you want to keep it." Turning it off: clears demo data.
8. **About:** "Tide is not a medical or mental health service. It doesn't diagnose or treat any condition." Credits: "Inspired by the circumplex model of emotion and Yale's RULER framework. Not affiliated with Yale." Version, team names placeholder, link to repository.

### 13.13 Support (`/support`)

Non-crisis version (crisis version in 11.2):
- H1: "Talk to a person".
- "People you trust" (trusted contacts with Call/Message buttons that open native apps) or an "Add someone" link.
- "At your school" (campus support) or "Add your campus support".
- "If you are in crisis" section with the crisis lines.
- Note: "Tide never contacts anyone for you."

### 13.14 DayModeSheet

- Opens from the banner or check-in step 4 ("Adjust my plan").
- H2: "Make today lighter". Two option cards: **Gentle** ("Keep what matters, move the rest. Energy budget: about 4 points.") and **Minimum** ("Only what can't wait. Energy budget: about 2 points."). Literal descriptions always shown.
- After choosing: call `daymode` route → show the proposal: rationale at the top, list "Keep today" and list "Move to tomorrow", each task with a toggle to switch sides (the user is in control). Energy total shown as text: "Kept energy: 4 of about 4".
- Buttons: "Use this plan" (saves DayPlan; moved tasks get `movedFrom` today and `movedTo` tomorrow; they stay in the board with a "Moved to tomorrow" label) and "Keep my day as it is".
- "Undo" toast for 10 seconds after applying.

Acceptance: no task is ever deleted; user toggles override AI; undo restores exactly; fallback works.

---
## 14. Demo mode, clock, seed data and cached responses

The live demo at the Launchpad lasts about 100 seconds inside slide 4. It must work even if the venue network fails.

### 14.1 Clock (`src/lib/clock.ts`)

```ts
// Real time normally. In demo mode, time starts at DEMO_START and advances
// at real speed from the moment demo mode was (re)started.
export const DEMO_START = new Date('2026-11-05T15:40:00-06:00').getTime(); // Thu 3:40 pm, Monterrey
export function now(): number { /* returns demo-adjusted time when demo mode is on */ }
```

- Store `demoStartedAt` (real epoch ms) in settings when demo mode is turned on or when the user taps "Restart demo" in Settings → Demo.
- `now() = DEMO_START + (Date.now() - demoStartedAt)` in demo mode; else `Date.now()`.
- Every component and lib function uses `now()`; never call `Date.now()` directly outside `clock.ts`. Add an ESLint rule or a simple test that greps for `Date.now(` outside `clock.ts`.
- Settings → Demo also offers "Jump to bridge moment" which sets the demo clock so that the Calculus class starts in 9 minutes (for rehearsals).

### 14.2 Seed data (`src/data/demo/seed.ts`)

Deterministic: use a small seeded PRNG (mulberry32 with seed 42) so the same data appears on every machine. The seed function clears all tables (except settings) and inserts the following. All titles are fictional.

**Persona settings:** name "Maya", communication mode "gentle", one trusted contact "Sofi (roommate)" with a placeholder number `+52 81 0000 0000` clearly fake, campus support placeholder "Student Wellbeing Center".

**Weekly schedule (events), for the 21 days ending on Thu Nov 5, 2026 (Oct 16 – Nov 5), plus Fri Nov 6:**

| Days | Event | Kind | Time | Place |
|---|---|---|---|---|
| Mon, Wed, Fri | Physics | class | 9:00–10:30 | Room 3-110 |
| Mon, Wed, Fri | Programming | class | 12:00–13:30 | Lab 2 |
| Mon, Wed | Part-time job (library) | work | 17:00–20:00 | Central Library |
| Tue, Thu | Chemistry lab | lab | 14:00–16:40 | Chem Lab B |
| Tue, Thu | Calculus | class | 16:50–18:20 | Room 4-203 |
| Sat | Groceries | self_care | 11:00–12:00 | — |

Calculus prep items: "Calculator", "Notes from Tuesday".

**Check-ins:** 1–3 per day at plausible times (morning, early afternoon, evening), distributed roughly: Ebb 35%, Still 25%, Surge 25%, Swell 15%. Tue/Thu afternoons skew to Surge or Ebb. Use vocabulary words matching the quadrant. Leave `text` empty for most historical check-ins (privacy-realistic) and include short texts on about 20%.

**Tasks:** about 25 historical tasks across types, most `done` with `doneAt` across the 3 weeks, plus the **demo-day board** (Thu Nov 5):

| Title | Type | Energy | Status | Due |
|---|---|---|---|---|
| Chemistry lab report | writing | 3 | in_progress | 2026-11-06 |
| Calculus problem set 7 | studying | 2 | not_started | 2026-11-06 |
| Read Physics chapter 4 | studying | 2 | not_started | 2026-11-09 |
| Email TA about lab data | admin | 1 | not_started | 2026-11-05 |
| Reply to group project chat | social | 1 | not_started | — |
| Laundry | chores | 2 | not_started | — |
| Programming quiz review | studying | 2 | done | 2026-11-04 |
| Pay phone bill | admin | 1 | done | 2026-11-03 |
| Lab outline | writing | 2 | done | 2026-10-29 |

**Planted patterns (must appear with these exact numbers in "Last 4 weeks"):**

1. `strategyBeforeTask:m-walk-3:writing` — 5 StrategyUses of "3-minute walk" each followed within 20 minutes by a FocusBlock on a writing task; 4 with `got_going`, 1 with `a_little`. Baseline writing focus blocks without a preceding strategy: 4 blocks, 1 `got_going` (25%). Expected card: 4 of 5, confidence 2.
2. `hardTransition:lab:class` — 4 rated transitions from Chemistry lab to Calculus: 3 `hard`, 1 `okay`. Box breathing was used in 2 of these transitions (1 `okay`, 1 `hard`) and not used in the other 2 (both `hard`), so the "with strategy" comparison has 2 vs 2. Expected card: 3 of 4, confidence 1.
3. `strategyEffect:c-box` — 5 uses of Box breathing re-checked: 4 `better`, 1 `same` (the 2 bridge uses from pattern 2 count among these 5). Expected card: 4 of 5, confidence 2.

To avoid accidental extra cards: leave the 3-minute walk uses without a re-check result (so no `strategyEffect:m-walk-3` card appears), and keep other strategies below 3 re-checked uses.
4. Sudoku used before writing 3 times with outcomes `didnt_start`, `a_little`, `got_going` (1 of 3) — must **not** produce a positive card (it should appear only in Top strategies as "1 of 3 better" if re-checked; re-check results: 1 better, 1 same, 1 worse).

Make sure no other random data accidentally creates additional patterns that pass thresholds; after seeding, run the engine in a unit test and assert exactly the expected keys appear (the team can relax this later).

**Wins:** generate from the seeded done tasks, easy/okay transitions and better re-checks, including "Finished: Lab outline" on Thu Oct 29 (a day with an Ebb check-in), so the WinCard on demo day reads: "Last Thursday felt like this too. You still finished: lab outline."

**Rewards:** "10 minutes of my game", "Tea break", "Text Sofi".

### 14.3 Demo script (what the app must support, in order)

| Time | Screen | Action | Expected result |
|---|---|---|---|
| 0:00 | Check-in | Type: "Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself." → Next | Candidates Drained, Frustrated, Overwhelmed; follow-up question |
| 0:15 | Check-in | Select Drained + Frustrated → Next → Skip → "Adjust my plan" | Check-in saved in Ebb; DayModeSheet opens |
| 0:25 | Day Mode | Choose Gentle → proposal → "Use this plan" | Keep: Chemistry lab report, Email TA about lab data, Calculus problem set 7 (or similar within budget); Move: Physics reading, Laundry, Group chat |
| 0:40 | Tasks | Move "Chemistry lab report" to Stuck → "I don't know where to start" | First step like "Open the report and type only the title and date."; suggestion "Before writing tasks, 3-minute walk helped you 4 of 5 times" |
| 1:05 | Today | (Rehearsal: "Jump to bridge moment") BridgeCard "Chemistry lab → Calculus · 9 min" → Get ready | Pattern line "felt hard 3 of the last 4 times"; parking note; Box breathing suggested; prep steps include Calculator, Room 4-203 |
| 1:25 | Patterns | Open → tap "Why am I seeing this?" on the walk card | Evidence list of 5 dated moments |

Note: in the real demo the team may start the demo clock at 4:31 pm instead of 3:40 pm so the bridge appears naturally; provide "Restart demo at bridge time" in Settings → Demo.

### 14.4 Cached responses (`src/data/demo/cachedResponses.ts`)

For the exact demo inputs (match by route + normalized text or task title + reason), store valid outputs for label, unstick (lab report + dont_know_start, and a "Different step" variant), daymode (gentle with the demo board), bridge (lab → calculus), and narrate (the three planted pattern keys). In demo mode, `useAi` races the live call against the cache: if the live call returns a valid response within the demo timeout, use it; otherwise use the cache. Mark `source: 'demo-cache'` for debugging (not shown to users).

---

## 15. PWA and performance

- `public/manifest.webmanifest`: name "Tide", short_name "Tide", display "standalone", background and theme colors from tokens (light `#F7F5F0` / `#1F5C63`), icons 192 and 512 (simple original wave mark, generated as SVG then exported to PNG; no third-party logos).
- A minimal service worker is optional; if added, cache only static assets (never API responses). If time is short, skip the service worker: "Add to Home Screen" with the manifest is enough.
- Performance targets on a mid-range phone: first load JS for Today < 250 KB gzipped; interaction to next paint feels instant; no layout shift on Today.
- Lazy-load heavy, rarely used pieces (DoodleCanvas, Sudoku, Patterns charts) with `next/dynamic`.
- Images: none required except icons; illustrations are inline SVG.

---

## 16. Testing and QA

### 16.1 Automated

- **Unit (Vitest):** quadrant mapping; pattern engine (Section 12.6); daymode fallback; unstick fallback table completeness (all 36 combinations exist); label fallback returns 3 distinct valid ids; safety detector (positive and negative phrases in English and Spanish, accents and casing); schemas accept the example outputs in Section 10.5 and reject malformed ones; clock in demo mode; win creation rules.
- **Component (Testing Library):** EmotionCandidateCard selection limit; TaskCard "Move to…" menu; ReCheck saves the right result.
- **DB (fake-indexeddb):** seed then compute patterns → exactly the planted keys.
- **API route tests:** with the Anthropic client mocked: valid output passes; invalid output triggers retry then error; extra-semantic checks (e.g., unknown candidate id) cause error → client fallback.

### 16.2 Flow tests (you write these, because nobody will click through for you)

Because the team is not checking each phase, you must prove the flows work. Write flow tests with Testing Library (rendering real components against `fake-indexeddb`, with `fetch` to `/api/ai/*` mocked) for:

1. **Check-in, words path:** type text → Next → three candidates appear → select two → Next → Skip → "Keep my plan" → a CheckIn exists with the right quadrant and two emotions.
2. **Check-in, wordless path:** "I don't have words right now" → choose body cues and sliders → candidates appear → select one → saved with `bodyCues`.
3. **Check-in, safety path:** type a test phrase from the keyword list → no AI call is made → crisis screen renders → the saved CheckIn has no `text` and `safetyTriggered: true`.
4. **Check-in, AI off:** with `aiEnabled = false`, candidates come from the fallback with no network call.
5. **Tasks:** add a task → move it to In progress with the "Move to…" menu → move it to Stuck → Unstick opens → choose a reason → a first step appears → "Start 10 min" navigates to focus.
6. **Focus:** start a 5-minute block with a fake clock → advance time → outcome sheet → "Got going" saves a FocusBlock.
7. **Day Mode:** an Ebb check-in shows the banner → "Show me" → Gentle → proposal → toggle one task → "Use this plan" → DayPlan saved, moved tasks labeled → Undo restores.
8. **Bridge:** an event 9 minutes away shows the BridgeCard → Get ready → parking note saved on the task → strategy started and re-checked → "Done, I'm going" saves a Transition → after the event + 10 minutes the rating prompt appears → rating saved → Win created.
9. **Toolkit:** open Box breathing → finish → re-check "Better" → StrategyUse saved with `better` → Win created.
10. **Patterns:** with seed data, the three planted pattern cards render with the exact numbers; "Why am I seeing this?" lists the evidence; "Not true for me" hides the card and persists after re-render.
11. **Settings:** text scale changes the root font size; Literal mode changes the Step 2 title; Delete everything empties the database.

### 16.3 Browser end-to-end (optional, do it if the environment allows)

If you can install Playwright and its Chromium browser in this environment, add `e2e/demo.spec.ts` that runs the demo script from Section 14.3 in demo mode against `next start`, at a 390×844 viewport, with the AI routes mocked to return the cached responses. If Playwright cannot be installed, skip this and rely on 16.2; record which you did in the log.

If you have a browser tool (for example a built-in browser or Chrome connection), also open the running app, click through the demo script yourself, and look at each screen at 390px and 1280px widths, in light and dark mode. Fix anything that looks broken, cramped or misaligned.

### 16.4 Manual QA checklist (run in Phase 10; leave the human-only items in TEAM_TODO)

Run what you can yourself (with tests, a browser tool, or Lighthouse via `npx lighthouse` if available) and list the rest for the team in `docs/TEAM_TODO.md`:

- Keyboard-only run of: check-in, add task, move to Stuck, unstick, focus, bridge, toolkit strategy, dismiss pattern.
- Screen reader smoke test (VoiceOver on iOS/macOS or NVDA on Windows) of Today and Check-in. (Human-only: list it in TEAM_TODO.)
- Reduced motion on: no moving animations anywhere.
- Text size 150%: no clipped text, no overlapping controls at 390px.
- Dark mode: all text readable; quadrant tints visible.
- AI off: every flow still works.
- Network offline: AI calls fail fast to fallback; no crashes.
- Safety: test phrase triggers the crisis screen; check-in saved without text.
- Demo mode: full scripted demo works twice in a row after "Restart demo".
- Lighthouse accessibility ≥ 95 on Today, Tasks, Check-in and Patterns.

---

## 17. Documentation and logs

These files are part of the competition submission. The GitHub repository is reviewed for structure, readability, documentation and attribution, and the judges read the AI Prompts PDF. You write all of them yourself and keep them current at every phase.

**Voice for every log and document you write:** first person, natural, plain English, like a careful engineer keeping a work journal. Use "I" for what you, Claude Code, did. Use "the team" for what the students did or must do. Be specific (file names, numbers, what broke and why). Be honest: you generated the code, and the logs say so plainly. No marketing language, no filler, no "In this phase, various improvements were made". Short paragraphs and short lists.

### 17.1 `CLAUDE.md` (create in Phase 0)

A one-page summary of the rules for any Claude Code session in this repo, so a resumed session behaves the same way. Include: the autonomous phase cycle (Section 1.3) and where to find the current progress (`docs/AI_DEV_LOG.md`), the comment voice rules (Section 1.7, with one bad and one good example), the non-negotiables (Section 2), the stack, the token rule (no raw hex in components), the copy catalog rule, the clock rule (`now()` only), the AI rule (server-side only, zod on every input and output, fallbacks always), the repo rule (database writes only through `src/lib/repo/*`), file size guidance, the log-keeping duties (Section 17), and "refer to `docs/TIDE_BUILD_PROMPT.md` for details". Keep it under ~150 lines.

### 17.2 `AI_ATTRIBUTION.md` (create in Phase 0, update every phase)

Structure and tone:

```markdown
# AI Attribution

I'm Claude Code, the AI coding assistant the Tide team used to build this
app. The challenge organizers allowed fully AI-generated code, so I wrote
the application code, tests and most of the documentation in this
repository from the team's product specification
(docs/TIDE_BUILD_PROMPT.md). The team designed the product, ran the
research with our Challenge Partner, and owns the pitch. This file lists
what I generated and what came from elsewhere.

## Tools
- Claude Code (Anthropic) — generated the application code, tests and docs.
- Claude (claude.ai) — helped the team draft the product proposal, the build
  specification and the first versions of the AI prompts.

## Generated files
| File or folder | What it is | Generated by | Notes |
|----------------|------------|--------------|-------|
| src/lib/quadrant.ts | Maps mood-map numbers to Tide's four states | Claude Code | Covered by quadrant.test.ts |
| ... | ... | ... | ... |

## AI prompts used inside the app
The five system prompts in /prompts started as drafts in the team's
specification. I implemented them as written, with these changes: <list
any change you made and why, or "none">. The AI Prompts PDF is generated
from /prompts-doc.

## Product content
The emotion vocabulary, strategy library, safety keyword list and crisis
resources come from the team's specification. The team will review them
with their Challenge Partner (see docs/TEAM_TODO.md).

## External libraries
| Library | What we use it for | License |
|---------|--------------------|---------|
| Next.js | App framework | MIT |
| ... | ... | ... |

## External code and references
| Source | Where it's used | License or terms |
|--------|-----------------|------------------|
| <documentation example adapted, if any> | <file> | <license> |

## Inspiration and credits
The four-state mood map is inspired by the circumplex model of emotion and
Yale's RULER framework. Tide is not affiliated with Yale.
```

Rules: one row per file or tight folder group (e.g. `src/components/toolkit/tools/*`); every dependency in `package.json` appears in the libraries table with its license (read it from `node_modules/<pkg>/package.json`); if you adapted a documented example (for instance a shadcn/ui component or a dnd-kit pattern), cite it.

### 17.3 `docs/AI_DEV_LOG.md` — the AI development log (bitácora)

This is the main AI usage log. Create it in Phase 0 with an introduction, then add two entries per phase: "Before Phase N" (understanding) and "After Phase N" (what happened). Templates are in Appendix B. Example of the right voice:

```markdown
## Before Phase 4 — Today and Day Modes
2026-10-28, 23:40

This is the part of Tide where the check-in actually changes Maya's day.
Today is her home screen: it shows how she checked in and offers a lighter
plan when she's running low. Everything here reads from the check-ins and
tasks I built in Phases 2 and 3, and writes DayPlans that the board and
the pattern engine will read later.

What "done" means for me: the banner only appears under the three rules in
13.3, no task is ever deleted by a plan, undo puts everything back exactly
as it was, and the "Now" marker moves on its own.

What worries me: time. The marker, the banner and the next-event card all
depend on the clock, and if any of them calls Date.now() directly, demo
mode will show the wrong afternoon on stage. The guard test from Phase 0
should catch that, so I'll keep it green.

## After Phase 4 — Today and Day Modes
2026-10-29, 01:15

**What I built**
- Today with the state card, the win card, the Day Mode banner, the next
  event card and the Tide Line (components/today/*).
- The Day Mode sheet with per-task toggles and a 10-second undo.

**How I checked it**
- lint ok, typecheck ok, 64 tests passing, build ok.
- Flow test 7 walks the banner → Gentle → toggle → apply → undo path.

**What broke and how I fixed it**
- Undo restored the tasks but left the DayPlan behind, so the banner never
  came back. I now delete the plan in the same transaction.

**Decisions**
- D9: the energy total counts kept tasks only (details in DECISIONS.md).

**Known issues**
- None that I know of.

**Commit:** 3f2a91c feat(today): add Today screen and Day Modes

Next: Phase 5, the toolkit.
```

### 17.4 `docs/DECISIONS.md`

A short numbered list of decisions you made where the spec was silent or ambiguous, each with the date, the decision, the reason, and the alternative you rejected. Example: "D7 — 2026-10-29 — I used @dnd-kit for drag and drop because it ships keyboard sensors; the native HTML5 drag API has no keyboard support."

### 17.5 `docs/progress/YYYY-MM-DD.md` — daily progress report drafts

The handbook requires daily progress reports until November 5. Draft one file per calendar day you work, in the team's voice ("we"), because the team submits it; state plainly that Claude Code generated the code. Keep each under ~250 words:

```markdown
# Tide — Progress report, Thursday, October 29, 2026

**Team:** <team name> · **Launchpad:** Monterrey

## What we got done
- Claude Code built the check-in flow end to end: ...
- ...

## What we learned / changed
- ...

## AI use today
Claude Code generated the code for <modules>, following our build spec.
Details are in docs/AI_DEV_LOG.md and AI_ATTRIBUTION.md.

## Next
- ...

## Blockers or help needed
- <none, or specific>
```

Only include facts you know. Anything about research or the team's own work goes in as a placeholder line ("<Partner interview notes — team to fill>"), never invented.

### 17.6 `docs/CODE_WALKTHROUGH.md`

A guide that lets any student explain the code to a reviewer in a few minutes. Organized by module (Shell, Data, AI layer, Safety, Check-in, Tasks/Unstick/Focus, Today/Day Mode, Bridge, Toolkit, Patterns, Proof log, Settings/Onboarding/Support, Demo mode). For each module:

- what it does for the user, in two sentences;
- the files involved, each with one line;
- how data flows (what it reads, what it writes);
- one or two decisions worth defending, and why;
- three likely reviewer questions with short answers.

End with a "How to answer 'how does the AI work?' in 60 seconds" paragraph. Write it in natural first person where you explain your choices ("I split the pattern engine into one file per rule so each rule can be tested on its own").

### 17.7 `docs/TEAM_TODO.md`

A checklist of everything only humans can do, with why and by when. At minimum:

- [ ] Add `ANTHROPIC_API_KEY` to `.env.local` and to Vercel (exact steps).
- [ ] Deploy to Vercel (exact steps, Section 18 Phase 9).
- [ ] Verify the crisis numbers in `src/data/resources.ts` (Línea de la Vida, 988, 911) and review the safety keyword list with the Challenge Partner.
- [ ] Review the emotion vocabulary and strategy library with the Challenge Partner.
- [ ] Run 2–3 user tests through the Challenge Partner; fill `docs/research-to-design.md`; tell Claude Code what to change (iteration message, Appendix C).
- [ ] Screen reader smoke test on a real phone.
- [ ] Record the backup demo video following `docs/demo-script.md`.
- [ ] Take screenshots for the README and the deck.
- [ ] Fill team names, team name and university in README, `/prompts-doc` and progress reports.
- [ ] Submit daily progress reports from `docs/progress/`.
- [ ] Print `/prompts-doc` to PDF and upload it.
- [ ] Final check of all submission links from a device not logged into any team account.

Add items as they come up during the build.

### 17.8 `README.md` (outline; create in Phase 0, finalize in Phase 9)

1. Tide in one paragraph + the one-liner.
2. The problem and the thesis (short).
3. Screenshots (placeholder section for the team).
4. Features, by module, in plain words.
5. How the AI is used (the five routes, "the code calculates, the AI explains"), plus what the AI never does.
6. Responsible AI: autonomy, privacy, limits, accessibility, human support.
7. Architecture overview + folder map (link to `docs/architecture.md`).
8. Run locally: prerequisites (Node LTS), `npm install`, copy `.env.example` to `.env.local`, add the key, `npm run dev`, `npm test`.
9. Demo mode instructions (link to `docs/demo-script.md`).
10. Team and roles (placeholders).
11. Research partner and what changed because of research (link to `docs/research-to-design.md`; no private data).
12. How this was built: AI-generated code with Claude Code; links to `AI_ATTRIBUTION.md` and `docs/AI_DEV_LOG.md`.
13. Credits: RULER and circumplex inspiration; not affiliated with Yale.
14. License (MIT).

### 17.9 AI Prompts PDF page (`/prompts-doc`)

Build a print-friendly page at `/prompts-doc` (not linked from the app navigation) that renders, in order: title "Tide — AI Prompts", team/project name placeholders, a one-paragraph overview of the AI architecture, then for each route: purpose, model tier, input schema (pretty-printed from the zod schema or a hand-written mirror), system prompt (shared preamble + route prompt, read from `/prompts` at build time), output schema, one real example input/output (from Section 10.5 or cached demo responses), validation rules, fallback behavior, and safety handling. Add a final section "Safety and formatting guidelines" summarizing the rules embedded in the prompts. Add `@media print` styles (A4/Letter, page breaks between routes, monospace for schemas, no app chrome). The team prints it to PDF from the browser.

### 17.10 `docs/architecture.md`

Short text plus a Mermaid diagram of: client components → repo functions → Dexie; client → `useAi` → `/api/ai/*` → Anthropic; safety layer before any AI call; pattern engine (client) → narrate route; demo clock and cached responses.

### 17.11 `docs/demo-script.md`

The 100-second demo from Section 14.3 as a table (time, screen, operator action, what the narrator says in English, what should appear), followed by: how to prepare the device, how to restart demo mode, what to do if the network fails (cache), what to do if the app fails (switch to video), and a pre-show checklist.

### 17.12 `docs/research-to-design.md`

A template the team fills: assumptions before research, what the partner showed, what changed in the product, a sentence in the form "We assumed ___. Our partner showed us ___. So we changed ___." Do not invent content; use placeholders.

---

## 18. The ordered build plan

Work through these phases in order, without waiting for approval between them. Each phase lists: what to read first, why it exists, the build steps in order, how to verify, and the acceptance criteria. Apply the phase cycle from Section 1.3 to every phase.

The target calendar for the team is: build everything as soon as possible (ideally within the first one or two days), leave November 2 for user tests with the Challenge Partner, November 3 for iteration and the backup video, November 4 for submission documents, and November 5 as a freeze day. You don't need to wait for any date; just build.

### Phase 0 — Foundation

**Read first:** Sections 1–9, 15, 17.1–17.8.

**Why:** everything else sits on this: tooling, tokens, layout, data layer, clock, settings, content and the log files.

**Build steps (in order):**

1. Check the folder. If it already contains files the team created, read them and keep them; do not overwrite.
2. Initialize Next.js (App Router, TypeScript strict, Tailwind, ESLint, `src/` directory, alias `@/*`). Use the official create command non-interactively.
3. Add dev tooling: Prettier, Vitest + `@vitejs/plugin-react` + jsdom, Testing Library (`react`, `user-event`, `jest-dom`), `fake-indexeddb`. Create `vitest.config.ts` and `src/test/setup.ts` (jest-dom matchers, fake-indexeddb auto import, a fixed timezone `America/Monterrey`).
4. Add runtime dependencies: `dexie`, `dexie-react-hooks`, `zod`, `@anthropic-ai/sdk`, `framer-motion`, `lucide-react`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
5. Initialize shadcn/ui and add only: button, sheet, dialog, tabs, switch, slider, toast (or sonner, whichever the installed shadcn uses), tooltip, radio-group, checkbox, dropdown-menu.
6. Add npm scripts (Section 4.2) and `.env.example`, `.gitignore`, `LICENSE` (MIT, copyright "the Tide team").
7. Implement design tokens (Section 6.2–6.5) in `globals.css` and the Tailwind config, with light and dark values, quadrant colors and tints, text scale and extra spacing driven by CSS variables on `<html>`.
8. Load Atkinson Hyperlegible with `next/font/google` in `src/app/layout.tsx`; set `lang="en"`.
9. Write `src/lib/types.ts` (Section 8.1), `src/lib/db.ts` (Section 8.2), `src/lib/clock.ts` (Section 14.1, including demo support from the start), `src/lib/time.ts` (formatters like "3:40 pm", "Thursday, November 5", "Due tomorrow", "in 70 min"), `src/lib/quadrant.ts` with tests.
10. Write `src/lib/repo/` with one file per table group: `checkins.ts`, `tasks.ts`, `events.ts`, `focus.ts`, `strategies.ts` (StrategyUse), `transitions.ts`, `wins.ts`, `rewards.ts`, `patterns.ts` (dismissed), `dayPlans.ts`, `settings.ts`. Each exports small, typed functions. Win creation rules (Section 8.3) live in `repo/wins.ts` and are called from the other repo functions.
11. Write the settings provider `src/lib/settings.tsx` with all keys in Section 7.2, defaults, a `useSettings()` hook, the theme and text-scale application to `<html>`, a `localStorage` mirror for theme and scale to avoid a flash on load, and `useReducedMotionPref()`.
12. Write the content files: `src/data/emotions.ts` (all 48 from Section 9.1), `src/data/taskTypes.ts`, `src/data/strategies.ts` (all 20 from Section 9.4, with full steps), `src/data/resources.ts` (Section 11.2), `src/copy/en.ts` (all of Appendix A, including mode variants).
13. Build the app shell (Section 13.1): `PhoneFrame`, `TopBar` with profile menu, `TabBar`, `CheckInFab`, the `(app)` layout, and placeholder pages for every route with their real titles. The FAB opens an empty sheet for now. Leave the onboarding redirect from Section 13.1 for Phase 8, when the onboarding page exists.
14. Write `src/lib/strategyRank.ts` (Section 9.4 ranking) with tests, since several later phases use it.
15. Create the docs scaffolding: `CLAUDE.md`, `AI_ATTRIBUTION.md`, `README.md` skeleton, `docs/AI_DEV_LOG.md` (intro + "What I understood" entry, see Appendix B), `docs/DECISIONS.md`, `docs/CODE_WALKTHROUGH.md` skeleton, `docs/TEAM_TODO.md` (initial list from 17.7), `docs/progress/2026-10-28.md`, and the `/prompts` files with the drafts from Section 10.5.
16. Add a test that fails if `Date.now(` appears in `src/` outside `src/lib/clock.ts`, and one that fails if a raw hex color appears in `src/components/`.
17. Initialize git if needed, commit.

**Verify:** all four checks green; the app runs; the four tabs navigate; theme and text scale apply; Dexie opens in the browser; tests for quadrant, ranking, clock and the two guard tests pass.

**Acceptance:** Section 13.1 criteria; no secrets anywhere; every file has a natural header comment.

### Phase 1 — AI plumbing and safety layer

**Read first:** Sections 2.2, 10 (all), 11 (all), 16.1.

**Why:** every feature that suggests something goes through this layer, and the safety layer must exist before any free text is collected.

**Build steps:**

1. `src/lib/ai/schemas.ts` — every schema in Section 10.4, plus the extra semantic checks as separate functions (`checkLabelOutput(input, output)`, etc.).
2. `src/lib/ai/prompts.ts` — reads `/prompts/*.md` with `fs` on the server and composes `preamble + route prompt`.
3. `src/lib/ai/client.ts` — `callJson` exactly as Section 10.2 (timeout, one retry with the validation error, typed `AiError`). Check the installed SDK's types first.
4. `src/lib/ai/rateLimit.ts` — in-memory sliding window per IP.
5. The five route handlers under `src/app/api/ai/*/route.ts`, sharing a small `handleAiRoute()` helper (rate limit → validate input → call → validate output → semantic check → envelope). Server logs only route, status, latency, fallback flag.
6. `src/app/api/config/route.ts` — returns non-secret client config (timeouts, whether a key is configured as a boolean, never the key).
7. `src/lib/ai/fallbacks.ts` — all five fallbacks from Section 10.6, including the complete 36-entry unstick table (write every entry, literal and specific) and the label keyword lexicon.
8. `src/lib/ai/useAi.ts` — client hook with `aiEnabled`, safety pre-check, timeout, fallback, demo-cache race (the cache file can be empty until Phase 8), `source` reporting, and an `aria-live` friendly status.
9. `src/lib/safety/keywords.ts` and `detect.ts` (accent- and case-insensitive phrase matching), with English and Spanish tests, including negative cases ("this deadline is killing me" must not trigger; decide carefully and document the choice).
10. `src/components/safety/CrisisScreen.tsx`, `TalkToAPersonButton.tsx`, and the `/support` page (Section 13.13 and 11.2), using `resources.ts` and settings contacts.
11. Tests: schemas accept the 10.5 examples and reject malformed ones; `callJson` with a mocked SDK (valid, invalid-then-valid, invalid twice, timeout, missing key); each route's semantic checks; fallbacks; safety detector.

**Verify:** checks green; calling a route without a key returns `missing_key` and the hook falls back; with a key (if present), the label example returns valid JSON.

**Acceptance:** no client bundle contains the key or the SDK (check the build output or grep `.next/static` for `anthropic`); safety screen renders with working `tel:` links.

### Phase 2 — Check-in "Name it"

**Read first:** Sections 3.7, 6.7 (StateChip, MoodMap, EmotionCandidateCard), 7, 9.1–9.2, 13.4, Appendix A (Check-in).

**Why:** this is the heart of Tide and the first thing in the demo.

**Build steps:**

1. `src/lib/speech.ts` — dictation (Web Speech API, feature-detected) and read-aloud (`speechSynthesis`, rate from settings).
2. UI pieces: `StateChip`, `ReadAloudButton`, `ConfidenceDots`, `EnergyDots` in `components/ui/`.
3. `MoodMap` with pointer drag, keyboard support, accessible announcements, and the "Use sliders instead" alternative.
4. `EmotionCandidateCard` with the max-two rule.
5. `CheckInSheet` with its step state machine and the four steps (`StepWhat`, `StepHearing`, `StepBehind`, `StepNeed`), `BodyPath`, the "None of these" full list with custom word, the leave-confirmation, focus trapping, and loading/skeleton states.
6. Wire the sheet to `useAi('label')`, the safety pre-check, and `repo/checkins.createCheckIn`.
7. Wire the four needs: keep (toast), adjust (opens the DayModeSheet entry point — create a placeholder hook `useDayModeSheet()` now that Phase 4 will fill), regulate (navigate to `/toolkit`), talk (navigate to `/support`).
8. Show the latest check-in on Today's StateCard (simple version; Phase 4 completes Today).
9. Flow tests 1–4 from Section 16.2.

**Verify and accept:** Section 13.4 acceptance criteria; check-in completes with keyboard only; AI never preselects an emotion.

### Phase 3 — Tasks, Unstick and Focus

**Read first:** Sections 6.7 (TaskCard), 8.1 (Task, FocusBlock), 9.3, 10.4–10.6 (unstick), 13.5–13.7, Appendix A (Tasks, Unstick, Focus).

**Why:** this is where a feeling turns into a first step.

**Build steps:**

1. `TaskCard`, `TaskForm` (sheet), `StateColumn`, `TaskBoard` (segmented control on mobile, four columns at ≥ 1024px), "Move to…" menu, and dnd-kit with keyboard sensors and screen-reader announcements.
2. Repo functions for status changes with side effects: `startedAt`, `doneAt`, win creation, order handling.
3. `UnstickSheet` (two steps), wired to `useAi('unstick')`, `helpfulStrategies` built from the pattern-engine helper for strategy-before-task (if the engine doesn't exist yet, write the small query now in `src/lib/patterns/rules/strategyBeforeTask.ts` and reuse it in Phase 6), the "Do it first" path into the strategy runner (route exists from Phase 5; until then link to `/toolkit/[id]` and finish wiring in Phase 5), "Different step" with `previousStep`, and the parking note display.
4. Focus page `/focus/[taskId]`: duration selector with the rule, `WaterFill` (and reduced-motion bar), timestamp-based timer, pause/resume, end early, outcome sheet, reward hint, "Smaller step" path, FocusBlock saving, optional vibration.
5. "Break it down for me" path from TaskForm.
6. Flow tests 5–6 from Section 16.2.

**Verify and accept:** Sections 13.5–13.7 criteria; unstick returns a different step for Ebb and Swell for the same task (test with mocked AI using the fallback table and with the real prompt if a key is present).

### Phase 4 — Today and Day Modes

**Read first:** Sections 13.3, 13.14, 8.1 (DayPlan), 10.4–10.6 (daymode), Appendix A (Today).

**Why:** Today is the home screen, and Day Modes are the first adaptation the user sees.

**Build steps:**

1. `src/lib/daymode.ts`: the recommendation rules, energy budgets (gentle 4, minimum 2) and the deterministic plan.
2. Today components: `TodayHeader`, `StateCard` (complete, with WinCard), `DayModeBanner`, `NextTransitionCard`, `TideLine` with the "Now" marker updating every minute, "Earlier today" collapse, "Today's tasks" group, moved group with "Bring back", empty states, and the Add Event sheet.
3. `DayModeSheet`: choose mode → AI proposal → per-task toggles → energy total → "Use this plan" → DayPlan saved, tasks marked moved → Undo toast for 10 seconds that restores exactly.
4. Fill the `useDayModeSheet()` entry point from Phase 2.
5. Flow test 7 from Section 16.2.

**Verify and accept:** Sections 13.3 and 13.14 criteria; no task is ever deleted.

### Phase 5 — Toolkit and strategy runner

**Read first:** Sections 9.4, 13.9 (all), 6.6, 7, Appendix A (Toolkit).

**Why:** regulation is step 4 of the loop and is used from Unstick, Bridge and the toolkit itself.

**Build steps:**

1. `StrategyCard`, Toolkit page with quadrant header, "Works for you", family tabs, ranking.
2. Strategy runner page `/toolkit/[id]` with `context` and `ref` query params, steps with read-aloud, the tool area, and `ReCheck`; returns to the right place for each context.
3. All eight tools: `BoxBreathing`, `Grounding54321`, `Sudoku4x4` (with five hardcoded valid puzzles and solutions, tested for validity), `DoodleCanvas`, `WalkTimer`, `BrainDump` (with safety pre-check and "Turn lines into tasks"), `MessageTemplate` (with `{task}` substitution and clipboard), `StepsTimer`. Lazy-load the heavier ones.
4. Finish the "Do it first" path from Unstick.
5. Flow test 9 from Section 16.2, plus a test that every strategy in `strategies.ts` maps to an existing tool component.

**Verify and accept:** Section 13.9 criteria; reduced motion respected in every tool.

### Phase 6 — Bridge

**Read first:** Sections 13.8, 8.1 (Transition), 10.4–10.6 (bridge), 12.4 (hard_transition), Appendix A (Bridge).

**Why:** transitions are where Maya's days fall apart; this is one of the three moments of the demo.

**Build steps:**

1. `src/lib/bridge.ts`: `getUpcomingTransition(now)` and the "from" resolution, plus `getPendingRating(now)`.
2. `BridgeCard` on Today and as a small banner on the other tabs; `BridgeSheet` with Close (parking note with prefill and dictation), Shift (AI-picked strategy among ranked candidates ≤ 180 s, "Something else"), Start (prep checklist), the pattern line, footer actions.
3. Transition saving, parking note propagation to the task, the after-event rating prompt on Today, and Win creation.
4. "You left off at" shown first when returning to a parked task (Unstick and Focus).
5. Flow test 8 from Section 16.2.

**Verify and accept:** Section 13.8 criteria.

### Phase 7 — Pattern engine, Patterns screen and Proof log

**Read first:** Sections 12 (all), 13.10, 13.11, 10.4–10.6 (narrate), Appendix A (Patterns, Proof log).

**Why:** this is step 6 of the loop and the part that makes Tide personal.

**Build steps:**

1. Engine: `confidence.ts`, the four rule files, `engine.ts`, and every test in Section 12.6.
2. Narration: call `/api/ai/narrate` with facts only; in-memory cache by `key + k + n`; template fallback; the digit check from Section 10.4.
3. Patterns screen: period toggle, `PeriodDots` with legend and per-day accessible text, `PatternCard`, `WhyPanel` with evidence rows, "Not true for me" dialog with reasons, `TopStrategies`, `TransitionsSummary`, not-enough-data state, footer.
4. Wire `helpfulStrategies` (Unstick) and the hard-transition line (Bridge) to the engine so all numbers come from one place.
5. Proof log page: grouped wins, "Add a win" with safety pre-check, "My rewards".
6. Flow test 10 from Section 16.2 (using a small fixture now; the full seed comes in Phase 8).

**Verify and accept:** Sections 13.10 and 13.11 criteria; numbers on cards always equal engine output.

### Phase 8 — Onboarding, Settings, demo mode and seed data

**Read first:** Sections 13.2, 13.12, 14 (all), 15, Appendix A (Global).

**Why:** onboarding and settings complete the product; demo mode makes the stage demo reliable.

**Build steps:**

1. Onboarding (three steps, skip anywhere, applies preferences immediately) and the redirect from the shell.
2. Settings page with every section in 13.12, including export (JSON download) and delete everything.
3. Seed data exactly as Section 14.2, with the seeded PRNG, the planted patterns, wins and rewards; the engine assertion test.
4. Demo mode: switch with confirmation, `demoStartedAt`, "Restart demo", "Restart demo at bridge time", "Jump to bridge moment", the "Demo data" badge.
5. Cached responses for every demo input (Section 14.4) and the race logic in `useAi`.
6. `docs/demo-script.md` (Section 17.11).
7. PWA manifest and icons (simple original wave mark drawn as SVG, exported to PNG with a small Node script using `sharp` if available, or committed as SVG plus PNGs generated another way; document how).
8. Performance pass: lazy loading, bundle check for Today.
9. Flow test 11 from Section 16.2, and, if possible, the Playwright demo test (Section 16.3).

**Verify and accept:** the scripted demo works twice in a row with the network mocked as offline (cache) and with the AI mocked as online.

### Phase 9 — Submission documents and deployment readiness

**Read first:** Section 17 (all), Section 2.1.

**Why:** the repository, the prompts PDF and the docs are graded too.

**Build steps:**

1. `/prompts-doc` print page (Section 17.9).
2. Final `README.md` (Section 17.8).
3. `docs/architecture.md` with the Mermaid diagram.
4. Complete `docs/CODE_WALKTHROUGH.md` for every module.
5. `docs/research-to-design.md` template.
6. `AI_ATTRIBUTION.md` completeness: compare every file in `src/`, `prompts/`, `docs/`, `e2e/` and the root against the table; add every dependency with its license.
7. Deployment readiness: `next build` clean, no warnings you can fix, `vercel.json` only if needed. Write exact Vercel steps in `docs/TEAM_TODO.md` (import repo, set `ANTHROPIC_API_KEY`, `TIDE_MODEL_FAST`, `TIDE_MODEL_SMART` and the other variables, deploy, open on a phone, run the demo). If the Vercel CLI is installed and already authenticated, you may deploy a preview yourself; otherwise leave it to the team.
8. Secret scan: search the repo and git history for anything key-like (`sk-ant`, `ANTHROPIC_API_KEY=` with a value, long base64 strings). Fix anything found and note it in the log.
9. Remove dead code, unused files and stray logs.

**Verify and accept:** every document exists and is accurate; the build is clean; no secrets.

### Phase 10 — Full audit and fixes

**Read first:** Sections 13 (every acceptance block), 16.4, 19, Appendix A.

**Why:** you built a lot in one run; this is where you make sure nothing is missing or broken.

**Steps:**

1. Go through every acceptance criterion in Sections 13.1–13.14 one by one. For each, find the code and the test that proves it. Write a table in the log ("criterion → where → status"). Fix every gap.
2. Walk the core loop end to end with demo data (via tests and, if available, a browser): check-in → Gentle plan → Stuck → unstick → focus → bridge → strategy → re-check → patterns with evidence.
3. Run the QA checklist in Section 16.4 as far as you can; put human-only checks in TEAM_TODO.
4. Read every user-facing string in `en.ts` once more for tone: kind, literal-friendly, no guilt, no emojis, no clinical labels.
5. Read every comment header for the voice rules in Section 1.7; rewrite any robotic or generic comment.
6. Check the Definition of Done (Section 19) and tick every item in the log.
7. Write the final AI_DEV_LOG entry ("Where Tide stands"), today's progress report draft, and update TEAM_TODO.
8. Final commit (and push if possible). Then stop and give the team a short summary: what's built, how to run it, what's in TEAM_TODO, and anything that didn't make it.

---

## 19. Definition of done

- [ ] Every module (M1–M7) and every screen in Section 13 is implemented, with no stubs, placeholders or "coming soon" text in the app.
- [ ] The core loop works end to end: check-in → day mode → unstick → focus → bridge → strategy → re-check → pattern with evidence.
- [ ] Every AI feature has a working deterministic fallback; the app works with AI off and with no API key.
- [ ] Safety layer tested in English and Spanish; crisis screen works; check-ins that trigger it store no text.
- [ ] No API keys or private data in the repository or its history; the SDK and key never reach the client bundle.
- [ ] Accessibility: keyboard-only flows work, reduced motion respected, text at 150% works, dark mode readable, Lighthouse accessibility ≥ 95 where measurable.
- [ ] All UI copy in English, centralized in `src/copy/en.ts`, with mode variants where Appendix A marks them.
- [ ] All times from `now()`, all colors from tokens, all writes through `src/lib/repo/*` (guard tests pass).
- [ ] Unit, flow and (if possible) end-to-end tests pass; `lint`, `typecheck` and `build` are clean.
- [ ] Demo mode reproduces the 100-second script reliably, online and offline.
- [ ] Every file has a natural header comment; comments follow Section 1.7.
- [ ] `README.md`, `CLAUDE.md`, `AI_ATTRIBUTION.md` (complete), `docs/AI_DEV_LOG.md` (every phase, before and after), `docs/DECISIONS.md`, `docs/CODE_WALKTHROUGH.md`, `docs/TEAM_TODO.md`, `docs/architecture.md`, `docs/demo-script.md`, `docs/research-to-design.md` (template), `docs/progress/` drafts, `/prompts` and `/prompts-doc` are present and accurate.
- [ ] The same project name ("Tide") appears in the app, repo and documents.

---

## Appendix A — Copy catalog (key strings)

Put these in `src/copy/en.ts` as a typed object. Entries marked (G/D/L) need gentle, direct and literal variants; the literal variant is listed when it differs.

**Global**
- appName: "Tide"
- tagline: "Plan for the brain you have right now."
- talkToPerson: "Talk to a person"
- readAloud: "Read aloud"
- dictate: "Dictate"
- listening: "Listening… tap to stop"
- skip: "Skip"
- next: "Next"
- notNow: "Not now"
- undo: "Undo"
- demoBadge: "Demo data"
- notMedical: "Tide is not a medical or mental health service. It doesn't diagnose or treat any condition."
- aiOff: "AI suggestions are off. You're seeing simple built-in suggestions."

**Quadrants (name + literal subtitle)**
- surge: "Surge" — "High energy, unpleasant"
- swell: "Swell" — "High energy, pleasant"
- ebb: "Ebb" — "Low energy, unpleasant"
- still: "Still" — "Low energy, pleasant"

**Check-in**
- step1Title: "What's going on?"
- step1Label: "In your own words"
- step1Placeholder: "Say it however it comes out. Messy is fine."
- noWords: "I don't have words right now"
- skipToMap: "Skip to the map"
- loadingLabel: "Finding some words…"
- step2Title (G/D/L): "Here's what I'm hearing" / "Possible words" / "These words might fit. Choose up to two."
- noneOfThese: "None of these"
- addOwnWord: "Add my own word"
- maxTwo: "You can pick up to two."
- step3Title: "What might be behind it?"
- causes: Sleep · Food · People · Noise or place · The task · My body · Not sure
- step4Title: "What do you need right now?"
- needKeep: "Keep my plan" — "Go back to your day."
- needAdjust: "Adjust my plan" — "See a lighter version of today."
- needRegulate: "Regulate first" — "Try something short to feel steadier."
- needTalk: "Talk to someone" — "See people and services you can reach."
- saved: "Checked in · {quadrant}"
- bodyTitle: "That's okay. Let's start with your body."
- bodyWhere: "Where do you notice it?"
- bodyFeel: "What does it feel like?"
- energySlider: "Running on empty" ↔ "Fully charged"
- comfortSlider: "Very uncomfortable" ↔ "Very comfortable"
- bodyCta: "Show me some words"

**Today**
- greetingMorning/Afternoon/Evening: "Good morning" / "Good afternoon" / "Good evening"
- arriving: "How are you arriving today?"
- checkInAgain: "Check in again"
- winCard: "Last {weekday} felt like this too. You still {win}."
- seeProof: "See your proof log"
- dayModeBannerEbb (G/D/L): "Low on energy today? A Gentle plan keeps what matters and moves the rest." / "Low energy. Try a Gentle plan." / "Your energy is low. A Gentle plan keeps about 4 points of tasks today and moves the rest to tomorrow."
- showMe: "Show me"
- nextEvent: "Next: {title} · {time} · in {minutes} min"
- now: "Now · {time}"
- movedGroup: "Moved to tomorrow ({count})"
- bringBack: "Bring back"
- noEvents: "No events today."
- noTasks: "Nothing on your list for today."

**Tasks**
- statuses: "Not started" · "In progress" · "Stuck" · "Done"
- stuckSubtitle: "Stuck is information, not failure."
- addTask: "Add task"
- energyLevels: "Light" · "Medium" · "Heavy"
- imStuck: "I'm stuck"
- focus: "Focus"
- moveTo: "Move to…"
- doneToast: "Done. Added to your proof log."
- breakItDown: "Break it down for me"

**Unstick**
- title: "What's making it hard?"
- reasons: "I don't know where to start" · "It feels too big" · "It's boring" · "I'm worried about how it will turn out" · "The place or noise" · "I don't have energy"
- leftOff: "You left off at: {note}"
- loading: "Finding a small first step…"
- firstStepTitle: "Your first step"
- tryBlock: "Try a {n}-minute block."
- strategyFirst: "Before {taskType} tasks, {strategy} helped you {k} of {n} times. Want to do that first?"
- doItFirst: "Do it first"
- start: "Start {n} min"
- differentStep: "Different step"

**Focus**
- howDidItGo: "How did it go?"
- outcomes: "Got going" · "A little" · "Didn't start"
- didntStart (G/D/L): "That's useful to know. Want a smaller step?" / "Okay. Smaller step?" / "This is useful information. You can try a smaller step now or later."
- endEarly: "I'm done early"
- rewardHint: "You could take: {reward}."

**Bridge**
- card: "{from} → {to} · leave in {m} min"
- getReady: "Get ready"
- patternLine: "Switching from {from} to {to} has felt hard {k} of the last {n} times."
- close: "Close"
- parkingFallback (G/D/L): "Where are you leaving off?" / "Where did you stop?" / "Write the last thing you finished."
- shift: "Shift"
- somethingElse: "Something else"
- startStep: "Start"
- doneGoing: "Done, I'm going"
- rate: "How was the switch from {from} to {to}?"
- ratings: "Easy" · "Okay" · "Hard"

**Toolkit**
- headerNow: "For how you feel now"
- headerNone: "Pick what fits right now"
- worksForYou: "Works for you"
- workedCount: "Worked for you {k} of {n} times"
- families: Move — "Get your body going" · Calm — "Slow things down" · Connect — "Reach a person" · Create — "Make something small" · Think — "Give your mind a small puzzle"
- recheck: "How do you feel now compared to before?"
- recheckOptions: "Better" · "Same" · "Worse"
- worse: "Thanks for telling me. Tide will suggest this less."
- copied: "Copied. Send it yourself when you're ready."

**Patterns**
- title: "What works for you"
- periods: "This week" · "Last 4 weeks"
- why: "Why am I seeing this?"
- notTrue: "Not true for me"
- notTrueReasons: "It was a coincidence" · "Something else explains it" · "I just don't like it"
- meta: "{k} of {n} times · {period}"
- notEnough: "Tide needs a few more check-ins and sessions to spot patterns. Nothing to do here yet."
- footer: "Patterns describe your data, not who you are. You decide what fits."

**Proof log**
- title: "Proof I can"
- subtitle: "Things you did, kept here for the days that feel heavy."
- addWin: "Add a win"
- rewards: "My rewards"

**Support / Crisis**
- supportTitle: "Talk to a person"
- trusted: "People you trust"
- campus: "At your school"
- crisisSection: "If you are in crisis"
- neverContacts: "Tide never contacts anyone for you."
- crisisHeading: "It sounds like things are really hard right now."
- crisisBody: "You deserve support from a person. You don't have to handle this alone."
- imSafe: "I'm safe, take me back."

---

## Appendix B — Log templates

Use these as structure, not as a form to fill mechanically. Write in the first person, naturally, with specifics. Dates and times come from the system clock (real time, not the demo clock).

### B.1 Opening of `docs/AI_DEV_LOG.md` (Phase 0)

```markdown
# Tide — AI development log

I'm Claude Code. The Tide team asked me to build their app for the North
American AI Challenge for Neurodiverse Learning 2026 from their product
specification (docs/TIDE_BUILD_PROMPT.md). The organizers allowed fully
AI-generated code, so I wrote the code, the tests and most of the
documentation. This log is my working journal: what I understood before
each part, what I built, what broke, what I decided and what's still open.
The team owns the product, the research and the pitch.

## What I understood before starting
<date, time>

<6–10 sentences in your own words: who Maya is, what the core loop is,
the four or five things that matter most for the judges, the rules I must
not break, and how I plan to work through the phases.>
```

### B.2 "Before Phase N" entry

```markdown
## Before Phase N — <name>
<date, time>

<What this part is for, from Maya's point of view, in 2–3 sentences.>

<Where it sits in the loop: what it reads and what it writes.>

<What "done" means for me here: the acceptance criteria in my own words.>

<What could go wrong and how I'll guard against it.>
```

### B.3 "After Phase N" entry

```markdown
## After Phase N — <name>
<date, time>

**What I built**
- <feature, in plain words, with the main files>

**How I checked it**
- lint <ok/failed>, typecheck <ok/failed>, <n> tests passing, build <ok/failed>
- <flow tests or browser checks I ran, and what I looked at>

**What broke and how I fixed it**
- <specific problem → fix>, or "Nothing worth noting."

**Decisions**
- <D-number and one line each, details in docs/DECISIONS.md>

**Known issues**
- <honest list, or "None that I know of.">

**For the team**
- <anything added to docs/TEAM_TODO.md>

**Commit:** <short hash and subject>
```

### B.4 Final entry

```markdown
## Where Tide stands
<date, time>

<A short, honest summary: what works end to end, how reliable the demo is,
what I would test first on a real phone, what didn't make it and why, and
the three things the team should do next.>
```

### B.5 Audit table (Phase 10)

```markdown
| Criterion (section) | Where it lives | How I verified it | Status |
|---------------------|----------------|-------------------|--------|
| Check-in completes with keyboard only (13.4) | components/checkin/* | flow test checkin-keyboard.test.tsx | Pass |
```

---

## Appendix C — Messages to paste into Claude Code

### C.1 Kickoff (paste once, at the start)

```
You are building Tide for our team for the North American AI Challenge
for Neurodiverse Learning 2026 (Launchpad Monterrey, Nov 7, 2026; code
due Nov 5, 2026 at 11:59 p.m.). The organizers allow fully AI-generated
code. All other rules still apply: honest AI attribution, AI usage logs,
public repo without secrets, English materials, and an AI Prompts PDF.

Read docs/TIDE_BUILD_PROMPT.md completely before doing anything. Then
build the whole application, end to end, following Section 18 in order,
from Phase 0 through Phase 10, without asking us to confirm between
phases.

For every phase, follow the cycle in Section 1.3: re-read the listed
sections, write the "Before Phase N" entry in docs/AI_DEV_LOG.md, build
in the given order, run lint/typecheck/tests/build, exercise the flow,
fix everything that fails, write the "After Phase N" entry, update
AI_ATTRIBUTION.md, DECISIONS.md, CODE_WALKTHROUGH.md and TEAM_TODO.md,
commit, and continue straight to the next phase.

Write code comments the way Section 1.7 describes: natural, specific,
about why, never robotic or generic. Write every log in the first person,
in a natural voice, and keep it honest about what you generated.

Only stop for the true blockers in Section 1.5. When Phase 10 is done and
every item in Section 19 is checked, give us a short summary of what's
built, how to run it, and what's waiting for us in docs/TEAM_TODO.md.
```

### C.2 Resume (paste if the session was interrupted)

```
We're resuming the Tide build. Read CLAUDE.md, then
docs/TIDE_BUILD_PROMPT.md, then the end of docs/AI_DEV_LOG.md and
run git log --oneline to see where you stopped. Check the state of the
last phase (run the checks; finish or fix anything half done), write a
short "Resumed" entry in the log saying what you found, and continue from
there through Phase 10 without asking us to confirm phases.
```

### C.3 Iteration after partner research or user tests

```
Our Challenge Partner research / user tests showed this:
1. ...
2. ...

First, update the relevant sections of docs/TIDE_BUILD_PROMPT.md so the
spec matches (keep everything else as it is). Then implement the changes,
update the tests, write a "Changes from research" entry in
docs/AI_DEV_LOG.md, add the before/after to docs/research-to-design.md
(only what we told you), update AI_ATTRIBUTION.md and today's progress
report, run all checks, and commit. Don't ask us to confirm; stop only
for the blockers in Section 1.5.
```

### C.4 Bug report during rehearsals

```
During rehearsal we found these problems:
1. <what we did> → <what happened> → <what we expected>
2. ...

Reproduce each one with a test first, fix it, make sure the demo script
in docs/demo-script.md still works, log the fixes in docs/AI_DEV_LOG.md,
and commit.
```

### C.5 Daily progress report

```
Write today's progress report draft in docs/progress/<today's date>.md
following Section 17.5, based on the commits and log entries since the
last report. Keep it under 250 words and leave placeholders for anything
only we know.
```

---

## Appendix D — Quick reference for the pitch Q&A (for the team)

- **Why AI?** It interprets free language into precise emotion words (critical with alexithymia), adapts a first step to a specific task and the current state, and explains patterns in plain words. Fixed quizzes or lists cannot do this.
- **What does the AI not do?** It does not compute statistics, does not change anything without confirmation, does not store data, does not diagnose.
- **Privacy?** Local-first storage; minimal text sent without names; nothing stored server-side; export and delete anytime.
- **What if the AI is wrong?** The user chooses words, can drag the map, can say "None of these", can ask for a different step, can mark patterns "Not true for me". Patterns need at least 3 observations and always show "k of n".
- **Crisis?** Keyword and model safety layers stop coaching and route to human help (Línea de la Vida, 988, 911, trusted contacts).
- **Who pays?** University inclusion and wellbeing offices; free for students.
- **What did research change?** <fill from partner interviews>.
- **What's next?** Six-week pilot with our partner, coach summary sharing (opt-in), Spanish UI, school calendar import.

*End of document.*
