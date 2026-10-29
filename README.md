# Tide

Tide. Arizona hackathon

**Tide plans for the brain you have right now, not the one your calendar assumes.**

Tide is a web app for neurodivergent college students (ADHD, autism, dyslexia
and related differences). It connects how you feel with what you can
realistically do next, right at the two moments where days fall apart:
starting a task and switching between activities. It is built for the North
American AI Challenge for Neurodiverse Learning 2026.

> This README is a skeleton from Phase 0 of the build. It is completed in
> Phase 9 (features, AI, responsible AI, architecture, team).

## Run locally

Prerequisites: Node.js 20.9 or newer (LTS).

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY (optional)
npm run dev                   # http://localhost:3000
npm test
```

Without an API key, Tide still works: every AI feature falls back to simple
built-in suggestions.

## How this was built

The code was generated with Claude Code from the team's specification
(`docs/TIDE_BUILD_PROMPT.md`), which the organizers allowed. See
[AI_ATTRIBUTION.md](AI_ATTRIBUTION.md) and the development log in
[docs/AI_DEV_LOG.md](docs/AI_DEV_LOG.md).

## Credits

Inspired by the circumplex model of emotion and Yale's RULER framework. Tide
is not affiliated with Yale.

## License

MIT. See [LICENSE](LICENSE).
