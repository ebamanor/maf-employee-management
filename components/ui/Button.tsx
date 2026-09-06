import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50",
          {
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-95":
              variant === "primary",
            "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]":
              variant === "secondary",
            "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]":
              variant === "ghost",
            "bg-red-50 text-red-700 hover:bg-red-100": variant === "danger",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-11 px-5 text-sm": size === "md",
            "h-14 px-7 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
