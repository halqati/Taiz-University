import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, Check, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { College, ItemStatus } from '../types';
import { api } from '../services/api';

interface CollegeManagerProps {
  onDataChange: () => void;
}

export const CollegeManager: React.FC<CollegeManagerProps> = ({ onDataChange }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ItemStatus>('active');
  const [order, setOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadColleges = async () => {
    setLoading(true);
    try {
      const data = await api.getColleges();
      setColleges(data);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الكليات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const openCreateModal = () => {
    setEditingCollege(null);
    setName('');
    setCode('');
    setDescription('');
    setStatus('active');
    setOrder(colleges.length + 1);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (college: College) => {
    setEditingCollege(college);
    setName(college.name);
    setCode(college.code);
    setDescription(college.description || '');
    setStatus(college.status || 'active');
    setOrder(college.order || 1);
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (college: College) => {
    const newStatus: ItemStatus = college.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateCollege(college.id, { status: newStatus });
      loadColleges();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل تغيير الحالة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('يرجى كتابة اسم الكلية وكود الكلية');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingCollege) {
        await api.updateCollege(editingCollege.id, {
          name: name.trim(),
          code: code.trim(),
          description: description.trim(),
          status,
          order: Number(order) || 1,
        });
      } else {
        await api.createCollege({
          name: name.trim(),
          code: code.trim(),
          description: description.trim(),
          status,
          order: Number(order) || 1,
        });
      }

      setIsModalOpen(false);
      loadColleges();
      onDataChange();
    } catch (err: any) {
      setError(err.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (college: College) => {
    if (!confirm(`هل أنت تأكد من نقل كلية "${college.name}" للأرشيف (Soft Delete)؟`)) {
      return;
    }

    try {
      await api.deleteCollege(college.id);
      loadColleges();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>إدارة الكليات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">إضافة وتعديل الكليات، الترتيب، ونطاق النشاط</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كلية جديدة</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم الكلية أو الرمز..."
            className="w-full pr-9 pl-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={loadColleges}
          title="تحديث القائمة"
          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Colleges Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">جاري تحميل الكليات من Firestore...</p>
        </div>
      ) : filteredColleges.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">لا توجد كليات مسجلة حالياً</p>
          <p className="text-xs text-slate-500 mt-1">اضغط على زر "إضافة كلية جديدة" للبدء</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColleges.map((college) => (
            <div
              key={college.id}
              className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                college.status === 'inactive' ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-slate-200/80 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-100">
                      {college.code}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(college)}
                      title={college.status === 'active' ? 'تعطيل إظهار الكلية للطلاب والبوت' : 'تفعيل الكلية'}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                        college.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      {college.status === 'active' ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>نشط</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-amber-600" />
                          <span>غير نشط</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(college)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="تعديل الكلية"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(college)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف مؤقت (Soft Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{college.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {college.description || 'لا يوجد وصف مضاف لهذا الكلية'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>ترتيب: #{college.order || 1}</span>
                <span>تحديث: {college.updatedAt ? new Date(college.updatedAt).toLocaleDateString('ar-EG') : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              {editingCollege ? 'تعديل بيانات الكلية' : 'إضافة كلية جديدة'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الكلية *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: كلية الهندسة والتكنولوجيا"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كود/رمز الكلية *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="مثال: ENG أو CSAI"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ترتيب العرض (Order)</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الظهور (Status)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="active">نشط (ظاهر للطلاب والبوت)</option>
                    <option value="inactive">غير نشط (مخفي)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف (اختياري)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للتخصصات التابعة للكلية..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? (
                    'جاري الحفظ في Firestore...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCollege ? 'حفظ التعديلات' : 'إضافة الكلية'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
