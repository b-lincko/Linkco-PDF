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

export const DEFAULT_APP_STATE = {
  zoom: 100,
  rotation: 0,
  currentPage: 0,
  tool: 'select' as const,
  color: '#2563eb',
  strokeWidth: 2,
  fontSize: 14,
  fontFamily: 'Arial',
  bold: false,
  italic: false,
  fillColor: undefined,
  sidebarTab: 'thumbnails' as const,
  sidebarVisible: true,
  propertiesVisible: true,
  searchQuery: '',
  searchResults: [],
  currentSearchIndex: -1,
};
