"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, History, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { getStockItems, getLowStockItems, getStockHistory, addStock, deductStock } from "@/services/stock";
import { formatDateTime } from "@/utils/format";
import type { StockItem } from "@/types";
import type { StockHistoryEntry } from "@/types";

export default function StockPage() {
  const [modal, setModal] = useState<"add" | "deduct" | "history" | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [history, setHistory] = useState<StockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = () => {
    Promise.all([getStockItems(), getLowStockItems()]).then(([i, l]) => {
      setItems(i);
      setLowStock(l);
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getStockItems(), getLowStockItems()]).then(([i, l]) => {
      setItems(i);
      setLowStock(l);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedItem?.id) {
      setHistory([]);
      return;
    }
    getStockHistory(selectedItem.id).then(setHistory);
  }, [selectedItem?.id, items]);

  const openAdd = (item: StockItem) => {
    setSelectedItem(item);
    setQty("");
    setNotes("");
    setModal("add");
  };

  const openDeduct = (item: StockItem) => {
    setSelectedItem(item);
    setQty("");
    setNotes("");
    setModal("deduct");
  };

  const openHistory = (item: StockItem) => {
    setSelectedItem(item);
    setModal("history");
  };

  const handleAdd = async () => {
    if (!selectedItem || !qty) return;
    const n = parseInt(qty, 10);
    if (n > 0) {
      await addStock(selectedItem.id, n, notes);
      loadItems();
    }
    setModal(null);
    setSelectedItem(null);
  };

  const handleDeduct = async () => {
    if (!selectedItem || !qty) return;
    const n = parseInt(qty, 10);
    if (n > 0) {
      await deductStock(selectedItem.id, n, notes);
      loadItems();
    }
    setModal(null);
    setSelectedItem(null);
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "category", header: "Category" },
    { key: "quantity", header: "Qty" },
    { key: "unit", header: "Unit" },
    { key: "minStock", header: "Min" },
    {
      key: "status",
      header: "Status",
      render: (row: StockItem) =>
        row.quantity <= row.minStock ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
            <AlertTriangle className="h-3 w-3" /> Low
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">OK</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: StockItem) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openAdd(row)}><Plus className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => openDeduct(row)}><Minus className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => openHistory(row)}><History className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Management</h1>
          <p className="text-slate-500">Raw materials & finished products</p>
        </div>
        <Card><div className="py-12 text-center text-slate-500">Loading...</div></Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Management</h1>
          <p className="text-slate-500">Raw materials & finished products</p>
        </div>
        {lowStock.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{lowStock.length} low stock alert(s)</span>
          </div>
        )}
      </div>

      <Card>
        <Table columns={columns} data={items} keyExtractor={(r) => r.id} emptyMessage="No stock items" />
      </Card>

      <Modal open={modal === "add"} onClose={() => setModal(null)} title="Add Stock">
        {selectedItem && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{selectedItem.name} (current: {selectedItem.quantity} {selectedItem.unit})</p>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Quantity</label>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modal === "deduct"} onClose={() => setModal(null)} title="Deduct Stock">
        {selectedItem && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{selectedItem.name} (current: {selectedItem.quantity} {selectedItem.unit})</p>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Quantity</label>
              <input type="number" min={1} max={selectedItem.quantity} value={qty} onChange={(e) => setQty(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button onClick={handleDeduct}>Deduct</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modal === "history"} onClose={() => setModal(null)} title={`Stock History${selectedItem ? ` — ${selectedItem.name}` : ""}`}>
        <div className="max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-slate-500 py-4">No history</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50"><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">From → To</th><th className="px-3 py-2 text-left">Notes</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{formatDateTime(h.date)}</td>
                    <td className="px-3 py-2">{h.type}</td>
                    <td className="px-3 py-2">{h.quantity}</td>
                    <td className="px-3 py-2">{h.previousQty} → {h.newQty}</td>
                    <td className="px-3 py-2">{h.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
