import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { AdminReportPDF } from "@/components/AdminReportPDF";
import { BarChart3, Calendar, Users, Globe, CheckCircle2 } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { start: startParam, end: endParam } = await searchParams;
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const end = endParam ? new Date(endParam) : new Date();
  const start = startParam
    ? new Date(startParam)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const queryEnd = new Date(end);
  queryEnd.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      status: "COMPLETED" as any,
      completedAt: { gte: start, lte: queryEnd },
    },
    include: { completedBy: true, website: true, category: true },
    orderBy: { completedAt: "desc" },
  });

  const byEmployee: Record<string, number> = {};
  const byWebsite: Record<string, number> = {};

  for (const t of tasks) {
    byEmployee[t.completedBy?.name || "Unknown"] =
      (byEmployee[t.completedBy?.name || "Unknown"] || 0) + 1;
    byWebsite[t.website?.name || "Unknown"] =
      (byWebsite[t.website?.name || "Unknown"] || 0) + 1;
  }

  const topEmployee = Object.entries(byEmployee).sort((a, b) => b[1] - a[1])[0];
  const topWebsite = Object.entries(byWebsite).sort((a, b) => b[1] - a[1])[0];

  const formatDateInput = (d: Date) => d.toISOString().split("T")[0];
  const startStr = formatDateInput(start);
  const endStr = formatDateInput(end);

  const pdfTasks = tasks.map((t) => ({
    employee: t.completedBy?.name || "-",
    completed: t.completedAt
      ? new Date(t.completedAt).toLocaleDateString()
      : "-",
    website: t.website?.name || "-",
    category: t.category?.name || "-",
    publishedUrl: t.publishedUrl || "-",
  }));

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Reports</h1>
          <p className="text-[var(--muted-foreground)]">
            Track completed posts and team output.
          </p>
        </div>
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium">Start</label>
            <input
              type="date"
              name="start"
              defaultValue={startStr}
              className="mt-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End</label>
            <input
              type="date"
              name="end"
              defaultValue={endStr}
              className="mt-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <Button type="submit" variant="secondary">
            <Calendar size={18} /> Filter
          </Button>
          <AdminReportPDF
            start={startStr}
            end={endStr}
            completed={tasks.length}
            byEmployee={byEmployee}
            byWebsite={byWebsite}
            tasks={pdfTasks}
          />
        </form>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Completed" value={tasks.length} icon={CheckCircle2} />
        <StatCard
          title="Top Employee"
          value={topEmployee?.[1] ?? 0}
          icon={Users}
        />
        <StatCard
          title="Top Website"
          value={topWebsite?.[1] ?? 0}
          icon={Globe}
        />
      </div>
      {topEmployee ? (
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Leading employee: {topEmployee[0]} · Leading website: {topWebsite?.[0] ?? "-"}
        </p>
      ) : null}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Users size={20} /> By Employee
          </h2>
          <Leaderboard data={byEmployee} />
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Globe size={20} /> By Website
          </h2>
          <Leaderboard data={byWebsite} />
        </section>
      </div>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <BarChart3 size={20} /> Completed Articles
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--muted-foreground)]">
              <tr>
                <th className="pb-3 pl-3">Employee</th>
                <th className="pb-3">Completed</th>
                <th className="pb-3">Website</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Published URL</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-[var(--border)] transition hover:bg-[var(--muted)]"
                >
                  <td className="py-3 pl-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={t.completedBy?.name || "-"}
                        image={t.completedBy?.image || undefined}
                      />
                      <span className="font-medium">
                        {t.completedBy?.name || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-[var(--muted-foreground)]">
                    {t.completedAt
                      ? new Date(t.completedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3">{t.website?.name || "-"}</td>
                  <td className="py-3">{t.category?.name || "-"}</td>
                  <td className="max-w-xs truncate py-3">
                    {t.publishedUrl ? (
                      <a
                        href={t.publishedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {t.publishedUrl}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Leaderboard({ data }: { data: Record<string, number> }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...Object.values(data), 1);

  return (
    <div className="space-y-3">
      {sorted.map(([name, count]) => (
        <div key={name}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{name}</span>
            <span className="text-[var(--muted-foreground)]">{count}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="text-[var(--muted-foreground)]">No data for this range.</p>
      )}
    </div>
  );
}
