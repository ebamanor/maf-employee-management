"use client";

import { useMemo, useState } from "react";
import { reassignTask, deleteTask } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Search, UserPlus, Trash2 } from "lucide-react";

const COLUMNS = ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"] as const;

const COLUMN_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export function TaskBoard({
  tasks,
  employees,
  websites,
}: {
  tasks: any[];
  employees: any[];
  websites: any[];
}) {
  const [search, setSearch] = useState("");
  const [websiteId, setWebsiteId] = useState("ALL");
  const [assignee, setAssignee] = useState("ALL");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.sourceLink
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesWebsite =
        websiteId === "ALL" || t.website?.id === websiteId;
      const matchesAssignee =
        assignee === "ALL"
          ? true
          : assignee === "UNASSIGNED"
          ? !t.assignedToId
          : t.assignedToId === assignee;
      return matchesSearch && matchesWebsite && matchesAssignee;
    });
  }, [tasks, search, websiteId, assignee]);

  const grouped = useMemo(() => {
    const byStatus: Record<string, any[]> = {
      PENDING: [],
      IN_PROGRESS: [],
      COMPLETED: [],
      REJECTED: [],
    };
    for (const t of filtered) {
      const status = (t.status as string) || "PENDING";
      if (byStatus[status]) byStatus[status].push(t);
      else byStatus.PENDING.push(t);
    }
    return byStatus;
  }, [filtered]);

  const handleReassign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await reassignTask(new FormData(e.currentTarget));
      toast("Task reassigned", "success");
    } catch {
      toast("Failed to reassign task", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const fd = new FormData();
    fd.set("id", id);
    try {
      await deleteTask(fd);
      toast("Task deleted", "success");
    } catch {
      toast("Failed to delete task", "error");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search source links..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <select
          value={websiteId}
          onChange={(e) => setWebsiteId(e.target.value)}
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
          onChange={(e) => setAssignee(e.target.value)}
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
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((status) => (
          <div
            key={status}
            className="flex h-[75vh] min-h-0 flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
          >
            <div className="border-b border-[var(--border)] p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{COLUMN_LABELS[status]}</h2>
                <span className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium">
                  {grouped[status].length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {grouped[status].length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                  No tasks
                </p>
              ) : (
                grouped[status].map((t) => (
                  <TaskCard key={t.id} task={t}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <form
                        onSubmit={handleReassign}
                        className="flex flex-1 items-center gap-1"
                      >
                        <input type="hidden" name="taskId" value={t.id} />
                        <select
                          name="userId"
                          required
                          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-1.5 py-1.5 text-xs outline-none"
                        >
                          <option value="">Assign</option>
                          {employees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          className="h-7 w-7 p-0"
                        >
                          <UserPlus size={14} />
                        </Button>
                      </form>

                      <ConfirmDialog
                        trigger={
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 size={14} />
                          </Button>
                        }
                        title="Delete task"
                        description="Are you sure you want to delete this task? This cannot be undone."
                        confirmLabel="Delete"
                        onConfirm={() => handleDelete(t.id)}
                      />
                    </div>
                  </TaskCard>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
