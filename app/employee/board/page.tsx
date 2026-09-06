import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeTaskBoard } from "@/components/EmployeeTaskBoard";

export default async function EmployeeBoardPage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") redirect("/login");

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
    include: { website: true, category: true, assignedTo: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">My Board</h1>
        <p className="text-[var(--muted-foreground)]">
          View and manage your tasks by status.
        </p>
      </header>

      <EmployeeTaskBoard tasks={tasks} />
    </div>
  );
}
