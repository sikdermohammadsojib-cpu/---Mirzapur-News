import { NewsArticle, Category, BreakingNewsItem, SiteSettings, AdSettings, DeploymentSettings } from '../types/news';
import { initialArticles, initialCategories, initialBreakingNews, initialSiteSettings, initialAdSettings, initialDeploymentSettings } from '../data/initialData';
import { db, rtdb } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, set, remove, onValue, get } from 'firebase/database';

const STORAGE_KEYS = {
  ARTICLES: 'mirzapur_news_articles_v1',
  CATEGORIES: 'mirzapur_news_categories_v1',
  BREAKING: 'mirzapur_news_breaking_v1',
  SETTINGS: 'mirzapur_news_settings_v1',
  ADS: 'mirzapur_news_ads_v1',
  DEPLOYMENT: 'mirzapur_news_deployment_v1',
  ADMIN_SESSION: 'mirzapur_admin_session_v1',
};

export type RtdbStatusState = {
  status: 'idle' | 'connecting' | 'connected' | 'permission_denied' | 'error';
  errorMessage: string | null;
};

type Listener<T> = (data: T) => void;

class StorageService {
  private articleListeners: Listener<NewsArticle[]>[] = [];
  private categoryListeners: Listener<Category[]>[] = [];
  private breakingListeners: Listener<BreakingNewsItem[]>[] = [];
  private settingsListeners: Listener<SiteSettings>[] = [];
  private adListeners: Listener<AdSettings>[] = [];
  private deployListeners: Listener<DeploymentSettings>[] = [];
  private rtdbStatusListeners: Listener<RtdbStatusState>[] = [];
  private rtdbStatus: RtdbStatusState = { status: 'idle', errorMessage: null };
  private syncInitialized = false;

  constructor() {
    this.initDefaults();
    this.initFirebaseSync();
  }

  public getRtdbStatus(): RtdbStatusState {
    return this.rtdbStatus;
  }

  public subscribeRtdbStatus(cb: Listener<RtdbStatusState>): () => void {
    this.rtdbStatusListeners.push(cb);
    cb(this.rtdbStatus);
    return () => {
      this.rtdbStatusListeners = this.rtdbStatusListeners.filter(l => l !== cb);
    };
  }

  private notifyRtdbStatus() {
    this.rtdbStatusListeners.forEach(cb => cb(this.rtdbStatus));
  }

  public initFirestoreSync() {
    this.initFirebaseSync();
  }

  public initFirebaseSync() {
    if (this.syncInitialized) return;
    this.syncInitialized = true;

    // 1. Firebase Realtime Database Sync (Preferred if rtdb is available)
    const realtimeDb = rtdb;
    if (realtimeDb) {
      this.rtdbStatus = { status: 'connecting', errorMessage: null };
      this.notifyRtdbStatus();

      try {
        // Sync news articles with proactive error handler
        onValue(
          ref(realtimeDb, 'news'),
          (snapshot) => {
            this.rtdbStatus = { status: 'connected', errorMessage: null };
            this.notifyRtdbStatus();

            if (snapshot.exists()) {
              const val = snapshot.val();
              const remoteArticles: NewsArticle[] = Array.isArray(val) 
                ? val.filter(Boolean) 
                : Object.values(val || {});
              
              if (remoteArticles.length > 0) {
                remoteArticles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
                localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(remoteArticles));
                this.notifyArticles(remoteArticles);
              }
            } else {
              // Seed RTDB with initial data
              const current = this.getArticles();
              const dataObj: Record<string, NewsArticle> = {};
              current.forEach(art => { dataObj[art.id] = art; });
              set(ref(realtimeDb, 'news'), dataObj).catch((e: any) => {
                if (e?.code === 'PERMISSION_DENIED' || e?.message?.includes('permission_denied')) {
                  this.rtdbStatus = {
                    status: 'permission_denied',
                    errorMessage: 'Firebase Realtime Database: Permission Denied. Please enable read/write rules in Firebase Console.'
                  };
                  this.notifyRtdbStatus();
                }
              });
            }
          },
          (error) => {
            console.warn('Realtime Database news sync error:', error);
            const isPerm = error?.message?.includes('permission_denied') || (error as any)?.code === 'PERMISSION_DENIED';
            this.rtdbStatus = {
              status: isPerm ? 'permission_denied' : 'error',
              errorMessage: isPerm
                ? 'Firebase Realtime Database: Permission Denied. অনুগ্রহ করে Firebase Console-এ Rules `.read: true, .write: true` সেট করুন।'
                : (error?.message || 'ডাটাবেজ সংযোগে সমস্যা')
            };
            this.notifyRtdbStatus();
          }
        );

        // Sync categories
        onValue(ref(realtimeDb, 'categories'), (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const remoteCategories: Category[] = Array.isArray(val)
              ? val.filter(Boolean)
              : Object.values(val || {});
            if (remoteCategories.length > 0) {
              remoteCategories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
              localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteCategories));
              this.notifyCategories(remoteCategories);
            }
          }
        });

        // Sync breaking news
        onValue(ref(realtimeDb, 'breakingNews'), (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const remoteBreaking: BreakingNewsItem[] = Array.isArray(val)
              ? val.filter(Boolean)
              : Object.values(val || {});
            if (remoteBreaking.length > 0) {
              remoteBreaking.sort((a, b) => (a.priority || 0) - (b.priority || 0));
              localStorage.setItem(STORAGE_KEYS.BREAKING, JSON.stringify(remoteBreaking));
              this.notifyBreaking(remoteBreaking);
            }
          }
        });

        // Sync site settings
        onValue(ref(realtimeDb, 'siteSettings'), (snapshot) => {
          if (snapshot.exists()) {
            const remoteSettings = snapshot.val() as SiteSettings;
            const merged = { ...this.getSiteSettings(), ...remoteSettings };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
            this.settingsListeners.forEach(cb => cb(merged));
          }
        });

        // Sync ad settings
        onValue(ref(realtimeDb, 'adSettings'), (snapshot) => {
          if (snapshot.exists()) {
            const remoteAds = snapshot.val() as AdSettings;
            const merged = { ...this.getAdSettings(), ...remoteAds };
            localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(merged));
            this.adListeners.forEach(cb => cb(merged));
          }
        });

      } catch (err) {
        console.warn('Realtime Database sync warning:', err);
      }
    }

    // 2. Cloud Firestore Sync (Fallback & Dual-Persistence)
    const firestoreDb = db;
    if (firestoreDb) {
      try {
        onSnapshot(collection(firestoreDb, 'news'), (snapshot) => {
          if (!snapshot.empty) {
            const remoteArticles: NewsArticle[] = [];
            snapshot.forEach((d) => {
              remoteArticles.push(d.data() as NewsArticle);
            });
            remoteArticles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
            localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(remoteArticles));
            this.notifyArticles(remoteArticles);
          }
        }, () => {});

        onSnapshot(collection(firestoreDb, 'categories'), (snapshot) => {
          if (!snapshot.empty) {
            const remoteCategories: Category[] = [];
            snapshot.forEach((d) => {
              remoteCategories.push(d.data() as Category);
            });
            remoteCategories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteCategories));
            this.notifyCategories(remoteCategories);
          }
        }, () => {});

        onSnapshot(collection(firestoreDb, 'breakingNews'), (snapshot) => {
          if (!snapshot.empty) {
            const remoteBreaking: BreakingNewsItem[] = [];
            snapshot.forEach((d) => {
              remoteBreaking.push(d.data() as BreakingNewsItem);
            });
            remoteBreaking.sort((a, b) => (a.priority || 0) - (b.priority || 0));
            localStorage.setItem(STORAGE_KEYS.BREAKING, JSON.stringify(remoteBreaking));
            this.notifyBreaking(remoteBreaking);
          }
        }, () => {});

        onSnapshot(doc(firestoreDb, 'siteSettings', 'main'), (d) => {
          if (d.exists()) {
            const remoteSettings = d.data() as SiteSettings;
            const merged = { ...this.getSiteSettings(), ...remoteSettings };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
            this.settingsListeners.forEach(cb => cb(merged));
          }
        }, () => {});

        onSnapshot(doc(firestoreDb, 'adSettings', 'main'), (d) => {
          if (d.exists()) {
            const remoteAds = d.data() as AdSettings;
            const merged = { ...this.getAdSettings(), ...remoteAds };
            localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(merged));
            this.adListeners.forEach(cb => cb(merged));
          }
        }, () => {});
      } catch (e) {
        console.warn('Firestore sync warning:', e);
      }
    }
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(initialArticles));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BREAKING)) {
      localStorage.setItem(STORAGE_KEYS.BREAKING, JSON.stringify(initialBreakingNews));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSiteSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADS)) {
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(initialAdSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPLOYMENT)) {
      localStorage.setItem(STORAGE_KEYS.DEPLOYMENT, JSON.stringify(initialDeploymentSettings));
    }
  }

  // Articles
  getArticles(): NewsArticle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return data ? JSON.parse(data) : initialArticles;
    } catch (e) {
      console.error('Failed to parse articles from storage', e);
      return initialArticles;
    }
  }

  getArticleBySlug(slug: string): NewsArticle | undefined {
    if (!slug) return undefined;
    const list = this.getArticles();
    
    let decodedSlug = slug;
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch (e) {
      decodedSlug = slug;
    }

    const clean = (s: string) => (s || '').trim().toLowerCase().replace(/\/$/, '');

    // 1. Exact match on slug or id (raw or decoded)
    let found = list.find(a => 
      a.slug === slug || 
      a.slug === decodedSlug || 
      a.id === slug || 
      a.id === decodedSlug
    );
    if (found) return found;

    // 2. Case-insensitive or trimmed comparison
    found = list.find(a => 
      clean(a.slug) === clean(slug) || 
      clean(a.slug) === clean(decodedSlug) ||
      clean(a.id) === clean(slug) ||
      clean(a.id) === clean(decodedSlug)
    );
    if (found) return found;

    // 3. URI encoded match
    found = list.find(a => {
      try {
        return encodeURIComponent(a.slug) === slug || a.slug === encodeURIComponent(decodedSlug);
      } catch (e) {
        return false;
      }
    });
    if (found) return found;

    // 4. Fallback: match by title similarity if slug contains title parts
    found = list.find(a => {
      const slugNormalized = clean(decodedSlug).replace(/[-_]/g, ' ');
      const titleNormalized = clean(a.title);
      return (slugNormalized.length > 5 && titleNormalized.includes(slugNormalized)) || 
             (titleNormalized.length > 5 && slugNormalized.includes(titleNormalized));
    });

    return found;
  }

  getArticleById(id: string): NewsArticle | undefined {
    const list = this.getArticles();
    return list.find(a => a.id === id);
  }

  /**
   * Actively fetch an article asynchronously from Firebase Realtime Database
   * if it was not found in the initial local state (e.g. fresh visitors opening shared links)
   */
  async fetchArticleAsync(slugOrId: string): Promise<NewsArticle | null> {
    if (!slugOrId) return null;
    
    // First, try local storage
    const local = this.getArticleBySlug(slugOrId) || this.getArticleById(slugOrId);
    if (local) return local;

    // Second, query Firebase Realtime Database
    if (rtdb) {
      try {
        const snapshot = await get(ref(rtdb, 'news'));
        if (snapshot.exists()) {
          const val = snapshot.val();
          const remoteArticles: NewsArticle[] = Array.isArray(val) 
            ? val.filter(Boolean) 
            : Object.values(val || {});
          
          if (remoteArticles.length > 0) {
            remoteArticles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
            localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(remoteArticles));
            this.notifyArticles(remoteArticles);

            const found = this.getArticleBySlug(slugOrId) || this.getArticleById(slugOrId);
            if (found) return found;
          }
        }
      } catch (err: any) {
        console.warn('Realtime Database direct fetch failed:', err);
      }
    }

    // Third, try REST API fallback
    try {
      const resp = await fetch('https://notex-3d16a-default-rtdb.firebaseio.com/news.json');
      if (resp.ok) {
        const data = await resp.json();
        if (data) {
          const list: NewsArticle[] = Array.isArray(data) ? data.filter(Boolean) : Object.values(data);
          if (list.length > 0) {
            localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
            this.notifyArticles(list);
            const found = this.getArticleBySlug(slugOrId) || this.getArticleById(slugOrId);
            if (found) return found;
          }
        }
      }
    } catch (e) {}

    return null;
  }

  /**
   * One-click manual sync that pushes all current news articles in local memory
   * to Firebase Realtime Database so other users & devices can view them
   */
  async syncAllArticlesToFirebase(): Promise<{ success: boolean; count: number; error?: string }> {
    if (!rtdb) {
      return { success: false, count: 0, error: 'Firebase Realtime Database কনফিগার করা হয়নি।' };
    }
    const articles = this.getArticles();
    if (articles.length === 0) {
      return { success: true, count: 0 };
    }

    try {
      const dataObj: Record<string, NewsArticle> = {};
      articles.forEach(art => { dataObj[art.id] = art; });
      await set(ref(rtdb, 'news'), dataObj);
      this.rtdbStatus = { status: 'connected', errorMessage: null };
      this.notifyRtdbStatus();
      return { success: true, count: articles.length };
    } catch (err: any) {
      const isPerm = err?.code === 'PERMISSION_DENIED' || err?.message?.includes('permission_denied');
      this.rtdbStatus = {
        status: isPerm ? 'permission_denied' : 'error',
        errorMessage: isPerm 
          ? 'Firebase Realtime Database: Permission Denied. অনুগ্রহ করে Firebase Console > Realtime Database > Rules-এ .read: true, .write: true সেট করুন।'
          : (err?.message || 'সিঙ্ক ব্যর্থ হয়েছে')
      };
      this.notifyRtdbStatus();
      return { 
        success: false, 
        count: 0, 
        error: isPerm 
          ? 'Firebase Rules-এ পারমিশন এরর (Permission Denied)! Firebase Console-এ গিয়ে .read: true, .write: true সেট করুন।' 
          : (err?.message || 'আপলোড ব্যর্থ হয়েছে') 
      };
    }
  }

  saveArticle(article: Partial<NewsArticle> & { title: string; categoryId: string }): NewsArticle {
    const list = this.getArticles();
    const categories = this.getCategories();
    const cat = categories.find(c => c.id === article.categoryId);
    const categoryName = cat ? cat.nameBn : 'সাধারণ';

    let savedArticle: NewsArticle;

    if (article.id) {
      // Update existing
      const index = list.findIndex(a => a.id === article.id);
      if (index !== -1) {
        savedArticle = {
          ...list[index],
          ...article,
          categoryName,
          updatedAt: new Date().toISOString(),
        };
        list[index] = savedArticle;
      } else {
        savedArticle = {
          id: article.id,
          title: article.title,
          slug: article.slug || `post-${Date.now()}`,
          excerpt: article.excerpt || '',
          content: article.content || '',
          featuredImage: article.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80',
          imageCaption: article.imageCaption,
          imageCredit: article.imageCredit,
          categoryId: article.categoryId,
          categoryName,
          tags: article.tags || [],
          author: article.author || 'মির্জাপুর নিউজ ডেস্ক',
          reporterTitle: article.reporterTitle,
          status: article.status || 'published',
          isBreaking: !!article.isBreaking,
          isFeatured: !!article.isFeatured,
          isLeadStory: !!article.isLeadStory,
          publishedAt: article.publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdAt: article.createdAt || new Date().toISOString(),
          seoTitle: article.seoTitle || article.title,
          seoDescription: article.seoDescription || article.excerpt || '',
          viewCount: article.viewCount || 0,
          commentsEnabled: article.commentsEnabled !== false,
          galleryImages: article.galleryImages,
          videoUrl: article.videoUrl
        };
        list.unshift(savedArticle);
      }
    } else {
      // Create new
      const newId = `news-${Date.now()}`;
      savedArticle = {
        id: newId,
        title: article.title,
        slug: article.slug || `article-${Date.now()}`,
        excerpt: article.excerpt || '',
        content: article.content || '',
        featuredImage: article.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80',
        imageCaption: article.imageCaption,
        imageCredit: article.imageCredit,
        categoryId: article.categoryId,
        categoryName,
        tags: article.tags || [],
        author: article.author || 'মির্জাপুর নিউজ ডেস্ক',
        reporterTitle: article.reporterTitle,
        status: article.status || 'published',
        isBreaking: !!article.isBreaking,
        isFeatured: !!article.isFeatured,
        isLeadStory: !!article.isLeadStory,
        publishedAt: article.status === 'published' ? new Date().toISOString() : '',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        seoTitle: article.seoTitle || article.title,
        seoDescription: article.seoDescription || article.excerpt || '',
        viewCount: 0,
        commentsEnabled: article.commentsEnabled !== false,
        galleryImages: article.galleryImages,
        videoUrl: article.videoUrl
      };
      list.unshift(savedArticle);
    }

    // If marked as lead story, unmark others
    if (savedArticle.isLeadStory) {
      list.forEach(a => {
        if (a.id !== savedArticle.id) {
          a.isLeadStory = false;
        }
      });
    }

    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
    this.notifyArticles(list);

    // Persist to Realtime Database
    if (rtdb) {
      set(ref(rtdb, `news/${savedArticle.id}`), savedArticle)
        .then(() => {
          this.rtdbStatus = { status: 'connected', errorMessage: null };
          this.notifyRtdbStatus();
        })
        .catch((err) => {
          console.warn('Realtime Database save article notice:', err);
          const isPerm = err?.code === 'PERMISSION_DENIED' || err?.message?.includes('permission_denied');
          this.rtdbStatus = {
            status: isPerm ? 'permission_denied' : 'error',
            errorMessage: isPerm
              ? 'Firebase Realtime Database: Permission Denied. Rules পরিবর্তন করুন (.read: true, .write: true)'
              : (err?.message || 'সংরক্ষণ ব্যর্থ')
          };
          this.notifyRtdbStatus();
        });
    }

    // Persist to Firestore
    if (db) {
      setDoc(doc(db, 'news', savedArticle.id), savedArticle).catch((err) => {
        console.warn('Firestore save article notice:', err);
      });
    }

    return savedArticle;
  }

  deleteArticle(id: string): boolean {
    let list = this.getArticles();
    const initialLen = list.length;
    list = list.filter(a => a.id !== id);
    if (list.length !== initialLen) {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
      this.notifyArticles(list);

      // Delete from Realtime Database
      if (rtdb) {
        remove(ref(rtdb, `news/${id}`)).catch(() => {});
      }

      // Delete from Firestore
      if (db) {
        deleteDoc(doc(db, 'news', id)).catch(() => {});
      }
      return true;
    }
    return false;
  }

  incrementViewCount(slugOrId: string) {
    const list = this.getArticles();
    const item = list.find(a => a.slug === slugOrId || a.id === slugOrId);
    if (item) {
      item.viewCount = (item.viewCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
      this.notifyArticles(list);

      if (rtdb) {
        set(ref(rtdb, `news/${item.id}/viewCount`), item.viewCount).catch(() => {});
      }
      if (db) {
        setDoc(doc(db, 'news', item.id), { viewCount: item.viewCount }, { merge: true }).catch(() => {});
      }
    }
  }

  subscribeArticles(cb: Listener<NewsArticle[]>): () => void {
    this.articleListeners.push(cb);
    cb(this.getArticles());
    return () => {
      this.articleListeners = this.articleListeners.filter(l => l !== cb);
    };
  }

  private notifyArticles(data: NewsArticle[]) {
    this.articleListeners.forEach(cb => cb(data));
  }

  // Categories
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : initialCategories;
    } catch (e) {
      return initialCategories;
    }
  }

  saveCategory(cat: Partial<Category> & { nameBn: string; slug: string }): Category {
    const list = this.getCategories();
    let saved: Category;

    if (cat.id) {
      const index = list.findIndex(c => c.id === cat.id);
      if (index !== -1) {
        saved = { ...list[index], ...cat };
        list[index] = saved;
      } else {
        saved = {
          id: cat.id,
          nameBn: cat.nameBn,
          nameEn: cat.nameEn || cat.nameBn,
          slug: cat.slug,
          description: cat.description,
          displayOrder: cat.displayOrder || list.length + 1,
          isVisible: cat.isVisible !== false
        };
        list.push(saved);
      }
    } else {
      saved = {
        id: `cat-${Date.now()}`,
        nameBn: cat.nameBn,
        nameEn: cat.nameEn || cat.nameBn,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder || list.length + 1,
        isVisible: cat.isVisible !== false
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    this.notifyCategories(list);

    if (rtdb) {
      set(ref(rtdb, `categories/${saved.id}`), saved).catch(() => {});
    }
    if (db) {
      setDoc(doc(db, 'categories', saved.id), saved).catch(() => {});
    }
    return saved;
  }

  deleteCategory(id: string): boolean {
    let list = this.getCategories();
    list = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    this.notifyCategories(list);

    if (rtdb) {
      remove(ref(rtdb, `categories/${id}`)).catch(() => {});
    }
    if (db) {
      deleteDoc(doc(db, 'categories', id)).catch(() => {});
    }
    return true;
  }

  subscribeCategories(cb: Listener<Category[]>): () => void {
    this.categoryListeners.push(cb);
    cb(this.getCategories());
    return () => {
      this.categoryListeners = this.categoryListeners.filter(l => l !== cb);
    };
  }

  private notifyCategories(data: Category[]) {
    this.categoryListeners.forEach(cb => cb(data));
  }

  // Breaking News
  getBreakingNews(): BreakingNewsItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BREAKING);
      return data ? JSON.parse(data) : initialBreakingNews;
    } catch (e) {
      return initialBreakingNews;
    }
  }

  saveBreakingNews(item: Partial<BreakingNewsItem> & { title: string }): BreakingNewsItem {
    const list = this.getBreakingNews();
    let saved: BreakingNewsItem;

    if (item.id) {
      const index = list.findIndex(b => b.id === item.id);
      if (index !== -1) {
        saved = { ...list[index], ...item };
        list[index] = saved;
      } else {
        saved = {
          id: item.id,
          title: item.title,
          linkUrl: item.linkUrl,
          articleId: item.articleId,
          slug: item.slug,
          priority: item.priority || list.length + 1,
          createdAt: item.createdAt || new Date().toISOString(),
          isActive: item.isActive !== false
        };
        list.push(saved);
      }
    } else {
      saved = {
        id: `brk-${Date.now()}`,
        title: item.title,
        linkUrl: item.linkUrl,
        articleId: item.articleId,
        slug: item.slug,
        priority: item.priority || list.length + 1,
        createdAt: new Date().toISOString(),
        isActive: item.isActive !== false
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.BREAKING, JSON.stringify(list));
    this.notifyBreaking(list);

    if (rtdb) {
      set(ref(rtdb, `breakingNews/${saved.id}`), saved).catch(() => {});
    }
    if (db) {
      setDoc(doc(db, 'breakingNews', saved.id), saved).catch(() => {});
    }
    return saved;
  }

  deleteBreakingNews(id: string): boolean {
    let list = this.getBreakingNews();
    list = list.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BREAKING, JSON.stringify(list));
    this.notifyBreaking(list);

    if (rtdb) {
      remove(ref(rtdb, `breakingNews/${id}`)).catch(() => {});
    }
    if (db) {
      deleteDoc(doc(db, 'breakingNews', id)).catch(() => {});
    }
    return true;
  }

  subscribeBreaking(cb: Listener<BreakingNewsItem[]>): () => void {
    this.breakingListeners.push(cb);
    cb(this.getBreakingNews());
    return () => {
      this.breakingListeners = this.breakingListeners.filter(l => l !== cb);
    };
  }

  private notifyBreaking(data: BreakingNewsItem[]) {
    this.breakingListeners.forEach(cb => cb(data));
  }

  // Site Settings
  getSiteSettings(): SiteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : initialSiteSettings;
    } catch (e) {
      return initialSiteSettings;
    }
  }

  updateSiteSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSiteSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.settingsListeners.forEach(cb => cb(updated));

    if (rtdb) {
      set(ref(rtdb, 'siteSettings'), updated).catch(() => {});
    }
    if (db) {
      setDoc(doc(db, 'siteSettings', 'main'), updated).catch(() => {});
    }
    return updated;
  }

  subscribeSettings(cb: Listener<SiteSettings>): () => void {
    this.settingsListeners.push(cb);
    cb(this.getSiteSettings());
    return () => {
      this.settingsListeners = this.settingsListeners.filter(l => l !== cb);
    };
  }

  // Ad Settings
  getAdSettings(): AdSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADS);
      return data ? { ...initialAdSettings, ...JSON.parse(data) } : initialAdSettings;
    } catch (e) {
      return initialAdSettings;
    }
  }

  updateAdSettings(newAds: Partial<AdSettings>): AdSettings {
    const current = this.getAdSettings();
    const updated = { ...current, ...newAds, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(updated));
    this.adListeners.forEach(cb => cb(updated));

    if (rtdb) {
      set(ref(rtdb, 'adSettings'), updated).catch(() => {});
    }
    if (db) {
      setDoc(doc(db, 'adSettings', 'main'), updated).catch(() => {});
    }
    return updated;
  }

  subscribeAds(cb: Listener<AdSettings>): () => void {
    this.adListeners.push(cb);
    cb(this.getAdSettings());
    return () => {
      this.adListeners = this.adListeners.filter(l => l !== cb);
    };
  }

  // Deployment Settings
  getDeploymentSettings(): DeploymentSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEPLOYMENT);
      return data ? JSON.parse(data) : initialDeploymentSettings;
    } catch (e) {
      return initialDeploymentSettings;
    }
  }

  updateDeploymentSettings(newDeploy: Partial<DeploymentSettings>): DeploymentSettings {
    const current = this.getDeploymentSettings();
    const updated = { ...current, ...newDeploy };
    localStorage.setItem(STORAGE_KEYS.DEPLOYMENT, JSON.stringify(updated));
    this.deployListeners.forEach(cb => cb(updated));
    return updated;
  }

  subscribeDeployment(cb: Listener<DeploymentSettings>): () => void {
    this.deployListeners.push(cb);
    cb(this.getDeploymentSettings());
    return () => {
      this.deployListeners = this.deployListeners.filter(l => l !== cb);
    };
  }

  // Reset to default sample news
  resetDefaults() {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(initialArticles));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    localStorage.setItem(STORAGE_KEYS.BREAKING, JSON.stringify(initialBreakingNews));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSiteSettings));
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(initialAdSettings));
    localStorage.setItem(STORAGE_KEYS.DEPLOYMENT, JSON.stringify(initialDeploymentSettings));
    this.notifyArticles(initialArticles);
    this.notifyCategories(initialCategories);
    this.notifyBreaking(initialBreakingNews);
    this.settingsListeners.forEach(cb => cb(initialSiteSettings));
    this.adListeners.forEach(cb => cb(initialAdSettings));
    this.deployListeners.forEach(cb => cb(initialDeploymentSettings));
  }
}

export const storage = new StorageService();
