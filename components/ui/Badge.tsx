import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  PENDING: "bg-zinc-100 text-zinc-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  HIRED: "bg-amber-100 text-amber-800",
  EMPLOYED: "bg-lime-100 text-lime-800",
  ADMIN: "bg-[var(--foreground)] text-[var(--background)]",
  EMPLOYEE: "bg-[var(--primary)] text-[var(--primary-foreground)]",
  INVITED: "bg-purple-100 text-purple-700",
  ABSENT: "bg-red-100 text-red-700",
  NEWS: "bg-sky-100 text-sky-700",
  PRODUCT: "bg-rose-100 text-rose-700",
  GENERAL: "bg-zinc-100 text-zinc-700",
  POST: "bg-violet-100 text-violet-700",
  LINK: "bg-sky-100 text-sky-700",
  NOTE: "bg-indigo-100 text-indigo-700",
  default: "bg-zinc-100 text-zinc-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
