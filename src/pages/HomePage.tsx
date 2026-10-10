import React, { useMemo } from 'react';
import { 
  TrendingUp, Award, MapPin, Globe, Landmark, 
  GraduationCap, Trophy, Cpu, Film, ShieldAlert, HeartPulse 
} from 'lucide-react';
import { NewsArticle, Category, AdSettings, SiteSettings } from '../types/news';
import { LeadStory } from '../components/news/LeadStory';
import { NewsCard } from '../components/news/NewsCard';
import { SectionHeader } from '../components/news/SectionHeader';
import { PhotoGallerySection } from '../components/news/PhotoGallerySection';
import { VideoSection } from '../components/news/VideoSection';
import { AdSlot } from '../components/ads/AdSlot';

interface HomePageProps {
  articles: NewsArticle[];
  categories: Category[];
  adSettings: AdSettings;
  siteSettings: SiteSettings;
  onArticleClick: (slug: string) => void;
  onCategoryClick: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  categories,
  adSettings,
  siteSettings,
  onArticleClick,
  onCategoryClick,
}) => {
  const publishedArticles = useMemo(() => {
    return articles
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [articles]);

  // Lead Story
  const leadArticle = useMemo(() => {
    if (siteSettings.leadStoryId) {
      const found = publishedArticles.find(a => a.id === siteSettings.leadStoryId);
      if (found) return found;
    }
    const marked = publishedArticles.find(a => a.isLeadStory);
    return marked || publishedArticles[0];
  }, [publishedArticles, siteSettings.leadStoryId]);

  // Sub stories for the hero block
  const heroSubArticles = useMemo(() => {
    return publishedArticles.filter(a => a.id !== leadArticle?.id).slice(0, 3);
  }, [publishedArticles, leadArticle]);

  // Most Read (sorted by viewCount)
  const mostReadArticles = useMemo(() => {
    return [...publishedArticles].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
  }, [publishedArticles]);

  // Filter articles by category
  const getCategoryArticles = (catId: string, limit = 4) => {
    return publishedArticles.filter(a => a.categoryId === catId || a.categoryName === catId).slice(0, limit);
  };

  const mirzapurArticles = useMemo(() => getCategoryArticles('mirzapur', 4), [publishedArticles]);
  const tangailArticles = useMemo(() => getCategoryArticles('tangail', 4), [publishedArticles]);
  const nationalArticles = useMemo(() => getCategoryArticles('national', 4), [publishedArticles]);
  const politicsArticles = useMemo(() => getCategoryArticles('politics', 3), [publishedArticles]);
  const economyArticles = useMemo(() => getCategoryArticles('economy', 3), [publishedArticles]);
  const internationalArticles = useMemo(() => getCategoryArticles('international', 3), [publishedArticles]);
  const educationArticles = useMemo(() => getCategoryArticles('education', 3), [publishedArticles]);
  const sportsArticles = useMemo(() => getCategoryArticles('sports', 3), [publishedArticles]);
  const techArticles = useMemo(() => getCategoryArticles('tech', 3), [publishedArticles]);
  const entertainmentArticles = useMemo(() => getCategoryArticles('entertainment', 3), [publishedArticles]);
  const crimeArticles = useMemo(() => getCategoryArticles('crime', 3), [publishedArticles]);
  const healthArticles = useMemo(() => getCategoryArticles('health', 3), [publishedArticles]);
  const photoArticles = useMemo(() => getCategoryArticles('photos', 3), [publishedArticles]);
  const videoArticles = useMemo(() => getCategoryArticles('videos', 3), [publishedArticles]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Top Banner Advertisement Slot */}
      <AdSlot
        placement="topBanner"
        enabled={adSettings.topBannerEnabled}
        code={adSettings.topBannerCode}
        imageUrl={adSettings.topBannerImage}
        linkUrl={adSettings.topBannerLink}
      />

      {/* 1 & 2. Lead Story / Hero Section */}
      {leadArticle && (
        <LeadStory
          leadArticle={leadArticle}
          subArticles={heroSubArticles}
          onArticleClick={onArticleClick}
        />
      )}

      {/* 3 & 4. Latest News + Most Read (Split columns) */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Latest News (8 columns) */}
          <div className="lg:col-span-8">
            <SectionHeader 
              title="সর্বশেষ সংবাদ" 
              onMoreClick={() => onCategoryClick('national')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {publishedArticles.slice(1, 5).map(article => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onClick={onArticleClick}
                />
              ))}
            </div>
          </div>

          {/* Most Read (4 columns sidebar) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 border-b-2 border-red-700 pb-2 mb-4">
              <TrendingUp className="w-5 h-5 text-red-700" />
              <h3 className="text-lg font-bold font-editorial text-gray-900">
                সর্বাধিক পঠিত
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {mostReadArticles.map((article, idx) => (
                <div
                  key={article.id}
                  onClick={() => onArticleClick(article.slug || article.id)}
                  className="py-3 flex items-start gap-3 cursor-pointer group"
                >
                  <span className="text-2xl font-bold font-editorial text-gray-300 group-hover:text-red-700 shrink-0 w-6">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-[11px] font-semibold text-[#990000] block mb-0.5">
                      {article.categoryName}
                    </span>
                    <h4 className="text-sm font-bold font-editorial text-gray-800 group-hover:text-[#990000] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Ad Placement */}
            <div className="mt-6 pt-4 border-t border-gray-100">
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
      </section>

      {/* 5 & 6. Mirzapur Local News + Tangail News Section */}
      <section className="mb-12 bg-red-50/40 p-6 rounded-2xl border border-red-100">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-[#990000]" />
          <h2 className="text-2xl md:text-3xl font-black font-editorial text-gray-900">
            মির্জাপুর ও টাঙ্গাইল সংবাদের বিশেষ পাতা
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mirzapur Local */}
          <div>
            <SectionHeader
              title="মির্জাপুর স্থানীয় খবর"
              categorySlug="mirzapur"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-4">
              {mirzapurArticles.length > 0 ? (
                mirzapurArticles.map(article => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    variant="horizontal"
                    onClick={onArticleClick}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm">কোনো খবর পাওয়া যায়নি।</p>
              )}
            </div>
          </div>

          {/* Tangail District */}
          <div>
            <SectionHeader
              title="টাঙ্গাইল জেলা সংবাদ"
              categorySlug="tangail"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-4">
              {tangailArticles.length > 0 ? (
                tangailArticles.map(article => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    variant="horizontal"
                    onClick={onArticleClick}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm">কোনো খবর পাওয়া যায়নি।</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ad slot: Between Sections Banner */}
      <AdSlot
        placement="betweenSections"
        enabled={adSettings.betweenSectionsBannerEnabled}
        code={adSettings.betweenSectionsBannerCode}
        imageUrl={adSettings.betweenSectionsBannerImage}
        linkUrl={adSettings.betweenSectionsBannerLink}
      />

      {/* 7, 8, 9, 10. Politics, National, International, Economy in 4-column block */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Politics */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <SectionHeader
              title="রাজনীতি"
              categorySlug="politics"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-3">
              {politicsArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="compact" onClick={onArticleClick} />
              ))}
            </div>
          </div>

          {/* National */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <SectionHeader
              title="বাংলাদেশ / জাতীয়"
              categorySlug="national"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-3">
              {nationalArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="compact" onClick={onArticleClick} />
              ))}
            </div>
          </div>

          {/* International */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <SectionHeader
              title="আন্তর্জাতিক"
              categorySlug="international"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-3">
              {internationalArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="compact" onClick={onArticleClick} />
              ))}
            </div>
          </div>

          {/* Economy */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <SectionHeader
              title="অর্থনীতি ও বাণিজ্য"
              categorySlug="economy"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-3">
              {economyArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="compact" onClick={onArticleClick} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 11, 12, 13. Education, Sports, Technology */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Education */}
          <div>
            <SectionHeader
              title="শিক্ষা ও ক্যাম্পাস"
              categorySlug="education"
              onMoreClick={onCategoryClick}
            />
            {educationArticles[0] && (
              <NewsCard article={educationArticles[0]} onClick={onArticleClick} />
            )}
            <div className="mt-3 space-y-2">
              {educationArticles.slice(1).map(art => (
                <NewsCard key={art.id} article={art} variant="compact" onClick={onArticleClick} />
              ))}
            </div>
          </div>

          {/* Sports */}
          <div>
            <SectionHeader
              title="খেলাধুলা"
              categorySlug="sports"
              onMoreClick={onCategoryClick}
            />
            {sportsArticles[0] && (
              <NewsCard article={sportsArticles[0]} onClick={onArticleClick} />
            )}
            <div className="mt-3 space-y-2">
              {sportsArticles.slice(1).map(art => (
                <NewsCard key={art.id} article={art} variant="compact" onClick={onArticleClick} />
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <SectionHeader
              title="তথ্যপ্রযুক্তি ও উদ্ভাবন"
              categorySlug="tech"
              onMoreClick={onCategoryClick}
            />
            {techArticles[0] && (
              <NewsCard article={techArticles[0]} onClick={onArticleClick} />
            )}
            <div className="mt-3 space-y-2">
              {techArticles.slice(1).map(art => (
                <NewsCard key={art.id} article={art} variant="compact" onClick={onArticleClick} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 14, 15, 16. Entertainment, Crime, Health */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <SectionHeader
              title="বিনোদন ও সংস্কৃতি"
              categorySlug="entertainment"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-4">
              {entertainmentArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="horizontal" onClick={onArticleClick} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              title="আইন ও অপরাধ"
              categorySlug="crime"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-4">
              {crimeArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="horizontal" onClick={onArticleClick} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              title="স্বাস্থ্য ও জীবনযাপন"
              categorySlug="health"
              onMoreClick={onCategoryClick}
            />
            <div className="space-y-4">
              {healthArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="horizontal" onClick={onArticleClick} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 17. Photo Gallery */}
      <PhotoGallerySection
        articles={photoArticles}
        onArticleClick={onArticleClick}
        onMoreClick={onCategoryClick}
      />

      {/* 18. Video News */}
      <VideoSection
        articles={videoArticles}
        onArticleClick={onArticleClick}
        onMoreClick={onCategoryClick}
      />

    </div>
  );
};
