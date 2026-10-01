import { ArrowLeft, ArrowRight, ExternalLink, Info } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { Avatar, PaperPanel, PanelHeader, RedBlock } from "./primitives";
import { Portrait } from "./Portrait";
import { ProgressIndicator } from "./ProgressIndicator";

/** Screen 08 — official PMUY portal handoff. SAHAYI guides; the portal applies. */
export function PortalHandoff({
  lang,
  portalUrl,
  onBack,
}: {
  lang: Lang;
  portalUrl: string;
  onBack: () => void;
}) {
  const s = t(lang);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <PaperPanel className="overflow-hidden px-5 pb-8 pt-6 sm:px-9 sm:pb-10 sm:pt-8">
        <PanelHeader
          schemeTag={s.schemeTag}
          right={<ProgressIndicator steps={s.steps} current={2} className="ml-auto" />}
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

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_minmax(0,17rem)]">
          <div className="rise flex items-start gap-3">
            <Avatar who="sahayi" />
            <div className="min-w-0 flex-1">
              <p className="font-body text-lg leading-relaxed text-paper-foreground sm:text-xl">
                {s.handoffTitle}
              </p>
              <p className="mt-3 font-body text-base leading-relaxed text-paper-foreground/80">
                {s.handoffBody}
              </p>

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base btn-red mt-6 w-full px-6 text-lg sm:w-auto"
              >
                <ExternalLink className="size-5" aria-hidden />
                {s.openPortal}
                <ArrowRight className="size-5" aria-hidden />
              </a>

              <p className="mt-5 flex items-start gap-3 rounded-xl bg-muted px-4 py-3 font-body text-sm text-paper-foreground/80">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                {s.newTabNote}
              </p>
            </div>
          </div>

          {/* Editorial browser sheet: the official portal, shown as paper. */}
          <div aria-hidden className="relative hidden h-72 lg:block">
            <RedBlock className="right-2 top-4 h-[72%] w-[86%] rotate-[6deg]" />
            <div className="absolute right-0 top-10 z-10 w-full rotate-[-4deg] overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-paper)]">
              <div className="flex gap-1.5 border-b border-border px-3 py-2">
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
              </div>
              <div className="px-3 py-3">
                <p className="label-mono text-muted-foreground">PRADHAN MANTRI</p>
                <p
                  className="font-display text-base text-paper-foreground"
                  style={{ fontWeight: 900 }}
                >
                  Ujjwala Yojana
                </p>
              </div>
              <div className="relative h-32 overflow-hidden bg-background">
                <Portrait
                  className="absolute -bottom-2 right-0 h-36 w-28"
                  blockClassName="hidden"
                />
                <p
                  className="absolute bottom-3 left-3 font-display text-lg leading-tight text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Clean Fuel
                  <br />
                  Better Health
                </p>
              </div>
            </div>
          </div>
        </div>
      </PaperPanel>

      <p className="label-mono mt-6 text-right leading-[2] text-foreground/60">
        INDIA
        <br />
        CLEAN FUEL
        <br />
        BRIGHT FUTURE
      </p>
    </div>
  );
}
