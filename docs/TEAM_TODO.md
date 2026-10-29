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
  `TIDE_RATE_LIMIT_WINDOW_MS`. *Before the first deploy.*
- [ ] **Deploy to Vercel.** *By Nov 3, so you can rehearse on the real URL.*
  1. Sign in at vercel.com with the GitHub account that owns the repo.
  2. "Add New… → Project", import `devxs614/Tide`. Framework: Next.js
     (detected). Leave the build command (`next build`) and output as they are.
  3. Before the first deploy, open "Environment Variables" and add, for
     Production and Preview: `ANTHROPIC_API_KEY` (your key),
     `TIDE_MODEL_FAST=claude-haiku-5-5`, `TIDE_MODEL_SMART=claude-sonnet-5-5`,
     `TIDE_AI_TIMEOUT_MS=8000`, `TIDE_AI_DEMO_TIMEOUT_MS=4000`,
     `TIDE_RATE_LIMIT_MAX=40`, `TIDE_RATE_LIMIT_WINDOW_MS=600000`.
  4. Deploy. Open the URL on a phone: onboarding should appear.
  5. Check that `<your-url>/api/config` says `"hasKey": true`.
  6. Settings → Demo → turn on demo mode and run `docs/demo-script.md` once.
  7. Every later `git push` to `main` redeploys automatically.
  (The Vercel CLI wasn't installed and signed in on the build machine, so I
  couldn't deploy a preview myself.)
- [ ] **Try one real AI call** after adding the key: run `npm run dev`, open
  the app, check in with "Lab report due tomorrow. I keep opening it and
  closing it. Heavy. Annoyed at myself." and confirm three words appear. I
  could only test the AI routes with a mocked SDK because there was no key
  in my environment. *By Oct 30.*

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
- [ ] Print `/prompts-doc` to PDF and upload it: open `<your-url>/prompts-doc`
  in Chrome, File → Print → Save as PDF, margins Default, "Background
  graphics" off. Fill the team name and university placeholders first
  (they are in `src/app/prompts-doc/page.tsx`). *Nov 4.*
- [ ] Final check of all submission links from a device not logged into any
  team account. *Nov 5.*

## Repository
- [ ] **Keep the repo out of iCloud-synced folders.** This copy lives in
  `~/Documents`, which iCloud Drive syncs; iCloud kept creating
  `"file 2.ts"` conflict copies inside `.next` during builds, which broke
  type checking until I excluded them. Cloning the repo into a folder iCloud
  doesn't sync (for example `~/dev/Tide`) avoids it. *Any time.*
- [ ] The repo was created with a two-line README ("Tide. Arizona
  hackathon"). I kept that line at the top of the new README; edit it if you
  want different wording.
