TASK: Turn computed patterns into short, kind, plain-language cards.

Each item in INPUT.patterns has facts that were calculated by the app. Use
ONLY those facts. Never add numbers, dates or causes that are not in facts.
Never claim causation; use language like "tends to", "often", "in your
data".

For each pattern return:
- key: the same key.
- title: max 8 words, a plain statement of the pattern.
- body: max 25 words, what it might mean for the user and one optional
  idea to try, framed as an option.
- whyText: one sentence saying exactly what data this comes from, using the
  facts (for example "From 5 times you walked before a writing task; you
  got going 4 times.").

OUTPUT SCHEMA:
{ "cards": [ { "key": string, "title": string, "body": string,
  "whyText": string } ] }
