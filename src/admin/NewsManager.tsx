import React, { useState, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Eye, Check, X, 
  Flame, Award, Globe, Clock, AlertTriangle, FileText, Image as ImageIcon, Upload, ExternalLink, RefreshCw, Database 
} from 'lucide-react';
import { NewsArticle, Category } from '../types/news';
import { formatBengaliDate, toBengaliNumber, generateBengaliSlug } from '../utils/bengali';
import { storage } from '../services/storage';

interface NewsManagerProps {
  articles: NewsArticle[];
  categories: Category[];
  onSaveArticle: (article: Partial<NewsArticle> & { title: string; categoryId: string }) => void;
  onDeleteArticle: (id: string) => void;
  onViewArticle?: (slug: string) => void;
}

export const NewsManager: React.FC<NewsManagerProps> = ({
  articles,
  categories,
  onSaveArticle,
  onDeleteArticle,
  onViewArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Editor modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<NewsArticle> | null>(null);
  
  // Delete confirm modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Success Notification state
  const [successNotification, setSuccessNotification] = useState<{ title: string; slug: string } | null>(null);

  // Firebase force sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await storage.syncAllArticlesToFirebase();
      if (res.success) {
        setSyncMessage(`সকল (${res.count}টি) সংবাদ সফলভাবে Firebase Realtime Database-এ সিঙ্ক হয়েছে!`);
      } else {
        setSyncMessage(`ত্রুটি: ${res.error}`);
      }
    } catch (e: any) {
      setSyncMessage(`সিঙ্ক ব্যর্থ: ${e.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  // File input ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered articles
  const filtered = articles.filter(a => {
    const matchesSearch = searchTerm ? (
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.author.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    const matchesCat = selectedCategory === 'all' || a.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const PRESET_IMAGES = [
    { label: 'সাধারণ সংবাদ', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80' },
    { label: 'মির্জাপুর ও শহর', url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200&h=630&fit=crop&q=80' },
    { label: 'উন্নয়ন ও প্রকল্প', url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=1200&h=630&fit=crop&q=80' },
    { label: 'সভা ও প্রশাসন', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=630&fit=crop&q=80' },
    { label: 'খেলাধুলা', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=630&fit=crop&q=80' },
  ];

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির সাইজ ৫ মেগাবাইট বা তার কম হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      if (base64 && editingArticle) {
        setEditingArticle({ ...editingArticle, featuredImage: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreate = () => {
    setEditingArticle({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      categoryId: categories[0]?.id || 'mirzapur',
      categoryName: categories[0]?.nameBn || 'মির্জাপুর',
      author: 'নিজস্ব প্রতিবেদক, মির্জাপুর',
      reporterTitle: 'স্টাফ রিপোর্টার',
      featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80',
      imageCaption: '',
      imageCredit: 'মির্জাপুর নিউজ',
      status: 'published',
      isBreaking: false,
      isFeatured: false,
      isLeadStory: false,
      tags: ['মির্জাপুর', 'সংবাদ'],
      commentsEnabled: true,
      seoTitle: '',
      seoDescription: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle({ ...article });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title?.trim()) {
      alert('অনুগ্রহ করে সংবাদের একটি শিরোনাম লিখুন');
      return;
    }

    const title = editingArticle.title.trim();
    const catId = editingArticle.categoryId || categories[0]?.id || 'mirzapur';
    const cat = categories.find(c => c.id === catId);
    const categoryName = cat ? cat.nameBn : (editingArticle.categoryName || 'মির্জাপুর');

    // Autogenerate clean slug if missing
    const slug = editingArticle.slug?.trim() || generateBengaliSlug(title);

    // Format content paragraphs if plain text
    let content = (editingArticle.content || '').trim();
    if (content && !content.includes('<p>') && !content.includes('<div>')) {
      content = content
        .split(/\n\s*\n/)
        .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
        .join('');
    } else if (!content) {
      content = `<p>${editingArticle.excerpt || title}</p>`;
    }

    // Default high-quality image if blank
    const featuredImage = editingArticle.featuredImage?.trim() || 
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80';

    onSaveArticle({
      ...editingArticle,
      title,
      slug,
      content,
      featuredImage,
      categoryId: catId,
      categoryName,
      status: editingArticle.status || 'published',
    });

    setSuccessNotification({
      title,
      slug,
    });

    setIsModalOpen(false);
    setEditingArticle(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteArticle(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Success Notification Banner */}
      {successNotification && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                সংবাদটি সফলভাবে প্রকাশ ও সংরক্ষণ করা হয়েছে!
              </h4>
              <p className="text-xs text-emerald-700 font-editorial line-clamp-1">
                "{successNotification.title}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {onViewArticle && (
              <button
                onClick={() => onViewArticle(successNotification.slug)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4" />
                <span>সাইটে খবরটি দেখুন</span>
              </button>
            )}
            <button
              onClick={() => setSuccessNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-xl font-bold font-editorial text-gray-900">
            সংবাদ ব্যবস্থাপনা ({toBengaliNumber(articles.length)}টি নিবন্ধ)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            নতুন খবর প্রকাশ করুন, ড্রাফট সেভ করুন বা পূর্ববর্তী প্রতিবেদন সংশোধন করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="সকল সংবাদ Firebase Realtime Database-এ পুনরায় আপলোড ও সিঙ্ক করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'Firebase সিঙ্ক'}</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-[#990000] hover:bg-red-800 text-white font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন সংবাদ লিখুন</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-slate-900 text-white text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="শিরোনাম বা প্রতিবেদকের নামে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-red-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-600 bg-white"
        >
          <option value="all">সকল বিভাগ</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nameBn}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-600 bg-white"
        >
          <option value="all">সকল অবস্থা</option>
          <option value="published">প্রকাশিত</option>
          <option value="draft">খসড়া (Draft)</option>
          <option value="scheduled">শিডিউল</option>
        </select>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ছবি ও শিরোনাম</th>
                <th className="py-3 px-4">বিভাগ</th>
                <th className="py-3 px-4">লেখক</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4">ভিউ</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    কোনো সংবাদ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        {article.featuredImage ? (
                          <img 
                            src={article.featuredImage} 
                            alt="" 
                            className="w-12 h-10 object-cover rounded shrink-0 bg-gray-100" 
                          />
                        ) : (
                          <div className="w-12 h-10 bg-gray-100 rounded flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div 
                            onClick={() => onViewArticle && onViewArticle(article.slug)}
                            className={`font-bold font-editorial text-gray-900 truncate ${onViewArticle ? 'hover:text-[#990000] cursor-pointer' : ''}`}
                            title="সাইটে খবরটি দেখুন"
                          >
                            {article.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {article.isLeadStory && (
                              <span className="bg-red-900 text-white text-[9px] px-1 rounded font-bold">
                                প্রধান
                              </span>
                            )}
                            {article.isBreaking && (
                              <span className="bg-[#990000] text-white text-[9px] px-1 rounded font-bold">
                                ব্রেকিং
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-mono">
                              /{article.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-800 font-medium px-2 py-0.5 rounded text-[11px]">
                        {article.categoryName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {article.author}
                    </td>

                    <td className="py-3 px-4">
                      {article.status === 'published' ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          প্রকাশিত
                        </span>
                      ) : article.status === 'draft' ? (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          খসড়া
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          শিডিউল
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans font-semibold text-gray-600">
                      {toBengaliNumber(article.viewCount || 0)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onViewArticle && (
                          <button
                            onClick={() => onViewArticle(article.slug)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="ওয়েবসাইটে সরাসরি দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(article)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(article.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-4">
            
            {/* Modal Header */}
            <div className="bg-[#990000] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-base font-editorial">
                {editingArticle.id ? 'সংবাদ সংশোধন ও সম্পাদনা' : 'নতুন সংবাদ রচনা ও প্রকাশনা'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              
              {/* Title & Slug */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  সংবাদের শিরোনাম *
                </label>
                <input
                  type="text"
                  value={editingArticle.title || ''}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const updates: Partial<NewsArticle> = { title: newTitle };
                    // If slug is empty or was not manually customized, auto-suggest slug
                    if (!editingArticle.id && (!editingArticle.slug || editingArticle.slug === generateBengaliSlug(editingArticle.title || ''))) {
                      updates.slug = generateBengaliSlug(newTitle);
                    }
                    setEditingArticle({ ...editingArticle, ...updates });
                  }}
                  placeholder="যেমন: মির্জাপুরে নতুন ফ্লাইওভার প্রকল্পের অগ্রগতি পরিদর্শন"
                  className="w-full text-sm font-semibold p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    ইউআরএল স্লাগ (Article Slug)
                  </label>
                  <input
                    type="text"
                    value={editingArticle.slug || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    placeholder="যেমন: mirzapur-flyover-progress"
                    className="w-full p-2 border border-gray-300 rounded font-mono text-gray-700 outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block truncate">
                    স্থায়ী লিংক: #news/{editingArticle.slug || 'slug'}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    বিভাগ (Category) *
                  </label>
                  <select
                    value={editingArticle.categoryId || ''}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setEditingArticle({ 
                        ...editingArticle, 
                        categoryId: e.target.value,
                        categoryName: cat ? cat.nameBn : 'সাধারণ'
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded bg-white outline-none"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameBn} ({c.nameEn})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  placeholder="পাঠকের দৃষ্টি আকর্ষণের জন্য ১-২ বাক্যের বিবরণ..."
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  মূল সংবাদ প্রতিবেদন *
                </label>
                <textarea
                  rows={7}
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="প্রতিবেদনের বিস্তারিত বিবরণ লিখুন..."
                  className="w-full p-3 text-xs border border-gray-300 rounded outline-none leading-relaxed"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  প্যারাগ্রাফ লেখার পর Enter চাপুন। আপনি চাইলে সাধারণ টেক্সট অথবা HTML ফরম্যাট উভয়ই ব্যবহার করতে পারেন।
                </span>
              </div>

              {/* Featured Image with File Upload, Presets & Preview */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="font-bold text-gray-800 uppercase">
                    ফিচারড ইমেজ (ছবি)
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ডিভাইস থেকে ছবি আপলোড</span>
                    </button>
                  </div>
                </div>

                {/* Quick preset selector */}
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">দ্রুত ছবি নির্বাচন করুন:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditingArticle({ ...editingArticle, featuredImage: preset.url })}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                          editingArticle.featuredImage === preset.url
                            ? 'bg-red-50 border-red-500 text-[#990000] font-bold'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL input and preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={editingArticle.featuredImage || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, featuredImage: e.target.value })}
                      placeholder="ছবির লিংক (URL) বা আপলোড করা ফাইল..."
                      className="w-full p-2 border border-gray-300 rounded outline-none font-mono text-[11px] bg-white"
                    />
                  </div>
                  <div>
                    {editingArticle.featuredImage ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={editingArticle.featuredImage} 
                          alt="প্রিভিউ" 
                          className="w-16 h-10 object-cover rounded border border-gray-300 shadow-2xs"
                        />
                        <span className="text-[10px] text-emerald-600 font-medium">ছবির প্রিভিউ</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">কোনো ছবি নির্বাচিত নেই</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-gray-600 text-[11px] mb-1">
                      ছবির ক্রেডিট
                    </label>
                    <input
                      type="text"
                      value={editingArticle.imageCredit || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, imageCredit: e.target.value })}
                      placeholder="যেমন: মির্জাপুর নিউজ / নিজস্ব আলোকচিত্র"
                      className="w-full p-2 border border-gray-300 rounded outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 text-[11px] mb-1">
                      ছবির ক্যাপশন
                    </label>
                    <input
                      type="text"
                      value={editingArticle.imageCaption || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, imageCaption: e.target.value })}
                      placeholder="ছবির বর্ণনামূলক ক্যাপশন..."
                      className="w-full p-2 border border-gray-300 rounded outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    প্রতিবেদকের নাম *
                  </label>
                  <input
                    type="text"
                    value={editingArticle.author || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                    placeholder="নিজস্ব প্রতিবেদক, মির্জাপুর"
                    className="w-full p-2 border border-gray-300 rounded outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    পদবি (Reporter Title)
                  </label>
                  <input
                    type="text"
                    value={editingArticle.reporterTitle || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, reporterTitle: e.target.value })}
                    placeholder="স্টাফ রিপোর্টার"
                    className="w-full p-2 border border-gray-300 rounded outline-none"
                  />
                </div>
              </div>

              {/* Status and Flags */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্রকাশনা অবস্থা</label>
                  <select
                    value={editingArticle.status || 'published'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded bg-white outline-none"
                  >
                    <option value="published">প্রকাশিত (Published)</option>
                    <option value="draft">খসড়া (Draft)</option>
                    <option value="scheduled">শিডিউল (Scheduled)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isLeadStory"
                    checked={!!editingArticle.isLeadStory}
                    onChange={(e) => setEditingArticle({ ...editingArticle, isLeadStory: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="isLeadStory" className="font-bold text-gray-800 cursor-pointer">
                    প্রধান খবর (Lead Story)
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isBreaking"
                    checked={!!editingArticle.isBreaking}
                    onChange={(e) => setEditingArticle({ ...editingArticle, isBreaking: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="isBreaking" className="font-bold text-gray-800 cursor-pointer">
                    ব্রেকিং নিউজ (Breaking)
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={!!editingArticle.isFeatured}
                    onChange={(e) => setEditingArticle({ ...editingArticle, isFeatured: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="isFeatured" className="font-bold text-gray-800 cursor-pointer">
                    বিশেষ প্রতিবেদন
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  ট্যাগসমূহ (কমা দিয়ে পৃথক করুন)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingArticle.tags) ? editingArticle.tags.join(', ') : ''}
                  onChange={(e) => setEditingArticle({ 
                    ...editingArticle, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                  })}
                  placeholder="মির্জাপুর, টাঙ্গাইল, মহাসড়ক, উন্নয়ন"
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#990000] hover:bg-red-800 text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-sm"
                >
                  সংরক্ষণ ও প্রকাশ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-[#990000] rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-1">সংবাদটি মুছে ফেলবেন?</h4>
            <p className="text-xs text-gray-500 mb-5">
              এই পদক্ষেপটি অপরিবর্তনীয়। নিশ্চিত হয়ে থাকলে 'মুছে ফেলুন' বাটনে ক্লিক করুন।
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                না, রাখুন
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
