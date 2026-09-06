"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BulkAddForm } from "@/components/BulkAddForm";
import { NoteTaskForm } from "@/components/NoteTaskForm";
import { Link, FileText } from "lucide-react";

export function TaskTabs({
  websites,
  categories,
  employees,
}: {
  websites: any[];
  categories: any[];
  employees: any[];
}) {
  const [tab, setTab] = useState<"links" | "notes">("links");

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-6 flex gap-2 border-b border-[var(--border)] pb-2">
        <button
          type="button"
          onClick={() => setTab("links")}
          className={cn(
            "flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition",
            tab === "links"
              ? "bg-[var(--background)] text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <Link size={16} /> Links
        </button>
        <button
          type="button"
          onClick={() => setTab("notes")}
          className={cn(
            "flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition",
            tab === "notes"
              ? "bg-[var(--background)] text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <FileText size={16} /> Notes
        </button>
      </div>

      {tab === "links" ? (
        <BulkAddForm
          websites={websites}
          categories={categories}
          employees={employees}
        />
      ) : (
        <NoteTaskForm
          websites={websites}
          categories={categories}
          employees={employees}
        />
      )}
    </section>
  );
}
