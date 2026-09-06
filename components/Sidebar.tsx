"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Globe,
  ListTodo,
  BarChart3,
  FileText,
  Link as LinkIcon,
  LayoutGrid,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";

const adminNav = (count: number) => [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "People", icon: Users },
  { href: "/admin/websites", label: "Websites", icon: Globe },
  { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { href: "/admin/board", label: "Board", icon: LayoutGrid },
  { href: "/admin/links", label: "Links", icon: LinkIcon },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, count },
  { href: "/settings", label: "Settings", icon: Settings },
];

const employeeNav = [
  { href: "/employee", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employee/board", label: "Board", icon: LayoutGrid },
  { href: "/employee/manual", label: "Manual Work", icon: Upload },
  { href: "/employee/reports", label: "Daily Report", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  role,
  name,
  image,
  notificationCount,
  expanded,
  setExpanded,
}: {
  role: "ADMIN" | "EMPLOYEE";
  name: string;
  image?: string;
  notificationCount: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items =
    role === "ADMIN" ? adminNav(notificationCount) : employeeNav;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen transform flex-col border-r border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-300 ease-in-out print:hidden",
          "w-64",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          expanded ? "lg:w-64" : "lg:w-20"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-[var(--muted)] lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="absolute right-4 top-4 hidden rounded-full p-2 transition hover:bg-[var(--muted)] lg:block"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div
          className={cn(
            "mt-2 flex justify-center transition-all",
            expanded ? "mb-10" : "mb-4"
          )}
        >
          <img
            src="/logo/maf-black.png"
            alt="Managing Africa Foundation"
            className={cn(
              "w-auto max-w-[90%] object-contain transition-all",
              expanded ? "h-20" : "hidden"
            )}
          />
        </div>

        <nav className="flex-1 space-y-2">
          {items.map((item: any) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (pathname.startsWith(item.href + "/") &&
                item.href !== "/admin" &&
                item.href !== "/employee");
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center rounded-2xl py-3 text-sm font-medium transition",
                  expanded ? "gap-3 px-4" : "justify-center px-2",
                  active
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={18} />
                {expanded ? (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.count ? (
                      <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {item.count > 99 ? "99+" : item.count}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl bg-[var(--muted)] p-4",
              !expanded && "justify-center"
            )}
          >
            <Avatar name={name} image={image} />
            {expanded ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="text-xs text-[var(--muted-foreground)] capitalize">
                  {role.toLowerCase()}
                </p>
              </div>
            ) : null}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50",
                !expanded && "justify-center px-0"
              )}
            >
              <LogOut size={18} />
              {expanded ? "Logout" : null}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
