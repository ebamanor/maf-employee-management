"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex items-center justify-center rounded-2xl p-3 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]",
        className
      )}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
