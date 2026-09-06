"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

export function SidebarShell({
  children,
  session,
  notificationCount,
}: {
  children: React.ReactNode;
  session: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "EMPLOYEE";
    image: string | null;
  };
  notificationCount: number;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <Sidebar
        role={session.role}
        name={session.name}
        image={session.image || undefined}
        notificationCount={notificationCount}
        expanded={expanded}
        setExpanded={setExpanded}
      />
      <main
        className={cn(
          "min-h-screen transition-[margin] duration-300",
          expanded ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {children}
      </main>
    </>
  );
}
