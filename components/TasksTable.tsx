"use client";

import { useMemo, useState } from "react";
import {
  reassignTask,
  deleteTask,
  bulkReassignTasks,
  bulkDeleteTasks,
} from "@/lib/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { UserPlus, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

export function TasksTable({
  tasks,
  employees,
  websites,
}: {
  tasks: any[];
  employees: any[];
  websites: any[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [websiteId, setWebsiteId] = useState("ALL");
  const [assignee, setAssignee] = useState("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.sourceLink
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        status === "ALL" || (t.status as string) === status;
      const matchesWebsite =
        websiteId === "ALL" || t.website?.id === websiteId;
      const matchesAssignee =
        assignee === "ALL"
          ? true
          : assignee === "UNASSIGNED"
          ? !t.assignedToId
          : t.assignedToId === assignee;
      return matchesSearch && matchesStatus && matchesWebsite && matchesAssignee;
    });
  }, [tasks, search, status, websiteId, assignee]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    const visibleIds = visible.map((t) => t.id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    const next = new Set(selected);
    for (const id of visibleIds) {
      if (allSelected) next.delete(id);
      else next.add(id);
    }
    setSelected(next);
  };

  const selectedArray = Array.from(selected);

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">All Tasks</h2>

      <form id="bulkForm" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search source links..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={websiteId}
          onChange={(e) => {
            setWebsiteId(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="ALL">All websites</option>
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <select
          value={assignee}
          onChange={(e) => {
            setAssignee(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="ALL">All assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </form>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted-foreground)]">
            {selectedArray.length} selected
          </span>
        </div>
        <select
          name="userId"
          form="bulkForm"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">Reassign selected to...</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <Button
          type="submit"
          form="bulkForm"
          formAction={bulkReassignTasks}
          size="sm"
          variant="secondary"
        >
          <UserPlus size={14} /> Reassign
        </Button>
        <Button
          type="submit"
          form="bulkForm"
          formAction={bulkDeleteTasks}
          size="sm"
          variant="danger"
        >
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[var(--muted-foreground)]">
          No tasks match the filters.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="pb-3 pl-3">
                    <input
                      type="checkbox"
                      onChange={toggleAll}
                      checked={
                        visible.length > 0 &&
                        visible.every((t) => selected.has(t.id))
                      }
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                  </th>
                  <th className="whitespace-nowrap pb-3">Assignee</th>
                  <th className="whitespace-nowrap pb-3">Source Link</th>
                  <th className="whitespace-nowrap pb-3">Website</th>
                  <th className="whitespace-nowrap pb-3">Category</th>
                  <th className="hidden whitespace-nowrap pb-3 md:table-cell">
                    Sub
                  </th>
                  <th className="whitespace-nowrap pb-3">Type</th>
                  <th className="whitespace-nowrap pb-3">Status</th>
                  <th className="whitespace-nowrap pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-[var(--border)] transition hover:bg-[var(--muted)]"
                  >
                    <td className="py-3 pl-3">
                      <input
                        type="checkbox"
                        name="taskIds"
                        value={t.id}
                        form="bulkForm"
                        checked={selected.has(t.id)}
                        onChange={() => toggleOne(t.id)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                    </td>
                    <td className="whitespace-nowrap py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={t.assignedTo?.name || "Unassigned"}
                          image={t.assignedTo?.image || undefined}
                        />
                        <span className="max-w-[8rem] truncate font-medium">
                          {t.assignedTo?.name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[12rem] truncate py-3">
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
                    <td className="max-w-[10rem] truncate py-3">
                      {t.website?.name || "-"}
                    </td>
                    <td
                      className="max-w-[10rem] truncate whitespace-nowrap py-3"
                      title={t.category?.name || undefined}
                    >
                      {t.category?.name || "-"}
                    </td>
                    <td
                      className="hidden max-w-[14rem] truncate py-3 md:table-cell"
                      title={t.subCategories || undefined}
                    >
                      {t.subCategories || "-"}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          (t.taskType as string) === "NOTE"
                            ? "NOTE"
                            : (t.postType as string)
                        }
                      >
                        {(t.taskType as string) === "NOTE"
                          ? "Note"
                          : t.postType}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={t.status as string}>{t.status}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <form
                          action={reassignTask}
                          id={`reassignForm-${t.id}`}
                          className="flex gap-2"
                        >
                          <input type="hidden" name="taskId" value={t.id} />
                          <select
                            name="userId"
                            required
                            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs outline-none"
                          >
                            <option value="">Reassign</option>
                            {employees.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="secondary">
                            <UserPlus size={14} />
                          </Button>
                        </form>
                        <form
                          action={deleteTask}
                          id={`deleteForm-${t.id}`}
                          className="flex gap-2"
                        >
                          <input type="hidden" name="id" value={t.id} />
                          <Button type="submit" size="sm" variant="danger">
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
              Page {page} of {totalPages} · {filtered.length} tasks
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
