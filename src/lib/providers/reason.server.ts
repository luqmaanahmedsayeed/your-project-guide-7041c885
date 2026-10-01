import {
  answerFromKnowledge,
  pmuyKnowledge,
  simplifyFromKnowledge,
  type Lang,
} from "../pmuy-knowledge";
import {
  env,
  fetchWithTimeout,
  withFallback,
  type ReasonAdapter,
  type ReasonRequest,
  type ReasonResult,
} from "./types";

function systemPrompt(lang: Lang): string {
  const language = lang === "hi" ? "Hindi (Devanagari script)" : "English";
  return [
    "You are SAHAYI, a guide for one single government scheme: Pradhan Mantri Ujjwala Yojana (PMUY).",
    "You are not a general-purpose assistant. Refuse anything unrelated and steer back to PMUY.",
    "Answer ONLY using the verified knowledge provided below. Never invent eligibility rules,",
    "documents, benefits, deadlines, links, helplines or processes.",
    "If the knowledge does not cover the question, reply exactly with the provided fallback sentence.",
    `Always answer in ${language}. Keep answers under 45 words, simple, spoken-friendly and action-oriented.`,
    "",
    "VERIFIED KNOWLEDGE:",
    JSON.stringify(pmuyKnowledge, null, 0),
  ].join("\n");
}

function buildMessages(req: ReasonRequest) {
  const instruction = req.simplify
    ? "Restate your previous answer in much simpler words, preserving the exact meaning."
    : req.question;
  return [
    { role: "system", content: systemPrompt(req.lang) },
    ...req.history.slice(-6),
    { role: "user", content: instruction },
  ];
}

async function chatCompletion(
  url: string,
  apiKey: string,
  model: string,
  req: ReasonRequest,
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 300,
      messages: buildMessages(req),
    }),
  });
  if (!res.ok) throw new Error("reason_http_" + res.status);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("reason_empty");
  return text;
}

/** Primary: Groq. */
const groq: ReasonAdapter = {
  id: "reason.primary",
  isConfigured: () => Boolean(env("GROQ_AI_API")),
  async answer(req) {
    const text = await chatCompletion(
      "https://api.groq.com/openai/v1/chat/completions",
      env("GROQ_AI_API")!,
      "openai/gpt-oss-20b",
      req,
    );
    return { text, bullets: [], topicId: req.previousTopicId ?? "model" };
  },
};

/** Fallback: OpenRouter. */
const openrouter: ReasonAdapter = {
  id: "reason.fallback",
  isConfigured: () => Boolean(env("OPENROUTER_API_KEY")),
  async answer(req) {
    const text = await chatCompletion(
      "https://openrouter.ai/api/v1/chat/completions",
      env("OPENROUTER_API_KEY")!,
      "openai/gpt-oss-20b",
      req,
    );
    return { text, bullets: [], topicId: req.previousTopicId ?? "model" };
  },
};

/**
 * Deterministic knowledge-only answer. Used when no reasoning provider is
 * configured and as the last resort so the user is never left stranded.
 */
function deterministic(req: ReasonRequest): ReasonResult {
  if (req.simplify && req.previousTopicId) {
    return {
      text: simplifyFromKnowledge(req.previousTopicId, req.lang),
      bullets: [],
      topicId: req.previousTopicId,
    };
  }
  const result = answerFromKnowledge(req.question, req.lang);
  return result;
}

export async function reason(req: ReasonRequest): Promise<ReasonResult> {
  try {
    const result = await withFallback<ReasonResult>([
      { id: groq.id, isConfigured: () => groq.isConfigured(), run: () => groq.answer(req) },
      {
        id: openrouter.id,
        isConfigured: () => openrouter.isConfigured(),
        run: () => openrouter.answer(req),
      },
    ]);
    // Keep the knowledge-layer bullet lists attached to model answers too.
    const local = answerFromKnowledge(req.question, req.lang);
    return { ...result, bullets: result.bullets.length ? result.bullets : local.bullets };
  } catch {
    return deterministic(req);
  }
}
