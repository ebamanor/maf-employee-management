"use client";

import { useEffect, useState } from "react";
import { getEmployeeWork } from "@/lib/actions";
import { BarChart3, Calendar } from "lucide-react";

export function EmployeeWorkChart() {
  const [mode, setMode] = useState<"day" | "month">("day");
  const [value, setValue] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await getEmployeeWork(mode, value);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [mode, value]);

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h2 className="flex shrink-0 items-center gap-2 text-lg font-semibold whitespace-nowrap">
          <BarChart3 size={20} /> Employee Work
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as "day" | "month");
              setValue(
                e.target.value === "day"
                  ? new Date().toISOString().split("T")[0]
                  : new Date().toISOString().slice(0, 7)
              );
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="day">By Day</option>
            <option value="month">By Month</option>
          </select>
          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type={mode === "day" ? "date" : "month"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-[var(--muted-foreground)]">
          Loading...
        </p>
      ) : data.length === 0 ? (
        <p className="py-12 text-center text-[var(--muted-foreground)]">
          No completed work for the selected {mode}.
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((d) => (
            <div key={d.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{d.name}</span>
                <span className="text-[var(--muted-foreground)]">
                  {d.count} posts
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
