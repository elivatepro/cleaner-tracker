import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5" suppressHydrationWarning>
        {label ? (
          <label
            className="text-sm font-medium text-secondary-muted"
            htmlFor={inputId}
          >
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-12 w-full rounded-lg border border-primary-border bg-surface-raised px-3.5 text-base text-white placeholder:text-secondary-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40 transition-colors duration-150",
            hasError && "border-danger focus:border-danger focus:ring-danger/30",
            className
          )}
          aria-invalid={hasError}
          {...props}
        />
        {error ? <p className="text-xs text-danger mt-1">{error}</p> : null}
        {!error && helperText ? (
          <p className="text-xs text-secondary-dim mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
