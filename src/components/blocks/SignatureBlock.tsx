import type { SpacingMode } from './ItemsTableBlock';

interface SignatureBlockProps {
  clientName: string;
  vendorName: string;
  primaryColor: string;
  order: number;
  hidden: boolean;
  spacingMode: SpacingMode;
  onClientNameChange?: (name: string) => void;
  onVendorNameChange?: (name: string) => void;
}

export default function SignatureBlock({
  clientName,
  vendorName,
  primaryColor,
  order,
  hidden,
  spacingMode,
  onClientNameChange,
  onVendorNameChange,
}: SignatureBlockProps) {
  const heightClass =
    spacingMode === 'standard' ? 'h-16' : spacingMode === 'compact' ? 'h-12' : 'h-9';
  const marginClass =
    spacingMode === 'standard' ? 'mt-4 pt-2' : spacingMode === 'compact' ? 'mt-3 pt-1.5' : 'mt-2 pt-1';
  const textClass =
    spacingMode === 'standard' ? 'text-xs' : spacingMode === 'compact' ? 'text-[11px]' : 'text-[10px]';

  return (
    <div
      className={`grid grid-cols-2 gap-8 border-t border-slate-200/80 ${marginClass} ${hidden ? 'hidden' : ''}`}
      style={{ order }}
      data-block="signature"
      data-spacing={spacingMode}
    >
      {/* Pihak Pertama: Klien / Pemesan */}
      <div className="flex flex-col items-center text-center">
        <span className={`font-semibold text-slate-500 uppercase tracking-wider ${textClass}`}>
          Disetujui Oleh (Klien / Pemesan),
        </span>
        <div className={`w-full flex items-center justify-center ${heightClass}`}>
          <span className="text-[10px] text-slate-300 italic print-hidden">
            ( Tanda Tangan & Stempel )
          </span>
        </div>
        <div className="w-48 border-b border-slate-400/80 pb-0.5">
          {onClientNameChange ? (
            <input
              type="text"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              className={`w-full text-center font-bold text-slate-800 bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded ${textClass}`}
            />
          ) : (
            <span className={`font-bold text-slate-800 ${textClass}`}>{clientName}</span>
          )}
        </div>
        <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">Pihak Pertama</span>
      </div>

      {/* Pihak Kedua: Penyelenggara / EO */}
      <div className="flex flex-col items-center text-center">
        <span className={`font-semibold text-slate-500 uppercase tracking-wider ${textClass}`}>
          Hormat Kami (Penyelenggara / EO),
        </span>
        <div className={`w-full flex items-center justify-center ${heightClass}`}>
          <span className="text-[10px] text-slate-300 italic print-hidden">
            ( Tanda Tangan & Stempel )
          </span>
        </div>
        <div className="w-48 border-b border-slate-400/80 pb-0.5">
          {onVendorNameChange ? (
            <input
              type="text"
              value={vendorName}
              onChange={(e) => onVendorNameChange(e.target.value)}
              className={`w-full text-center font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded ${textClass}`}
              style={{ color: primaryColor }}
            />
          ) : (
            <span className={`font-bold ${textClass}`} style={{ color: primaryColor }}>
              {vendorName}
            </span>
          )}
        </div>
        <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">Pihak Kedua</span>
      </div>
    </div>
  );
}
