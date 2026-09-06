import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TasksTable } from "@/components/TasksTable";
import { TaskTabs } from "@/components/TaskTabs";

export default async function TasksPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const [tasks, employees, websites, categories] = await Promise.all([
    prisma.task.findMany({
      include: { assignedTo: true, website: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" as any },
      orderBy: { name: "asc" },
    }),
    prisma.website.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({
      include: { website: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const counts = {
    pending: tasks.filter((t) => (t.status as string) === "PENDING").length,
    inProgress: tasks.filter(
      (t) => (t.status as string) === "IN_PROGRESS"
    ).length,
    completed: tasks.filter(
      (t) => (t.status as string) === "COMPLETED"
    ).length,
  };

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    websiteId: c.websiteId,
  }));

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Tasks</h1>
          <p className="text-[var(--muted-foreground)]">
            Bulk upload, assign and monitor posts.
          </p>
        </div>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted-foreground)]">Pending</p>
          <p className="mt-1 text-3xl font-bold">{counts.pending}</p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted-foreground)]">In Progress</p>
          <p className="mt-1 text-3xl font-bold">{counts.inProgress}</p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm text-[var(--muted-foreground)]">Completed</p>
          <p className="mt-1 text-3xl font-bold">{counts.completed}</p>
        </div>
      </div>

      <TaskTabs
        websites={websites}
        categories={categoryOptions}
        employees={employees}
      />

      <div className="mt-8">
        <TasksTable tasks={tasks} employees={employees} websites={websites} />
      </div>
    </div>
  );
}
