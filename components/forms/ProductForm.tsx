"use client";

import type { Product, ProductCategory } from "@/types";

const CATEGORIES: ProductCategory[] = ["Cone", "Cup", "Stick", "Family Pack", "Bulk"];

interface ProductFormProps {
  initial?: Partial<Product>;
  onSubmit: (data: Omit<Product, "id">) => void;
  onCancel: () => void;
}

const empty = {
  name: "",
  flavor: "",
  category: "Cone" as ProductCategory,
  price: 0,
  currentStock: 0,
};

export function ProductForm({ initial, onSubmit, onCancel }: ProductFormProps) {
  const data = { ...empty, ...initial };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";
    const payload = {
      name: get("name").trim(),
      flavor: get("flavor").trim(),
      category: (form.elements.namedItem("category") as HTMLSelectElement)?.value as ProductCategory,
      price: parseFloat(get("price")) || 0,
      currentStock: parseInt(get("stock"), 10) || 0,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Product Name</label>
        <input name="name" defaultValue={data.name} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Flavor</label>
        <input name="flavor" defaultValue={data.flavor} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Category</label>
        <select name="category" defaultValue={data.category} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Price (₹)</label>
          <input name="price" type="number" min={0} step={0.01} defaultValue={data.price} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Current Stock</label>
          <input name="stock" type="number" min={0} defaultValue={data.currentStock} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">Save</button>
      </div>
    </form>
  );
}
