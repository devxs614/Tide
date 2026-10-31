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
  Today and the check-in. *By Nov 4.* Why: tests and axe check names and
  roles, but only a person can tell whether it makes sense when heard.
- [ ] Keyboard-only run on a laptop with the deployed URL: check in, add a
  task, move it to Stuck, get a first step, start a focus block, open the
  Bridge, run a toolkit strategy, dismiss a pattern. Time the check-in: the
  spec's target is under 60 seconds. *By Nov 4.* Why: my tests press the
  keys in a simulated browser; a person should confirm the focus ring is
  always visible and nothing traps focus on a real screen.
- [ ] Lighthouse on the open Check-in sheet: Chrome DevTools → open the
  sheet → Lighthouse → Accessibility, "Snapshot" mode. *By Nov 4.* Why:
  Lighthouse can't open a sheet from a URL. I ran axe-core on every sheet
  instead (0 violations), and Lighthouse scored 100 on the pages.
- [ ] **Lighthouse on the v2 screens** (Accessibility, on the deployed
  URL): Today, Your Shore, Close the day, Settings → Appearance and `/demo`.
  The spec asks for 95 or more. *By Nov 4.* Why: v1 scored 100; in v2 I ran
  axe-core (the engine Lighthouse uses) on every new screen with no
  violations, but I didn't run Lighthouse itself.
- [ ] Try it on the presenting phone at 150% text and in dark mode, try
  "Dictate", and lock the phone for 2 minutes during a focus block (the
  timer should still be right to the second). *By Nov 4.* Why: I checked
  320px, 390px and 1280px in a desktop browser; a real phone adds safe
  areas, the on-screen keyboard over sheets, sleep, and dictation support
  that differs by browser.

- [ ] On the presenting device, install a high-quality English voice
  (Mac: System Settings → Accessibility → Spoken Content → System voice →
  Manage Voices → English → "Ava (Premium)" or "Samantha (Enhanced)").
  *By Nov 4.* Why: "Read aloud" picks the best English voice it finds
  (D56); a downloaded voice sounds much more natural on stage than the
  built-in one. Then in Settings → Comfort, use "Try this voice" to choose
  the one that sounds gentlest to you (D57), and keep the speed on Normal.

## Voices (v2)
- [ ] Optional, for truly natural voices: pick a provider and add its key
  to `.env.local` and Vercel: `TIDE_TTS_PROVIDER=openai` with
  `OPENAI_API_KEY`, or `TIDE_TTS_PROVIDER=elevenlabs` with
  `ELEVENLABS_API_KEY`. *By Nov 3.* Why: device voices vary a lot; a cloud
  voice sounds the same on every laptop. Without a key Tide uses the best
  device voice.
- [ ] If you use ElevenLabs, confirm the voice ids in `src/data/voices.ts`
  exist in your voice library (they're common premade voices, but
  libraries differ). *By Nov 3.*
- [ ] Then run `npm run voice:clips` once (`-- --dry-run` first shows how
  many clips and roughly how big). It makes the demo voice work offline.
  `public/voice/` is git-ignored; commit it only if you want the clips in
  the repo. *By Nov 4.*
- [ ] Test voices on the demo laptop in Microsoft Edge (its "Natural"
  voices are very good) and in Chrome: Settings → Voice → Play sample.
  *By Nov 4.*
- [ ] Note for after the hackathon: OpenAI marks `gpt-4o-mini-tts` as
  deprecated, shutting down January 6, 2027 (D68). Before then, switch
  `TIDE_TTS_OPENAI_MODEL` to its successor.

## Companions (v2)
- [ ] **Ask the Challenge Partner whether the companions feel too
  childish** for college students, and whether any line feels off. Show
  the Studio (`/companion`) and two or three screens. *By Nov 2.* Why: the
  spec wants "charming, not babyish", and only real students can tell us.
- [ ] **Check the About texts** in `src/copy/companions.ts`
  (`COMPANION_ABOUT`): they are general facts about each animal (axolotls
  and Xochimilco, otters holding paws, hermit crabs changing shells). A
  quick look by someone on the team is enough. *By Nov 3.*
- [ ] Optional: if a designer on the team wants to redraw a companion,
  `docs/CODE_WALKTHROUGH.md` → "Replacing companion art" explains what each
  drawing must keep. *Any time.*

## Performance (v2)
- [ ] **Check animation smoothness on a mid-range phone** (or Chrome
  DevTools → Performance → CPU 4× slowdown): Today, the check-in sheet and
  a big celebration (`/dev/celebrations` in `npm run dev`) should stay above
  50 fps. I could only measure without throttling here (61 fps). *By Nov 3.*
- [ ] **Same check for the Shore with a full beach** (48 items, Lively
  motion): it should stay above 50 fps. Use `/dev/shore` or a demo with
  many wins. *By Nov 3.*

## Install and offline (v2)
- [ ] **Try Install Tide on the deployed URL** in Chrome on a laptop
  (Settings → About → Install Tide) and on an iPhone (it should show "Tap
  Share, then Add to Home Screen"). *By Nov 4.* Why: the browser here
  doesn't offer installing, so I could only test it with a simulated
  offer.
- [ ] Turn the Wi-Fi off with Tide open and check in: the "Offline" note
  should appear and the suggestions should be the built-in ones. *By Nov 4.*

## Demo (v2)
- [ ] **Rehearse the guided tour on the presenting laptop** at 1×, Lagoon
  theme: `/demo` → Full tour, then Pitch cut, then Presenter mode with the
  clicker (→ / PageDown). Note any step that's skipped (`/demo` with
  `?demoDebug=1` shows them) and tell Claude Code. *By Nov 3.* Why: I
  couldn't watch it in a browser while the pane was in use.
- [ ] Record the backup video of the full tour once it runs cleanly.
  *By Nov 4.*
- [ ] **Test `/demo` on the deployed URL**, not only on localhost: Full
  tour, Pitch cut, and Leave demo, then check that your own data in the
  main workspace is as you left it. Try it once with the Wi-Fi off after
  the page has loaded. *By Nov 4.* Why: the demo has its own database per
  site, so the deployed site needs its own run.

## Submission
- [ ] Record the backup demo video following `docs/demo-script.md`. *Nov 3.*
- [ ] Take screenshots for the README and the deck, in three themes
  (Lagoon, Midnight Tide, Ink), on a phone and on a laptop-width window:
  Today, the check-in, Unstick, the Bridge, Patterns, Your Shore and Close
  the day. The README has a placeholder for them. While you're at it, note
  anything that looks unfinished at laptop width; I only checked phone
  width in v2. *Nov 4.*
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
