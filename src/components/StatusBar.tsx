import React from 'react';
import { FileText, FileCheck, ZoomIn } from 'lucide-react';

interface StatusBarProps {
  fileName: string;
  currentPage: number;
  numPages: number;
  scale: number;
  modified: boolean;
}

export default function StatusBar({ fileName, currentPage, numPages, scale, modified }: StatusBarProps) {
  return (
    <div className="h-7 bg-status border-t border-border flex items-center px-3 text-xs text-text-muted shrink-0 gap-4">
      <div className="flex items-center gap-1">
        <FileText size={14} />
        <span className="max-w-[200px] truncate">{fileName}</span>
        {modified && (
          <span className="text-warning ml-1 flex items-center gap-0.5">
            <FileCheck size={12} />
            Modified
          </span>
        )}
      </div>
      
      {numPages > 0 && (
        <div className="flex items-center gap-1">
          <span>Page {currentPage + 1} of {numPages}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 ml-auto">
        <ZoomIn size={14} />
        <span>{Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
}
