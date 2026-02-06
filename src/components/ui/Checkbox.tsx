"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="flex min-h-[48px] items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        className={cn(
          "peer h-6 w-6 shrink-0 appearance-none rounded-md border-2 border-primary-border bg-surface-raised checked:bg-accent checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
          "checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%2220%206%209%2017%204%2012%22%2F%3E%3C%2Fsvg%3E')] bg-center bg-no-repeat [background-size:16px]",
          className
        )}
        {...props}
      />
      {label ? (
        <span className="text-base text-secondary-muted group-hover:text-white transition-colors">
          {label}
        </span>
      ) : null}
    </label>
  );
}
