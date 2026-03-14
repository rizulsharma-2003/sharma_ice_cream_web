import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, ProductCategory } from "@/types";
import { generateProductId } from "@/utils/id";
import { productToApp, productToFirestore } from "@/lib/firestore-converters";

const COLLECTION = "Products";

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => productToApp(d.id, d.data() as Record<string, unknown>));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const ref = doc(db, COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return undefined;
  return productToApp(d.id, d.data() as Record<string, unknown>);
}

export async function searchProducts(
  queryStr: string,
  category?: ProductCategory
): Promise<Product[]> {
  const all = await getProducts();
  const q = queryStr.toLowerCase();
  let list = all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.flavor.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
  );
  if (category) list = list.filter((p) => p.category === category);
  return list;
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.category === category);
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const existing = await getProducts();
  const id = generateProductId(existing.map((p) => p.id));
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, productToFirestore(product));
  return { ...product, id };
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<Product | null> {
  const ref = doc(db, COLLECTION, id);
  const existing = await getDoc(ref);
  if (!existing.exists()) return null;
  const updates: Record<string, unknown> = {};
  if (data.name != null) updates.name = data.name;
  if (data.flavor != null) updates.flavor = data.flavor;
  if (data.category != null) updates.category = data.category;
  if (data.price != null) updates.price = data.price;
  if (data.currentStock != null) updates.current_stock = data.currentStock;
  await updateDoc(ref, updates);
  const updated = await getDoc(ref);
  return productToApp(updated.id, updated.data() as Record<string, unknown>);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const ref = doc(db, COLLECTION, id);
  const d = await getDoc(ref);
  if (!d.exists()) return false;
  await deleteDoc(ref);
  return true;
}

export async function updateProductStock(
  productId: string,
  delta: number
): Promise<Product | null> {
  const p = await getProductById(productId);
  if (!p) return null;
  const newStock = Math.max(0, p.currentStock + delta);
  return updateProduct(productId, { currentStock: newStock });
}
