export type ProductCategory = "Cone" | "Cup" | "Stick" | "Family Pack" | "Bulk";

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  shopName: string;
  address: string;
  gstNumber: string;
  notes: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  flavor: string;
  category: ProductCategory;
  price: number;
  currentStock: number;
}

export interface BillItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export type BillStatus = "paid" | "pending" | "overdue";

export interface Bill {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  gstPercent?: number;
  gstAmount?: number;
  discountPercent?: number;
  discountAmount?: number;
  lumpSumDiscount?: number;
  total: number;
  amountPaid?: number;
  status: BillStatus;
  createdAt: string;
}

export type StockCategory = "raw" | "finished";
export type RawMaterialType = "Milk" | "Sugar" | "Cream" | "Chocolate" | "Flavors";

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  rawMaterialType?: RawMaterialType;
  productId?: string;
  quantity: number;
  unit: string;
  minStock: number;
  lastUpdated: string;
}

export interface StockHistoryEntry {
  id: string;
  stockItemId: string;
  type: "add" | "deduct";
  quantity: number;
  previousQty: number;
  newQty: number;
  date: string;
  notes: string;
}

export interface ProductionLog {
  id: string;
  date: string;
  flavor: string;
  quantity: number;
  batchNumber: string;
  notes: string;
  createdAt: string;
}
