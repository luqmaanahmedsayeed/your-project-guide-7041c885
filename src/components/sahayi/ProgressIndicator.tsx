import { cn } from "@/lib/utils";

export function ProgressIndicator({
  steps,
  current,
  className,
}: {
  steps: readonly string[];
  /** 0-based index of the active stage */
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-start gap-0", className)} aria-label={steps.join(" / ")}>
      {steps.map((step, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li key={step} className="flex items-start">
            <div className="flex w-20 flex-col items-center gap-2 sm:w-24">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full font-mono text-xs font-medium",
                  active || done
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-center font-display text-[0.8125rem] leading-tight",
                  active ? "text-paper-foreground" : "text-muted-foreground",
                )}
                style={{ fontWeight: 700 }}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span aria-hidden className="mt-3.5 h-px w-6 bg-border sm:w-10" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
