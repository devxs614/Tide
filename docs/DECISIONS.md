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

**D11 — 2026-10-28 — No temperature; thinking off and low effort for the two default models.**
The spec's `callJson` defaults to `temperature: 0.3`. As of October 21, 2026
the Messages API rejects `temperature`, `top_p` and `top_k` with a 400 on
every model, and the installed SDK (1.3.0) no longer even types them, so I
send none. Haiku 5.5 and Sonnet 5.5 also think before answering by default,
and thinking tokens count against `max_tokens`; with budgets of 350–600 that
could cut the JSON off mid-object. For these short structured answers I turn
thinking off (`disabled` on Haiku 5.5, `between_tools` on Sonnet 5.5, which
is how that model spells "off") with `effort: "low"`. Any other model named
in the env vars gets the API defaults. Rejected: raising `max_tokens`, which
adds latency to a feature that has an 8-second (4 in demo) budget.

**D12 — 2026-10-28 — A refusal becomes a normal fallback.**
If the model declines (`stop_reason: "refusal"`), `callJson` throws
`provider_error` and the browser shows the built-in suggestion. I did not add
the API's server-side model fallback (a beta parameter): Tide already has a
deterministic fallback for every route, and one fewer beta feature is one
fewer thing to break on stage.

**D13 — 2026-10-28 — Semantic checks also get the one retry.**
Spec 10.4 says the extra checks "reject → fallback". I run them inside
`callJson` alongside zod, so an invented emotion id gets the same single
retry with the reason ("ids not in vocabulary: melancholic") before falling
back. It costs nothing when the first answer is fine and rescues a common
mistake. The narrate number check is the exception: it never rejects, it
swaps the one card for its template, exactly as the spec describes.

**D14 — 2026-10-28 — Demo cache: a 900 ms race, cache wins ties.**
Sections 10.1 and 14.4 describe the demo cache slightly differently (a race
against a 900 ms cache, versus "use live if it returns within the demo
timeout"). I implemented the 10.1 race: the live answer is used only if it
arrives valid within 900 ms; otherwise the saved answer is shown. On stage,
the same words every rehearsal matter more than showing a live call, and the
demo never waits 4 seconds. Anything off-script goes live as normal.

**D15 — 2026-10-28 — Day Mode fallback: started work first, and skip what doesn't fit.**
Spec 10.6 sorts by due date then energy cost and "keeps while the total fits".
Two refinements: on the same due date, a task already in progress or stuck
sorts before one not started (moving the lab report Maya is halfway through
would throw away her context), and a task that doesn't fit is skipped rather
than ending the loop, so a light task later in the list can still be kept.
On the demo board this keeps "Email TA about lab data" (due today) and
"Chemistry lab report" (4 of 4 points).

**D16 — 2026-10-28 — The Unstick fallback still changes with state.**
13.6 requires the step to differ between Ebb and Swell, including with AI
off. The 36-entry table is per reason and type, so I add a short state tail:
Ebb gets "You can stop after that." (permission to do only the tiny step),
Swell gets "Then keep going for the whole block." Focus length follows the
quadrant (5/10/15/25, 10 with no check-in) and is 5 for "I don't have
energy". "Different step" walks down to a smaller step for the same task type.

**D17 — 2026-10-28 — Safety phrases match whole words, and idioms are excluded.**
"This deadline is killing me", "dying to" and "dead tired" do not trigger the
crisis screen; "kill myself" does even when it may be a joke. Sending someone
to a crisis screen for venting about homework would teach them to stop
writing honestly, while a false alarm on "kill myself" is the safer mistake.
I added a few unambiguous phrases to the spec's list ("end it all", "take my
own life", "no quiero estar vivo/viva", "acabar con mi vida"); the team
reviews the list with their partner.

**D18 — 2026-10-28 — HTTP status codes for the envelope.**
The spec defines the envelope but only the 429 status. I use 400 for invalid
input, 503 for a missing key, 504 for a timeout and 502 for invalid output or
a provider error. The browser treats every `ok: false` the same way.
