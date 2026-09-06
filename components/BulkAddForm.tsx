"use client";

import { useState } from "react";
import { createBulkTasks } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { ListTodo, Plus } from "lucide-react";

function extractUrls(text: string): string[] {
  const matches =
    text.match(
      /https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/g
    ) || [];
  return matches
    .map((url) => url.replace(/[.,;!?\)\]"]+$/, ""))
    .filter(Boolean);
}

export function BulkAddForm({
  websites,
  categories,
  employees,
}: {
  websites: { id: string; name: string }[];
  categories: { id: string; name: string; websiteId: string }[];
  employees: { id: string; name: string }[];
}) {
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [links, setLinks] = useState("");
  const filtered = categories.filter((c) => c.websiteId === selectedWebsite);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text/plain");
    const urls = extractUrls(text);
    if (urls.length > 0) {
      e.preventDefault();
      setLinks((prev) => {
        const existing = prev
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        const combined = [...existing, ...urls];
        return combined.join("\n");
      });
    }
  };

  return (
    <section className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <ListTodo size={20} /> Bulk Add Links
      </h2>
      <form action={createBulkTasks} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">
            Links (one per line)
          </label>
          <textarea
            name="links"
            rows={5}
            required
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            onPaste={handlePaste}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="https://example.com/article-1&#10;https://example.com/article-2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium">Website</label>
            <select
              name="websiteId"
              required
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">Select</option>
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
              disabled={!selectedWebsite}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
            >
              <option value="">
                {selectedWebsite ? "None" : "Select a website first"}
              </option>
              {filtered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Post Type</label>
            <select
              name="postType"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="POST">Post / Article</option>
              <option value="PRODUCT">Product Listing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Assign To</label>
            <select
              name="assignTo"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="auto">Auto-distribute</option>
              <option value="">Leave unassigned</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="useAi"
            value="on"
            className="h-5 w-5 accent-[var(--primary)]"
          />
          <label className="text-sm font-medium">
            Use OpenRouter AI to suggest sub categories (requires API key in
            Settings)
          </label>
        </div>
        <Button type="submit">
          <Plus size={18} /> Distribute Links
        </Button>
      </form>
    </section>
  );
}
