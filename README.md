# Linkco PDF Reader

A full-featured PDF editor for Windows, built with Electron + React + TypeScript + Tailwind CSS.

## Features

- **PDF Viewer** — Render PDF pages with zoom, rotate, fit-to-width, fit-to-page
- **Annotations** — Sticky notes, highlights, underline, strikeout
- **Text Editing** — Add text boxes with customizable font, size, color, bold/italic
- **Drawing** — Freehand pen tool with adjustable color/thickness. Rectangle and ellipse shapes
- **Images** — Insert PNG/JPG onto the PDF. Resize and reposition
- **Page Management** — Reorder, delete, rotate, insert blank pages, duplicate pages
- **Form Fields** — Add text fields, checkboxes, radio buttons, dropdowns, signatures
- **Search** — Full-text search across all pages
- **Bookmarks / Outline** — Show PDF outline. Add custom bookmarks
- **Export** — Save modified PDF, export pages as images (PNG/JPG), export text
- **Clean UI** — Modern toolbar, sidebar (thumbnails/outline), status bar

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **Backend:** Electron (main + preload IPC)
- **PDF Rendering:** react-pdf (pdfjs-dist)
- **PDF Manipulation:** pdf-lib
- **Packaging:** electron-builder (NSIS installer + portable EXE)

## Prerequisites

- Node.js v22+
- npm
- Windows (for building the .exe — can develop on Linux/Mac)

## Installation

```bash
git clone https://github.com/b-lincko/Internal-progress.git
cd Internal-progress/linkco-pdf-reader
npm install
```

## Development

```bash
# Start dev server with hot reload
npm run dev
```

This starts the Vite dev server and launches Electron.

## Build for Production

```bash
# Build the app
npm run build
```

## Package for Windows

### Installer (.exe setup)
```bash
npm run build:win
```
Output: `release/Linkco PDF Reader Setup 1.0.0.exe`

### Portable (.exe no install)
```bash
npm run build:win:portable
```
Output: `release/LinkcoPDFReader-Portable-1.0.0.exe`

### Both
```bash
npm run build:win
npm run build:win:portable
```

## Project Structure

```
linkco-pdf-reader/
├── electron/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # IPC bridge (secure context)
├── src/
│   ├── main.tsx         # React entry
│   ├── App.tsx          # Main layout
│   ├── types.ts         # All TypeScript types
│   ├── index.css        # Tailwind + custom styles
│   ├── lib/
│   │   ├── constants.ts     # App constants
│   │   └── pdfUtils.ts      # PDF manipulation helpers
│   ├── hooks/
│   │   └── usePDF.ts        # PDF state management hook
│   └── components/
│       ├── Toolbar.tsx      # Top toolbar
│       ├── Sidebar.tsx      # Thumbnails / outline / bookmarks
│       ├── PDFViewer.tsx    # PDF rendering + annotation overlay
│       ├── AnnotationLayer.tsx  # SVG annotation drawing
│       ├── PropertiesPanel.tsx    # Tool properties
│       ├── PageManager.tsx      # Page operations
│       └── StatusBar.tsx        # Bottom status bar
├── public/              # Static assets
├── build/               # App icons
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+O | Open PDF |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Delete | Delete selected annotation |

## License

Internal use only. Built for Linkco.

## Support

For issues or feature requests, contact the development team.
