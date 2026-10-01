import { ArrowRight } from "lucide-react";
import { strings, type Lang } from "@/lib/i18n";
import { PaperPanel, RedBlock } from "./primitives";

/**
 * Screen 01 — language selection. First thing the user ever sees.
 * Composition: huge wordmark on the black ground, a red paper block behind a
 * slightly rotated white sheet carrying the two large choices.
 */
export function LanguageSelection({ onSelect }: { onSelect: (lang: Lang) => void }) {
  return (
    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1fr] lg:gap-6 lg:py-20">
      <div className="relative z-10">
        <h1
          className="font-display text-[clamp(3.75rem,13vw,8.5rem)] leading-[0.86] tracking-[-0.045em] text-foreground"
          style={{ fontWeight: 900 }}
        >
          SAHAYI
        </h1>
        <p className="label-mono mt-5 leading-[2] text-foreground/75">
          PM UJJWALA
          <br />
          AI SERVICE GUIDE
        </p>
      </div>

      <div className="relative">
        <RedBlock className="-top-6 left-2 h-[88%] w-[78%] rotate-[-6deg] sm:-top-10 sm:left-6" />

        <PaperPanel className="rotate-[-1.5deg] px-6 py-9 sm:px-10 sm:py-12">
          <h2 className="font-display text-[clamp(1.75rem,6vw,2.75rem)] text-paper-foreground">
            {strings.en.chooseLanguage}
          </h2>
          <p className="mt-1 font-display text-[clamp(1.5rem,5vw,2.25rem)] text-paper-foreground">
            {strings.hi.chooseLanguage}
          </p>
          <p className="mt-3 font-body text-lg text-paper-foreground/70">
            {strings.en.chooseLanguageSub}
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => onSelect("en")}
              className="btn-base btn-red w-full justify-between px-6 py-5 text-2xl sm:text-3xl"
            >
              English
              <ArrowRight className="size-7" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onSelect("hi")}
              className="btn-base btn-outline w-full justify-between px-6 py-5 text-2xl sm:text-3xl"
            >
              हिन्दी
              <ArrowRight className="size-7" aria-hidden />
            </button>
          </div>
        </PaperPanel>
      </div>
    </div>
  );
}
