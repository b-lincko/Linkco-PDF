import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Tool, Annotation, Point, TextAnnotation, PenAnnotation, ShapeAnnotation, StickyNoteAnnotation, ImageAnnotation, SignatureAnnotation } from '@/types';

interface AnnotationLayerProps {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  annotations: Annotation[];
  tool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  scale: number;
  onAddAnnotation: (a: Annotation) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
}

export default function AnnotationLayer({
  pageIndex, pageWidth, pageHeight, annotations, tool, color, strokeWidth,
  fontSize, fontFamily, bold, italic, scale,
  onAddAnnotation, onUpdateAnnotation, onDeleteAnnotation,
}: AnnotationLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [tempAnnotation, setTempAnnotation] = useState<Partial<Annotation> | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  const toSVGPoint = useCallback((clientX: number, clientY: number): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'select') return;
    const pt = toSVGPoint(e.clientX, e.clientY);
    setIsDrawing(true);
    setStartPoint(pt);

    if (tool === 'pen' || tool === 'signature') {
      setCurrentPoints([pt]);
    }

    if (tool === 'text' || tool === 'stickyNote' || tool === 'formText') {
      setTempAnnotation({ x: pt.x, y: pt.y, width: 100, height: 40 });
    }
  }, [tool, toSVGPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    const pt = toSVGPoint(e.clientX, e.clientY);

    if (tool === 'pen' || tool === 'signature') {
      setCurrentPoints(prev => [...prev, pt]);
    } else if (tool === 'rectangle' || tool === 'ellipse' || tool === 'arrow') {
      const width = Math.abs(pt.x - startPoint.x);
      const height = Math.abs(pt.y - startPoint.y);
      const x = Math.min(startPoint.x, pt.x);
      const y = Math.min(startPoint.y, pt.y);
      setTempAnnotation({ x, y, width, height });
    }
  }, [isDrawing, startPoint, tool, toSVGPoint]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const id = crypto.randomUUID();
    const base = {
      id, pageIndex, color, opacity: 0.8, strokeWidth,
    };

    if (tool === 'pen' && currentPoints.length > 1) {
      onAddAnnotation({
        ...base,
        type: 'pen',
        points: currentPoints,
        x: 0, y: 0, width: 0, height: 0,
      } as PenAnnotation);
    } else if (tool === 'signature' && currentPoints.length > 1) {
      onAddAnnotation({
        ...base,
        type: 'signature',
        points: currentPoints,
        x: 0, y: 0, width: 0, height: 0,
      } as SignatureAnnotation);
    } else if (tool === 'rectangle' && tempAnnotation?.width > 5) {
      onAddAnnotation({
        ...base,
        type: 'rectangle',
        x: tempAnnotation.x!, y: tempAnnotation.y!,
        width: tempAnnotation.width!, height: tempAnnotation.height!,
        fillColor: undefined,
      } as ShapeAnnotation);
    } else if (tool === 'ellipse' && tempAnnotation?.width > 5) {
      onAddAnnotation({
        ...base,
        type: 'ellipse',
        x: tempAnnotation.x!, y: tempAnnotation.y!,
        width: tempAnnotation.width!, height: tempAnnotation.height!,
        fillColor: undefined,
      } as ShapeAnnotation);
    } else if (tool === 'text') {
      setEditingTextId(id);
      setTextInput('');
      onAddAnnotation({
        ...base,
        type: 'text',
        x: startPoint?.x || 0, y: startPoint?.y || 0,
        width: 120, height: 30,
        text: '', fontSize, fontFamily, bold, italic,
      } as TextAnnotation);
    } else if (tool === 'stickyNote') {
      onAddAnnotation({
        ...base,
        type: 'stickyNote',
        x: startPoint?.x || 0, y: startPoint?.y || 0,
        width: 160, height: 120,
        text: '', iconColor: color,
      } as StickyNoteAnnotation);
    }

    setCurrentPoints([]);
    setStartPoint(null);
    setTempAnnotation(null);
  }, [isDrawing, tool, currentPoints, tempAnnotation, startPoint, pageIndex, color, strokeWidth, fontSize, fontFamily, bold, italic, onAddAnnotation]);

  const handleAnnotationMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    const pt = toSVGPoint(e.clientX, e.clientY);
    const ann = annotations.find(a => a.id === id);
    if (!ann) return;
    setDraggingId(id);
    setDragOffset({ x: pt.x - ann.x, y: pt.y - ann.y });
  }, [tool, toSVGPoint, annotations]);

  const handleContainerMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId) return;
    const pt = toSVGPoint(e.clientX, e.clientY);
    onUpdateAnnotation(draggingId, {
      x: pt.x - dragOffset.x,
      y: pt.y - dragOffset.y,
    });
  }, [draggingId, dragOffset, toSVGPoint, onUpdateAnnotation]);

  const handleContainerMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleTextSubmit = useCallback((id: string) => {
    onUpdateAnnotation(id, { text: textInput });
    setEditingTextId(null);
    setTextInput('');
  }, [textInput, onUpdateAnnotation]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Delete selected annotation if any (would need selection state)
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const interactiveClass = tool !== 'select' ? 'interactive' : '';

  return (
    <svg
      ref={svgRef}
      className={`annotation-layer ${interactiveClass}`}
      viewBox={`0 0 ${pageWidth} ${pageHeight}`}
      style={{ width: '100%', height: '100%' }}
      onMouseDown={handleMouseDown}
      onMouseMove={tool === 'select' ? handleContainerMouseMove : handleMouseMove}
      onMouseUp={tool === 'select' ? handleContainerMouseUp : handleMouseUp}
    >
      {/* Render existing annotations */}
      {annotations.map(ann => {
        if (ann.type === 'pen' || ann.type === 'signature') {
          const points = (ann as PenAnnotation | SignatureAnnotation).points;
          if (points.length < 2) return null;
          const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
          return (
            <path
              key={ann.id}
              d={d}
              stroke={ann.color}
              strokeWidth={ann.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)}
              style={{ cursor: tool === 'select' ? 'move' : 'default' }}
            />
          );
        }

        if (ann.type === 'rectangle') {
          return (
            <rect
              key={ann.id}
              x={ann.x}
              y={ann.y}
              width={ann.width}
              height={ann.height}
              fill={ann.fillColor || 'none'}
              stroke={ann.color}
              strokeWidth={ann.strokeWidth}
              onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)}
              style={{ cursor: tool === 'select' ? 'move' : 'default' }}
            />
          );
        }

        if (ann.type === 'ellipse') {
          return (
            <ellipse
              key={ann.id}
              cx={ann.x + ann.width / 2}
              cy={ann.y + ann.height / 2}
              rx={ann.width / 2}
              ry={ann.height / 2}
              fill={ann.fillColor || 'none'}
              stroke={ann.color}
              strokeWidth={ann.strokeWidth}
              onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)}
              style={{ cursor: tool === 'select' ? 'move' : 'default' }}
            />
          );
        }

        if (ann.type === 'text') {
          const textAnn = ann as TextAnnotation;
          return (
            <g key={ann.id} onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)} style={{ cursor: 'move' }}>
              <rect
                x={ann.x} y={ann.y}
                width={ann.width} height={ann.height}
                fill="rgba(255,255,255,0.9)"
                stroke={editingTextId === ann.id ? '#2563eb' : 'transparent'}
                strokeWidth={1}
              />
              <text
                x={ann.x + 4}
                y={ann.y + textAnn.fontSize}
                fontSize={textAnn.fontSize}
                fontFamily={textAnn.fontFamily}
                fontWeight={textAnn.bold ? 'bold' : 'normal'}
                fontStyle={textAnn.italic ? 'italic' : 'normal'}
                fill={ann.color}
              >
                {textAnn.text}
              </text>
            </g>
          );
        }

        if (ann.type === 'stickyNote') {
          const note = ann as StickyNoteAnnotation;
          return (
            <g key={ann.id} onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)} style={{ cursor: 'move' }}>
              <rect
                x={ann.x} y={ann.y}
                width={ann.width} height={ann.height}
                fill={note.iconColor || '#fef08a'}
                stroke="#ca8a04"
                strokeWidth={1}
                rx={4}
              />
              <text
                x={ann.x + 8}
                y={ann.y + 20}
                fontSize={12}
                fontFamily="Arial"
                fill="#1e293b"
              >
                {note.text || 'Double-click to edit'}
              </text>
            </g>
          );
        }

        return null;
      })}

      {/* Temporary drawing */}
      {isDrawing && (tool === 'pen' || tool === 'signature') && currentPoints.length > 1 && (
        <path
          d={`M ${currentPoints[0].x} ${currentPoints[0].y} ` + currentPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
      )}

      {isDrawing && tempAnnotation && (tool === 'rectangle' || tool === 'ellipse') && (
        <rect
          x={tempAnnotation.x}
          y={tempAnnotation.y}
          width={tempAnnotation.width}
          height={tempAnnotation.height}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      )}
    </svg>
  );
}
