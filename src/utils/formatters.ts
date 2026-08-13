export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getBranchCodeFromEntity(entityName?: string): string {
  if (!entityName) return "HO";
  const lower = entityName.toLowerCase();
  if (lower.includes("utama") || lower.includes("interinsco tbk")) return "RUI";
  if (lower.includes("supraco indonesia")) return "SPI";
  if (lower.includes("tunas")) return "RTI";
  if (lower.includes("lines")) return "SPL";
  return "HO";
}

export function generateDeclarationNumber(
  sequence: number,
  branchCode: string = "HO",
  date: Date = new Date()
): string {
  const branch = (branchCode || "HO").trim().toUpperCase();
  const year2Digit = String(date.getFullYear()).slice(-2);
  const month2Digit = String(date.getMonth() + 1).padStart(2, "0");
  const runningNumber = String(sequence).padStart(4, "0");
  return `ABC-${branch}${year2Digit}${month2Digit}${runningNumber}`;
}

export function parseRupiahInput(value: string): number {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}
