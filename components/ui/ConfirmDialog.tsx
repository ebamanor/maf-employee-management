"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "secondary" | "ghost" | "danger";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    setOpen(false);
    try {
      await onConfirm();
    } finally {
      setIsPending(false);
    }
  };

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
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-zinc-500 transition hover:bg-[var(--muted)]"
              >
                <X size={18} />
              </button>
            </div>

            {description ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                {description}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={confirmVariant}
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? "..." : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
