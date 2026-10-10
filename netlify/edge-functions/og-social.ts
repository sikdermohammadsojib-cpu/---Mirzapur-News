/**
 * Netlify Edge Function: Social Open Graph Pre-renderer
 * Intercepts requests from social media crawlers (Facebook, WhatsApp, Twitter, LinkedIn, Telegram)
 * and serves dynamically customized Open Graph metadata for the specific news article.
 */

interface NewsArticleData {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  author?: string;
  categoryName?: string;
  publishedAt?: string;
}

const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'facebot',
  'whatsapp',
  'twitterbot',
  'telegrambot',
  'linkedinbot',
  'pinterest',
  'slackbot',
  'vkshare',
  'discordbot',
  'applebot'
];

export default async function handler(request: Request, context: any) {
  const url = new URL(request.url);
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  
  // Check if crawler
  const isSocialBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));

  // Determine if a specific news article is requested
  const newsSlugOrId = url.searchParams.get('news') || 
                       url.searchParams.get('article') || 
                       url.searchParams.get('post') || 
                       url.searchParams.get('slug') ||
                       url.searchParams.get('id') ||
                       (url.pathname.startsWith('/news/') ? url.pathname.replace('/news/', '').replace(/\/$/, '') : null);

  // If not a crawler or no specific news requested, proceed with standard response
  if (!isSocialBot || !newsSlugOrId) {
    return context.next();
  }

  // Fetch the default response first (the SPA index.html)
  const response = await context.next();
  let html = await response.text();

  try {
    const cleanParam = decodeURIComponent(newsSlugOrId).trim().toLowerCase();
    
    // Fetch articles from Firebase Realtime Database
    let article: NewsArticleData | null = null;
    try {
      const rtdbResponse = await fetch('https://notex-3d16a-default-rtdb.firebaseio.com/news.json', {
        headers: { 'Accept': 'application/json' },
      });
      if (rtdbResponse.ok) {
        const data = await rtdbResponse.json();
        if (data) {
          const list: NewsArticleData[] = Array.isArray(data) ? data : Object.values(data);
          article = list.find((a: any) => 
            (a.slug && a.slug.toLowerCase() === cleanParam) || 
            (a.id && a.id.toLowerCase() === cleanParam) ||
            (a.slug && decodeURIComponent(a.slug).toLowerCase() === cleanParam)
          ) || null;
        }
      }
    } catch (e) {
      // RTDB fetch error or permission restriction
    }

    // If article found, inject customized Open Graph tags
    if (article && article.title) {
      const title = article.seoTitle || article.title;
      const description = article.excerpt || article.seoDescription || 'মির্জাপুর, টাঙ্গাইল ও সারা বাংলাদেশের সর্বশেষ সংবাদ।';
      const image = article.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80';
      const canonical = `${url.origin}/?news=${encodeURIComponent(article.slug || article.id)}`;

      const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      // Replace Title
      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeXml(title)} | মির্জাপুর নিউজ</title>`);

      // Replace or update og:title
      if (html.includes('property="og:title"')) {
        html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeXml(title)}" />`);
      }

      // Replace or update og:description
      if (html.includes('property="og:description"')) {
        html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeXml(description)}" />`);
      }

      // Replace or update og:image
      if (html.includes('property="og:image"')) {
        html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/i, `<meta property="og:image" content="${escapeXml(image)}" />`);
      }

      // Replace or update og:url
      if (html.includes('property="og:url"')) {
        html = html.replace(/<meta property="og:url" content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
      } else {
        html = html.replace('</head>', `<meta property="og:url" content="${canonical}" />\n</head>`);
      }

      // Replace or update twitter:title & description & image
      html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeXml(title)}" />`);
      html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeXml(description)}" />`);
      html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${escapeXml(image)}" />`);

      // Ensure fb:app_id is present
      if (!html.includes('property="fb:app_id"')) {
        html = html.replace('</head>', `<meta property="fb:app_id" content="966242223397117" />\n</head>`);
      }
    }
  } catch (err) {
    // If any error occurs, fall back to unaltered html
  }

  return new Response(html, {
    status: 200,
    headers: {
      ...Object.fromEntries(response.headers),
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=600',
    },
  });
}
