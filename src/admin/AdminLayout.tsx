import React, { useState } from 'react';
import { 
  LayoutDashboard, FileText, FolderTree, Zap, DollarSign, 
  Settings, UploadCloud, LogOut, ExternalLink, Menu, X, Shield 
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: 'overview' | 'news' | 'categories' | 'breaking' | 'ads' | 'settings' | 'deploy';
  onSelectTab: (tab: 'overview' | 'news' | 'categories' | 'breaking' | 'ads' | 'settings' | 'deploy') => void;
  adminEmail: string;
  onLogout: () => void;
  onNavigateSite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  adminEmail,
  onLogout,
  onNavigateSite,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', icon: LayoutDashboard },
    { id: 'news', label: 'সংবাদ ব্যবস্থাপনা', icon: FileText },
    { id: 'categories', label: 'বিভাগসমূহ', icon: FolderTree },
    { id: 'breaking', label: 'ব্রেকিং নিউজ টিকার', icon: Zap },
    { id: 'ads', label: 'Adsterra বিজ্ঞাপন', icon: DollarSign },
    { id: 'settings', label: 'সাইট সেটিংস', icon: Settings },
    { id: 'deploy', label: 'Netlify ডেপ্লয়মেন্ট', icon: UploadCloud },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header - Sticky so it never hides */}
      <div className="md:hidden sticky top-0 z-30 bg-[#990000] text-white p-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 rounded hover:bg-red-800"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-bold font-editorial text-lg">মির্জাপুর নিউজ এডমিন</span>
        </div>
        <button
          onClick={onNavigateSite}
          className="text-xs bg-red-950 px-2.5 py-1.5 rounded flex items-center gap-1"
        >
          <span>সাইট</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#990000] flex items-center justify-center text-white font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-bold text-white font-editorial text-base leading-none">
                  মির্জাপুর নিউজ
                </h1>
                <span className="text-[10px] text-slate-400 font-mono">এডমিন কন্ট্রোল প্যানেল</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isActive 
                      ? 'bg-[#990000] text-white shadow-xs' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-[11px] text-slate-400 truncate">
            এডমিন: <strong className="text-slate-200">{adminEmail}</strong>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onNavigateSite}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="ওয়েবসাইটে যান"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট</span>
            </button>

            <button
              onClick={onLogout}
              className="bg-red-950/80 hover:bg-red-900 text-red-200 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};
