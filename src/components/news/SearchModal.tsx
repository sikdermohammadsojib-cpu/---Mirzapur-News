import React, { useState, useMemo } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { formatTimeAgoBengali } from '../../utils/bengali';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  onArticleClick: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onArticleClick,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return articles.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)) ||
      a.categoryName.toLowerCase().includes(q)
    );
  }, [query, articles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
        
        {/* Search Input Box */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="খবর, বিষয় বা লেখকের নাম লিখে খুঁজুন..."
            className="w-full text-base sm:text-lg outline-none text-gray-800 placeholder-gray-400 font-medium"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded transition-colors font-sans"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-gray-100">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              মির্জাপুর, টাঙ্গাইল বা জাতীয় যে কোনো সংবাদ অনুসন্ধানে কীওয়ার্ড লিখুন।
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              "<strong>{query}</strong>" সংক্রান্ত কোনো সংবাদ পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map(article => (
              <div
                key={article.id}
                onClick={() => {
                  onArticleClick(article.slug || article.id);
                  onClose();
                }}
                className="py-3 flex gap-3 items-start cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors group"
              >
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-16 h-14 object-cover rounded shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-[#990000]">
                    {article.categoryName}
                  </span>
                  <h4 className="text-sm font-bold font-editorial text-gray-900 group-hover:text-[#990000] line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                    <span>{article.author}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgoBengali(article.publishedAt)}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#990000] self-center shrink-0" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
