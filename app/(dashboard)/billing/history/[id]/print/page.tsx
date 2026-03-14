"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { getBillById } from "@/services/bills";
import { formatDateTime } from "@/utils/format";
import type { Bill } from "@/types";

const FACTORY = {
  name: "Sharma Ice Cream Factory",
  address: "123 Industrial Area, Phase 2, Delhi - 110045",
  phone: "+91 98765 00000",
  gstNumber: "07AABCS1234M1Z1",
};

export default function PrintInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBillById(id).then((b) => { setBill(b ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!bill) return <div className="p-8">Invoice not found.</div>;

  return (
    <>
      <div className="invoice-print bg-white p-10 text-slate-800">
        <header className="border-b-2 border-slate-900 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">{FACTORY.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{FACTORY.address}</p>
          <p className="text-sm text-slate-600">Ph: {FACTORY.phone} | GST: {FACTORY.gstNumber}</p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bill To</p>
            <p className="mt-1 font-semibold">{bill.vendorName}</p>
            <p className="text-sm">ID: {bill.vendorId}</p>
            {bill.vendorPhone && <p className="text-sm">{bill.vendorPhone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice</p>
            <p className="mt-1 font-mono font-semibold">{bill.id}</p>
            <p className="text-sm text-slate-600">Date: {formatDateTime(bill.createdAt || bill.date)}</p>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              <th className="py-3 text-left font-semibold">Product</th>
              <th className="py-3 text-center font-semibold">Qty</th>
              <th className="py-3 text-right font-semibold">Unit Price</th>
              <th className="py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((i) => (
              <tr key={i.productId} className="border-b border-slate-100">
                <td className="py-3">{i.productName}</td>
                <td className="py-3 text-center">{i.quantity}</td>
                <td className="py-3 text-right">₹{i.price.toFixed(2)}</td>
                <td className="py-3 text-right">₹{i.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-56 space-y-1 text-right text-sm">
            <p className="flex justify-between"><span className="text-slate-600">Subtotal</span> ₹{bill.subtotal.toFixed(2)}</p>
            {bill.discountPercent != null && bill.discountPercent > 0 && (
              <p className="flex justify-between"><span className="text-slate-600">Discount ({bill.discountPercent}%)</span> −₹{(bill.discountAmount ?? 0).toFixed(2)}</p>
            )}
            {(bill.lumpSumDiscount ?? 0) > 0 && (
              <p className="flex justify-between"><span className="text-slate-600">Lump sum discount</span> −₹{(bill.lumpSumDiscount ?? 0).toFixed(2)}</p>
            )}
            {bill.gstPercent != null && bill.gstAmount != null && (
              <p className="flex justify-between"><span className="text-slate-600">GST ({bill.gstPercent}%)</span> ₹{bill.gstAmount.toFixed(2)}</p>
            )}
            <p className="border-t border-slate-300 pt-2 text-base font-bold">Grand Total: ₹{bill.total.toFixed(2)}</p>
          </div>
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          Thank you for your business. — {FACTORY.name}
        </footer>
      </div>

      <div className="no-print fixed bottom-6 right-6">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-white shadow-lg hover:bg-sky-700"
        >
          <Printer className="h-5 w-5" /> Print Invoice
        </button>
      </div>
    </>
  );
}
