import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, FolderTree, AlertCircle } from 'lucide-react';
import { Category, NewsArticle } from '../types/news';
import { toBengaliNumber } from '../utils/bengali';

interface CategoryManagerProps {
  categories: Category[];
  articles: NewsArticle[];
  onSaveCategory: (cat: Partial<Category> & { nameBn: string; slug: string }) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  articles,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory({
      nameBn: '',
      nameEn: '',
      slug: '',
      description: '',
      displayOrder: categories.length + 1,
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.nameBn || !editingCategory.slug) return;

    onSaveCategory({
      ...editingCategory,
      nameBn: editingCategory.nameBn.trim(),
      slug: editingCategory.slug.trim().toLowerCase(),
    });

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (cat: Category) => {
    const linkedCount = articles.filter(a => a.categoryId === cat.id).length;
    if (linkedCount > 0) {
      setDeleteWarning(`"${cat.nameBn}" বিভাগে ${toBengaliNumber(linkedCount)}টি সংবাদ নিবন্ধ রয়েছে। মুছে ফেলার আগে অনুগ্রহ করে নিবন্ধগুলোর বিভাগ পরিবর্তন করুন।`);
      return;
    }
    if (confirm(`আপনি কি নিশ্চিতভাবে "${cat.nameBn}" বিভাগটি মুছে ফেলতে চান?`)) {
      onDeleteCategory(cat.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-xl font-bold font-editorial text-gray-900">
            বিভাগ ব্যবস্থাপনা ({toBengaliNumber(categories.length)}টি বিভাগ)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            ওয়েবসাইটের নেভিগেশন মেনু ও সংবাদের বিভাগসমূহ পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#990000] hover:bg-red-800 text-white font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন বিভাগ যোগ করুন</span>
        </button>
      </div>

      {deleteWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{deleteWarning}</span>
          </div>
          <button onClick={() => setDeleteWarning(null)} className="text-amber-800 font-bold p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">ক্রম</th>
              <th className="py-3 px-4">বিভাগের নাম (বাংলা)</th>
              <th className="py-3 px-4">ইংরেজি নাম</th>
              <th className="py-3 px-4">স্লাগ (URL)</th>
              <th className="py-3 px-4">সংবাদ সংখ্যা</th>
              <th className="py-3 px-4">দৃশ্যমানতা</th>
              <th className="py-3 px-4 text-right">কার্যক্রম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.sort((a, b) => a.displayOrder - b.displayOrder).map(cat => {
              const articleCount = articles.filter(a => a.categoryId === cat.id).length;
              return (
                <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-400">
                    {cat.displayOrder}
                  </td>
                  <td className="py-3 px-4 font-bold font-editorial text-gray-900 text-sm">
                    {cat.nameBn}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {cat.nameEn}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">
                    /category/{cat.slug}/
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-gray-700">
                    {toBengaliNumber(articleCount)}টি
                  </td>
                  <td className="py-3 px-4">
                    {cat.isVisible ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        সক্রিয়
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded text-[10px]">
                        লুকানো
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#990000] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm font-editorial">
                {editingCategory.id ? 'বিভাগ সম্পাদনা' : 'নতুন বিভাগ সংযোজন'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">বিভাগের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={editingCategory.nameBn || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nameBn: e.target.value })}
                  placeholder="যেমন: মির্জাপুর"
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ইংরেজি নাম *</label>
                <input
                  type="text"
                  value={editingCategory.nameEn || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                  placeholder="e.g. Mirzapur"
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">স্লাগ (URL Slug) *</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="mirzapur"
                  className="w-full p-2 border border-gray-300 rounded font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্রদর্শন ক্রম (Order)</label>
                  <input
                    type="number"
                    value={editingCategory.displayOrder || 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2 border border-gray-300 rounded outline-none font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="catVisible"
                    checked={editingCategory.isVisible !== false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isVisible: e.target.checked })}
                    className="text-red-600 focus:ring-red-600 rounded"
                  />
                  <label htmlFor="catVisible" className="font-bold text-gray-700 cursor-pointer">
                    মেনুতে দৃশ্যমান
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
