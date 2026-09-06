"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { addLogoToPdf } from "@/lib/pdf-logo";
import { Button } from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";

export function AdminReportPDF({
  start,
  end,
  completed,
  byEmployee,
  byWebsite,
  tasks,
}: {
  start: string;
  end: string;
  completed: number;
  byEmployee: Record<string, number>;
  byWebsite: Record<string, number>;
  tasks: {
    employee: string;
    completed: string;
    website: string;
    category: string;
    publishedUrl: string;
  }[];
}) {
  const [exporting, setExporting] = useState(false);

  const download = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const margin = 14;

      const headY = await addLogoToPdf(doc);

      doc.setFontSize(18);
      doc.text("Admin Report", margin, headY);

      doc.setFontSize(11);
      let y = headY + 10;
      doc.text(`Period: ${start} to ${end}`, margin, y);
      y += 7;
      doc.text(`Total completed: ${completed}`, margin, y);
      y += 7;
      doc.text(
        `Top employee: ${
          Object.entries(byEmployee).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"
        }`,
        margin,
        y
      );
      y += 7;
      doc.text(
        `Top website: ${
          Object.entries(byWebsite).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"
        }`,
        margin,
        y
      );

      autoTable(doc, {
        startY: y + 12,
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
        head: [["Employee", "Completed"]],
        body: Object.entries(byEmployee)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => [name, String(count)]),
        theme: "grid",
        headStyles: {
          fillColor: [245, 198, 28],
          textColor: [31, 31, 31],
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 140 },
          1: { cellWidth: 42 },
        },
      });

      const webY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("By Website", margin, webY);

      autoTable(doc, {
        startY: webY + 5,
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
        head: [["Website", "Completed"]],
        body: Object.entries(byWebsite)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => [name, String(count)]),
        theme: "grid",
        headStyles: {
          fillColor: [245, 198, 28],
          textColor: [31, 31, 31],
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 140 },
          1: { cellWidth: 42 },
        },
      });

      const tasksY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Completed Articles", margin, tasksY);

      autoTable(doc, {
        startY: tasksY + 5,
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
        head: [["Employee", "Date", "Website", "Category", "Published URL"]],
        body: tasks.map((t) => [
          t.employee,
          t.completed,
          t.website,
          t.category,
          t.publishedUrl || "-",
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
          0: { cellWidth: 34 },
          1: { cellWidth: 30 },
          2: { cellWidth: 38 },
          3: { cellWidth: 34 },
          4: { cellWidth: 46 },
        },
      });

      doc.save(`admin-report-${start}-to-${end}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={download} disabled={exporting}>
      {exporting ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Download size={18} />
      )}
      {exporting ? "Generating..." : "Download PDF"}
    </Button>
  );
}
