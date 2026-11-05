# How we used AI, and what else we built on

This page discloses the two ways AI is part of Tide (inside the product, and in how we built it) and every outside resource the code depends on.

## 1. AI inside the product

Tide calls Anthropic's Claude API from six server routes, only for language tasks a fixed rule can't do:

| Route | What it does |
|---|---|
| `/api/ai/label` | Suggests three feeling words, from a fixed list of 48, for what someone wrote or felt in their body |
| `/api/ai/unstick` | One small first step for a stuck task, fitted to the reason and the person's state |
| `/api/ai/daymode` | Which tasks to keep and which to move for a Gentle or Minimum day |
| `/api/ai/bridge` | A question about where you're leaving off, one short strategy and prep steps for a switch |
| `/api/ai/narrate` | Plain sentences for patterns the app has already counted |
| `/api/ai/wrapup` | A short, kind summary when you close the day |

The code calculates and the AI only phrases: no number on a pattern card or summary comes from the model. Each route receives only the fields in its schema (no names, contacts or history), and its answer is checked with zod and semantic rules on the server and again in the browser, with one retry; any failure falls back to a deterministic answer from `src/lib/ai/fallbacks.ts`. A safety check runs before any free text could reach the model. The system prompts are in [`/prompts`](../prompts), and the `/prompts-doc` page prints them as our AI Prompts PDF.

## 2. AI assistance in building Tide

We used AI coding assistance throughout the build. We wrote the product concept, ran our user research with our Challenge Partner, and made the design decisions. We used Claude (claude.ai) to help us turn those decisions into detailed specifications and to draft the first versions of the product's prompts, and Claude Code (Anthropic's coding tool) to generate most of the implementation, the tests and the first drafts of this documentation from those specifications. The Challenge organizers confirmed that AI-generated code was allowed.

Every feature was reviewed, tested and iterated by us. We tested Tide ourselves and showed it to our partner, wrote the bug lists that drove each round of fixes (v2.1, the v2.2 sweep, v2.3 and the demo fixes), decided what to fix first, and rehearsed the demo. We can walk through any part of the code; [docs/CODE_GUIDE.md](CODE_GUIDE.md) is the map we use.

## 3. What we did ourselves

- The product idea and its thesis: emotional regulation as part of executive function, aimed at the moments of starting and switching.
- The persona (Maya) and the research with our Challenge Partner: <who, when and what we learned, in our words>.
- The design decisions: Literal mode, no streaks or guilt, a crisis path to people, local-first data, companions that never judge.
- Prioritizing fixes from our own testing and partner sessions, for example the large-text layouts, the companion's speech bubble covering content, phone numbers that accepted letters, and the demo's play/pause button.
- Testing on real phones: <devices>.
- The pitch, the demo rehearsals and the Business Model Canvas.

## 4. How we checked AI-generated code

- **Automated tests:** about 660 Vitest tests (unit and flow tests that render real screens against a fake IndexedDB), including a v1 regression suite of 164 tests that has had to stay green through every version, a test that keeps voice dictation unchanged, and tests that guard project rules (no raw colors, one clock, no guilt phrases or emojis in the copy).
- **Layout audits:** a Playwright script that opens every screen at six widths (320 px to laptop) and four text sizes and checks for overflow, words breaking mid-word, controls covered by bubbles, and console errors.
- **Accessibility:** axe-core in tests and in the audit.
- **Visual regression:** screenshots with time and randomness frozen, compared before and after each round of fixes.
- **Demo rehearsals:** `npm run tour:check` plays the whole guided tour in Chrome against a production build and fails on any skipped step or AI request.
- **A secret scan** of the code and the whole git history before publishing.

## 5. Third-party code and resources

The project was started with `create-next-app`, and the UI primitives in `src/components/ui/` came from the shadcn/ui CLI; we adapted them (48 px targets, no red "destructive" style, our theme tokens). Everything else comes from these packages:

| Package | Purpose | License |
|---|---|---|
| next, react, react-dom | App framework and UI | MIT |
| @anthropic-ai/sdk | Claude API client (server only) | Apache-2.0 |
| dexie, dexie-react-hooks | IndexedDB storage and live queries | Apache-2.0 |
| zod | Validation of AI input and output, and settings | MIT |
| radix-ui, shadcn | Accessible UI primitives and their generator | MIT |
| tailwindcss, @tailwindcss/turbopack, tw-animate-css | Styling and enter/exit animations | MIT |
| class-variance-authority | Component variants | Apache-2.0 |
| cn | Class-name merging that knows our type scale | MIT |
| framer-motion | Motion that follows the motion level | MIT |
| @floating-ui/react-dom | Keeping companion bubbles on screen | MIT |
| @dnd-kit/core, sortable, utilities | The task board's drag and drop | MIT |
| lucide-react | Icons (always with a visible label) | ISC |
| sonner | Toasts | MIT |
| server-only | Keeps server code out of the browser bundle | MIT |
| vitest, @vitejs/plugin-react, jsdom | Test runner and DOM | MIT |
| @testing-library/react, dom, jest-dom, user-event | Rendering and driving screens in tests | MIT |
| fake-indexeddb | A real IndexedDB in tests | Apache-2.0 |
| @playwright/test | Layout audits and tour checks in Chrome | Apache-2.0 |
| axe-core, @axe-core/playwright | Accessibility checks | MPL-2.0 |
| pixelmatch, pngjs, @types/pngjs | Visual comparison of screenshots | ISC, MIT, MIT |
| eslint, eslint-config-next, prettier, typescript, @types/* | Linting, formatting and types | MIT, Apache-2.0 (TypeScript) |

**Fonts:** Atkinson Hyperlegible (Braille Institute), Nunito and Lexend, all under the SIL Open Font License, loaded through `next/font`.

**Inspiration:** the four-state mood map is inspired by the circumplex model of emotion and Yale's RULER framework. Tide is not affiliated with Yale. The companions, sounds and Shore drawings are original, made in code.

## 6. What we didn't reuse

No code was copied from earlier projects, hackathons or public repositories beyond the libraries and generators listed above.
