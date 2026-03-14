import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Bill, BillItem } from "@/types";
import { generateInvoiceId } from "@/utils/id";
import { billToApp, billToFirestore } from "@/lib/firestore-converters";
import { updateProductStock } from "@/services/products";

const COLLECTION = "bills";

const OVERDUE_DAYS = 7;

function isOverdue(bill: Bill): boolean {
  if (bill.status !== "pending") return false;
  const billDate = new Date(bill.date);
  const dueBy = new Date(billDate);
  dueBy.setDate(dueBy.getDate() + OVERDUE_DAYS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueBy.setHours(0, 0, 0, 0);
  return today > dueBy;
}

async function applyOverdue(): Promise<void> {
  const snap = await getDocs(collection(db, COLLECTION));
  const updates: Promise<void>[] = [];
  snap.docs.forEach((d) => {
    const bill = billToApp(d.id, d.data() as Record<string, unknown>);
    if (bill.status === "pending" && isOverdue(bill)) {
      updates.push(updateDoc(doc(db, COLLECTION, d.id), { status: "overdue" }));
    }
  });
  await Promise.all(updates);
}

export async function getBills(): Promise<Bill[]> {
  await applyOverdue();
  const snap = await getDocs(collection(db, COLLECTION));
  const list = snap.docs.map((d) => billToApp(d.id, d.data() as Record<string, unknown>));
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBillById(id: string): Promise<Bill | undefined> {
  await applyOverdue();
  const ref = doc(db, COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return undefined;
  return billToApp(d.id, d.data() as Record<string, unknown>);
}

export async function getVendorBills(vendorId: string): Promise<Bill[]> {
  await applyOverdue();
  const all = await getBills();
  return all.filter((b) => b.vendorId === vendorId);
}

export async function getBillsFiltered(filters: {
  vendorId?: string;
  vendorName?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  invoiceNumber?: string;
}): Promise<Bill[]> {
  let list = await getBills();
  if (filters.vendorId) list = list.filter((b) => b.vendorId === filters.vendorId);
  if (filters.vendorName) {
    const q = filters.vendorName.toLowerCase();
    list = list.filter((b) => b.vendorName.toLowerCase().includes(q));
  }
  if (filters.dateFrom) list = list.filter((b) => b.date >= filters.dateFrom!);
  if (filters.dateTo) list = list.filter((b) => b.date <= filters.dateTo!);
  if (filters.amountMin != null) list = list.filter((b) => b.total >= filters.amountMin!);
  if (filters.amountMax != null) list = list.filter((b) => b.total <= filters.amountMax!);
  if (filters.invoiceNumber) {
    const q = filters.invoiceNumber.toLowerCase();
    list = list.filter((b) => b.id.toLowerCase().includes(q));
  }
  return list;
}

export async function createBill(params: {
  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  items: BillItem[];
  discountPercent?: number;
  lumpSumDiscount?: number;
  amountPaid?: number;
  status?: Bill["status"];
}): Promise<Bill> {
  const subtotal = params.items.reduce((s, i) => s + i.total, 0);
  const discountPercent = params.discountPercent ?? 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100 * 100) / 100;
  const lumpSumDiscount = Math.round((params.lumpSumDiscount ?? 0) * 100) / 100;
  const total = Math.round((subtotal - discountAmount - lumpSumDiscount) * 100) / 100;
  const amountPaid = params.amountPaid ?? 0;
  const existingSnap = await getDocs(collection(db, COLLECTION));
  const existingIds = existingSnap.docs.map((d) => d.id);
  const id = generateInvoiceId(existingIds);
  const date = new Date().toISOString().slice(0, 10);
  const status = amountPaid >= total ? "paid" : (params.status ?? "pending");
  const billData: Omit<Bill, "id" | "createdAt"> = {
    vendorId: params.vendorId,
    vendorName: params.vendorName,
    vendorPhone: params.vendorPhone,
    date,
    items: params.items,
    subtotal,
    discountPercent,
    discountAmount,
    lumpSumDiscount: lumpSumDiscount || undefined,
    total,
    amountPaid,
    status,
  };
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    ...billToFirestore(billData),
    created_at: serverTimestamp(),
  });
  for (const item of params.items) {
    await updateProductStock(item.productId, -item.quantity);
  }
  return {
    id,
    ...billData,
    createdAt: new Date().toISOString(),
  };
}

export async function updateBillStatus(
  id: string,
  status: Bill["status"]
): Promise<Bill | null> {
  const ref = doc(db, COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return null;
  const bill = billToApp(d.id, d.data() as Record<string, unknown>);
  const due = bill.total - (bill.amountPaid ?? 0);
  if (status === "paid" && due > 0) return null;
  await updateDoc(ref, { status });
  const updated = await getDoc(ref);
  return billToApp(updated.id, updated.data() as Record<string, unknown>);
}

export async function updateBillAmountPaid(id: string, amountPaid: number): Promise<Bill | null> {
  const ref = doc(db, COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return null;
  const bill = billToApp(d.id, d.data() as Record<string, unknown>);
  const clamped = Math.max(0, Math.min(amountPaid, bill.total));
  const newStatus = clamped >= bill.total ? "paid" : bill.status;
  await updateDoc(ref, { amount_paid: clamped, status: newStatus });
  const updated = await getDoc(ref);
  return billToApp(updated.id, updated.data() as Record<string, unknown>);
}

export async function getVendorDue(vendorId: string): Promise<number> {
  const list = await getBills();
  return list
    .filter((b) => b.vendorId === vendorId && (b.status === "pending" || b.status === "overdue"))
    .reduce((s, b) => s + (b.total - (b.amountPaid ?? 0)), 0);
}

export async function getVendorStats(
  vendorId: string
): Promise<{ totalBusiness: number; totalPaid: number; totalDue: number }> {
  const list = await getBills();
  const bills = list.filter((b) => b.vendorId === vendorId);
  const totalBusiness = bills.reduce((s, b) => s + b.total, 0);
  const totalPaid = bills.reduce((s, b) => s + (b.amountPaid ?? 0), 0);
  const totalDue = await getVendorDue(vendorId);
  return { totalBusiness, totalPaid, totalDue };
}
