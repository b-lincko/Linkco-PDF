import { useState, useCallback, useEffect } from 'react';
import { Tool } from './types';
import { DEFAULT_APP_STATE } from './lib/constants';
import { usePDF } from './hooks/usePDF';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import PDFViewer from './components/PDFViewer';
import PropertiesPanel from './components/PropertiesPanel';
import PageManager from './components/PageManager';
import StatusBar from './components/StatusBar';

export default function App() {
  const pdf = usePDF();
  const [state, setState] = useState(DEFAULT_APP_STATE);

  const setTool = useCallback((tool: Tool) => {
    setState(s => ({ ...s, tool }));
  }, []);

  const setColor = useCallback((color: string) => {
    setState(s => ({ ...s, color }));
  }, []);

  const setStrokeWidth = useCallback((w: number) => {
    setState(s => ({ ...s, strokeWidth: w }));
  }, []);

  const setFontSize = useCallback((fs: number) => {
    setState(s => ({ ...s, fontSize: fs }));
  }, []);

  const setFontFamily = useCallback((ff: string) => {
    setState(s => ({ ...s, fontFamily: ff }));
  }, []);

  const toggleBold = useCallback(() => {
    setState(s => ({ ...s, bold: !s.bold }));
  }, []);

  const toggleItalic = useCallback(() => {
    setState(s => ({ ...s, italic: !s.italic }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(s => ({ ...s, sidebarVisible: !s.sidebarVisible }));
  }, []);

  const toggleProperties = useCallback(() => {
    setState(s => ({ ...s, propertiesVisible: !s.propertiesVisible }));
  }, []);

  const setSidebarTab = useCallback((tab: typeof state.sidebarTab) => {
    setState(s => ({ ...s, sidebarTab: tab, sidebarVisible: true }));
  }, []);

  const handleOpen = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.openPDF();
    if (!result.canceled && result.data) {
      pdf.loadPDF(result.data, result.fileName || 'document.pdf', result.filePath);
    }
  }, [pdf]);

  const handleSave = useCallback(async () => {
    if (!pdf.doc || !window.electronAPI) return;
    const bytes = await pdf.savePDF();
    if (!bytes) return;
    const arr = Array.from(bytes);
    const result = await window.electronAPI.savePDF(arr, pdf.doc.filePath);
    if (!result.canceled && result.filePath) {
      pdf.pdfLibDocRef.current && (pdf.pdfBytesRef.current = bytes);
    }
  }, [pdf]);

  const handleSaveAs = useCallback(async () => {
    if (!pdf.doc || !window.electronAPI) return;
    const bytes = await pdf.savePDF();
    if (!bytes) return;
    const arr = Array.from(bytes);
    const result = await window.electronAPI.saveAsPDF(arr);
    if (!result.canceled && result.filePath) {
      pdf.pdfLibDocRef.current && (pdf.pdfBytesRef.current = bytes);
    }
  }, [pdf]);

  const handleExport = useCallback(async (format: string) => {
    if (!pdf.doc || !window.electronAPI) return;
    const bytes = await pdf.savePDF();
    if (!bytes) return;
    const arr = Array.from(bytes);
    await window.electronAPI.exportAs(arr, format);
  }, [pdf]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'o':
            e.preventDefault();
            handleOpen();
            break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) handleSaveAs();
            else handleSave();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpen, handleSave, handleSaveAs]);

  return (
    <div className="h-screen flex flex-col bg-surface text-text select-none">
      <Toolbar
        doc={pdf.doc}
        tool={state.tool}
        zoom={pdf.scale * 100}
        modified={pdf.modified}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onToolChange={setTool}
        onZoomIn={pdf.zoomIn}
        onZoomOut={pdf.zoomOut}
        onFitWidth={() => pdf.setZoom(1.2)}
        onFitPage={() => pdf.setZoom(0.8)}
        onToggleSidebar={toggleSidebar}
        onToggleProperties={toggleProperties}
        currentPage={pdf.currentPage}
        numPages={pdf.doc?.numPages || 0}
        onPageChange={pdf.setCurrentPage}
        sidebarVisible={state.sidebarVisible}
      />
      <div className="flex-1 flex overflow-hidden">
        {state.sidebarVisible && pdf.doc && (
          <Sidebar
            doc={pdf.doc}
            annotations={pdf.annotations}
            bookmarks={pdf.bookmarks}
            currentPage={pdf.currentPage}
            scale={pdf.scale}
            tab={state.sidebarTab}
            onTabChange={setSidebarTab}
            onPageSelect={pdf.setCurrentPage}
            onAddBookmark={pdf.addBookmark}
            onDeleteBookmark={pdf.deleteBookmark}
          />
        )}
        <div className="flex-1 overflow-hidden flex flex-col">
          <PDFViewer
            doc={pdf.doc}
            annotations={pdf.annotations}
            scale={pdf.scale}
            rotation={pdf.rotation}
            currentPage={pdf.currentPage}
            tool={state.tool}
            color={state.color}
            strokeWidth={state.strokeWidth}
            fontSize={state.fontSize}
            fontFamily={state.fontFamily}
            bold={state.bold}
            italic={state.italic}
            onPageChange={pdf.setCurrentPage}
            onAddAnnotation={pdf.addAnnotation}
            onUpdateAnnotation={pdf.updateAnnotation}
            onDeleteAnnotation={pdf.deleteAnnotation}
          />
        </div>
        {state.propertiesVisible && state.tool !== 'select' && state.tool !== 'hand' && (
          <PropertiesPanel
            tool={state.tool}
            color={state.color}
            strokeWidth={state.strokeWidth}
            fontSize={state.fontSize}
            fontFamily={state.fontFamily}
            bold={state.bold}
            italic={state.italic}
            onColorChange={setColor}
            onStrokeWidthChange={setStrokeWidth}
            onFontSizeChange={setFontSize}
            onFontFamilyChange={setFontFamily}
            onToggleBold={toggleBold}
            onToggleItalic={toggleItalic}
          />
        )}
      </div>
      {pdf.doc && (
        <PageManager
          doc={pdf.doc}
          currentPage={pdf.currentPage}
          onRotatePage={pdf.rotatePage}
          onDeletePage={pdf.deletePage}
          onDuplicatePage={pdf.duplicatePage}
          onInsertPage={pdf.insertBlankPage}
        />
      )}
      <StatusBar
        fileName={pdf.doc?.fileName || 'No document'}
        currentPage={pdf.currentPage}
        numPages={pdf.doc?.numPages || 0}
        scale={pdf.scale}
        modified={pdf.modified}
      />
    </div>
  );
}
