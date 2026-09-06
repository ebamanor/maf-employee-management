import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskBoard } from "@/components/TaskBoard";

export default async function BoardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const [tasks, employees, websites] = await Promise.all([
    prisma.task.findMany({
      include: {
        assignedTo: true,
        website: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" as any },
      orderBy: { name: "asc" },
    }),
    prisma.website.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Board</h1>
        <p className="text-[var(--muted-foreground)]">
          Drag-and-drop style overview of every task by status.
        </p>
      </header>

      <TaskBoard tasks={tasks} employees={employees} websites={websites} />
    </div>
  );
}
