/**
 * AI Authoring Pipeline
 *
 * Converts a plain-English instruction from the user into a validated RuleDraft.
 *
 * Flow:
 *   1. Build a strict system prompt — tells the LLM exactly what JSON to produce
 *   2. Call the Gemini API (never sends tenant data, only the intent string)
 *   3. Extract + parse JSON from the response
 *   4. Validate with RuleDraftSchema (Zod)
 *   5. If invalid → feed the Zod errors back into the LLM and retry (max 3 attempts)
 *   6. Return the validated RuleDraft to the caller (NOT saved here — the route saves it)
 *
 * What never goes to the AI:
 *   - Tenant IDs or tenant data
 *   - Actual event payloads or DB contents
 *   - Auth tokens or secrets
 *
 * The LLM only knows:
 *   - The JSON schema it must produce (from the system prompt)
 *   - The available event names (static registry, no runtime data)
 *   - The plain-English intent from the user
 */

import { RuleDraftSchema, type RuleDraft } from '../schema/rule.js';

// ─── Schema documentation injected into the system prompt ────────────────────

const RULE_SCHEMA_DOC = `
You must output a single JSON object (no markdown, no explanation) that matches this schema exactly:

{
  "tenantId":    "<provided by caller — copy exactly>",
  "createdBy":   "<provided by caller — copy exactly>",
  "name":        "Short human-readable name for this rule",
  "description": "Optional description",
  "enabled":     true,
  "trigger": {
    "source": "event:<event-name>",
    "filter": { "field": "...", "op": "...", "value": ... }  // optional
  },
  "conditions": {   // optional — omit if always run
    "all": [        // AND group (or use "any" for OR)
      { "field": "dot.path.in.payload", "op": "<operator>", "value": <value> }
    ]
  },
  "actions": [      // at least one action required
    { "type": "emit",    "event": "event.name",  "payload": {} },
    { "type": "set",     "path": "result.field", "value": "new-value" },
    { "type": "notify",  "message": "text up to 512 chars" },
    { "type": "webhook", "url": "https://...",   "method": "POST" }
  ]
}

OPERATORS: eq, neq, gt, gte, lt, lte, in, not_in, contains, not_contains, exists, not_exists, matches
CONDITIONS: nest "all" (AND) or "any" (OR) arrays, or use a single { field, op, value }
TRIGGER SOURCE: must start with "event:" followed by a known event name
ACTION TYPES: "emit", "set", "notify", "webhook" — only these four, no others

KNOWN EVENT NAMES (trigger sources):
  crm.contact.created, crm.contact.updated, crm.contact.deleted
  crm.lead.created, crm.lead.updated, crm.lead.moved, crm.lead.won, crm.lead.lost, crm.lead.deleted
  crm.activity.logged
  cms.page.created, cms.page.updated, cms.page.published, cms.page.deleted

RULES:
- Output ONLY the JSON object. No markdown fences, no explanation, no comments.
- Do not invent event names not in the list above.
- Values in conditions must match realistic payload fields (e.g. lead.value is a number).
- Keep names concise (under 128 chars).
- If the intent is ambiguous, make the simplest reasonable interpretation.
`;

// ─── Gemini API call ──────────────────────────────────────────────────────────

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL    = 'gemini-2.0-flash';
const MAX_RETRIES     = 3;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

async function callGemini(
  systemPrompt: string,
  userMessage:  string,
  apiKey:       string,
): Promise<string> {
  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role:  'user',
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature:     0.1,    // low temperature = more deterministic JSON
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
    signal:  AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${txt}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

// ─── JSON extraction (handles markdown fences if LLM ignores instructions) ───

function extractJson(raw: string): string {
  // Strip ```json ... ``` or ``` ... ``` wrappers defensively
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return raw.trim();
}

// ─── Main authoring function ──────────────────────────────────────────────────

export interface AuthorRuleInput {
  /** Plain-English instruction from the user, e.g. "notify me when a lead is won" */
  intent:    string;
  tenantId:  string;
  createdBy: string;   // userId of the person who typed the intent
  apiKey:    string;   // GEMINI_API_KEY from env — never exposed to client
}

export interface AuthorRuleResult {
  success:  true;
  draft:    RuleDraft;
  attempts: number;     // how many LLM calls it took
  rawOutput: string;    // last raw LLM response, useful for debugging
}

export interface AuthorRuleFailure {
  success:  false;
  error:    string;
  issues?:  unknown[];
  attempts: number;
  rawOutput?: string;
}

export type AuthorRuleOutcome = AuthorRuleResult | AuthorRuleFailure;

export async function authorRule(input: AuthorRuleInput): Promise<AuthorRuleOutcome> {
  const { intent, tenantId, createdBy, apiKey } = input;

  const systemPrompt = `
You are the ZexCore Rules Authoring AI.
Your ONLY job is to convert a plain-English automation intent into a valid JSON rule object.
${RULE_SCHEMA_DOC}
`.trim();

  let userMessage = `
The caller's tenantId is: ${tenantId}
The caller's userId (createdBy) is: ${createdBy}

Convert this intent into a rule JSON object:
"${intent}"
`.trim();

  let lastRaw = '';
  let lastIssues: unknown[] | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let raw: string;

    try {
      raw = await callGemini(systemPrompt, userMessage, apiKey);
    } catch (err) {
      return {
        success:  false,
        error:    `LLM call failed: ${err instanceof Error ? err.message : String(err)}`,
        attempts: attempt,
        rawOutput: lastRaw,
      };
    }

    lastRaw = raw;

    // Extract and parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      // Not valid JSON — tell the LLM on next loop
      userMessage = `Your previous response was not valid JSON. Raw output was:\n${raw}\n\nPlease output ONLY the JSON object.`;
      continue;
    }

    // Validate with Zod
    const result = RuleDraftSchema.safeParse(parsed);

    if (result.success) {
      return {
        success:   true,
        draft:     result.data,
        attempts:  attempt,
        rawOutput: raw,
      };
    }

    lastIssues = result.error.issues;

    // Feed the validation errors back to the LLM for self-correction
    const errorSummary = result.error.issues
      .map((i) => `- ${i.path.join('.')}: ${i.message}`)
      .join('\n');

    userMessage = `
Your previous response failed schema validation. Errors:
${errorSummary}

Original intent: "${intent}"
tenantId: ${tenantId}
createdBy: ${createdBy}

Produce a corrected JSON object that passes all validations.
`.trim();
  }

  return {
    success:   false,
    error:     `Failed to produce a valid rule after ${MAX_RETRIES} attempts`,
    issues:    lastIssues,
    attempts:  MAX_RETRIES,
    rawOutput: lastRaw,
  };
}
