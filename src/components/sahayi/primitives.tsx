import { Bot, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** SAHAYI wordmark — Helvetica Now, black weight, tight tracking. */
export function Wordmark({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "font-display text-2xl leading-none tracking-[-0.03em]",
        tone === "dark" ? "text-paper-foreground" : "text-foreground",
        className,
      )}
      style={{ fontWeight: 900 }}
    >
      SAHAYI
    </span>
  );
}

/** White editorial sheet on the black ground. */
export function PaperPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("paper relative z-10 w-full", className)}>{children}</section>;
}

/** Minimal header: wordmark left, scheme label right. Optional slot below. */
export function PanelHeader({
  schemeTag,
  tone = "dark",
  right,
}: {
  schemeTag: string;
  tone?: "dark" | "light";
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <Wordmark tone={tone} />
        <span
          className={cn(
            "label-mono",
            tone === "dark" ? "text-paper-foreground/70" : "text-foreground/70",
          )}
        >
          {schemeTag}
        </span>
      </div>
      {right}
    </header>
  );
}

export function Avatar({ who }: { who: "user" | "sahayi" }) {
  if (who === "sahayi") {
    return (
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Bot className="size-6" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-paper-foreground"
    >
      <User className="size-5" />
    </span>
  );
}

/** Red geometric paper block used behind sheets and portraits. */
export function RedBlock({ className }: { className?: string }) {
  return <span aria-hidden className={cn("red-block", className)} />;
}
