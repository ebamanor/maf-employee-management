"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paramName?: string;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  paramName,
  onPageChange,
  className,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    if (!paramName) return pathname || "";
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set(paramName, page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const Control = ({
    target,
    icon,
    disabled,
  }: {
    target: number;
    icon: React.ReactNode;
    disabled: boolean;
  }) => {
    const baseClass =
      "inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition hover:bg-[var(--muted)]";

    if (onPageChange) {
      return (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onPageChange(target)}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          {icon}
        </Button>
      );
    }

    if (disabled) {
      return <span className={`${baseClass} opacity-50`}>{icon}</span>;
    }

    return (
      <Link href={buildHref(target)} className={baseClass}>
        {icon}
      </Link>
    );
  };

  return (
    <div
      className={`flex items-center justify-center gap-3 text-sm text-[var(--muted-foreground)] ${
        className ?? ""
      }`}
    >
      <Control
        target={currentPage - 1}
        icon={<ChevronLeft size={16} />}
        disabled={currentPage <= 1}
      />
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Control
        target={currentPage + 1}
        icon={<ChevronRight size={16} />}
        disabled={currentPage >= totalPages}
      />
    </div>
  );
}
