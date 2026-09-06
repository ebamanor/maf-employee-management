import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManualWorkForm } from "@/components/ManualWorkForm";
import { WEBSITE_RULES } from "@/lib/category-rules";
import { Upload } from "lucide-react";

const EXCLUDED = new Set(["uncategorized", "uncategorised"]);

async function syncCategories(websiteIds: string[]) {
  const websites = await prisma.website.findMany({
    where: { id: { in: websiteIds } },
  });

  for (const w of websites) {
    const rule = WEBSITE_RULES[w.name];
    if (!rule) continue;

    for (const name of rule.subCategories) {
      if (EXCLUDED.has(name.toLowerCase().trim())) continue;
      await prisma.category.upsert({
        where: {
          websiteId_name: {
            websiteId: w.id,
            name,
          },
        },
        update: {},
        create: {
          name,
          website: { connect: { id: w.id } },
        },
      });
    }
  }
}

export default async function ManualWorkPage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      websites: {
        include: {
          website: true,
        },
      },
    },
  });

  const websiteIds =
    user?.websites.map((uw) => uw.website.id).filter(Boolean) || [];

  if (websiteIds.length > 0) {
    await syncCategories(websiteIds);
  }

  const websites = await prisma.website.findMany({
    where: { id: { in: websiteIds } },
    include: {
      categories: { orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Manual Work</h1>
        <p className="text-[var(--muted-foreground)]">
          Submit posts or product listings you published yourself. They will be
          counted in your daily and monthly reports.
        </p>
      </header>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Upload size={20} /> Submit a post
        </h2>
        {websites.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">
            You have not been assigned to any websites yet. Ask your admin to
            assign one.
          </p>
        ) : (
          <ManualWorkForm websites={websites} />
        )}
      </section>
    </div>
  );
}
