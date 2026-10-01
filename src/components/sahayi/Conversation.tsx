import { useEffect, useRef, useState } from "react";
import { ArrowRight, Keyboard, Mic, RotateCcw, Volume2 } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { Avatar, PaperPanel, PanelHeader } from "./primitives";
import { Portrait } from "./Portrait";
import { ProgressIndicator } from "./ProgressIndicator";

export interface Message {
  id: string;
  role: "user" | "sahayi";
  text: string;
  bullets?: string[];
  note?: string;
  time: string;
  topicId?: string;
  /** label for the forward action on this answer */
  nextLabel?: string;
}

/** Screens 04–06 — conversation, AI answers, and document guidance. */
export function Conversation({
  lang,
  messages,
  pending,
  error,
  step,
  speakingId,
  onAsk,
  onListen,
  onSimplify,
  onNextStep,
  onStartVoice,
}: {
  lang: Lang;
  messages: Message[];
  pending: boolean;
  error: string | null;
  /** 0-based progress stage, or null to hide the indicator */
  step: number | null;
  speakingId: string | null;
  onAsk: (question: string) => void;
  onListen: (message: Message) => void;
  onSimplify: (message: Message) => void;
  onNextStep: (message: Message) => void;
  onStartVoice: () => void;
}) {
  const s = t(lang);
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = value.trim();
    if (!question) return;
    setValue("");
    onAsk(question);
  }

  const lastAnswer = [...messages].reverse().find((message) => message.role === "sahayi");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <PaperPanel className="overflow-hidden px-5 pb-7 pt-6 sm:px-9 sm:pb-9 sm:pt-8">
        <PanelHeader
          schemeTag={s.schemeTag}
          right={
            step !== null ? (
              <ProgressIndicator steps={s.steps} current={step} className="ml-auto" />
            ) : undefined
          }
        />

        <div className="relative mt-7">
          <Portrait
            className="absolute -right-12 top-0 hidden h-72 w-44 xl:block"
            blockClassName="bottom-8 left-0 h-[58%] w-[78%]"
          />

          <div className="flex flex-col gap-6 xl:pr-28">
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="rise flex items-start justify-end gap-3">
                  <div className="max-w-[80%] text-right">
                    <p className="rounded-xl bg-muted px-4 py-3 font-body text-base text-paper-foreground sm:text-lg">
                      {message.text}
                    </p>
                    <span className="label-mono mt-1.5 block text-muted-foreground">
                      {message.time}
                    </span>
                  </div>
                  <Avatar who="user" />
                </div>
              ) : (
                <div key={message.id} className="rise flex items-start gap-3">
                  <Avatar who="sahayi" />
                  <div className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
                    <p className="font-body text-base leading-relaxed text-paper-foreground sm:text-lg">
                      {message.text}
                    </p>

                    {message.bullets?.length ? (
                      <ul className="mt-3 space-y-1.5 font-body text-base text-paper-foreground sm:text-lg">
                        {message.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2">
                            <span aria-hidden className="text-primary">
                              •
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {message.note ? (
                      <p className="mt-3 font-body text-base text-paper-foreground/75">
                        {message.note}
                      </p>
                    ) : null}

                    <span className="label-mono mt-3 block text-muted-foreground">
                      {message.time}
                    </span>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => onListen(message)}
                        aria-pressed={speakingId === message.id}
                        className="btn-base btn-red min-h-12 px-5 text-base"
                      >
                        <Volume2 className="size-5" aria-hidden />
                        {speakingId === message.id ? s.stopListening : s.listen}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSimplify(message)}
                        className="btn-base btn-outline min-h-12 rounded-full px-5 text-base"
                      >
                        <RotateCcw className="size-5" aria-hidden />
                        {s.simpler}
                      </button>
                      {message.nextLabel ? (
                        <button
                          type="button"
                          onClick={() => onNextStep(message)}
                          className="btn-base btn-red min-h-12 px-5 text-base"
                        >
                          {message.nextLabel}
                          <ArrowRight className="size-5" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ),
            )}

            {pending ? (
              <div className="flex items-center gap-3">
                <Avatar who="sahayi" />
                <p className="label-mono text-muted-foreground" aria-live="polite">
                  {s.thinking}
                </p>
              </div>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-xl border-2 border-primary px-4 py-3 font-body text-base text-paper-foreground"
              >
                {error}
              </p>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>

        {lastAnswer && !pending ? (
          <div className="mt-8">
            <p className="font-display text-sm text-paper-foreground" style={{ fontWeight: 700 }}>
              {s.youCanAlsoAsk}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {s.suggestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onAsk(question)}
                  className="chip"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-7">
          <label htmlFor="sahayi-followup" className="sr-only">
            {s.askAnother}
          </label>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-3 pr-2">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-paper-foreground"
            >
              <Keyboard className="size-5" />
            </span>
            <input
              id="sahayi-followup"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={s.askAnother}
              className="min-w-0 flex-1 bg-transparent py-2.5 font-body text-base text-paper-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={onStartVoice}
              aria-label={s.askAnother}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-paper-foreground transition-colors hover:bg-muted/80"
            >
              <Mic className="size-5" aria-hidden />
            </button>
            <button
              type="submit"
              aria-label={s.send}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:brightness-95"
            >
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </div>
        </form>
      </PaperPanel>
    </div>
  );
}
