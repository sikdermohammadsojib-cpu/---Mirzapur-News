import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { BreakingNewsItem } from '../../types/news';

interface BreakingTickerProps {
  items: BreakingNewsItem[];
  enabled: boolean;
  onItemClick: (slugOrId: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  items,
  enabled,
  onItemClick,
}) => {
  const activeItems = items.filter(i => i.isActive).sort((a, b) => a.priority - b.priority);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!activeItems.length || !enabled) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeItems.length, enabled]);

  if (!enabled || activeItems.length === 0) return null;

  const currentItem = activeItems[currentIndex] || activeItems[0];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeItems.length) % activeItems.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeItems.length);
  };

  return (
    <div className="w-full bg-slate-900 text-white border-b border-red-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-10 overflow-hidden">
        {/* Badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-[#990000] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs mr-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>শিরোনাম</span>
        </div>

        {/* Ticker Content */}
        <div className="flex-1 truncate text-sm">
          <button
            onClick={() => {
              if (currentItem.linkArticleSlug) {
                onItemClick(currentItem.linkArticleSlug);
              } else if (currentItem.linkArticleId) {
                onItemClick(currentItem.linkArticleId);
              }
            }}
            className="text-slate-100 hover:text-amber-300 font-medium truncate text-left transition-colors cursor-pointer w-full text-sm leading-none"
          >
            {currentItem.title}
          </button>
        </div>

        {/* Controls */}
        <div className="shrink-0 flex items-center gap-1 text-slate-400 pl-2">
          <button
            onClick={handlePrev}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
            aria-label="আগের সংবাদ"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-sans text-slate-400 px-1">
            {currentIndex + 1}/{activeItems.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
            aria-label="পরের সংবাদ"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
