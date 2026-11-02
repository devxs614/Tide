# 3D companions: a roadmap note

*For the partner meeting on Tuesday, Nov 3. This branch holds only this
note. Nothing here is built, and the branch is never merged.*

## Where we are

Tide's six companions (Lolo the axolotl, the otter, the capybara, the
gecko, the jellyfish and the hermit crab) are flat 2D drawings made in
code. Each one is a small SVG with 14 expressions, a few accessories and
light CSS motion that has three levels: off, calm and lively. They load
with the page, work offline, and cost almost nothing to draw. Our partner
told us they like this look, and so do we.

Someone on the team asked whether the companions should be 3D. This note
is our answer for now: not for launch, maybe later, and only after real
students tell us it would help.

## Why 3D might help

- **Depth and presence.** A companion that turns, leans and looks at you
  can feel more like company during a hard focus block.
- **Personality.** Small things like a tilt of the head or a slow blink
  carry a lot of feeling, and 3D makes them easy to vary.
- **Novelty.** A new look could keep the app feeling fresh for students
  who use it every day.

## Why we're waiting

- **Our partner likes the 2D look.** Changing what works, right before
  user testing, would be a risk with no clear reason behind it.
- **Low-end phones.** Many students use older or cheaper Android phones.
  A 3D scene keeps the graphics chip busy, warms the phone and drains the
  battery, the opposite of a calm app.
- **Motion sensitivity.** Some of our users are sensitive to movement.
  Every option would need a still version that looks just as good, and
  our three motion levels would need to work the same way in 3D.
- **Download size.** Today's first load for Today is right at our 300 KB
  budget. Any 3D or animation runtime would have to load later, only on
  the screens that show a companion, and the models themselves add to it.
- **Time.** Modeling, rigging and testing six companions with all their
  expressions is weeks of art work we don't have before the Challenge.

## The options

The sizes below are relative, not measured. If we try one, we'll measure
it on a real low-end phone before deciding anything.

| Option | Art workflow | Runtime size | Performance | Accessibility | Offline | Effort |
|---|---|---|---|---|---|---|
| **Rive** (2D with state machines) | Draw and animate in the Rive editor; expressions become states | Medium (a WebAssembly runtime) | Good; renders 2D on a canvas | Still poses are easy; we'd map our motion levels to states | Yes, files ship with the app | Medium: redraw six companions in Rive |
| **Spline** (3D scenes for the web) | Design in the Spline editor, export a scene | Large | Heavy on older phones | Needs a separate still fallback | Possible if self-hosted | Medium to high |
| **three.js / React Three Fiber** with GLB models | Model and rig in Blender, export GLB | Large (engine plus models) | Depends on the models; needs care on low-end phones | Needs a still fallback and a reduced-motion mode we build ourselves | Yes, if the models are cached | High |
| **Pre-rendered sprite sheets** | Render 3D frames once, play them as images | None, but the images are heavy | Light to play | Easy to freeze on one frame | Yes, cached images | Medium; every new expression means rendering again |
| **Lottie** | Animate in After Effects, export JSON | Medium (a player library) | Good for short loops | Can pause on one frame | Yes | Medium; the art moves out of our code |

## What we suggest

1. **Keep the 2D companions for launch.** They're tested, light and
   accessible, and our partner likes them.
2. **If we want richer animation, try Rive first, with one companion.**
   It's the closest to how the companions work now (expressions as
   states), it stays 2D, and it lets us check size, battery and motion
   levels on a real phone without changing the other five.
3. **Consider 3D only after user testing.** If students tell us the
   companions feel flat or that they'd use them more with depth, we'd
   prototype one 3D companion behind a setting, off by default, with a
   still version for reduced motion.

Whatever we try, the rules stay the same: companions support and never
judge, "none" is a real choice, nothing appears on the crisis screen, and
the app never needs the internet to show them.

## Questions for our partner

1. Do the current companions feel right for students aged 18 to 24?
2. Would 3D add something for the students you work with, or would it be
   distracting?
3. Do any of your students have trouble with motion on screens? What
   helps them?
4. Would you rather we spend the next weeks on richer companions, or on
   other parts of Tide (calendar import, reminders the student designs)?
5. Would a few students try one animated companion for a week and tell
   us how it feels?

---

*Drafted by Claude Code for the Tide team from our v2.1 spec; the team
reviews it before sharing.*
