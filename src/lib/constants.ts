import { Tool } from '../types';

export const DEFAULT_COLORS = [
  '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ffffff',
];

export const HIGHLIGHT_COLORS = [
  '#fef08a', '#bfdbfe', '#bbf7d0', '#fecaca', '#ddd6fe', '#fbcfe8', '#fed7aa',
];

export const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Trebuchet MS', 'Impact', 'Comic Sans MS',
];

export const STROKE_WIDTHS = [1, 2, 3, 4, 5, 8, 12];

export const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200, 300, 400];

export const DEFAULT_APP_STATE: {
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
  searchResults: never[];
  currentSearchIndex: number;
} = {
  zoom: 100,
  rotation: 0,
  currentPage: 0,
  tool: 'select',
  color: '#2563eb',
  strokeWidth: 2,
  fontSize: 14,
  fontFamily: 'Arial',
  bold: false,
  italic: false,
  fillColor: undefined,
  sidebarTab: 'thumbnails',
  sidebarVisible: true,
  propertiesVisible: true,
  searchQuery: '',
  searchResults: [],
  currentSearchIndex: -1,
};
