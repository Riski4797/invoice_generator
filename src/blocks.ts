import type { BlockType, InvoiceBlock, InvoiceType } from './types';

// Kontrak data layout blok untuk susunan kertas A4.
// Aturan: urutan array = urutan vertikal di kertas (bukan free-canvas),
// supaya printToPDF 210x297mm tetap muat 1 halaman.
// Blok 'footerBanner' selalu di-pin di bawah kertas (di luar area reorder).

export const REORDERABLE_BLOCKS: BlockType[] = ['kop', 'title', 'customer', 'itemsTable', 'summary', 'signature'];

export const BLOCK_LABELS: Record<BlockType, string> = {
  kop: 'Kop Surat',
  title: 'Judul Dokumen',
  customer: 'Data Pelanggan & Reservasi / Kegiatan',
  rentalDates: 'Tanggal Sewa',
  tripInfo: 'Info Kegiatan',
  itemsTable: 'Tabel Item / Layanan / Paket',
  paxList: 'Peserta',
  summary: 'Ringkasan, Bank & S&K',
  payment: 'Info Bank',
  notes: 'Syarat & Catatan',
  signature: 'Tanda Tangan & Pengesahan',
  footerBanner: 'Banner Bawah',
};

export const DEFAULT_LAYOUT_VILLA: InvoiceBlock[] = [
  { id: 'kop', type: 'kop', visible: true },
  { id: 'title', type: 'title', visible: true },
  { id: 'customer', type: 'customer', visible: true },
  { id: 'itemsTable', type: 'itemsTable', visible: true },
  { id: 'summary', type: 'summary', visible: true },
  { id: 'footerBanner', type: 'footerBanner', visible: true },
];

// Alur EO team building / fun outbound:
// Kop -> Judul -> Klien & Lokasi Acara -> Tabel Paket & Add-on -> Ringkasan Finansial/DP/Bank/S&K -> Tanda Tangan -> Banner
export const DEFAULT_LAYOUT_OUTBOUND: InvoiceBlock[] = [
  { id: 'kop', type: 'kop', visible: true },
  { id: 'title', type: 'title', visible: true },
  { id: 'customer', type: 'customer', visible: true },
  { id: 'itemsTable', type: 'itemsTable', visible: true },
  { id: 'summary', type: 'summary', visible: true },
  { id: 'signature', type: 'signature', visible: true },
  { id: 'footerBanner', type: 'footerBanner', visible: true },
];

export function defaultLayoutFor(type: InvoiceType): InvoiceBlock[] {
  return (type === 'outbound' ? DEFAULT_LAYOUT_OUTBOUND : DEFAULT_LAYOUT_VILLA).map((b) => ({ ...b }));
}

// Validasi layout simpanan: buang tipe tak dikenal, kembalikan default bila kosong.
export function sanitizeLayout(raw: unknown, fallback: InvoiceBlock[]): InvoiceBlock[] {
  if (!Array.isArray(raw)) return fallback.map((b) => ({ ...b }));
  const known = new Set(Object.keys(BLOCK_LABELS));
  const clean = (raw as InvoiceBlock[]).filter(
    (b) => b && typeof b.id === 'string' && known.has(b.type),
  ).map((b) => ({ id: b.id, type: b.type, visible: b.visible !== false }));
  return clean.length > 0 ? clean : fallback.map((b) => ({ ...b }));
}
