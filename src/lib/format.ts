/** Formats a dram amount with Armenian grouping, e.g. 14900 -> "14,900 ֏". */
export function formatAmd(amount: number): string {
  const value = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${value.toLocaleString("en-US")} ֏`;
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("hy-AM", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
