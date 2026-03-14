"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { ProductForm } from "@/components/forms/ProductForm";
import { useToast } from "@/components/providers/ToastProvider";
import type { Product, ProductCategory } from "@/types";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/services/products";

const CATEGORIES: ProductCategory[] = ["Cone", "Cup", "Stick", "Family Pack", "Bulk"];

export default function ProductsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    getProducts().then((p) => { setList(p); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let out = list;
    if (category) out = out.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.flavor?.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }
    return out;
  }, [list, search, category]);

  const handleAdd = async (data: Omit<Product, "id">) => {
    await addProduct(data);
    setModal(null);
    const next = await getProducts();
    setList(next);
    toast.success("Product added");
  };

  const handleEdit = async (data: Omit<Product, "id">) => {
    if (!editing) return;
    await updateProduct(editing.id, data);
    setModal(null);
    setEditing(null);
    const next = await getProducts();
    setList(next);
    toast.success("Product updated");
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete product ${p.name}?`)) return;
    await deleteProduct(p.id);
    const next = await getProducts();
    setList(next);
    toast.success("Product deleted");
  };

  const columns = [
    { key: "id", header: "Product ID", sortable: true },
    { key: "name", header: "Name", sortable: true },
    { key: "flavor", header: "Flavor", sortable: true },
    { key: "category", header: "Category", sortable: true },
    { key: "price", header: "Price", sortable: true, render: (row: Product) => `₹${row.price}` },
    { key: "currentStock", header: "Stock", sortable: true },
    {
      key: "actions",
      header: "Actions",
      render: (row: Product) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setEditing(row); setModal("edit"); }}>
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
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500">Manage ice cream products</p>
        </div>
        <Card><div className="py-12 text-center text-slate-500">Loading...</div></Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500">Manage ice cream products</p>
        </div>
        <Button onClick={() => setModal("add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory((e.target.value || "") as ProductCategory | "")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} emptyMessage="No products found" pageSize={8} />
      </Card>

      <Modal open={modal !== null} onClose={() => { setModal(null); setEditing(null); }} title={modal === "add" ? "Add Product" : "Edit Product"}>
        {modal === "add" && <ProductForm onSubmit={handleAdd} onCancel={() => setModal(null)} />}
        {modal === "edit" && editing && <ProductForm initial={editing} onSubmit={handleEdit} onCancel={() => { setModal(null); setEditing(null); }} />}
      </Modal>
    </motion.div>
  );
}
