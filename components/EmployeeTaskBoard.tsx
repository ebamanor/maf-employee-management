"use client";

import { useMemo, useState } from "react";
import { acceptTask, completeTask } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/Button";
import { RejectTaskForm } from "@/components/RejectTaskForm";
import { Search, Play, CheckCircle2 } from "lucide-react";

const COLUMNS = ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"] as const;

const COLUMN_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export function EmployeeTaskBoard({ tasks }: { tasks: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tasks.filter((t) =>
      t.sourceLink.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

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

  const handleAccept = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await acceptTask(new FormData(e.currentTarget));
      toast("Task accepted", "success");
    } catch {
      toast("Failed to accept task", "error");
    }
  };

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await completeTask(new FormData(e.currentTarget));
      toast("Task completed", "success");
    } catch {
      toast("Failed to complete task", "error");
    }
  };

  return (
    <section className="space-y-6">
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search source links..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
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
                grouped[status].map((t) => {
                  const actions =
                    status === "PENDING" ? (
                      <form onSubmit={handleAccept}>
                        <input type="hidden" name="id" value={t.id} />
                        <Button type="submit" size="sm" className="w-full">
                          <Play size={14} /> Accept
                        </Button>
                      </form>
                    ) : status === "IN_PROGRESS" ? (
                      <div className="space-y-2">
                        <form
                          onSubmit={handleComplete}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="id" value={t.id} />
                          <input
                            name="publishedUrl"
                            type="url"
                            required={(t.taskType as string) !== "NOTE"}
                            placeholder={
                              (t.taskType as string) === "NOTE"
                                ? "URL (optional)"
                                : "Published URL"
                            }
                            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="secondary"
                            className="h-7 w-7 shrink-0 p-0"
                          >
                            <CheckCircle2 size={14} />
                          </Button>
                        </form>
                        <div className="flex justify-end">
                          <RejectTaskForm taskId={t.id} />
                        </div>
                      </div>
                    ) : null;

                  return <TaskCard key={t.id} task={t} children={actions} />;
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
