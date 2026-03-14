"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { getProductionLogs, addProductionLog } from "@/services/production";
import { formatDateTime } from "@/utils/format";
import type { ProductionLog } from "@/types";

export default function ProductionPage() {
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [flavor, setFlavor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getProductionLogs().then((l) => { setLogs(l); setLoading(false); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (flavor.trim() && qty > 0) {
      await addProductionLog({ date, flavor: flavor.trim(), quantity: qty, notes: notes.trim() });
      const next = await getProductionLogs();
      setLogs(next);
      setModalOpen(false);
      setFlavor("");
      setQuantity("");
      setNotes("");
    }
  };

  const columns = [
    { key: "date", header: "Date", render: (row: ProductionLog) => formatDateTime(row.createdAt || row.date) },
    { key: "flavor", header: "Flavor" },
    { key: "quantity", header: "Quantity" },
    { key: "batchNumber", header: "Batch" },
    { key: "notes", header: "Notes" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Production Log</h1>
          <p className="text-slate-500">Track factory production</p>
        </div>
        <Card><div className="py-12 text-center text-slate-500">Loading...</div></Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Production Log</h1>
          <p className="text-slate-500">Track factory production</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={logs} keyExtractor={(r) => r.id} emptyMessage="No production entries" />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Production Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Flavor</label>
            <input value={flavor} onChange={(e) => setFlavor(e.target.value)} placeholder="e.g. Vanilla" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Quantity</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
