import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "small" | "default" | "large";
  className?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  small: "h-4 w-4 border-2",
  default: "h-5 w-5 border-2",
  large: "h-8 w-8 border-3",
};

export function Spinner({ size = "default", className }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-primary-border border-t-accent",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    />
  );
}
