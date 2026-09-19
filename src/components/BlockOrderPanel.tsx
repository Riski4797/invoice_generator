import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, LayoutList, RotateCcw } from 'lucide-react';
import type { InvoiceBlock } from '../types';
import { BLOCK_LABELS, REORDERABLE_BLOCKS } from '../blocks';

interface BlockOrderPanelProps {
  layout: InvoiceBlock[];
  onReorder: (activeId: string, overId: string) => void;
  onToggle: (id: string) => void;
  onReset: () => void;
}

function SortableRow({
  block,
  onToggle,
}: {
  block: InvoiceBlock;
  onToggle: (id: string) => void;
}) {
  const draggable = REORDERABLE_BLOCKS.includes(block.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs transition ${
        isDragging
          ? 'border-slate-800 bg-slate-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300'
      } ${block.visible ? '' : 'opacity-55'}`}
    >
      {draggable ? (
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-0.5"
          title="Seret untuk menyusun ulang"
        >
          <GripVertical className="w-4 h-4" />
        </span>
      ) : (
        <span className="text-[9px] font-bold text-slate-400 uppercase w-5 text-center" title="Selalu di bawah kertas">
          Fix
        </span>
      )}
      <span className="flex-1 font-semibold text-slate-700">{BLOCK_LABELS[block.type]}</span>
      <button
        onClick={() => onToggle(block.id)}
        className={`p-1 rounded transition ${
          block.visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
        }`}
        title={block.visible ? 'Sembunyikan blok' : 'Tampilkan blok'}
      >
        {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Panel sidebar: susun ulang (drag) + tampil/sembunyi blok kertas A4.
// Urutan di sini = urutan cetak (diikat via flex order di preview).
export default function BlockOrderPanel({ layout, onReorder, onToggle, onReset }: BlockOrderPanelProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 print-hidden">
      <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
        <LayoutList className="w-4 h-4 text-slate-500" />
        Susunan Blok Kertas
      </h2>
      <p className="text-[10px] text-slate-500 mb-3">
        Seret gagang untuk menyusun ulang. Urutan & visibilitas di sini = hasil cetak/PDF.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layout.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {layout.map((block) => (
              <SortableRow key={block.id} block={block} onToggle={onToggle} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        onClick={onReset}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Kembalikan Susunan Default
      </button>
    </div>
  );
}
