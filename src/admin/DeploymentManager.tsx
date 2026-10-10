import React, { useState } from 'react';
import { 
  UploadCloud, Download, CheckCircle2, AlertCircle, 
  ExternalLink, Facebook, RefreshCw, FileCode, Check, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { NewsArticle, Category, SiteSettings, DeploymentSettings } from '../types/news';
import { createNetlifyZipPackage, generateSitemapXml, generateRobotsTxt } from '../services/staticExport';
import { toBengaliNumber } from '../utils/bengali';

interface DeploymentManagerProps {
  articles: NewsArticle[];
  categories: Category[];
  siteSettings: SiteSettings;
  deploymentSettings: DeploymentSettings;
  onUpdateDeploymentSettings: (settings: Partial<DeploymentSettings>) => void;
}

export const DeploymentManager: React.FC<DeploymentManagerProps> = ({
  articles,
  categories,
  siteSettings,
  deploymentSettings,
  onUpdateDeploymentSettings,
}) => {
  const [buildHookUrl, setBuildHookUrl] = useState(deploymentSettings.netlifyBuildHookUrl || '');
  const [siteUrl, setSiteUrl] = useState(deploymentSettings.netlifySiteUrl || 'https://mirzapurnews.netlify.app');
  const [isTriggering, setIsTriggering] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState(articles[0]?.slug || '');

  const publishedArticles = articles.filter(a => a.status === 'published');

  // Trigger Netlify Build Hook via POST
  const handleTriggerBuild = async () => {
    const cleanHookUrl = buildHookUrl.trim();
    if (!cleanHookUrl) {
      setIsError(true);
      setStatusMessage('অনুগ্রহ করে প্রথমে আপনার নেটলিফাই বিল্ড হুক (Netlify Build Hook) ইউআরএল প্রদান করুন।');
      return;
    }

    setIsTriggering(true);
    setIsError(false);
    setStatusMessage('নেটলিফাই সার্ভারে বিল্ড রিকোয়েস্ট প্রেরণ করা হচ্ছে...');

    try {
      let triggered = false;

      try {
        // Try direct fetch first
        const response = await fetch(cleanHookUrl, {
          method: 'POST',
        });

        if (response.ok || response.type === 'opaque') {
          triggered = true;
        } else {
          throw new Error(`সার্ভার সাড়া: ${response.status}`);
        }
      } catch (networkErr: any) {
        // If standard fetch encounters browser CORS security blockage on mobile,
        // retry with no-cors mode which allows cross-origin webhook dispatch from any browser
        await fetch(cleanHookUrl, {
          method: 'POST',
          mode: 'no-cors',
        });
        triggered = true;
      }

      if (triggered) {
        const time = new Date().toLocaleTimeString('bn-BD');
        onUpdateDeploymentSettings({
          netlifyBuildHookUrl: cleanHookUrl,
          netlifySiteUrl: siteUrl.trim(),
          lastDeployStatus: 'success',
          lastDeployTime: new Date().toISOString(),
          lastDeployMessage: `বিল্ড সফলভাবে শুরু হয়েছে (${time})`,
        });
        setStatusMessage(`বিল্ড সফলভাবে ট্রিগার হয়েছে! নেটলিফাই এখন নতুন স্ট্যাটিক পেজ তৈরি করছে।`);
      }
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`বিল্ড ট্রিগার ব্যর্থ হয়েছে: ${err.message || 'নেটওয়ার্ক ত্রুটি'}. বিল্ড হুক ইউআরএল সঠিক কিনা যাচাই করুন।`);
      onUpdateDeploymentSettings({
        netlifyBuildHookUrl: cleanHookUrl,
        lastDeployStatus: 'failed',
        lastDeployMessage: err.message || 'ত্রুটি',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  // Generate & Download real ZIP package with pre-rendered HTML for Netlify Drop
  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    setIsError(false);
    setStatusMessage('সকল সংবাদের জন্য পূর্ণাঙ্গ স্ট্যাটিক এইচটিএমএল (Open Graph সমৃদ্ধ) ও সাইটম্যাপ সংকলন করা হচ্ছে...');

    try {
      const blob = await createNetlifyZipPackage(publishedArticles, categories, siteSettings, siteUrl);
      
      // Trigger download
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `mirzapur-news-netlify-package-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setStatusMessage(`সফল! ${toBengaliNumber(publishedArticles.length)}টি খবরের পূর্ণাঙ্গ প্রি-রেন্ডার এইচটিএমএলসহ জিপ ফাইল ডাউনলোড সম্পন্ন হয়েছে। এটি সরাসরি Netlify Drop-এ আপলোড করতে পারবেন।`);
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`জিপ প্যাকেজ তৈরিতে ত্রুটি: ${err.message}`);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const currentTestUrl = `${siteUrl.replace(/\/$/, '')}/news/${selectedArticleSlug}/`;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UploadCloud className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold font-editorial">
              Netlify Deployment & Static Site Generation Center
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            ফেসবুক স্ক্র্যাপার এবং গুগল ক্রলারের জন্য প্রতিটি খবরের আলাদা স্ট্যাটিক HTML পৃষ্ঠা ও ওপেন গ্রাফ মেটাডাটা সরাসরি নেটলিফাইয়ে প্রকাশ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>স্ট্যাটিক পেজ: <strong>{toBengaliNumber(publishedArticles.length)}টি প্রস্তুত</strong></span>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
          isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {isError ? <AlertCircle className="w-5 h-5 text-red-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          <div className="leading-relaxed">{statusMessage}</div>
        </div>
      )}

      {/* Two Deployment Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Method A: Netlify Drop / Download Static ZIP */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#990000] flex items-center justify-center font-bold text-xs">১</span>
              <h3 className="font-bold text-base text-gray-900 font-editorial">
                নেটলিফাই ড্রপ (Netlify Drop ZIP Export)
              </h3>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              এক ক্লিকে আপনার সাইটের সকল সংবাদের প্রি-রেন্ডার করা বাস্তব এইচটিএমএল ফাইল, <code className="font-mono">_redirects</code>, <code className="font-mono">sitemap.xml</code> এবং ওপেন গ্রাফ ট্যাগ সহ একটি প্রস্তুত .ZIP আর্কাইভ ডাউনলোড করুন।
            </p>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-[11px] text-gray-600 mb-6 space-y-1">
              <div>&bull; <strong>ফাইল ফরম্যাট:</strong> সম্পূর্ণ প্রি-রেন্ডার করা স্ট্যাটিক সাইট</div>
              <div>&bull; <strong>পোস্ট সংখ্যা:</strong> {toBengaliNumber(publishedArticles.length)}টি প্রকাশিত নিবন্ধ</div>
              <div>&bull; <strong>মেটাডাটা:</strong> ফেসবুক ও টুইটার ক্রলার ফ্রেন্ডলি কাঁচা এইচটিএমএল</div>
            </div>
          </div>

          <div>
            <button
              onClick={handleDownloadZip}
              disabled={isGeneratingZip}
              className="w-full bg-[#990000] hover:bg-red-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingZip ? 'প্যাকেজ তৈরি হচ্ছে...' : 'প্রোডাকশন জিপ ডাউনলোড করুন (Download ZIP)'}</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              ডাউনলোড শেষে <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">app.netlify.com/drop</a> এ জিপ ফাইলটি টেনে এনে ছেড়ে দিলেই লাইভ হয়ে যাবে।
            </p>
          </div>
        </div>

        {/* Method B: Netlify Automated Build Hook */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">২</span>
              <h3 className="font-bold text-base text-gray-900 font-editorial">
                স্বয়ংক্রিয় বিল্ড হুক (Netlify Build Hook)
              </h3>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              আপনার গিটহাবের সাথে সংযুক্ত নেটলিফাই সাইটের <em>Build Hooks</em> ইউআরএল এখানে যুক্ত করুন। সংবাদ প্রকাশের সাথে সাথে স্বয়ংক্রিয়ভাবে নতুন বিল্ড চালু করতে পারবেন।
            </p>

            <div className="space-y-3 mb-6 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  নেটলিফাই বিল্ড হুক ইউআরএল (Build Hook URL)
                </label>
                <input
                  type="url"
                  value={buildHookUrl}
                  onChange={(e) => setBuildHookUrl(e.target.value)}
                  onBlur={() => onUpdateDeploymentSettings({ netlifyBuildHookUrl: buildHookUrl.trim() })}
                  placeholder="https://api.netlify.com/build_hooks/..."
                  className="w-full p-2 border rounded font-mono text-[11px] bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  লাইভ সাইট ডোমেন ইউআরএল (Site URL)
                </label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  onBlur={() => onUpdateDeploymentSettings({ netlifySiteUrl: siteUrl.trim() })}
                  placeholder="https://mirzapur-news24.netlify.app"
                  className="w-full p-2 border rounded font-mono text-[11px] bg-white outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleTriggerBuild}
              disabled={isTriggering}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isTriggering ? 'animate-spin' : ''}`} />
              <span>{isTriggering ? 'অনুরোধ পাঠানো হচ্ছে...' : 'বিল্ড ট্রিগার করুন (Trigger Build)'}</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              সর্বশেষ স্ট্যাটাস: {deploymentSettings.lastDeployMessage || 'প্রস্তুত'}
            </p>
          </div>
        </div>

      </div>

      {/* Critical Section 4 Requirement: Facebook Image Sharing Debugger */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-bold font-editorial text-gray-900 flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              <span>ফেসবুক ইমেজ শেয়ারিং ভেরিফিকেশন ও ওপেন গ্রাফ চেকার</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              প্রতিটি সংবাদের ফেসবুক প্রিভিউ ছবি (1200x630), শিরোনাম ও ডেসক্রিপশন যাচাই করুন।
            </p>
          </div>

          <a
            href="https://developers.facebook.com/tools/debug/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Facebook Debugger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Article Selector & URL */}
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                যাচাই করার জন্য সংবাদ নির্বাচন করুন:
              </label>
              <select
                value={selectedArticleSlug}
                onChange={(e) => setSelectedArticleSlug(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-white outline-none font-medium text-xs"
              >
                {publishedArticles.map(art => (
                  <option key={art.id} value={art.slug}>{art.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                শেয়ারিং টেস্ট ইউআরএল (Canonical URL):
              </label>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 font-mono text-[11px] break-all select-all text-gray-700">
                {currentTestUrl}
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(currentTestUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors"
              >
                <Facebook className="w-4 h-4 fill-current" />
                <span>ফেসবুক ডিবাগারে টেস্ট করুন &rarr;</span>
              </a>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ওপেন গ্রাফ মানদণ্ড পরিপূরণ তালিকা:</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>og:image</strong> — পাবলিক ও সরাসরি এক্সেসযোগ্য HTTPS ইমেজ URL (1200x630)।</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>og:type</strong> — <code className="font-mono">article</code> নির্দিষ্ট করা হয়েছে।</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>og:locale</strong> — <code className="font-mono">bn_BD</code> (বাংলা - বাংলাদেশ)।</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>article:published_time</strong> — আসল প্রকাশের সময় আইএসও ফরম্যাটে উপস্থিত।</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>JSON-LD NewsArticle</strong> — গুগল ডিসকভার ও সার্চ ইঞ্জিনের জন্য সমৃদ্ধ ডেটা প্রস্তুত।</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
