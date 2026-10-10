import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Eye, ShieldCheck, CheckCircle2, AlertCircle, 
  Save, Zap, Bell, Image as ImageIcon, ExternalLink, Play, Check 
} from 'lucide-react';
import { AdSettings } from '../types/news';
import { AdSlot } from '../components/ads/AdSlot';

interface AdsManagerProps {
  adSettings: AdSettings;
  onUpdateAdSettings: (settings: Partial<AdSettings>) => void;
}

export const AdsManager: React.FC<AdsManagerProps> = ({
  adSettings,
  onUpdateAdSettings,
}) => {
  const [formData, setFormData] = useState<AdSettings>({ ...adSettings });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [previewPlacement, setPreviewPlacement] = useState<
    'top' | 'between' | 'sidebar' | 'articleTop' | 'articleMiddle' | 'articleBottom' | 'socialBar'
  >('articleTop');
  const [socialBarTriggered, setSocialBarTriggered] = useState(false);
  const [popunderTriggered, setPopunderTriggered] = useState(false);

  // Sync internal formData whenever adSettings prop updates
  useEffect(() => {
    setFormData({ ...adSettings });
  }, [adSettings]);

  // Instant reactive toggle handler: Auto-saves immediately when on/off switch is clicked!
  const handleInstantToggle = (field: keyof AdSettings, value: boolean) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdateAdSettings({ [field]: value });
    
    // Label for toast
    const labels: Record<string, string> = {
      popunderEnabled: 'পপআন্ডার বিজ্ঞাপন (Popunder)',
      socialBarEnabled: 'সোশ্যাল বার বিজ্ঞাপন (Social Bar)',
      topBannerEnabled: 'হোমপেজ শীর্ষ ব্যানার',
      betweenSectionsBannerEnabled: 'সেকশন ব্যানার',
      articleTopBannerEnabled: 'খবরের শুরুর ব্যানার (articleTop)',
      articleMiddleBannerEnabled: 'খবরের মাঝের ব্যানার (articleMiddle)',
      articleBottomBannerEnabled: 'খবরের শেষের ব্যানার (articleBottom)',
      sidebarBannerEnabled: 'সাইডবার ব্যানার',
    };

    const labelName = labels[field as string] || field;
    setSaveMessage(`${labelName}: ${value ? 'সফলভাবে চালু (ON) হয়েছে' : 'বন্ধ (OFF) করা হয়েছে'}`);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Save all form inputs (URLs, codes, titles)
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdSettings(formData);
    setSaveMessage('সকল বিজ্ঞাপন সেটিংস ও কোড সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  // Test live Social Bar
  const handleTestSocialBar = () => {
    window.dispatchEvent(new CustomEvent('trigger-socialbar-preview'));
    setSocialBarTriggered(true);
    setTimeout(() => setSocialBarTriggered(false), 3000);
  };

  // Test live Popunder
  const handleTestPopunder = () => {
    const targetUrl = formData.popunderUrl?.trim() || 'https://mirzapurnews.com/advertise';
    window.dispatchEvent(new CustomEvent('trigger-popunder-preview', { detail: { url: targetUrl } }));
    setPopunderTriggered(true);
    setTimeout(() => setPopunderTriggered(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-editorial text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Adsterra ও বিজ্ঞাপন নেটওয়ার্ক ব্যবস্থাপনা</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            অন/অফ সুইচ পরিবর্তন করার সাথে সাথে তাৎক্ষণিকভাবে সক্রিয়/নিষ্ক্রিয় হবে।
          </p>
        </div>

        {saveMessage && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Security & Instruction Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">সরাসরি রিয়েল-টাইম নিয়ন্ত্রণ:</span>
          <p className="text-blue-800 leading-relaxed">
            প্রতিটি বিজ্ঞাপনী স্লটের পাশে থাকা অন/অফ সুইচে ক্লিক করলেই সাইটে বিজ্ঞাপনটি সঙ্গে সঙ্গে চালু বা বন্ধ হয়ে যায়। কোড বা ছবির লিংক পরিবর্তন শেষে নিচের <strong>"সকল সেটিংস সংরক্ষণ করুন"</strong> বাটনে ক্লিক করুন।
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        
        {/* 1. Adsterra Social Bar & Popunder Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 font-editorial">
                <Bell className="w-4 h-4 text-red-600" />
                <span>১. Adsterra Social Bar ও Popunder বিজ্ঞাপন</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ইন-পেজ পুশ নোটিফিকেশন বার এবং পপআন্ডার বিজ্ঞাপন ব্যবস্থা।
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                formData.socialBarEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}>
                সোশ্যাল বার: {formData.socialBarEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                formData.popunderEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}>
                পপআন্ডার: {formData.popunderEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
              </span>
            </div>
          </div>

          {/* Social Bar Controls */}
          <div className="p-5 bg-gradient-to-r from-red-50/60 to-amber-50/60 rounded-xl border border-red-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200/80 pb-3">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span>Adsterra Social Bar (ইন-পেজ ফ্লোটিং নোটিফিকেশন)</span>
                  <span className="bg-[#990000] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    হাই CTR
                  </span>
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  স্ক্রিনের নিচের ডান কোণায় আকর্ষক পুশ ব্যানার ভেসে ওঠে।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestSocialBar}
                  className="bg-red-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="সোশ্যাল বার স্ক্রিনে টেস্ট করুন"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{socialBarTriggered ? 'টেস্ট চলছে!' : 'টেস্ট প্রিভিউ দেখুন'}</span>
                </button>

                {/* Instant ON/OFF Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.socialBarEnabled}
                    onChange={(e) => handleInstantToggle('socialBarEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Adsterra Social Bar Script Code
                </label>
                <textarea
                  rows={2}
                  value={formData.socialBarCode}
                  onChange={(e) => setFormData({ ...formData, socialBarCode: e.target.value })}
                  placeholder="<script type='text/javascript' src='//pl12345678.highperformancegate.com/ab/cd/ef/12345678.js'></script>"
                  className="w-full text-xs font-mono p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Custom Social Bar details */}
              <div className="pt-2 border-t border-red-200/60">
                <span className="font-bold text-gray-800 text-xs block mb-2">
                  কাস্টম সোশ্যাল বার বুলেটিন টেক্সট ও লিংক (স্পন্সরড মেসেজ):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1 font-semibold">শিরোনাম</label>
                    <input
                      type="text"
                      value={formData.socialBarTitle || ''}
                      onChange={(e) => setFormData({ ...formData, socialBarTitle: e.target.value })}
                      placeholder="মির্জাপুর নিউজ বিশেষ অফার"
                      className="w-full p-2 border rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1 font-semibold">বিজ্ঞাপনের লিংক (Click URL)</label>
                    <input
                      type="text"
                      value={formData.socialBarLink || ''}
                      onChange={(e) => setFormData({ ...formData, socialBarLink: e.target.value })}
                      placeholder="https://mirzapurnews.com/advertise"
                      className="w-full p-2 border rounded bg-white font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 mb-1 font-semibold">সংক্ষিপ্ত বিবরণ</label>
                    <input
                      type="text"
                      value={formData.socialBarDescription || ''}
                      onChange={(e) => setFormData({ ...formData, socialBarDescription: e.target.value })}
                      placeholder="বিজ্ঞাপন প্রচার ও স্পন্সরশিপের জন্য যোগাযোগ করুন: ০১৭১২-৩৪৫৬৭৮"
                      className="w-full p-2 border rounded bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popunder Controls */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span>Adsterra Popunder Ads (ক্লিকে পপআপ/পপআন্ডার খোলা)</span>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    হাই রেভিনিউ
                  </span>
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  সাইটের যে কোনো স্থানে ভিজিটর ক্লিক করার পর নতুন ট্যাবে বিজ্ঞাপন ওপেন হয়।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestPopunder}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="পপআন্ডার নতুন ট্যাবে টেস্ট করুন"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{popunderTriggered ? 'টেস্ট ওপেন হয়েছে!' : 'পপআন্ডার টেস্ট করুন'}</span>
                </button>

                {/* Instant ON/OFF Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.popunderEnabled}
                    onChange={(e) => handleInstantToggle('popunderEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">
                    Adsterra Popunder ডিরেক্ট লিংক বা স্মার্টলিংক (Smartlink / Direct URL)
                  </label>
                  {formData.popunderUrl ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>সরাসরি লিঙ্ক প্রস্তুত</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      লিংক প্রয়োজন
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.popunderUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, popunderUrl: val });
                    onUpdateAdSettings({ popunderUrl: val });
                  }}
                  placeholder="https://www.highperformancegate.com/..."
                  className="w-full p-2.5 border rounded-lg font-mono bg-white text-xs outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Adsterra ড্যাশবোর্ড থেকে Popunder অথবা Direct Smartlink পেয়ে থাকলে এখানে পেস্ট করুন।
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  বা Adsterra Popunder Script Tag (জাভাস্ক্রিপ্ট কোড)
                </label>
                <textarea
                  rows={3}
                  value={formData.popunderCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, popunderCode: val });
                    onUpdateAdSettings({ popunderCode: val });
                  }}
                  placeholder="<!-- Adsterra Popunder -->&#10;<script type='text/javascript' src='//pl12345678.highperformancegate.com/ab/cd/ef/12345678.js'></script>"
                  className="w-full text-xs font-mono p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  💡 Adsterra-এর সম্পূর্ণ স্ক্রিপ্ট ট্যাগ (যেমন: <code className="bg-gray-100 px-1 rounded">&lt;script src="//pl..."&gt;&lt;/script&gt;</code>) এখানে পেস্ট করুন। এটি পেজের হেডার/বডিতে নিরাপদে এক্সিকিউট হবে।
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. In-Article Banners (articleTop, articleMiddle, articleBottom) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-gray-900 font-editorial flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-600" />
              <span>২. সংবাদের ভেতরের ব্যানার স্লটসমূহ (In-Article Ad Slots)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              অন/অফ বাটনে চাপার সাথে সাথেই আর্টিকেলের ভেতরের ব্যানার অন বা অফ হয়ে যাবে।
            </p>
          </div>

          {/* Slot: articleTop */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  স্লট: articleTop
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-1">
                  সংবাদের শুরুর শীর্ষ ব্যানার (Article Top Banner 970x120 / 728x90)
                </h4>
                <p className="text-gray-500 text-[11px]">
                  শিরোনামের নিচে ও মূল লেখার শুরুতে প্রদর্শিত হয়
                </p>
              </div>

              {/* Instant Toggle */}
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${formData.articleTopBannerEnabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {formData.articleTopBannerEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.articleTopBannerEnabled}
                    onChange={(e) => handleInstantToggle('articleTopBannerEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ব্যানার ইমেজ ইউআরএল (Banner Image URL)
                </label>
                <input
                  type="text"
                  value={formData.articleTopBannerImage || ''}
                  onChange={(e) => setFormData({ ...formData, articleTopBannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ক্লিক লিংক ইউআরএল (Click Target URL)
                </label>
                <input
                  type="text"
                  value={formData.articleTopBannerLink || ''}
                  onChange={(e) => setFormData({ ...formData, articleTopBannerLink: e.target.value })}
                  placeholder="https://mirzapurnews.com/advertise"
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  বা Adsterra / থার্ড-পার্টি ব্যানার কোড (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={formData.articleTopBannerCode || ''}
                  onChange={(e) => setFormData({ ...formData, articleTopBannerCode: e.target.value })}
                  placeholder="<!-- Adsterra 728x90 Banner Code -->"
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Slot: articleMiddle */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  স্লট: articleMiddle
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-1">
                  সংবাদের মাঝখানের ব্যানার (Article Middle Banner 728x90)
                </h4>
                <p className="text-gray-500 text-[11px]">
                  ছবির নিচে ও অনুচ্ছেদের মাঝখানে প্রদর্শিত হয়
                </p>
              </div>

              {/* Instant Toggle */}
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${formData.articleMiddleBannerEnabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {formData.articleMiddleBannerEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.articleMiddleBannerEnabled}
                    onChange={(e) => handleInstantToggle('articleMiddleBannerEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ব্যানার ইমেজ ইউআরএল (Banner Image URL)
                </label>
                <input
                  type="text"
                  value={formData.articleMiddleBannerImage || ''}
                  onChange={(e) => setFormData({ ...formData, articleMiddleBannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ক্লিক লিংক ইউআরএল (Click Target URL)
                </label>
                <input
                  type="text"
                  value={formData.articleMiddleBannerLink || ''}
                  onChange={(e) => setFormData({ ...formData, articleMiddleBannerLink: e.target.value })}
                  placeholder="https://mirzapurnews.com/advertise"
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  বা Adsterra / থার্ড-পার্টি ব্যানার কোড (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={formData.articleMiddleBannerCode || ''}
                  onChange={(e) => setFormData({ ...formData, articleMiddleBannerCode: e.target.value })}
                  placeholder="<!-- Adsterra 728x90 Banner Code -->"
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Slot: articleBottom */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  স্লট: articleBottom
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-1">
                  সংবাদের শেষের ব্যানার (Article Bottom Banner 970x120 / 728x90)
                </h4>
                <p className="text-gray-500 text-[11px]">
                  খবরের লেখার শেষে ও মন্তব্য বক্সের ঠিক আগে প্রদর্শিত হয়
                </p>
              </div>

              {/* Instant Toggle */}
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${formData.articleBottomBannerEnabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {formData.articleBottomBannerEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.articleBottomBannerEnabled}
                    onChange={(e) => handleInstantToggle('articleBottomBannerEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ব্যানার ইমেজ ইউআরএল (Banner Image URL)
                </label>
                <input
                  type="text"
                  value={formData.articleBottomBannerImage || ''}
                  onChange={(e) => setFormData({ ...formData, articleBottomBannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ক্লিক লিংক ইউআরএল (Click Target URL)
                </label>
                <input
                  type="text"
                  value={formData.articleBottomBannerLink || ''}
                  onChange={(e) => setFormData({ ...formData, articleBottomBannerLink: e.target.value })}
                  placeholder="https://mirzapurnews.com/advertise"
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  বা Adsterra / থার্ড-পার্টি ব্যানার কোড (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={formData.articleBottomBannerCode || ''}
                  onChange={(e) => setFormData({ ...formData, articleBottomBannerCode: e.target.value })}
                  placeholder="<!-- Adsterra Article Bottom Banner Code -->"
                  className="w-full p-2 border rounded font-mono bg-white outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 3. Homepage & Sidebar Display Banners */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-gray-900 font-editorial">
              ৩. হোমপেজ ও সাইডবার ব্যানার স্লটসমূহ
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              হোমপেজের শীর্ষ অংশ, বিভাগসমূহের মধ্যবর্তী অংশ এবং সাইডবার ডিসপ্লে ব্যানার।
            </p>
          </div>

          {/* Top Banner */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-800">হোমপেজ শীর্ষ ব্যানার (Top Banner 970x120 / 728x90)</h4>
                <p className="text-gray-500">প্রধান খবরের ঠিক উপরে প্রদর্শিত হয়</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${formData.topBannerEnabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {formData.topBannerEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.topBannerEnabled}
                    onChange={(e) => handleInstantToggle('topBannerEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">ব্যানার ছবির ইউআরএল</label>
                <input
                  type="text"
                  value={formData.topBannerImage || ''}
                  onChange={(e) => setFormData({ ...formData, topBannerImage: e.target.value })}
                  className="w-full p-2 border rounded font-mono bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">ক্লিক লিংক ইউআরএল</label>
                <input
                  type="text"
                  value={formData.topBannerLink || ''}
                  onChange={(e) => setFormData({ ...formData, topBannerLink: e.target.value })}
                  className="w-full p-2 border rounded font-mono bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-600 mb-1">বা Adsterra ব্যানার কোড</label>
              <textarea
                rows={2}
                value={formData.topBannerCode || ''}
                onChange={(e) => setFormData({ ...formData, topBannerCode: e.target.value })}
                placeholder="<!-- Adsterra 728x90 Banner Code -->"
                className="w-full p-2 border rounded font-mono bg-white"
              />
            </div>
          </div>

          {/* Between Sections Banner */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-800">হোমপেজ সেকশনের মাঝখানের ব্যানার (In-Between Sections)</h4>
                <p className="text-gray-500">মির্জাপুর/টাঙ্গাইল ও জাতীয় খবরের মাঝখানে</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${formData.betweenSectionsBannerEnabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {formData.betweenSectionsBannerEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.betweenSectionsBannerEnabled}
                    onChange={(e) => handleInstantToggle('betweenSectionsBannerEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">ব্যানার ছবির ইউআরএল</label>
                <input
                  type="text"
                  value={formData.betweenSectionsBannerImage || ''}
                  onChange={(e) => setFormData({ ...formData, betweenSectionsBannerImage: e.target.value })}
                  className="w-full p-2 border rounded font-mono bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">ক্লিক লিংক ইউআরএল</label>
                <input
                  type="text"
                  value={formData.betweenSectionsBannerLink || ''}
                  onChange={(e) => setFormData({ ...formData, betweenSectionsBannerLink: e.target.value })}
                  className="w-full p-2 border rounded font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Banner */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-800">সাইডবার ডিসপ্লে ব্যানার (Sidebar 300x250 / 336x280)</h4>
                <p className="text-gray-500">সর্বাধিক পঠিত ও সম্পর্কিত সংবাদের পাশে</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${formData.sidebarBannerEnabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {formData.sidebarBannerEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sidebarBannerEnabled}
                    onChange={(e) => handleInstantToggle('sidebarBannerEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">ব্যানার ছবি</label>
                <input
                  type="text"
                  value={formData.sidebarBannerImage || ''}
                  onChange={(e) => setFormData({ ...formData, sidebarBannerImage: e.target.value })}
                  className="w-full p-2 border rounded font-mono bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">ক্লিক লিংক</label>
                <input
                  type="text"
                  value={formData.sidebarBannerLink || ''}
                  onChange={(e) => setFormData({ ...formData, sidebarBannerLink: e.target.value })}
                  className="w-full p-2 border rounded font-mono bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Live Visual Preview Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-600" />
                <span>বিজ্ঞাপন লাইভ প্রিভিউ (Visual Banner & Social Bar Tester)</span>
              </h3>
              <p className="text-xs text-gray-500">
                বিজ্ঞাপনগুলো সাইটে কীভাবে দৃশ্যমান হবে তা সরাসরি পরীক্ষা করুন।
              </p>
            </div>

            {/* Placement Switcher Buttons */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPreviewPlacement('articleTop')}
                className={`px-2.5 py-1 rounded cursor-pointer ${previewPlacement === 'articleTop' ? 'bg-[#990000] text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                খবরের শুরুতে (articleTop)
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlacement('articleMiddle')}
                className={`px-2.5 py-1 rounded cursor-pointer ${previewPlacement === 'articleMiddle' ? 'bg-[#990000] text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                খবরের মাঝে (articleMiddle)
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlacement('articleBottom')}
                className={`px-2.5 py-1 rounded cursor-pointer ${previewPlacement === 'articleBottom' ? 'bg-[#990000] text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                খবরের শেষে (articleBottom)
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlacement('top')}
                className={`px-2.5 py-1 rounded cursor-pointer ${previewPlacement === 'top' ? 'bg-[#990000] text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                শীর্ষ ব্যানার
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlacement('between')}
                className={`px-2.5 py-1 rounded cursor-pointer ${previewPlacement === 'between' ? 'bg-[#990000] text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                সেকশন ব্যানার
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlacement('sidebar')}
                className={`px-2.5 py-1 rounded cursor-pointer ${previewPlacement === 'sidebar' ? 'bg-[#990000] text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                সাইডবার
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlacement('socialBar')}
                className={`px-2.5 py-1 rounded cursor-pointer ${previewPlacement === 'socialBar' ? 'bg-amber-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                সোশ্যাল বার
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            {previewPlacement === 'articleTop' && (
              <AdSlot
                placement="articleTop"
                enabled={formData.articleTopBannerEnabled}
                code={formData.articleTopBannerCode}
                imageUrl={formData.articleTopBannerImage}
                linkUrl={formData.articleTopBannerLink}
              />
            )}
            {previewPlacement === 'articleMiddle' && (
              <AdSlot
                placement="articleMiddle"
                enabled={formData.articleMiddleBannerEnabled}
                code={formData.articleMiddleBannerCode}
                imageUrl={formData.articleMiddleBannerImage}
                linkUrl={formData.articleMiddleBannerLink}
              />
            )}
            {previewPlacement === 'articleBottom' && (
              <AdSlot
                placement="articleBottom"
                enabled={formData.articleBottomBannerEnabled}
                code={formData.articleBottomBannerCode}
                imageUrl={formData.articleBottomBannerImage}
                linkUrl={formData.articleBottomBannerLink}
              />
            )}
            {previewPlacement === 'top' && (
              <AdSlot
                placement="topBanner"
                enabled={formData.topBannerEnabled}
                code={formData.topBannerCode}
                imageUrl={formData.topBannerImage}
                linkUrl={formData.topBannerLink}
              />
            )}
            {previewPlacement === 'between' && (
              <AdSlot
                placement="betweenSections"
                enabled={formData.betweenSectionsBannerEnabled}
                code={formData.betweenSectionsBannerCode}
                imageUrl={formData.betweenSectionsBannerImage}
                linkUrl={formData.betweenSectionsBannerLink}
              />
            )}
            {previewPlacement === 'sidebar' && (
              <div className="max-w-xs mx-auto">
                <AdSlot
                  placement="sidebar"
                  enabled={formData.sidebarBannerEnabled}
                  code={formData.sidebarBannerCode}
                  imageUrl={formData.sidebarBannerImage}
                  linkUrl={formData.sidebarBannerLink}
                />
              </div>
            )}
            {previewPlacement === 'socialBar' && (
              <div className="p-4 bg-white rounded-xl border border-red-300 max-w-sm mx-auto shadow-md">
                <div className="flex items-start gap-3">
                  <img
                    src={formData.socialBarImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&h=100&fit=crop&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      সোশ্যাল বার প্রিভিউ
                    </span>
                    <h5 className="font-bold text-xs text-gray-900 mt-0.5">
                      {formData.socialBarTitle || 'মির্জাপুর নিউজ বিশেষ বুলেটিন'}
                    </h5>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {formData.socialBarDescription || 'বিজ্ঞাপন প্রচার ও স্পন্সরশিপের জন্য যোগাযোগ করুন।'}
                    </p>
                    <a
                      href={formData.socialBarLink || '#'}
                      className="inline-block mt-2 bg-[#990000] text-white text-[10px] font-bold px-2.5 py-1 rounded"
                    >
                      বিস্তারিত দেখুন &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-[#990000] hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl shadow-md text-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>সকল সেটিংস সংরক্ষণ করুন (Save All Changes)</span>
          </button>
        </div>

      </form>
    </div>
  );
};
