import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ProductionLog } from "@/types";
import { generateBatchNumber } from "@/utils/id";
import { productionLogToApp, productionLogToFirestore } from "@/lib/firestore-converters";

const COLLECTION = "production_logs";

export async function getProductionLogs(): Promise<ProductionLog[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  const list = snap.docs.map((d) =>
    productionLogToApp(d.id, d.data() as Record<string, unknown>)
  );
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getProductionLogById(id: string): Promise<ProductionLog | undefined> {
  const snap = await getDocs(collection(db, COLLECTION));
  const d = snap.docs.find((x) => x.id === id);
  if (!d) return undefined;
  return productionLogToApp(d.id, d.data() as Record<string, unknown>);
}

export async function addProductionLog(params: {
  date: string;
  flavor: string;
  quantity: number;
  batchNumber?: string;
  notes: string;
}): Promise<ProductionLog> {
  const batchNumber = params.batchNumber ?? generateBatchNumber(params.flavor);
  const ref = await addDoc(collection(db, COLLECTION), {
    ...productionLogToFirestore({
      date: params.date,
      flavor: params.flavor,
      quantity: params.quantity,
      batchNumber,
      notes: params.notes,
    }),
    created_at: serverTimestamp(),
  });
  return {
    id: ref.id,
    date: params.date,
    flavor: params.flavor,
    quantity: params.quantity,
    batchNumber,
    notes: params.notes,
    createdAt: new Date().toISOString(),
  };
}
