# Demo script

How we present Tide. Everything runs on synthetic data for Maya, a fictional first-year student, with the clock set to Thursday, November 5, 3:40 pm, and a "Demo" badge stays on screen the whole time so nobody is misled.

## The guided tour

Open **`/demo`** (or the menu's "Run the demo", Settings → Demo, or "Watch the demo" on the first onboarding screen) and choose:

- **Full tour:** every feature. About 4 minutes (245–258 s) at 1× and 3 minutes (187–191 s) at 2×.
- **Pitch cut:** the highlights. About 2 minutes (111–117 s) at 1× and 90 seconds (85–88 s) at 2×.
- **Presenter mode:** the pitch path, pausing at each key moment until we press Next. We recommend it for the live pitch, so the presenter sets the pace.

Options: read captions aloud, show captions, speed 1×, 1.5× or 2×. The demo runs in its own workspace, a separate database (`tide-demo`) with Maya's data; starting it never touches anyone's own data, and "Leave demo" brings it back exactly as it was. Every start resets the workspace to the same afternoon, so a second run looks exactly like the first. Autoplay uses saved answers and never calls the AI, so it plays the same way offline; with no internet, run Tide locally (`npm run build`, then `npm start`) so the pages can load.

### Keys (a clicker works)
- **Next:** → or PageDown · **Back to the previous chapter:** ← or PageUp
- **Pause and play:** Space, K or P (Space is left to a focused button, so use K or P if you've just pressed one)
- **Speed:** S · **Captions:** C · **Narration:** N · **Leave the tour:** Esc
- Every control is also a button on the tour bar.

### How the tour paces itself
- Each caption stays up at least its reading time (2.5 to 9 seconds, longer for longer captions), counted from when the screen has settled. At 1.5× and 2× the looking time shrinks but reading time only by up to 1.25×.
- With narration on, the tour shows "Narration is on. Press play to start the tour." and waits for one tap on Play: browsers won't speak before a tap on the page. Then every caption is read to the end, and the next step waits for the voice.
- Pause stops everything at once, including the demo clock (the focus timer and the Bridge countdown stand still), and only a person can resume it. Switching windows pauses the tour. Next and Previous while paused play one step (in presenter mode, up to the next key moment) and stay paused.
- The theme step in "Make it yours" shows three looks, one second each: black, white, then the demo's own color theme, which stays for the rest of the tour.
- Add `?demoDebug=1` to the start address (for example `/?demo=start&mode=pitch&demoDebug=1`) for the rehearsal panel: the steps that ran or were skipped, the demo clock, and a timed log with a "Copy log" button to paste into our chat.

### If something goes wrong
1. A step that can't find its button is skipped and the tour keeps going.
2. Press Esc, open `/demo` again, or press ← to restart the chapter (each chapter sets up its own page and time).
3. Settings → Demo inside the workspace has "Restart demo clock", "Jump to the bridge moment" and "Jump to evening".
4. Last resort: play the backup video.

## The 100-second live demo (v1 path)

The path we used before the guided tour, still working inside the demo workspace. The narrator lines are suggestions.

| Time | Screen | We do | We say | What appears |
|---|---|---|---|---|
| 0:00 | Today | Tap **Check in**. Type: *Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.* Tap **Next**. | "Maya doesn't say 'I feel drained'. She says what's happening, in her own words." | Three words (Drained, Frustrated, Overwhelmed) with plain definitions, nothing preselected. |
| 0:15 | Check-in | Tap **Drained** and **Frustrated**, **Next**, **Skip**, **Adjust my plan**. | "Tide offers words. Maya chooses. The AI never decides how she feels." | The dot lands in Ebb; the Day Mode sheet opens. |
| 0:25 | Day Mode | Tap **Gentle**, then **Use this plan**. | "On a low day, Tide keeps what matters and moves the rest. Nothing is deleted." | Keep today: the lab report and the TA email; the rest moves. |
| 0:40 | Tasks | Move the lab report to **Stuck**, tap **I don't know where to start**. | "Stuck isn't failure. It's information." | First step: "Open the report and type only the title and date", and the walk that helped 4 of 5 times. |
| 1:05 | Today | *(Rehearsals: Settings → Demo → Jump to the bridge moment.)* Tap **Get ready** on the Bridge card. | "Switches are where Maya's days fall apart." | "Chemistry lab → Calculus · leave in 9 min", a parking note, box breathing, prep steps. |
| 1:25 | Patterns | Open **Patterns**, tap **Why am I seeing this?** on the walk card. | "This is plain code counting, not the AI guessing." | Three cards with k of n and the dated moments behind them. |

## Before the show
- Use the device we'll present with, at text size 115% or 130% for the projector (it's kept between tours), notifications off, brightness up.
- Run the tour once, then start it again right before going on.
- Keep the backup video open in another tab or device.
- Rehearse once with Wi-Fi off.

## Rehearsal checklist
- [ ] Run the full tour on the presentation laptop in Chrome **and** Edge with narration on; every caption is read.
- [ ] Pause at five moments (while typing, while the voice speaks, during the focus fast-forward, during a celebration, at a random step): it stops at once, stays stopped for 30 seconds, and resumes in the right place.
- [ ] Use Space and the presentation clicker (→ for Next) in presenter mode.
- [ ] Start the demo three times in a row quickly: no error.
- [ ] Watch the theme step: black, white, color, one second each.
- [ ] Check that nothing overlaps (the tour bar, captions, toasts, bubbles) at 1× in Lagoon, at text size 100% and 130%.
- [ ] Try Safari if anyone will present from an iPhone or a Mac: narration needs the tap on Play there too.
- [ ] Note the real durations and decide whether we present with presenter mode.
- [ ] Record the backup video: the full tour at 1× in Lagoon with captions on.
