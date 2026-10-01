import {
  env,
  fetchWithTimeout,
  withFallback,
  type SttAdapter,
  type SttRequest,
  type SttResult,
} from "./types";

/** Primary: Krutrim speech-to-text. */
const krutrim: SttAdapter = {
  id: "stt.primary",
  isConfigured: () => Boolean(env("KRUTRIM_API_KEY") && env("KRUTRIM_STT_URL")),
  async transcribe(req: SttRequest): Promise<SttResult> {
    const res = await fetchWithTimeout(env("KRUTRIM_STT_URL")!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env("KRUTRIM_API_KEY")}`,
      },
      body: JSON.stringify({
        model: env("KRUTRIM_STT_MODEL") ?? "default",
        language: req.lang,
        audio: req.audioBase64,
        mime_type: req.mimeType,
      }),
    });
    if (!res.ok) throw new Error("stt_primary_http_" + res.status);
    const data = (await res.json()) as { text?: string; transcript?: string };
    const text = (data.text ?? data.transcript ?? "").trim();
    if (!text) throw new Error("stt_primary_empty");
    return { text };
  },
};

/** Fallback: YourVoic speech-to-text. */
const yourvoic: SttAdapter = {
  id: "stt.fallback",
  isConfigured: () => Boolean(env("YOURVOIC_API_KEY") && env("YOURVOIC_STT_URL")),
  async transcribe(req: SttRequest): Promise<SttResult> {
    const res = await fetchWithTimeout(env("YOURVOIC_STT_URL")!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env("YOURVOIC_API_KEY")}`,
      },
      body: JSON.stringify({
        language: req.lang,
        audio: req.audioBase64,
        mime_type: req.mimeType,
      }),
    });
    if (!res.ok) throw new Error("stt_fallback_http_" + res.status);
    const data = (await res.json()) as { text?: string; transcript?: string };
    const text = (data.text ?? data.transcript ?? "").trim();
    if (!text) throw new Error("stt_fallback_empty");
    return { text };
  },
};

export function sttConfigured(): boolean {
  return krutrim.isConfigured() || yourvoic.isConfigured();
}

export async function transcribe(req: SttRequest): Promise<SttResult> {
  return withFallback<SttResult>([
    { id: krutrim.id, isConfigured: () => krutrim.isConfigured(), run: () => krutrim.transcribe(req) },
    {
      id: yourvoic.id,
      isConfigured: () => yourvoic.isConfigured(),
      run: () => yourvoic.transcribe(req),
    },
  ]);
}
