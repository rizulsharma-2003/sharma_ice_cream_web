"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Plus, Trash2, FileText, Download, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Vendor } from "@/types";
import type { Bill } from "@/types";
import type { BillItem } from "@/types";
import { getVendors } from "@/services/vendors";
import { getProducts } from "@/services/products";
import { createBill } from "@/services/bills";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";
import { openWhatsAppInvoiceShare } from "@/utils/whatsapp";
import { formatDateTime } from "@/utils/format";
import { useToast } from "@/components/providers/ToastProvider";

const STEPS = ["Select Vendor", "Add Products", "Bill Summary", "Generate Bill"];

export default function BillingPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [lumpSumDiscount, setLumpSumDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [createdBill, setCreatedBill] = useState<Bill | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVendors(), getProducts()]).then(([v, p]) => {
      setVendors(v);
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalDiscount = discountAmount + lumpSumDiscount;
  const total = Math.round((subtotal - totalDiscount) * 100) / 100;
  const dueAmount = Math.max(0, total - amountPaid);

  const addItem = (productId: string, qty: number) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const existing = items.find((i) => i.productId === productId);
    const newQty = (existing?.quantity ?? 0) + qty;
    if (newQty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    const totalItem = p.price * newQty;
    setItems((prev) => {
      const rest = prev.filter((i) => i.productId !== productId);
      return [...rest, { productId: p.id, productName: p.name, quantity: newQty, price: p.price, total: totalItem }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleGenerate = async () => {
    if (!vendor || items.length === 0) return;
    const bill = await createBill({
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      items,
      discountPercent,
      lumpSumDiscount,
      amountPaid,
    });
    setCreatedBill(bill);
    setStep(4);
    const updated = await getProducts();
    setProducts(updated);
    toast.success("Invoice created successfully");
  };

  const draftBill: Bill | null = createdBill ?? (vendor && items.length > 0 ? {
    id: "PREVIEW",
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorPhone: vendor.phone,
    date: new Date().toISOString().slice(0, 10),
    items,
    subtotal,
    discountPercent,
    discountAmount,
    lumpSumDiscount: lumpSumDiscount || undefined,
    total,
    amountPaid,
    status: amountPaid >= total ? "paid" : "pending",
    createdAt: new Date().toISOString(),
  } : null);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Bill</h1>
          <p className="text-slate-500">Vendor billing in 4 steps</p>
        </div>
        <Card><div className="py-12 text-center text-slate-500">Loading...</div></Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Create Bill</h1>
        <p className="text-slate-500">Vendor billing in 4 steps</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
              step > i + 1 ? "bg-sky-600 text-white" : step === i + 1 ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-500"
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm ${step >= i + 1 ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
          </div>
        ))}
      </div>

      <Card>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="font-semibold text-slate-800">Select Vendor</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {vendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVendor(v)}
                    className={`rounded-xl border p-4 text-left transition ${
                      vendor?.id === v.id ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-slate-800">{v.name}</p>
                    <p className="text-sm text-slate-500">{v.shopName} • {v.id}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => vendor && setStep(2)} disabled={!vendor}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="font-semibold text-slate-800">Add Products</h3>
              <p className="text-sm text-slate-500">Vendor: {vendor?.name}</p>
              <AddProductRow products={products} itemsInCart={items} onAdd={addItem} />
              <div className="rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-slate-50"><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">Total</th><th /></tr></thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.productId} className="border-b border-slate-100">
                        <td className="px-3 py-2">{i.productName}</td>
                        <td className="px-3 py-2">{i.quantity}</td>
                        <td className="px-3 py-2">₹{i.price}</td>
                        <td className="px-3 py-2">₹{i.total}</td>
                        <td className="px-3 py-2">
                          <button type="button" onClick={() => removeItem(i.productId)} className="text-red-500 hover:underline"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
                <Button onClick={() => setStep(3)} disabled={items.length === 0}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="font-semibold text-slate-800">Bill Summary</h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p><span className="text-slate-500">Vendor:</span> {vendor?.name} ({vendor?.id})</p>
                <p className="text-slate-500 text-sm">Date: {formatDateTime(new Date().toISOString())}</p>
              </div>
              <div className="rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-slate-50"><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">Total</th></tr></thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.productId} className="border-b border-slate-100">
                        <td className="px-3 py-2">{i.productName}</td>
                        <td className="px-3 py-2">{i.quantity}</td>
                        <td className="px-3 py-2">₹{i.price}</td>
                        <td className="px-3 py-2">₹{i.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-200 p-3 text-right space-y-1">
                  <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                  {(discountPercent > 0 || lumpSumDiscount > 0) && (
                    <>
                      {discountPercent > 0 && <p>Discount ({discountPercent}%): −₹{discountAmount.toFixed(2)}</p>}
                      {lumpSumDiscount > 0 && <p>Lump sum discount: −₹{lumpSumDiscount.toFixed(2)}</p>}
                    </>
                  )}
                  <p className="font-bold">Grand Total: ₹{total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-slate-600">Discount %</label>
                  <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)} className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-slate-600">Lump sum (₹)</label>
                  <input type="number" min={0} step={0.01} value={lumpSumDiscount || ""} onChange={(e) => setLumpSumDiscount(parseFloat(e.target.value) || 0)} placeholder="0" className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Payment</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Amount Paid (₹)</label>
                    <input type="number" min={0} step={0.01} value={amountPaid || ""} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} placeholder="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-500">Due Amount</label>
                    <p className="text-lg font-bold text-slate-800">₹{dueAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
                <Button onClick={handleGenerate}>Generate Bill</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && draftBill && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="font-semibold text-slate-800">Bill Generated</h3>
              <p className="text-sm text-slate-600">Invoice {draftBill.id} saved to billing history.</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setPreviewOpen(true)}><FileText className="mr-2 h-4 w-4" /> Preview Invoice</Button>
                <Button variant="secondary" onClick={() => downloadInvoicePDF(draftBill)}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                <Button variant="secondary" onClick={() => openWhatsAppInvoiceShare(draftBill, { onFallback: () => toast.info("PDF downloaded. Attach it in WhatsApp.") })}><MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp</Button>
                <Button onClick={() => router.push("/billing/history")}>Done & Go to History</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Invoice Preview">
        {draftBill && (
            <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p><strong>{draftBill.vendorName}</strong> • {draftBill.id}</p>
              <p className="text-slate-500">{formatDateTime(draftBill.createdAt || draftBill.date)}</p>
              <table className="mt-2 w-full">
                {draftBill.items.map((i) => (
                  <tr key={i.productId}><td>{i.productName} × {i.quantity}</td><td className="text-right">₹{i.total}</td></tr>
                ))}
                <tr><td>Subtotal</td><td className="text-right">₹{draftBill.subtotal.toFixed(2)}</td></tr>
                {(draftBill.discountPercent ?? 0) > 0 && (
                  <tr><td>Discount ({draftBill.discountPercent}%)</td><td className="text-right">−₹{(draftBill.discountAmount ?? 0).toFixed(2)}</td></tr>
                )}
                {(draftBill.lumpSumDiscount ?? 0) > 0 && (
                  <tr><td>Lump sum discount</td><td className="text-right">−₹{(draftBill.lumpSumDiscount ?? 0).toFixed(2)}</td></tr>
                )}
                <tr><td><strong>Total</strong></td><td className="text-right font-bold">₹{draftBill.total.toFixed(2)}</td></tr>
                {(draftBill.amountPaid ?? 0) > 0 && (
                  <>
                    <tr><td>Amount Paid</td><td className="text-right">₹{(draftBill.amountPaid ?? 0).toFixed(2)}</td></tr>
                    <tr><td>Due</td><td className="text-right font-semibold">₹{(draftBill.total - (draftBill.amountPaid ?? 0)).toFixed(2)}</td></tr>
                  </>
                )}
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Close</Button>
              <Button onClick={() => { downloadInvoicePDF(draftBill); setPreviewOpen(false); }}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

function AddProductRow({
  products,
  itemsInCart,
  onAdd,
}: {
  products: { id: string; name: string; price: number; currentStock: number }[];
  itemsInCart: { productId: string; quantity: number }[];
  onAdd: (productId: string, qty: number) => void;
}) {
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);

  const selected = products.find((p) => p.id === productId);
  const inCart = selected ? itemsInCart.find((i) => i.productId === selected.id)?.quantity ?? 0 : 0;
  const left = selected ? Math.max(0, selected.currentStock - inCart) : 0;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-slate-500">Product</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm min-w-[180px]">
          <option value="">Select</option>
          {products.map((p) => {
            const cartQty = itemsInCart.find((i) => i.productId === p.id)?.quantity ?? 0;
            const stockLeft = Math.max(0, p.currentStock - cartQty);
            return (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.price} ({stockLeft} left)
              </option>
            );
          })}
        </select>
        {selected && (
          <p className="mt-1 text-xs">
            <span className="font-medium text-red-600">({left} left in stock)</span>
          </p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">Qty</label>
        <input type="number" min={1} max={left} value={left < 1 ? 0 : qty} onChange={(e) => setQty(Math.min(Math.max(parseInt(e.target.value, 10) || 0, 0), left))} disabled={left < 1} className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-60" />
      </div>
      <Button size="sm" onClick={() => { if (productId && left >= 1) { onAdd(productId, Math.min(qty, left)); setProductId(""); setQty(1); } }} disabled={!productId || left < 1}>
        <Plus className="mr-1 h-4 w-4" /> Add
      </Button>
    </div>
  );
}
