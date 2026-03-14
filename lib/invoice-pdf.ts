import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateTime } from "@/utils/format";
import type { Bill } from "@/types";

const FACTORY = {
  name: "Sharma Ice Cream Factory",
  address: "123 Industrial Area, Phase 2, Delhi - 110045",
  phone: "+91 98765 00000",
  gstNumber: "07AABCS1234M1Z1",
};

export function generateInvoicePDF(bill: Bill): jsPDF {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;

  // Header block
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(FACTORY.name, margin, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(FACTORY.address, margin, 26);
  doc.text(`Ph: ${FACTORY.phone}  |  GST: ${FACTORY.gstNumber}`, margin, 32);

  let y = 48;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text("BILL TO", margin, y);
  y += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(bill.vendorName, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`ID: ${bill.vendorId}`, margin, y);
  if (bill.vendorPhone) {
    y += 5;
    doc.text(bill.vendorPhone, margin, y);
  }

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text("INVOICE", pageW - margin, 48, { align: "right" });
  doc.text("DATE", pageW - margin, 54, { align: "right" });
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(bill.id, pageW - margin, 62, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(formatDateTime(bill.createdAt || bill.date), pageW - margin, 68, { align: "right" });

  y = 78;
  autoTable(doc, {
    startY: y,
    head: [["Product", "Qty", "Unit Price (₹)", "Amount (₹)"]],
    body: bill.items.map((i) => [i.productName, String(i.quantity), i.price.toFixed(2), i.total.toFixed(2)]),
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 43, halign: "right" },
    },
    tableLineWidth: 0.1,
    tableLineColor: [226, 232, 240],
  });

  const tableEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y + 20;
  y = tableEndY + 14;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", pageW - margin - 50, y, { align: "right" });
  doc.text(`₹${bill.subtotal.toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 6;

  if (bill.discountPercent != null && bill.discountPercent > 0 && bill.discountAmount != null) {
    doc.text(`Discount (${bill.discountPercent}%):`, pageW - margin - 50, y, { align: "right" });
    doc.text(`−₹${bill.discountAmount.toFixed(2)}`, pageW - margin, y, { align: "right" });
    y += 6;
  }
  if (bill.lumpSumDiscount != null && bill.lumpSumDiscount > 0) {
    doc.text("Lump sum discount:", pageW - margin - 50, y, { align: "right" });
    doc.text(`−₹${bill.lumpSumDiscount.toFixed(2)}`, pageW - margin, y, { align: "right" });
    y += 6;
  }
  if (bill.gstPercent != null && bill.gstAmount != null) {
    doc.text(`GST (${bill.gstPercent}%):`, pageW - margin - 50, y, { align: "right" });
    doc.text(`₹${bill.gstAmount.toFixed(2)}`, pageW - margin, y, { align: "right" });
    y += 6;
  }

  const paid = bill.amountPaid ?? 0;
  if (paid > 0) {
    doc.text("Amount Paid:", pageW - margin - 50, y, { align: "right" });
    doc.text(`₹${paid.toFixed(2)}`, pageW - margin, y, { align: "right" });
    y += 6;
    doc.text("Due:", pageW - margin - 50, y, { align: "right" });
    doc.text(`₹${(bill.total - paid).toFixed(2)}`, pageW - margin, y, { align: "right" });
    y += 6;
  }

  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.4);
  doc.line(pageW - margin - 55, y - 2, pageW - margin, y - 2);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total:", pageW - margin - 50, y, { align: "right" });
  doc.text(`₹${bill.total.toFixed(2)}`, pageW - margin, y, { align: "right" });
  doc.setFont("helvetica", "normal");

  y = doc.internal.pageSize.height - 28;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 4, pageW - margin, y - 4);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for your business.", pageW / 2, y + 4, { align: "center" });
  doc.text("Sharma Ice Cream Factory", pageW / 2, y + 10, { align: "center" });

  return doc;
}

export function downloadInvoicePDF(bill: Bill, filename?: string): void {
  const doc = generateInvoicePDF(bill);
  doc.save(filename ?? `invoice-${bill.id}.pdf`);
}

export function getInvoicePDFBlob(bill: Bill): Blob {
  const doc = generateInvoicePDF(bill);
  return doc.output("blob");
}
