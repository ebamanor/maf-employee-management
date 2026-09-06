import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addWebsite,
  addCategory,
  updateWebsite,
  deleteWebsite,
  updateCategory,
  deleteCategory,
} from "@/lib/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { Globe, Plus, Pencil, Trash2, Tag, Search } from "lucide-react";

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams: Promise<{ websiteId?: string; q?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { websiteId, q = "" } = await searchParams;

  const selectedWebsite = websiteId
    ? await prisma.website.findUnique({ where: { id: websiteId } })
    : null;

  const [websites, categories] = await Promise.all([
    prisma.website.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({
      where: {
        ...(websiteId ? { websiteId } : {}),
        ...(q ? { name: { contains: q } } : {}),
      },
      include: { website: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Websites & Categories</h1>
          <p className="text-[var(--muted-foreground)]">
            Click a website to view and manage its categories.
          </p>
        </div>
        <div className="flex gap-3">
          <Modal
            trigger={
              <Button variant="secondary">
                <Plus size={18} /> Category
              </Button>
            }
            title="Add Category"
          >
            <AddCategoryForm
              websites={websites}
              defaultWebsiteId={websiteId}
            />
          </Modal>
          <Modal
            trigger={
              <Button>
                <Plus size={18} /> Website
              </Button>
            }
            title="Add Website"
          >
            <AddWebsiteForm />
          </Modal>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Globe size={20} /> Websites
          </h2>
          {websites.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">No websites yet.</p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
              {websites.map((w) => {
                const active = w.id === websiteId;
                return (
                  <div
                  key={w.id}
                  className={cn(
                    "flex items-start justify-between rounded-2xl border p-4 transition",
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  )}
                >
                  <Link
                    href={`/admin/websites?websiteId=${w.id}`}
                    className="min-w-0 flex-1 rounded-xl transition hover:opacity-80"
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <span className="truncate">{w.name}</span>
                      <Badge
                        variant={w.type as string}
                        className={cn(
                          active
                            ? "border-[var(--primary-foreground)] text-[var(--primary-foreground)]"
                            : ""
                        )}
                      >
                        {w.type}
                      </Badge>
                    </div>
                    {w.url ? (
                      <span
                        className={cn(
                          "mt-1 block truncate text-sm",
                          active
                            ? "text-[var(--primary-foreground)]/80"
                            : "text-blue-600"
                        )}
                      >
                        {w.url}
                      </span>
                    ) : null}
                  </Link>
                  <div className="ml-2 flex items-center gap-2">
                    <Modal
                      trigger={
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          size="sm"
                        >
                          <Pencil size={14} />
                        </Button>
                      }
                      title="Edit Website"
                    >
                      <EditWebsiteForm website={w} />
                    </Modal>
                    <form action={deleteWebsite}>
                      <input type="hidden" name="id" value={w.id} />
                      <Button type="submit" variant="danger" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </form>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Tag size={20} />{" "}
              {selectedWebsite
                ? `Categories for ${selectedWebsite.name}`
                : "Categories"}
            </h2>
            {selectedWebsite ? (
              <form className="flex items-center gap-2">
                <input type="hidden" name="websiteId" value={websiteId} />
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  />
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="Search categories..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary">
                  <Search size={16} />
                </Button>
              </form>
            ) : null}
          </div>

          {!selectedWebsite ? (
            <p className="py-12 text-center text-[var(--muted-foreground)]">
              Select a website on the left to see its categories.
            </p>
          ) : categories.length === 0 ? (
            <p className="py-12 text-center text-[var(--muted-foreground)]">
              No categories found.
            </p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 transition hover:bg-[var(--muted)]"
                >
                  <span className="font-medium">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <Modal
                      trigger={
                        <Button variant="secondary" size="sm">
                          <Pencil size={14} />
                        </Button>
                      }
                      title="Edit Category"
                    >
                      <EditCategoryForm category={c} websites={websites} />
                    </Modal>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button type="submit" variant="danger" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AddWebsiteForm() {
  return (
    <form action={addWebsite} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Website Name</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">URL</label>
        <input
          name="url"
          type="url"
          placeholder="https://..."
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Type</label>
        <select
          name="type"
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="NEWS">News</option>
          <option value="PRODUCT">Product</option>
          <option value="GENERAL">General</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        Add Website
      </Button>
    </form>
  );
}

function EditWebsiteForm({ website }: { website: any }) {
  return (
    <form action={updateWebsite} className="space-y-4">
      <input type="hidden" name="id" value={website.id} />
      <div>
        <label className="block text-sm font-medium">Website Name</label>
        <input
          name="name"
          defaultValue={website.name}
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">URL</label>
        <input
          name="url"
          type="url"
          defaultValue={website.url || ""}
          placeholder="https://..."
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Type</label>
        <select
          name="type"
          defaultValue={website.type}
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="NEWS">News</option>
          <option value="PRODUCT">Product</option>
          <option value="GENERAL">General</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
}

function AddCategoryForm({
  websites,
  defaultWebsiteId,
}: {
  websites: { id: string; name: string }[];
  defaultWebsiteId?: string;
}) {
  return (
    <form action={addCategory} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Category Name</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Website</label>
        <select
          name="websiteId"
          required
          defaultValue={defaultWebsiteId || ""}
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">Select a website</option>
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full">
        Add Category
      </Button>
    </form>
  );
}

function EditCategoryForm({
  category,
  websites,
}: {
  category: any;
  websites: { id: string; name: string }[];
}) {
  return (
    <form action={updateCategory} className="space-y-4">
      <input type="hidden" name="id" value={category.id} />
      <div>
        <label className="block text-sm font-medium">Category Name</label>
        <input
          name="name"
          defaultValue={category.name}
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Website</label>
        <select
          name="websiteId"
          required
          defaultValue={category.websiteId}
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">Select a website</option>
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
}
