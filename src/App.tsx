/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { storage } from './services/storage';
import { initFirebase, onAuthChange } from './services/firebase';
import { 
  NewsArticle, Category, BreakingNewsItem, SiteSettings, AdSettings, DeploymentSettings 
} from './types/news';

// Public Layout & Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BreakingTicker } from './components/layout/BreakingTicker';
import { SearchModal } from './components/news/SearchModal';
import { AdsterraGlobalAds } from './components/ads/AdsterraGlobalAds';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { StaticPage } from './pages/StaticPage';

// Admin Components
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';
import { DashboardOverview } from './admin/DashboardOverview';
import { NewsManager } from './admin/NewsManager';
import { CategoryManager } from './admin/CategoryManager';
import { BreakingNewsManager } from './admin/BreakingNewsManager';
import { AdsManager } from './admin/AdsManager';
import { SettingsManager } from './admin/SettingsManager';
import { DeploymentManager } from './admin/DeploymentManager';

export default function App() {
  // Application Data States
  const [articles, setArticles] = useState<NewsArticle[]>(storage.getArticles());
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>(storage.getBreakingNews());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(storage.getSiteSettings());
  const [adSettings, setAdSettings] = useState<AdSettings>(storage.getAdSettings());
  const [deploySettings, setDeploySettings] = useState<DeploymentSettings>(storage.getDeploymentSettings());

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<'home' | 'article' | 'category' | 'static' | 'admin'>('home');
  const [routeParam, setRouteParam] = useState<string>('');
  
  // Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Initial Sync Loading state to prevent flashing 'Not Found' on fresh direct shared link loads
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Admin Authentication & Sub-tab
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'overview' | 'news' | 'categories' | 'breaking' | 'ads' | 'settings' | 'deploy'>('overview');

  // Comprehensive URL route resolver supporting query params, hash routing, and direct pathnames
  const parseRouteFromLocation = (): { route: 'home' | 'article' | 'category' | 'static' | 'admin'; param: string } => {
    // 1. Search Query Parameters (?news=... or ?article=... or ?category=... or ?page=... or ?admin)
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const newsQuery = searchParams.get('news') || searchParams.get('article') || searchParams.get('post') || searchParams.get('slug') || searchParams.get('id');
      if (newsQuery) {
        let clean = newsQuery.trim();
        try { clean = decodeURIComponent(clean); } catch (e) {}
        return { route: 'article', param: clean.replace(/\/$/, '') };
      }

      const catQuery = searchParams.get('category') || searchParams.get('cat');
      if (catQuery) {
        let clean = catQuery.trim();
        try { clean = decodeURIComponent(clean); } catch (e) {}
        return { route: 'category', param: clean.replace(/\/$/, '') };
      }

      const pageQuery = searchParams.get('page');
      if (pageQuery) {
        return { route: 'static', param: pageQuery.trim().replace(/\/$/, '') };
      }

      if (searchParams.has('admin')) {
        return { route: 'admin', param: '' };
      }
    } catch (e) {}

    // 2. Hash Routing (#news/... or #/news/... or #category/... or #page/... or #admin)
    try {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (rawHash) {
        let hash = rawHash;
        try { hash = decodeURIComponent(rawHash); } catch (e) {}

        if (hash.startsWith('news/') || hash.startsWith('article/')) {
          const slug = hash.replace(/^(news|article)\//, '').replace(/\/$/, '');
          return { route: 'article', param: slug };
        } else if (hash.startsWith('category/')) {
          const cat = hash.replace(/^category\//, '').replace(/\/$/, '');
          return { route: 'category', param: cat };
        } else if (hash.startsWith('page/')) {
          const pageId = hash.replace(/^page\//, '').replace(/\/$/, '');
          return { route: 'static', param: pageId };
        } else if (hash.startsWith('admin')) {
          return { route: 'admin', param: '' };
        }
      }
    } catch (e) {}

    // 3. Pathname (/news/... or /article/... or /category/... or /page/... or /admin)
    try {
      const rawPath = window.location.pathname.replace(/^\//, '').trim();
      if (rawPath) {
        let path = rawPath;
        try { path = decodeURIComponent(rawPath); } catch (e) {}

        if (path.startsWith('news/') || path.startsWith('article/')) {
          const slug = path.replace(/^(news|article)\//, '').replace(/\/$/, '');
          if (slug) {
            return { route: 'article', param: slug };
          }
        } else if (path.startsWith('category/')) {
          const cat = path.replace(/^category\//, '').replace(/\/$/, '');
          if (cat) {
            return { route: 'category', param: cat };
          }
        } else if (path.startsWith('page/')) {
          const pageId = path.replace(/^page\//, '').replace(/\/$/, '');
          if (pageId) {
            return { route: 'static', param: pageId };
          }
        } else if (path === 'admin' || path.startsWith('admin/')) {
          return { route: 'admin', param: '' };
        }
      }
    } catch (e) {}

    return { route: 'home', param: '' };
  };

  // Initialization & URL Synchronization
  useEffect(() => {
    // Attempt Firebase initialization & live Firestore sync
    initFirebase();
    storage.initFirestoreSync();

    // Check for saved admin session
    try {
      const session = localStorage.getItem('mirzapur_admin_session_v1');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.email || parsed.authenticated) {
          setAdminUser(parsed.email || 'এডমিনিস্ট্রেটর');
        }
      }
    } catch (e) {}

    // Listen for Firebase Auth
    const unsubAuth = onAuthChange((user) => {
      if (user && user.email) {
        setAdminUser(user.email);
      }
    });

    // Reactive subscriptions to storage updates
    const unsubArticles = storage.subscribeArticles(setArticles);
    const unsubCategories = storage.subscribeCategories(setCategories);
    const unsubBreaking = storage.subscribeBreaking(setBreakingNews);
    const unsubSettings = storage.subscribeSettings(setSiteSettings);
    const unsubAds = storage.subscribeAds(setAdSettings);
    const unsubDeploy = storage.subscribeDeployment(setDeploySettings);

    // Multi-format route synchronization
    const syncRouteFromLocation = async () => {
      const resolved = parseRouteFromLocation();
      setCurrentRoute(resolved.route);
      setRouteParam(resolved.param);
      
      if (resolved.route === 'article' && resolved.param) {
        storage.incrementViewCount(resolved.param);
        
        // If article is not currently in memory, actively fetch it from Firebase RTDB
        const exists = storage.getArticleBySlug(resolved.param) || storage.getArticleById(resolved.param);
        if (!exists) {
          setIsInitialLoading(true);
          try {
            await storage.fetchArticleAsync(resolved.param);
          } finally {
            setIsInitialLoading(false);
          }
        } else {
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    };

    window.addEventListener('hashchange', syncRouteFromLocation);
    window.addEventListener('popstate', syncRouteFromLocation);
    syncRouteFromLocation(); // Handle initial load immediately

    const initialSafetyTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 4000);

    return () => {
      clearTimeout(initialSafetyTimer);
      window.removeEventListener('hashchange', syncRouteFromLocation);
      window.removeEventListener('popstate', syncRouteFromLocation);
      unsubAuth();
      unsubArticles();
      unsubCategories();
      unsubBreaking();
      unsubSettings();
      unsubAds();
      unsubDeploy();
    };
  }, []);

  // Navigation Handlers
  const navigateToHome = () => {
    window.location.hash = '';
    window.history.pushState(null, '', '/');
    setCurrentRoute('home');
    setRouteParam('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToArticle = (slug: string) => {
    let cleanSlug = slug;
    try {
      cleanSlug = decodeURIComponent(slug);
    } catch (e) {}
    window.location.hash = `news/${cleanSlug}`;
    window.history.pushState(null, '', `/?news=${encodeURIComponent(cleanSlug)}#news/${encodeURIComponent(cleanSlug)}`);
    setCurrentRoute('article');
    setRouteParam(cleanSlug);
    storage.incrementViewCount(cleanSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string) => {
    let cleanCat = slug;
    try {
      cleanCat = decodeURIComponent(slug);
    } catch (e) {}
    window.location.hash = `category/${cleanCat}`;
    window.history.pushState(null, '', `/?category=${encodeURIComponent(cleanCat)}#category/${encodeURIComponent(cleanCat)}`);
    setCurrentRoute('category');
    setRouteParam(cleanCat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStaticPage = (page: 'about' | 'privacy' | 'terms' | 'contact') => {
    window.location.hash = `page/${page}`;
    window.history.pushState(null, '', `/?page=${page}#page/${page}`);
    setCurrentRoute('static');
    setRouteParam(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    window.history.pushState(null, '', `/?admin=true#admin`);
    setCurrentRoute('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('mirzapur_admin_session_v1');
    setAdminUser(null);
    navigateToHome();
  };

  // Find current article if on article page
  const currentArticle = useMemo(() => {
    if (!routeParam) return undefined;
    return storage.getArticleBySlug(routeParam) || 
           storage.getArticleById(routeParam) || 
           articles.find(a => a.slug === routeParam || a.id === routeParam);
  }, [routeParam, articles]);

  // Render Admin View
  if (currentRoute === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          adminPassword={siteSettings.adminPassword}
          onLoginSuccess={(email) => setAdminUser(email)}
          onBackToSite={navigateToHome}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        adminEmail={adminUser}
        onLogout={handleAdminLogout}
        onNavigateSite={navigateToHome}
      >
        {adminTab === 'overview' && (
          <DashboardOverview
            articles={articles}
            categories={categories}
            breakingNews={breakingNews}
            adSettings={adSettings}
            deploymentSettings={deploySettings}
            onNavigateTab={setAdminTab}
            onNewArticle={() => setAdminTab('news')}
          />
        )}

        {adminTab === 'news' && (
          <NewsManager
            articles={articles}
            categories={categories}
            onSaveArticle={(data) => storage.saveArticle(data)}
            onDeleteArticle={(id) => storage.deleteArticle(id)}
            onViewArticle={navigateToArticle}
          />
        )}

        {adminTab === 'categories' && (
          <CategoryManager
            categories={categories}
            articles={articles}
            onSaveCategory={(data) => storage.saveCategory(data)}
            onDeleteCategory={(id) => storage.deleteCategory(id)}
          />
        )}

        {adminTab === 'breaking' && (
          <BreakingNewsManager
            breakingNews={breakingNews}
            articles={articles}
            onSaveItem={(data) => storage.saveBreakingNews(data)}
            onDeleteItem={(id) => storage.deleteBreakingNews(id)}
          />
        )}

        {adminTab === 'ads' && (
          <AdsManager
            adSettings={adSettings}
            onUpdateAdSettings={(data) => storage.updateAdSettings(data)}
          />
        )}

        {adminTab === 'settings' && (
          <SettingsManager
            settings={siteSettings}
            onUpdateSettings={(data) => storage.updateSiteSettings(data)}
            onResetDefaults={() => storage.resetDefaults()}
          />
        )}

        {adminTab === 'deploy' && (
          <DeploymentManager
            articles={articles}
            categories={categories}
            siteSettings={siteSettings}
            deploymentSettings={deploySettings}
            onUpdateDeploymentSettings={(data) => storage.updateDeploymentSettings(data)}
          />
        )}
      </AdminLayout>
    );
  }

  // Render Public Website
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#1a1a1a]">
      
      {/* Sticky Newspaper Header */}
      <Header
        categories={categories}
        siteSettings={siteSettings}
        currentCategorySlug={currentRoute === 'category' ? routeParam : undefined}
        onNavigateCategory={navigateToCategory}
        onNavigateHome={navigateToHome}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateAdmin={navigateToAdmin}
      />

      {/* Breaking News Ticker */}
      <BreakingTicker
        items={breakingNews}
        enabled={siteSettings.tickerEnabled}
        onItemClick={navigateToArticle}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage
            articles={articles}
            categories={categories}
            adSettings={adSettings}
            siteSettings={siteSettings}
            onArticleClick={navigateToArticle}
            onCategoryClick={navigateToCategory}
          />
        )}

        {currentRoute === 'article' && (
          currentArticle ? (
            <ArticlePage
              article={currentArticle}
              allArticles={articles}
              adSettings={adSettings}
              siteSettings={siteSettings}
              onNavigateHome={navigateToHome}
              onNavigateCategory={navigateToCategory}
              onArticleClick={navigateToArticle}
            />
          ) : isInitialLoading ? (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
              <div className="w-10 h-10 border-4 border-[#990000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold font-editorial text-gray-800 mb-1">সংবাদটি লোড হচ্ছে...</h2>
              <p className="text-xs text-gray-500">অনুরোধকৃত প্রতিবেদনটি ডাটাবেজ থেকে প্রস্তুত করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-[#990000] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-editorial text-gray-800 mb-2">সংবাদটি প্রদর্শিত হচ্ছে না</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                অনুরোধকৃত প্রতিবেদনটি ডাটাবেজ থেকে খুঁজে পাওয়া যায়নি অথবা সার্ভার পারমিশন সীমাবদ্ধ। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={async () => {
                    setIsInitialLoading(true);
                    if (routeParam) {
                      await storage.fetchArticleAsync(routeParam);
                    }
                    setIsInitialLoading(false);
                  }}
                  className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  পুনরায় লোড করুন
                </button>
                <button
                  onClick={navigateToHome}
                  className="bg-[#990000] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-800 transition-colors cursor-pointer"
                >
                  প্রচ্ছদে ফিরে যান
                </button>
              </div>
            </div>
          )
        )}

        {currentRoute === 'category' && (
          <CategoryPage
            categorySlug={routeParam}
            categories={categories}
            articles={articles}
            adSettings={adSettings}
            onArticleClick={navigateToArticle}
            onNavigateHome={navigateToHome}
          />
        )}

        {currentRoute === 'static' && (
          <StaticPage
            page={(routeParam as any) || 'about'}
            siteSettings={siteSettings}
            onNavigateHome={navigateToHome}
          />
        )}
      </main>

      {/* Newspaper Footer */}
      <Footer
        categories={categories}
        siteSettings={siteSettings}
        onNavigateCategory={navigateToCategory}
        onNavigateHome={navigateToHome}
        onNavigatePage={navigateToStaticPage}
        onNavigateAdmin={navigateToAdmin}
      />

      {/* Universal Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onArticleClick={navigateToArticle}
      />

      {/* Global Adsterra Social Bar & Popunder Manager */}
      <AdsterraGlobalAds adSettings={adSettings} />

    </div>
  );
}
