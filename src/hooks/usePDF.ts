import { useState, useCallback, useRef } from 'react';
import { PDFDocument, PageInfo, Annotation, Bookmark, SearchResult } from '@/types';
import * as PDFLib from 'pdf-lib';

export function usePDF() {
  const [doc, setDoc] = useState<PDFDocument | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [modified, setModified] = useState(false);
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const pdfLibDocRef = useRef<PDFLib.PDFDocument | null>(null);

  const loadPDF = useCallback(async (data: number[], fileName: string, filePath?: string) => {
    const uint8 = new Uint8Array(data);
    pdfBytesRef.current = uint8;
    const pdfLibDoc = await PDFLib.PDFDocument.load(uint8);
    pdfLibDocRef.current = pdfLibDoc;

    const pages: PageInfo[] = [];
    const pdfPages = pdfLibDoc.getPages();
    for (let i = 0; i < pdfPages.length; i++) {
      const p = pdfPages[i];
      const { width, height } = p.getSize();
      pages.push({
        index: i,
        width,
        height,
        originalWidth: width,
        originalHeight: height,
        rotation: 0,
        scale: 1,
      });
    }

    const meta = pdfLibDoc.getTitle() || pdfLibDoc.getAuthor() || pdfLibDoc.getSubject()
      ? {
          title: pdfLibDoc.getTitle() || undefined,
          author: pdfLibDoc.getAuthor() || undefined,
          subject: pdfLibDoc.getSubject() || undefined,
          keywords: pdfLibDoc.getKeywords() || undefined,
          creator: pdfLibDoc.getCreator() || undefined,
          producer: pdfLibDoc.getProducer() || undefined,
          creationDate: pdfLibDoc.getCreationDate()?.toISOString(),
          modificationDate: pdfLibDoc.getModificationDate()?.toISOString(),
        }
      : undefined;

    setDoc({
      fileName,
      filePath,
      numPages: pages.length,
      pages,
      metadata: meta,
    });
    setAnnotations([]);
    setBookmarks([]);
    setScale(1.0);
    setRotation(0);
    setCurrentPage(0);
    setModified(false);
  }, []);

  const savePDF = useCallback(async (): Promise<Uint8Array | null> => {
    if (!pdfLibDocRef.current) return null;
    const bytes = await pdfLibDocRef.current.save();
    pdfBytesRef.current = bytes;
    setModified(false);
    return bytes;
  }, []);

  const rotatePage = useCallback((pageIndex: number, degrees: number) => {
    setDoc(prev => {
      if (!prev) return prev;
      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        rotation: (newPages[pageIndex].rotation + degrees) % 360,
      };
      return { ...prev, pages: newPages };
    });
    setModified(true);
  }, []);

  const deletePage = useCallback((pageIndex: number) => {
    if (!pdfLibDocRef.current) return;
    pdfLibDocRef.current.removePage(pageIndex);
    setDoc(prev => {
      if (!prev) return prev;
      const newPages = prev.pages.filter((_, i) => i !== pageIndex).map((p, i) => ({ ...p, index: i }));
      return { ...prev, numPages: newPages.length, pages: newPages };
    });
    setCurrentPage(p => Math.min(p, Math.max(0, (doc?.numPages || 1) - 2)));
    setModified(true);
  }, [doc]);

  const duplicatePage = useCallback((pageIndex: number) => {
    if (!pdfLibDocRef.current) return;
    const srcPage = pdfLibDocRef.current.getPage(pageIndex);
    const newPage = pdfLibDocRef.current.addPage([srcPage.getWidth(), srcPage.getHeight()]);
    // Deep copy page content is complex; for now we just add a blank page of same size
    // Real implementation would copy draw operations
    setDoc(prev => {
      if (!prev) return prev;
      const insertAt = pageIndex + 1;
      const newPages = [
        ...prev.pages.slice(0, insertAt),
        { ...prev.pages[pageIndex], index: insertAt },
        ...prev.pages.slice(insertAt).map(p => ({ ...p, index: p.index + 1 })),
      ];
      return { ...prev, numPages: newPages.length, pages: newPages };
    });
    setModified(true);
  }, []);

  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
    setModified(true);
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(a => (a.id === id ? { ...a, ...updates } as Annotation : a)));
    setModified(true);
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    setModified(true);
  }, []);

  const addBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks(prev => [...prev, bookmark]);
  }, []);

  const deleteBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.1, 4.0)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.1, 0.25)), []);
  const setZoom = useCallback((val: number) => setScale(Math.max(0.25, Math.min(4.0, val))), []);

  return {
    doc,
    annotations,
    bookmarks,
    scale,
    rotation,
    currentPage,
    modified,
    pdfBytesRef,
    pdfLibDocRef,
    loadPDF,
    savePDF,
    rotatePage,
    deletePage,
    duplicatePage,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addBookmark,
    deleteBookmark,
    setCurrentPage,
    zoomIn,
    zoomOut,
    setZoom,
  };
}
