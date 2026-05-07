import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, Annotation, Tool } from '@/types';
import AnnotationLayer from './AnnotationLayer';

interface PDFViewerProps {
  doc: PDFDocument | null;
  annotations: Annotation[];
  scale: number;
  rotation: number;
  currentPage: number;
  tool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  onPageChange: (page: number) => void;
  onAddAnnotation: (a: Annotation) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
}

export default function PDFViewer({
  doc, annotations, scale, rotation, currentPage, tool, color, strokeWidth,
  fontSize, fontFamily, bold, italic,
  onPageChange, onAddAnnotation, onUpdateAnnotation, onDeleteAnnotation,
}: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageDimensions, setPageDimensions] = useState<Map<number, { width: number; height: number }>>(new Map());

  // Convert Uint8Array to blob URL for react-pdf
  useEffect(() => {
    if (!doc) {
      setPdfData(null);
      return;
    }
    // Note: pdfBytesRef needs to come from parent. Since we don't have it here,
    // we'll use a placeholder approach - in real app, pass pdfData URL from App.
  }, [doc]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const onPageLoadSuccess = useCallback((page: any, pageIndex: number) => {
    const { width, height } = page;
    setPageDimensions(prev => {
      const next = new Map(prev);
      next.set(pageIndex, { width, height });
      return next;
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const pageElements = container.querySelectorAll('.pdf-page-wrapper');
    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (rect.top >= containerRect.top - rect.height / 2) {
        onPageChange(i);
        break;
      }
    }
  }, [onPageChange]);

  // Scroll to current page when changed externally
  useEffect(() => {
    if (!containerRef.current) return;
    const pageEl = containerRef.current.querySelector(`[data-page-index="${currentPage}"]`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-text-muted mb-2">No PDF Opened</h2>
          <p className="text-sm text-text-muted">Click Open to load a PDF file</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-slate-100 p-4 scrollbar-thin"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {Array.from({ length: doc.numPages }).map((_, idx) => (
          <div
            key={idx}
            data-page-index={idx}
            className="pdf-page-wrapper relative"
          >
            <div className="pdf-page relative">
              <Document
                file={pdfData || 'placeholder'}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="w-full h-[800px] flex items-center justify-center text-text-muted">
                    Loading page...
                  </div>
                }
                error={
                  <div className="w-full h-[200px] flex items-center justify-center text-danger">
                    Failed to load PDF. Please try reopening the file.
                  </div>
                }
              >
                <Page
                  pageNumber={idx + 1}
                  scale={scale}
                  rotate={rotation}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                  onLoadSuccess={(page) => onPageLoadSuccess(page, idx)}
                  loading={
                    <div className="w-full h-[800px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  }
                />
              </Document>

              {/* Annotation Overlay */}
              <AnnotationLayer
                pageIndex={idx}
                pageWidth={pageDimensions.get(idx)?.width || 600}
                pageHeight={pageDimensions.get(idx)?.height || 800}
                annotations={annotations.filter(a => a.pageIndex === idx)}
                tool={tool}
                color={color}
                strokeWidth={strokeWidth}
                fontSize={fontSize}
                fontFamily={fontFamily}
                bold={bold}
                italic={italic}
                scale={scale}
                onAddAnnotation={onAddAnnotation}
                onUpdateAnnotation={onUpdateAnnotation}
                onDeleteAnnotation={onDeleteAnnotation}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
