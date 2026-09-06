"use client";

import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";

export function PrintButton({ label = "Export to PDF" }: { label?: string }) {
  return (
    <Button onClick={() => window.print()} className="print:hidden">
      <Printer size={18} /> {label}
    </Button>
  );
}
