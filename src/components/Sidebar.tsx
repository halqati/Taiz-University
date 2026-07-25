import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Layers,
  BookOpenCheck,
  Video,
  FileText,
  Bot,
  PlusCircle,
} from 'lucide-react';

export type AdminTab = 'overview' | 'colleges' | 'levels' | 'courses' | 'lectures' | 'files' | 'telegram';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  stats: {
    collegesCount: number;
    levelsCount: number;
    coursesCount: number;
    lecturesCount: number;
    filesCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, stats }) => {
  const menuItems = [
    {
      id: 'overview' as AdminTab,
      label: 'لوحة التحكم الرئيسية',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'colleges' as AdminTab,
      label: 'إدارة الكليات',
      icon: Building2,
      badge: stats.collegesCount,
    },
    {
      id: 'levels' as AdminTab,
      label: 'المستويات الأكاديمية',
      icon: Layers,
      badge: stats.levelsCount,
    },
    {
      id: 'courses' as AdminTab,
      label: 'المواد الدراسية',
      icon: BookOpenCheck,
      badge: stats.coursesCount,
    },
    {
      id: 'lectures' as AdminTab,
      label: 'المحاضرات الرقمية',
      icon: Video,
      badge: stats.lecturesCount,
    },
    {
      id: 'files' as AdminTab,
      label: 'المستودع السحابي',
      icon: FileText,
      badge: stats.filesCount,
    },
    {
      id: 'telegram' as AdminTab,
      label: 'إعدادات بوت تليجرام',
      icon: Bot,
      badge: 'جديد',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-white rounded-2xl shadow-xl shrink-0 flex flex-col overflow-hidden border border-slate-800 self-start">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20 shrink-0">
          L
        </div>
        <div>
          <h2 className="text-sm font-extrabold leading-tight text-white">المكتبة الجامعية</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">نظام الإدارة المتكامل</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all border-r-4 ${
                isActive
                  ? 'bg-emerald-600 text-white border-white shadow-md'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Hierarchy Info Box */}
      <div className="p-4 mx-3 mb-3 bg-slate-950/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold mb-1">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>الهيكل المكتبي:</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          الكليات ← المستويات ← المواد ← المحاضرات ← الملفات
        </p>
      </div>

      {/* Footer System Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-center text-slate-500 font-medium">
        الإصدار 1.0.0 &copy; 2026 المكتبة الجامعية
      </div>
    </aside>
  );
};
