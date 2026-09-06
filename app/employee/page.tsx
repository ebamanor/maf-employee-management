import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { acceptTask, completeTask } from "@/lib/actions";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { RejectTaskForm } from "@/components/RejectTaskForm";
import { Pagination } from "@/components/ui/Pagination";
import { Clock, ListTodo, CheckCircle2, Globe, Tag } from "lucide-react";

export default async function EmployeeDashboard({
  searchParams,
}: {
  searchParams: Promise<{ completedPage?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") redirect("/login");

  const { completedPage } = await searchParams;
  const completedPageNum = Math.max(
    1,
    parseInt(completedPage || "1", 10) || 1
  );
  const pageSize = 10;

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assignedToId: session.id },
        {
          assignedToId: null,
          status: "PENDING" as any,
          website: { users: { some: { userId: session.id } } },
        },
      ],
    },
    include: { website: true, category: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = tasks.filter((t) => (t.status as string) === "PENDING");
  const inProgress = tasks.filter(
    (t) => (t.status as string) === "IN_PROGRESS"
  );
  const completed = tasks.filter(
    (t) => (t.status as string) === "COMPLETED"
  );

  const completedTotal = completed.length;
  const completedPageCount = Math.max(
    1,
    Math.ceil(completedTotal / pageSize)
  );
  const safeCompletedPage = Math.min(
    completedPageNum,
    completedPageCount
  );
  const paginatedCompleted = completed.slice(
    (safeCompletedPage - 1) * pageSize,
    safeCompletedPage * pageSize
  );

  const completedToday = completed.filter(
    (t) =>
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-4">
        <Avatar
          name={session.name}
          image={session.image || undefined}
          className="h-14 w-14 text-base"
        />
        <div>
          <h1 className="text-3xl font-semibold">Welcome, {session.name}</h1>
          <p className="text-[var(--muted-foreground)]">
            Here are your assigned tasks for today.
          </p>
        </div>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending" value={pending.length} icon={Clock} />
        <StatCard
          title="In Progress"
          value={inProgress.length}
          icon={ListTodo}
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          icon={CheckCircle2}
        />
      </div>

      {pending.length > 0 && (
        <TaskSection title="Pending" tasks={pending} type="pending" />
      )}

      {inProgress.length > 0 && (
        <TaskSection title="In Progress" tasks={inProgress} type="in-progress" />
      )}

      {completed.length > 0 && (
        <TaskSection
          title="Completed"
          tasks={paginatedCompleted}
          total={completed.length}
          type="completed"
        >
          <Pagination
            currentPage={safeCompletedPage}
            totalPages={completedPageCount}
            paramName="completedPage"
            className="mt-4"
          />
        </TaskSection>
      )}

      {tasks.length === 0 && (
        <div className="py-16 text-center">
          <ListTodo className="mx-auto mb-3 h-12 w-12 text-[var(--muted-foreground)]" />
          <p className="text-[var(--muted-foreground)]">
            No tasks available for you right now.
          </p>
        </div>
      )}
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  type,
  total,
  children,
}: {
  title: string;
  tasks: any[];
  type: "pending" | "in-progress" | "completed";
  total?: number;
  children?: ReactNode;
}) {
  return (
    <section className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        {title} ({total ?? tasks.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="pb-3 pl-3">Source Link</th>
              <th className="pb-3">Website</th>
              <th className="pb-3">Category</th>
              <th className="pb-3 hidden md:table-cell">Sub</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">{type === "pending" ? "Action" : "Published URL"}</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr
                key={t.id}
                className="border-t border-[var(--border)] transition hover:bg-[var(--muted)]"
              >
                <td className="max-w-xs truncate py-3 pl-3">
                  <a
                    href={t.sourceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {t.sourceLink}
                  </a>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Globe size={14} /> {t.website?.name || "-"}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Tag size={14} /> {t.category?.name || "-"}
                  </div>
                </td>
                <td
                  className="py-3 hidden max-w-xs truncate md:table-cell"
                  title={t.subCategories || undefined}
                >
                  {t.subCategories || "-"}
                </td>
                <td className="py-3">
                  <Badge variant={t.postType as string}>{t.postType}</Badge>
                </td>
                <td className="py-3">
                  {type === "pending" ? (
                    <form action={acceptTask}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button type="submit" size="sm">
                        Accept
                      </Button>
                    </form>
                  ) : type === "in-progress" ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={completeTask} className="flex gap-2">
                        <input type="hidden" name="id" value={t.id} />
                        <input
                          name="publishedUrl"
                          type="url"
                          required
                          placeholder="https://..."
                          className="w-40 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                        <Button type="submit" size="sm" variant="secondary">
                          Done
                        </Button>
                      </form>
                      <RejectTaskForm taskId={t.id} />
                    </div>
                  ) : (
                    <span className="text-[var(--muted-foreground)]">
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
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {children}
    </section>
  );
}
