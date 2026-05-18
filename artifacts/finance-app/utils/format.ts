export function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString("es", { month: "long" }).toLowerCase();
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDayShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es", { weekday: "short" }).substring(0, 3).toLowerCase();
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export function isSameDay(a: string, b: string): boolean {
  return a.substring(0, 10) === b.substring(0, 10);
}

export function getMonthYear(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
