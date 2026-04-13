// utils/date.ts
export function todayISO() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}