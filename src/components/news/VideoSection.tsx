import React, { useState } from 'react';
import { Play, Video, X } from 'lucide-react';
import { NewsArticle } from '../../types/news';

interface VideoSectionProps {
  articles: NewsArticle[];
  onArticleClick: (slug: string) => void;
  onMoreClick?: (slug: string) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  articles,
  onArticleClick,
  onMoreClick,
}) => {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  if (articles.length === 0) return null;

  return (
    <section className="mb-12 bg-white border border-gray-200 p-6 rounded-xl shadow-xs">
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-6">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-red-600" />
          <h2 className="text-xl md:text-2xl font-bold font-editorial text-gray-900 tracking-tight">
            ভিডিও সংবাদ &bull; মাল্টিমিডিয়া
          </h2>
        </div>
        {onMoreClick && (
          <button 
            onClick={() => onMoreClick('videos')}
            className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
          >
            সব ভিডিও &rarr;
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div 
            key={art.id}
            onClick={() => {
              if (art.videoUrl) {
                setActiveVideoUrl(art.videoUrl);
              } else {
                onArticleClick(art.slug || art.id);
              }
            }}
            className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="relative aspect-video bg-black">
              <img 
                src={art.featuredImage} 
                alt={art.title}
                className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 transition-all shadow-lg">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-3">
              <h3 className="text-sm font-bold font-editorial text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                {art.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button 
            onClick={() => setActiveVideoUrl(null)}
            className="absolute top-4 right-4 text-white hover:text-red-400 p-2"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <iframe
              src={activeVideoUrl}
              title="ভিডিও প্লেয়ার"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};
