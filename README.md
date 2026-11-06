# Tide

**Tide plans for the brain you have right now, not the one your calendar assumes.**

Tide is a web app for neurodivergent college students (ADHD, autism, dyslexia and related differences). It connects how you feel with what you can realistically do next, at the two moments where days usually fall apart: starting a task and switching between activities. It learns which small strategies actually work for you, and it keeps everything on your own device. We built it for the North American AI Challenge for Neurodiverse Learning 2026 (Launchpad Monterrey).

## The problem we're solving

Neurodivergent students rarely fail at planning. They get stuck at two moments, starting a task and switching activities, and at those moments their emotional state decides whether they can act. Mood apps help you name a feeling but never touch your tasks; planners organize tasks but ignore how you feel. Our thesis is that emotional regulation is the hidden executive function, so Tide works exactly where the two meet. <What we learned from our Challenge Partner, in two or three sentences.>

## What Tide does

- **Check in ("Name it").** Write what's going on in your own words, or start from your body. Tide suggests three feeling words; you pick, place yourself on a four-state mood map (Surge, Swell, Ebb, Still) and choose what you need. The AI never picks a feeling for you.
- **Day Modes.** On a low day, a Gentle or Minimum plan keeps what matters and moves the rest, only with your yes.
- **Tasks, Unstick and Focus.** A board where "Stuck" is a normal column: Tide asks what makes the task hard, offers one small first step that fits your state, then a focus block with an end alert, optional check-ins and background sounds.
- **Bridge.** Before the next class: note where you're leaving off, do one short strategy, check what to bring.
- **Toolkit.** Twenty short strategies sorted by what has worked for you.
- **Patterns.** What tends to help you, counted from your own data ("a walk before writing: got going 4 of 5 times"), with the moments behind it and a "Not true for me" button.
- **Your Shore and Close the day.** Things you do wash up on a little beach that never loses anything; a skippable wind-down ends the day.
- **Also:** a calendar, six optional companions (or none), fifteen themes, and a guided demo on a fictional student's data.

## Designed for neurodivergent students

- **Literal mode** words everything plainly, next to Gentle and Direct.
- **Low sensory** in one tap; motion Off, Calm or Lively, following the device's reduced-motion setting.
- **No streaks, no points to lose, no "you failed", no red alarms.** A celebration fits how you feel: on a low day it's a quiet "That counted."
- **Large text** up to 150%, checked on every screen from 320 px phones to laptops.
- **Screen readers and keyboards:** real buttons, 48 px targets, a visible focus ring and a non-drag way to do every drag.
- **Color-blind-safe states:** shapes as well as colors on the mood map, and high-contrast themes.
- **A path to people:** crisis language stops all coaching and shows crisis lines and the people you trust.

## Screenshots

<Add screenshots: Today, the check-in, Unstick, the Bridge, Patterns, Your Shore, Close the day, each in Lagoon, Midnight Tide and Ink.>

## Try it

- Deployed app: <deployed URL>
- The demo: open `/demo` and choose the Full tour, the Pitch cut or Presenter mode (→ or PageDown for Next, so a clicker works; Space, K or P to pause). See [docs/demo-script.md](docs/demo-script.md).

## Run it locally

Prerequisites: Node.js 20.9 or newer (`engines` in `package.json`; we verified the build with Node 24).

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

Without an API key everything still works: each AI feature falls back to built-in suggestions. Other scripts: `npm test`, `npm run test:v1` (our v1 regression suite), `npm run lint`, `npm run typecheck`, `npm run build`, `npm run tour:check` (plays the guided tour in Chrome against a production build).

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Optional | Turns on the AI suggestions (server only) |
| `TIDE_MODEL_FAST`, `TIDE_MODEL_SMART` | Optional | Which Claude models the routes use |
| `TIDE_AI_TIMEOUT_MS`, `TIDE_AI_DEMO_TIMEOUT_MS` | Optional | How long a route waits before falling back |
| `TIDE_RATE_LIMIT_MAX`, `TIDE_RATE_LIMIT_WINDOW_MS` | Optional | A per-IP rate limit for the public deployment |
| `TIDE_TTS_PROVIDER` and its key | Optional | A natural voice for read-aloud (`openai` or `elevenlabs`; `none` uses the device's voices) |

For natural voices, set `TIDE_TTS_PROVIDER` and that provider's key. Only text someone asks to hear is sent, and nothing is stored. `npm run voice:clips` can pre-generate clips for the fixed texts so they sound natural offline.

## Tech stack

- **Next.js 16, React 19, TypeScript:** screens and the few server routes that keep the API key secret.
- **Tailwind CSS 4, shadcn/ui on Radix:** accessible primitives restyled with our tokens.
- **Dexie (IndexedDB):** local-first storage, so records never leave the device.
- **zod:** validates every AI input and output.
- **Framer Motion, Floating UI, dnd-kit:** motion that follows the motion level, bubbles that stay on screen, a board with keyboard alternatives.
- **Anthropic SDK:** the Claude API, for language tasks only.
- **Web Speech and Web Audio:** read-aloud, dictation and synthesized sounds.

## How it's built

Data lives in the browser. Six small server routes send minimal, schema-checked text to Claude and return JSON that is validated on the server and again in the browser; any failure falls back to a deterministic answer. The pattern engine counts in the browser and the AI only puts its results into words. See [docs/architecture.md](docs/architecture.md), and [docs/CODE_GUIDE.md](docs/CODE_GUIDE.md) for a module-by-module tour.

## How we used AI

Inside the product, Tide calls Anthropic's Claude API for feeling words, first steps, Day Mode plans, Bridge prep, pattern explanations and the end-of-day summary; the prompts are in [`/prompts`](prompts) and on the `/prompts-doc` page. In building it, we used AI coding assistance throughout: we wrote the product concept, ran our research and made the design decisions; we used Claude (claude.ai) to help turn them into specifications, and Claude Code to generate most of the implementation, tests and documentation from them, which the organizers allowed. We reviewed, tested and iterated every feature. The full disclosure, with every dependency and license, is in [docs/AI_USE.md](docs/AI_USE.md).

## Privacy and safety

- No accounts, no analytics, no trackers. Check-ins, tasks and patterns stay in your browser; you can export or delete everything.
- The AI receives only the fields a route needs (never names, contacts or history), and the server stores and logs no user text, only the route, status, time and whether it fell back.
- A keyword check in English and Spanish runs before any free text could reach the AI; crisis language stops coaching and shows crisis lines and trusted people.
- Tide is not a medical service and doesn't diagnose or treat anything.

## Team

- Danny Alejandro Barahona Reyes
- Dorian Daniela González Méndez
- Axel Alexander Cortes Romero
- Kena Sofía Lira Olivares

Tec de Monterrey, Campus MTY
## Credits and licenses

Libraries and their licenses are listed in [docs/AI_USE.md](docs/AI_USE.md). Fonts: Atkinson Hyperlegible (Braille Institute), Nunito and Lexend, under the SIL Open Font License. The four-state mood map is inspired by the circumplex model of emotion and Yale's RULER framework; Tide is not affiliated with Yale. The companions are original drawings made in code. Tide is released under the MIT license ([LICENSE](LICENSE)).
