"use client";

import { useState } from "react";
import { createManualWork } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Upload, Link2, FileText, Tag, Globe, PenLine } from "lucide-react";

export function ManualWorkForm({
  websites,
}: {
  websites: {
    id: string;
    name: string;
    categories: { id: string; name: string }[];
  }[];
}) {
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const selected = websites.find((w) => w.id === selectedWebsite);
  const categories = selected?.categories || [];

  return (
    <form action={createManualWork} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Globe size={16} /> Website
          </label>
          <select
            name="websiteId"
            required
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">Select a website</option>
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Tag size={16} /> Category
          </label>
          <select
            name="categoryId"
            disabled={!selectedWebsite}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
          >
            <option value="">
              {selectedWebsite ? "Select a category" : "Select a website first"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-medium">
            <FileText size={16} /> Post Type
          </label>
          <select
            name="postType"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="POST">Post / Article</option>
            <option value="PRODUCT">Product Listing</option>
          </select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Link2 size={16} /> Source Link
          </label>
          <input
            name="sourceLink"
            type="url"
            placeholder="Where the content came from (optional)"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-medium">
          <Link2 size={16} /> Published URL *required
        </label>
        <input
          name="publishedUrl"
          type="url"
          required
          placeholder="https://..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-medium">
          <PenLine size={16} /> Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Any extra details..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <Button type="submit" className="w-full">
        <Upload size={18} /> Submit Work
      </Button>
    </form>
  );
}
