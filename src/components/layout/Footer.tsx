import React from 'react';
import { Mail, Phone, MapPin, Facebook, Youtube, Twitter, ShieldCheck } from 'lucide-react';
import { Category, SiteSettings } from '../../types/news';

interface FooterProps {
  categories: Category[];
  siteSettings: SiteSettings;
  onNavigateCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigatePage: (page: 'about' | 'privacy' | 'terms' | 'contact') => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  siteSettings,
  onNavigateCategory,
  onNavigateHome,
  onNavigatePage,
  onNavigateAdmin,
}) => {
  const visibleCategories = categories.filter(c => c.isVisible);

  return (
    <footer className="bg-[#111827] text-gray-300 mt-16 border-t-4 border-[#990000]">
      {/* Top Footer Banner */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Newspaper Identity */}
          <div className="space-y-4">
            <h2 
              onClick={onNavigateHome}
              className="text-2xl font-black text-white font-editorial tracking-tight cursor-pointer hover:text-red-400"
            >
              {siteSettings.siteTitle}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              {siteSettings.siteTagline}। মির্জাপুর, টাঙ্গাইল ও সারা বাংলাদেশের সর্বশেষ সত্যনিষ্ঠ ও বস্তুনিষ্ঠ সংবাদ সবার আগে পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ।
            </p>
            
            <div className="text-xs text-gray-400 space-y-1.5 pt-2 border-t border-gray-800">
              <div><strong>ভারপ্রাপ্ত সম্পাদক:</strong> {siteSettings.editorName}</div>
              <div><strong>প্রকাশক:</strong> {siteSettings.publisherName}</div>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href={siteSettings.facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={siteSettings.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href={siteSettings.twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-colors"
                title="X / Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              বিভাগসমূহ
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {visibleCategories.slice(0, 10).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onNavigateCategory(cat.slug)}
                  className="text-left text-gray-400 hover:text-white hover:underline transition-colors py-1 cursor-pointer"
                >
                  {cat.nameBn}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Contact & Address */}
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              যোগাযোগ ও কার্যালয়
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                <span>{siteSettings.contactAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-sans">{siteSettings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-sans">{siteSettings.contactEmail}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Links & Policies */}
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              গুরুত্বপূর্ণ লিঙ্ক
            </h3>
            <div className="space-y-2 text-sm">
              <button 
                onClick={() => onNavigatePage('about')}
                className="block text-gray-400 hover:text-white cursor-pointer"
              >
                আমাদের সম্পর্কে
              </button>
              <button 
                onClick={() => onNavigatePage('privacy')}
                className="block text-gray-400 hover:text-white cursor-pointer"
              >
                গোপনীয়তা নীতি (Privacy Policy)
              </button>
              <button 
                onClick={() => onNavigatePage('terms')}
                className="block text-gray-400 hover:text-white cursor-pointer"
              >
                ব্যবহারের শর্তাবলী (Terms of Service)
              </button>
              <button 
                onClick={() => onNavigatePage('contact')}
                className="block text-gray-400 hover:text-white cursor-pointer"
              >
                বিজ্ঞাপন ও যোগাযোগ
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="bg-gray-950 py-4 px-4 text-xs text-gray-500 border-t border-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div 
            onDoubleClick={onNavigateAdmin}
            title="মির্জাপুর নিউজ"
            className="select-none cursor-default"
          >
            &copy; {new Date().getFullYear()} {siteSettings.siteTitle}। সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="text-gray-600">
            কারিগরি রূপায়ণ ও প্রকাশনা: মির্জাপুর নিউজ ডিজিটাল টিম
          </div>
        </div>
      </div>
    </footer>
  );
};
