import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { StockItem, StockHistoryEntry } from "@/types";
import { generateStockId } from "@/utils/id";
import {
  stockToApp,
  stockToFirestore,
  stockHistoryToApp,
  stockHistoryToFirestore,
} from "@/lib/firestore-converters";

const STOCK_COLLECTION = "stock";
const HISTORY_COLLECTION = "stock_history";

export async function getStockItems(): Promise<StockItem[]> {
  const snap = await getDocs(collection(db, STOCK_COLLECTION));
  return snap.docs.map((d) => stockToApp(d.id, d.data() as Record<string, unknown>));
}

export async function getStockItemById(id: string): Promise<StockItem | undefined> {
  const ref = doc(db, STOCK_COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return undefined;
  return stockToApp(d.id, d.data() as Record<string, unknown>);
}

export async function getLowStockItems(): Promise<StockItem[]> {
  const all = await getStockItems();
  return all.filter((s) => s.quantity <= s.minStock);
}

export async function getStockHistory(
  stockItemId?: string
): Promise<StockHistoryEntry[]> {
  const snap = await getDocs(collection(db, HISTORY_COLLECTION));
  let list = snap.docs.map((d) =>
    stockHistoryToApp(d.id, d.data() as Record<string, unknown>)
  );
  list = list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return stockItemId ? list.filter((h) => h.stockItemId === stockItemId) : list;
}

export async function addStock(
  stockItemId: string,
  quantity: number,
  notes: string
): Promise<StockItem | null> {
  const item = await getStockItemById(stockItemId);
  if (!item) return null;
  const previousQty = item.quantity;
  const newQty = previousQty + quantity;
  await addDoc(collection(db, HISTORY_COLLECTION), {
    ...stockHistoryToFirestore({
      stockItemId,
      type: "add",
      quantity,
      previousQty,
      newQty,
      date: new Date().toISOString(),
      notes,
    }),
  });
  const ref = doc(db, STOCK_COLLECTION, stockItemId);
  await updateDoc(ref, {
    quantity: newQty,
    last_updated: serverTimestamp(),
  });
  const updated = await getDoc(ref);
  return stockToApp(updated.id, updated.data() as Record<string, unknown>);
}

export async function deductStock(
  stockItemId: string,
  quantity: number,
  notes: string
): Promise<StockItem | null> {
  const item = await getStockItemById(stockItemId);
  if (!item) return null;
  const previousQty = item.quantity;
  const newQty = Math.max(0, previousQty - quantity);
  await addDoc(collection(db, HISTORY_COLLECTION), {
    ...stockHistoryToFirestore({
      stockItemId,
      type: "deduct",
      quantity,
      previousQty,
      newQty,
      date: new Date().toISOString(),
      notes,
    }),
  });
  const ref = doc(db, STOCK_COLLECTION, stockItemId);
  await updateDoc(ref, {
    quantity: newQty,
    last_updated: serverTimestamp(),
  });
  const updated = await getDoc(ref);
  return stockToApp(updated.id, updated.data() as Record<string, unknown>);
}
