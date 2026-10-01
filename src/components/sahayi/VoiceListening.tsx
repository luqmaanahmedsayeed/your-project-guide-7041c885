import { ArrowLeft, Mic } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { PanelHeader } from "./primitives";

/** Screen 03 — focused listening state on the black ground. */
export function VoiceListening({
  lang,
  onBack,
  onStop,
}: {
  lang: Lang;
  onBack: () => void;
  onStop: () => void;
}) {
  const s = t(lang);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-xl border border-rule px-5 pb-12 pt-6 sm:px-9 sm:pb-16 sm:pt-8">
        <PanelHeader schemeTag={s.schemeTag} tone="light" />

        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 font-display text-sm text-foreground/80 transition-colors hover:text-foreground"
          style={{ fontWeight: 700 }}
        >
          <ArrowLeft className="size-5" aria-hidden />
          {s.back}
        </button>

        <div className="mt-10 flex flex-col items-center sm:mt-14">
          <div className="relative flex size-56 items-center justify-center sm:size-64">
            {[0, 0.8, 1.6].map((delay) => (
              <span
                key={delay}
                aria-hidden
                className="listen-ring absolute size-32 rounded-full border border-primary/70 sm:size-36"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
            <button
              type="button"
              onClick={onStop}
              aria-label={s.stop}
              className="relative z-10 flex size-28 items-center justify-center rounded-full bg-primary text-primary-foreground sm:size-32"
            >
              <Mic className="size-12" aria-hidden />
            </button>
          </div>

          <p className="mt-8 font-body text-3xl text-foreground sm:text-4xl" aria-live="polite">
            {s.listening}
          </p>
          <p className="mt-2 font-body text-lg text-foreground/70">{s.startSpeaking}</p>

          <div aria-hidden className="mt-10 flex h-16 items-center gap-1.5">
            {Array.from({ length: 28 }).map((_, index) => (
              <span
                key={index}
                className="wave-bar w-1 rounded-full bg-primary/60"
                style={{
                  height: `${18 + Math.sin(index / 2.2) * 26 + 26}px`,
                  animationDelay: `${(index % 9) * 0.09}s`,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
