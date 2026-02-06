import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";
type ButtonSize = "small" | "default" | "large";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white border border-accent hover:brightness-110",
  secondary:
    "bg-surface-raised text-white border border-primary-border hover:bg-primary-lighter",
  outline:
    "bg-transparent text-secondary-muted border border-primary-border hover:bg-primary-light hover:text-white",
  danger: "bg-danger text-white border border-danger hover:brightness-110",
  ghost: "bg-transparent text-secondary-muted border border-transparent hover:bg-primary-light hover:text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "h-9 px-3 text-sm",
  default: "h-11 px-5 text-base",
  large: "h-13 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "default",
  isLoading = false,
  disabled,
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex min-w-[48px] items-center justify-center gap-2 rounded-lg font-medium transition duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="small" /> : children}
    </button>
  );
}
