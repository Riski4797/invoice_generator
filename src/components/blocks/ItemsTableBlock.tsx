import { Plus, Trash2 } from 'lucide-react';
import type { Item } from '../../types';
import { formatRupiah } from '../../utils/format';

export type SpacingMode = 'standard' | 'compact' | 'super-compact';

interface ItemsTableBlockProps {
  items: Item[];
  spacingMode: SpacingMode;
  primaryColor: string;
  marginClass: string;
  thClass: string;
  tdClass: string;
  /** Posisi vertikal dari layout (flex order). */
  order: number;
  /** true = display:none (layar + cetak). */
  hidden: boolean;
  /** Judul kolom kuantitas, mis. 'Qty / Malam' (villa) atau 'Qty' (campuran). */
  qtyHeader?: string;
  /** Judul kolom deskripsi. */
  descHeader?: string;
  /** Label tombol tambah baris. */
  addLabel?: string;
  onItemChange: (id: string, field: keyof Item, value: string | number) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
}

// Blok tabel item/layanan. Dipindah dari src/App.tsx tanpa perubahan visual.
export default function ItemsTableBlock({
  items,
  spacingMode,
  primaryColor,
  marginClass,
  thClass,
  tdClass,
  order,
  hidden,
  qtyHeader = 'Qty',
  descHeader = 'Deskripsi Sewa / Layanan',
  addLabel = 'Tambah Baris Baru / Layanan Extra',
  onItemChange,
  onAddItem,
  onDeleteItem,
}: ItemsTableBlockProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 ${marginClass} ${hidden ? 'hidden' : ''}`} style={{ order }} data-block="itemsTable" data-spacing={spacingMode}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="font-bold text-white uppercase tracking-wider" style={{ backgroundColor: primaryColor }}>
            <th className={`text-center w-12 ${thClass}`}>No.</th>
            <th className={`${thClass}`}>{descHeader}</th>
            <th className={`text-right w-32 ${thClass}`}>Harga Satuan</th>
            <th className={`text-center w-16 ${thClass}`}>{qtyHeader}</th>
            <th className={`text-right w-36 ${thClass}`}>Total Harga</th>
            <th className={`w-10 text-center print-hidden ${thClass}`}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item, index) => (
            <tr key={item.id} className="hover:bg-slate-50/50 group">
              {/* Kolom Nomor */}
              <td className={`text-center font-mono font-medium text-slate-500 ${tdClass}`}>
                {String(index + 1).padStart(2, '0')}
              </td>

              {/* Kolom Nama Item */}
              <td className={`${tdClass}`}>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onItemChange(item.id, 'name', e.target.value)}
                  className="w-full font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1.5 py-1 text-slate-800 text-xs"
                />
              </td>

              {/* Kolom Harga */}
              <td className={`text-right ${tdClass}`}>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => onItemChange(item.id, 'price', e.target.value)}
                    className="w-24 text-right font-medium bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1 py-1 text-xs print-input-hide"
                  />
                  <span className="print-value font-medium text-xs tabular-nums">{Number(item.price).toLocaleString('id-ID')}</span>
                </div>
              </td>

              {/* Kolom Kuantitas + Satuan (mis. pax / paket, untuk model EO campuran) */}
              <td className={`text-center ${tdClass}`}>
                <input
                  type="number"
                  value={item.qty}
                  min="1"
                  onChange={(e) => onItemChange(item.id, 'qty', e.target.value)}
                  className="w-12 text-center font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded py-1 text-xs"
                />
                <input
                  type="text"
                  value={item.unit ?? ''}
                  onChange={(e) => onItemChange(item.id, 'unit', e.target.value)}
                  placeholder="satuan"
                  title="Satuan baris (mis. pax, paket, hari)"
                  className="w-12 text-center text-[10px] text-slate-400 bg-transparent focus:bg-white focus:text-slate-700 focus:outline-none border border-transparent hover:border-slate-200 rounded print-input-hide"
                />
                {(item.unit ?? '') !== '' && (
                  <span className="print-value block text-[10px] text-slate-500">{item.unit}</span>
                )}
              </td>

              {/* Kolom Total Item */}
              <td className={`text-right font-bold tabular-nums text-slate-800 ${tdClass}`}>
                {formatRupiah(item.price * item.qty)}
              </td>

              {/* Tombol Hapus Baris (Sembunyi ketika dicetak) */}
              <td className={`text-center print-hidden ${tdClass}`}>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="text-red-450 hover:text-red-600 transition p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100"
                  title="Hapus baris"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}

          {/* Tombol Sisip Item Baru (Sembunyi ketika dicetak) */}
          <tr className="print-hidden bg-slate-50/50">
            <td colSpan={6} className="p-2">
              <button
                onClick={onAddItem}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                {addLabel}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
