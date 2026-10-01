import { useState } from "react";
import { ArrowRight, Mic } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { PaperPanel, PanelHeader } from "./primitives";
import { Portrait } from "./Portrait";

/** Screen 02 — main assistant. Voice first, text second, suggestions third. */
export function AssistantHome({
  lang,
  onStartVoice,
  onAsk,
}: {
  lang: Lang;
  onStartVoice: () => void;
  onAsk: (question: string) => void;
}) {
  const s = t(lang);
  const [value, setValue] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = value.trim();
    if (!question) return;
    setValue("");
    onAsk(question);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <PaperPanel className="overflow-hidden px-5 pb-8 pt-6 sm:px-9 sm:pb-10 sm:pt-8">
        <PanelHeader schemeTag={s.schemeTag} />

        <div className="relative mt-6 grid gap-8 lg:grid-cols-[1fr_minmax(0,16rem)] lg:gap-4">
          <div>
            <h1 className="max-w-[18ch] font-display text-[clamp(1.875rem,6.5vw,3.25rem)] text-paper-foreground">
              {s.greeting}
            </h1>

            <div className="mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={onStartVoice}
                aria-label={s.tapToSpeak}
                className="flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:scale-[1.04] active:scale-100 sm:size-28"
              >
                <Mic className="size-11 sm:size-12" aria-hidden />
              </button>
              <span
                className="mt-4 font-display text-lg text-paper-foreground"
                style={{ fontWeight: 700 }}
              >
                {s.tapToSpeak}
              </span>

              <div className="mt-6 flex w-full items-center gap-4">
                <span aria-hidden className="h-px flex-1 bg-border" />
                <span className="label-mono text-paper-foreground/60">{s.or}</span>
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={submit} className="mt-6 w-full">
                <label htmlFor="sahayi-question" className="sr-only">
                  {s.typeHere}
                </label>
                <div className="flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-5 pr-2">
                  <input
                    id="sahayi-question"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={s.typeHere}
                    className="min-w-0 flex-1 bg-transparent py-2.5 font-body text-base text-paper-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    aria-label={s.send}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:brightness-95"
                  >
                    <ArrowRight className="size-5" aria-hidden />
                  </button>
                </div>
              </form>
            </div>
          </div>

          <Portrait
            priority
            className="pointer-events-none absolute -right-14 bottom-0 hidden h-[92%] w-56 lg:block"
            blockClassName="bottom-10 left-2 h-[62%] w-[80%]"
          />
        </div>

        <div className="mt-9">
          <p className="font-display text-sm text-paper-foreground" style={{ fontWeight: 700 }}>
            {s.youCanAlsoAsk}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {s.suggestions.map((question) => (
              <button key={question} type="button" onClick={() => onAsk(question)} className="chip">
                {question}
              </button>
            ))}
          </div>
        </div>
      </PaperPanel>
    </div>
  );
}
