import React, { useEffect, useRef } from 'react';
import { AdInjector } from '../../utils/adInjector';

interface AdSlotProps {
  placement: 'topBanner' | 'betweenSections' | 'articleTop' | 'articleMiddle' | 'articleBottom' | 'sidebar';
  enabled: boolean;
  code?: string;
  imageUrl?: string;
  linkUrl?: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  placement,
  enabled,
  code,
  imageUrl,
  linkUrl,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !code || !containerRef.current) {
      AdInjector.remove(placement);
      return;
    }

    const container = containerRef.current;
    container.innerHTML = '';

    // Utilize centralized AdInjector with IntersectionObserver so scripts only inject
    // when within 250px of the viewport, with a slight 80ms delay to keep initial page render smooth
    const cleanup = AdInjector.inject(placement, code, {
      targetElement: container,
      targetContainer: container,
      rootMargin: '250px 0px',
      delayMs: 80,
      idle: true,
    });

    return () => {
      cleanup();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [enabled, code, placement]);

  if (!enabled) return null;

  return (
    <div className={`ad-slot my-4 mx-auto text-center ${className}`}>
      <div className="inline-block w-full max-w-full">
        {/* Subtle Ad label */}
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 select-none font-sans">
          বিজ্ঞাপন &bull; ADVERTISEMENT
        </div>

        {/* Script Container if code exists */}
        {code && code.trim().length > 0 && !code.startsWith('<!--') ? (
          <div 
            ref={containerRef} 
            className="overflow-hidden min-h-[50px] flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded"
          />
        ) : imageUrl ? (
          // Graphic Banner Fallback
          <a
            href={linkUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded border border-gray-200 hover:opacity-95 transition-opacity"
          >
            <img
              src={imageUrl}
              alt="বিজ্ঞাপন"
              className="w-full h-auto object-cover max-h-[160px] mx-auto"
              loading="lazy"
            />
          </a>
        ) : (
          // Professional Newspaper Promotional Sponsor Banner when enabled but asset pending
          <a
            href={linkUrl || '#page/contact'}
            className="block py-4 px-6 bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border border-red-200/80 rounded-lg hover:border-red-400 transition-colors shadow-2xs group text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
              <div className="text-left">
                <span className="text-[11px] font-bold text-[#990000] uppercase tracking-wider block">
                  বিজ্ঞাপন প্রচার ও স্পন্সরশিপ
                </span>
                <span className="text-sm font-bold text-gray-800 font-editorial group-hover:text-red-800 transition-colors">
                  মির্জাপুর ও টাঙ্গাইলের লাখো পাঠকের কাছে আপনার প্রতিষ্ঠানের বিজ্ঞাপন দিন
                </span>
              </div>
              <div className="bg-[#990000] text-white text-xs font-bold px-3 py-1.5 rounded shadow-xs shrink-0 group-hover:bg-red-800 transition-colors">
                যোগাযোগ: ০১৭১২-৩৪৫৬৭৮ &rarr;
              </div>
            </div>
          </a>
        )}
      </div>
    </div>
  );
};
