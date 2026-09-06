"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastDetail } from "@/lib/toast";

type Toast = ToastDetail & { id: number };

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...detail, id }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  const remove = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 p-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg transition",
            t.type === "success" &&
              "border-green-200 bg-green-50 text-green-800",
            t.type === "error" && "border-red-200 bg-red-50 text-red-800",
            t.type === "info" &&
              "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
          )}
        >
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="rounded-full p-1 transition hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
