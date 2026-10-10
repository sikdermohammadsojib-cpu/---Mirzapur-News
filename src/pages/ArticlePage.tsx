import React, { useEffect, useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { 
  Clock, User, Share2, Printer, Copy, Check, 
  Facebook, MessageCircle, ChevronLeft, ChevronRight, 
  Eye, Tag, MessageSquare, Send, Sparkles 
} from 'lucide-react';
import { NewsArticle, AdSettings, SiteSettings, Comment } from '../types/news';
import { formatBengaliDate, toBengaliNumber } from '../utils/bengali';
import { AdSlot } from '../components/ads/AdSlot';
import { NewsCard } from '../components/news/NewsCard';
import { SectionHeader } from '../components/news/SectionHeader';

interface ArticlePageProps {
  article: NewsArticle;
  allArticles: NewsArticle[];
  adSettings: AdSettings;
  siteSettings: SiteSettings;
  onNavigateHome: () => void;
  onNavigateCategory: (slug: string) => void;
  onArticleClick: (slug: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  article,
  allArticles,
  adSettings,
  siteSettings,
  onNavigateHome,
  onNavigateCategory,
  onArticleClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Set document title and Open Graph meta tags dynamically
  useEffect(() => {
    const titleText = `${article.seoTitle || article.title} | ${siteSettings.siteTitle}`;
    const descText = article.excerpt || article.seoDescription || siteSettings.siteTagline;
    const imgUrl = article.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mirzapur-news24.netlify.app';
    const cleanSlug = article.slug || article.id;
    const currentUrl = `${baseUrl}/?news=${encodeURIComponent(cleanSlug)}`;

    document.title = titleText;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Helper to safely set or create meta tag
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', descText);
    setMeta('property', 'og:title', article.title);
    setMeta('property', 'og:description', descText);
    setMeta('property', 'og:image', imgUrl);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:site_name', siteSettings.siteTitle);
    setMeta('property', 'fb:app_id', '966242223397117');
    setMeta('name', 'twitter:title', article.title);
    setMeta('name', 'twitter:description', descText);
    setMeta('name', 'twitter:image', imgUrl);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Load existing comments from local storage
    const commentKey = `comments_${article.id}`;
    const savedComments = localStorage.getItem(commentKey);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        setComments([]);
      }
    } else {
      // Sample starter comment for community engagement
      setComments([
        {
          id: 'c1',
          articleId: article.id,
          authorName: 'মাসুদ রানা (মির্জাপুর)',
          content: 'খুবই তথ্যবহুল ও গুরুত্বপূর্ণ সংবাদ। মির্জাপুর নিউজের বস্তুনিষ্ঠ সাংবাদিকতার সাফল্য কামনা করি।',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isApproved: true,
        }
      ]);
    }
  }, [article.id, article.title, article.seoTitle, article.excerpt, article.featuredImage, article.slug, siteSettings.siteTitle, siteSettings.siteTagline]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mirzapur-news24.netlify.app';
  const cleanSlug = article.slug || article.id;
  const articleUrl = `${baseUrl}/?news=${encodeURIComponent(cleanSlug)}`;

  const handleCopyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(articleUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        fallbackCopy(articleUrl);
      });
    } else {
      fallbackCopy(articleUrl);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy fallback failed', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      articleId: article.id,
      authorName: newCommentAuthor.trim(),
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_${article.id}`, JSON.stringify(updated));
    setNewCommentAuthor('');
    setNewCommentText('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  // Related news (same category, excluding current)
  const relatedArticles = useMemo(() => {
    return allArticles
      .filter(a => a.id !== article.id && a.categoryId === article.categoryId && a.status === 'published')
      .slice(0, 3);
  }, [allArticles, article.id, article.categoryId]);

  // Previous and next article
  const { prevArticle, nextArticle } = useMemo(() => {
    const published = allArticles.filter(a => a.status === 'published');
    const currentIndex = published.findIndex(a => a.id === article.id);
    return {
      prevArticle: currentIndex > 0 ? published[currentIndex - 1] : undefined,
      nextArticle: currentIndex < published.length - 1 ? published[currentIndex + 1] : undefined,
    };
  }, [allArticles, article.id]);

  // Sanitize HTML safely to prevent script injection
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(article.content || '', {
      ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'img', 'br', 'hr', 'figure', 'figcaption'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
    });
  }, [article.content]);

  return (
    <article className="max-w-7xl mx-auto px-4 py-8 article-container">
      
      {/* Top Banner Advertisement */}
      <AdSlot
        placement="articleTop"
        enabled={adSettings.articleTopBannerEnabled}
        code={adSettings.articleTopBannerCode}
        imageUrl={adSettings.articleTopBannerImage}
        linkUrl={adSettings.articleTopBannerLink}
        className="no-print"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Article Body (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-8 rounded-xl border border-gray-200 shadow-xs">
          
          {/* Breadcrumb Navigation */}
          <nav className="text-xs text-gray-500 mb-4 flex items-center gap-2 no-print">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#990000] cursor-pointer"
            >
              প্রচ্ছদ
            </button>
            <span>&gt;</span>
            <button 
              onClick={() => onNavigateCategory(article.categoryId)}
              className="hover:text-[#990000] font-semibold text-[#990000] cursor-pointer"
            >
              {article.categoryName}
            </button>
          </nav>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-editorial text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-6 border-l-4 border-red-600 pl-4 py-1 italic bg-red-50/30 rounded-r">
              {article.excerpt}
            </p>
          )}

          {/* Author, Date, View Count & Share toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-100 text-xs sm:text-sm text-gray-600 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 font-medium text-gray-900">
                <User className="w-4 h-4 text-[#990000]" />
                <span>{article.author}</span>
                {article.reporterTitle && (
                  <span className="text-gray-500 font-normal">({article.reporterTitle})</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>প্রকাশ: {formatBengaliDate(article.publishedAt, true)}</span>
              </div>
              {article.viewCount !== undefined && (
                <div className="flex items-center gap-1 text-gray-500 no-print">
                  <Eye className="w-3.5 h-3.5" />
                  <span>পঠিত: {toBengaliNumber(article.viewCount)} বার</span>
                </div>
              )}
            </div>

            {/* Social Share Buttons & Tools */}
            <div className="flex items-center gap-2 no-print social-share-bar">
              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                title="ফেসবুকে শেয়ার করুন"
              >
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">শেয়ার</span>
              </a>

              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                title="হোয়াটসঅ্যাপে শেয়ার করুন"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">হোয়াটসঅ্যাপ</span>
              </a>

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="লিঙ্ক কপি করুন"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="প্রিন্ট করুন"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">প্রিন্ট</span>
              </button>
            </div>
          </div>

          {/* Main Featured Image */}
          {article.featuredImage && (
            <figure className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.imageCaption || article.title}
                className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-xs"
              />
              {(article.imageCaption || article.imageCredit) && (
                <figcaption className="text-xs text-gray-500 mt-2 italic flex justify-between">
                  <span>{article.imageCaption}</span>
                  {article.imageCredit && <span>ছবি: {article.imageCredit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Middle Banner Ad */}
          <AdSlot
            placement="articleMiddle"
            enabled={adSettings.articleMiddleBannerEnabled}
            code={adSettings.articleMiddleBannerCode}
            imageUrl={adSettings.articleMiddleBannerImage}
            linkUrl={adSettings.articleMiddleBannerLink}
            className="no-print my-6"
          />

          {/* Article Rich Text Content */}
          <div 
            className="article-body prose prose-lg max-w-none text-gray-800 text-base sm:text-lg leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Photo Gallery inside article if any */}
          {article.galleryImages && article.galleryImages.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold font-editorial mb-4">আরও আলোকচিত্র:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {article.galleryImages.map((img, i) => (
                  <div key={i} className="rounded overflow-hidden">
                    <img src={img.url} alt={img.caption} className="w-full h-48 object-cover" />
                    {img.caption && <p className="text-xs text-gray-500 mt-1">{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-200 no-print">
              <Tag className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-gray-600">ট্যাগ:</span>
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Bottom Banner Ad */}
          <AdSlot
            placement="articleBottom"
            enabled={adSettings.articleBottomBannerEnabled}
            code={adSettings.articleBottomBannerCode}
            imageUrl={adSettings.articleBottomBannerImage}
            linkUrl={adSettings.articleBottomBannerLink}
            className="no-print mt-8"
          />

          {/* Previous & Next Article Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200 no-print">
            {prevArticle ? (
              <div
                onClick={() => onArticleClick(prevArticle.slug || prevArticle.id)}
                className="p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/20 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <ChevronLeft className="w-3.5 h-3.5 text-red-600" />
                  <span>পূর্ববর্তী সংবাদ</span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold font-editorial text-gray-900 group-hover:text-red-700 line-clamp-1">
                  {prevArticle.title}
                </h4>
              </div>
            ) : <div />}

            {nextArticle ? (
              <div
                onClick={() => onArticleClick(nextArticle.slug || nextArticle.id)}
                className="p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/20 cursor-pointer transition-all group text-right"
              >
                <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mb-1">
                  <span>পরবর্তী সংবাদ</span>
                  <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold font-editorial text-gray-900 group-hover:text-red-700 line-clamp-1">
                  {nextArticle.title}
                </h4>
              </div>
            ) : <div />}
          </div>

          {/* Comments Section */}
          {article.commentsEnabled && (
            <div className="mt-12 pt-8 border-t border-gray-200 no-print">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-[#990000]" />
                <h3 className="text-xl font-bold font-editorial text-gray-900">
                  মন্তব্য ({toBengaliNumber(comments.length)})
                </h3>
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleAddComment} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">আপনার মতামত লিখুন</h4>
                <div>
                  <input
                    type="text"
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    placeholder="আপনার নাম ও ঠিকানা (যেমন: রফিকুল ইসলাম, মির্জাপুর)"
                    className="w-full text-sm bg-white p-2.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600"
                    required
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="আপনার সুস্পষ্ট মতামত প্রকাশ করুন..."
                    className="w-full text-sm bg-white p-2.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600"
                    required
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-500">
                    অশালীন বা বিভ্রান্তিকর মন্তব্য প্রকাশযোগ্য নয়।
                  </span>
                  <button
                    type="submit"
                    className="bg-[#990000] hover:bg-red-800 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    মন্তব্য প্রকাশ করুন
                  </button>
                </div>
                {commentSuccess && (
                  <p className="text-xs text-emerald-600 font-medium">আপনার মন্তব্যটি সফলভাবে যুক্ত হয়েছে!</p>
                )}
              </form>

              {/* Comments list */}
              <div className="space-y-4">
                {comments.map((comm) => (
                  <div key={comm.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-2xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-sm text-gray-900">{comm.authorName}</span>
                      <span className="text-[11px] text-gray-400">{formatBengaliDate(comm.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comm.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Column (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-8 no-print">
          
          {/* Related News */}
          {relatedArticles.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <SectionHeader title="সম্পর্কিত সংবাদ" />
              <div className="space-y-4">
                {relatedArticles.map(rel => (
                  <NewsCard
                    key={rel.id}
                    article={rel}
                    variant="compact"
                    onClick={onArticleClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sidebar Ad Placement */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <AdSlot
              placement="sidebar"
              enabled={adSettings.sidebarBannerEnabled}
              code={adSettings.sidebarBannerCode}
              imageUrl={adSettings.sidebarBannerImage}
              linkUrl={adSettings.sidebarBannerLink}
            />
          </div>

          {/* Facebook Sharing Verification info box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Facebook className="w-4 h-4 text-blue-600" />
              <span>সোশ্যাল মিডিয়া প্রিভিউ টেস্ট</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              এই প্রতিবেদনের প্রিভিউ টেস্ট করতে ফেসবুক শেয়ারিং ডিবাগারে এই লিংকটি দিয়ে স্ক্র্যাপ করতে পারেন:
            </p>
            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] break-all select-all">
              {articleUrl}
            </div>
            <a
              href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline inline-block pt-1"
            >
              Facebook Sharing Debugger খুলুন &rarr;
            </a>
          </div>

        </div>

      </div>

    </article>
  );
};
