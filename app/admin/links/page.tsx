import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter } from "lucide-react";

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; employeeId?: string; q?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { status = "ALL", employeeId = "ALL", q = "" } = await searchParams;

  const where: any = {};
  if (status !== "ALL") where.status = status;
  if (employeeId !== "ALL") where.assignedToId = employeeId;
  if (q)
    where.OR = [
      { sourceLink: { contains: q } },
      { publishedUrl: { contains: q } },
    ];

  const [tasks, employees] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        website: true,
        category: true,
        assignedTo: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" as any },
      orderBy: { name: "asc" },
    }),
  ]);

  const [total, statusGroups] = await Promise.all([
    prisma.task.count(),
    prisma.task.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const counts = {
    ALL: total,
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    REJECTED: 0,
  };

  for (const g of statusGroups) {
    counts[g.status as keyof typeof counts] = (g as any)._count.id;
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Links</h1>
        <p className="text-[var(--muted-foreground)]">
          Track every task link by status and employee.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="All" value={counts.ALL} href="/admin/links" active={status === "ALL"} />
        <StatCard label="Pending" value={counts.PENDING} href="/admin/links?status=PENDING" active={status === "PENDING"} />
        <StatCard label="In Progress" value={counts.IN_PROGRESS} href="/admin/links?status=IN_PROGRESS" active={status === "IN_PROGRESS"} />
        <StatCard label="Completed" value={counts.COMPLETED} href="/admin/links?status=COMPLETED" active={status === "COMPLETED"} />
        <StatCard label="Rejected" value={counts.REJECTED} href="/admin/links?status=REJECTED" active={status === "REJECTED"} />
      </div>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <form className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search source or published links..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            name="employeeId"
            defaultValue={employeeId}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="ALL">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)]"
          >
            <Filter size={16} />
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--muted-foreground)]">
              <tr>
                <th className="pb-3 pl-3">Source Link</th>
                <th className="pb-3">Employee</th>
                <th className="pb-3">Website</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Sub</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[var(--muted-foreground)]"
                  >
                    No links found.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-[var(--border)] transition hover:bg-[var(--muted)]"
                  >
                    <td className="max-w-xs truncate py-3 pl-3">
                      {t.sourceLink ? (
                        <a
                          href={t.sourceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                          title={t.sourceLink}
                        >
                          {t.sourceLink}
                        </a>
                      ) : (
                        <span
                          className="font-medium text-[var(--foreground)]"
                          title={t.title || undefined}
                        >
                          {t.title || "-"}
                        </span>
                      )}
                    </td>
                    <td className="py-3">{t.assignedTo?.name || "-"}</td>
                    <td className="py-3">{t.website?.name || "-"}</td>
                    <td className="py-3">{t.category?.name || "-"}</td>
                    <td
                      className="max-w-xs truncate py-3"
                      title={t.subCategories || undefined}
                    >
                      {t.subCategories || "-"}
                    </td>
                    <td className="py-3">
                      <Badge variant={t.status as string}>{t.status}</Badge>
                    </td>
                    <td className="py-3">
                      {(t.status as string) === "REJECTED"
                        ? t.rejectionReason || "-"
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  active,
}: {
  label: string;
  value: number;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "rounded-3xl border p-5 text-center shadow-sm transition " +
        (active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]")
      }
    >
      <p className="text-sm opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Link>
  );
}
