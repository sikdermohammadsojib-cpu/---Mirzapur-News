import React, { useState, useEffect } from 'react';
import { 
  FileText, FolderTree, Zap, Eye, PlusCircle, 
  UploadCloud, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, Database, RefreshCw, Copy, Check, ExternalLink 
} from 'lucide-react';
import { NewsArticle, Category, BreakingNewsItem, AdSettings, DeploymentSettings } from '../types/news';
import { toBengaliNumber, formatTimeAgoBengali } from '../utils/bengali';
import { storage, RtdbStatusState } from '../services/storage';

interface DashboardOverviewProps {
  articles: NewsArticle[];
  categories: Category[];
  breakingNews: BreakingNewsItem[];
  adSettings: AdSettings;
  deploymentSettings: DeploymentSettings;
  onNavigateTab: (tab: 'news' | 'categories' | 'breaking' | 'ads' | 'settings' | 'deploy') => void;
  onNewArticle: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  articles = [],
  categories = [],
  breakingNews = [],
  adSettings,
  deploymentSettings,
  onNavigateTab,
  onNewArticle,
}) => {
  const [rtdbStatus, setRtdbStatus] = useState<RtdbStatusState>(storage.getRtdbStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [rulesCopied, setRulesCopied] = useState(false);

  useEffect(() => {
    return storage.subscribeRtdbStatus(setRtdbStatus);
  }, []);

  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await storage.syncAllArticlesToFirebase();
      if (res.success) {
        setSyncResult(`সফল! ${res.count}টি সংবাদ Firebase Realtime Database-এ সংরক্ষিত হয়েছে।`);
      } else {
        setSyncResult(`ত্রুটি: ${res.error}`);
      }
    } catch (e: any) {
      setSyncResult(`ব্যর্থ: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyRulesSnippet = () => {
    const rules = '{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}';
    navigator.clipboard.writeText(rules);
    setRulesCopied(true);
    setTimeout(() => setRulesCopied(false), 2500);
  };

  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBreaking = Array.isArray(breakingNews) ? breakingNews : [];

  const publishedCount = safeArticles.filter(a => a?.status === 'published').length;
  const draftCount = safeArticles.filter(a => a?.status === 'draft').length;
  const scheduledCount = safeArticles.filter(a => a?.status === 'scheduled').length;
  const totalViews = safeArticles.reduce((sum, a) => sum + (a?.viewCount || 0), 0);
  const activeBreakingCount = safeBreaking.filter(b => b?.isActive).length;

  const recentArticles = safeArticles.slice(0, 6);

  return (
    <div className="space-y-8">
      
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-2xl font-bold font-editorial text-gray-900">
            স্বাগতম, সম্পাদকীয় প্যানেলে!
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            মির্জাপুর নিউজের সকল খবর, বিভাগ, বিজ্ঞাপন এবং নেটলিফাই ডেপ্লয়মেন্ট এখান থেকে পরিচালনা করুন।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewArticle}
            className="bg-[#990000] hover:bg-red-800 text-white font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন সংবাদ তৈরি করুন</span>
          </button>
          <button
            onClick={() => onNavigateTab('deploy')}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>নেটলিফাই বিল্ড</span>
          </button>
        </div>
      </div>

      {/* Firebase Realtime Database Live Health & Permission Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        rtdbStatus.status === 'permission_denied' 
          ? 'bg-amber-50 border-amber-200 text-amber-900' 
          : rtdbStatus.status === 'connected'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              rtdbStatus.status === 'permission_denied'
                ? 'bg-amber-500 text-white'
                : rtdbStatus.status === 'connected'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-600 text-white'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  {rtdbStatus.status === 'connected' && 'Firebase Realtime Database: সক্রিয় ও সংযুক্ত'}
                  {rtdbStatus.status === 'permission_denied' && 'Firebase Realtime Database: পারমিশন সতর্কতা (Permission Denied)'}
                  {rtdbStatus.status === 'connecting' && 'Firebase Realtime Database: সংযোগ পরীক্ষা করা হচ্ছে...'}
                  {rtdbStatus.status === 'error' && 'Firebase Realtime Database: সংযোগে ত্রুটি'}
                  {rtdbStatus.status === 'idle' && 'Firebase Realtime Database: নিষ্ক্রিয়'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rtdbStatus.status === 'connected'
                    ? 'bg-emerald-200 text-emerald-800'
                    : rtdbStatus.status === 'permission_denied'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {rtdbStatus.status === 'connected' ? 'অনলাইন' : 'মনোযোগ প্রয়োজন'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {rtdbStatus.status === 'permission_denied' ? (
                  <span>
                    অন্যান্য ডিভাইস বা ফেসবুক লিংকে প্রবেশের জন্য Firebase Console-এ <strong>Rules</strong> পরিবর্তন করতে হবে। Rules-এ <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.read: true, .write: true</code> সেট করে নিচের বাটনে সিঙ্ক করুন।
                  </span>
                ) : (
                  <span>
                    সকল নতুন খবর, ক্যাটাগরি এবং সেটিংস ক্লাউড রিয়েলটাইম ডাটাবেজে সংরক্ষিত হচ্ছে। পাঠকরা যেকোনো ব্রাউজার ও শেয়ার করা লিংকে সরাসরি খবর দেখতে পাবেন।
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
            {rtdbStatus.status === 'permission_denied' && (
              <>
                <button
                  onClick={copyRulesSnippet}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Rules কপি করুন"
                >
                  {rulesCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{rulesCopied ? 'কপি হয়েছে!' : 'রুলস কোড কপি'}</span>
                </button>
                <a
                  href="https://console.firebase.google.com/project/notex-3d16a/database/notex-3d16a-default-rtdb/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Firebase Rules পেজ</span>
                </a>
              </>
            )}

            <button
              onClick={handleSyncToFirebase}
              disabled={isSyncing}
              className="bg-[#990000] hover:bg-red-800 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'সকল সংবাদ Firebase-এ সিঙ্ক করুন'}</span>
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="mt-3 text-xs p-2.5 rounded-lg bg-white/80 border border-current/20 font-medium">
            {syncResult}
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Published */}
        <div 
          onClick={() => onNavigateTab('news')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:border-red-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">প্রকাশিত সংবাদ</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-editorial text-gray-900">
            {toBengaliNumber(publishedCount)}
          </div>
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>খসড়া: {toBengaliNumber(draftCount)}টি | শিডিউল: {toBengaliNumber(scheduledCount)}টি</span>
          </div>
        </div>

        {/* Card 2: Views */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">মোট ভিউ</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-editorial text-gray-900">
            {toBengaliNumber(totalViews)}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            সর্বাধিক পঠিত খবর আপডেট হচ্ছে
          </div>
        </div>

        {/* Card 3: Categories */}
        <div 
          onClick={() => onNavigateTab('categories')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:border-red-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">সক্রিয় বিভাগ</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-editorial text-gray-900">
            {toBengaliNumber(categories.length)}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            মির্জাপুর, টাঙ্গাইল, জাতীয় ও অন্যান্য
          </div>
        </div>

        {/* Card 4: Breaking Ticker */}
        <div 
          onClick={() => onNavigateTab('breaking')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:border-red-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ব্রেকিং নিউজ</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-editorial text-[#990000]">
            {toBengaliNumber(activeBreakingCount)}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            টিকারে চলমান সক্রিয় শিরোনাম
          </div>
        </div>
      </div>

      {/* Deployment & Adsterra Status Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deployment Status */}
        <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">নেটলিফাই স্ট্যাটাস</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {deploymentSettings.lastDeployStatus === 'building' ? 'বিল্ড চলমান...' : 'সর্বশেষ স্ট্যাটিক বিল্ড প্রস্তুত'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs font-mono">
              {deploymentSettings.netlifySiteUrl}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('deploy')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
          >
            ম্যানেজ করুন &rarr;
          </button>
        </div>

        {/* Adsterra Ads Status */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">বিজ্ঞাপন ইঞ্জিন (Adsterra)</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {adSettings.topBannerEnabled ? 'শীর্ষ ও সাইডবার ব্যানার সক্রিয়' : 'ব্যানার স্থগিত'}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              পপআন্ডার: {adSettings.popunderEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'} &bull; সোশ্যাল বার: {adSettings.socialBarEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('ads')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded transition-colors"
          >
            কনফিগারেশন &rarr;
          </button>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-900 font-editorial">
            সম্প্রতি প্রকাশিত ও সংরক্ষিত সংবাদ
          </h3>
          <button
            onClick={() => onNavigateTab('news')}
            className="text-xs font-semibold text-[#990000] hover:underline"
          >
            সব সংবাদ দেখুন &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">শিরোনাম</th>
                <th className="py-3 px-4">বিভাগ</th>
                <th className="py-3 px-4">প্রতিবেদক</th>
                <th className="py-3 px-4">অবস্থা</th>
                <th className="py-3 px-4">সময়</th>
                <th className="py-3 px-4 text-right">ভিউ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {recentArticles.map(article => (
                <tr key={article.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-800">
                      {article.categoryName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {article.author}
                  </td>
                  <td className="py-3 px-4">
                    {article.status === 'published' ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        প্রকাশিত
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        খসড়া
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {formatTimeAgoBengali(article.publishedAt || article.createdAt) || 'এইমাত্র'}
                  </td>
                  <td className="py-3 px-4 text-right font-sans font-semibold">
                    {toBengaliNumber(article.viewCount || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
