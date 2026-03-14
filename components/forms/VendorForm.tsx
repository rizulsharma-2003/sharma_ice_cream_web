"use client";

import type { Vendor } from "@/types";

interface VendorFormProps {
  initial?: Partial<Vendor>;
  onSubmit: (data: Omit<Vendor, "id" | "createdAt">) => void;
  onCancel: () => void;
}

const empty = {
  name: "",
  phone: "",
  shopName: "",
  address: "",
  gstNumber: "",
  notes: "",
};

export function VendorForm({ initial, onSubmit, onCancel }: VendorFormProps) {
  const data = { ...empty, ...initial };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";
    const payload = {
      name: get("name").trim(),
      phone: get("phone").trim(),
      shopName: get("shopName").trim(),
      address: get("address").trim(),
      gstNumber: get("gstNumber").trim(),
      notes: get("notes").trim(),
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Vendor Name</label>
        <input name="name" defaultValue={data.name} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Phone</label>
        <input name="phone" type="tel" defaultValue={data.phone} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Shop Name</label>
        <input name="shopName" defaultValue={data.shopName} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Address</label>
        <textarea name="address" defaultValue={data.address} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">GST Number</label>
        <input name="gstNumber" defaultValue={data.gstNumber} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Notes</label>
        <textarea name="notes" defaultValue={data.notes} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
          Save
        </button>
      </div>
    </form>
  );
}
