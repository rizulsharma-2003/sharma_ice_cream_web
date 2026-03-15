"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { VendorForm } from "@/components/forms/VendorForm";
import { useToast } from "@/components/providers/ToastProvider";
import type { Vendor } from "@/types";
import type { Bill } from "@/types";
import { getVendors, addVendor, updateVendor, deleteVendor } from "@/services/vendors";
import { getBills } from "@/services/bills";

function statsFromBills(bills: Bill[]): Record<string, { totalBusiness: number; totalPaid: number; totalDue: number }> {
  const map: Record<string, { totalBusiness: number; totalPaid: number; totalDue: number }> = {};
  bills.forEach((b) => {
    const id = b.vendorId;
    if (!map[id]) map[id] = { totalBusiness: 0, totalPaid: 0, totalDue: 0 };
    map[id].totalBusiness += b.total;
    map[id].totalPaid += b.amountPaid ?? 0;
    map[id].totalDue += b.total - (b.amountPaid ?? 0);
  });
  return map;
}

export default function VendorsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [list, setList] = useState<Vendor[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Vendor | null>(null);

  useEffect(() => {
    Promise.all([getVendors(), getBills()]).then(([v, b]) => {
      setList(v);
      setBills(b);
      setLoading(false);
    });
  }, []);

  const searchResult = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.shopName?.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q)
    );
  }, [list, search]);

  const statsMap = useMemo(() => statsFromBills(bills), [bills]);

  const handleAdd = async (data: Omit<Vendor, "id" | "createdAt">) => {
    await addVendor(data);
    setModal(null);
    const v = await getVendors();
    setList(v);
    toast.success("Vendor added");
  };

  const handleEdit = async (data: Omit<Vendor, "id" | "createdAt">) => {
    if (!editing) return;
    await updateVendor(editing.id, data);
    setModal(null);
    setEditing(null);
    const v = await getVendors();
    setList(v);
    toast.success("Vendor updated");
  };

  const handleDelete = async (v: Vendor) => {
    if (!confirm(`Delete vendor ${v.name}?`)) return;
    await deleteVendor(v.id);
    const next = await getVendors();
    setList(next);
    const b = await getBills();
    setBills(b);
    toast.success("Vendor deleted");
  };

  const columns = [
    { key: "id", header: "Vendor ID", sortable: true },
    { key: "name", header: "Name", sortable: true },
    { key: "phone", header: "Phone" },
    { key: "shopName", header: "Shop", sortable: true },
    {
      key: "totalBusiness",
      header: "Total Business",
      render: (row: Vendor) => {
        const s = statsMap[row.id];
        return `₹${(s?.totalBusiness ?? 0).toLocaleString("en-IN")}`;
      },
    },
    {
      key: "totalPaid",
      header: "Total Paid",
      render: (row: Vendor) => {
        const s = statsMap[row.id];
        return `₹${(s?.totalPaid ?? 0).toLocaleString("en-IN")}`;
      },
    },
    {
      key: "totalDue",
      header: "Total Due",
      render: (row: Vendor) => {
        const s = statsMap[row.id];
        const due = s?.totalDue ?? 0;
        return <span className={due > 0 ? "font-medium text-amber-700" : ""}>₹{due.toLocaleString("en-IN")}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Vendor) => (
        <div className="flex gap-2">
          <Link href={`/vendors/${row.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(row);
              setModal("edit");
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-slate-500">Manage your vendor network</p>
        </div>
        <Card>
          <div className="py-12 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-slate-500">Manage your vendor network</p>
        </div>
        <Button onClick={() => setModal("add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name, shop, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm"
            />
          </div>
        </div>
        <DataTable columns={columns} data={searchResult} keyExtractor={(r) => r.id} emptyMessage="No vendors found" pageSize={8} />
      </Card>

      <Modal
        open={modal !== null}
        onClose={() => { setModal(null); setEditing(null); }}
        title={modal === "add" ? "Add Vendor" : "Edit Vendor"}
      >
        {modal === "add" && <VendorForm onSubmit={handleAdd} onCancel={() => setModal(null)} />}
        {modal === "edit" && editing && (
          <VendorForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => { setModal(null); setEditing(null); }}
          />
        )}
      </Modal>
    </motion.div>
  );
}
