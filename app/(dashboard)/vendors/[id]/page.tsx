"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, IndianRupee, Calendar, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import type { Vendor } from "@/types";
import type { Bill } from "@/types";
import { getVendorById } from "@/services/vendors";
import { getVendorBills, getBillsFiltered } from "@/services/bills";
import { formatDateTime } from "@/utils/format";

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [vendor, setVendor] = useState<Vendor | null | undefined>(undefined);
  const [vendorBillsAll, setVendorBillsAll] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendorById(id).then((v) => { setVendor(v ?? null); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getVendorBills(id).then(setVendorBillsAll);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getBillsFiltered({
      vendorId: id,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      invoiceNumber: invoiceSearch || undefined,
    }).then(setFilteredBills);
  }, [id, dateFrom, dateTo, invoiceSearch]);

  const totalOrders = vendorBillsAll.length;
  const totalBusiness = vendorBillsAll.reduce((s, b) => s + b.total, 0);
  const totalPaid = vendorBillsAll.reduce((s, b) => s + (b.amountPaid ?? 0), 0);
  const amountDue = vendorBillsAll.reduce((s, b) => s + Math.max(0, b.total - (b.amountPaid ?? 0)), 0);
  const lastOrder = vendorBillsAll[0]?.createdAt || vendorBillsAll[0]?.date;

  const billColumns = [
    { key: "id", header: "Invoice ID" },
    { key: "date", header: "Date", render: (row: { date: string; createdAt?: string }) => formatDateTime(row.createdAt || row.date) },
    {
      key: "total",
      header: "Amount",
      render: (row: { total: number }) => `₹${row.total.toLocaleString("en-IN")}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row: { status: string }) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          row.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row: { id: string }) => (
        <Link href={`/billing/history/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">Loading...</div>
    );
  }

  if (!vendor) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Vendor not found</p>
        <Link href="/vendors" className="mt-4 inline-block text-sky-600 hover:underline">Back to Vendors</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{vendor.name}</h1>
          <p className="text-slate-500">{vendor.shopName} • {vendor.id}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-xl font-bold text-slate-800">{totalOrders}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Business</p>
              <p className="text-xl font-bold text-slate-800">₹{totalBusiness.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Paid</p>
              <p className="text-xl font-bold text-slate-800">₹{totalPaid.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Due</p>
              <p className="text-xl font-bold text-slate-800">₹{amountDue.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Last Order</p>
              <p className="text-lg font-bold text-slate-800">{lastOrder ? formatDateTime(lastOrder) : "—"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-slate-800">Vendor Details</h3>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Vendor ID</dt><dd className="font-medium">{vendor.id}</dd></div>
          <div><dt className="text-sm text-slate-500">Phone</dt><dd className="font-medium">{vendor.phone}</dd></div>
          <div><dt className="text-sm text-slate-500">Shop</dt><dd className="font-medium">{vendor.shopName}</dd></div>
          <div><dt className="text-sm text-slate-500">GST</dt><dd className="font-medium">{vendor.gstNumber || "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-slate-500">Address</dt><dd className="font-medium">{vendor.address}</dd></div>
          {vendor.notes && <div className="sm:col-span-2"><dt className="text-sm text-slate-500">Notes</dt><dd className="font-medium">{vendor.notes}</dd></div>}
        </dl>
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold text-slate-800">Billing History</h3>
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Invoice No.</label>
            <input value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder="Search" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <Table columns={billColumns} data={filteredBills} keyExtractor={(r) => r.id} emptyMessage="No bills yet" />
      </Card>
    </motion.div>
  );
}
