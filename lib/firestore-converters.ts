import type { Timestamp } from "firebase/firestore";
import type { Vendor, Product, Bill, BillItem, StockItem, StockHistoryEntry, ProductionLog } from "@/types";

function tsToString(ts: Timestamp | unknown): string {
  if (!ts || typeof (ts as Timestamp).toDate !== "function") return "";
  return (ts as Timestamp).toDate().toISOString().slice(0, 10);
}

function tsToFullString(ts: Timestamp | unknown): string {
  if (!ts || typeof (ts as Timestamp).toDate !== "function") return "";
  return (ts as Timestamp).toDate().toISOString();
}

// Vendor: collection "Vendor", doc id = VDN-0001
export function vendorToApp(id: string, d: Record<string, unknown>): Vendor {
  return {
    id,
    name: (d.name as string) ?? "",
    phone: (d.phone as string) ?? "",
    shopName: (d.shop_name as string) ?? "",
    address: (d.address as string) ?? "",
    gstNumber: (d.gst_number as string) ?? "",
    notes: (d.notes as string) ?? "",
    createdAt: (tsToFullString(d.created_at) || (d.created_at as string)) ?? "",
  };
}

export function vendorToFirestore(v: Omit<Vendor, "id" | "createdAt">): Record<string, unknown> {
  return {
    name: v.name,
    phone: v.phone,
    shop_name: v.shopName,
    address: v.address,
    gst_number: v.gstNumber,
    notes: v.notes,
  };
}

// Products: collection "Products", doc id = PRD-001
export function productToApp(id: string, d: Record<string, unknown>): Product {
  return {
    id,
    name: (d.name as string) ?? "",
    flavor: (d.flavor as string) ?? "",
    category: (d.category as Product["category"]) ?? "Cone",
    price: Number(d.price) ?? 0,
    currentStock: Number(d.current_stock) ?? 0,
  };
}

export function productToFirestore(p: Omit<Product, "id">): Record<string, unknown> {
  return {
    name: p.name,
    flavor: p.flavor,
    category: p.category,
    price: p.price,
    current_stock: p.currentStock,
  };
}

// bills: items array with snake_case
function billItemToApp(o: Record<string, unknown>): BillItem {
  return {
    productId: (o.product_id as string) ?? "",
    productName: (o.product_name as string) ?? "",
    quantity: Number(o.quantity) ?? 0,
    price: Number(o.price) ?? 0,
    total: Number(o.total) ?? 0,
  };
}

function billItemToFirestore(i: BillItem): Record<string, unknown> {
  return {
    product_id: i.productId,
    product_name: i.productName,
    quantity: i.quantity,
    price: i.price,
    total: i.total,
  };
}

export function billToApp(id: string, d: Record<string, unknown>): Bill {
  const items = (d.items as Record<string, unknown>[]) ?? [];
  return {
    id,
    vendorId: (d.vendor_id as string) ?? "",
    vendorName: (d.vendor_name as string) ?? "",
    vendorPhone: d.vendor_phone as string | undefined,
    date: (d.date as string) ?? "",
    items: items.map(billItemToApp),
    subtotal: Number(d.subtotal) ?? 0,
    discountPercent: d.discount_percent != null ? Number(d.discount_percent) : undefined,
    discountAmount: d.discount_amount != null ? Number(d.discount_amount) : undefined,
    lumpSumDiscount: d.lump_sum_discount != null ? Number(d.lump_sum_discount) : undefined,
    total: Number(d.total) ?? 0,
    amountPaid: d.amount_paid != null ? Number(d.amount_paid) : undefined,
    status: (d.status as Bill["status"]) ?? "pending",
    createdAt: (tsToFullString(d.created_at) || (d.created_at as string)) ?? "",
  };
}

export function billToFirestore(b: Omit<Bill, "id" | "createdAt">): Record<string, unknown> {
  return {
    vendor_id: b.vendorId,
    vendor_name: b.vendorName,
    vendor_phone: b.vendorPhone ?? null,
    date: b.date,
    items: b.items.map(billItemToFirestore),
    subtotal: b.subtotal,
    discount_percent: b.discountPercent ?? null,
    discount_amount: b.discountAmount ?? null,
    lump_sum_discount: b.lumpSumDiscount ?? null,
    total: b.total,
    amount_paid: b.amountPaid ?? 0,
    status: b.status,
  };
}

// stock
export function stockToApp(id: string, d: Record<string, unknown>): StockItem {
  return {
    id,
    name: (d.name as string) ?? "",
    category: (d.category as StockItem["category"]) ?? "raw",
    quantity: Number(d.quantity) ?? 0,
    unit: (d.unit as string) ?? "",
    minStock: Number(d.min_stock) ?? 0,
    lastUpdated: (tsToString(d.last_updated) || (d.last_updated as string)) ?? "",
  };
}

export function stockToFirestore(s: Omit<StockItem, "id" | "lastUpdated">): Record<string, unknown> {
  return {
    name: s.name,
    category: s.category,
    quantity: s.quantity,
    unit: s.unit,
    min_stock: s.minStock,
  };
}

// stock_history: auto id
export function stockHistoryToApp(id: string, d: Record<string, unknown>): StockHistoryEntry {
  return {
    id,
    stockItemId: (d.stock_item_id as string) ?? "",
    type: (d.type as "add" | "deduct") ?? "add",
    quantity: Number(d.quantity) ?? 0,
    previousQty: Number(d.previous_qty) ?? 0,
    newQty: Number(d.new_qty) ?? 0,
    date: (d.date as string) ?? "",
    notes: (d.notes as string) ?? "",
  };
}

export function stockHistoryToFirestore(h: Omit<StockHistoryEntry, "id">): Record<string, unknown> {
  return {
    stock_item_id: h.stockItemId,
    type: h.type,
    quantity: h.quantity,
    previous_qty: h.previousQty,
    new_qty: h.newQty,
    date: h.date,
    notes: h.notes,
  };
}

// production_logs: auto id
export function productionLogToApp(id: string, d: Record<string, unknown>): ProductionLog {
  return {
    id,
    date: (d.date as string) ?? "",
    flavor: (d.flavor as string) ?? "",
    quantity: Number(d.quantity) ?? 0,
    batchNumber: (d.batch_number as string) ?? "",
    notes: (d.notes as string) ?? "",
    createdAt: (tsToFullString(d.created_at) || (d.created_at as string)) ?? "",
  };
}

export function productionLogToFirestore(p: Omit<ProductionLog, "id" | "createdAt">): Record<string, unknown> {
  return {
    date: p.date,
    flavor: p.flavor,
    quantity: p.quantity,
    batch_number: p.batchNumber,
    notes: p.notes,
  };
}
