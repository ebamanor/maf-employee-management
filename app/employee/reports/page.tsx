import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { EmployeeReport } from "@/components/EmployeeReport";

export default async function EmployeeReportsPage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") redirect("/login");

  return (
    <EmployeeReport
      userName={session.name}
      userDepartment={session.department}
    />
  );
}
