import React from 'react';
import { Clock, User, Flame } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { formatTimeAgoBengali } from '../../utils/bengali';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'standard' | 'horizontal' | 'compact' | 'overlay';
  onClick: (slug: string) => void;
  showCategory?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  variant = 'standard',
  onClick,
  showCategory = true,
}) => {
  const handleClick = () => {
    onClick(article.slug || article.id);
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="group cursor-pointer py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/80 px-2 rounded transition-colors"
      >
        <div className="flex items-start gap-3">
          {article.featuredImage && (
            <img 
              src={article.featuredImage} 
              alt={article.title}
              className="w-16 h-12 object-cover rounded shrink-0 group-hover:opacity-90"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold font-editorial text-gray-900 group-hover:text-[#990000] transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {formatTimeAgoBengali(article.publishedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div 
        onClick={handleClick}
        className="group cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:border-red-200 hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4"
      >
        <div className="sm:w-1/3 shrink-0 relative overflow-hidden rounded">
          <img 
            src={article.featuredImage} 
            alt={article.title}
            className="w-full h-36 sm:h-full object-cover group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
          />
          {article.isBreaking && (
            <span className="absolute top-2 left-2 bg-[#990000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
              ব্রেকিং
            </span>
          )}
        </div>
        <div className="sm:w-2/3 flex flex-col justify-between">
          <div>
            {showCategory && (
              <span className="text-xs font-semibold text-[#990000] uppercase tracking-wide">
                {article.categoryName}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-bold font-editorial text-gray-900 group-hover:text-[#990000] transition-colors mt-1 line-clamp-2 leading-tight">
              {article.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 line-clamp-2">
              {article.excerpt}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              {article.author}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {formatTimeAgoBengali(article.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div 
        onClick={handleClick}
        className="group cursor-pointer relative h-64 sm:h-80 rounded-lg overflow-hidden shadow-sm"
      >
        <img 
          src={article.featuredImage} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {showCategory && (
            <span className="inline-block bg-[#990000] text-white text-[11px] font-bold px-2 py-0.5 rounded mb-2">
              {article.categoryName}
            </span>
          )}
          <h3 className="text-lg sm:text-xl font-bold font-editorial leading-tight group-hover:text-red-200 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-300 mt-2">
            <span>{article.author}</span>
            <span>&bull;</span>
            <span>{formatTimeAgoBengali(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Standard vertical card
  return (
    <article 
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-lg border border-gray-200 hover:border-red-200 hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-video bg-gray-100">
        <img 
          src={article.featuredImage} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        {article.isBreaking && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-[#990000] text-white text-xs font-bold px-2 py-0.5 rounded shadow">
            <Flame className="w-3 h-3 fill-current" />
            ব্রেকিং
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {showCategory && (
            <span className="text-xs font-semibold text-[#990000] uppercase tracking-wide">
              {article.categoryName}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold font-editorial text-gray-900 group-hover:text-[#990000] transition-colors mt-1 line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-2.5 border-t border-gray-100">
          <span className="truncate max-w-[120px] sm:max-w-[140px] text-gray-700 font-medium">
            {article.author}
          </span>
          <span className="flex items-center gap-1 shrink-0 text-gray-400">
            <Clock className="w-3 h-3" />
            {formatTimeAgoBengali(article.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
};
