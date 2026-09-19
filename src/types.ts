// Tipe domain universal invoice.
// Dipindahkan dari src/App.tsx (tanpa perubahan bentuk) + tambahan
// tipe fondasi untuk template universal, modul DnD, dan outbound.

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  qty: number;
  /** Satuan per baris, mis. 'pax', 'paket', 'hari'. Opsional agar riwayat lama tetap valid. */
  unit?: string;
}

export type DpMode = 'percent' | 'nominal';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SavedInvoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  items: Item[];
  dpValue: number;
  dpMode?: DpMode;
  dpPercent?: number;
  discountValue: number;
  paymentMethod: string;
  createdAt: string;
  invoiceType?: InvoiceType;
  eventLocation?: string;
  participantCount?: string;
}

// --- Fondasi universal (belum dipakai App, untuk fase berikutnya) ---

export type InvoiceType = 'villa' | 'retail' | 'service' | 'outbound';

export type BlockType =
  | 'kop'
  | 'title'
  | 'customer'
  | 'rentalDates'
  | 'tripInfo'
  | 'itemsTable'
  | 'paxList'
  | 'summary'
  | 'payment'
  | 'notes'
  | 'signature'
  | 'footerBanner';

export interface InvoiceBlock {
  id: string;
  type: BlockType;
  visible: boolean;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  businessManagement: string;
  businessTagline: string;
  businessLocation: string;
}
