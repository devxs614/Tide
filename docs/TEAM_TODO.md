# Team to-do

Things only the team can do, with why and by when. I add items as they come
up during the build. — Claude Code

## Setup and deployment
- [ ] **Add `ANTHROPIC_API_KEY` locally.** Copy `.env.example` to `.env.local`
  and paste the key after `ANTHROPIC_API_KEY=`. Never commit `.env.local`
  (it is git-ignored). Without a key the app still works with built-in
  suggestions. *By Oct 30, so the team can try real AI answers.*
- [ ] **Add the same variables in Vercel** (Project → Settings → Environment
  Variables): `ANTHROPIC_API_KEY`, `TIDE_MODEL_FAST`, `TIDE_MODEL_SMART`,
  `TIDE_AI_TIMEOUT_MS`, `TIDE_AI_DEMO_TIMEOUT_MS`, `TIDE_RATE_LIMIT_MAX`,
  `TIDE_RATE_LIMIT_WINDOW_MS`. *Before the first deploy.* (Exact deploy steps
  are added in Phase 9.)

## Safety and content review (with the Challenge Partner)
- [ ] **Verify the crisis numbers** in `src/data/resources.ts` (Línea de la
  Vida 800 911 2000, 988, 911) by calling or checking the official sites.
  *By Nov 3.* Why: a wrong number on a crisis screen is the worst possible bug.
- [ ] **Review the safety keyword list** in `src/lib/safety/keywords.ts`
  (English and Spanish). *By Nov 3.*
- [ ] **Review the emotion vocabulary** (`src/data/emotions.ts`) and the
  **strategy library** (`src/data/strategies.ts`). *By Nov 3.*

## Research
- [ ] Run 2–3 user tests through the Challenge Partner; fill
  `docs/research-to-design.md`; tell Claude Code what to change with the
  iteration message (Appendix C.3 of the build prompt). *Nov 2.*

## Checks only a person can do
- [ ] Screen reader smoke test (VoiceOver on iPhone or Mac, or NVDA) of
  Today and the check-in. *By Nov 4.*

## Submission
- [ ] Record the backup demo video following `docs/demo-script.md`. *Nov 3.*
- [ ] Take screenshots for the README and the deck. *Nov 4.*
- [ ] Fill team names, team name and university in `README.md`, the
  `/prompts-doc` page and the progress reports. *Nov 4.*
- [ ] Submit the daily progress reports from `docs/progress/`. *Daily until Nov 5.*
- [ ] Print `/prompts-doc` to PDF and upload it. *Nov 4.*
- [ ] Final check of all submission links from a device not logged into any
  team account. *Nov 5.*

## Repository
- [ ] The repo was created with a two-line README ("Tide. Arizona
  hackathon"). I kept that line at the top of the new README; edit it if you
  want different wording.
