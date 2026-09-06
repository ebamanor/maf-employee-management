"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession, signSession, clearSession } from "@/lib/auth";
import { suggestCategories, fetchPageText } from "@/lib/openrouter";

export async function login(prevState: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Bootstrap the first admin from env (fallback for local dev).
    const bootstrapEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
    const bootstrapPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (email === bootstrapEmail && password === bootstrapPassword) {
      const hashed = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: "Administrator",
          password: hashed,
          role: "ADMIN" as any,
        },
      });
      await signSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user.role as any) === "ADMIN" ? "ADMIN" : "EMPLOYEE",
        department: (user.department as string) || null,
        image: (user.image as string) || null,
      });
      redirect("/admin");
    }
    return { error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await signSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: (user.role as any) === "ADMIN" ? "ADMIN" : "EMPLOYEE",
    department: (user.department as string) || null,
        image: (user.image as string) || null,
  });

  if ((user.role as any) === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/employee");
  }
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function addEmployee(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "EMPLOYEE";
  const department = (formData.get("department") as string)?.trim() || null;
  const dailyCap = parseInt(formData.get("dailyCap") as string) || 5;
  const websiteIds = formData.getAll("websiteIds") as string[];

  if (!name || !email || !password) {
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role as any,
      department,
      dailyCap,
      websites: {
        create: websiteIds.map((websiteId) => ({
          website: { connect: { id: websiteId } },
        })),
      },
    },
  });

  revalidatePath("/admin/employees");
}

export async function addWebsite(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const name = (formData.get("name") as string)?.trim();
  const url = (formData.get("url") as string)?.trim() || null;
  const type = (formData.get("type") as string) || "NEWS";

  if (!name) {
    return;
  }

  await prisma.website.create({
    data: { name, url, type: type as any },
  });

  revalidatePath("/admin/websites");
}

export async function addCategory(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const name = (formData.get("name") as string)?.trim();
  const websiteId = formData.get("websiteId") as string;

  if (!name || !websiteId) {
    return;
  }

  await prisma.category.create({ data: { name, websiteId } });
  revalidatePath("/admin/websites");
}

function extractUrls(raw: string) {
  const urlRegex =
    /(https?:\/\/(?:[a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;=%]|&)+)/gi;
  const urls: string[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(urlRegex);
    if (match && match[0]) {
      urls.push(match[0].trim().replace(/[.,;!?]+$/, ""));
    }
  }
  return urls;
}

export async function createBulkTasks(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const raw = formData.get("links") as string;
  const websiteId = formData.get("websiteId") as string;
  const categoryId = formData.get("categoryId") as string;
  const postType = (formData.get("postType") as string) || "POST";
  const assignTo = formData.get("assignTo") as string;
  const autoDistribute = assignTo === "auto";
  const useAi = formData.get("useAi") === "on";

  if (!raw || !websiteId) {
    return;
  }

  const links = extractUrls(raw);
  if (links.length === 0) {
    return;
  }

  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: { categories: true },
  });
  if (!website) return;

  const categoryMap = new Map(
    website.categories.map((c) => [c.name.toLowerCase().trim(), c.id])
  );

  let aiSuggestions: { link: string; sub: string[] }[] = [];
  if (useAi) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { aiEnabled: true, openRouterApiKey: true },
    });

    if (user?.aiEnabled && user?.openRouterApiKey) {
      try {
        const pageTexts: Record<string, string | null> = {};
        await Promise.all(
          links.map(async (l) => {
            pageTexts[l] = await fetchPageText(l);
          })
        );

        aiSuggestions = await suggestCategories(
          website,
          links,
          user.openRouterApiKey,
          pageTexts
        );
      } catch (e) {
        console.error("AI categorisation failed:", e);
      }
    }
  }

  const suggestionMap = new Map(
    aiSuggestions.map((s) => [s.link, { sub: s.sub }])
  );

  type Distributor = { userId: string; dailyCap: number; assigned: number };
  let distribution: Distributor[] = [];
  let distIndex = 0;

  if (autoDistribute) {
    const userWebsites = await prisma.userWebsite.findMany({
      where: { websiteId },
      select: { userId: true, user: { select: { dailyCap: true } } },
    });

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const counts = await prisma.task.groupBy({
      by: ["assignedToId"],
      where: {
        assignedToId: { in: userWebsites.map((uw) => uw.userId) },
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
    });
    const countMap = new Map(counts.map((c) => [c.assignedToId, c._count.id]));

    distribution = userWebsites.map((uw) => ({
      userId: uw.userId,
      dailyCap: uw.user.dailyCap ?? 5,
      assigned: countMap.get(uw.userId) || 0,
    }));
  }

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const suggestion = suggestionMap.get(link);

    let assignedToId: string | null = null;
    if (autoDistribute && distribution.length > 0) {
      for (let attempts = 0; attempts < distribution.length; attempts++) {
        const d = distribution[distIndex % distribution.length];
        distIndex++;
        if (d.assigned < d.dailyCap) {
          d.assigned++;
          assignedToId = d.userId;
          break;
        }
      }
    } else if (!autoDistribute) {
      assignedToId = assignTo || null;
    }

    const pickedSub = suggestion?.sub?.[0] || "";
    const subCategoryId =
      categoryMap.get(pickedSub.toLowerCase().trim()) || categoryId || null;
    const subCategories =
      suggestion?.sub?.slice(1).join(", ") || null;

    await prisma.task.create({
      data: {
        sourceLink: link,
        postType: postType as any,
        website: { connect: { id: websiteId } },
        category: subCategoryId ? { connect: { id: subCategoryId } } : undefined,
        mainCategory: null,
        subCategories,
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
      },
    });
  }

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function createNoteTask(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const title = (formData.get("title") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const websiteId = formData.get("websiteId") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const assignTo = (formData.get("assignTo") as string) || null;

  if (!title) {
    return;
  }

  await prisma.task.create({
    data: {
      title,
      notes,
      taskType: "NOTE" as any,
      website: websiteId ? { connect: { id: websiteId } } : undefined,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      assignedTo: assignTo ? { connect: { id: assignTo } } : undefined,
    },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function assignTask(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const taskId = formData.get("taskId") as string;
  const userId = formData.get("userId") as string;

  if (!taskId || !userId) {
    return;
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { assignedToId: userId, status: "PENDING" as any },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function deleteTask(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const id = formData.get("id") as string;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function bulkDeleteTasks(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const ids = formData.getAll("taskIds") as string[];
  if (ids.length === 0) return;

  await prisma.task.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function bulkAssignTasks(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const ids = formData.getAll("taskIds") as string[];
  const userId = formData.get("userId") as string;
  if (ids.length === 0 || !userId) return;

  await prisma.task.updateMany({
    where: { id: { in: ids } },
    data: { assignedToId: userId, status: "PENDING" as any },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function reassignTask(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const taskId = formData.get("taskId") as string;
  const userId = formData.get("userId") as string;

  if (!taskId || !userId) {
    return;
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { assignedToId: userId },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function bulkReassignTasks(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const ids = formData.getAll("taskIds") as string[];
  const userId = formData.get("userId") as string;
  if (ids.length === 0 || !userId) return;

  await prisma.task.updateMany({
    where: { id: { in: ids } },
    data: { assignedToId: userId },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/board");
}

export async function acceptTask(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    return;
  }

  const id = formData.get("id") as string;
  await prisma.task.update({
    where: { id },
    data: { assignedToId: session.id, status: "IN_PROGRESS" as any },
  });

  revalidatePath("/employee");
  revalidatePath("/employee/board");
}

export async function bulkAccept(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    return;
  }

  const ids = formData.getAll("id") as string[];
  if (ids.length === 0) {
    return;
  }

  await prisma.task.updateMany({
    where: { id: { in: ids } },
    data: { assignedToId: session.id, status: "IN_PROGRESS" as any },
  });

  revalidatePath("/employee");
  revalidatePath("/employee/board");
}

export async function completeTask(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    return;
  }

  const id = formData.get("id") as string;
  const publishedUrl = (formData.get("publishedUrl") as string)?.trim();

  if (!id) {
    return;
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return;
  }

  if ((task.taskType as string) !== "NOTE" && !publishedUrl) {
    return;
  }

  const data: any = {
    status: "COMPLETED" as any,
    completedById: session.id,
    completedAt: new Date(),
  };
  if (publishedUrl) data.publishedUrl = publishedUrl;

  await prisma.task.update({
    where: { id },
    data,
  });

  const completedTask = await prisma.task.findUnique({
    where: { id },
    include: { website: true },
  });

  if (completedTask) {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" as any },
      select: { id: true },
    });

    const message = `${session.name} completed a task${
      completedTask.website ? ` on ${completedTask.website.name}` : ""
    }`;

    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, message },
      });
    }
  }

  revalidatePath("/employee");
  revalidatePath("/employee/board");
}

export async function rejectTask(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    return;
  }

  const id = formData.get("id") as string;
  const reason = (formData.get("reason") as string)?.trim();
  const otherReason = (formData.get("otherReason") as string)?.trim();

  if (!id || !reason) {
    return;
  }

  const finalReason = reason === "Other" && otherReason ? otherReason : reason;

  await prisma.task.update({
    where: { id },
    data: {
      status: "REJECTED" as any,
      rejectedById: session.id,
      rejectedAt: new Date(),
      rejectionReason: finalReason,
    },
  });

  const rejectedTask = await prisma.task.findUnique({
    where: { id },
    include: { website: true },
  });

  if (rejectedTask) {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" as any },
      select: { id: true },
    });

    const message = `${session.name} rejected a task${
      rejectedTask.website ? ` on ${rejectedTask.website.name}` : ""
    }`;

    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, message },
      });
    }
  }

  revalidatePath("/employee");
  revalidatePath("/employee/board");
}

export async function bulkComplete(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    return;
  }

  const ids = formData.getAll("id") as string[];
  if (ids.length === 0) {
    return;
  }

  await prisma.task.updateMany({
    where: { id: { in: ids }, assignedToId: session.id },
    data: {
      status: "COMPLETED" as any,
      completedById: session.id,
      completedAt: new Date(),
    },
  });

  revalidatePath("/employee");
  revalidatePath("/employee/board");
}

export async function deleteUser(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.task.updateMany({
    where: { assignedToId: id },
    data: { assignedToId: null },
  });

  await prisma.task.updateMany({
    where: { completedById: id },
    data: { completedById: null },
  });

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/employees");
}

export async function updateUser(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = (formData.get("role") as string) || "EMPLOYEE";
  const department = (formData.get("department") as string)?.trim() || null;
  const dailyCap = parseInt(formData.get("dailyCap") as string) || 5;
  const websiteIds = formData.getAll("websiteIds") as string[];

  if (!id || !name || !email) return;

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role: role as any,
      department,
      dailyCap,
      websites: {
        deleteMany: {},
        create: websiteIds.map((websiteId) => ({
          website: { connect: { id: websiteId } },
        })),
      },
    },
  });

  revalidatePath("/admin/employees");
}

export async function deleteWebsite(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.website.delete({ where: { id } });
  revalidatePath("/admin/websites");
}

export async function updateWebsite(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const url = (formData.get("url") as string)?.trim() || null;
  const type = (formData.get("type") as string) || "NEWS";

  if (!id || !name) return;

  await prisma.website.update({
    where: { id },
    data: { name, url, type: type as any },
  });

  revalidatePath("/admin/websites");
}

export async function deleteCategory(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/websites");
}

export async function updateCategory(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const websiteId = formData.get("websiteId") as string;

  if (!id || !name || !websiteId) return;

  await prisma.category.update({
    where: { id },
    data: { name, websiteId },
  });

  revalidatePath("/admin/websites");
}

export async function getCompletedTasksForDate(date: string) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    throw new Error("Unauthorized");
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      completedById: session.id,
      status: "COMPLETED" as any,
      completedAt: { gte: start, lte: end },
    },
    include: { website: true, category: true },
    orderBy: { completedAt: "desc" },
  });

  return tasks;
}

export async function getEmployeeMonthReport(
  userId: string,
  month: string
): Promise<{ tasks: any[]; dailyCounts: Record<string, number> }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [year, monthNum] = month.split("-").map(Number);
  const start = new Date(year, monthNum - 1, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, monthNum, 0);
  end.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      completedById: userId,
      status: "COMPLETED" as any,
      completedAt: { gte: start, lte: end },
    },
    include: { website: true, category: true },
    orderBy: { completedAt: "asc" },
  });

  const dailyCounts: Record<string, number> = {};
  for (const t of tasks) {
    const dateKey = new Date(t.completedAt!).toISOString().split("T")[0];
    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
  }

  return {
    tasks: tasks.map((t) => ({
      id: t.id,
      sourceLink: t.sourceLink,
      publishedUrl: t.publishedUrl,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      website: t.website,
      category: t.category,
    })),
    dailyCounts,
  };
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return;
  }

  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });

  revalidatePath("/admin/notifications");
}

export async function createManualWork(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    return;
  }

  const websiteId = formData.get("websiteId") as string;
  const categoryId = formData.get("categoryId") as string;
  const postType = (formData.get("postType") as string) || "POST";
  const sourceLink = (formData.get("sourceLink") as string)?.trim();
  const publishedUrl = (formData.get("publishedUrl") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!websiteId || !publishedUrl) {
    return;
  }

  await prisma.task.create({
    data: {
      sourceLink: sourceLink || publishedUrl,
      publishedUrl,
      postType: postType as any,
      website: { connect: { id: websiteId } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      status: "COMPLETED" as any,
      completedBy: { connect: { id: session.id } },
      completedAt: new Date(),
      isManual: true,
      notes,
    },
  });

  revalidatePath("/employee");
  revalidatePath("/employee/board");
  redirect("/employee");
}

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

export async function updateUserSettings(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return;
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const department = (formData.get("department") as string)?.trim() || null;
  const password = (formData.get("password") as string)?.trim();
  const image = formData.get("image") as File | null;
  const aiEnabled = session.role === "ADMIN" ? formData.get("aiEnabled") === "on" : undefined;
  const openRouterApiKey =
    session.role === "ADMIN"
      ? (formData.get("openRouterApiKey") as string)?.trim() || null
      : undefined;

  let imagePath = session.image || null;

  if (image && image.size > 0) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(image.type)) {
      return;
    }

    const uploadDir = path.join(process.cwd(), "public", "avatars");
    await mkdir(uploadDir, { recursive: true });

    const ext = image.name.split(".").pop() || "png";
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await image.arrayBuffer());
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    imagePath = `/avatars/${filename}`;
  }

  const data: any = {
    name,
    email,
    department,
    image: imagePath,
  };

  if (session.role === "ADMIN") {
    data.aiEnabled = aiEnabled;
    data.openRouterApiKey = openRouterApiKey;
  }

  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data,
  });

  await signSession({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role as "ADMIN" | "EMPLOYEE",
    department: (updated.department as string) || null,
    image: (updated.image as string) || null,
  });

  revalidatePath("/settings");
}

export async function getEmployeeWork(
  mode: "day" | "month",
  value: string
): Promise<{ id: string; name: string; count: number }[]> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return [];

  const where: any = { status: "COMPLETED" as any };
  if (mode === "day") {
    const d = new Date(value);
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    where.completedAt = { gte: start, lte: end };
  } else {
    const [year, month] = value.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year, month, 0);
    end.setHours(23, 59, 59, 999);
    where.completedAt = { gte: start, lte: end };
  }

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" as any },
    include: { completedTasks: { where } },
    orderBy: { name: "asc" },
  });

  return employees.map((e) => ({
    id: e.id,
    name: e.name,
    count: e.completedTasks.length,
  }));
}
