// /prompts-doc — the AI Prompts document, laid out for printing to PDF from
// the browser (File → Print → Save as PDF). It is not linked from the app.
// The system prompts are read from /prompts at build time, the schemas come
// from the zod definitions, and the examples are real input/output pairs.
import { PROMPT_FILES, PROMPT_TEXT, systemPrompt } from '@/lib/ai/prompts';
import { ROUTE_DOCS, exampleOutput } from '@/lib/ai/promptDocs';

export const metadata = { title: 'Tide — AI Prompts' };

const TIER_MODEL = {
  fast: 'TIDE_MODEL_FAST (default claude-haiku-5-5)',
  smart: 'TIDE_MODEL_SMART (default claude-sonnet-5-5)',
};

function Code({ value }: { value: unknown }) {
  return <pre className="prompts-code">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>;
}

export default function PromptsDocPage() {
  return (
    <main className="prompts-doc">
      <header>
        <h1>Tide — AI Prompts</h1>
        <p>
          <strong>Team:</strong> &lt;team name&gt; · <strong>University:</strong> &lt;university&gt; · <strong>Event:</strong> North American
          AI Challenge for Neurodiverse Learning 2026, Launchpad Monterrey
        </p>
      </header>

      <section>
        <h2>How Tide uses AI</h2>
        <p>
          Tide is a local-first web app that connects how a neurodivergent college student feels with what they can realistically do next.
          It uses Claude in five small server-side routes, only where a fixed rule can&apos;t do the job: interpreting free language into
          emotion words, adapting a first step to a specific task and state, reshaping a day, preparing a switch between activities, and
          putting computed patterns into words. The code calculates; the AI interprets language and explains. Each route receives only the
          fields in its input schema (no names, no contacts), uses the shared preamble plus its own prompt below, and must answer with one
          JSON object. Every answer is validated with zod and extra checks on the server and again in the browser; an invalid answer gets
          one retry, and any failure, timeout or switched-off AI falls back to a deterministic answer. The server stores and logs no user
          text. A safety check runs in the browser before any free text is sent.
        </p>
        <p>
          Requests are sent with thinking turned off and low effort, because these are short structured answers with an 8-second budget;
          no sampling parameters are sent.
        </p>
      </section>

      <section>
        <h2>Shared preamble ({PROMPT_FILES.preamble})</h2>
        <p>Sent at the start of every route&apos;s system prompt.</p>
        <Code value={PROMPT_TEXT.preamble} />
      </section>

      {ROUTE_DOCS.map((doc) => (
        <section key={doc.route} className="prompts-route">
          <h2>
            {doc.title} <span className="prompts-path">/api/ai/{doc.route}</span>
          </h2>
          <p>{doc.purpose}</p>
          <p>
            <strong>Model:</strong> {TIER_MODEL[doc.tier]} · <strong>max_tokens:</strong> {doc.maxTokens} · <strong>Prompt file:</strong>{' '}
            prompts/{PROMPT_FILES[doc.route]}
          </p>
          <h3>System prompt (preamble + route prompt)</h3>
          <Code value={systemPrompt(doc.route)} />
          <h3>Input schema</h3>
          <Code value={doc.inputSchema} />
          <h3>Output schema</h3>
          <Code value={doc.outputSchema} />
          <h3>Example input</h3>
          <Code value={doc.exampleInput} />
          <h3>Example output</h3>
          <Code value={exampleOutput(doc)} />
          <h3>Validation</h3>
          <ul>
            {doc.validation.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <h3>Fallback</h3>
          <p>{doc.fallback}</p>
          <h3>Safety</h3>
          <p>{doc.safety}</p>
        </section>
      ))}

      <section className="prompts-route">
        <h2>Safety and formatting guidelines</h2>
        <ul>
          <li>The model never tells the user what they feel; it offers options and the user decides.</li>
          <li>No diagnosis, no clinical labels about the user, no claim to be therapy or medical advice.</li>
          <li>No shame, pressure, moralizing or guilt. Being stuck is information, not failure.</li>
          <li>Only information in the input is used: no invented facts, numbers, history, names or events.</li>
          <li>Short, concrete language (sentences under 15 words), respecting Gentle, Direct or Literal mode.</li>
          <li>Crisis language stops coaching: a browser keyword check runs first, and the label route can also set safetyFlag.</li>
          <li>Output is exactly one JSON object; anything else is retried once and then replaced by the fallback.</li>
          <li>Every AI result is labeled as a suggestion, can be read aloud, and can be dismissed or replaced.</li>
        </ul>
      </section>
    </main>
  );
}
