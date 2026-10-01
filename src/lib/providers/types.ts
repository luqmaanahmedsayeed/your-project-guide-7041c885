import type { Lang } from "../pmuy-knowledge";

/**
 * Provider abstraction for SAHAYI's three API stages:
 *   INPUT LANGUAGE API (STT) -> REASONING API -> OUTPUT LANGUAGE API (TTS)
 *
 * The UI never talks to a provider directly. It calls server functions, which
 * try the primary adapter and silently fall back to the secondary one.
 * Provider names and technical errors are never returned to the client.
 */

export interface SttRequest {
  /** base64-encoded audio payload */
  audioBase64: string;
  mimeType: string;
  lang: Lang;
}
export interface SttResult {
  text: string;
}

export interface ReasonRequest {
  question: string;
  lang: Lang;
  /** prior turns, oldest first */
  history: { role: "user" | "assistant"; content: string }[];
  /** ask for a simplified restatement of the previous answer */
  simplify?: boolean;
  previousTopicId?: string | undefined;
}
export interface ReasonResult {
  text: string;
  bullets: string[];
  topicId: string;
}

export interface TtsRequest {
  text: string;
  lang: Lang;
}
export interface TtsResult {
  audioBase64: string;
  mimeType: string;
}

export interface SttAdapter {
  readonly id: string;
  isConfigured(): boolean;
  transcribe(req: SttRequest): Promise<SttResult>;
}
export interface ReasonAdapter {
  readonly id: string;
  isConfigured(): boolean;
  answer(req: ReasonRequest): Promise<ReasonResult>;
}
export interface TtsAdapter {
  readonly id: string;
  isConfigured(): boolean;
  speak(req: TtsRequest): Promise<TtsResult>;
}

/** Runs adapters in order, skipping unconfigured ones. Failures stay internal. */
export async function withFallback<T>(
  candidates: { id: string; isConfigured(): boolean; run: () => Promise<T> }[],
): Promise<T> {
  let lastError: unknown;
  for (const candidate of candidates) {
    if (!candidate.isConfigured()) continue;
    try {
      return await candidate.run();
    } catch (error) {
      lastError = error;
      // Intentionally not logging payloads or credentials.
      console.warn(`[sahayi] provider stage failed: ${candidate.id}`);
    }
  }
  throw lastError ?? new Error("no_provider_available");
}

export function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
