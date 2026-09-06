"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/PasswordInput";
import { Mail } from "lucide-react";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null as any);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <img
            src="/logo/maf-black.png"
            alt="Managing Africa Foundation"
            className="mx-auto mb-4 h-20 w-auto object-contain"
          />
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Log in to continue managing your team.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </p>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <PasswordInput
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
