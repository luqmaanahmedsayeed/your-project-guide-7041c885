import { ArrowLeft, ArrowRight } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { Avatar, PaperPanel, PanelHeader } from "./primitives";
import { Portrait } from "./Portrait";
import { ProgressIndicator } from "./ProgressIndicator";

/**
 * Screen 07 — guided "Help me apply" flow. One simple question at a time,
 * never a chat. Eligibility first, then documents, then the handoff.
 */
export function GuidedApply({
  lang,
  step,
  question,
  intro,
  bullets,
  note,
  primaryLabel,
  onYes,
  onNo,
  onPrimary,
  onBack,
}: {
  lang: Lang;
  step: number;
  /** the single question or statement shown in the sheet */
  question: string;
  intro?: string;
  bullets?: string[];
  note?: string;
  /** when set, a single forward action replaces Yes/No */
  primaryLabel?: string;
  onYes?: () => void;
  onNo?: () => void;
  onPrimary?: () => void;
  onBack: () => void;
}) {
  const s = t(lang);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <PaperPanel className="overflow-hidden px-5 pb-8 pt-6 sm:px-9 sm:pb-10 sm:pt-8">
        <PanelHeader
          schemeTag={s.schemeTag}
          right={<ProgressIndicator steps={s.steps} current={step} className="ml-auto" />}
        />

        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 font-display text-sm text-paper-foreground transition-colors hover:text-primary"
          style={{ fontWeight: 700 }}
        >
          <ArrowLeft className="size-5" aria-hidden />
          {s.back}
        </button>

        <div className="relative mt-6 grid gap-8 lg:grid-cols-[1fr_minmax(0,14rem)]">
          <div className="rise flex items-start gap-3">
            <Avatar who="sahayi" />
            <div className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
              {intro ? (
                <p className="font-body text-base leading-relaxed text-paper-foreground sm:text-lg">
                  {intro}
                </p>
              ) : null}
              <p className="mt-1 font-body text-lg leading-relaxed text-paper-foreground sm:text-xl">
                {question}
              </p>

              {bullets?.length ? (
                <ul className="mt-3 space-y-1.5 font-body text-base text-paper-foreground sm:text-lg">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span aria-hidden className="text-primary">
                        •
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}

              {note ? (
                <p className="mt-3 font-body text-base text-paper-foreground/75">{note}</p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {primaryLabel ? (
                  <button
                    type="button"
                    onClick={onPrimary}
                    className="btn-base btn-red w-full px-6 text-lg sm:w-auto"
                  >
                    {primaryLabel}
                    <ArrowRight className="size-5" aria-hidden />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onYes}
                      className="btn-base btn-red w-full px-10 text-xl sm:w-44"
                    >
                      {s.yes}
                    </button>
                    <button
                      type="button"
                      onClick={onNo}
                      className="btn-base btn-outline w-full px-10 text-xl sm:w-44"
                    >
                      {s.no}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <p
              className="absolute right-4 top-2 max-w-[9rem] text-right font-display text-sm leading-snug text-primary"
              style={{ fontWeight: 700 }}
            >
              {s.smallSteps}
            </p>
            <Portrait
              className="absolute -right-12 bottom-0 h-64 w-48"
              blockClassName="bottom-4 left-0 h-[62%] w-[82%]"
            />
          </div>
        </div>
      </PaperPanel>
    </div>
  );
}
