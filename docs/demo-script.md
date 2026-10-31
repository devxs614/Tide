# Tide — the 100-second demo

This is the live demo from Section 14.3 of the build spec, as it runs in the
app today. Everything below uses demo mode: synthetic data for Maya, a
fictional first-year student, with the clock set to Thursday, November 5.
The top bar shows a "Demo data" badge the whole time, so nobody is misled.

The narrator lines are suggestions. Change them to your own words.

## The script

| Time | Screen | Operator does | Narrator says | What should appear |
|---|---|---|---|---|
| 0:00 | Today | Tap **Check in**. Type: *Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.* Tap **Next**. | "Maya doesn't say 'I feel drained'. She says what's happening, in her own words." | Three words: **Drained**, **Frustrated**, **Overwhelmed**, each with a plain definition, nothing preselected, and the question "Is it more that you're tired, or that the report feels too big?" |
| 0:15 | Check-in | Tap **Drained** and **Frustrated**. **Next**. **Skip**. **Adjust my plan**. | "Tide offers words. Maya chooses. The AI never decides how she feels." | The dot lands in Ebb. The check-in saves and the Day Mode sheet opens. |
| 0:25 | Day Mode | Tap **Gentle**. Read the proposal. Tap **Use this plan**. | "On a low day, Tide keeps what matters and moves the rest. Nothing is deleted, and she can flip any task." | Keep today: **Chemistry lab report**, **Email TA about lab data** (4 of about 4 energy). Move: Calculus problem set 7, Physics reading, Laundry, group chat. Today now shows the win card: "Last Thursday felt like this too. You still finished: lab outline." |
| 0:40 | Tasks | Tap **In progress (1)**. On the lab report, **Move to… → Stuck**. Tap **I don't know where to start**. | "Stuck isn't failure. It's information. And Tide remembers what has worked for her before." | First step: "Open the report and type only the title and date." Below it: "Before writing tasks, 3-minute walk helped you 4 of 5 times. Want to do that first?" |
| 1:05 | Today | *(Rehearsals: Settings → Demo → **Jump to bridge moment** first.)* Tap **Get ready** on the Bridge card. | "Switches are where Maya's days fall apart. Lab ends, calculus starts in nine minutes." | Card: "Chemistry lab → Calculus · leave in 9 min". In the sheet: "Switching from lab to class has felt hard 3 of the last 4 times. Let's make it easier." Parking note prefilled "Chemistry lab report: ". Box breathing suggested. Prep: Calculator, Notes from Tuesday, Go to Room 4-203. |
| 1:25 | Patterns | Open the **Patterns** tab. On the walk card, tap **Why am I seeing this?** | "This is plain code counting, not the AI guessing. Every pattern shows k of n and the exact moments behind it, and Maya can say 'not true for me'." | Three cards: the walk before writing (4 of 5 times), lab → class (3 of 4), box breathing (4 of 5). Why lists five dated moments. |

## Before the show

1. Use the laptop or phone you'll present with. Open the deployed URL (or
   `npm run dev` / `npm start` on the laptop).
2. Settings → Demo → turn on **Demo mode (synthetic data)** and confirm.
   This replaces everything on that device with Maya's data.
3. Set text size to 115% or 130% so the projector audience can read it.
4. Choose the start:
   - **Restart demo** starts the clock at 3:40 pm. Today shows "Next:
     Calculus · 4:50 pm · in 70 min". At 1:05 use **Jump to bridge moment**
     (4:41 pm) to bring up the Bridge.
   - **Restart demo at bridge time** starts at 4:36 pm: the Bridge card is
     already on Today from the start, so no jump is needed on stage.
5. Run the whole script once. Then tap **Restart demo** (it resets the data
   and the clock) so the live run starts clean.

## If the venue network fails

Nothing changes on screen. In demo mode the app races the live AI against
saved answers for the exact scripted inputs; if the network is down or slow,
the saved answer appears after about a second. Off-script inputs use the
built-in suggestions instead. Everything else runs on the device.

To be safe, rehearse once with Wi-Fi switched off.

## If the app fails

Switch to the backup video (recorded from this script, see TEAM_TODO) and
keep narrating over it. Don't troubleshoot on stage.

## Pre-show checklist

- [ ] Demo mode on, "Demo data" badge visible.
- [ ] Text size set for the projector; screen brightness up.
- [ ] Restarted the demo right before going on.
- [ ] Notifications off on the presenting device.
- [ ] Backup video open in another tab or on another device.
- [ ] One full rehearsal done today with Wi-Fi off.

## v2: the Demo button and the guided tour

Tide v2 runs the demo in its **own workspace**: a separate database
(`tide-demo`) filled with Maya's example data. Starting it never touches
the data on the device, and leaving it brings the real data back exactly
as it was.

### Starting a demo
- Open **`/demo`** (for example `https://<your-url>/demo`), or Menu →
  "Run the demo", or Settings → Demo, or "Watch the demo" on the first
  onboarding screen.
- Choose **Full tour** (a little over 2 minutes), **Pitch cut** (about 80
  seconds; measured in V12) or
  **Presenter mode** (pauses at each key moment). Options: read captions
  aloud, show captions, speed 1×, 1.5× or 2×.
- Every start puts the demo workspace back to the same Thursday afternoon
  (a second or two), so a second run in a row looks exactly like the first.
  Autoplay uses only the saved demo answers and never calls the AI, so it
  plays the same way every time. With no internet, run Tide locally
  (`npm run build` then `npm start`) so the pages themselves can load.

### Presenter keys (a clicker works)
- **Next:** → or PageDown · **Back to the previous chapter:** ← or PageUp
- **Play/pause:** Space · **Speed:** S · **Captions:** C · **Narration:** N
- **Exit the tour:** Esc (you stay in the demo workspace)
- Every control is also a button on the bar at the bottom.

### If something goes wrong
1. A step that can't find its button is skipped; the tour keeps going.
2. Press Esc, open `/demo` again and start the same mode, or use ← to go
   back to the start of the chapter (each chapter sets up its own route
   and time).
3. Settings → Demo inside the demo workspace has "Restart demo clock",
   "Jump to the bridge moment" and "Jump to evening".
4. Add `?demoDebug=1` to the start address (for example
   `/?demo=start&mode=pitch&demoDebug=1`) to see which steps ran or were
   skipped; the list stays for the whole tour.
5. Last resort: play the backup video.

### Leaving
Settings → Demo → "Leave demo", or "Leave demo" on the tour's end screen.

### Backup video
Record the full tour at 1× in the Lagoon theme, with captions on, once
it's been rehearsed on the presenting laptop (TEAM_TODO).
