/** Format date or ISO string for display with date and time. */
export function formatDateTime(s: string): string {
  if (!s?.trim()) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  // Only treat as date-only when strictly YYYY-MM-DD (no time part)
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
  if (dateOnly) {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + ", 12:00 AM";
  }
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
