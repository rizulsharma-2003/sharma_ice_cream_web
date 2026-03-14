import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Vendor } from "@/types";
import { generateVendorId } from "@/utils/id";
import { vendorToApp, vendorToFirestore } from "@/lib/firestore-converters";

const COLLECTION = "Vendor";

export async function getVendors(): Promise<Vendor[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => vendorToApp(d.id, d.data() as Record<string, unknown>));
}

export async function getVendorById(id: string): Promise<Vendor | undefined> {
  const ref = doc(db, COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return undefined;
  return vendorToApp(d.id, d.data() as Record<string, unknown>);
}

export async function searchVendors(queryStr: string): Promise<Vendor[]> {
  const all = await getVendors();
  const q = queryStr.toLowerCase();
  return all.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.shopName.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.phone.includes(q)
  );
}

export async function addVendor(vendor: Omit<Vendor, "id" | "createdAt">): Promise<Vendor> {
  const existing = await getVendors();
  const id = generateVendorId(existing.map((v) => v.id));
  const ref = doc(db, COLLECTION, id);
  const data = {
    ...vendorToFirestore(vendor),
    created_at: serverTimestamp(),
  };
  await setDoc(ref, data);
  return {
    ...vendor,
    id,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export async function updateVendor(
  id: string,
  data: Partial<Omit<Vendor, "id" | "createdAt">>
): Promise<Vendor | null> {
  const ref = doc(db, COLLECTION, id);
  const existing = await getDoc(ref);
  if (!existing.exists()) return null;
  const updates: Record<string, unknown> = {};
  if (data.name != null) updates.name = data.name;
  if (data.phone != null) updates.phone = data.phone;
  if (data.shopName != null) updates.shop_name = data.shopName;
  if (data.address != null) updates.address = data.address;
  if (data.gstNumber != null) updates.gst_number = data.gstNumber;
  if (data.notes != null) updates.notes = data.notes;
  await updateDoc(ref, updates);
  const updated = await getDoc(ref);
  return vendorToApp(updated.id, updated.data() as Record<string, unknown>);
}

export async function deleteVendor(id: string): Promise<boolean> {
  const ref = doc(db, COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return false;
  await deleteDoc(ref);
  return true;
}
