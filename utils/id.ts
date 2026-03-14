export function generateVendorId(existing: string[]): string {
  const nums = existing.map((id) => parseInt(id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(4, "0");
  return `VDN-${next}`;
}

export function generateProductId(existing: string[]): string {
  const nums = existing.map((id) => parseInt(id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, "0");
  return `PRD-${next}`;
}

export function generateInvoiceId(existing: string[]): string {
  const year = new Date().getFullYear();
  const nums = existing
    .map((id) => {
      const m = id.match(/INV-\d{4}-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter(Boolean);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, "0");
  return `INV-${year}-${next}`;
}

export function generateStockId(prefix = "STK"): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function generateBatchNumber(flavor: string): string {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
  const code = flavor.slice(0, 1).toUpperCase() + "01";
  return `BCH-${dateStr}-${code}`;
}
