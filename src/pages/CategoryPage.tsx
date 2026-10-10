import React, { useState, useMemo } from 'react';
import { NewsArticle, Category, AdSettings } from '../types/news';
import { NewsCard } from '../components/news/NewsCard';
import { SectionHeader } from '../components/news/SectionHeader';
import { AdSlot } from '../components/ads/AdSlot';

interface CategoryPageProps {
  categorySlug: string;
  categories: Category[];
  articles: NewsArticle[];
  adSettings: AdSettings;
  onArticleClick: (slug: string) => void;
  onNavigateHome: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  categories,
  articles,
  adSettings,
  onArticleClick,
  onNavigateHome,
}) => {
  const [visibleCount, setVisibleCount] = useState(8);

  const category = useMemo(() => {
    return categories.find(c => c.slug === categorySlug || c.id === categorySlug) || {
      id: categorySlug,
      nameBn: categorySlug === 'mirzapur' ? 'মির্জাপুর' : 'সংবাদ',
      nameEn: 'News',
      slug: categorySlug,
      displayOrder: 1,
      isVisible: true,
      description: 'এই বিভাগের সর্বশেষ সংবাদ ও প্রতিবেদন।'
    };
  }, [categories, categorySlug]);

  const categoryArticles = useMemo(() => {
    return articles
      .filter(a => (a.categoryId === category.id || a.categoryName === category.nameBn) && a.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [articles, category.id, category.nameBn]);

  const displayedArticles = categoryArticles.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-xs">
        <nav className="text-xs text-gray-500 mb-2 flex items-center gap-2">
          <button onClick={onNavigateHome} className="hover:text-[#990000] cursor-pointer">
            প্রচ্ছদ
          </button>
          <span>&gt;</span>
          <span className="font-semibold text-[#990000]">{category.nameBn}</span>
        </nav>
        
        <h1 className="text-3xl font-black font-editorial text-gray-900">
          {category.nameBn}
        </h1>
        {category.description && (
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{category.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Articles List (8 cols) */}
        <div className="lg:col-span-8">
          {categoryArticles.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500">
              এই বিভাগে বর্তমানে কোনো সংবাদ প্রকাশিত হয়নি।
            </div>
          ) : (
            <div className="space-y-4">
              {displayedArticles.map((article, idx) => (
                <NewsCard
                  key={article.id || idx}
                  article={article}
                  variant={idx === 0 ? 'standard' : 'horizontal'}
                  onClick={onArticleClick}
                />
              ))}

              {visibleCount < categoryArticles.length && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="bg-white hover:bg-red-50 text-[#990000] border-2 border-[#990000] font-bold px-8 py-2.5 rounded-lg text-sm transition-all shadow-xs cursor-pointer hover:shadow"
                  >
                    আরও খবর লোড করুন ({categoryArticles.length - visibleCount}টি বাকি)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <SectionHeader title="অন্যান্য বিভাগ" />
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.slug !== categorySlug && c.isVisible).map(cat => (
                <a
                  key={cat.id}
                  href={`#category/${cat.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = `#category/${cat.slug}`;
                  }}
                  className="text-xs bg-gray-50 hover:bg-red-50 hover:text-red-700 border border-gray-200 px-3 py-1.5 rounded-md font-medium text-gray-700 transition-colors"
                >
                  {cat.nameBn}
                </a>
              ))}
            </div>
          </div>

          {/* Ad Slot */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <AdSlot
              placement="sidebar"
              enabled={adSettings.sidebarBannerEnabled}
              code={adSettings.sidebarBannerCode}
              imageUrl={adSettings.sidebarBannerImage}
              linkUrl={adSettings.sidebarBannerLink}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
