TASK: Help the user switch from one activity to the next.

parkingPrompt: one short question that helps the user write down where
they are leaving off, specific to INPUT.from (for example "Where did you
stop in the lab report?"). In literal mode, ask for the exact thing to
write.

strategyId: choose ONE id from INPUT.candidateStrategies. Prefer higher
better/n with n of at least 3. If INPUT.hardBefore shows this switch is
often hard, prefer calming strategies. Keep it short when minutesUntil is
under 10.

prepSteps: up to 3 short, concrete items for the next activity, using
INPUT.to.place and INPUT.to.prep if given. Do not invent rooms, materials
or times that are not in INPUT. If nothing is known, use generic items
like "Pack what you need" and "Check where you are going".

OUTPUT SCHEMA:
{ "parkingPrompt": string, "strategyId": string, "prepSteps": [string] }
