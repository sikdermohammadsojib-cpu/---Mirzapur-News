export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageCaption?: string;
  imageCredit?: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  author: string;
  reporterTitle?: string;
  status: 'published' | 'draft' | 'scheduled';
  isBreaking: boolean;
  isFeatured: boolean;
  isLeadStory: boolean;
  publishedAt: string;
  updatedAt: string;
  scheduledAt?: string;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount: number;
  commentsEnabled: boolean;
  galleryImages?: { url: string; caption: string }[];
  videoUrl?: string;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface BreakingNewsItem {
  id: string;
  title: string;
  linkArticleId?: string;
  linkArticleSlug?: string;
  linkUrl?: string;
  articleId?: string;
  slug?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  expiresAt?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  siteSubtitle: string;
  logoUrl?: string;
  faviconUrl?: string;
  leadStoryId?: string;
  tickerSpeed: number; // in seconds
  tickerEnabled: boolean;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  editorName: string;
  publisherName: string;
  facebookUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  whatsappNumber: string;
  maintenanceMode: boolean;
  defaultOgImage: string;
  sectionOrder: string[];
  adminPassword?: string;
}

export interface AdSettings {
  popunderEnabled: boolean;
  popunderCode: string;
  popunderUrl?: string;
  socialBarEnabled: boolean;
  socialBarCode: string;
  
  topBannerEnabled: boolean;
  topBannerCode: string;
  topBannerImage?: string;
  topBannerLink?: string;
  
  betweenSectionsBannerEnabled: boolean;
  betweenSectionsBannerCode: string;
  betweenSectionsBannerImage?: string;
  betweenSectionsBannerLink?: string;
  
  articleTopBannerEnabled: boolean;
  articleTopBannerCode: string;
  articleTopBannerImage?: string;
  articleTopBannerLink?: string;
  
  articleMiddleBannerEnabled: boolean;
  articleMiddleBannerCode: string;
  articleMiddleBannerImage?: string;
  articleMiddleBannerLink?: string;
  
  articleBottomBannerEnabled: boolean;
  articleBottomBannerCode: string;
  articleBottomBannerImage?: string;
  articleBottomBannerLink?: string;
  
  // Optional Social Bar Customization / Fallback Widget
  socialBarTitle?: string;
  socialBarDescription?: string;
  socialBarLink?: string;
  socialBarImage?: string;
  
  sidebarBannerEnabled: boolean;
  sidebarBannerCode: string;
  sidebarBannerImage?: string;
  sidebarBannerLink?: string;
  
  updatedAt: string;
}

export interface DeploymentSettings {
  netlifyBuildHookUrl: string;
  netlifySiteUrl: string;
  lastDeployStatus: 'idle' | 'building' | 'success' | 'failed';
  lastDeployTime?: string;
  lastDeployMessage?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}
