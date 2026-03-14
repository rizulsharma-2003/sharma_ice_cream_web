import type { StockItem, StockHistoryEntry } from "@/types";

export const stockItems: StockItem[] = [
  { id: "STK-001", name: "Milk", category: "raw", rawMaterialType: "Milk", quantity: 500, unit: "L", minStock: 200, lastUpdated: "2024-03-13" },
  { id: "STK-002", name: "Sugar", category: "raw", rawMaterialType: "Sugar", quantity: 300, unit: "kg", minStock: 100, lastUpdated: "2024-03-13" },
  { id: "STK-003", name: "Cream", category: "raw", rawMaterialType: "Cream", quantity: 150, unit: "L", minStock: 50, lastUpdated: "2024-03-12" },
  { id: "STK-004", name: "Chocolate", category: "raw", rawMaterialType: "Chocolate", quantity: 80, unit: "kg", minStock: 30, lastUpdated: "2024-03-12" },
  { id: "STK-005", name: "Vanilla Flavor", category: "raw", rawMaterialType: "Flavors", quantity: 25, unit: "L", minStock: 10, lastUpdated: "2024-03-11" },
  { id: "STK-006", name: "Vanilla Cone (Finished)", category: "finished", productId: "PRD-001", quantity: 120, unit: "pcs", minStock: 50, lastUpdated: "2024-03-13" },
  { id: "STK-007", name: "Chocolate Cup (Finished)", category: "finished", productId: "PRD-002", quantity: 85, unit: "pcs", minStock: 40, lastUpdated: "2024-03-13" },
  { id: "STK-008", name: "Blueberry Cup (Finished)", category: "finished", productId: "PRD-011", quantity: 8, unit: "pcs", minStock: 20, lastUpdated: "2024-03-10" },
];

export const stockHistory: StockHistoryEntry[] = [
  { id: "SH-001", stockItemId: "STK-001", type: "add", quantity: 200, previousQty: 300, newQty: 500, date: "2024-03-13", notes: "Restock" },
  { id: "SH-002", stockItemId: "STK-006", type: "deduct", quantity: 30, previousQty: 150, newQty: 120, date: "2024-03-13", notes: "Vendor order" },
  { id: "SH-003", stockItemId: "STK-005", type: "add", quantity: 10, previousQty: 15, newQty: 25, date: "2024-03-11", notes: "New batch" },
];
