import React from 'react';
import { Clock, User, Flame, ArrowUpRight } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { formatTimeAgoBengali } from '../../utils/bengali';

interface LeadStoryProps {
  leadArticle: NewsArticle;
  subArticles: NewsArticle[];
  onArticleClick: (slug: string) => void;
}

export const LeadStory: React.FC<LeadStoryProps> = ({
  leadArticle,
  subArticles,
  onArticleClick,
}) => {
  if (!leadArticle) return null;

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-xs">
        
        {/* Main Lead Story (8 cols on desktop) */}
        <div 
          onClick={() => onArticleClick(leadArticle.slug || leadArticle.id)}
          className="lg:col-span-8 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="relative overflow-hidden rounded-lg aspect-16/9 bg-gray-100 mb-4">
              <img 
                src={leadArticle.featuredImage} 
                alt={leadArticle.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-[#990000] text-white text-xs font-bold px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                  প্রধান খবর
                </span>
                {leadArticle.isBreaking && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    ব্রেকিং
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#990000] tracking-wider uppercase">
                {leadArticle.categoryName}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-editorial text-gray-900 group-hover:text-[#990000] transition-colors leading-tight">
                {leadArticle.title}
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 pt-1">
                {leadArticle.excerpt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 mt-4 border-t border-gray-100">
            <span className="flex items-center gap-1.5 font-medium text-gray-800">
              <User className="w-3.5 h-3.5 text-red-700" />
              {leadArticle.author}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {formatTimeAgoBengali(leadArticle.publishedAt)}
            </span>
          </div>
        </div>

        {/* Side Lead Column: 3 Top Headlines (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-200 lg:pl-6 pt-4 lg:pt-0">
          <div className="border-b border-gray-200 pb-2 mb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>শীর্ষ বিশেষ সংবাদ</span>
              <ArrowUpRight className="w-4 h-4 text-[#990000]" />
            </h3>
          </div>

          <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-around">
            {subArticles.slice(0, 3).map((article, idx) => (
              <div 
                key={article.id || idx}
                onClick={() => onArticleClick(article.slug || article.id)}
                className="py-3 cursor-pointer group"
              >
                <div className="flex gap-3 items-start">
                  {article.featuredImage && (
                    <img 
                      src={article.featuredImage} 
                      alt={article.title}
                      className="w-20 h-16 object-cover rounded shrink-0 group-hover:opacity-90"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-[#990000] block mb-0.5">
                      {article.categoryName}
                    </span>
                    <h4 className="text-sm font-bold font-editorial text-gray-900 group-hover:text-[#990000] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      {formatTimeAgoBengali(article.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-red-50/70 p-3 rounded border border-red-100 text-xs text-red-950 mt-3">
            <strong>জরুরি খবর পাঠান:</strong> আপনার এলাকার যে কোনো গুরুত্বপূর্ণ খবর বা ছবি পাঠাতে যোগাযোগ করুন আমাদের হটলাইনে: <span className="font-semibold text-red-700 font-sans">+880 1712-345678</span>
          </div>
        </div>

      </div>
    </section>
  );
};
