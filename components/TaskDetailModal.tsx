"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Eye, ExternalLink } from "lucide-react";

function fmt(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}

export function TaskDetailModal({
  task,
  size = "sm",
}: {
  task: any;
  size?: "sm" | "md";
}) {
  return (
    <Modal
      trigger={
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-7 shrink-0 p-0"
        >
          <Eye size={14} />
        </Button>
      }
      title="Task details"
    >
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={task.status as string}>{task.status}</Badge>
          <Badge variant={task.postType as string}>{task.postType}</Badge>
          {task.isManual ? <Badge variant="default">Manual</Badge> : null}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-4">
          <p className="text-xs text-[var(--muted-foreground)]">Source link</p>
          <a
            href={task.sourceLink}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 break-all text-blue-600 hover:underline"
          >
            {task.sourceLink} <ExternalLink size={12} />
          </a>
        </div>

        {task.publishedUrl ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-4">
            <p className="text-xs text-[var(--muted-foreground)]">
              Published URL
            </p>
            <a
              href={task.publishedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 break-all text-blue-600 hover:underline"
            >
              {task.publishedUrl} <ExternalLink size={12} />
            </a>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Website" value={task.website?.name || "-"} />
          <Info label="Category" value={task.category?.name || "-"} />
          <Info
            label="Sub categories"
            value={task.subCategories || "-"}
          />
          <Info label="Created" value={fmt(task.createdAt)} />
          <Info label="Updated" value={fmt(task.updatedAt)} />
          {task.completedAt ? (
            <Info label="Completed" value={fmt(task.completedAt)} />
          ) : null}
          {task.rejectedAt ? (
            <Info label="Rejected" value={fmt(task.rejectedAt)} />
          ) : null}
        </div>

        {task.rejectionReason ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="text-xs font-medium">Rejection reason</p>
            <p className="mt-1">{task.rejectionReason}</p>
          </div>
        ) : null}

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3">
          <Avatar
            name={task.assignedTo?.name || "Unassigned"}
            image={task.assignedTo?.image || undefined}
            className="h-9 w-9"
          />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Assigned to</p>
            <p className="font-medium">{task.assignedTo?.name || "Unassigned"}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
