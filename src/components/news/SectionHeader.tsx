import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  categorySlug?: string;
  onMoreClick?: (slug: string) => void;
  count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  categorySlug,
  onMoreClick,
}) => {
  return (
    <div className="flex items-center justify-between border-b-2 border-[#990000] pb-2 mb-4">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-5 bg-[#990000] inline-block rounded-xs"></span>
        <h2 className="text-xl md:text-2xl font-bold font-editorial text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>

      {categorySlug && onMoreClick && (
        <button
          onClick={() => onMoreClick(categorySlug)}
          className="inline-flex items-center text-xs md:text-sm font-semibold text-[#990000] hover:text-red-800 transition-colors cursor-pointer group"
        >
          <span>আরও</span>
          <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};
