"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  name,
  placeholder,
  defaultValue,
  required,
  className,
}: {
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
