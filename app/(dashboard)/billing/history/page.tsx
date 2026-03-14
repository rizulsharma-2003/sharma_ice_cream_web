"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Download, Eye, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import type { Bill } from "@/types";
import type { Vendor } from "@/types";
import { getBillsFiltered } from "@/services/bills";
import { getVendors } from "@/services/vendors";
import { formatDateTime } from "@/utils/format";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";
import { openWhatsAppInvoiceShare } from "@/utils/whatsapp";
import { useToast } from "@/components/providers/ToastProvider";

export default function BillingHistoryPage() {
  const toast = useToast();
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "pending" | "overdue">("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendors().then(setVendors);
  }, []);

  useEffect(() => {
    setLoading(true);
    getBillsFiltered({
      vendorId: vendorId || undefined,
      vendorName: vendorName || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      amountMin: amountMin ? parseFloat(amountMin) : undefined,
      amountMax: amountMax ? parseFloat(amountMax) : undefined,
      invoiceNumber: invoiceSearch || undefined,
    })
      .then(setBills)
      .finally(() => setLoading(false));
  }, [vendorId, vendorName, dateFrom, dateTo, amountMin, amountMax, invoiceSearch]);

  // Paid only when ₹0 due; any due amount = Pending (or Overdue if past due date)
  const displayStatus = (row: Bill): "paid" | "pending" | "overdue" => {
    const due = row.total - (row.amountPaid ?? 0);
    if (due <= 0) return "paid";
    return row.status === "overdue" ? "overdue" : "pending";
  };

  const filteredBills = statusFilter
    ? bills.filter((b) => displayStatus(b) === statusFilter)
    : bills;

  const columns = [
    { key: "id", header: "Invoice ID", sortable: true },
    { key: "vendorName", header: "Vendor", sortable: true },
    { key: "vendorId", header: "Vendor ID", sortable: true },
    { key: "date", header: "Date", sortable: true, render: (row: Bill) => formatDateTime(row.createdAt || row.date) },
    { key: "total", header: "Amount", sortable: true, render: (row: Bill) => `₹${row.total.toLocaleString("en-IN")}` },
    {
      key: "due",
      header: "Due",
      render: (row: Bill) => {
        const due = row.total - (row.amountPaid ?? 0);
        return <span className={due > 0 ? "font-medium text-amber-700" : "text-slate-500"}>₹{due.toLocaleString("en-IN")}</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: Bill) => {
        const status = displayStatus(row);
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : status === "overdue"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "paid" ? "Paid" : status === "overdue" ? "Overdue" : "Pending"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: Bill) => (
        <div className="flex gap-2">
          <Link href={`/billing/history/${row.id}`}>
            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => downloadInvoicePDF(row)}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => openWhatsAppInvoiceShare(row, { onFallback: () => toast.info("PDF downloaded. Attach it in WhatsApp.") })}><MessageCircle className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Billing History</h1>
        <p className="text-slate-500">View and filter all invoices</p>
      </div>

      <Card>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Vendor ID</label>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">All</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Vendor Name</label>
            <input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Search name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Amount Min</label>
            <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="₹" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Amount Max</label>
            <input type="number" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="₹" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter((e.target.value || "") as "" | "paid" | "pending" | "overdue")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-slate-500">Invoice Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder="Search invoice ID" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm" />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading...</div>
        ) : (
          <DataTable<Bill> columns={columns} data={filteredBills} keyExtractor={(r) => r.id} emptyMessage="No bills found" pageSize={10} />
        )}
      </Card>
    </motion.div>
  );
}
