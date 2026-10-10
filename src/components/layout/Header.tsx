import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, Moon, Sun, Lock, 
  Share2, Calendar, MapPin, TrendingUp 
} from 'lucide-react';
import { Category, SiteSettings } from '../../types/news';
import { formatBengaliDate } from '../../utils/bengali';

interface HeaderProps {
  categories: Category[];
  siteSettings: SiteSettings;
  currentCategorySlug?: string;
  onNavigateCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onOpenSearch: () => void;
  onNavigateAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  siteSettings,
  currentCategorySlug,
  onNavigateCategory,
  onNavigateHome,
  onOpenSearch,
  onNavigateAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setCurrentDate(formatBengaliDate(new Date(), false));
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleCategories = categories.filter(c => c.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <header className={`sticky top-0 z-50 w-full bg-white border-b border-gray-200 transition-shadow duration-200 ${
      isScrolled ? 'shadow-md' : 'shadow-xs'
    }`}>
      {/* Top Utility Bar - gracefully shrinks on scroll */}
      <div className={`bg-[#1e293b] text-slate-200 text-xs px-4 transition-all duration-200 ${
        isScrolled ? 'hidden md:block py-1' : 'py-1.5'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              {currentDate}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              মির্জাপুর, টাঙ্গাইল
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={siteSettings.facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="ফেসবুক পেজ"
            >
              ফেসবুক
            </a>
            <span className="text-slate-600">|</span>
            <a 
              href={siteSettings.youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="ইউটিউব চ্যানেল"
            >
              ইউটিউব
            </a>
            {/* Secret admin access trigger: double click lock or access via direct hash #admin */}
            <button 
              onClick={onNavigateAdmin}
              className="text-transparent hover:text-slate-500 transition-colors cursor-pointer select-none px-1 text-[10px]"
              title=""
              aria-label="Secret admin access"
            >
              &bull;
            </button>
          </div>
        </div>
      </div>

      {/* Main Newspaper Masthead (Title Bar) - Always Visible */}
      <div className={`max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 border-b border-gray-100 transition-all duration-200 ${
        isScrolled ? 'py-1.5 md:py-2.5' : 'py-3 md:py-5'
      }`}>
        <div className="text-center md:text-left flex-1 w-full md:w-auto">
          <div 
            onClick={onNavigateHome}
            className="cursor-pointer inline-flex flex-col md:flex-row md:items-baseline md:gap-3 group"
          >
            <h1 className={`font-black tracking-tight text-[#990000] font-editorial group-hover:text-red-800 transition-all duration-200 ${
              isScrolled ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl'
            }`}>
              {siteSettings.siteTitle}
            </h1>
            <p className={`text-gray-600 font-medium tracking-wide transition-all ${
              isScrolled ? 'text-[11px] md:text-xs' : 'text-xs md:text-sm mt-0.5'
            }`}>
              {siteSettings.siteTagline} {siteSettings.siteSubtitle && <span className="hidden sm:inline text-gray-500">&bull; {siteSettings.siteSubtitle}</span>}
            </p>
          </div>
        </div>

        {/* Header Ad or Promotion Banner / Contact Info */}
        {!isScrolled ? (
          <div className="hidden lg:flex w-72 h-14 bg-gradient-to-r from-red-50 to-amber-50 rounded border border-red-100 p-2 text-center text-xs text-gray-700 flex-col justify-center shadow-xs">
            <span className="font-bold text-[#990000]">বিজ্ঞাপন ও খবরের জন্য যোগাযোগ</span>
            <span className="font-sans text-gray-600 mt-0.5">{siteSettings.contactPhone}</span>
            <span className="text-[10px] text-gray-500">{siteSettings.contactEmail}</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              {currentDate}
            </span>
            {siteSettings.contactPhone && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600 font-sans">হটলাইন: {siteSettings.contactPhone}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Primary Navigation Menu (Menu Bar) - Always Visible */}
      <nav className="w-full bg-[#990000] text-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Mobile Menu Button & Brand Title */}
          <div className="flex md:hidden items-center py-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-white hover:bg-red-800 focus:outline-none transition-colors"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span 
              onClick={onNavigateHome}
              className="ml-2 font-bold font-editorial text-base cursor-pointer tracking-wide"
            >
              {siteSettings.siteTitle}
            </span>
          </div>

          {/* Desktop Categories Bar */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 py-1 overflow-x-auto no-scrollbar font-medium text-sm lg:text-base">
            <button
              onClick={onNavigateHome}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                !currentCategorySlug ? 'bg-red-950 text-white font-bold' : 'text-red-50 hover:bg-red-800'
              }`}
            >
              প্রচ্ছদ
            </button>

            {visibleCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigateCategory(cat.slug)}
                className={`px-2.5 lg:px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  currentCategorySlug === cat.slug 
                    ? 'bg-red-950 text-white font-bold shadow-inner' 
                    : 'text-red-50 hover:bg-red-800'
                }`}
              >
                {cat.nameBn}
              </button>
            ))}
          </div>

          {/* Search Trigger */}
          <div className="flex items-center py-1">
            <button
              onClick={onOpenSearch}
              className="p-1.5 md:p-2 text-white hover:bg-red-800 rounded transition-colors cursor-pointer flex items-center gap-1.5 text-xs md:text-sm font-medium"
              title="সংবাদ অনুসন্ধান করুন"
            >
              <Search className="w-4 h-4 md:w-4.5 md:h-4.5" />
              <span className="hidden sm:inline">খুঁজুন</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-red-900 border-t border-red-800 px-4 py-3 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded text-white font-semibold hover:bg-red-800"
            >
              প্রচ্ছদ
            </button>
            {visibleCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onNavigateCategory(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-3 rounded text-white hover:bg-red-800 ${
                  currentCategorySlug === cat.slug ? 'bg-red-950 font-bold' : ''
                }`}
              >
                {cat.nameBn}
              </button>
            ))}
            <div className="pt-2 border-t border-red-800 text-xs text-red-200">
              <button 
                onClick={() => {
                  onNavigateAdmin();
                  setMobileMenuOpen(false);
                }}
                className="py-1 px-3 w-full text-left text-amber-300 font-medium"
              >
                প্রশাসনিক ড্যাশবোর্ড &rarr;
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
