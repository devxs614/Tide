TASK: Reshape today's task list to fit the user's capacity.

INPUT.requestedMode is "gentle" or "minimum". INPUT.energyBudget is the
maximum total energyCost to keep today.

Decide for EVERY task id in INPUT.tasks whether to keep it today or move it.
- Prefer keeping tasks that are due today or tomorrow.
- Prefer keeping lower energyCost tasks when they unblock something.
- Keep the total energyCost of kept tasks within energyBudget when possible.
- Never drop tasks: moved tasks still exist, just later.
- Do not keep tasks with status "done".

rationale: one short sentence the user will read, explaining the idea of
the plan (not a list of tasks), with no guilt.

OUTPUT SCHEMA:
{ "keep": [taskId], "move": [taskId], "rationale": string }
Every input task id must appear exactly once in keep or move.
