import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
}) {
  const Card = (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)]">
        <Icon size={24} />
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {Card}
      </Link>
    );
  }

  return Card;
}
