export type Tool = 'select' | 'hand' | 'text' | 'highlight' | 'underline' | 'strikeout' | 'stickyNote' | 'pen' | 'rectangle' | 'ellipse' | 'arrow' | 'image' | 'signature' | 'formText' | 'formCheckbox' | 'formRadio' | 'formDropdown';

export type ExportFormat = 'pdf' | 'png' | 'jpg' | 'txt';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface AnnotationBase {
  id: string;
  pageIndex: number;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export interface TextAnnotation extends AnnotationBase {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
}

export interface HighlightAnnotation extends AnnotationBase {
  type: 'highlight';
  rects: { x: number; y: number; width: number; height: number }[];
}

export interface UnderlineAnnotation extends AnnotationBase {
  type: 'underline';
  rects: { x: number; y: number; width: number; height: number }[];
}

export interface StrikeoutAnnotation extends AnnotationBase {
  type: 'strikeout';
  rects: { x: number; y: number; width: number; height: number }[];
}

export interface StickyNoteAnnotation extends AnnotationBase {
  type: 'stickyNote';
  text: string;
  iconColor: string;
}

export interface PenAnnotation extends AnnotationBase {
  type: 'pen';
  points: Point[];
  strokeWidth: number;
}

export interface ShapeAnnotation extends AnnotationBase {
  type: 'rectangle' | 'ellipse';
  strokeWidth: number;
  fillColor?: string;
}

export interface ArrowAnnotation extends AnnotationBase {
  type: 'arrow';
  endX: number;
  endY: number;
  strokeWidth: number;
}

export interface ImageAnnotation extends AnnotationBase {
  type: 'image';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface SignatureAnnotation extends AnnotationBase {
  type: 'signature';
  points: Point[];
  strokeWidth: number;
}

export interface FormFieldAnnotation extends AnnotationBase {
  type: 'formText' | 'formCheckbox' | 'formRadio' | 'formDropdown';
  label: string;
  value: string | boolean;
  options?: string[];
  fontSize: number;
}

export type Annotation =
  | TextAnnotation
  | HighlightAnnotation
  | UnderlineAnnotation
  | StrikeoutAnnotation
  | StickyNoteAnnotation
  | PenAnnotation
  | ShapeAnnotation
  | ArrowAnnotation
  | ImageAnnotation
  | SignatureAnnotation
  | FormFieldAnnotation;

export interface PageInfo {
  index: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  rotation: number;
  scale: number;
}

export interface PDFDocument {
  fileName: string;
  filePath?: string;
  numPages: number;
  pages: PageInfo[];
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  outlines?: PDFOutlineItem[];
}

export interface PDFOutlineItem {
  title: string;
  pageNumber: number;
  children?: PDFOutlineItem[];
}

export interface Bookmark {
  id: string;
  pageIndex: number;
  title: string;
  createdAt: number;
}

export interface SearchResult {
  pageIndex: number;
  text: string;
  matchIndex: number;
  rects: { x: number; y: number; width: number; height: number }[];
}

export interface AppState {
  zoom: number;
  rotation: number;
  currentPage: number;
  tool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  fillColor?: string;
  sidebarTab: 'thumbnails' | 'outline' | 'bookmarks' | 'search';
  sidebarVisible: boolean;
  propertiesVisible: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  currentSearchIndex: number;
}

declare global {
  interface Window {
    electronAPI?: {
      openPDF: () => Promise<{ canceled: boolean; filePath?: string; fileName?: string; data?: number[] }>;
      savePDF: (data: number[], filePath?: string) => Promise<{ canceled: boolean; filePath?: string }>;
      saveAsPDF: (data: number[]) => Promise<{ canceled: boolean; filePath?: string }>;
      exportAs: (data: number[], format: string) => Promise<{ canceled: boolean; filePath?: string }>;
      getVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}
