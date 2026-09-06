import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markAllNotificationsRead } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Check, Bell } from "lucide-react";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="text-[var(--muted-foreground)]">
            {unread} unread · {notifications.length} total
          </p>
        </div>
        <form action={markAllNotificationsRead}>
          <Button type="submit" variant="secondary">
            <Check size={18} /> Mark all read
          </Button>
        </form>
      </header>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            <Bell className="mx-auto mb-3 h-12 w-12" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between rounded-2xl border p-4 transition ${
                  n.read
                    ? "border-[var(--border)] bg-[var(--background)]"
                    : "border-[var(--primary)] bg-[var(--muted)]"
                }`}
              >
                <div>
                  <p className="font-medium">{n.message}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
