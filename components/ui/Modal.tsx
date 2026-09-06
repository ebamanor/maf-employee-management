"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  trigger,
  title,
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)} className="inline-flex">
        {trigger}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-zinc-500 transition hover:bg-[var(--muted)]"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
