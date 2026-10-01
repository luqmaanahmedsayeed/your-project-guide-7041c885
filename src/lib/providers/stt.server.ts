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
  isConfigured: () => Boolean(env("KRUTRIM_API_KEY")),
  async transcribe(req: SttRequest): Promise<SttResult> {
    const form = new FormData();
    const bytes = Uint8Array.from(atob(req.audioBase64), (char) => char.charCodeAt(0));
    form.append("file", new Blob([bytes], { type: req.mimeType }), "sahayi.wav");
    form.append("lang_code", req.lang === "hi" ? "hin" : "eng");
    const res = await fetchWithTimeout(
      "https://cloud.olakrutrim.com/api/v1/languagelabs/transcribe/upload",
      {
        method: "POST",
        headers: { authorization: `Bearer ${env("KRUTRIM_API_KEY")}` },
        body: form,
      },
    );
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
  isConfigured: () => Boolean(env("YOURVOIC_AI_API")),
  async transcribe(req: SttRequest): Promise<SttResult> {
    const form = new FormData();
    const bytes = Uint8Array.from(atob(req.audioBase64), (char) => char.charCodeAt(0));
    form.append("file", new Blob([bytes], { type: req.mimeType }), "sahayi.wav");
    form.append("model", "cipher-fast");
    form.append("language", req.lang === "hi" ? "hi" : "en");
    const res = await fetchWithTimeout("https://yourvoic.com/api/v1/stt/transcribe", {
      method: "POST",
      headers: { "X-API-Key": env("YOURVOIC_AI_API")! },
      body: form,
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
    {
      id: krutrim.id,
      isConfigured: () => krutrim.isConfigured(),
      run: () => krutrim.transcribe(req),
    },
    {
      id: yourvoic.id,
      isConfigured: () => yourvoic.isConfigured(),
      run: () => yourvoic.transcribe(req),
    },
  ]);
}
