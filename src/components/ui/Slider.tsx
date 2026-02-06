import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { defaultTheme } from "@/lib/theme";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  valueDisplay?: string;
}

export function Slider({ className, label, valueDisplay, ...props }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {label ? (
          <label className="text-sm font-medium text-secondary-muted">{label}</label>
        ) : null}
        {valueDisplay ? (
          <span className="text-sm font-medium text-white">{valueDisplay}</span>
        ) : null}
      </div>
      <input
        type="range"
        className={cn(
          "app-slider w-full h-2 bg-primary-lighter rounded-lg appearance-none cursor-pointer accent-accent",
          className
        )}
        style={{ accentColor: defaultTheme.colors.accent.DEFAULT }}
        {...props}
      />
    </div>
  );
}
