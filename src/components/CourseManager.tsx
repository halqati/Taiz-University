import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  Layers,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Course, College, Level, ItemStatus } from '../types';
import { api } from '../services/api';
import { ImageUploader } from './ImageUploader';

interface CourseManagerProps {
  onDataChange: () => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ onDataChange }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [filterCollegeId, setFilterCollegeId] = useState<string>('');
  const [filterLevelId, setFilterLevelId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [formCollegeId, setFormCollegeId] = useState('');
  const [formLevelId, setFormLevelId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ItemStatus>('active');
  const [order, setOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtered levels for modal form
  const [availableFormLevels, setAvailableFormLevels] = useState<Level[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [colls, levs, crss] = await Promise.all([
        api.getColleges(),
        api.getLevels(filterCollegeId || undefined),
        api.getCourses(filterCollegeId || undefined, filterLevelId || undefined),
      ]);
      setColleges(colls);
      setLevels(levs);
      setCourses(crss);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المواد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCollegeId, filterLevelId]);

  // When formCollegeId changes in modal, load/filter corresponding levels
  useEffect(() => {
    if (formCollegeId) {
      api.getLevels(formCollegeId).then((levs) => {
        setAvailableFormLevels(levs);
        if (levs.length > 0 && (!formLevelId || !levs.some((l) => l.id === formLevelId))) {
          setFormLevelId(levs[0].id);
        }
      });
    } else {
      setAvailableFormLevels([]);
      setFormLevelId('');
    }
  }, [formCollegeId]);

  const openCreateModal = () => {
    setEditingCourse(null);
    const initialCollege = filterCollegeId || (colleges[0]?.id ?? '');
    setFormCollegeId(initialCollege);
    setName('');
    setCode('');
    setImage('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80');
    setDescription('');
    setStatus('active');
    setOrder(courses.length + 1);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (course: Course) => {
    setEditingCourse(course);
    setFormCollegeId(course.collegeId);
    setFormLevelId(course.levelId);
    setName(course.name);
    setCode(course.code || '');
    setImage(course.image);
    setDescription(course.description || '');
    setStatus(course.status || 'active');
    setOrder(course.order || 1);
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (course: Course) => {
    const newStatus: ItemStatus = course.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateCourse(course.id, { status: newStatus });
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل تغيير الحالة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCollegeId || !formLevelId || !name.trim()) {
      setError('يرجى تحديد الكلية والمستوى وكتابة اسم المادة');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, {
          collegeId: formCollegeId,
          levelId: formLevelId,
          name: name.trim(),
          code: code.trim(),
          image,
          description: description.trim(),
          status,
          order: Number(order) || 1,
        });
      } else {
        await api.createCourse({
          collegeId: formCollegeId,
          levelId: formLevelId,
          name: name.trim(),
          code: code.trim(),
          image,
          description: description.trim(),
          status,
          order: Number(order) || 1,
        });
      }

      setIsModalOpen(false);
      loadData();
      onDataChange();
    } catch (err: any) {
      setError(err.message || 'فشل عملية حفظ المادة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`هل أنت تأكد من نقل المادة "${course.name}" للأرشيف (Soft Delete)؟`)) {
      return;
    }

    try {
      await api.deleteCourse(course.id);
      loadData();
      onDataChange();
    } catch (err: any) {
      alert(err.message || 'فشل حذف المادة');
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
  );

  const getCollegeName = (id: string) => colleges.find((c) => c.id === id)?.name || 'كلية غير معروفة';
  const getLevelName = (id: string) => levels.find((l) => l.id === id)?.name || 'مستوى غير معروف';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-emerald-600" />
            <span>إدارة المواد والمقررات الدراسية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">ربط المواد بالكليات والمستويات مع رفع صور الغلاف إلى Firebase Storage</p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={colleges.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مادة جديدة</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم المادة أو الكود..."
            className="w-full pr-9 pl-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={filterCollegeId}
            onChange={(e) => {
              setFilterCollegeId(e.target.value);
              setFilterLevelId('');
            }}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
          >
            <option value="">جميع الكليات</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterLevelId}
            onChange={(e) => setFilterLevelId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
          >
            <option value="">جميع المستويات</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            title="تحديث القائمة"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Courses List Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">جاري تحميل المواد...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">لا توجد مواد دراسية مسجلة بهذه الفلاتر</p>
          <p className="text-xs text-slate-500 mt-1">يمكنك إضافة مادة جديدة واختيار الكلية والمستوى التابع لها</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all flex flex-col justify-between group ${
                course.status === 'inactive' ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-lg'
              }`}
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {course.code && (
                      <span className="bg-slate-900/80 text-emerald-400 font-extrabold text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        {course.code}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(course)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 backdrop-blur-xs ${
                        course.status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      {course.status === 'active' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{course.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </button>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-1.5 bg-white/90 text-slate-700 hover:text-emerald-700 rounded-lg shadow-md transition-colors"
                      title="تعديل المادة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="p-1.5 bg-white/90 text-slate-700 hover:text-red-600 rounded-lg shadow-md transition-colors"
                      title="حذف مؤقت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 line-clamp-1">
                    {course.name}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {course.description || 'لا يوجد وصف تفصيلي مضاف لهذه المادة الدراسية.'}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{getCollegeName(course.collegeId)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{getLevelName(course.levelId)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex justify-between">
                <span>ترتيب: #{course.order || 1}</span>
                <span>تحديث: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('ar-EG') : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              {editingCourse ? 'تعديل بيانات المادة' : 'إضافة مادة تعليمية جديدة'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* College & Level Cascading Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكلية *</label>
                  <select
                    value={formCollegeId}
                    onChange={(e) => setFormCollegeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  >
                    <option value="">اختر الكلية...</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المستوى الدراسي *</label>
                  <select
                    value={formLevelId}
                    onChange={(e) => setFormLevelId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                    disabled={!formCollegeId || availableFormLevels.length === 0}
                  >
                    {availableFormLevels.length === 0 ? (
                      <option value="">لا توجد مستويات مضافة لهذه الكلية</option>
                    ) : (
                      availableFormLevels.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المادة الدراسية *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: قواعد البيانات ونظم المعلومات"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">رمز المادة (الكود)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CS202"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الترتيب</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    min={1}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحالة</label>
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

              {/* Image Uploader with Preview */}
              <ImageUploader
                value={image}
                onChange={(newUrl) => setImage(newUrl)}
                label="صورة غلاف المادة (معاينة ورفع إلى Firebase Storage) *"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف اختياري للمادة</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل مخرجات التعلم أو وصف مفصل للمنهج الدراسي..."
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
                  disabled={saving || !formLevelId}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? (
                    'جاري الحفظ...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCourse ? 'حفظ التعديلات' : 'إضافة المادة'}</span>
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
