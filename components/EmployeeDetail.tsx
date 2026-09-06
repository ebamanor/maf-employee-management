"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { addLogoToPdf } from "@/lib/pdf-logo";
import { getEmployeeMonthReport } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Download, Loader2, Calendar } from "lucide-react";

export function EmployeeDetail({
  employee,
  initialMonth,
}: {
  employee: any;
  initialMonth: string;
}) {
  const [month, setMonth] = useState(initialMonth);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = async (m: string) => {
    setLoading(true);
    const data = await getEmployeeMonthReport(employee.id, m);
    setTasks(data.tasks);
    setDailyCounts(data.dailyCounts);
    setLoading(false);
  };

  useEffect(() => {
    load(month);
  }, [month]);

  const total = Object.values(dailyCounts).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(dailyCounts), 1);
  const sortedDays = Object.entries(dailyCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const downloadMonthlyPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const margin = 14;

      const headY = await addLogoToPdf(doc);

      doc.setFontSize(18);
      doc.text("Monthly Employee Report", margin, headY);

      doc.setFontSize(11);
      let y = headY + 12;
      doc.text(`Name: ${employee.name}`, margin, y);
      y += 7;
      doc.text(`Department: ${employee.department || "-"}`, margin, y);
      y += 7;
      doc.text(`Month: ${month}`, margin, y);
      y += 7;
      doc.text(`Total completed: ${total}`, margin, y);

      autoTable(doc, {
        startY: y + 7,
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
        head: [["Date", "Completed"]],
        body: sortedDays.map(([date, count]) => [date, String(count)]),
        theme: "grid",
        headStyles: {
          fillColor: [245, 198, 28],
          textColor: [31, 31, 31],
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 62 },
        },
      });

      const postsY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Completed Posts", margin, postsY);

      autoTable(doc, {
        startY: postsY + 5,
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
        head: [["Date", "Website", "Category", "Links"]],
        body: tasks.map((t) => [
          t.completedAt
            ? new Date(t.completedAt).toISOString().split("T")[0]
            : "-",
          t.website?.name || "-",
          t.category?.name || "-",
          `Source: ${t.sourceLink}${
            t.publishedUrl ? `\nPublished: ${t.publishedUrl}` : ""
          }`,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [245, 198, 28],
          textColor: [31, 31, 31],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 48 },
          2: { cellWidth: 48 },
          3: { cellWidth: 56 },
        },
      });

      doc.save(`monthly-report-${employee.name}-${month}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Avatar
            name={employee.name}
            image={employee.image || undefined}
            className="h-14 w-14 text-base"
          />
          <div>
            <h1 className="text-3xl font-semibold">{employee.name}</h1>
            <p className="text-[var(--muted-foreground)]">{employee.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={employee.role}>{employee.role}</Badge>
          {employee.department ? (
            <Badge variant="HIRED">{employee.department}</Badge>
          ) : null}
          {employee.websites.map((uw: any) => (
            <Badge key={uw.website.id} variant={uw.website.type}>
              {uw.website.name}
            </Badge>
          ))}
        </div>
      </header>

      <section className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <h2 className="text-lg font-semibold">Monthly Work</h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <Button onClick={downloadMonthlyPDF} disabled={exporting}>
              {exporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {exporting ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" /> Loading...
          </div>
        ) : tasks.length === 0 ? (
          <p className="py-12 text-center text-[var(--muted-foreground)]">
            No completed work in {month}.
          </p>
        ) : (
          <>
            <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-4 text-sm font-medium">
                {total} completed posts across {sortedDays.length} days
              </p>
              <div className="flex h-40 items-end gap-2 overflow-x-auto">
                {sortedDays.map(([date, count]) => (
                  <div
                    key={date}
                    className="flex h-full flex-col items-center justify-end gap-1"
                  >
                    <div
                      className="w-3 rounded-t bg-[var(--primary)]"
                      style={{
                        height: `${(count / maxCount) * 100}%`,
                      }}
                    />
                    <span className="whitespace-nowrap text-[10px] text-[var(--muted-foreground)]">
                      {date.split("-")[2]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[var(--muted-foreground)]">
                  <tr>
                    <th className="pb-3 pl-3">Date</th>
                    <th className="pb-3">Website</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr
                      key={t.id}
                      className="border-t border-[var(--border)] transition hover:bg-[var(--muted)]"
                    >
                      <td className="py-3 pl-3">
                        {t.completedAt
                          ? new Date(t.completedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3">{t.website?.name || "-"}</td>
                      <td className="py-3">{t.category?.name || "-"}</td>
                      <td className="max-w-xs truncate py-3">
                        <a
                          href={t.sourceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {t.sourceLink}
                        </a>
                        {t.publishedUrl ? (
                          <p>
                            <a
                              href={t.publishedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {t.publishedUrl}
                            </a>
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
