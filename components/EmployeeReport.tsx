"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getCompletedTasksForDate } from "@/lib/actions";
import { addLogoToPdf } from "@/lib/pdf-logo";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Loader2, Plus, Download } from "lucide-react";

const TASK_TYPES = [
  "Media Uploads",
  "Updates",
  "New Content",
  "Edits/Reviews",
  "SEO",
  "Social Media Posts",
  "CMS Maintenance",
  "Other",
];

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function EmployeeReport({
  userName,
  userDepartment,
}: {
  userName: string;
  userDepartment: string | null;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [subject, setSubject] = useState("Daily Activity Report");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [entries, setEntries] = useState<
    {
      id: string;
      task: string;
      hours: string;
      issues: string;
      completed: string;
      comments: string;
    }[]
  >([
    {
      id: newId(),
      task: "Media Uploads",
      hours: "",
      issues: "None",
      completed: "",
      comments: "None",
    },
  ]);

  useEffect(() => {
    setLoading(true);
    getCompletedTasksForDate(date).then((data) => {
      setTasks(data);
      setPage(1);
      setLoading(false);
    });
  }, [date]);

  const updateEntry = (
    id: string,
    field: keyof (typeof entries)[0],
    value: string
  ) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: newId(),
        task: "Media Uploads",
        hours: "",
        issues: "None",
        completed: "",
        comments: "None",
      },
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedTasks = tasks.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const downloadPDF = async () => {
    setExporting(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const margin = 14;

      const headY = await addLogoToPdf(doc);

      doc.setFontSize(18);
      doc.text("Daily Activity Report", margin, headY);

      doc.setFontSize(11);
      let y = headY + 12;
      doc.text(`Name: ${userName}`, margin, y);
      y += 7;
      doc.text(`Department: ${userDepartment || "-"}`, margin, y);
      y += 7;
      doc.text(`Subject: ${subject || "-"}`, margin, y);
      y += 7;
      doc.text(`Date: ${date}`, margin, y);

      autoTable(doc, {
        startY: y + 7,
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
        head: [
          [
            "Time period (hours)",
            "Task",
            "Issues encountered",
            "Completed task",
            "Comments",
          ],
        ],
        body: entries.map((e) => [
          e.hours || "-",
          e.task,
          e.issues || "None",
          e.completed || "-",
          e.comments || "None",
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [245, 198, 28],
          textColor: [31, 31, 31],
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 2, valign: "middle" },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 45 },
          3: { cellWidth: 30 },
          4: { cellWidth: 48 },
        },
      });

      const firstY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Website / Category / Links", margin, firstY);

      autoTable(doc, {
        startY: firstY + 5,
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
        head: [["Website Name", "Category", "Links"]],
        body:
          tasks.length > 0
            ? tasks.map((t) => [
                t.website?.name || "-",
                t.category?.name || "-",
                `Source: ${t.sourceLink}${
                  t.publishedUrl ? `\nPublished: ${t.publishedUrl}` : ""
                }`,
              ])
            : [["-", "-", `No completed tasks on ${date}`]],
        theme: "grid",
        headStyles: {
          fillColor: [245, 198, 28],
          textColor: [31, 31, 31],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 40 },
          2: { cellWidth: 103 },
        },
      });

      doc.save(`daily-report-${date}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Daily Report</h1>
          <p className="text-[var(--muted-foreground)]">
            Generate your daily work report and download as PDF.
          </p>
        </div>
        <Button onClick={downloadPDF} disabled={exporting}>
          {exporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {exporting ? "Generating..." : "Download PDF"}
        </Button>
      </header>

      <section>
        <div className="mb-8 grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Department</label>
            <input
              value={userDepartment || "-"}
              disabled
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2.5 text-sm text-[var(--muted-foreground)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Daily report"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-[var(--muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading tasks...
          </div>
        ) : null}
      </section>

      <div
        id="daily-report"
        className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm"
      >
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Name</p>
            <p className="font-semibold">{userName}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Department</p>
            <p className="font-semibold">{userDepartment || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Subject</p>
            <p className="font-semibold">{subject || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Date</p>
            <p className="font-semibold">{date}</p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold">Daily Task Table</h2>
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] text-left">
              <tr>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Time period (hours)
                </th>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Task
                </th>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Issues encountered
                </th>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Completed task
                </th>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="border border-[var(--border)] p-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={entry.hours}
                      onChange={(e) =>
                        updateEntry(entry.id, "hours", e.target.value)
                      }
                      className="w-full bg-transparent px-2 py-1 text-sm outline-none"
                      placeholder="0"
                    />
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    <select
                      value={entry.task}
                      onChange={(e) =>
                        updateEntry(entry.id, "task", e.target.value)
                      }
                      className="w-full bg-transparent px-2 py-1 text-sm outline-none"
                    >
                      {TASK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    <input
                      value={entry.issues}
                      onChange={(e) =>
                        updateEntry(entry.id, "issues", e.target.value)
                      }
                      className="w-full bg-transparent px-2 py-1 text-sm outline-none"
                      placeholder="None"
                    />
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    <input
                      type="number"
                      min="0"
                      value={entry.completed}
                      onChange={(e) =>
                        updateEntry(entry.id, "completed", e.target.value)
                      }
                      className="w-full bg-transparent px-2 py-1 text-sm outline-none"
                      placeholder="0"
                    />
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    <input
                      value={entry.comments}
                      onChange={(e) =>
                        updateEntry(entry.id, "comments", e.target.value)
                      }
                      className="w-full bg-transparent px-2 py-1 text-sm outline-none"
                      placeholder="None"
                    />
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2">
            <Button onClick={addEntry} variant="secondary" size="sm">
              <Plus size={16} /> Add Task Row
            </Button>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold">
          Website Name: Category / Links
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] text-left">
              <tr>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Website Name
                </th>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Category
                </th>
                <th className="border border-[var(--border)] p-3 font-semibold">
                  Links
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-[var(--border)] p-3 text-center text-[var(--muted-foreground)]"
                  >
                    No completed tasks on {date}.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((t) => (
                  <tr key={t.id}>
                    <td className="border border-[var(--border)] p-3">
                      {t.website?.name || "-"}
                    </td>
                    <td className="border border-[var(--border)] p-3">
                      {t.category?.name || "-"}
                    </td>
                    <td className="border border-[var(--border)] p-3">
                      <div className="space-y-1">
                        <p className="break-all">Source: {t.sourceLink}</p>
                        {t.publishedUrl ? (
                          <p className="break-all">
                            Published: {t.publishedUrl}
                          </p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      </div>
    </div>
  );
}
