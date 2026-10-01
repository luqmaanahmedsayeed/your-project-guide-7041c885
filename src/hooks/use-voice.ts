import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getVoiceCapabilities, sttTranscribe, ttsSpeak } from "@/lib/sahayi.functions";
import { speechLocale, type Lang } from "@/lib/i18n";

/* Minimal typings for the browser speech APIs (not in lib.dom). */
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<SpeechRecognitionAlternative>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/**
 * Voice capture: INPUT LANGUAGE stage.
 * Uses the server speech endpoint when providers are configured, otherwise the
 * device's own speech recognition. Either way the caller just receives text.
 */
export function useVoiceInput(lang: Lang) {
  const capabilities = useServerFn(getVoiceCapabilities);
  const transcribe = useServerFn(sttTranscribe);
  const [serverStt, setServerStt] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let active = true;
    capabilities({})
      .then((result) => {
        if (active) setServerStt(result.serverStt);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [capabilities]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  /** Resolves with recognised text, or null when nothing could be heard. */
  const listen = useCallback(async (): Promise<string | null> => {
    if (serverStt) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return await new Promise<string | null>((resolve) => {
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          if (blob.size === 0) return resolve(null);
          const buffer = await blob.arrayBuffer();
          let binary = "";
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
          try {
            const result = await transcribe({
              data: {
                audioBase64: btoa(binary),
                mimeType: recorder.mimeType || "audio/webm",
                lang,
              },
            });
            resolve(result.ok && result.text ? result.text : null);
          } catch {
            resolve(null);
          }
        };
        recorder.start();
      });
    }

    const Ctor = getRecognitionCtor();
    if (!Ctor) throw new Error("unsupported");
    // Ask for permission explicitly so the user sees one clear prompt.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());

    return await new Promise<string | null>((resolve) => {
      const recognition = new Ctor();
      recognitionRef.current = recognition;
      recognition.lang = speechLocale[lang];
      recognition.continuous = false;
      recognition.interimResults = false;
      let settled = false;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      recognition.onresult = (event) => {
        finish(event.results[0]?.[0]?.transcript?.trim() || null);
      };
      recognition.onerror = () => finish(null);
      recognition.onend = () => finish(null);
      recognition.start();
    });
  }, [lang, serverStt, transcribe]);

  return { listen, stop };
}

/**
 * Voice playback: OUTPUT LANGUAGE stage.
 * Server voice first, device voice second. Failure never blocks reading.
 */
export function useVoiceOutput(lang: Lang) {
  const capabilities = useServerFn(getVoiceCapabilities);
  const synthesize = useServerFn(ttsSpeak);
  const [serverTts, setServerTts] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;
    capabilities({})
      .then((result) => {
        if (active) setServerTts(result.serverTts);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [capabilities]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeakingId(null);
  }, []);

  /** Returns false when no voice could be played. */
  const play = useCallback(
    async (id: string, text: string): Promise<boolean> => {
      stop();
      setSpeakingId(id);

      if (serverTts) {
        try {
          const result = await synthesize({ data: { text, lang } });
          if (result.ok && result.audioBase64) {
            const audio = new Audio(`data:${result.mimeType};base64,${result.audioBase64}`);
            audioRef.current = audio;
            audio.onended = () => setSpeakingId(null);
            await audio.play();
            return true;
          }
        } catch {
          /* fall through to device voice */
        }
      }

      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLocale[lang];
        utterance.rate = 0.95;
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        window.speechSynthesis.speak(utterance);
        return true;
      }

      setSpeakingId(null);
      return false;
    },
    [lang, serverTts, stop, synthesize],
  );

  useEffect(() => stop, [stop]);

  return { play, stop, speakingId };
}
