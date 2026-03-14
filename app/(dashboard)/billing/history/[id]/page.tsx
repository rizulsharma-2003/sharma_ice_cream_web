"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, MessageCircle, Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getBillById, updateBillAmountPaid } from "@/services/bills";
import { formatDateTime } from "@/utils/format";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";
import { openWhatsAppInvoiceShare } from "@/utils/whatsapp";
import { useToast } from "@/components/providers/ToastProvider";
import type { Bill } from "@/types";

export default function BillDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params.id as string;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBillById(id).then((b) => { setBill(b ?? null); setLoading(false); });
  }, [id]);

  const displayStatus = bill ? (bill.total - (bill.amountPaid ?? 0) <= 0 ? "paid" : bill.status) : "pending";

  const handleAmountPaidChange = async (value: number) => {
    await updateBillAmountPaid(id, value);
    const next = await getBillById(id);
    setBill(next ?? null);
    toast.success("Payment updated");
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading...</div>;
  }

  if (!bill) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Invoice not found</p>
        <Link href="/billing/history" className="mt-4 inline-block text-sky-600 hover:underline">Back to History</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadInvoicePDF(bill)}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
          <Link href={`/billing/history/${bill.id}/print`} target="_blank" rel="noopener">
            <Button variant="secondary"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </Link>
          <Button variant="secondary" onClick={() => openWhatsAppInvoiceShare(bill, { onFallback: () => toast.info("PDF downloaded. Attach it in WhatsApp.") })}><MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp</Button>
        </div>
      </div>

      <Card>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{bill.id}</h1>
            <p className="text-slate-500">Date: {formatDateTime(bill.createdAt || bill.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">Status</label>
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                displayStatus === "paid" ? "bg-emerald-100 text-emerald-700" : displayStatus === "overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {displayStatus === "paid" ? "Paid" : displayStatus === "overdue" ? "Overdue" : "Pending"}
            </span>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Vendor</p>
            <p className="font-medium">{bill.vendorName}</p>
            <p className="text-sm text-slate-600">{bill.vendorId}</p>
            {bill.vendorPhone && <p className="text-sm text-slate-600">{bill.vendorPhone}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50"><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Price</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
            <tbody>
              {bill.items.map((i) => (
                <tr key={i.productId} className="border-b border-slate-100">
                  <td className="px-4 py-3">{i.productName}</td>
                  <td className="px-4 py-3">{i.quantity}</td>
                  <td className="px-4 py-3">₹{i.price}</td>
                  <td className="px-4 py-3 text-right">₹{i.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-slate-200 p-4 text-right space-y-1">
            <p>Subtotal: ₹{bill.subtotal.toFixed(2)}</p>
            {bill.discountPercent != null && bill.discountPercent > 0 && (
              <p>Discount ({bill.discountPercent}%): −₹{(bill.discountAmount ?? 0).toFixed(2)}</p>
            )}
            {(bill.lumpSumDiscount ?? 0) > 0 && (
              <p>Lump sum discount: −₹{(bill.lumpSumDiscount ?? 0).toFixed(2)}</p>
            )}
            {bill.gstPercent != null && bill.gstAmount != null && (
              <p>GST ({bill.gstPercent}%): ₹{bill.gstAmount.toFixed(2)}</p>
            )}
            <p className="text-lg font-bold">Grand Total: ₹{bill.total.toFixed(2)}</p>
            <div className="mt-2 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-2">
              <label className="text-sm text-slate-500">Amount Paid (₹)</label>
              <input
                type="number"
                min={0}
                max={bill.total}
                step={0.01}
                value={bill.amountPaid ?? 0}
                onChange={(e) => handleAmountPaidChange(parseFloat(e.target.value) || 0)}
                className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <span className="text-sm font-semibold text-slate-700">
                Due: ₹{(bill.total - (bill.amountPaid ?? 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
