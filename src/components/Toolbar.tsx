import React from 'react';
import {
  FileOpen, Save, SaveAs, Search, ZoomIn, ZoomOut,
  ArrowLeft, ArrowRight, RotateCcw, Delete,
  Hand, MousePointer, Type, Highlighter, Underline, Strikethrough,
  MessageSquare, PenTool, Square, Circle, ArrowUpRight, Image,
  Signature, CheckSquare, CircleDot, List, ChevronDown,
  PanelLeftOpen, PanelLeftClose, PanelsTopLeft,
} from 'lucide-react';
import { Tool, PDFDocument } from '@/types';

interface ToolbarProps {
  doc: PDFDocument | null;
  tool: Tool;
  zoom: number;
  modified: boolean;
  currentPage: number;
  numPages: number;
  sidebarVisible: boolean;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onToolChange: (t: Tool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  onToggleSidebar: () => void;
  onToggleProperties: () => void;
  onPageChange: (p: number) => void;
}

const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'hand', icon: Hand, label: 'Hand Tool' },
  { id: 'text', icon: Type, label: 'Add Text' },
  { id: 'highlight', icon: Highlighter, label: 'Highlight' },
  { id: 'underline', icon: Underline, label: 'Underline' },
  { id: 'strikeout', icon: Strikethrough, label: 'Strikeout' },
  { id: 'stickyNote', icon: MessageSquare, label: 'Sticky Note' },
  { id: 'pen', icon: PenTool, label: 'Pen' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
  { id: 'image', icon: Image, label: 'Image' },
  { id: 'signature', icon: Signature, label: 'Signature' },
  { id: 'formText', icon: Type, label: 'Text Field' },
  { id: 'formCheckbox', icon: CheckSquare, label: 'Checkbox' },
  { id: 'formRadio', icon: CircleDot, label: 'Radio' },
  { id: 'formDropdown', icon: List, label: 'Dropdown' },
];

export default function Toolbar({
  doc, tool, zoom, modified, currentPage, numPages, sidebarVisible,
  onOpen, onSave, onSaveAs, onToolChange, onZoomIn, onZoomOut,
  onFitWidth, onFitPage, onToggleSidebar, onPageChange,
}: ToolbarProps) {
  const pageInputRef = React.useRef<HTMLInputElement>(null);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pageInputRef.current?.value || '1', 10);
    if (val >= 1 && val <= numPages) onPageChange(val - 1);
  };

  return (
    <div className="h-14 bg-toolbar border-b border-border flex items-center px-3 gap-1 shrink-0">
      {/* File */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <button onClick={onOpen} className="tool-btn" title="Open (Ctrl+O)">
          <FileOpen size={18} />
        </button>
        {doc && (
          <>
            <button onClick={onSave} className="tool-btn" title="Save (Ctrl+S)">
              <Save size={18} className={modified ? 'text-warning' : ''} />
            </button>
            <button onClick={onSaveAs} className="tool-btn" title="Save As">
              <SaveAs size={18} />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      {doc && (
        <div className="flex items-center gap-1 px-2 border-r border-border">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="tool-btn disabled:opacity-30"
            title="Previous Page"
          >
            <ArrowLeft size={18} />
          </button>
          <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
            <input
              ref={pageInputRef}
              type="text"
              defaultValue={currentPage + 1}
              className="w-10 text-center text-sm bg-white border border-border rounded px-1"
              onBlur={() => {
                if (pageInputRef.current) pageInputRef.current.value = String(currentPage + 1);
              }}
            />
            <span className="text-sm text-text-muted">/ {numPages}</span>
          </form>
          <button
            onClick={() => onPageChange(Math.min(numPages - 1, currentPage + 1))}
            disabled={currentPage >= numPages - 1}
            className="tool-btn disabled:opacity-30"
            title="Next Page"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Tools */}
      <div className="flex items-center gap-0.5 px-2 border-r border-border overflow-x-auto scrollbar-thin">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onToolChange(t.id)}
              className={`tool-btn ${tool === t.id ? 'active' : ''}`}
              title={t.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>

      {/* Zoom */}
      {doc && (
        <div className="flex items-center gap-1 px-2 border-r border-border">
          <button onClick={onZoomOut} className="tool-btn" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <span className="text-sm w-14 text-center">{Math.round(zoom)}%</span>
          <button onClick={onZoomIn} className="tool-btn" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={onFitWidth} className="tool-btn text-xs px-1" title="Fit Width">
            W
          </button>
          <button onClick={onFitPage} className="tool-btn text-xs px-1" title="Fit Page">
            P
          </button>
        </div>
      )}

      {/* Sidebar toggle */}
      <div className="flex items-center gap-1 pl-1">
        <button onClick={onToggleSidebar} className={`tool-btn ${sidebarVisible ? 'active' : ''}`} title="Toggle Sidebar">
          {sidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      {/* Empty state message */}
      {!doc && (
        <div className="ml-auto text-sm text-text-muted">
          Open a PDF to start editing
        </div>
      )}
    </div>
  );
}
