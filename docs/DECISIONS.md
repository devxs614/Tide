# Decisions

Decisions I made where the spec was silent, ambiguous, or assumed an older
version of a library. Each entry has the date, the decision, why, and what I
rejected. — Claude Code

**D1 — 2026-10-28 — Cache Components stays off.**
The Next.js 16.4 scaffold turns on `cacheComponents`, which forbids the
`runtime` and `dynamic` exports the spec asks for on the AI routes (10.3).
Tide keeps all data in the browser, so server caching adds nothing.
Rejected: keeping it on and dropping those exports, which would make the
routes behave differently from the spec and harder to explain.

**D2 — 2026-10-28 — `npm run lint` runs `eslint .`, not `next lint`.**
Next.js 16 removed `next lint` (bundled docs, version-16 upgrade guide). The
flat ESLint config from the scaffold (`eslint-config-next`) is unchanged.
Rejected: pinning an older Next just to keep the old command.

**D3 — 2026-10-28 — Tailwind 4 tokens live in `globals.css`, not a config file.**
Tailwind 4 is configured in CSS with `@theme`. The spec's "map tokens in
tailwind.config" is done there instead: `--color-surface`, `--color-ebb-tint`
and friends become `bg-surface`, `bg-ebb-tint` and so on. shadcn/ui's own
variable names (`--background`, `--popover`…) point at Tide's tokens, so the
generated components follow light and dark mode without raw colors.

**D4 — 2026-10-28 — The demo start time is built from local time parts.**
The spec writes `new Date('2026-11-05T15:40:00-06:00')`. That is 3:40 pm only
on a device set to Monterrey time; a laptop on Arizona time would show 2:40 pm
while the seeded classes sit at their local hours. I use
`new Date(2026, 10, 5, 15, 40)` so the demo reads "Thursday, November 5,
3:40 pm" on any device. In Monterrey the two are identical.

**D5 — 2026-10-28 — Averages round half away from zero.**
When Maya picks Drained (-3, -3) and Frustrated (2, -3), the average energy is
-0.5. `Math.round(-0.5)` is `-0`, which counts as "high energy" and would file
the check-in under Surge. The demo script expects Ebb, and the feelings lean
low, so `clampCoord` rounds -0.5 to -1. A unit test covers it.

**D6 — 2026-10-28 — No shadcn "destructive" (red) style.**
The generated Button had a red `destructive` variant. The spec bans red error
states, so I replaced it with a neutral `notice` variant and pointed shadcn's
`--destructive` variable at `--notice`. Close buttons on sheets and dialogs
show the word "Close" next to the X, since icons must carry text.

**D7 — 2026-10-28 — `next-themes` removed.**
shadcn's toast component pulled in `next-themes`. Tide already has its own
theme setting in Dexie (with a localStorage mirror for the first paint), so a
second theme system would disagree with it. The toaster reads Tide's setting.

**D8 — 2026-10-28 — Trusted contacts carry a method.**
The spec stores `{ name, method, value }` without listing methods. I use
`phone` (Call and Message buttons, via `tel:` and `sms:`), `email` (Message
via `mailto:`) and `handle` (shown as text, since there is no standard link).
Each contact also gets an `id` so editing and removing are reliable.

**D9 — 2026-10-28 — Extra settings keys.**
Beyond Section 7.2, settings also store `name` (Settings → Profile),
`demoClock` (`{ base, startedAt }`, so "Restart demo" and "Jump to bridge
moment" can pick any demo time) and `dayModeBannerDismissedFor` (the check-in
id the banner was dismissed for, so "Not now" lasts until the next check-in).

**D10 — 2026-10-28 — Win text is built in `lib/wins.ts`, written in `lib/repo/wins.ts`.**
The spec lists both files. The pure sentence builders live in `lib/wins.ts`
(easy to test and to change wording); the repo functions that change task,
focus, strategy and transition records call `addWin` inside the same
transaction, so a win can't be saved without its cause or vice versa.
