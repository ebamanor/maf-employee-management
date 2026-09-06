import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addEmployee, deleteUser, updateUser } from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Users,
  Plus,
  Mail,
  Calendar,
  Shield,
  Pencil,
  Trash2,
  Building2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DEPARTMENTS = [
  "Social Media",
  "CMS",
  "Content",
  "SEO",
  "Editorial",
  "Design",
  "Development",
  "Operations",
];

const PER_PAGE = 10;

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      }
    : {};

  const [users, total, websites] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { websites: { include: { website: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
    }),
    prisma.user.count({ where }),
    prisma.website.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">People</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage employees and admins.
          </p>
        </div>
        <Modal
          trigger={
            <Button>
              <Plus size={18} /> Add Person
            </Button>
          }
          title="Add Person"
        >
          <AddEmployeeForm websites={websites} />
        </Modal>
      </header>

      <form className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <Button type="submit" variant="secondary">
          <Search size={16} /> Search
        </Button>
        {q ? (
          <Link
            href="/admin/employees"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        {users.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-[var(--muted-foreground)]" />
            <p className="text-[var(--muted-foreground)]">No users found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[var(--muted-foreground)]">
                  <tr>
                    <th className="pb-3 pl-3">Name</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Websites</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Joined</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-[var(--border)] transition hover:bg-[var(--muted)]"
                    >
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} image={u.image || undefined} />
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <Mail size={14} />
                          {u.email}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} />
                          {u.department || "-"}
                        </div>
                      </td>
                      <td className="py-3">
                        {u.websites.length === 0
                          ? "-"
                          : u.websites.map((uw) => (
                              <Badge
                                key={uw.website.id}
                                variant={uw.website.type as string}
                                className="mr-1"
                              >
                                {uw.website.name}
                              </Badge>
                            ))}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Shield size={14} />
                          <Badge variant={u.role as string}>{u.role}</Badge>
                        </div>
                      </td>
                      <td className="py-3 text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/employees/${u.id}`}
                            className="flex items-center gap-1 rounded-xl bg-[var(--muted)] px-3 py-2 text-xs font-medium transition hover:bg-[var(--border)]"
                          >
                            <Eye size={14} /> View
                          </Link>
                          <Modal
                            trigger={
                              <Button variant="secondary" size="sm">
                                <Pencil size={14} />
                              </Button>
                            }
                            title="Edit Person"
                          >
                            <EditUserForm user={u} websites={websites} />
                          </Modal>
                          <form action={deleteUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <Button
                              type="submit"
                              variant="danger"
                              size="sm"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-[var(--muted-foreground)]">
                Page {page} of {totalPages} · {total} users
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/employees?q=${encodeURIComponent(q)}&page=${
                    page - 1
                  }`}
                  className={`inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--muted)] ${
                    page <= 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                  aria-disabled={page <= 1}
                >
                  <ChevronLeft size={16} /> Prev
                </Link>
                <Link
                  href={`/admin/employees?q=${encodeURIComponent(q)}&page=${
                    page + 1
                  }`}
                  className={`inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--muted)] ${
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                  aria-disabled={page >= totalPages}
                >
                  Next <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function DepartmentSelect({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      required={required}
      className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
    >
      <option value="">Select a department</option>
      {DEPARTMENTS.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}

function AddEmployeeForm({
  websites,
}: {
  websites: { id: string; name: string; type: string }[];
}) {
  return (
    <form action={addEmployee} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            name="role"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Department</label>
        <DepartmentSelect name="department" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Daily Cap</label>
        <input
          name="dailyCap"
          type="number"
          min={0}
          defaultValue={5}
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Assigned Websites</label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {websites.map((w) => (
            <label
              key={w.id}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 transition hover:bg-[var(--muted)]"
            >
              <input
                type="checkbox"
                name="websiteIds"
                value={w.id}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm">{w.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        Add Person
      </Button>
    </form>
  );
}

function EditUserForm({
  user,
  websites,
}: {
  user: any;
  websites: { id: string; name: string; type: string }[];
}) {
  const assigned = new Set(user.websites.map((uw: any) => uw.websiteId));

  return (
    <form action={updateUser} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            name="name"
            defaultValue={user.name}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={user.email}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            name="role"
            defaultValue={user.role}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Department</label>
          <DepartmentSelect name="department" defaultValue={user.department} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Daily Cap</label>
        <input
          name="dailyCap"
          type="number"
          min={0}
          defaultValue={user.dailyCap ?? 5}
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Assigned Websites</label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {websites.map((w) => (
            <label
              key={w.id}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 transition hover:bg-[var(--muted)]"
            >
              <input
                type="checkbox"
                name="websiteIds"
                value={w.id}
                defaultChecked={assigned.has(w.id)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm">{w.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
}
