import { prisma } from "../lib/prisma";
import { WEBSITE_RULES } from "../lib/category-rules";

const EXCLUDED = new Set(["uncategorized", "uncategorised"]);

async function main() {
  for (const [key, rule] of Object.entries(WEBSITE_RULES)) {
    const url = key.startsWith("http") ? key : `https://${key}`;
    const website = await prisma.website.upsert({
      where: { url },
      update: {},
      create: {
        name: key,
        url,
        type: "NEWS" as any,
      },
    });

    const allCategoryNames = new Set<string>(rule.subCategories);

    for (const name of allCategoryNames) {
      if (EXCLUDED.has(name.toLowerCase().trim())) continue;
      await prisma.category.upsert({
        where: {
          websiteId_name: {
            websiteId: website.id,
            name,
          },
        },
        update: {},
        create: {
          name,
          website: { connect: { id: website.id } },
        },
      });
    }
  }

  console.log("Default websites and categories seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
