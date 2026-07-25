import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Building2, AlertCircle, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Level, College, ItemStatus } from '../types';
import { api } from '../services/api';

interface LevelManagerProps {
  onDataChange: () => void;
}

export const LevelManager: React.FC<LevelManagerProps> = ({ onDataChange }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const [collegeId, setCollegeId] = useState('');
  const [name, setName] = useState('');
  const [levelOrder, setLevelOrder] = useState<number>(1);
  const [status, setStatus] = useState<ItemStatus>('active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [colls, levs] = await Promise.all([
        api.getColleges(),
        api.getLevels(selectedCollegeId || undefined),
      ]);
      setColleges(colls);
      setLevels(levs);
      if (!selectedCollegeId && colls.length > 0) {
        setSelectedCollegeId(colls[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCollegeId]);

  const openCreateModal = () => {
    setEditingLevel(null);
    setCollegeId(selectedCollegeId || (colleges[0]?.id ?? ''));
    setName('');
    setLevelOrder(levels.length + 1);
    setStatus('active');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (level: Level) => {
    setEditingLevel(level);
    setCollegeId(level.collegeId);
    setName(level.name);
    setLevelOrder(level.levelOrder);
    setStatus(level.status || 'active');
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (level: Level) => {
    const newStatus: ItemStatus = level.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateLevel(level.id, { status: newStatus });
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل تغيير الحالة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId || !name.trim()) {
      setError('يرجى اختيار الكلية وكتابة اسم المستوى');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingLevel) {
        await api.updateLevel(editingLevel.id, {
          collegeId,
          name: name.trim(),
          levelOrder: Number(levelOrder),
          order: Number(levelOrder),
          status,
        });
      } else {
        await api.createLevel({
          collegeId,
          name: name.trim(),
          levelOrder: Number(levelOrder),
          status,
        });
      }

      setIsModalOpen(false);
      loadData();
      onDataChange();
    } catch (err: any) {
      setError(err.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (level: Level) => {
    if (!confirm(`هل أنت تأكد من نقل "${level.name}" للأرشيف (Soft Delete)؟`)) {
      return;
    }

    try {
      await api.deleteLevel(level.id);
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  const getCollegeName = (id: string) => {
    return colleges.find((c) => c.id === id)?.name || 'غير معروف';
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>إدارة المستويات والسنوات الدراسية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">ربط المستويات الدراسية بالكليات المعتمدة</p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={colleges.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مستوى جديد</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>فلترة حسب الكلية:</span>
          </label>
          <select
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden max-w-xs"
          >
            <option value="">جميع الكليات</option>
            {colleges.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name} ({col.code})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadData}
          title="تحديث البيانات"
          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Levels List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">جاري تحميل المستويات...</p>
        </div>
      ) : levels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">لا توجد مستويات مسجلة لهذه الكلية</p>
          <p className="text-xs text-slate-500 mt-1">اضغط على زر "إضافة مستوى جديد" لربط مستوى دراسي</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                level.status === 'inactive' ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-slate-200/80 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                      ترتيب: #{level.levelOrder}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(level)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                        level.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {level.status === 'active' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{level.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(level)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(level)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف مؤقت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{level.name}</h3>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{getCollegeName(level.collegeId)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                تاريخ التحديث: {level.updatedAt ? new Date(level.updatedAt).toLocaleDateString('ar-EG') : '-'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              {editingLevel ? 'تعديل المستوى الدراسي' : 'إضافة مستوى دراسي جديد'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تتبع لكلية *</label>
                <select
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                >
                  <option value="">اختر الكلية...</option>
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستوى الدراسي *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: المستوى الأول - السنة الإعدادية"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ترتيب العرض</label>
                  <input
                    type="number"
                    min={1}
                    value={levelOrder}
                    onChange={(e) => setLevelOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الظهور</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
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
                      <span>{editingLevel ? 'حفظ التعديلات' : 'إضافة المستوى'}</span>
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
