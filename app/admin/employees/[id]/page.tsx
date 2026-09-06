import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeDetail } from "@/components/EmployeeDetail";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const employee = await prisma.user.findUnique({
    where: { id },
    include: { websites: { include: { website: true } } },
  });

  if (!employee) redirect("/admin/employees");

  const initialMonth = new Date().toISOString().slice(0, 7);

  return <EmployeeDetail employee={employee} initialMonth={initialMonth} />;
}
