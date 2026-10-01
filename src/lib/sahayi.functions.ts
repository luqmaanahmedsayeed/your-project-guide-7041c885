import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * The only bridge between the SAHAYI UI and the provider layer.
 * Secrets are read inside handlers and never reach the browser.
 */

const langSchema = z.enum(["en", "hi"]);

const sttSchema = z.object({
  audioBase64: z.string().min(1).max(8_000_000),
  mimeType: z.string().min(3).max(100),
  lang: langSchema,
});

const reasonSchema = z.object({
  question: z.string().min(1).max(500),
  lang: langSchema,
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .default([]),
  simplify: z.boolean().default(false),
  previousTopicId: z.string().max(64).optional(),
});

const ttsSchema = z.object({
  text: z.string().min(1).max(1200),
  lang: langSchema,
});

/** INPUT LANGUAGE API — speech to text. */
export const sttTranscribe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sttSchema.parse(data))
  .handler(async ({ data }) => {
    const { sttConfigured, transcribe } = await import("./providers/stt.server");
    if (!sttConfigured()) return { ok: false as const, text: "" };
    try {
      const result = await transcribe(data);
      return { ok: true as const, text: result.text };
    } catch {
      return { ok: false as const, text: "" };
    }
  });

/** REASONING API — PMUY-restricted answer. */
export const reasonAnswer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reasonSchema.parse(data))
  .handler(async ({ data }) => {
    const { reason } = await import("./providers/reason.server");
    try {
      const result = await reason(data);
      return { ok: true as const, ...result };
    } catch {
      return { ok: false as const, text: "", bullets: [] as string[], topicId: "unknown" };
    }
  });

/** OUTPUT LANGUAGE API — text to speech. */
export const ttsSpeak = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ttsSchema.parse(data))
  .handler(async ({ data }) => {
    const { speak, ttsConfigured } = await import("./providers/tts.server");
    if (!ttsConfigured()) return { ok: false as const, audioBase64: "", mimeType: "" };
    try {
      const result = await speak(data);
      return { ok: true as const, ...result };
    } catch {
      return { ok: false as const, audioBase64: "", mimeType: "" };
    }
  });

/** Official portal URL, configurable server-side. */
export const getPortalUrl = createServerFn({ method: "GET" }).handler(async () => {
  const { OFFICIAL_PMUY_URL } = await import("./pmuy-knowledge");
  return { url: process.env["OFFICIAL_PMUY_URL"] || OFFICIAL_PMUY_URL };
});
