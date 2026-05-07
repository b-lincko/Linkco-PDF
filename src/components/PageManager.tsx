import React from 'react';
import { ArrowUp, ArrowDown, RotateCw, Copy, Trash2, Plus } from 'lucide-react';
import { PDFDocument } from '@/types';

interface PageManagerProps {
  doc: PDFDocument;
  currentPage: number;
  onRotatePage: (pageIndex: number, degrees: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onDuplicatePage: (pageIndex: number) => void;
  onInsertPage: (pageIndex: number) => void;
}

export default function PageManager({
  doc, currentPage, onRotatePage, onDeletePage, onDuplicatePage, onInsertPage,
}: PageManagerProps) {
  if (!doc) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface-raised border border-border shadow-lg rounded-lg p-2 flex items-center gap-1 z-50">
      <button
        onClick={() => onRotatePage(currentPage, 90)}
        className="tool-btn"
        title="Rotate 90°"
      >
        <RotateCw size={18} />
      </button>
      <button
        onClick={() => onDuplicatePage(currentPage)}
        className="tool-btn"
        title="Duplicate Page"
      >
        <Copy size={18} />
      </button>
      <button
        onClick={() => onInsertPage(currentPage)}
        className="tool-btn"
        title="Insert Blank Page After"
      >
        <Plus size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        onClick={() => onDeletePage(currentPage)}
        className="tool-btn text-danger hover:bg-red-50"
        title="Delete Page"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
