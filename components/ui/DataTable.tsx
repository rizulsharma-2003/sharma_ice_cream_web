"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Table } from "./Table";
import { Pagination } from "./Pagination";

type SortDir = "asc" | "desc" | null;

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data",
  pageSize = 10,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      const as = String(av ?? "");
      const bs = String(bv ?? "");
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize]
  );

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    const nextDir: SortDir = sortKey !== key ? "asc" : sortDir === "asc" ? "desc" : null;
    setSortKey(nextDir ? key : null);
    setSortDir(nextDir);
    setPage(1);
  };

  const tableColumns = columns.map((col) => ({
    key: col.key,
    render: col.render,
    header:
      col.sortable === true ? (
        <button
          type="button"
          onClick={() => handleSort(String(col.key), col.sortable)}
          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-800"
        >
          {col.header}
          {sortKey === col.key && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
        </button>
      ) : (
        <span className="font-semibold text-slate-600">{col.header}</span>
      ),
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="overflow-x-auto">
      <div className="min-w-0 rounded-xl border border-slate-200 bg-white">
        <Table columns={tableColumns} data={paged} keyExtractor={keyExtractor} emptyMessage={emptyMessage} />
        {sorted.length > pageSize && (
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </motion.div>
  );
}
