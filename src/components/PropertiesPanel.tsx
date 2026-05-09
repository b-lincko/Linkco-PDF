
import { Bold, Italic } from 'lucide-react';
import { Tool } from '@/types';
import { DEFAULT_COLORS, HIGHLIGHT_COLORS, FONT_FAMILIES, STROKE_WIDTHS, FONT_SIZES } from '@/lib/constants';

interface PropertiesPanelProps {
  tool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  onColorChange: (c: string) => void;
  onStrokeWidthChange: (w: number) => void;
  onFontSizeChange: (fs: number) => void;
  onFontFamilyChange: (ff: string) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
}

export default function PropertiesPanel({
  tool, color, strokeWidth, fontSize, fontFamily, bold, italic,
  onColorChange, onStrokeWidthChange, onFontSizeChange, onFontFamilyChange,
  onToggleBold, onToggleItalic,
}: PropertiesPanelProps) {
  const isText = tool === 'text' || tool === 'formText' || tool === 'stickyNote';
  const isShape = tool === 'pen' || tool === 'rectangle' || tool === 'ellipse' || tool === 'arrow' || tool === 'signature';
  const isHighlight = tool === 'highlight' || tool === 'underline' || tool === 'strikeout';

  return (
    <div className="w-56 bg-surface-raised border-l border-border flex flex-col shrink-0 p-3 gap-4">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Properties</h3>

      {/* Color */}
      <div>
        <label className="text-xs text-text-muted mb-1 block">
          {isHighlight ? 'Highlight Color' : 'Color'}
        </label>
        <div className="flex flex-wrap gap-1">
          {(isHighlight ? HIGHLIGHT_COLORS : DEFAULT_COLORS).map(c => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-6 h-6 rounded border ${color === c ? 'ring-2 ring-primary ring-offset-1' : 'border-gray-300'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <input
          type="color"
          value={color}
          onChange={e => onColorChange(e.target.value)}
          className="mt-2 w-full"
        />
      </div>

      {/* Stroke Width */}
      {isShape && (
        <div>
          <label className="text-xs text-text-muted mb-1 block">Thickness</label>
          <div className="flex items-center gap-2">
            <select
              value={strokeWidth}
              onChange={e => onStrokeWidthChange(Number(e.target.value))}
              className="text-sm border border-border rounded px-2 py-1 bg-white"
            >
              {STROKE_WIDTHS.map(w => (
                <option key={w} value={w}>{w}px</option>
              ))}
            </select>
            <input
              type="range"
              min={1}
              max={20}
              value={strokeWidth}
              onChange={e => onStrokeWidthChange(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Font */}
      {isText && (
        <>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Font Size</label>
            <div className="flex items-center gap-2">
              <select
                value={fontSize}
                onChange={e => onFontSizeChange(Number(e.target.value))}
                className="text-sm border border-border rounded px-2 py-1 bg-white"
              >
                {FONT_SIZES.map(fs => (
                  <option key={fs} value={fs}>{fs}px</option>
                ))}
              </select>
              <input
                type="number"
                min={6}
                max={200}
                value={fontSize}
                onChange={e => onFontSizeChange(Number(e.target.value))}
                className="w-14 text-sm border border-border rounded px-1 py-1 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Font Family</label>
            <select
              value={fontFamily}
              onChange={e => onFontFamilyChange(e.target.value)}
              className="w-full text-sm border border-border rounded px-2 py-1 bg-white"
            >
              {FONT_FAMILIES.map(ff => (
                <option key={ff} value={ff}>{ff}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1">
            <button
              onClick={onToggleBold}
              className={`tool-btn px-3 ${bold ? 'active' : ''}`}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={onToggleItalic}
              className={`tool-btn px-3 ${italic ? 'active' : ''}`}
            >
              <Italic size={16} />
            </button>
          </div>
        </>
      )}

      <div className="mt-auto text-xs text-text-muted">
        Tool: <span className="font-medium capitalize">{tool.replace(/([A-Z])/g, ' $1').trim()}</span>
      </div>
    </div>
  );
}
