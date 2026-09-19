import type { Item, SavedInvoice } from '../types';

// Kalkulasi finansial murni. Cerminan logika di src/App.tsx:
//   subtotal = Σ(price * qty); totalBill = subtotal - dp - discount
// Diekstrak agar bisa di-unit-test dan dipakai ulang template universal.

export function calcSubtotal(items: Item[]): number {
  return items.reduce((acc, item) => acc + item.price * item.qty, 0);
}

export function calcTotalBill(subtotal: number, dpValue: number, discountValue: number): number {
  return subtotal - dpValue - discountValue;
}

export function calcDpFromPercent(base: number, percent: number): number {
  return Math.max(0, Math.round(base * percent / 100));
}

// DP efektif invoice tersimpan (mendukung riwayat lama tanpa dpMode).
export function calcSavedDp(inv: SavedInvoice): number {
  if (inv.dpMode === 'percent') {
    return calcDpFromPercent(calcSubtotal(inv.items) - inv.discountValue, inv.dpPercent ?? 50);
  }
  return inv.dpValue;
}

export function calcSavedTotal(inv: SavedInvoice): number {
  return calcSubtotal(inv.items) - calcSavedDp(inv) - inv.discountValue;
}

export function buildInvoiceNo(year: number, month: number, seq: number): string {
  const mm = String(month).padStart(2, '0');
  const s = String(seq).padStart(3, '0');
  return `INV/${year}${mm}/${s}`;
}
