"use client";

import { useState } from "react";
import { rejectTask } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Ban } from "lucide-react";

const REASONS = [
    "Could not copy content",
    "Link is broken / not accessible",
    "Content not relevant",
    "Website not available",
    "Other",
];

export function RejectTaskForm({ taskId }: { taskId: string }) {
    const [reason, setReason] = useState("");

    return (
        <Modal
            trigger={
                <Button type="button" size="sm" variant="danger">
                    <Ban size={14} /> Reject
                </Button>
            }
            title="Reject task"
        >
            <form action={rejectTask} className="space-y-4">
                <input type="hidden" name="id" value={taskId} />
                <div>
                    <label className="block text-sm font-medium">Reason</label>
                    <select
                        name="reason"
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    >
                        <option value="">Select a reason</option>
                        {REASONS.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>
                {reason === "Other" ? (
                    <div>
                        <label className="block text-sm font-medium">
                            Please specify
                        </label>
                        <textarea
                            name="otherReason"
                            required
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                    </div>
                ) : null}
                <Button type="submit" className="w-full" variant="danger">
                    <Ban size={14} /> Confirm Reject
                </Button>
            </form>
        </Modal>
    );
}
