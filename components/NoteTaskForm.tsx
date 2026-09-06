"use client";

import { useState } from "react";
import { createNoteTask } from "@/lib/actions";
import { Button } from "@/components/ui/Button";

export function NoteTaskForm({
  websites,
  categories,
  employees,
}: {
  websites: any[];
  categories: any[];
  employees: any[];
}) {
  const [websiteId, setWebsiteId] = useState("");

  const filteredCategories = websiteId
    ? categories.filter((c) => c.websiteId === websiteId)
    : categories;

  return (
    <form action={createNoteTask} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          placeholder="e.g. Write social media captions for the week"
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Notes / Description</label>
        <textarea
          name="notes"
          rows={4}
          placeholder="Any extra details..."
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Website</label>
          <select
            name="websiteId"
            value={websiteId}
            onChange={(e) => setWebsiteId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">None</option>
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="categoryId"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">None</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Assign To</label>
          <select
            name="assignTo"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">Unassigned</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Note Task
      </Button>
    </form>
  );
}
