import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, RotateCcw, AlertTriangle, Database, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { SiteSettings } from '../types/news';
import { isFirebaseConfigured } from '../services/firebase';
import { storage, RtdbStatusState } from '../services/storage';

interface SettingsManagerProps {
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  onResetDefaults: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [success, setSuccess] = useState(false);
  const [rtdbStatus, setRtdbStatus] = useState<RtdbStatusState>(storage.getRtdbStatus());
  const [rulesCopied, setRulesCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    return storage.subscribeRtdbStatus(setRtdbStatus);
  }, []);

  const copyRulesSnippet = () => {
    const rules = '{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}';
    navigator.clipboard.writeText(rules);
    setRulesCopied(true);
    setTimeout(() => setRulesCopied(false), 2500);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    try {
      const res = await storage.syncAllArticlesToFirebase();
      if (res.success) {
        setSyncMsg(`সফল! ${res.count}টি সংবাদ Firebase Realtime Database-এ সিঙ্ক হয়েছে।`);
      } else {
        setSyncMsg(`ত্রুটি: ${res.error}`);
      }
    } catch (e: any) {
      setSyncMsg(`ব্যর্থ: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };
  const [adminPassword, setAdminPassword] = useState(() => {
    try {
      return localStorage.getItem('mirzapur_admin_password') || settings.adminPassword || '583594';
    } catch (e) {
      return settings.adminPassword || '583594';
    }
  });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('mirzapur_admin_password', adminPassword.trim());
    } catch (e) {}
    onUpdateSettings(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('আপনি কি সকল সংবাদ ও সেটিংস পুনরায় ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান? এতে আপনার নতুন তৈরি করা খবর মুছে যাবে।')) {
      onResetDefaults();
      setFormData({ ...settings });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-editorial text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <span>ওয়েবসাইট সাধারণ সেটিংস ও পরিচয়</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            সংবাদপত্রের নাম, ট্যাগলাইন, যোগাযোগ, সম্পাদকীয় পরিচয় ও সোশ্যাল লিঙ্ক আপডেট করুন।
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>সেটিংস সংরক্ষিত হয়েছে!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Branding */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b pb-2">
            ১. পোর্টালের পরিচয় ও ব্র্যান্ডিং
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">ওয়েবসাইটের নাম (বাংলা) *</label>
              <input
                type="text"
                value={formData.siteTitle}
                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                className="w-full p-2.5 border rounded-lg font-bold text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">মূল স্লোগান (Tagline) *</label>
              <input
                type="text"
                value={formData.siteTagline}
                onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">উপশিরোনাম (Subtitle)</label>
            <input
              type="text"
              value={formData.siteSubtitle}
              onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
              className="w-full p-2 border rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">ডিফল্ট সোশ্যাল শেয়ারিং ছবি (OG Image 1200x630)</label>
            <input
              type="url"
              value={formData.defaultOgImage}
              onChange={(e) => setFormData({ ...formData, defaultOgImage: e.target.value })}
              className="w-full p-2 border rounded-lg font-mono bg-white"
            />
          </div>
        </div>

        {/* Editorial & Office */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b pb-2">
            ২. সম্পাদকীয় পরিষদ ও কার্যালয়
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">ভারপ্রাপ্ত সম্পাদক *</label>
              <input
                type="text"
                value={formData.editorName}
                onChange={(e) => setFormData({ ...formData, editorName: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">প্রকাশক বা প্রকাশনা প্রতিষ্ঠান</label>
              <input
                type="text"
                value={formData.publisherName}
                onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">যোগাযোগ ফোন / হটলাইন *</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full p-2 border rounded-lg font-sans bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">ইমেইল ঠিকানা *</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2 border rounded-lg font-sans bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">কার্যালয়ের ঠিকানা</label>
            <input
              type="text"
              value={formData.contactAddress}
              onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
              className="w-full p-2 border rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b pb-2">
            ৩. সোশ্যাল মিডিয়া প্ল্যাটফর্ম লিংক
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">ফেসবুক পেজ ইউআরএল</label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">ইউটিউব চ্যানেল ইউআরএল</label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">টুইটার / X লিংক</label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono bg-white"
              />
            </div>
          </div>
        </div>

        {/* Ticker Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b pb-2">
            ৪. ব্রেকিং নিউজ টিকার সেটিংস
          </h3>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tickerEnabled}
                onChange={(e) => setFormData({ ...formData, tickerEnabled: e.target.checked })}
                className="text-red-600 rounded"
              />
              <span className="font-bold text-gray-800">ব্রেকিং টিকার চালু রাখুন</span>
            </label>
          </div>
        </div>

        {/* Admin Password Management */}
        <div className="bg-white p-6 rounded-xl border-2 border-red-100 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>৫. অ্যাডমিন লগইন পাসওয়ার্ড (Admin Password)</span>
            </h3>
            <span className="text-[10px] bg-red-100 text-[#990000] font-bold px-2 py-0.5 rounded">
              একান্ত ব্যক্তিগত
            </span>
          </div>

          <p className="text-xs text-gray-600">
            অ্যাডমিন প্যানেলে প্রবেশের একমাত্র গোপন চাবি। কোনো ডিফল্ট পাসওয়ার্ড কাজ করবে না; এখানে সংরক্ষিত সঠিক পাসওয়ার্ডটি ছাড়া কেউ ঢুকতে পারবে না।
          </p>

          <div className="max-w-md">
            <label className="block font-bold text-gray-700 mb-1">
              আপনার অ্যাডমিন পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setFormData(prev => ({ ...prev, adminPassword: e.target.value }));
                }}
                className="w-full p-2.5 pr-10 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-red-600 focus:outline-none"
                placeholder="আপনার পাসওয়ার্ড নির্ধারণ করুন..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPass ? 'লুকান' : 'দেখুন'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              * পাসওয়ার্ড পরিবর্তন করার পর নিচে <strong>সকল সেটিংস সংরক্ষণ করুন</strong> বাটনে ক্লিক করুন।
            </p>
          </div>
        </div>

        {/* Database backend status & Firebase Realtime Rules Manager */}
        <div className={`p-5 rounded-xl border space-y-4 ${
          rtdbStatus.status === 'permission_denied'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-3">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-700" />
              <div>
                <h4 className="font-bold text-sm">Firebase Realtime Database স্ট্যাটাস</h4>
                <p className="text-[11px] text-gray-500 font-mono">
                  notex-3d16a-default-rtdb.firebaseio.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold px-2.5 py-1 rounded text-[11px] ${
                rtdbStatus.status === 'connected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : rtdbStatus.status === 'permission_denied'
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {rtdbStatus.status === 'connected' && 'সংযুক্ত ও সক্রিয়'}
                {rtdbStatus.status === 'permission_denied' && 'পারমিশন সীমাবদ্ধ (Permission Denied)'}
                {rtdbStatus.status === 'connecting' && 'পরীক্ষা করা হচ্ছে...'}
                {rtdbStatus.status === 'error' && 'ত্রুটি'}
                {rtdbStatus.status === 'idle' && 'স্ট্যান্ডবাই'}
              </span>
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="bg-[#990000] hover:bg-red-800 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'সিঙ্ক...' : 'পুনরায় সিঙ্ক'}</span>
              </button>
            </div>
          </div>

          {syncMsg && (
            <div className="p-2.5 rounded-lg bg-white border text-xs font-semibold">
              {syncMsg}
            </div>
          )}

          {/* Firebase Rules Instructions */}
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">
                Firebase Realtime Database Rules নির্দেশনা:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyRulesSnippet}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {rulesCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{rulesCopied ? 'কপি হয়েছে' : 'Rules কপি করুন'}</span>
                </button>
                <a
                  href="https://console.firebase.google.com/project/notex-3d16a/database/notex-3d16a-default-rtdb/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Firebase Rules পেজ খুলুন</span>
                </a>
              </div>
            </div>

            <p className="text-gray-600 text-[11px] leading-relaxed">
              যেকোনো পাঠক যাতে যেকোনো ডিভাইস থেকে এবং ফেসবুকে শেয়ার করা লিংকে ক্লিক করে সংবাদটি সাথে সাথে পড়তে পারেন, সেজন্য Firebase Console-এর Realtime Database এর <strong>Rules</strong> ট্যাবে গিয়ে নিচের কোডটি পেস্ট করে <strong>Publish</strong> করুন:
            </p>

            <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono rounded text-[11px] overflow-x-auto">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
            </pre>
          </div>
        </div>

        {/* Submit and reset */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-red-700 hover:text-red-900 hover:bg-red-50 px-4 py-2 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>স্যাম্পল খবরের ডিফল্ট ডেটায় রিসেট করুন</span>
          </button>

          <button
            type="submit"
            className="bg-[#990000] hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" />
            <span>সকল সেটিংস সংরক্ষণ করুন</span>
          </button>
        </div>

      </form>
    </div>
  );
};
