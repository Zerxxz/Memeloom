"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

type ToastContext = {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const Ctx = React.createContext<ToastContext | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((cur) => [...cur, { id, duration: 4000, ...t }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((x) => x.id !== id));
    }, t.duration ?? 4000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((cur) => cur.filter((x) => x.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ toasts, toast, dismiss }}>{children}</Ctx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function Toaster() {
  const ctx = React.useContext(Ctx);
  if (!ctx) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {ctx.toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto glass-strong rounded-lg p-4 min-w-[280px] max-w-md shadow-2xl animate-fade-up border",
            t.variant === "destructive" && "border-destructive/50",
            t.variant === "success" && "border-primary/50",
            !t.variant && "border-white/10"
          )}
        >
          {t.title && (
            <div
              className={cn(
                "font-semibold text-sm",
                t.variant === "destructive" && "text-destructive",
                t.variant === "success" && "text-primary"
              )}
            >
              {t.title}
            </div>
          )}
          {t.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {t.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
