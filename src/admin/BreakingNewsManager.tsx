import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Zap, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import { BreakingNewsItem, NewsArticle } from '../types/news';
import { toBengaliNumber } from '../utils/bengali';

interface BreakingNewsManagerProps {
  breakingNews: BreakingNewsItem[];
  articles: NewsArticle[];
  onSaveItem: (item: Partial<BreakingNewsItem> & { title: string }) => void;
  onDeleteItem: (id: string) => void;
}

export const BreakingNewsManager: React.FC<BreakingNewsManagerProps> = ({
  breakingNews,
  articles,
  onSaveItem,
  onDeleteItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<BreakingNewsItem> | null>(null);

  const handleOpenCreate = () => {
    setEditingItem({
      title: '',
      linkArticleId: '',
      linkArticleSlug: '',
      isActive: true,
      priority: breakingNews.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BreakingNewsItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title) return;

    onSaveItem({
      ...editingItem,
      title: editingItem.title.trim(),
    });

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleToggleActive = (item: BreakingNewsItem) => {
    onSaveItem({
      ...item,
      isActive: !item.isActive,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-xl font-bold font-editorial text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#990000]" />
            <span>ব্রেকিং নিউজ ও স্ক্রোলিং শিরোনাম</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            ওয়েবসাইটের শীর্ষ লাল স্ট্রিপে চলমান তাজা খবরের শিরোনাম পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#990000] hover:bg-red-800 text-white font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ব্রেকিং শিরোনাম</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">অগ্রাধিকার</th>
              <th className="py-3 px-4">শিরোনাম</th>
              <th className="py-3 px-4">সংযুক্ত খবর</th>
              <th className="py-3 px-4">টিকারে প্রচার</th>
              <th className="py-3 px-4 text-right">কার্যক্রম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {breakingNews.sort((a, b) => a.priority - b.priority).map(item => (
              <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-gray-500">
                  #{item.priority}
                </td>
                <td className="py-3 px-4 font-bold font-editorial text-gray-900 max-w-md">
                  {item.title}
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {item.linkArticleSlug ? (
                    <span className="text-[11px] text-blue-600 underline">
                      /{item.linkArticleSlug}
                    </span>
                  ) : (
                    <span className="text-gray-400">সরাসরি লিংক নেই</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      item.isActive 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.isActive ? 'সক্রিয় (চালু)' : 'স্থগিত (বন্ধ)'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('মুছে ফেলতে চান?')) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#990000] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm font-editorial">
                {editingItem.id ? 'ব্রেকিং শিরোনাম সম্পাদনা' : 'নতুন ব্রেকিং শিরোনাম'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ব্রেকিং শিরোনাম টেক্সট *
                </label>
                <textarea
                  rows={3}
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="যেমন: মির্জাপুর ফ্লাইওভারের প্রধান স্প্যান ঢালাই সম্পন্ন..."
                  className="w-full p-2 border border-gray-300 rounded outline-none font-medium text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ক্লিক করলে যে সংবাদে নিয়ে যাবে (ঐচ্ছিক)
                </label>
                <select
                  value={editingItem.linkArticleSlug || ''}
                  onChange={(e) => {
                    const art = articles.find(a => a.slug === e.target.value);
                    setEditingItem({
                      ...editingItem,
                      linkArticleSlug: e.target.value,
                      linkArticleId: art?.id || '',
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded bg-white outline-none"
                >
                  <option value="">-- কোনো লিংক নেই --</option>
                  {articles.map(art => (
                    <option key={art.id} value={art.slug}>{art.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">অগ্রাধিকার (Priority)</label>
                  <input
                    type="number"
                    value={editingItem.priority || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2 border border-gray-300 rounded outline-none font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="bnActive"
                    checked={editingItem.isActive !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                    className="text-red-600 focus:ring-red-600 rounded"
                  />
                  <label htmlFor="bnActive" className="font-bold text-gray-700 cursor-pointer">
                    সক্রিয় রাখুন
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#990000] hover:bg-red-800 text-white font-bold rounded"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
