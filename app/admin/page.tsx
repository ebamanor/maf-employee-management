import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmployeeWorkChart } from "@/components/EmployeeWorkChart";
import { cn } from "@/lib/utils";
import {
  Users,
  Globe,
  ListTodo,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const [employees, websites, tasks, today] = await Promise.all([
    prisma.user.count({ where: { role: "EMPLOYEE" as any } }),
    prisma.website.count(),
    prisma.task.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.task.count({
      where: {
        status: "COMPLETED" as any,
        completedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const t of tasks) {
    byStatus[t.status as string] = (t._count?.status as number) ?? 0;
  }
  const pending = byStatus["PENDING"] || 0;
  const inProgress = byStatus["IN_PROGRESS"] || 0;
  const completed = byStatus["COMPLETED"] || 0;
  const total = pending + inProgress + completed;

  const recentTasks = await prisma.task.findMany({
    take: 6,
    include: { assignedTo: true, website: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Welcome back, {session.name}. Here is what is happening today.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Employees"
          value={employees}
          icon={Users}
          href="/admin/employees"
        />
        <StatCard
          title="Websites"
          value={websites}
          icon={Globe}
          href="/admin/websites"
        />
        <StatCard
          title="Pending Tasks"
          value={pending}
          icon={Clock}
          href="/admin/tasks"
        />
        <StatCard
          title="Completed Today"
          value={today}
          icon={CheckCircle2}
          href="/admin/reports"
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Task Flow</h2>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            {total} total tasks · {progress}% completed
          </p>
          <div className="space-y-2">
            <ProgressItem
              label="Pending"
              value={pending}
              total={total}
              color="bg-zinc-200"
            />
            <ProgressItem
              label="In Progress"
              value={inProgress}
              total={total}
              color="bg-blue-300"
            />
            <ProgressItem
              label="Completed"
              value={completed}
              total={total}
              color="bg-[var(--primary)]"
            />
          </div>
        </div>

        <EmployeeWorkChart />

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
          <div className="space-y-2">
            <QuickLink href="/admin/employees" label="Manage People" />
            <QuickLink href="/admin/tasks" label="Bulk Upload Tasks" />
            <QuickLink href="/admin/reports" label="View Reports" />
            <QuickLink href="/admin/websites" label="Add Websites" />
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No tasks yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="pb-3 pl-3">Employee</th>
                  <th className="pb-3">Website</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-[var(--border)] transition hover:bg-[var(--muted)]"
                  >
                    <td className="py-3 pl-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={t.assignedTo?.name || "Unassigned"}
                          image={t.assignedTo?.image || undefined}
                        />
                        <span className="font-medium">
                          {t.assignedTo?.name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">{t.website?.name || "-"}</td>
                    <td className="py-3">{t.postType}</td>
                    <td className="py-3">
                      <Badge variant={t.status as string}>{t.status}</Badge>
                    </td>
                    <td className="py-3 text-[var(--muted-foreground)]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ProgressItem({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : (value / total) * 100;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-[var(--muted-foreground)]">
          {value} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-2xl p-3 text-sm font-medium transition hover:bg-[var(--muted)]"
    >
      {label}
      <span>→</span>
    </a>
  );
}
