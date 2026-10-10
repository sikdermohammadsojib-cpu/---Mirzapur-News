import JSZip from 'jszip';
import { NewsArticle, Category, SiteSettings } from '../types/news';
import { formatBengaliDate } from '../utils/bengali';

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateArticleHtml(
  article: NewsArticle,
  siteSettings: SiteSettings,
  siteUrl: string
): string {
  const articleUrl = `${siteUrl.replace(/\/$/, '')}/news/${article.slug}/`;
  const canonicalUrl = articleUrl;
  const imageUrl = article.featuredImage || siteSettings.defaultOgImage;
  const publishedIso = article.publishedAt || new Date().toISOString();
  const modifiedIso = article.updatedAt || publishedIso;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": article.title,
    "description": article.excerpt || article.seoDescription,
    "image": [imageUrl],
    "datePublished": publishedIso,
    "dateModified": modifiedIso,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": siteSettings.siteTitle,
      "logo": {
        "@type": "ImageObject",
        "url": siteSettings.defaultOgImage
      }
    }
  };

  return `<!doctype html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(article.seoTitle || article.title)} | ${escapeHtml(siteSettings.siteTitle)}</title>
  <meta name="description" content="${escapeHtml(article.excerpt || article.seoDescription || '')}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Critical Facebook Open Graph Meta Tags (Pre-rendered for Crawlers) -->
  <meta property="og:site_name" content="${escapeHtml(siteSettings.siteTitle)}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(article.title)}" />
  <meta property="og:description" content="${escapeHtml(article.excerpt || '')}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(article.imageCaption || article.title)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:locale" content="bn_BD" />
  <meta property="fb:app_id" content="966242223397117" />
  <meta property="article:published_time" content="${publishedIso}" />
  <meta property="article:modified_time" content="${modifiedIso}" />
  <meta property="article:section" content="${escapeHtml(article.categoryName)}" />
  <meta property="article:author" content="${escapeHtml(article.author)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(article.title)}" />
  <meta name="twitter:description" content="${escapeHtml(article.excerpt || '')}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">

  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>

  <style>
    body { font-family: 'Hind Siliguri', sans-serif; background: #f8f9fa; color: #1a1a1a; margin: 0; padding: 0; line-height: 1.7; }
    h1, h2, h3 { font-family: 'Noto Serif Bengali', serif; }
    .container { max-width: 860px; margin: 0 auto; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; margin-top: 20px; margin-bottom: 40px; border-radius: 8px; }
    .header-bar { background: #990000; color: #ffffff; padding: 12px 24px; text-align: center; }
    .header-bar a { color: #ffffff; text-decoration: none; font-size: 24px; font-weight: bold; font-family: 'Noto Serif Bengali', serif; }
    .badge { background: #fee2e2; color: #990000; padding: 4px 10px; border-radius: 4px; font-size: 14px; font-weight: 600; display: inline-block; }
    .meta-line { color: #6b7280; font-size: 14px; margin: 12px 0 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
    .article-img { width: 100%; max-height: 480px; object-fit: cover; border-radius: 6px; }
    .caption { font-size: 13px; color: #6b7280; margin-top: 6px; font-style: italic; }
    .article-body { font-size: 18px; line-height: 1.8; margin-top: 24px; }
    .article-body p { margin-bottom: 16px; }
    .share-bar { display: flex; gap: 10px; margin: 24px 0; }
    .share-btn { padding: 8px 16px; border-radius: 4px; text-decoration: none; color: white; font-weight: 500; font-size: 14px; }
    .btn-fb { background: #1877f2; }
    .btn-wa { background: #25d366; }
    .back-btn { display: inline-block; margin-top: 30px; color: #990000; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; font-size: 13px; color: #6b7280; padding: 20px; }
  </style>
</head>
<body>
  <div class="header-bar">
    <a href="/">${escapeHtml(siteSettings.siteTitle)}</a>
    <div style="font-size: 13px; opacity: 0.9;">${escapeHtml(siteSettings.siteTagline)}</div>
  </div>

  <div class="container">
    <span class="badge">${escapeHtml(article.categoryName)}</span>
    <h1 style="font-size: 28px; line-height: 1.4; margin: 12px 0;">${escapeHtml(article.title)}</h1>
    
    <div class="meta-line">
      <div><strong>প্রতিবেদক:</strong> ${escapeHtml(article.author)} ${article.reporterTitle ? `(${escapeHtml(article.reporterTitle)})` : ''}</div>
      <div><strong>প্রকাশের সময়:</strong> ${formatBengaliDate(article.publishedAt, true)}</div>
      ${article.updatedAt !== article.publishedAt ? `<div><strong>আপডেট:</strong> ${formatBengaliDate(article.updatedAt, true)}</div>` : ''}
    </div>

    ${imageUrl ? `
      <div>
        <img class="article-img" src="${imageUrl}" alt="${escapeHtml(article.imageCaption || article.title)}" />
        ${article.imageCaption ? `<div class="caption">${escapeHtml(article.imageCaption)} ${article.imageCredit ? `| ছবি: ${escapeHtml(article.imageCredit)}` : ''}</div>` : ''}
      </div>
    ` : ''}

    <div class="share-bar">
      <a class="share-btn btn-fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}" target="_blank" rel="noopener">ফেসবুকে শেয়ার</a>
      <a class="share-btn btn-wa" href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + articleUrl)}" target="_blank" rel="noopener">হোয়াটসঅ্যাপে শেয়ার</a>
    </div>

    <div class="article-body">
      ${article.content}
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px;">
      <a class="back-btn" href="/">&larr; মূল পাতা - ${escapeHtml(siteSettings.siteTitle)}</a>
    </div>
  </div>

  <div class="footer">
    &copy; ${new Date().getFullYear()} ${escapeHtml(siteSettings.siteTitle)} | সম্পাদক: ${escapeHtml(siteSettings.editorName)} | সকল স্বত্ব সংরক্ষিত।
  </div>

  <!-- Client hydration script to launch interactive SPA if available -->
  <script>
    if (window.history && window.history.pushState) {
      // Allows smooth client navigation when SPA is loaded
    }
  </script>
</body>
</html>`;
}

export function generateSitemapXml(articles: NewsArticle[], categories: Category[], siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const now = new Date().toISOString();

  let urls = `
  <url>
    <loc>${base}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

  categories.forEach(cat => {
    urls += `
  <url>
    <loc>${base}/category/${cat.slug}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  articles.forEach(art => {
    if (art.status === 'published') {
      urls += `
  <url>
    <loc>${base}/news/${art.slug}/</loc>
    <lastmod>${art.updatedAt || art.publishedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urls}
</urlset>`;
}

export function generateRobotsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '');
  return `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${base}/sitemap.xml
`;
}

export async function createNetlifyZipPackage(
  articles: NewsArticle[],
  categories: Category[],
  settings: SiteSettings,
  siteUrl: string
): Promise<Blob> {
  const zip = new JSZip();

  // Root index.html - include app shell
  const rootHtml = document.documentElement.outerHTML;
  zip.file('index.html', rootHtml);

  // _redirects file for Netlify clean routing and fallbacks
  const redirects = `
# Pre-rendered article direct endpoints
/news/*  /news/:splat/index.html  200

# Pre-rendered category direct endpoints
/category/*  /category/:splat/index.html  200

# Admin SPA fallback
/admin/*  /index.html  200

# Root fallback
/*  /index.html  200
`;
  zip.file('_redirects', redirects.trim());

  // netlify.toml
  const toml = `[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/news/*"
  [headers.values]
    Cache-Control = "public, max-age=600, s-maxage=3600"
`;
  zip.file('netlify.toml', toml);

  // sitemap.xml & robots.txt
  zip.file('sitemap.xml', generateSitemapXml(articles, categories, siteUrl));
  zip.file('robots.txt', generateRobotsTxt(siteUrl));

  // Generate pre-rendered static HTML for every published article!
  articles.forEach(article => {
    if (article.status === 'published' && article.slug) {
      const html = generateArticleHtml(article, settings, siteUrl);
      zip.file(`news/${article.slug}/index.html`, html);
    }
  });

  return await zip.generateAsync({ type: 'blob' });
}
