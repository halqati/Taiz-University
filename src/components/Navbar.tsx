import React from 'react';
import { BookOpen, ShieldCheck, LogOut, LayoutDashboard, Eye, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeView: 'public' | 'admin';
  setActiveView: (view: 'public' | 'admin') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  setActiveView,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand Logo & Breadcrumb Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xs">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
            <span className="text-slate-900 font-extrabold text-sm sm:text-base">المكتبة الجامعية</span>
            <span className="text-slate-300">/</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100">
              {activeView === 'public' ? 'بوابة الطلاب' : 'لوحة الإدارة'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* View Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveView('public')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeView === 'public'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>تصفح الطلاب</span>
            </button>

            <button
              onClick={() => {
                if (user) {
                  setActiveView('admin');
                } else {
                  onOpenLogin();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeView === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>لوحة التحكم</span>
            </button>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-3 pr-3 border-r border-slate-200">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-500">مدير النظام</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-emerald-500 flex items-center justify-center font-black text-xs text-slate-700">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="تسجيل الخروج"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-lg transition-all shadow-xs flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>دخول المشرف</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
