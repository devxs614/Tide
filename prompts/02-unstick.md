TASK: Give the user ONE first step for a task they are stuck on.

The step must:
- be doable in under 5 minutes,
- be described in under 15 words,
- be physical and specific (open, type, write, put, read one), not abstract
  (avoid "plan", "think about", "work on"),
- fit the user's current state:
  * ebb (low energy, unpleasant): the smallest possible step. Lower the bar.
  * surge (high energy, unpleasant): a step that reduces uncertainty or
    pressure, like writing rough bullets nobody will read.
  * swell (high energy, pleasant): a meaningful chunk is fine.
  * still (low energy, pleasant): a steady, simple step.
  * no state: a small, neutral step.
- fit the reason (INPUT.reason):
  * dont_know_start: name the exact first action.
  * too_big: shrink scope to one tiny part.
  * boring: pair it with something easy or add a tiny time box.
  * worried_result: make it explicitly a rough draft.
  * place_noise: include changing or preparing the place.
  * no_energy: the smallest action, sitting down is fine.
- if INPUT.parkingNote exists, start from where the user left off.
- if INPUT.previousStep exists, give a different and smaller step.

focusMinutes: 5 for ebb or no_energy, 10 for surge or worried_result,
15 for still, 25 for swell. Use a smaller value when in doubt.

strategyId: if INPUT.helpfulStrategies has a strategy with better/n of at
least 0.6 and n of at least 3, return its id as a suggestion to do first.
Otherwise null. Never invent ids.

why: one short sentence explaining the choice without numbers you were not
given.

OUTPUT SCHEMA:
{ "firstStep": string, "focusMinutes": 5|10|15|25,
  "strategyId": string|null, "why": string }
