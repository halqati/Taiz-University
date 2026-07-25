import React from 'react';
import {
  Building2,
  Layers,
  BookOpenCheck,
  Video,
  FileText,
  Plus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { DashboardStats } from '../types';
import { AdminTab } from './Sidebar';

interface DashboardOverviewProps {
  stats: DashboardStats;
  setActiveTab: (tab: AdminTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, setActiveTab }) => {
  const cards = [
    {
      title: 'كليات',
      count: stats.collegesCount,
      icon: Building2,
      accentColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-600',
      tab: 'colleges' as AdminTab,
    },
    {
      title: 'مواد دراسية',
      count: stats.coursesCount,
      icon: BookOpenCheck,
      accentColor: 'bg-blue-500',
      badgeBg: 'bg-blue-50 text-blue-600',
      tab: 'courses' as AdminTab,
    },
    {
      title: 'محاضرات',
      count: stats.lecturesCount,
      icon: Video,
      accentColor: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-600',
      tab: 'lectures' as AdminTab,
    },
    {
      title: 'ملفات',
      count: stats.filesCount,
      icon: FileText,
      accentColor: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-600',
      tab: 'files' as AdminTab,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid (Geometric Balance Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => setActiveTab(card.tab)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${card.badgeBg}`}>
                  <div className="text-xl font-bold">{card.count}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </div>
                </div>
              </div>
              <div className={`w-1.5 h-10 ${card.accentColor} rounded-full transition-all group-hover:scale-y-110`} />
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Activity + Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & System Status Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-slate-900 font-extrabold text-sm mb-4 border-b border-slate-100 pb-3">
              إجراءات سريعة
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('courses')}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>إضافة مادة جديدة</span>
              </button>
              <button
                onClick={() => setActiveTab('lectures')}
                className="w-full py-3 px-4 rounded-lg text-xs font-bold border-2 border-emerald-500 text-emerald-600 flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>رفع محاضرة رقمية</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <h3 className="font-extrabold text-sm mb-1 text-white">حالة النظام</h3>
              <p className="text-[10px] text-slate-400 mb-4">آخر تحديث قبل لحظات</p>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-400">سعة المستودع السحابي</span>
                  <span className="text-xs font-bold text-emerald-400">35% متاح</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[65%]" />
                </div>
              </div>
              <div className="mt-6 space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center text-[11px] text-slate-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />
                  قاعدة البيانات: متصلة ومستقرة
                </div>
                <div className="flex items-center text-[11px] text-slate-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />
                  الخادم الرئيسي: يعمل بطلاقة
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Feature Overview Hero / Info */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>نظام إدارة المكتبة الجامعية الرقمية</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              التنظيم والأتمتة الهيكلية للمحتوى الأكاديمي
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              يتيح لك هذا النظام إدارة الكليات المتوفرة، تنظيم المستويات الأكاديمية لكل كليّة، وإدراج المواد الدراسية والمحاضرات المرئية/النصية المقترنة بملفات PDF والوسائط المتعددة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div
                onClick={() => setActiveTab('colleges')}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">إدارة الكليات</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => setActiveTab('levels')}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">المستويات الأكاديمية</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => setActiveTab('courses')}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <BookOpenCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">المواد الدراسية</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => setActiveTab('files')}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">المستودع السحابي</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
