# Changelog

What changed in Tide for the person using it, version by version.

## Demo fixes (2026-11-05)

We rehearsed the guided demo and fixed what went wrong, without changing its chapters, steps or captions.

- Starting or restarting the demo no longer fails with a "Key already exists" error, even with two tabs open or a quick double start.
- With narration on, the voice reads every caption to the end, in order. The tour waits for one tap on Play first, because browsers won't speak before a tap.
- Pause works on the first press, at any moment, even while a sheet is open, and the tour (and its clock) stays paused until someone presses play. Switching windows pauses it too.
- Every caption stays up long enough to read, and each step waits for the screen to settle. The tour bar no longer covers the check-in button or toasts, and the spotlight follows what it points at.
- The theme showcase shows black, white and color, one second each, instead of flashing through four themes.
- With `?demoDebug=1`, a rehearsal panel logs what the tour did and copies the log.

## v2.3.0 "Focused fixes" (2026-11-04)

- Tasks stays inside the phone frame on a laptop; swipe between columns or switch to a list, with quick filters (Due today, Light energy, Today's one thing).
- The companion's words never leave the phone area or cover the focus timer, inputs or main buttons. Choose speech bubbles, a caption bar or no speech, and tap the companion's head to see what it last said.
- The check-in button is smart: it shows where it helps, hides while you scroll or type, and a long press opens a two-tap Quick check-in. It can live in the tab bar or be hidden.
- Phone numbers take digits only, with the country code chosen separately; contacts can have a WhatsApp button.

## v2.2 "Bug sweep" (partial, shipped with v2.3.0, 2026-11-03)

- Words no longer split letter by letter at large text ("Toolki t", "Patter ns").

## v2.1.0 "Partner-Ready" (2026-11-02)

From our list after showing v2 to our Challenge Partner, most urgent first:

- The companion's speech bubble always shows its whole sentence and stays on screen.
- Every screen works at 115%, 130% and 150% text, from a 320 px phone to a laptop.
- Tasks and events can be edited or deleted, with Undo; weekly events can change one or all.
- Finished tasks leave the board after a day, into a Completed archive.
- A focus block's end is always signalled (sound, glow, vibration, optional notification), with optional "Earth to Maya!" check-ins and nine background sounds.
- Back and Cancel in every flow.
- A month calendar, eight looks to try, the Shore's time of day, and an interactive Count back.

## v2.0.0 "Experience" (2026-10-30)

- Optional companions (six, or none), with a Companion Studio.
- Fifteen themes, four fonts, a color-blind-safe palette and three motion levels.
- Soft synthesized sounds (off by default) and a more natural read-aloud voice.
- Your Shore, where things you do wash up, and notes in a bottle for harder days.
- Close the day, a three-minute wind-down.
- Today 2.0 with quick actions, Settings 2.0 with search and presets, a twelve-step onboarding, keyboard shortcuts and Install Tide.
- A guided demo that runs in its own workspace.

## v1 (2026-10-29)

The first build: check-in with AI feeling words and a body path, Day Modes, tasks with Unstick and focus blocks, the Bridge between activities, the Toolkit, Patterns with evidence, the Proof log, onboarding, settings, support with the crisis screen, read-aloud and dictation, and demo mode.
