import {
  env,
  fetchWithTimeout,
  withFallback,
  type TtsAdapter,
  type TtsRequest,
  type TtsResult,
} from "./types";

async function toBase64(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await res.json()) as { audio?: string; audioContent?: string };
    const audio = data.audio ?? data.audioContent;
    if (!audio) throw new Error("tts_empty");
    return audio;
  }
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength === 0) throw new Error("tts_empty");
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

/** Primary: Krutrim text-to-speech. */
const krutrim: TtsAdapter = {
  id: "tts.primary",
  isConfigured: () => Boolean(env("KRUTRIM_API_KEY") && env("KRUTRIM_TTS_URL")),
  async speak(req: TtsRequest): Promise<TtsResult> {
    const res = await fetchWithTimeout(env("KRUTRIM_TTS_URL")!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env("KRUTRIM_API_KEY")}`,
      },
      body: JSON.stringify({
        model: env("KRUTRIM_TTS_MODEL") ?? "default",
        language: req.lang,
        text: req.text,
      }),
    });
    if (!res.ok) throw new Error("tts_primary_http_" + res.status);
    return { audioBase64: await toBase64(res), mimeType: "audio/mpeg" };
  },
};

/** Fallback: YourVoic text-to-speech. */
const yourvoic: TtsAdapter = {
  id: "tts.fallback",
  isConfigured: () => Boolean(env("YOURVOIC_API_KEY") && env("YOURVOIC_TTS_URL")),
  async speak(req: TtsRequest): Promise<TtsResult> {
    const res = await fetchWithTimeout(env("YOURVOIC_TTS_URL")!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env("YOURVOIC_API_KEY")}`,
      },
      body: JSON.stringify({ language: req.lang, text: req.text }),
    });
    if (!res.ok) throw new Error("tts_fallback_http_" + res.status);
    return { audioBase64: await toBase64(res), mimeType: "audio/mpeg" };
  },
};

export function ttsConfigured(): boolean {
  return krutrim.isConfigured() || yourvoic.isConfigured();
}

export async function speak(req: TtsRequest): Promise<TtsResult> {
  return withFallback<TtsResult>([
    { id: krutrim.id, isConfigured: () => krutrim.isConfigured(), run: () => krutrim.speak(req) },
    { id: yourvoic.id, isConfigured: () => yourvoic.isConfigured(), run: () => yourvoic.speak(req) },
  ]);
}
