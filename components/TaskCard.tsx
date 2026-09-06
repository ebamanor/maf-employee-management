"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { TaskDetailModal } from "@/components/TaskDetailModal";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const STATUS_DOTS: Record<string, string> = {
  PENDING: "bg-yellow-400",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  REJECTED: "bg-red-500",
};

function fmtDate(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TaskCard({
  task,
  children,
}: {
  task: any;
  children?: ReactNode;
}) {
  const status = (task.status as string) || "PENDING";
  const isNote = (task.taskType as string) === "NOTE";

  const description = isNote
    ? task.notes || task.title || "-"
    : task.subCategories ||
      task.category?.name ||
      task.website?.name ||
      "-";

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
          <span className={cn("h-2 w-2 rounded-full", STATUS_DOTS[status])} />
          {STATUS_LABELS[status]}
        </div>
        <TaskDetailModal task={task} />
      </div>

      {isNote ? (
        <h3
          className="mt-3 text-base font-semibold text-[var(--foreground)]"
          title={task.title || undefined}
        >
          <span className="line-clamp-2 break-words">{task.title}</span>
        </h3>
      ) : (
        <a
          href={task.sourceLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-base font-semibold text-[var(--foreground)] transition hover:text-blue-600"
          title={task.sourceLink}
        >
          <span className="line-clamp-2 break-words">{task.sourceLink}</span>
        </a>
      )}

      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)] break-words">
        {description}
      </p>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
        {task.website ? (
          <span className="max-w-[45%] truncate rounded-lg bg-[var(--muted)] px-2 py-1">
            {task.website.name}
          </span>
        ) : null}
        {task.category ? (
          <span className="max-w-[45%] truncate rounded-lg bg-[var(--muted)] px-2 py-1">
            {task.category.name}
          </span>
        ) : null}
        {isNote ? (
          <Badge variant="NOTE">Note</Badge>
        ) : task.postType ? (
          <Badge variant={task.postType as string}>{task.postType}</Badge>
        ) : (
          <Badge variant="LINK">Link</Badge>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            name={task.assignedTo?.name || "Unassigned"}
            image={task.assignedTo?.image || undefined}
            className="h-6 w-6 shrink-0 text-xs"
          />
          <span className="truncate text-xs text-[var(--muted-foreground)]">
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </div>
        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
          {fmtDate(task.createdAt)}
        </span>
      </div>

      {children ? (
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}
