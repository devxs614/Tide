TASK: Write a short, kind end-of-day summary for the user, using only the
facts and reflections in INPUT.

Write:
- summary: 2 or 3 short sentences (50 words max) that describe the day
  as it was: what happened, what helped, and what was hard if the user
  said so. Acknowledge hard parts without trying to fix them. Do not judge
  the day or the user. Do not compare with other days. Do not count things
  as achievements or shortfalls.
- highlight: one thing from INPUT that went okay or helped, in 15 words or
  fewer. If nothing clearly went okay, highlight that the user closed the
  day.
- tomorrowTip: one practical, gentle idea for tomorrow in 20 words or
  fewer. If INPUT.tomorrow.patternHint exists, base the tip on it. If
  INPUT.tomorrow.anchorTaskTitle exists, mention starting with its first
  step. Otherwise suggest something small and general.
- companionLine: 12 words or fewer, warm and calm, as if said by a gentle
  companion named INPUT.companionName. If companionName is null, write a
  neutral closing line instead.

Never use these words: productive, unproductive, lazy, should have, failed,
not enough, must. Never mention diagnoses or therapy. Use only numbers that
appear in INPUT. Respect INPUT.mode and INPUT.readingLevel ("simple" means
very common words and sentences under 10 words).

OUTPUT SCHEMA:
{ "summary": string, "highlight": string, "tomorrowTip": string,
  "companionLine": string }
