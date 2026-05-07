import React, { useState } from 'react';
import { LayoutGrid, BookOpen, Bookmark, Search, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { PDFDocument, Annotation, Bookmark as BookmarkType } from '@/types';

interface SidebarProps {
  doc: PDFDocument;
  annotations: Annotation[];
  bookmarks: BookmarkType[];
  currentPage: number;
  scale: number;
  tab: 'thumbnails' | 'outline' | 'bookmarks' | 'search';
  onTabChange: (t: 'thumbnails' | 'outline' | 'bookmarks' | 'search') => void;
  onPageSelect: (page: number) => void;
  onAddBookmark: (b: BookmarkType) => void;
  onDeleteBookmark: (id: string) => void;
}

export default function Sidebar({ doc, annotations, bookmarks, currentPage, tab, onTabChange, onPageSelect, onAddBookmark, onDeleteBookmark }: SidebarProps) {
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOutlines, setExpandedOutlines] = useState<Set<number>>(new Set());

  const tabs = [
    { id: 'thumbnails' as const, icon: LayoutGrid, label: 'Pages' },
    { id: 'outline' as const, icon: BookOpen, label: 'Outline' },
    { id: 'bookmarks' as const, icon: Bookmark, label: 'Bookmarks' },
    { id: 'search' as const, icon: Search, label: 'Search' },
  ];

  const handleAddBookmark = () => {
    if (!bookmarkTitle.trim()) return;
    onAddBookmark({
      id: crypto.randomUUID(),
      pageIndex: currentPage,
      title: bookmarkTitle.trim(),
      createdAt: Date.now(),
    });
    setBookmarkTitle('');
  };

  return (
    <div className="w-64 bg-sidebar border-r border-border flex flex-col shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex-1 py-2 flex justify-center items-center hover:bg-slate-200 transition-colors ${tab === t.id ? 'bg-white border-b-2 border-primary text-primary' : 'text-text-muted'}`}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {tab === 'thumbnails' && (
          <div className="space-y-1">
            {doc.pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => onPageSelect(idx)}
                className={`thumbnail w-full flex flex-col items-center p-2 rounded border ${currentPage === idx ? 'active border-primary' : 'border-transparent'}`}
              >
                <div className="w-full aspect-[3/4] bg-white rounded shadow-sm flex items-center justify-center text-xs text-text-muted border border-border">
                  Page {idx + 1}
                </div>
                <span className="text-xs mt-1 text-text-muted">{idx + 1}</span>
              </button>
            ))}
          </div>
        )}

        {tab === 'outline' && (
          <div className="space-y-0.5">
            {doc.outlines && doc.outlines.length > 0 ? (
              doc.outlines.map((item, idx) => (
                <OutlineItem key={idx} item={item} level={0} onPageSelect={onPageSelect} />
              ))
            ) : (
              <div className="text-sm text-text-muted text-center py-8">No outline available</div>
            )}
          </div>
        )}

        {tab === 'bookmarks' && (
          <div className="space-y-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={bookmarkTitle}
                onChange={e => setBookmarkTitle(e.target.value)}
                placeholder="Bookmark name..."
                className="flex-1 text-sm px-2 py-1 border border-border rounded bg-white"
                onKeyDown={e => e.key === 'Enter' && handleAddBookmark()}
              />
              <button onClick={handleAddBookmark} className="tool-btn p-1"><Plus size={16} /></button>
            </div>
            {bookmarks.length === 0 ? (
              <div className="text-sm text-text-muted text-center py-4">No bookmarks yet</div>
            ) : (
              bookmarks.map(b => (
                <div key={b.id} className="flex items-center gap-2 p-2 hover:bg-slate-200 rounded group">
                  <Bookmark size={14} className="text-primary shrink-0" />
                  <button onClick={() => onPageSelect(b.pageIndex)} className="flex-1 text-left text-sm truncate">
                    {b.title}
                  </button>
                  <span className="text-xs text-text-muted">p.{b.pageIndex + 1}</span>
                  <button onClick={() => onDeleteBookmark(b.id)} className="opacity-0 group-hover:opacity-100 text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'search' && (
          <div className="space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in document..."
              className="w-full text-sm px-2 py-1 border border-border rounded bg-white"
            />
            <div className="text-sm text-text-muted text-center py-4">
              Search across all pages (coming soon)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OutlineItem({ item, level, onPageSelect }: { item: any; level: number; onPageSelect: (p: number) => void }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          else onPageSelect(item.pageNumber - 1);
        }}
        className="flex items-center gap-1 w-full text-left text-sm py-1 px-1 hover:bg-slate-200 rounded"
        style={{ paddingLeft: `${level * 12 + 4}px` }}
      >
        {hasChildren && (
          expanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />
        )}
        <span className="truncate">{item.title}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {item.children.map((child: any, idx: number) => (
            <OutlineItem key={idx} item={child} level={level + 1} onPageSelect={onPageSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
