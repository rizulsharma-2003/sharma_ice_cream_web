import type { Bill } from "@/types";
import { getInvoicePDFBlob } from "@/lib/invoice-pdf";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";

export function getWhatsAppShareUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  const num = clean.length >= 10 ? clean.slice(-10) : clean;
  const url = new URL("https://wa.me/91" + num);
  url.searchParams.set("text", message);
  return url.toString();
}

export async function openWhatsAppInvoiceShare(
  bill: Bill,
  options?: { onFallback?: () => void }
): Promise<void> {
  const message = `Hello ${bill.vendorName}, here is your invoice.`;
  const phone = bill.vendorPhone ?? "";

  const blob = getInvoicePDFBlob(bill);
  const file = new File([blob], `invoice-${bill.id}.pdf`, { type: "application/pdf" });

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const canShareFiles =
        navigator.canShare && navigator.canShare({ files: [file] });
      if (canShareFiles) {
        await navigator.share({
          text: message,
          files: [file],
        });
        return;
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }

  downloadInvoicePDF(bill);
  if (phone) window.open(getWhatsAppShareUrl(phone, message), "_blank");
  options?.onFallback?.();
}
