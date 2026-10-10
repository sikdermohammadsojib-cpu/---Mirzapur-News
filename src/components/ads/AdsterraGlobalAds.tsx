import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, Zap, ChevronRight, ExternalLink } from 'lucide-react';
import { AdSettings } from '../../types/news';
import { AdInjector } from '../../utils/adInjector';

interface AdsterraGlobalAdsProps {
  adSettings: AdSettings;
}

export const AdsterraGlobalAds: React.FC<AdsterraGlobalAdsProps> = ({ adSettings }) => {
  const [socialBarVisible, setSocialBarVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const lastPopunderTimeRef = useRef<number>(0);

  // 1. Reset Social Bar dismissed state whenever socialBarEnabled is turned ON
  useEffect(() => {
    if (adSettings.socialBarEnabled) {
      setDismissed(false);
      const timer = setTimeout(() => {
        setSocialBarVisible(true);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setSocialBarVisible(false);
    }
  }, [adSettings.socialBarEnabled]);

  // 2. Manage external Adsterra Social Bar script tag via centralized AdInjector with delay
  useEffect(() => {
    if (!adSettings.socialBarEnabled) {
      AdInjector.remove('socialbar');
      return;
    }

    // Delay Social Bar script injection by 1200ms and run during idle time to protect initial page paint
    const cleanup = AdInjector.inject('socialbar', adSettings.socialBarCode, {
      delayMs: 1200,
      idle: true,
    });
    return cleanup;
  }, [adSettings.socialBarEnabled, adSettings.socialBarCode]);

  // 3. Manage external Adsterra Popunder script tag via centralized AdInjector with delay
  useEffect(() => {
    if (!adSettings.popunderEnabled) {
      AdInjector.remove('popunder');
      return;
    }

    // Delay Popunder script injection by 2000ms and wait for idle to protect main thread performance
    const cleanup = AdInjector.inject('popunder', adSettings.popunderCode, {
      delayMs: 2000,
      idle: true,
    });
    return cleanup;
  }, [adSettings.popunderEnabled, adSettings.popunderCode]);

  // 4. Guaranteed User-Gesture Popunder Click Interceptor
  useEffect(() => {
    if (!adSettings.popunderEnabled) return;

    const handlePageClick = (e: MouseEvent) => {
      // Do not trigger popunder inside the admin panel or inside form inputs
      if (window.location.hash.includes('admin')) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target?.closest('.admin-panel, #admin, .no-popunder, input, textarea, select')) {
        return;
      }

      const now = Date.now();
      // Rate limit: at most once every 45 seconds per session
      if (now - lastPopunderTimeRef.current < 45000) {
        return;
      }

      // Determine popunder destination URL
      let popunderUrl = (adSettings.popunderUrl || '').trim();
      
      // If no explicit popunderUrl is configured, extract URL from popunderCode
      if (!popunderUrl && adSettings.popunderCode) {
        const urlMatch = adSettings.popunderCode.match(/https?:\/\/[^\s"'<>]+/);
        if (urlMatch) {
          popunderUrl = urlMatch[0];
        } else {
          const protoRelative = adSettings.popunderCode.match(/\/\/[^\s"'<>]+\.com[^\s"'<>]*/);
          if (protoRelative) {
            popunderUrl = 'https:' + protoRelative[0];
          }
        }
      }

      if (popunderUrl && (popunderUrl.startsWith('http://') || popunderUrl.startsWith('https://'))) {
        lastPopunderTimeRef.current = now;
        try {
          const popWin = window.open(popunderUrl, '_blank');
          if (popWin) {
            window.focus();
          }
        } catch (err) {
          console.warn('Popunder click open note:', err);
        }
      }
    };

    // Attach to document capture so it reliably triggers on reader clicks
    document.addEventListener('click', handlePageClick, { capture: true });
    return () => {
      document.removeEventListener('click', handlePageClick, { capture: true });
    };
  }, [adSettings.popunderEnabled, adSettings.popunderUrl, adSettings.popunderCode]);

  // 5. Listen for test preview triggers from Admin Panel
  useEffect(() => {
    const handleSocialBarPreview = () => {
      setDismissed(false);
      setSocialBarVisible(true);
    };

    const handlePopunderPreview = (e: Event) => {
      const customEvent = e as CustomEvent<{ url?: string }>;
      let targetUrl = customEvent.detail?.url || adSettings.popunderUrl?.trim();
      if (!targetUrl && adSettings.popunderCode) {
        const match = adSettings.popunderCode.match(/https?:\/\/[^\s"'<>]+/);
        if (match) targetUrl = match[0];
      }
      if (!targetUrl) {
        targetUrl = 'https://mirzapurnews.com/advertise';
      }
      try {
        window.open(targetUrl, '_blank');
      } catch (err) {
        console.warn('Popunder test open note:', err);
      }
    };

    window.addEventListener('trigger-socialbar-preview', handleSocialBarPreview);
    window.addEventListener('trigger-popunder-preview', handlePopunderPreview as EventListener);
    return () => {
      window.removeEventListener('trigger-socialbar-preview', handleSocialBarPreview);
      window.removeEventListener('trigger-popunder-preview', handlePopunderPreview as EventListener);
    };
  }, [adSettings.popunderUrl, adSettings.popunderCode]);

  if (!adSettings.socialBarEnabled || !socialBarVisible || dismissed) {
    return null;
  }

  const title = adSettings.socialBarTitle || 'মির্জাপুর নিউজ বিশেষ বুলেটিন ও অফার';
  const description = adSettings.socialBarDescription || 'বিজ্ঞাপন প্রচার ও স্থানীয় ব্যবসায়িক প্রসারের জন্য আজই যোগাযোগ করুন।';
  const linkUrl = adSettings.socialBarLink || '#page/contact';
  const imageUrl = adSettings.socialBarImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&h=120&fit=crop&q=80';

  return (
    <aside
      aria-label="সোশ্যাল বার বিজ্ঞাপন"
      className="no-popunder fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 max-w-sm w-[calc(100%-24px)] sm:w-96 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-red-500 p-3.5 transition-all duration-300 animate-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail with pulsing badge */}
        <div className="relative shrink-0">
          <img
            src={imageUrl}
            alt="বিজ্ঞাপন"
            className="w-14 h-14 rounded-xl object-cover border border-red-200 shadow-xs"
          />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white p-0.5 rounded-full shadow">
            <Zap className="w-2.5 h-2.5 fill-current" />
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-red-100 text-red-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
              বিজ্ঞাপন &bull; Adsterra Social Bar
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-gray-900 font-editorial line-clamp-1 leading-snug">
            {title}
          </h4>
          <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
            {description}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <a
              href={linkUrl}
              target={linkUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="bg-[#990000] hover:bg-red-800 text-white text-[11px] font-bold px-3 py-1 rounded-md inline-flex items-center gap-1 transition-colors shadow-2xs"
            >
              <span>বিস্তারিত দেখুন</span>
              <ChevronRight className="w-3 h-3" />
            </a>
            <span className="text-[10px] text-gray-400">স্পন্সরড</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            setSocialBarVisible(false);
            setDismissed(true);
          }}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="বিজ্ঞাপন বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
