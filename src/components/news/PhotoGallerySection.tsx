import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { SectionHeader } from './SectionHeader';

interface PhotoGallerySectionProps {
  articles: NewsArticle[];
  onArticleClick: (slug: string) => void;
  onMoreClick?: (slug: string) => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  articles,
  onArticleClick,
  onMoreClick,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string } | null>(null);

  if (articles.length === 0) return null;

  return (
    <section className="mb-12 bg-slate-900 text-white p-6 rounded-xl">
      <div className="flex items-center justify-between border-b-2 border-red-500 pb-2 mb-6">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-red-500" />
          <h2 className="text-xl md:text-2xl font-bold font-editorial text-white tracking-tight">
            ছবিঘর &bull; ফটো ফিচার
          </h2>
        </div>
        {onMoreClick && (
          <button 
            onClick={() => onMoreClick('photos')}
            className="text-xs text-red-400 hover:text-white transition-colors cursor-pointer"
          >
            সব ছবি দেখুন &rarr;
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.slice(0, 3).map((art, idx) => (
          <div 
            key={art.id || idx}
            onClick={() => onArticleClick(art.slug || art.id)}
            className="group relative cursor-pointer overflow-hidden rounded-lg aspect-4/3 bg-slate-800"
          >
            <img 
              src={art.featuredImage} 
              alt={art.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="inline-flex items-center gap-1 text-[11px] bg-red-600 text-white px-2 py-0.5 rounded font-semibold mb-1.5">
                <Camera className="w-3 h-3" />
                ফটো গ্যালারি
              </span>
              <h3 className="text-sm font-bold font-editorial text-white group-hover:text-red-200 transition-colors line-clamp-2 leading-snug">
                {art.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-red-400 p-2"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] text-center">
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.caption}
              className="max-h-[75vh] mx-auto rounded shadow-2xl" 
            />
            <p className="text-white text-sm mt-3">{lightboxImage.caption}</p>
          </div>
        </div>
      )}
    </section>
  );
};
