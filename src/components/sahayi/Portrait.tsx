import portrait from "@/assets/woman-portrait.png";
import { cn } from "@/lib/utils";
import { RedBlock } from "./primitives";

/**
 * Documentary monochrome portrait cutout with its red geometric block.
 * Decorative identity element — kept out of the accessibility tree.
 */
export function Portrait({
  className,
  blockClassName,
  imgClassName,
  priority = false,
}: {
  className?: string;
  blockClassName?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative select-none", className)}>
      <RedBlock className={cn("bottom-6 left-0 h-[70%] w-[72%] rotate-[8deg]", blockClassName)} />
      <img
        src={portrait}
        alt=""
        width={912}
        height={1200}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "relative z-10 h-full w-full object-contain object-bottom grayscale contrast-125",
          imgClassName,
        )}
      />
    </div>
  );
}
