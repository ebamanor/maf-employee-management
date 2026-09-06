import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSettings } from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Camera,
  Sparkles,
  Key,
  User,
  Mail,
  Building2,
  Lock,
} from "lucide-react";

const DEPARTMENTS = [
  "Social Media",
  "CMS",
  "Content",
  "SEO",
  "Editorial",
  "Design",
  "Development",
  "Operations",
];

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) redirect("/login");

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Update your profile and preferences.
        </p>
      </header>

      <form action={updateUserSettings} className="space-y-6">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <User size={20} /> Profile Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                name="name"
                defaultValue={user.name}
                required
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Department</label>
              <select
                name="department"
                defaultValue={user.department || ""}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="">Select a department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Lock size={20} /> Password
          </h2>
          <PasswordInput
            name="password"
            placeholder="Leave blank to keep current password"
          />
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Camera size={20} /> Profile Picture
          </h2>
          <div className="mb-4">
            <Avatar
              name={user.name}
              image={user.image || undefined}
              className="h-24 w-24 text-2xl"
            />
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Recommended: 500x500 professional image.
          </p>
        </section>

        {user.role === "ADMIN" ? (
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Sparkles size={20} /> AI Categorisation
            </h2>
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                name="aiEnabled"
                value="on"
                defaultChecked={user.aiEnabled}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              <label className="text-sm font-medium">
                Suggest categories using OpenRouter AI when bulk-adding links
              </label>
            </div>
            <div className="relative">
              <Key
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                name="openRouterApiKey"
                type="password"
                defaultValue={user.openRouterApiKey || ""}
                placeholder="sk-or-..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Your OpenRouter API key is stored and only used for category
              suggestions.
            </p>
          </section>
        ) : null}

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
