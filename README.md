# Tide

Tide. Arizona hackathon

**Tide plans for the brain you have right now, not the one your calendar assumes.**

Tide is a web app for neurodivergent college students (ADHD, autism, dyslexia
and related differences). It connects how you feel with what you can
realistically do next, at the two moments where days usually fall apart:
starting a task and switching between activities. It learns which small
strategies actually work for you, and it keeps everything on your own device.
Built for the North American AI Challenge for Neurodiverse Learning 2026
(Launchpad Monterrey).

## The problem and our thesis

Neurodivergent students rarely fail at planning. They get stuck at two
moments, starting a task and switching activities, and at those moments their
emotional state decides whether they can act. Mood apps help you name
feelings but don't touch your tasks; planners organize tasks but ignore how
you feel. Tide's thesis: **emotional regulation is the hidden executive
function.** So Tide works exactly where emotion and executive function meet.

## Screenshots

*(The team adds screenshots of Today, the check-in, Unstick, the Bridge and
Patterns here.)*

## What Tide does

- **Check in, "Name it"** — write what's going on in your own words (or start
  from your body if words won't come). Tide offers three feeling words with
  plain definitions; you pick, place yourself on a mood map, and choose what
  you need next. The AI never picks a feeling for you.
- **Tasks, Unstick and Focus** — a four-column board where "Stuck" is a
  normal column. Moving a task to Stuck asks what makes it hard and offers one
  small, physical first step that fits how you feel, then a short focus block
  with a timer.
- **Today and Day Modes** — your day as a simple line with a "Now" marker. On
  a low day, Tide offers a Gentle or Minimum plan that keeps what matters and
  moves the rest; you can flip any task and undo.
- **Bridge** — about 15 minutes before the next event, help with the switch:
  note where you're leaving off, do one short strategy, check what to bring.
  Afterwards, one tap on how it went.
- **Toolkit** — 20 short strategies (breathing, a 3-minute walk, a tiny
  sudoku, a message template…) sorted by what has worked for you, each ending
  with "better, same or worse?".
- **Patterns** — what tends to help you, counted from your own data ("a walk
  before writing tasks: got going 4 of 5 times"), with the exact moments
  behind it and a "Not true for me" button.
- **Proof log** — things you did, kept for heavy days. No points, no streaks.
- **Safety, Settings, Support** — crisis language stops all coaching and shows
  people you can reach; text size, dark mode, reduced motion, Gentle / Direct
  / Literal wording, read aloud and dictation; export or delete everything.

## How the AI is used

The code calculates; the AI interprets language and explains. Claude is used
in five small server-side routes, only where a fixed rule can't do the job:

| Route | What it does |
|---|---|
| `/api/ai/label` | Turns free words or body cues into three emotion words from a fixed 48-word list |
| `/api/ai/unstick` | One small first step for a stuck task, fitted to the reason and your state |
| `/api/ai/daymode` | Which tasks to keep today and which to move for a lighter day |
| `/api/ai/bridge` | A parking question, one short strategy and prep steps for a switch |
| `/api/ai/narrate` | Plain sentences for patterns the app already computed |

Every route receives only the fields in its schema (no names, no contacts),
answers with JSON validated by zod on the server and again in the browser,
gets one retry if invalid, and falls back to a deterministic answer on any
failure. The full prompts, schemas and examples are on the `/prompts-doc`
page, which is printed as our AI Prompts PDF.

**What the AI never does:** it never decides how you feel, never computes
statistics, never changes your plan or tasks without you confirming, never
sees your history or contacts, and nothing you write is stored or logged on
the server.

## Responsible AI

- **Autonomy:** the AI offers, you choose. Every suggestion can be dismissed,
  replaced or switched off ("Use AI suggestions" in Settings).
- **Privacy:** check-ins, tasks and patterns live in your browser
  (IndexedDB). No accounts, no analytics, no trackers. Export or delete
  everything at any time.
- **Limits:** patterns need at least 3 observations, always show "k of n" and
  a confidence level, use "tends to", never "causes", and can be marked "Not
  true for me".
- **Accessibility:** Atkinson Hyperlegible, text up to 150%, extra spacing,
  dark mode, reduced motion, Literal mode, read aloud, dictation, 48px
  targets, full keyboard use, non-drag alternatives.
- **Human support:** "Talk to a person" is always one tap away. A keyword
  check (English and Spanish) plus the model's own flag stop coaching on
  crisis language and show crisis lines and trusted people.
- **Not a medical product:** Tide doesn't diagnose or treat anything.

## Architecture

Next.js (App Router) with TypeScript, Tailwind and shadcn/ui on the client;
Dexie (IndexedDB) for all data; five Next.js route handlers that call Claude
with `@anthropic-ai/sdk`. See [docs/architecture.md](docs/architecture.md)
for the diagram and [docs/CODE_WALKTHROUGH.md](docs/CODE_WALKTHROUGH.md) for a
file-by-file guide.

```
src/app/            routes: Today, Tasks, Toolkit, Patterns, Proof, Settings,
                    Support, Focus, Onboarding, /prompts-doc, /api/ai/*
src/components/     one folder per module (checkin, tasks, focus, today,
                    bridge, toolkit, patterns, proof, safety, settings, shell, ui)
src/lib/            data (db, repo/*), clock, AI layer (ai/*), safety,
                    pattern engine (patterns/*), Day Mode, Bridge rules
src/data/           emotion words, strategies, task types, crisis lines,
                    demo seed and saved demo answers
src/copy/en.ts      every word on screen
prompts/            the five system prompts and the shared preamble
docs/               logs, decisions, walkthrough, demo script, team to-do
```

## Run it locally

Prerequisites: Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY (optional)
npm run dev                   # http://localhost:3000
```

Without an API key everything still works: each AI feature uses its built-in
fallback. Other scripts: `npm test`, `npm run lint`, `npm run typecheck`,
`npm run build`.

## Demo mode

Settings → Demo → **Demo mode (synthetic data)** loads three weeks for Maya,
a fictional student, and sets the clock to Thursday, November 5, 3:40 pm. A
"Demo data" badge stays visible. The scripted demo also works offline. See
[docs/demo-script.md](docs/demo-script.md).

## Team and roles

*(Team names, roles and university go here.)*

## Research

*(Our Challenge Partner and what changed in Tide because of what we learned:
see [docs/research-to-design.md](docs/research-to-design.md). No private
partner data is included in this repository.)*

## How this was built

The application code, tests and most of the documentation were generated
with Claude Code (Anthropic) from our product specification
([docs/TIDE_BUILD_PROMPT.md](docs/TIDE_BUILD_PROMPT.md)), which the organizers
allowed. The team designed the product, ran the research and owns the pitch.
Every generated file and every library is listed in
[AI_ATTRIBUTION.md](AI_ATTRIBUTION.md); the working log of how it was built,
phase by phase, is in [docs/AI_DEV_LOG.md](docs/AI_DEV_LOG.md).

## Credits

The four-state mood map is inspired by the circumplex model of emotion and
Yale's RULER framework. Tide is not affiliated with Yale. Font: Atkinson
Hyperlegible (Braille Institute, SIL Open Font License).

## License

MIT. See [LICENSE](LICENSE).
