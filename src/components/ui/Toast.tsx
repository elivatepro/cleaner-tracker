"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, XCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastClasses: Record<ToastType, string> = {
  success: "border-l-4 border-accent",
  error: "border-l-4 border-danger",
  warning: "border-l-4 border-warning",
  info: "border-l-4 border-secondary-dim",
};

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const iconColorMap = {
  success: "text-accent",
  error: "text-danger",
  warning: "text-warning",
  info: "text-secondary-dim",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-3 sm:left-auto sm:right-4 sm:w-[320px]">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <div
              key={toast.id}
              className={cn(
                "relative flex items-start gap-3 rounded-xl bg-black p-4 shadow-2xl border border-primary-border",
                toastClasses[toast.type]
              )}
              role="status"
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColorMap[toast.type])} />
              <div className="flex-1 flex flex-col gap-1">
                {toast.title && <h4 className="text-sm font-medium text-white">{toast.title}</h4>}
                <p className="text-sm text-white leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-secondary-muted hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
