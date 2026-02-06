import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "active" | "warning" | "danger";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border border-primary-border",
  active: "border-2 border-accent",
  warning: "border-2 border-warning",
  danger: "border-2 border-danger",
};

export function Card({
  variant = "default",
  className,
  onClick,
  ...props
}: CardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      className={cn(
        "rounded-xl bg-primary-light p-5 transition duration-200",
        variantClasses[variant],
        isClickable && "cursor-pointer hover:bg-surface-raised hover:border-[#444444]",
        className
      )}
      onClick={onClick}
      {...props}
    />
  );
}
